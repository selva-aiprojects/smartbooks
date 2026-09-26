import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/server-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

const companySelect = {
  id: true,
  name: true,
  subdomain: true,
  currency: true,
  plan: true,
  contactEmail: true,
  contactPhone: true,
  seatLimit: true,
  billingCycle: true,
  subscriptionStatus: true,
  nextBillingDate: true,
  gstin: true,
  entityType: true,
  displayName: true,
  parentCompanyId: true,
  twoFactorEnabled: true,
  sessionTimeoutMinutes: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { users: true },
  },
  users: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      lastLogin: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

export async function GET(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth?.companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: auth.companyId },
      select: companySelect,
    });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth?.companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await prisma.company.update({
      where: { id: auth.companyId },
      data: {
        name: body.name,
        currency: body.currency,
        plan: body.plan,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        seatLimit: body.seatLimit,
        billingCycle: body.billingCycle,
        gstin: body.gstin,
        displayName: body.displayName,
        twoFactorEnabled: body.twoFactorEnabled,
        sessionTimeoutMinutes: body.sessionTimeoutMinutes,
      },
      select: companySelect,
    });
    return NextResponse.json({ message: 'Organization settings updated', company: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 400 });
  }
}
