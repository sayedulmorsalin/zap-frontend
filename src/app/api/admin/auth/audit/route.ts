import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, getAuditLogs } from '../../../../../lib/adminSecurity';

export async function GET(req: NextRequest) {
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

  const logs = getAuditLogs();
  return NextResponse.json({
    success: true,
    logs,
  });
}

