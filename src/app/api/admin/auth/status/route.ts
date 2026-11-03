import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, checkRateLimit } from '../../../../../lib/adminSecurity';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('zap_admin_session')?.value;

  if (sessionToken) {
    const verified = verifySessionToken(sessionToken);
    if (verified.valid && verified.payload && verified.payload.stage === 'authenticated') {
      const remainingMs = verified.payload.expiresAt - Date.now();
      return NextResponse.json({
        authenticated: true,
        role: verified.payload.role,
        sessionId: verified.payload.sessionId,
        expiresInSeconds: Math.max(0, Math.floor(remainingMs / 1000)),
        locked: false,
      });
    }
  }

  // Check if pending PIN token is active
  const pendingToken = cookieStore.get('zap_admin_pending_token')?.value;
  if (pendingToken) {
    const pendingVerified = verifySessionToken(pendingToken);
    if (pendingVerified.valid && pendingVerified.payload?.stage === 'pending_pin') {
      return NextResponse.json({
        authenticated: false,
        requiresPin: true,
        locked: !rateLimit.allowed,
        lockoutRemainingSeconds: rateLimit.lockoutRemainingSeconds,
      });
    }
  }

  return NextResponse.json({
    authenticated: false,
    requiresPin: false,
    locked: !rateLimit.allowed,
    lockoutRemainingSeconds: rateLimit.lockoutRemainingSeconds,
  });
}

