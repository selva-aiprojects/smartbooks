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

    const bills = await prisma.bill.findMany({
      where: { companyId: user.companyId },
      include: { vendor: true, items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bills);
  } catch (error: any) {
    console.error('Fetch bills error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch bills' }, { status: 500 });
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
      vendorName,
      number,
      billDate,
      dueDate,
      isInterState,
      category,
      items,
    } = body;

    const companyId = user.companyId;

    // Resolve or create Vendor
    let resolvedVendorId = vendorId;
    let vendorRecord = null;

    if (resolvedVendorId) {
      vendorRecord = await prisma.vendor.findFirst({
        where: { id: resolvedVendorId, companyId },
      });
    }

    if (!vendorRecord && vendorName) {
      // Find by name or create
      vendorRecord = await prisma.vendor.findFirst({
        where: { companyId, name: { equals: vendorName, mode: 'insensitive' } },
      });

      if (!vendorRecord) {
        vendorRecord = await prisma.vendor.create({
          data: {
            companyId,
            name: vendorName,
            address: body.vendorAddress || null,
          },
        });
      }
      resolvedVendorId = vendorRecord.id;
    }

    if (!resolvedVendorId) {
      return NextResponse.json({ error: 'Vendor is required' }, { status: 400 });
    }

    const billNumber = number || `BILL-${Date.now().toString().slice(-6)}`;
    const lineItems = Array.isArray(items) && items.length > 0
      ? items
      : [{ description: 'Office / Cloud Expense', quantity: 1, unitPrice: Number(body.totalAmount) || 1000, category: category || 'Expense' }];

    const lineTotals = lineItems.map((i: any) => {
      const taxable = (Number(i.quantity) || 1) * (Number(i.unitPrice) || 0);
      const gstRate = Number(i.gstRate) || 0;
      const gst = taxable * (gstRate / 100);
      return { taxable, gstRate, gst };
    });

    const taxableAmount = lineTotals.reduce((sum, l) => sum + l.taxable, 0);
    const gstAmount = lineTotals.reduce((sum, l) => sum + l.gst, 0);
    const totalAmount = taxableAmount + gstAmount;
    const effectiveGstRate = taxableAmount > 0 ? Math.round((gstAmount / taxableAmount) * 10000) / 100 : 0;

    const createdBill = await prisma.$transaction(async (tx) => {
      const bill = await tx.bill.create({
        data: {
          companyId,
          vendorId: resolvedVendorId,
          number: billNumber,
          billDate: billDate ? new Date(billDate) : new Date(),
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 86400000),
          status: 'Unpaid',
          taxableAmount,
          gstAmount,
          gstRate: effectiveGstRate,
          isInterState: !!isInterState,
          totalAmount,
          items: {
            create: lineItems.map((i: any, idx: number) => ({
              description: i.description || 'Expense item',
              hsnCode: i.hsnCode || null,
              quantity: Number(i.quantity) || 1,
              unitPrice: Number(i.unitPrice) || 0,
              amount: lineTotals[idx].taxable,
              category: i.category || category || 'Expense',
              gstRate: lineTotals[idx].gstRate,
              gstAmount: lineTotals[idx].gst,
            })),
          },
        },
        include: {
          vendor: true,
          items: true,
        },
      });

      // Post Journal Entry for Bill
      const apAcc = await tx.account.findFirst({ where: { companyId, code: '2010' } });
      const expAcc = await tx.account.findFirst({ where: { companyId, code: '5010' } });

      if (apAcc && expAcc) {
        const jLines: any[] = [
          { accountId: expAcc.id, amount: taxableAmount, type: 'debit', description: `Expense for Bill #${bill.number}` },
          { accountId: apAcc.id, amount: totalAmount, type: 'credit', description: `Accounts payable to ${vendorRecord?.name || 'Vendor'}` },
        ];

        if (gstAmount > 0) {
          const itcAcc = await tx.account.findFirst({ where: { companyId, code: '1030' } });
          if (itcAcc) {
            jLines.push({ accountId: itcAcc.id, amount: gstAmount, type: 'debit', description: `Input GST (ITC) for Bill #${bill.number}` });
          }
        }

        await tx.journalEntry.create({
          data: {
            companyId,
            date: bill.billDate,
            description: `Auto-journal for Vendor Bill #${bill.number} from OCR / Billing`,
            status: 'Posted',
            createdById: user.userId,
            lines: { create: jLines },
          },
        });
      }

      return bill;
    });

    // Record audit log
    await logAuditEvent({
      companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'CREATE',
      entityType: 'BILL',
      entityId: createdBill.id,
      entityRef: createdBill.number,
      details: `Created vendor bill #${createdBill.number} for ₹${Number(createdBill.totalAmount).toLocaleString('en-IN')} (Vendor: ${vendorRecord?.name})`,
      newValues: { number: createdBill.number, totalAmount: createdBill.totalAmount, vendor: vendorRecord?.name },
    });

    return NextResponse.json(createdBill, { status: 201 });
  } catch (error: any) {
    console.error('Create bill error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create bill' }, { status: 500 });
  }
}
