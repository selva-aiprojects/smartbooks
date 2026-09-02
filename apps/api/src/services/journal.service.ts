import { JournalEntryCreateInput } from '../types';
import { prisma } from '../lib/prisma';

const VALID_TYPES = ['debit', 'credit'];

export async function createJournalEntry(entryData: JournalEntryCreateInput) {
  const { lines, companyId, createdById, ...rest } = entryData;

  if (!Array.isArray(lines) || lines.length < 2) {
    throw new Error('A journal entry must have at least 2 lines');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    const amount = Number(line.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Each journal line must have a positive amount');
    }
    if (!VALID_TYPES.includes(line.type)) {
      throw new Error(`Invalid journal line type: "${line.type}". Must be "debit" or "credit"`);
    }
    if (!line.accountId) {
      throw new Error('Each journal line must specify an accountId');
    }
    if (line.type === 'debit') {
      totalDebit += amount;
    } else {
      totalCredit += amount;
    }
  }

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`Journal entry is out of balance: debits ${totalDebit.toFixed(2)} != credits ${totalCredit.toFixed(2)}`);
  }

  return await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      const account = await tx.account.findFirst({
        where: { id: line.accountId, companyId }
      });
      if (!account) {
        throw new Error(`Account ${line.accountId} not found or not in this company`);
      }
    }

    return await tx.journalEntry.create({
      data: {
        companyId,
        createdById,
        date: rest.date ? new Date(rest.date) : new Date(),
        ...(rest.description !== undefined ? { description: rest.description } : {}),
        ...(rest.status ? { status: rest.status } : {}),
        lines: {
          create: lines.map((l) => ({
            accountId: l.accountId,
            amount: l.amount,
            type: l.type,
            description: l.description
          }))
        }
      },
      include: {
        lines: true
      }
    });
  });
}

export async function getJournalEntries(companyId: string) {
  return await prisma.journalEntry.findMany({
    where: { companyId },
    include: { lines: { include: { account: true } } },
    orderBy: { date: 'desc' }
  });
}

export async function getJournalEntryById(id: string) {
  return await prisma.journalEntry.findUnique({
    where: { id },
    include: { lines: { include: { account: true } } }
  });
}
