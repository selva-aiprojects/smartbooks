import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

const entityCompanySelect = {
  id: true,
  name: true,
  displayName: true,
  subdomain: true,
  entityType: true,
  parentCompanyId: true,
  currency: true,
  gstin: true,
};

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const home = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: entityCompanySelect,
    });

    if (!home) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Determine holding parent
    const parentId = home.parentCompanyId || (home.entityType === 'parent' ? home.id : null);

    let entities: any[] = [];
    if (parentId) {
      // Fetch parent holding company
      const parent = await prisma.company.findUnique({
        where: { id: parentId },
        select: entityCompanySelect,
      });

      // Fetch all child operating subsidiaries
      const children = await prisma.company.findMany({
        where: { parentCompanyId: parentId },
        select: entityCompanySelect,
        orderBy: { name: 'asc' },
      });

      const all = parent ? [parent, ...children] : [home];
      // Deduplicate by ID
      const seen = new Set();
      for (const e of all) {
        if (!seen.has(e.id)) {
          seen.add(e.id);
          entities.push({
            ...e,
            isHome: e.id === user.companyId,
          });
        }
      }
    } else {
      entities = [{ ...home, isHome: true }];
    }

    return NextResponse.json(entities);
  } catch (error: any) {
    console.error('Fetch entities error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch entities' }, { status: 500 });
  }
}
