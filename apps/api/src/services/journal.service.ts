import { PrismaClient } from '@prisma/client';
import { JournalEntryCreateInput } from '../types';

const prisma = new PrismaClient();

export async function createJournalEntry(entryData: JournalEntryCreateInput) {
  return await prisma.journalEntry.create({
    data: {
      ...entryData,
      lines: {
        create: entryData.lines
      }
    },
    include: {
      lines: true
    }
  });
}

export async function getJournalEntries(companyId?: string) {
  return await prisma.journalEntry.findMany({
    where: companyId ? { companyId } : undefined,
    include: { lines: true },
    orderBy: { date: 'desc' }
  });
}

export async function getJournalEntryById(id: string) {
  return await prisma.journalEntry.findUnique({
    where: { id },
    include: { lines: true }
  });
}
