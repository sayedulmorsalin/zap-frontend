import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { addAuditLog } from '../../../../../lib/adminSecurity';

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
  cookieStore.delete('zap_admin_session');
  cookieStore.delete('zap_admin_pending_token');

  addAuditLog({
    event: 'LOGOUT',
    status: 'SUCCESS',
    ip,
    userAgent,
    details: 'Executive admin session closed and cookie revoked.',
  });

  return NextResponse.json({
    success: true,
    message: 'Admin console locked and session revoked.',
  });
}

