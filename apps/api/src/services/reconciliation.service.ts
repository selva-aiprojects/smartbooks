import { prisma } from '../lib/prisma';

export async function getBankTransactions(companyId: string) {
  return await prisma.bankTransaction.findMany({
    where: { companyId },
    orderBy: { date: 'desc' }
  });
}

export async function importBankTransactions(companyId: string, transactions: Array<{ date: string; description: string; amount: number; type: 'debit' | 'credit'; externalId?: string }>) {
  const payload = transactions.map((t) => ({
    companyId,
    date: new Date(t.date),
    description: t.description,
    amount: t.amount,
    type: t.type,
    externalId: t.externalId || null,
    matched: false
  }));

  const existingExternalIds = payload
    .map((p) => p.externalId)
    .filter(Boolean) as string[];

  const duplicates = existingExternalIds.length > 0
    ? await prisma.bankTransaction.findMany({
        where: { companyId, externalId: { in: existingExternalIds } },
        select: { externalId: true }
      })
    : [];

  const dupSet = new Set(duplicates.map((d) => d.externalId));

  const toInsert = payload.filter((p) => !(p.externalId && dupSet.has(p.externalId)));

  if (toInsert.length === 0) {
    return [];
  }

  await prisma.bankTransaction.createMany({
    data: toInsert
  });

  return await prisma.bankTransaction.findMany({
    where: {
      companyId,
      OR: toInsert.map((p) => p.externalId ? { externalId: p.externalId } : {})
    },
    orderBy: { date: 'desc' }
  });
}

export async function autoMatchBankTransactions(companyId: string) {
  const bankTxns = await prisma.bankTransaction.findMany({ where: { companyId, matched: false } });
  const journalEntries = await prisma.journalEntry.findMany({
    where: { companyId },
    include: { lines: { include: { account: true } } }
  });

  let matchedCount = 0;
  const usedEntryIds = new Set<string>();

  for (const bTxn of bankTxns) {
    const match = journalEntries.find((j) => {
      if (usedEntryIds.has(j.id)) return false;
      return j.lines.some((l) =>
        Number(l.amount) === Number(bTxn.amount) &&
        l.type === bTxn.type &&
        accountMatchesType(l.account, bTxn.type)
      );
    });

    if (match) {
      await prisma.bankTransaction.update({
        where: { id: bTxn.id },
        data: { matched: true, matchedEntryId: match.id }
      });
      usedEntryIds.add(match.id);
      matchedCount++;
    }
  }

  return { matchedCount };
}

function accountMatchesType(account: { type?: string }, direction: string) {
  if (!account?.type) return true;
  if (direction === 'credit' && ['Asset', 'Expense'].includes(account.type)) return true;
  if (direction === 'debit' && ['Liability', 'Revenue', 'Equity'].includes(account.type)) return true;
  return false;
}
