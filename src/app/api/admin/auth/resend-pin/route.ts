import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifySessionToken,
  getAdminEmail,
  generateDynamicOtp,
  canResendOtp,
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

  const cookieStore = await cookies();
  const pendingCookie = cookieStore.get('zap_admin_pending_token')?.value;

  if (!pendingCookie) {
    return NextResponse.json(
      {
        success: false,
        error: 'Session expired. Please re-enter master passkey.',
        requiresLogin: true,
      },
      { status: 401 }
    );
  }

  const verification = verifySessionToken(pendingCookie);
  if (!verification.valid || !verification.payload) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid session. Please re-enter master passkey.',
        requiresLogin: true,
      },
      { status: 401 }
    );
  }

  const { sessionId } = verification.payload;

  // Enforce 60s cooldown
  const resendStatus = canResendOtp(sessionId);
  if (!resendStatus.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Please wait ${resendStatus.waitSeconds} seconds before requesting a new PIN.`,
        cooldownRemainingSeconds: resendStatus.waitSeconds,
      },
      { status: 429 }
    );
  }

  const adminEmail = getAdminEmail();
  const { code } = generateDynamicOtp(sessionId, adminEmail);

  const emailResult = await sendOtpEmail({
    to: adminEmail,
    code,
    ip,
    userAgent,
  });

  addAuditLog({
    event: 'OTP_SENT',
    status: 'SUCCESS',
    ip,
    userAgent,
    details: `Fresh single-use 2FA PIN dispatched to ${maskEmail(adminEmail)} (${emailResult.provider}).`,
  });

  return NextResponse.json({
    success: true,
    email: maskEmail(adminEmail),
    deliveryProvider: emailResult.provider,
    message: `A fresh 6-digit verification code has been dispatched to ${maskEmail(adminEmail)}.`,
  });
}

