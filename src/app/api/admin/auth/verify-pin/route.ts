import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  verifySessionToken,
  signSessionToken,
  verifyDynamicOtp,
  addAuditLog,
} from '../../../../../lib/adminSecurity';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent') || 'Unknown Agent';

  // 1. Check Rate Limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
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

  const cookieStore = await cookies();
  const pendingCookie = cookieStore.get('zap_admin_pending_token')?.value;

  // Also check if existing authenticated session is just unlocking from inactivity lock
  const activeSessionCookie = cookieStore.get('zap_admin_session')?.value;
  let targetSessionId: string | null = null;

  if (pendingCookie) {
    const verification = verifySessionToken(pendingCookie);
    if (verification.valid && verification.payload) {
      targetSessionId = verification.payload.sessionId;
    }
  } else if (activeSessionCookie) {
    const activeVer = verifySessionToken(activeSessionCookie);
    if (activeVer.valid && activeVer.payload) {
      targetSessionId = activeVer.payload.sessionId;
    }
  }

  if (!targetSessionId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Security session expired or missing passkey step. Please re-authenticate.',
        requiresLogin: true,
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: '6-digit Security PIN is required.' },
        { status: 400 }
      );
    }

    const cleanPin = pin.trim();

    // Verify dynamic OTP (with master recovery PIN fallback)
    const otpVerification = verifyDynamicOtp(targetSessionId, cleanPin);

    if (!otpVerification.valid) {
      const failRecord = recordFailedAttempt(ip);
      addAuditLog({
        event: 'PIN_FAILED',
        status: failRecord.locked ? 'ALERT' : 'WARNING',
        ip,
        userAgent,
        details: failRecord.locked
          ? `Lockout triggered due to 5 failed PIN attempts.`
          : `Invalid PIN entered. Remaining attempts: ${failRecord.remainingAttempts}`,
      });

      return NextResponse.json(
        {
          success: false,
          error: failRecord.locked
            ? 'Account locked for 15 minutes due to multiple failed attempts.'
            : (otpVerification.error || 'Access Denied: Invalid 6-Digit Security PIN.'),
          locked: failRecord.locked,
          remainingAttempts: failRecord.remainingAttempts,
          lockoutRemainingSeconds: failRecord.lockoutRemainingSeconds,
        },
        { status: 401 }
      );
    }

    // Step 2 Success: Issue Full Authenticated Session Cookie
    resetRateLimit(ip);

    const fullSessionToken = signSessionToken({
      sessionId: targetSessionId,
      role: 'superadmin',
      stage: 'authenticated',
      ip,
      userAgent,
      createdAt: Date.now(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 Hours Valid
    });

    // Remove pending token and set permanent session
    cookieStore.delete('zap_admin_pending_token');
    cookieStore.set({
      name: 'zap_admin_session',
      value: fullSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    addAuditLog({
      event: 'PIN_SUCCESS',
      status: 'SUCCESS',
      ip,
      userAgent,
      details: 'Dual-factor verification successful. Single-use dynamic OTP consumed.',
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      message: 'Dual-factor authentication successful. Welcome, Executive Administrator.',
    });
  } catch (err) {
    console.error('Admin verify-pin error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server security error.' },
      { status: 500 }
    );
  }
}
