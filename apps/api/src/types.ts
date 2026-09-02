export interface JournalLineCreateInput {
  accountId: string;
  amount: number;
  type: 'debit' | 'credit';
  description?: string;
}

export interface JournalEntryCreateInput {
  companyId: string;
  date?: Date | string;
  description?: string;
  status?: 'Posted' | 'Draft' | 'Void';
  createdById: string;
  lines: JournalLineCreateInput[];
}

export interface AuthenticatedUser {
  userId: string;
  companyId: string;
}
