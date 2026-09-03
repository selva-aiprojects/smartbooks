import { prisma } from '../lib/prisma';

const VALID_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

export async function getAccounts(companyId: string) {
  return await prisma.account.findMany({
    where: { companyId },
    orderBy: [{ code: 'asc' }]
  });
}

export async function createAccount(data: {
  companyId: string;
  name: string;
  code: string;
  type: string;
  balance?: number;
}) {
  const { companyId, name, code, type, balance } = data;

  if (!name || !name.trim()) {
    throw new Error('Account name is required');
  }
  if (!code || !code.trim()) {
    throw new Error('Account code is required');
  }
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid account type: "${type}". Must be one of ${VALID_TYPES.join(', ')}`);
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.account.findUnique({
      where: { companyId_code: { companyId, code } }
    });
    if (existing) {
      throw new Error(`Account code "${code}" already exists for this company`);
    }

    return await tx.account.create({
      data: {
        companyId,
        name: name.trim(),
        code: code.trim(),
        type,
        balance: balance ?? 0
      }
    });
  });
}
