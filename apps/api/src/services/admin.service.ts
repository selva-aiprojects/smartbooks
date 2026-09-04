import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const SALT_ROUNDS = 12;

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

export async function listCompanies() {
  return prisma.company.findMany({
    select: companySelect,
    orderBy: { createdAt: 'asc' },
  });
}

export async function getCompany(id: string) {
  return prisma.company.findUnique({
    where: { id },
    select: companySelect,
  });
}

export interface CreateCompanyInput {
  name: string;
  adminName?: string;
  adminEmail: string;
  adminPhone?: string;
  password?: string;
  currency?: string;
  subdomain?: string;
  plan?: string;
  seatLimit?: number;
  gstin?: string;
}

export async function createCompany(input: CreateCompanyInput) {
  const hashedPassword = await bcrypt.hash(input.password || 'Welcome@2026', SALT_ROUNDS);
  const companySubdomain =
    input.subdomain ||
    (input.name || input.adminEmail).toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

  const defaultAccounts = [
    { name: 'Cash on Hand', code: '1010', type: 'Asset', balance: 0 },
    { name: 'Accounts Receivable', code: '1020', type: 'Asset', balance: 0 },
    { name: 'Accounts Payable', code: '2010', type: 'Liability', balance: 0 },
    { name: 'Owner Equity', code: '3010', type: 'Equity', balance: 0 },
    { name: 'Sales Revenue', code: '4010', type: 'Revenue', balance: 0 },
    { name: 'General Expense', code: '5010', type: 'Expense', balance: 0 },
  ];

  return prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.name,
        subdomain: companySubdomain,
        currency: input.currency || 'INR',
        plan: input.plan || 'enterprise',
        contactEmail: input.adminEmail,
        contactPhone: input.adminPhone || null,
        seatLimit: input.seatLimit || 15,
        gstin: input.gstin || null,
      },
    });

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

    await tx.user.create({
      data: {
        email: input.adminEmail,
        password: hashedPassword,
        name: input.adminName || null,
        role: 'Owner',
        status: 'Active',
        companyId: company.id,
      },
    });

    return getCompany(company.id);
  });
}

export interface UpdateCompanyInput {
  name?: string;
  currency?: string;
  plan?: string;
  seatLimit?: number;
  billingCycle?: string;
  subscriptionStatus?: string;
  nextBillingDate?: string;
  gstin?: string;
  contactEmail?: string;
  contactPhone?: string;
  displayName?: string;
  twoFactorEnabled?: boolean;
  sessionTimeoutMinutes?: number;
}

export async function updateCompany(id: string, data: UpdateCompanyInput) {
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) throw new Error('Company not found');

  await prisma.company.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.currency !== undefined ? { currency: data.currency } : {}),
      ...(data.plan !== undefined ? { plan: data.plan } : {}),
      ...(data.seatLimit !== undefined ? { seatLimit: Number(data.seatLimit) } : {}),
      ...(data.billingCycle !== undefined ? { billingCycle: data.billingCycle } : {}),
      ...(data.subscriptionStatus !== undefined ? { subscriptionStatus: data.subscriptionStatus } : {}),
      ...(data.nextBillingDate !== undefined ? { nextBillingDate: data.nextBillingDate } : {}),
      ...(data.gstin !== undefined ? { gstin: data.gstin } : {}),
      ...(data.contactEmail !== undefined ? { contactEmail: data.contactEmail } : {}),
      ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone } : {}),
      ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
      ...(data.twoFactorEnabled !== undefined ? { twoFactorEnabled: Boolean(data.twoFactorEnabled) } : {}),
      ...(data.sessionTimeoutMinutes !== undefined ? { sessionTimeoutMinutes: Number(data.sessionTimeoutMinutes) } : {}),
    },
  });

  return getCompany(id);
}

export async function deleteCompany(id: string) {
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) throw new Error('Company not found');
  await prisma.journalLine.deleteMany({ where: { entry: { companyId: id } } });
  await prisma.journalEntry.deleteMany({ where: { companyId: id } });
  await prisma.invoiceItem.deleteMany({ where: { invoice: { companyId: id } } });
  await prisma.invoice.deleteMany({ where: { companyId: id } });
  await prisma.customer.deleteMany({ where: { companyId: id } });
  await prisma.billItem.deleteMany({ where: { bill: { companyId: id } } });
  await prisma.bill.deleteMany({ where: { companyId: id } });
  await prisma.vendor.deleteMany({ where: { companyId: id } });
  await prisma.bankTransaction.deleteMany({ where: { companyId: id } });
  await prisma.account.deleteMany({ where: { companyId: id } });
  await prisma.user.deleteMany({ where: { companyId: id } });
  await prisma.company.delete({ where: { id } });
  return { ok: true };
}

export interface AddUserInput {
  name?: string;
  email: string;
  role?: string;
  password?: string;
}

export async function addUser(companyId: string, input: AddUserInput) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error('Company not found');
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error('User with this email already exists');

  const hashedPassword = await bcrypt.hash(input.password || 'Welcome@2026', SALT_ROUNDS);
  return prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name || null,
      role: input.role || 'Tenant Admin',
      status: 'Active',
      companyId,
    },
  });
}

export interface UpdateUserInput {
  name?: string;
  role?: string;
  status?: string;
}

export async function updateUser(id: string, data: UpdateUserInput) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  await prisma.user.delete({ where: { id } });
  return { ok: true };
}

export async function resetUserPassword(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  const token = crypto.randomBytes(24).toString('hex');
  await prisma.user.update({
    where: { id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  return {
    email: user.email,
    resetToken: token,
    expiresInHours: 24,
  };
}
