import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../../lib/server-auth';
import { logAuditEvent } from '../../../../lib/server-audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slips = await prisma.salarySlip.findMany({
      where: { companyId: user.companyId },
      include: { employee: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return NextResponse.json(slips);
  } catch (error: any) {
    console.error('Fetch salary slips error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch slips' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const month = Number(body.month) || (new Date().getMonth() + 1);
    const year = Number(body.year) || new Date().getFullYear();
    const companyId = user.companyId;

    // Fetch active employees
    const employees = await prisma.employee.findMany({
      where: { companyId, status: 'Active' },
    });

    if (employees.length === 0) {
      return NextResponse.json({ error: 'No active employees found to run payroll' }, { status: 400 });
    }

    const processedSlips: any[] = [];
    let totalGrossAll = 0;
    let totalPfAll = 0;
    let totalEsiAll = 0;
    let totalNetAll = 0;

    for (const emp of employees) {
      const base = Number(emp.baseSalary) || 30000;
      const basicPay = Math.round(base * 0.5); // 50% Basic
      const hra = Math.round(basicPay * 0.4); // 40% HRA
      const allowances = Math.max(0, base - basicPay - hra);
      const grossSalary = basicPay + hra + allowances;

      // Employee PF: 12% of basic, capped at 1,800
      const pfDeduction = Math.min(1800, Math.round(basicPay * 0.12));

      // Employee ESI: 0.75% of gross if gross <= 21,000, else 0
      const esiDeduction = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;

      // PT (Professional Tax): ₹200 standard
      const professionalTax = 200;

      const netSalary = grossSalary - pfDeduction - esiDeduction - professionalTax;

      totalGrossAll += grossSalary;
      totalPfAll += pfDeduction;
      totalEsiAll += esiDeduction;
      totalNetAll += netSalary;

      const slip = await prisma.salarySlip.upsert({
        where: {
          companyId_employeeId_month_year: {
            companyId,
            employeeId: emp.id,
            month,
            year,
          },
        },
        update: {
          basicPay,
          hra,
          allowances,
          grossSalary,
          pfDeduction,
          esiDeduction,
          professionalTax,
          netSalary,
          status: 'Paid',
          paymentDate: new Date(),
        },
        create: {
          companyId,
          employeeId: emp.id,
          month,
          year,
          basicPay,
          hra,
          allowances,
          grossSalary,
          pfDeduction,
          esiDeduction,
          professionalTax,
          netSalary,
          status: 'Paid',
          paymentDate: new Date(),
        },
        include: { employee: true },
      });

      processedSlips.push(slip);
    }

    // Auto-post double-entry journal entry for monthly payroll
    const salExpAcc = await prisma.account.findFirst({ where: { companyId, code: '5020' } });
    const bankAcc = await prisma.account.findFirst({ where: { companyId, code: '1010' } });

    if (salExpAcc && bankAcc) {
      const jLines: any[] = [
        { accountId: salExpAcc.id, amount: totalGrossAll, type: 'debit', description: `Gross Salary Expense for Month ${month}/${year}` },
        { accountId: bankAcc.id, amount: totalNetAll, type: 'credit', description: `Net Salary disbursement to employees via NEFT` },
      ];

      if (totalPfAll > 0) {
        let pfAcc = await prisma.account.findFirst({ where: { companyId, code: '2030' } });
        if (!pfAcc) {
          pfAcc = await prisma.account.create({
            data: { companyId, code: '2030', name: 'Provident Fund (PF) Payable', type: 'Liability', balance: 0 },
          });
        }
        jLines.push({ accountId: pfAcc.id, amount: totalPfAll, type: 'credit', description: `Employee PF Withholding Payable` });
      }

      await prisma.journalEntry.create({
        data: {
          companyId,
          date: new Date(),
          description: `Automated Payroll Run Journal — ${month}/${year} (${employees.length} Employees)`,
          status: 'Posted',
          createdById: user.userId,
          lines: { create: jLines },
        },
      });
    }

    // Log to Audit Trail
    await logAuditEvent({
      companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'PAYMENT',
      entityType: 'PAYROLL',
      entityId: `PAYROLL-${year}-${month}`,
      entityRef: `M-${month}/${year}`,
      details: `Disbursed monthly payroll for ${employees.length} employees (Gross: ₹${totalGrossAll.toLocaleString('en-IN')}, Net Disbursed: ₹${totalNetAll.toLocaleString('en-IN')})`,
      newValues: { totalGross: totalGrossAll, totalNet: totalNetAll, employeesCount: employees.length },
    });

    return NextResponse.json({
      success: true,
      processedCount: processedSlips.length,
      totalGross: totalGrossAll,
      totalNet: totalNetAll,
      slips: processedSlips,
    });
  } catch (error: any) {
    console.error('Payroll run error:', error);
    return NextResponse.json({ error: error.message || 'Failed to execute payroll run' }, { status: 500 });
  }
}
