import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  checkRateLimit,
  recordFailedAttempt,
  timingSafeCompare,
  getAdminSecret,
  getAdminEmail,
  signSessionToken,
  generateDynamicOtp,
  addAuditLog,
} from '../../../../../lib/adminSecurity';
import { sendOtpEmail } from '../../../../../lib/emailService';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [user, domain] = parts;
  const visible = user.length > 2 ? user.slice(0, 2) : user.slice(0, 1);
  return `${visible}***@${domain}`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent') || 'Unknown Agent';

  // 1. Rate Limit & Brute-Force Check
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    addAuditLog({
      event: 'LOCKOUT',
      status: 'ALERT',
      ip,
      userAgent,
      details: `Request blocked by Rate Limiter. Lockout remaining: ${rateLimit.lockoutRemainingSeconds}s`,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Too many failed attempts. Admin access is temporarily locked for your security.',
        locked: true,
        lockoutRemainingSeconds: rateLimit.lockoutRemainingSeconds || 900,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { passkey } = body;

    if (!passkey || typeof passkey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Passkey is required.' },
        { status: 400 }
      );
    }

    const cleanPasskey = passkey.trim();
    const correctSecret = getAdminSecret();

    // Constant-time comparison
    const isSecretMatch = timingSafeCompare(cleanPasskey, correctSecret);

    if (!isSecretMatch) {
      const failRecord = recordFailedAttempt(ip);
      addAuditLog({
        event: 'LOGIN_FAILED',
        status: failRecord.locked ? 'ALERT' : 'WARNING',
        ip,
        userAgent,
        details: failRecord.locked
          ? `5 consecutive failed passkeys. 15-minute brute-force lockout triggered.`
          : `Invalid passkey entered. Remaining attempts: ${failRecord.remainingAttempts}`,
      });

      return NextResponse.json(
        {
          success: false,
          error: failRecord.locked
            ? 'Account locked for 15 minutes due to multiple failed attempts.'
            : 'Access Denied: Invalid Administrative Passkey.',
          locked: failRecord.locked,
          remainingAttempts: failRecord.remainingAttempts,
          lockoutRemainingSeconds: failRecord.lockoutRemainingSeconds,
        },
        { status: 401 }
      );
    }

    // Step 1 Success: Generate session ID and 10-minute pending_pin token
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pendingSessionToken = signSessionToken({
      sessionId,
      role: 'superadmin',
      stage: 'pending_pin',
      ip,
      userAgent,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes to enter dynamic PIN
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'zap_admin_pending_token',
      value: pendingSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60, // 10 minutes
    });

    // Generate unique single-use dynamic OTP
    const adminEmail = getAdminEmail();
    const { code } = generateDynamicOtp(sessionId, adminEmail);

    // Send dynamic 2FA PIN via email
    const emailResult = await sendOtpEmail({
      to: adminEmail,
      code,
      ip,
      userAgent,
    });

    addAuditLog({
      event: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      ip,
      userAgent,
      details: 'Stage 1 Passkey verified.',
    });

    addAuditLog({
      event: 'OTP_SENT',
      status: 'SUCCESS',
      ip,
      userAgent,
      details: `Unique 2FA verification PIN dispatched to ${maskEmail(adminEmail)} (${emailResult.provider}).`,
    });

    return NextResponse.json({
      success: true,
      requiresPin: true,
      email: maskEmail(adminEmail),
      deliveryProvider: emailResult.provider,
      message: `Master passkey verified. A single-use 6-digit PIN has been sent to ${maskEmail(adminEmail)}.`,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server security error.' },
      { status: 500 }
    );
  }
}
