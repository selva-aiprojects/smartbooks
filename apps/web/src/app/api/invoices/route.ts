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

    const invoices = await prisma.invoice.findMany({
      where: { companyId: user.companyId },
      include: {
        customer: true,
        items: true,
        payments: true,
        project: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error('Fetch invoices error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 });
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
      customerId,
      customerName,
      number,
      issueDate,
      dueDate,
      isInterState,
      projectId,
      items,
    } = body;

    const companyId = user.companyId;

    // Resolve Customer
    let resolvedCustomerId = customerId;
    let customerRecord = null;

    if (resolvedCustomerId) {
      customerRecord = await prisma.customer.findFirst({
        where: { id: resolvedCustomerId, companyId },
      });
    }

    if (!customerRecord && customerName) {
      customerRecord = await prisma.customer.findFirst({
        where: { companyId, name: { equals: customerName, mode: 'insensitive' } },
      });

      if (!customerRecord) {
        customerRecord = await prisma.customer.create({
          data: {
            companyId,
            name: customerName,
            address: body.customerAddress || null,
          },
        });
      }
      resolvedCustomerId = customerRecord.id;
    }

    if (!resolvedCustomerId) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 });
    }

    const invoiceNumber = number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const lineItems = Array.isArray(items) && items.length > 0
      ? items
      : [{ description: 'Professional Services', quantity: 1, unitPrice: Number(body.totalAmount) || 1000, gstRate: 18, hsnCode: '998311' }];

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

    const createdInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          companyId,
          customerId: resolvedCustomerId,
          projectId: projectId || null,
          number: invoiceNumber,
          issueDate: issueDate ? new Date(issueDate) : new Date(),
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 86400000),
          status: 'Sent',
          taxableAmount,
          gstAmount,
          gstRate: effectiveGstRate,
          isInterState: !!isInterState,
          totalAmount,
          items: {
            create: lineItems.map((i: any, idx: number) => ({
              itemId: i.itemId || null,
              description: i.description || 'Sales Item',
              hsnCode: i.hsnCode || null,
              quantity: Number(i.quantity) || 1,
              unitPrice: Number(i.unitPrice) || 0,
              amount: lineTotals[idx].taxable,
              gstRate: lineTotals[idx].gstRate,
              gstAmount: lineTotals[idx].gst,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
          project: true,
        },
      });

      // Update inventory stock if items tracked
      for (const item of lineItems) {
        if (item.itemId) {
          await tx.item.updateMany({
            where: { id: item.itemId, tracksInventory: true },
            data: { stock: { decrement: Number(item.quantity) || 1 } },
          });
        }
      }

      // Auto-post double-entry journal (Dr Debtors 1020, Cr Revenue 4010, Cr Output GST 2020)
      const arAcc = await tx.account.findFirst({ where: { companyId, code: '1020' } });
      const revAcc = await tx.account.findFirst({ where: { companyId, code: '4010' } });

      if (arAcc && revAcc) {
        const jLines: any[] = [
          { accountId: arAcc.id, amount: totalAmount, type: 'debit', description: `Accounts receivable for Invoice #${invoice.number}` },
          { accountId: revAcc.id, amount: taxableAmount, type: 'credit', description: `Sales revenue for Invoice #${invoice.number}` },
        ];

        if (gstAmount > 0) {
          const gstAcc = await tx.account.findFirst({ where: { companyId, code: '2020' } }) ||
                         await tx.account.findFirst({ where: { companyId, code: '2010' } });
          if (gstAcc) {
            jLines.push({ accountId: gstAcc.id, amount: gstAmount, type: 'credit', description: `Output GST liability on Invoice #${invoice.number}` });
          }
        }

        await tx.journalEntry.create({
          data: {
            companyId,
            date: invoice.issueDate,
            description: `Auto-journal for Sales Invoice #${invoice.number}`,
            status: 'Posted',
            createdById: user.userId,
            lines: { create: jLines },
          },
        });
      }

      return invoice;
    });

    // Record statutory audit log
    await logAuditEvent({
      companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'CREATE',
      entityType: 'INVOICE',
      entityId: createdInvoice.id,
      entityRef: createdInvoice.number,
      details: `Generated tax invoice #${createdInvoice.number} for ₹${Number(createdInvoice.totalAmount).toLocaleString('en-IN')} (Customer: ${customerRecord?.name})`,
      newValues: { number: createdInvoice.number, totalAmount: createdInvoice.totalAmount, customer: customerRecord?.name },
    });

    return NextResponse.json(createdInvoice, { status: 201 });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}
