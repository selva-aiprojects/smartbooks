import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../lib/server-auth';
import { logAuditEvent } from '../../../lib/server-audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get('quarter') || undefined;
    const section = searchParams.get('section') || undefined;
    const status = searchParams.get('status') || undefined;

    const where: any = { companyId: user.companyId };
    if (quarter && quarter !== 'ALL') where.quarter = quarter;
    if (section && section !== 'ALL') where.section = section;
    if (status && status !== 'ALL') where.status = status;

    const entries = await prisma.tdsEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Fetch TDS entries error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch TDS records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      vendorId,
      billId,
      vendorName,
      vendorPan,
      section,
      rate,
      taxableAmount,
      quarter,
      financialYear,
    } = body;

    const companyId = user.companyId;
    const taxAmt = Number(taxableAmount) || 0;
    const tdsRate = Number(rate) || (section === '194J' ? 10 : section === '194C' ? 2 : 10);
    const tdsAmount = Math.round((taxAmt * (tdsRate / 100)) * 100) / 100;

    const entry = await prisma.tdsEntry.create({
      data: {
        companyId,
        vendorId: vendorId || null,
        billId: billId || null,
        vendorName: vendorName || 'Vendor',
        vendorPan: vendorPan || 'ABCDE1234F',
        section: section || '194C',
        rate: tdsRate,
        taxableAmount: taxAmt,
        tdsAmount,
        status: 'PENDING',
        quarter: quarter || 'Q2',
        financialYear: financialYear || '2026-27',
      },
    });

    // Auto-credit 2025 - TDS Payable in Chart of Accounts
    const tdsAcc = await prisma.account.findFirst({ where: { companyId, code: '2025' } });
    if (!tdsAcc) {
      await prisma.account.create({
        data: {
          companyId,
          code: '2025',
          name: 'TDS Payable (Statutory Liability)',
          type: 'Liability',
          balance: tdsAmount,
        },
      });
    } else {
      await prisma.account.update({
        where: { id: tdsAcc.id },
        data: { balance: Number(tdsAcc.balance) + tdsAmount },
      });
    }

    // Log to Audit Trail
    await logAuditEvent({
      companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'CREATE',
      entityType: 'TDS_ENTRY',
      entityId: entry.id,
      entityRef: `${entry.section}-${entry.id.slice(-6)}`,
      details: `Recorded statutory TDS deduction under Sec ${entry.section} of ₹${entry.tdsAmount} from ${entry.vendorName}`,
      newValues: { section: entry.section, tdsAmount: entry.tdsAmount, vendor: entry.vendorName },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error: any) {
    console.error('Create TDS error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record TDS deduction' }, { status: 500 });
  }
}
