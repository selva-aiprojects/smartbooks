import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, companyName, currency, subdomain, plan, contactEmail, contactPhone } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const companySubdomain = subdomain || (email.split('@')[0] + '-' + Date.now());

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          subdomain: companySubdomain,
          currency: currency || 'INR',
          plan: plan || 'enterprise',
          contactEmail: contactEmail || email,
          contactPhone: contactPhone || null,
        },
      });

      const defaultAccounts = [
        { name: 'Cash on Hand', code: '1010', type: 'Asset', balance: 250000 },
        { name: 'Accounts Receivable', code: '1020', type: 'Asset', balance: 85000 },
        { name: 'Accounts Payable', code: '2010', type: 'Liability', balance: 42000 },
        { name: 'Owner Equity', code: '3010', type: 'Equity', balance: 293000 },
        { name: 'Sales Revenue', code: '4010', type: 'Revenue', balance: 350000 },
        { name: 'General Expense', code: '5010', type: 'Expense', balance: 150000 },
      ];

      for (const acc of defaultAccounts) {
        await tx.account.create({
          data: {
            companyId: company.id,
            name: acc.name,
            code: acc.code,
            type: acc.type,
            balance: acc.balance,
          },
        });
      }

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          companyId: company.id,
        },
        include: {
          company: true,
        },
      });

      return user;
    });

    return NextResponse.json({
      message: 'Tenant registered successfully',
      user: {
        id: result.id,
        email: result.email,
        companyId: result.companyId,
        company: result.company,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Register Route Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status: 400 }
    );
  }
}
