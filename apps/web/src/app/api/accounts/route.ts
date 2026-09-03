import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const VALID_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

function getCompanyId(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || 'smartbooks_enterprise_secret_key_2026';
    const decoded = jwt.verify(token, secret) as { companyId: string };
    return decoded?.companyId || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  try {
    const accounts = await prisma.account.findMany({
      where: { companyId },
      orderBy: [{ code: 'asc' }],
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { name, code, type, balance } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Account name is required' }, { status: 400 });
    }
    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Account code is required' }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid account type: "${type}". Must be one of ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await prisma.account.findUnique({
      where: { companyId_code: { companyId, code: code.trim() } },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Account code "${code.trim()}" already exists for this company` },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        companyId,
        name: name.trim(),
        code: code.trim(),
        type,
        balance: balance ?? 0,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Server error' }, { status: 500 });
  }
}
