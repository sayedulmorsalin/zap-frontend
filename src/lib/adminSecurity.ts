import crypto from 'crypto';

export interface AdminSessionPayload {
  sessionId: string;
  role: 'superadmin';
  stage: 'pending_pin' | 'authenticated';
  ip?: string;
  userAgent?: string;
  createdAt: number;
  expiresAt: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'PIN_SUCCESS' | 'PIN_FAILED' | 'LOCKOUT' | 'LOGOUT' | 'CONSOLE_LOCKED' | 'CREDENTIALS_CHANGED';
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
  ip: string;
  userAgent?: string;
  details: string;
}

// In-memory runtime credential overrides (persists across requests during server runtime)
let runtimeAdminSecret: string | null = null;
let runtimeAdminPin: string | null = null;

export function getAdminSecret(): string {
  return (
    runtimeAdminSecret ||
    process.env.ADMIN_PANEL_SECRET ||
    process.env.ADMIN_KEY ||
    'zap@admin2026'
  );
}

export function getAdminPin(): string {
  return (
    runtimeAdminPin ||
    process.env.ADMIN_SECURITY_PIN ||
    '849201' // 6-digit default executive security PIN
  );
}

export function setRuntimeCredentials(newSecret?: string, newPin?: string) {
  if (newSecret && newSecret.trim().length >= 8) {
    runtimeAdminSecret = newSecret.trim();
  }
  if (newPin && /^\d{6}$/.test(newPin.trim())) {
    runtimeAdminPin = newPin.trim();
  }
}

// Session signing secret
const SESSION_SECRET = (
  process.env.ADMIN_SESSION_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  'zap_super_secure_admin_hmac_signing_secret_99812_do_not_leak'
);

// Constant-time string comparison to thwart timing side-channel attacks
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      // Create a dummy comparison with itself to preserve constant-time execution
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Cryptographic token creation (Base64url payload + HMAC-SHA256 signature)
export function signSessionToken(payload: AdminSessionPayload): string {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): {
  valid: boolean;
  payload?: AdminSessionPayload;
  reason?: string;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Missing token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Malformed token structure' };
  }

  const [data, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');

  if (!timingSafeCompare(signature, expectedSignature)) {
    return { valid: false, reason: 'Invalid signature' };
  }

  try {
    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf8')
    );

    const now = Date.now();
    if (payload.expiresAt && now > payload.expiresAt) {
      return { valid: false, reason: 'Session expired' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'Corrupt payload' };
  }
}

// --- Brute-Force Rate Limiting Engine ---
interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_DURATION_MS = 15 * 60 * 1000;  // 15 minutes window

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  lockoutRemainingSeconds?: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutRemainingSeconds: remainingSec,
    };
  }

  // If lockout expired or window expired, reset
  if ((record.lockedUntil && now >= record.lockedUntil) || (now - record.firstAttemptAt > WINDOW_DURATION_MS)) {
    rateLimitStore.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return { allowed: remaining > 0, remainingAttempts: remaining };
}

export function recordFailedAttempt(ip: string): {
  locked: boolean;
  remainingAttempts: number;
  lockoutRemainingSeconds?: number;
} {
  const now = Date.now();
  let record = rateLimitStore.get(ip);

  if (!record || (now - record.firstAttemptAt > WINDOW_DURATION_MS && !record.lockedUntil)) {
    record = { attempts: 1, firstAttemptAt: now, lockedUntil: null };
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    rateLimitStore.set(ip, record);
    return {
      locked: true,
      remainingAttempts: 0,
      lockoutRemainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    };
  }

  rateLimitStore.set(ip, record);
  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.attempts),
  };
}

export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

// --- In-Memory Security Audit Log ---
const auditLogs: AuditLogEntry[] = [
  {
    id: 'log-init',
    timestamp: new Date().toISOString(),
    event: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    ip: '127.0.0.1',
    userAgent: 'System Initialization',
    details: 'Security Shield Engine initialized. Multi-layer verification active.',
  },
];

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const newEntry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  auditLogs.unshift(newEntry);
  // Keep last 150 entries in memory
  if (auditLogs.length > 150) {
    auditLogs.pop();
  }
}

export function getAuditLogs(): AuditLogEntry[] {
  return [...auditLogs];
}

