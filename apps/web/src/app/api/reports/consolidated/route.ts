import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentCompany = await prisma.company.findUnique({
      where: { id: user.companyId },
      include: {
        childCompanies: true,
        parentCompany: true,
      },
    });

    if (!currentCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Determine the Master Holding ID
    const holdingId = currentCompany.parentCompanyId || (currentCompany.entityType === 'parent' ? currentCompany.id : currentCompany.id);

    // Fetch the Master Holding company
    const holding = await prisma.company.findUnique({
      where: { id: holdingId },
      include: { childCompanies: true },
    });

    if (!holding) {
      return NextResponse.json({ error: 'Holding company not found' }, { status: 404 });
    }

    // All entities in the consolidation (Holding + Children)
    const allEntities = [holding, ...holding.childCompanies];
    const entityIds = allEntities.map((e) => e.id);

    // Fetch financial data across all entities in parallel
    const [allAccounts, allInvoices, allBills, allJournalEntries] = await Promise.all([
      prisma.account.findMany({
        where: { companyId: { in: entityIds }, active: true },
      }),
      prisma.invoice.findMany({
        where: { companyId: { in: entityIds } },
        select: {
          id: true,
          companyId: true,
          taxableAmount: true,
          totalAmount: true,
          status: true,
        },
      }),
      prisma.bill.findMany({
        where: { companyId: { in: entityIds } },
        select: {
          id: true,
          companyId: true,
          taxableAmount: true,
          totalAmount: true,
          status: true,
        },
      }),
      prisma.journalEntry.findMany({
        where: { companyId: { in: entityIds }, status: 'Posted' },
        include: {
          lines: {
            include: { account: { select: { type: true, name: true, code: true } } },
          },
        },
      }),
    ]);

    // Compute metrics per entity
    const entityScorecards = allEntities.map((ent) => {
      const entAccounts = allAccounts.filter((a) => a.companyId === ent.id);
      const entInvoices = allInvoices.filter((i) => i.companyId === ent.id && i.status !== 'Void');
      const entBills = allBills.filter((b) => b.companyId === ent.id && b.status !== 'Void');
      const entJournals = allJournalEntries.filter((j) => j.companyId === ent.id);

      // Revenue from invoices or journal
      const invoiceRevenue = entInvoices.reduce((s, i) => s + Number(i.taxableAmount || i.totalAmount), 0);
      const grossInvoiced = entInvoices.reduce((s, i) => s + Number(i.totalAmount), 0);

      // Expenses from bills
      const billExpenses = entBills.reduce((s, b) => s + Number(b.taxableAmount || b.totalAmount), 0);

      // Journal entry P&L roll-up
      let journalRev = 0;
      let journalExp = 0;
      for (const j of entJournals) {
        for (const l of j.lines) {
          const amt = Number(l.amount) || 0;
          if (l.account?.type === 'Revenue') {
            journalRev += l.type.toLowerCase() === 'credit' ? amt : -amt;
          } else if (l.account?.type === 'Expense') {
            journalExp += l.type.toLowerCase() === 'debit' ? amt : -amt;
          }
        }
      }

      const revenue = Math.max(invoiceRevenue, journalRev);
      const expenses = Math.max(billExpenses, journalExp);
      const netProfit = revenue - expenses;
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      // Assets and Liabilities from accounts
      const assets = entAccounts
        .filter((a) => a.type === 'Asset')
        .reduce((s, a) => s + Number(a.balance), 0);
      const liabilities = entAccounts
        .filter((a) => a.type === 'Liability')
        .reduce((s, a) => s + Number(a.balance), 0);
      const equity = entAccounts
        .filter((a) => a.type === 'Equity')
        .reduce((s, a) => s + Number(a.balance), 0);

      return {
        id: ent.id,
        name: ent.name,
        displayName: ent.displayName || ent.name,
        subdomain: ent.subdomain,
        entityType: ent.entityType || 'entity',
        isHolding: ent.id === holding.id,
        gstin: ent.gstin,
        currency: ent.currency || 'INR',
        metrics: {
          revenue,
          grossInvoiced,
          expenses,
          netProfit,
          profitMargin,
          assets: Math.abs(assets),
          liabilities: Math.abs(liabilities),
          equity: Math.abs(equity),
          invoiceCount: entInvoices.length,
          billCount: entBills.length,
          accountCount: entAccounts.length,
        },
      };
    });

    // Group Consolidated Totals
    const groupRevenue = entityScorecards.reduce((s, e) => s + e.metrics.revenue, 0);
    const groupExpenses = entityScorecards.reduce((s, e) => s + e.metrics.expenses, 0);
    const groupNetProfit = groupRevenue - groupExpenses;
    const groupMargin = groupRevenue > 0 ? (groupNetProfit / groupRevenue) * 100 : 0;
    const groupAssets = entityScorecards.reduce((s, e) => s + e.metrics.assets, 0);
    const groupLiabilities = entityScorecards.reduce((s, e) => s + e.metrics.liabilities, 0);
    const groupEquity = entityScorecards.reduce((s, e) => s + e.metrics.equity, 0);

    return NextResponse.json({
      holdingCompany: {
        id: holding.id,
        name: holding.name,
        displayName: holding.displayName,
        subdomain: holding.subdomain,
        gstin: holding.gstin,
        currency: holding.currency || 'INR',
      },
      currentCompanyId: user.companyId,
      entitiesCount: allEntities.length,
      consolidated: {
        revenue: groupRevenue,
        expenses: groupExpenses,
        netProfit: groupNetProfit,
        profitMargin: groupMargin,
        assets: groupAssets,
        liabilities: groupLiabilities,
        equity: groupEquity,
      },
      entityScorecards,
    });
  } catch (error: any) {
    console.error('Fetch consolidated reports error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch consolidated reports' }, { status: 500 });
  }
}
