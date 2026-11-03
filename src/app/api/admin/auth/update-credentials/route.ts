import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifySessionToken,
  timingSafeCompare,
  getAdminSecret,
  setRuntimeCredentials,
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

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('zap_admin_session')?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Session missing.' },
      { status: 401 }
    );
  }

  const verified = verifySessionToken(sessionToken);
  if (!verified.valid || verified.payload?.stage !== 'authenticated') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid or expired session.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { currentPasskey, newPasskey, newPin } = body;

    // Must verify current passkey
    if (!currentPasskey || !timingSafeCompare(currentPasskey.trim(), getAdminSecret())) {
      return NextResponse.json(
        { success: false, error: 'Verification failed: Current passkey is incorrect.' },
        { status: 403 }
      );
    }

    if (newPasskey) {
      if (newPasskey.trim().length < 8) {
        return NextResponse.json(
          { success: false, error: 'New passkey must be at least 8 characters long.' },
          { status: 400 }
        );
      }
    }

    if (newPin) {
      if (!/^\d{6}$/.test(newPin.trim())) {
        return NextResponse.json(
          { success: false, error: 'Security PIN must be exactly 6 numeric digits (0-9).' },
          { status: 400 }
        );
      }
    }

    setRuntimeCredentials(newPasskey, newPin);

    addAuditLog({
      event: 'CREDENTIALS_CHANGED',
      status: 'ALERT',
      ip,
      userAgent,
      details: `Administrator credentials updated (Passkey updated: ${Boolean(newPasskey)}, PIN updated: ${Boolean(newPin)}).`,
    });

    return NextResponse.json({
      success: true,
      message: 'Administrative security credentials updated successfully.',
    });
  } catch (err) {
    console.error('Update credentials error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error while updating credentials.' },
      { status: 500 }
    );
  }
}

