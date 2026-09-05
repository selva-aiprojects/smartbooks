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
      { name: 'ITC / Input GST', code: '1025', type: 'Asset' },
      { name: 'Accounts Payable', code: '2010', type: 'Liability' },
      { name: 'Output GST Payable', code: '2015', type: 'Liability' },
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

    const defaultTaxRates = [
      { name: 'GST Zero', rate: 0 },
      { name: 'GST 5%', rate: 5 },
      { name: 'GST 12%', rate: 12 },
      { name: 'GST 18%', rate: 18 },
      { name: 'GST 28%', rate: 28 }
    ];

    for (const taxRate of defaultTaxRates) {
      await tx.taxRate.create({
        data: {
          companyId: company.id,
          name: taxRate.name,
          rate: taxRate.rate
        }
      });
    }

    const defaultItems = [
      { name: 'Laptop (Core i7)', sku: 'ITM-1001', category: 'Hardware', hsnCode: '84713000', unit: 'Nos', rate: 65000, gstRate: 18, stock: 25, location: 'Main Store' },
      { name: 'Desktop Computer', sku: 'ITM-1002', category: 'Hardware', hsnCode: '84715000', unit: 'Nos', rate: 32000, gstRate: 18, stock: 12, location: 'Main Store' },
      { name: 'Wireless Mouse', sku: 'ITM-1003', category: 'Accessories', hsnCode: '84716000', unit: 'Nos', rate: 850, gstRate: 18, stock: 150, location: 'Annex Store' },
      { name: 'US Keyboard', sku: 'ITM-1004', category: 'Accessories', hsnCode: '84716000', unit: 'Nos', rate: 950, gstRate: 18, stock: 80, location: 'Annex Store' },
      { name: 'A4 Copy Paper (500 Sheets)', sku: 'ITM-1005', category: 'Consumables', hsnCode: '48025600', unit: 'Ream', rate: 280, gstRate: 5, stock: 400, location: 'Stationery Store' },
      { name: 'Business Accounting Services', sku: 'SRV-2001', category: 'Software & Licensing', hsnCode: '998313', unit: 'Month', rate: 15000, gstRate: 18, stock: 0, location: 'Services' },
      { name: 'Cloud Infrastructure Subscription', sku: 'SRV-2002', category: 'Software & Licensing', hsnCode: '998311', unit: 'Month', rate: 1800, gstRate: 18, stock: 0, location: 'Services' }
    ];

    for (const item of defaultItems) {
      await tx.item.create({
        data: { ...item, companyId: company.id }
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
