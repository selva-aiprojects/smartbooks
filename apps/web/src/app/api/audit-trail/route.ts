import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '../../../lib/server-auth';
import { fetchAuditLogs, logAuditEvent } from '../../../lib/server-audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType') || undefined;
    const action = searchParams.get('action') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 100;

    const logs = await fetchAuditLogs(user.companyId, { entityType, action, search, limit });
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Audit trail GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, entityType, entityId, entityRef, details, oldValues, newValues } = body;

    if (!action || !entityType || !entityId) {
      return NextResponse.json({ error: 'action, entityType, and entityId are required' }, { status: 400 });
    }

    const log = await logAuditEvent({
      companyId: user.companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action,
      entityType,
      entityId,
      entityRef,
      details,
      oldValues,
      newValues,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'serverless',
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Audit trail POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record audit log' }, { status: 500 });
  }
}
