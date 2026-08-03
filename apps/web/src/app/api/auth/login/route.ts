import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    let targetUser = user;

    if (!targetUser) {
      // Auto-provision tenant & user on-the-fly for seamless login
      try {
        const companyName = `${email.split('@')[0].toUpperCase()} Organization`;
        const companySubdomain = `${email.split('@')[0].toLowerCase()}-${Date.now()}`;
        const hashedPassword = await bcrypt.hash(password, 12);

        const company = await prisma.company.create({
          data: {
            name: companyName,
            subdomain: companySubdomain,
            currency: 'INR',
            plan: 'enterprise',
            contactEmail: email,
          },
        });

        targetUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            companyId: company.id,
          },
          include: {
            company: true,
          },
        });
      } catch (provisionErr) {
        console.error('Auto-provisioning error during login:', provisionErr);
        return NextResponse.json({ error: 'User not found and provisioning failed' }, { status: 401 });
      }
    } else {
      const valid = await bcrypt.compare(password, targetUser.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    const secret = process.env.JWT_SECRET || 'smartbooks_enterprise_secret_key_2026';
    const token = jwt.sign(
      { userId: targetUser.id, companyId: targetUser.companyId },
      secret,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        companyId: targetUser.companyId,
        company: targetUser.company,
      },
    });
  } catch (error) {
    console.error('Login Route Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Server error' },
      { status: 500 }
    );
  }
}
