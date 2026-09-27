import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../../lib/server-auth';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { companyId: targetCompanyId } = body;

    if (!targetCompanyId) {
      return NextResponse.json({ error: 'Target companyId is required' }, { status: 400 });
    }

    const homeCompany = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { id: true, entityType: true, parentCompanyId: true },
    });

    if (!homeCompany) {
      return NextResponse.json({ error: 'Current company not found' }, { status: 404 });
    }

    const targetCompany = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      select: { id: true, name: true, displayName: true, subdomain: true, gstin: true, entityType: true, parentCompanyId: true },
    });

    if (!targetCompany) {
      return NextResponse.json({ error: 'Target entity not found' }, { status: 404 });
    }

    // Determine holding ID
    const holdingId = homeCompany.parentCompanyId || (homeCompany.entityType === 'parent' ? homeCompany.id : null);

    // Permission check: allow if same company, or target is child of home, or target is parent of home, or both share same parent
    const isAllowed =
      targetCompany.id === homeCompany.id ||
      targetCompany.parentCompanyId === homeCompany.id ||
      targetCompany.id === homeCompany.parentCompanyId ||
      (holdingId && (targetCompany.id === holdingId || targetCompany.parentCompanyId === holdingId));

    if (!isAllowed) {
      return NextResponse.json({ error: 'Not authorized to access this entity' }, { status: 403 });
    }

    const secret = process.env.JWT_SECRET || 'smartbooks_enterprise_secret_key_2026';
    const newToken = jwt.sign(
      { userId: user.userId, companyId: targetCompany.id },
      secret,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      token: newToken,
      companyId: targetCompany.id,
      company: targetCompany,
    });
  } catch (error: any) {
    console.error('Switch entity error:', error);
    return NextResponse.json({ error: error.message || 'Failed to switch entity' }, { status: 500 });
  }
}
