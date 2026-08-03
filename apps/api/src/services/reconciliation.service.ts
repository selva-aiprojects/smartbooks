import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getBankTransactions(companyId: string) {
  return await prisma.bankTransaction.findMany({
    where: { companyId },
    orderBy: { date: 'desc' }
  });
}

export async function importBankTransactions(companyId: string, transactions: Array<{ date: string; description: string; amount: number; type: 'debit' | 'credit' }>) {
  const created = [];
  for (const t of transactions) {
    const item = await prisma.bankTransaction.create({
      data: {
        companyId,
        date: new Date(t.date),
        description: t.description,
        amount: t.amount,
        type: t.type,
        matched: false
      }
    });
    created.push(item);
  }
  return created;
}

export async function autoMatchBankTransactions(companyId: string) {
  const bankTxns = await prisma.bankTransaction.findMany({ where: { companyId, matched: false } });
  const journalEntries = await prisma.journalEntry.findMany({ where: { companyId }, include: { lines: true } });

  let matchedCount = 0;

  for (const bTxn of bankTxns) {
    // Find journal entry with matching line amount
    const match = journalEntries.find(j => 
      j.lines.some(l => Number(l.amount) === bTxn.amount && l.type === bTxn.type)
    );

    if (match) {
      await prisma.bankTransaction.update({
        where: { id: bTxn.id },
        data: { matched: true, matchedEntryId: match.id }
      });
      matchedCount++;
    }
  }

  return { matchedCount };
}
