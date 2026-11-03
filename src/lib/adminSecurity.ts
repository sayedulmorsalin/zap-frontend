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
  event: 
    | 'LOGIN_SUCCESS' 
    | 'LOGIN_FAILED' 
    | 'PIN_SUCCESS' 
    | 'PIN_FAILED' 
    | 'OTP_SENT'
    | 'LOCKOUT' 
    | 'LOGOUT' 
    | 'CONSOLE_LOCKED' 
    | 'CREDENTIALS_CHANGED';
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
  ip: string;
  userAgent?: string;
  details: string;
}

// In-memory runtime credential overrides
let runtimeAdminSecret: string | null = null;
let runtimeAdminPin: string | null = null;
let runtimeAdminEmail: string | null = null;

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
    '849201' // 6-digit default emergency master PIN
  );
}

export function getAdminEmail(): string {
  return (
    runtimeAdminEmail ||
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    'admin@zapbd.com'
  );
}

export function setRuntimeCredentials(newSecret?: string, newPin?: string, newEmail?: string) {
  if (newSecret && newSecret.trim().length >= 8) {
    runtimeAdminSecret = newSecret.trim();
  }
  if (newPin && /^\d{6}$/.test(newPin.trim())) {
    runtimeAdminPin = newPin.trim();
  }
  if (newEmail && newEmail.includes('@')) {
    runtimeAdminEmail = newEmail.trim().toLowerCase();
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

// --- Dynamic Email OTP Management ---
interface DynamicOtpRecord {
  sessionId: string;
  code: string;
  email: string;
  expiresAt: number;
  resendAvailableAt: number;
}

const otpStore = new Map<string, DynamicOtpRecord>();

/**
 * Generates a unique, cryptographically random 6-digit OTP for the given session.
 */
export function generateDynamicOtp(sessionId: string, email: string): {
  code: string;
  expiresAt: number;
  resendAvailableAt: number;
} {
  // Cryptographically random 6 digits: 100000 - 999999
  const code = crypto.randomInt(100000, 1000000).toString();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes
  const resendAvailableAt = now + 60 * 1000; // 60s cooldown

  otpStore.set(sessionId, {
    sessionId,
    code,
    email,
    expiresAt,
    resendAvailableAt,
  });

  return { code, expiresAt, resendAvailableAt };
}

export function canResendOtp(sessionId: string): { allowed: boolean; waitSeconds?: number } {
  const record = otpStore.get(sessionId);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (now < record.resendAvailableAt) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((record.resendAvailableAt - now) / 1000),
    };
  }
  return { allowed: true };
}

/**
 * Verifies a dynamic OTP (or emergency master PIN).
 * On successful match, immediately deletes/consumes the single-use OTP.
 */
export function verifyDynamicOtp(sessionId: string, inputCode: string): {
  valid: boolean;
  error?: string;
} {
  const cleanInput = inputCode.trim();
  const now = Date.now();

  // 1. Check dynamic OTP store
  const record = otpStore.get(sessionId);
  if (record) {
    if (now > record.expiresAt) {
      otpStore.delete(sessionId);
      return { valid: false, error: 'Verification PIN has expired. Please request a new code.' };
    }

    if (timingSafeCompare(cleanInput, record.code)) {
      // Single-use: immediately consume and invalidate
      otpStore.delete(sessionId);
      return { valid: true };
    }
  }

  // 2. Emergency Master Recovery PIN fallback (in case email delivery is delayed)
  const masterPin = getAdminPin();
  if (timingSafeCompare(cleanInput, masterPin)) {
    if (record) otpStore.delete(sessionId);
    return { valid: true };
  }

  return { valid: false, error: 'Invalid 6-digit verification code.' };
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

  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutRemainingSeconds: remainingSec,
    };
  }

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
    details: 'Security Shield Engine active. Dynamic Email 2FA PIN dispatch enabled.',
  },
];

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const newEntry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  auditLogs.unshift(newEntry);
  if (auditLogs.length > 150) {
    auditLogs.pop();
  }
}

export function getAuditLogs(): AuditLogEntry[] {
  return [...auditLogs];
}
