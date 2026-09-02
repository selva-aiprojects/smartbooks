import { prisma } from '../lib/prisma';

export async function categorizeTransaction(companyId: string, description: string, amount: number) {
  const descLower = description.toLowerCase();

  const accounts = await prisma.account.findMany({
    where: { companyId },
    select: { code: true, name: true }
  });

  const accountMap = new Map(accounts.map((a) => [a.code, a.name]));

  let category = '5010'; // Default General Expense
  let confidence = 0.85;

  if (descLower.includes('software') || descLower.includes('aws') || descLower.includes('google') || descLower.includes('saas')) {
    category = '5020';
    confidence = 0.95;
  } else if (descLower.includes('office') || descLower.includes('paper') || descLower.includes('supplies')) {
    category = '5030';
    confidence = 0.92;
  } else if (descLower.includes('client') || descLower.includes('sale') || descLower.includes('payment received')) {
    category = '4010';
    confidence = 0.98;
  } else if (descLower.includes('salary') || descLower.includes('payroll') || descLower.includes('wages')) {
    category = '5040';
    confidence = 0.96;
  } else if (descLower.includes('rent') || descLower.includes('lease') || descLower.includes('facility')) {
    category = '5050';
    confidence = 0.94;
  }

  const suggestedName = accountMap.get(category) || `Account ${category}`;
  const existsInChart = accountMap.has(category);

  return {
    description,
    amount,
    suggestedAccountCode: category,
    suggestedAccountName: suggestedName,
    existsInChartOfAccounts: existsInChart,
    confidence
  };
}

export async function askAccountingAI(companyId: string, query: string) {
  const queryLower = query.toLowerCase();

  const entries = await prisma.journalEntry.findMany({
    where: { companyId, status: 'Posted' },
    include: { lines: { include: { account: true } } }
  });

  let totalDebit = 0;
  let totalCredit = 0;
  const accountTotals: Record<string, number> = {};

  for (const entry of entries) {
    for (const line of entry.lines) {
      const amt = Number(line.amount) || 0;
      if (line.type === 'debit') {
        totalDebit += amt;
        accountTotals[line.account.name] = (accountTotals[line.account.name] || 0) + amt;
      } else {
        totalCredit += amt;
        accountTotals[line.account.name] = (accountTotals[line.account.name] || 0) - amt;
      }
    }
  }

  const fmt = (n: number) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  if (queryLower.includes('balance sheet') || queryLower.includes('assets')) {
    const assets = Object.entries(accountTotals)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k} ${fmt(v)}`)
      .join(', ');
    const liabilitiesEquity = Object.entries(accountTotals)
      .filter(([, v]) => v < 0)
      .map(([k, v]) => `${k} ${fmt(v)}`)
      .join(', ');
    return `Based on your posted journal entries:\nTotal Debits: ${fmt(totalDebit)}\nTotal Credits: ${fmt(totalCredit)}\nBalanced: ${Math.abs(totalDebit - totalCredit) < 0.001 ? 'Yes' : 'No'}\nAsset-side balances: ${assets || 'none'}\nLiability/Equity-side balances: ${liabilitiesEquity || 'none'}`;
  }

  if (queryLower.includes('profit') || queryLower.includes('income') || queryLower.includes('revenue') || queryLower.includes('expense')) {
    const revenue = Object.entries(accountTotals)
      .filter(([k, v]) => /revenue|sales/i.test(k) && v !== 0)
      .reduce((s, [, v]) => s + Math.abs(v), 0);
    const expenses = Object.entries(accountTotals)
      .filter(([k, v]) => /expense/i.test(k) && v !== 0)
      .reduce((s, [, v]) => s + Math.abs(v), 0);
    const net = revenue - expenses;
    return `Based on your posted journal entries:\nTotal Revenue: ${fmt(revenue)}\nTotal Expenses: ${fmt(expenses)}\nNet Profit / (Loss): ${fmt(net)}`;
  }

  if (queryLower.includes('unpaid') || queryLower.includes('due') || queryLower.includes('bills')) {
    const unpaidBills = await prisma.bill.aggregate({
      where: { companyId, status: { in: ['Unpaid', 'Overdue'] } },
      _sum: { totalAmount: true }
    });
    const pendingInvoices = await prisma.invoice.aggregate({
      where: { companyId, status: { in: ['Sent', 'Overdue'] } },
      _sum: { totalAmount: true }
    });
    return `Unpaid vendor bills: ${fmt(Number(unpaidBills._sum.totalAmount) || 0)}\nPending customer invoices: ${fmt(Number(pendingInvoices._sum.totalAmount) || 0)}\nPosted journal entries: ${entries.length}`;
  }

  return `SmartBooks AI Analysis for "${query}": Your ledger is ${Math.abs(totalDebit - totalCredit) < 0.001 ? 'in full double-entry balance' : 'out of balance'}. You have ${entries.length} posted journal entries with ${totalDebit > 0 ? fmt(totalDebit) : '0'} in total debit activity.`;
}
