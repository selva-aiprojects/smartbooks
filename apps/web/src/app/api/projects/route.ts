import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../lib/server-auth';
import { logAuditEvent } from '../../../lib/server-audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status'); // 'ACTIVE', 'ALL', 'COMPLETED', etc.

    const whereClause: any = { companyId: user.companyId };
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        invoices: {
          select: {
            id: true,
            number: true,
            taxableAmount: true,
            totalAmount: true,
            status: true,
            issueDate: true,
          },
        },
        bills: {
          select: {
            id: true,
            number: true,
            taxableAmount: true,
            totalAmount: true,
            status: true,
            billDate: true,
            vendor: { select: { name: true } },
          },
        },
        journalLines: {
          select: {
            id: true,
            amount: true,
            type: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = projects.map((p) => {
      // Invoiced Revenue (ex-GST taxable or total)
      const validInvoices = p.invoices.filter((i) => i.status !== 'Void');
      const totalRevenue = validInvoices.reduce((sum, i) => sum + Number(i.taxableAmount || i.totalAmount), 0);
      const grossBilled = validInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
      const paidRevenue = validInvoices
        .filter((i) => i.status === 'Paid')
        .reduce((sum, i) => sum + Number(i.totalAmount), 0);

      // Direct Costs & Expenses from Vendor Bills
      const validBills = p.bills.filter((b) => b.status !== 'Void');
      const billExpenses = validBills.reduce((sum, b) => sum + Number(b.taxableAmount || b.totalAmount), 0);

      // Direct Journal Line adjustments (debits to expense accounts)
      const journalDebits = p.journalLines
        .filter((jl) => jl.type === 'debit')
        .reduce((sum, jl) => sum + Number(jl.amount), 0);
      const journalCredits = p.journalLines
        .filter((jl) => jl.type === 'credit')
        .reduce((sum, jl) => sum + Number(jl.amount), 0);
      const journalExpenses = journalDebits - journalCredits;

      const totalExpenses = billExpenses + Math.max(0, journalExpenses);
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      const budget = Number(p.budget) || 0;
      const budgetUtilization = budget > 0 ? (totalExpenses / budget) * 100 : 0;
      const budgetVariance = budget - totalExpenses; // Positive = Under budget, Negative = Over budget

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        startDate: p.startDate,
        endDate: p.endDate,
        budget,
        status: p.status,
        customer: p.customer,
        metrics: {
          totalRevenue,
          grossBilled,
          paidRevenue,
          totalExpenses,
          billExpenses,
          journalExpenses,
          netProfit,
          profitMargin,
          budgetUtilization,
          budgetVariance,
          invoiceCount: p.invoices.length,
          billCount: p.bills.length,
        },
      };
    });

    // Company-wide Project aggregates
    const totalProjects = enriched.length;
    const activeProjects = enriched.filter((p) => p.status === 'ACTIVE').length;
    const aggregateRevenue = enriched.reduce((s, p) => s + p.metrics.totalRevenue, 0);
    const aggregateExpenses = enriched.reduce((s, p) => s + p.metrics.totalExpenses, 0);
    const aggregateNetProfit = aggregateRevenue - aggregateExpenses;
    const aggregateMargin = aggregateRevenue > 0 ? (aggregateNetProfit / aggregateRevenue) * 100 : 0;
    const aggregateBudget = enriched.reduce((s, p) => s + p.budget, 0);
    const aggregateBudgetUtilization = aggregateBudget > 0 ? (aggregateExpenses / aggregateBudget) * 100 : 0;

    return NextResponse.json({
      projects: enriched,
      summary: {
        totalProjects,
        activeProjects,
        aggregateRevenue,
        aggregateExpenses,
        aggregateNetProfit,
        aggregateMargin,
        aggregateBudget,
        aggregateBudgetUtilization,
      },
    });
  } catch (error: any) {
    console.error('Fetch projects error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, code, description, startDate, endDate, budget, customerId, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const companyId = user.companyId;

    // Generate code if not provided
    let projectCode = code?.trim();
    if (!projectCode) {
      const count = await prisma.project.count({ where: { companyId } });
      const year = new Date().getFullYear();
      projectCode = `PRJ-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    // Check code uniqueness within company
    const existing = await prisma.project.findFirst({
      where: { companyId, code: projectCode },
    });
    if (existing) {
      return NextResponse.json({ error: `Project code "${projectCode}" already exists` }, { status: 409 });
    }

    const project = await prisma.project.create({
      data: {
        companyId,
        code: projectCode,
        name: name.trim(),
        description: description?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: Number(budget) || 0,
        status: status || 'ACTIVE',
        customerId: customerId || null,
      },
      include: {
        customer: true,
      },
    });

    await logAuditEvent({
      companyId,
      userId: user.userId,
      action: 'CREATE',
      entityType: 'PROJECT',
      entityId: project.id,
      entityRef: project.code,
      details: `Created Project ${project.name} (${project.code}) with Budget ₹${Number(project.budget).toLocaleString('en-IN')}`,
      newValues: { code: project.code, name: project.name, budget: project.budget, status: project.status },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
  }
}
