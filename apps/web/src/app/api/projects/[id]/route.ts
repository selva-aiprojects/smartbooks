import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../../lib/server-auth';
import { logAuditEvent } from '../../../../lib/server-audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const project = await prisma.project.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        customer: true,
        invoices: {
          include: {
            items: true,
            payments: true,
          },
          orderBy: { issueDate: 'desc' },
        },
        bills: {
          include: {
            vendor: true,
            items: true,
            payments: true,
          },
          orderBy: { billDate: 'desc' },
        },
        journalLines: {
          include: {
            account: true,
            entry: true,
          },
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Detailed P&L calculation
    const validInvoices = project.invoices.filter((i) => i.status !== 'Void');
    const totalTaxableRevenue = validInvoices.reduce((s, i) => s + Number(i.taxableAmount), 0);
    const totalGstCollected = validInvoices.reduce((s, i) => s + Number(i.gstAmount), 0);
    const totalGrossRevenue = validInvoices.reduce((s, i) => s + Number(i.totalAmount), 0);
    const collectedRevenue = validInvoices.reduce(
      (s, i) => s + i.payments.reduce((ps, p) => ps + Number(p.amount), 0),
      0
    );
    const outstandingReceivables = totalGrossRevenue - collectedRevenue;

    const validBills = project.bills.filter((b) => b.status !== 'Void');
    const totalTaxableExpenses = validBills.reduce((s, b) => s + Number(b.taxableAmount), 0);
    const totalItcClaimed = validBills.reduce((s, b) => s + Number(b.gstAmount), 0);
    const totalGrossExpenses = validBills.reduce((s, b) => s + Number(b.totalAmount), 0);
    const paidExpenses = validBills.reduce(
      (s, b) => s + b.payments.reduce((ps, p) => ps + Number(p.amount), 0),
      0
    );
    const outstandingPayables = totalGrossExpenses - paidExpenses;

    // Expenses breakdown by category
    const expensesByCategory: Record<string, number> = {};
    for (const b of validBills) {
      for (const item of b.items) {
        const cat = item.category || 'Direct Materials / Services';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(item.amount);
      }
    }

    // Journal lines direct overhead / cost adjustments
    const journalDebits = project.journalLines
      .filter((jl) => jl.type === 'debit')
      .reduce((s, jl) => s + Number(jl.amount), 0);
    const journalCredits = project.journalLines
      .filter((jl) => jl.type === 'credit')
      .reduce((s, jl) => s + Number(jl.amount), 0);
    const netJournalAdjustment = journalDebits - journalCredits;

    const totalOperatingCost = totalTaxableExpenses + Math.max(0, netJournalAdjustment);
    const netProfit = totalTaxableRevenue - totalOperatingCost;
    const profitMargin = totalTaxableRevenue > 0 ? (netProfit / totalTaxableRevenue) * 100 : 0;

    const budget = Number(project.budget) || 0;
    const budgetUtilization = budget > 0 ? (totalOperatingCost / budget) * 100 : 0;
    const budgetVariance = budget - totalOperatingCost;

    return NextResponse.json({
      project: {
        id: project.id,
        code: project.code,
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        budget,
        status: project.status,
        customer: project.customer,
      },
      pnl: {
        revenue: {
          taxableRevenue: totalTaxableRevenue,
          gstCollected: totalGstCollected,
          grossRevenue: totalGrossRevenue,
          collectedRevenue,
          outstandingReceivables,
          invoices: validInvoices.map((inv) => ({
            id: inv.id,
            number: inv.number,
            date: inv.issueDate,
            taxable: Number(inv.taxableAmount),
            gst: Number(inv.gstAmount),
            total: Number(inv.totalAmount),
            status: inv.status,
            customerName: project.customer?.name || 'Customer',
          })),
        },
        expenses: {
          taxableExpenses: totalTaxableExpenses,
          itcClaimed: totalItcClaimed,
          grossExpenses: totalGrossExpenses,
          paidExpenses,
          outstandingPayables,
          journalAdjustment: netJournalAdjustment,
          totalOperatingCost,
          byCategory: expensesByCategory,
          bills: validBills.map((b) => ({
            id: b.id,
            number: b.number,
            date: b.billDate,
            taxable: Number(b.taxableAmount),
            gst: Number(b.gstAmount),
            total: Number(b.totalAmount),
            status: b.status,
            vendorName: b.vendor.name,
            items: b.items.map((it) => ({
              description: it.description,
              amount: Number(it.amount),
              category: it.category,
            })),
          })),
        },
        profitability: {
          netProfit,
          profitMargin,
          budget,
          budgetUtilization,
          budgetVariance,
          isProfitable: netProfit >= 0,
          isWithinBudget: budget > 0 ? totalOperatingCost <= budget : true,
        },
      },
    });
  } catch (error: any) {
    console.error('Fetch project detail error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch project detail' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, code, description, startDate, endDate, budget, customerId, status } = body;

    const existing = await prisma.project.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(code ? { code: code.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(budget !== undefined ? { budget: Number(budget) || 0 } : {}),
        ...(customerId !== undefined ? { customerId: customerId || null } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        customer: true,
      },
    });

    await logAuditEvent({
      companyId: user.companyId,
      userId: user.userId,
      action: 'UPDATE',
      entityType: 'PROJECT',
      entityId: updated.id,
      entityRef: updated.code,
      details: `Updated Project ${updated.name} (${updated.code}) - Status: ${updated.status}`,
      oldValues: { name: existing.name, status: existing.status, budget: existing.budget },
      newValues: { name: updated.name, status: updated.status, budget: updated.budget },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.project.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        invoices: { select: { id: true } },
        bills: { select: { id: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // If transactions exist, archive rather than hard delete to preserve audit trail
    if (existing.invoices.length > 0 || existing.bills.length > 0) {
      const archived = await prisma.project.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });

      await logAuditEvent({
        companyId: user.companyId,
        userId: user.userId,
        action: 'STATUS_CHANGE',
        entityType: 'PROJECT',
        entityId: id,
        entityRef: existing.code,
        details: `Archived Project ${existing.name} (has ${existing.invoices.length} invoices, ${existing.bills.length} bills)`,
      });

      return NextResponse.json({
        message: 'Project has linked transactions, so it has been archived.',
        project: archived,
      });
    }

    await prisma.project.delete({ where: { id } });

    await logAuditEvent({
      companyId: user.companyId,
      userId: user.userId,
      action: 'DELETE',
      entityType: 'PROJECT',
      entityId: id,
      entityRef: existing.code,
      details: `Deleted Project ${existing.name} (${existing.code})`,
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 500 });
  }
}
