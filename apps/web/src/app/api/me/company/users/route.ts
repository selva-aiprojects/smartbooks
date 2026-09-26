import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getAuthUser } from '@/lib/server-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  lastLogin: true,
  createdAt: true,
};

export async function GET(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth?.companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { companyId: auth.companyId },
      select: userSelect,
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth?.companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { name, email, role, password } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({ where: { id: auth.companyId } });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const count = await prisma.user.count({ where: { companyId: auth.companyId } });
    if (count >= (company.seatLimit || 15)) {
      return NextResponse.json(
        { error: `Seat limit reached (${company.seatLimit}). Upgrade your plan to add more users.` },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password || 'Welcome@2026', 12);
    const user = await prisma.user.create({
      data: {
        companyId: auth.companyId,
        email: cleanEmail,
        name: name?.trim() || null,
        role: role || 'Accountant',
        password: hashedPassword,
        status: 'Active',
      },
      select: userSelect,
    });

    return NextResponse.json({ message: 'User invited successfully', user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
