import { prisma } from '../lib/prisma';

function toDateRange(from?: string | null, to?: string | null) {
  const range: { gte?: Date; lte?: Date } = {};
  if (from) range.gte = new Date(from);
  if (to) range.lte = new Date(to);
  return Object.keys(range).length > 0 ? range : undefined;
}

export async function getProfitLoss(companyId: string, from?: string | null, to?: string | null) {
  const entries = await prisma.journalEntry.findMany({
    where: { companyId, date: toDateRange(from, to) },
    include: { lines: { include: { account: true } } },
    orderBy: { date: 'asc' }
  });

  const revenueMap = new Map<string, { code: string; name: string; amount: number; lines: any[] }>();
  const expenseMap = new Map<string, { code: string; name: string; amount: number; lines: any[] }>();

  for (const entry of entries) {
    for (const line of entry.lines) {
      const type = line.account?.type;
      if (type !== 'Revenue' && type !== 'Expense') continue;
      const key = line.account.code;
      const bucket = type === 'Revenue' ? revenueMap : expenseMap;
      if (!bucket.has(key)) {
        bucket.set(key, { code: key, name: line.account.name, amount: 0, lines: [] });
      }
      const row = bucket.get(key)!;
      const amt = Number(line.amount) || 0;
      if (type === 'Revenue') {
        if (line.type === 'credit') row.amount += amt;
        else row.amount -= amt;
      } else {
        if (line.type === 'debit') row.amount += amt;
        else row.amount -= amt;
      }
      row.lines.push({
        entryId: entry.id,
        date: entry.date,
        type: line.type,
        amount: amt,
        description: line.description || entry.description
      });
    }
  }

  const revenue = Array.from(revenueMap.values()).filter((r) => Math.abs(r.amount) > 0.001).sort((a, b) => b.amount - a.amount);
  const expenses = Array.from(expenseMap.values()).filter((r) => Math.abs(r.amount) > 0.001).sort((a, b) => b.amount - a.amount);
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const grossMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    from: from || null,
    to: to || null,
    revenue,
    expenses,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    grossMargin: Math.round(grossMargin * 100) / 100
  };
}

export async function getTrialBalance(companyId: string, from?: string | null, to?: string | null) {
  const accounts = await prisma.account.findMany({ where: { companyId, active: true }, orderBy: { code: 'asc' } });
  const entries = await prisma.journalEntry.findMany({
    where: { companyId, date: toDateRange(from, to) },
    include: { lines: { include: { account: true } } }
  });

  const debitMap: Record<string, number> = {};
  const creditMap: Record<string, number> = {};

  for (const entry of entries) {
    for (const line of entry.lines) {
      const code = line.account?.code;
      if (!code) continue;
      const amt = Number(line.amount) || 0;
      if (line.type === 'debit') debitMap[code] = (debitMap[code] || 0) + amt;
      else creditMap[code] = (creditMap[code] || 0) + amt;
    }
  }

  const rows = accounts.map((a) => {
    const opening = Number(a.balance) || 0;
    const movementsDr = debitMap[a.code] || 0;
    const movementsCr = creditMap[a.code] || 0;
    const debit = movementsDr + (opening > 0 ? opening : 0);
    const credit = movementsCr + (opening < 0 ? Math.abs(opening) : 0);
    return {
      id: a.id,
      code: a.code,
      name: a.name,
      type: a.type,
      opening: opening,
      debit: Math.round(debit * 100) / 100,
      credit: Math.round(credit * 100) / 100,
      closing: Math.round((debit - credit) * 100) / 100
    };
  });

  return {
    rows,
    totalDebit: Math.round(rows.reduce((s, r) => s + r.debit, 0) * 100) / 100,
    totalCredit: Math.round(rows.reduce((s, r) => s + r.credit, 0) * 100) / 100,
    balanced: Math.abs(rows.reduce((s, r) => s + r.debit, 0) - rows.reduce((s, r) => s + r.credit, 0)) < 0.01
  };
}

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function bucketFor(daysOverdue: number) {
  if (daysOverdue <= 0) return 'Current';
  if (daysOverdue <= 30) return '1-30 Days';
  if (daysOverdue <= 60) return '31-60 Days';
  if (daysOverdue <= 90) return '61-90 Days';
  return '90+ Days';
}

const BUCKET_ORDER = ['Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days'];

function emptyBuckets() {
  const out: Record<string, { bracket: string; amount: number; count: number; items: any[] }> = {};
  for (const b of BUCKET_ORDER) out[b] = { bracket: b, amount: 0, count: 0, items: [] };
  return out;
}

export async function getAging(companyId: string) {
  const asOf = new Date();

  const invoices = await prisma.invoice.findMany({
    where: { companyId },
    include: { customer: true, payments: true }
  });
  const bills = await prisma.bill.findMany({
    where: { companyId },
    include: { vendor: true, payments: true }
  });

  const receivables = emptyBuckets();
  let totalReceivables = 0;
  for (const inv of invoices) {
    if (inv.status === 'Void') continue;
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    const outstanding = Number(inv.totalAmount) - paid;
    if (outstanding <= 0.001) continue;
    totalReceivables += outstanding;
    const daysOverdue = daysBetween(inv.dueDate, asOf);
    const bucket = receivables[bucketFor(daysOverdue)];
    bucket.items.push({
      id: inv.id,
      number: inv.number,
      name: inv.customer?.name || 'N/A',
      dueDate: inv.dueDate,
      daysOverdue,
      outstanding: Math.round(outstanding * 100) / 100
    });
    bucket.amount += outstanding;
    bucket.count += 1;
  }

  const payables = emptyBuckets();
  let totalPayables = 0;
  for (const bill of bills) {
    if (bill.status === 'Void') continue;
    const paid = bill.payments.reduce((s, p) => s + Number(p.amount), 0);
    const outstanding = Number(bill.totalAmount) - paid;
    if (outstanding <= 0.001) continue;
    totalPayables += outstanding;
    const daysOverdue = daysBetween(bill.dueDate, asOf);
    const bucket = payables[bucketFor(daysOverdue)];
    bucket.items.push({
      id: bill.id,
      number: bill.number,
      name: bill.vendor?.name || 'N/A',
      dueDate: bill.dueDate,
      daysOverdue,
      outstanding: Math.round(outstanding * 100) / 100
    });
    bucket.amount += outstanding;
    bucket.count += 1;
  }

  return {
    asOf: asOf.toISOString(),
    receivables: {
      total: Math.round(totalReceivables * 100) / 100,
      buckets: BUCKET_ORDER.map((b) => ({
        bracket: b,
        amount: Math.round(receivables[b].amount * 100) / 100,
        count: receivables[b].count,
        items: receivables[b].items
      }))
    },
    payables: {
      total: Math.round(totalPayables * 100) / 100,
      buckets: BUCKET_ORDER.map((b) => ({
        bracket: b,
        amount: Math.round(payables[b].amount * 100) / 100,
        count: payables[b].count,
        items: payables[b].items
      }))
    }
  };
}