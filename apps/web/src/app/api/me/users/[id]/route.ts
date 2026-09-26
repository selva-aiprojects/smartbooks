import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '../../../../../lib/server-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthUser(req);
  if (!auth?.companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { name, role, status } = await req.json();
    const existing = await prisma.user.findFirst({
      where: { id: params.id, companyId: auth.companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'User not found in this company' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(status !== undefined && { status }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: 'User updated successfully', user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthUser(req);
  if (!auth?.companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { id: params.id, companyId: auth.companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'User not found in this company' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'User deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 400 });
  }
}
