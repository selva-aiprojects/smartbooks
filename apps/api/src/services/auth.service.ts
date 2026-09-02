import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../core/config';
import { prisma } from '../lib/prisma';

const SALT_ROUNDS = 12;

export async function registerUser(
  email: string, 
  password: string, 
  companyName: string, 
  currency: string = 'INR', 
  subdomain?: string,
  plan: string = 'enterprise',
  contactEmail?: string,
  contactPhone?: string
) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const companySubdomain = subdomain || (email.split('@')[0] + '-' + Date.now());
  
  return await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        subdomain: companySubdomain,
        currency: currency || 'INR',
        plan: plan || 'enterprise',
        contactEmail: contactEmail || email,
        contactPhone: contactPhone || null,
      }
    });

    const defaultAccounts = [
      { name: 'Cash on Hand', code: '1010', type: 'Asset' },
      { name: 'Accounts Receivable', code: '1020', type: 'Asset' },
      { name: 'Accounts Payable', code: '2010', type: 'Liability' },
      { name: 'Owner Equity', code: '3010', type: 'Equity' },
      { name: 'Sales Revenue', code: '4010', type: 'Revenue' },
      { name: 'General Expense', code: '5010', type: 'Expense' }
    ];

    for (const acc of defaultAccounts) {
      await tx.account.create({
        data: {
          companyId: company.id,
          name: acc.name,
          code: acc.code,
          type: acc.type,
          balance: 0
        }
      });
    }

    return await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        companyId: company.id
      }
    });
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, companyId: user.companyId }, 
    config.jwt_secret_key,
    { expiresIn: '1d' }
  );

  return { token, user };
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({ 
    where: { id },
    select: {
      id: true,
      email: true,
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
          subdomain: true,
          currency: true,
          plan: true,
          contactEmail: true,
          contactPhone: true,
          accounts: true
        }
      }
    }
  });
}
