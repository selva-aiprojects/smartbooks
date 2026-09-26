import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../../../lib/server-auth';
import { logAuditEvent } from '../../../../../lib/server-audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const companyId = user.companyId;

    const quotation = await prisma.quotation.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    if (quotation.status === 'Converted' && quotation.convertedInvoiceId) {
      return NextResponse.json({
        error: 'Quotation has already been converted to an invoice',
        invoiceId: quotation.convertedInvoiceId,
      }, { status: 400 });
    }

    // Require or ensure customer
    let customerId = quotation.customerId;
    if (!customerId) {
      // Create a default customer for this quotation if unlinked
      const fallbackCustomer = await prisma.customer.create({
        data: {
          companyId,
          name: 'Walk-in / Valued Client',
          address: 'Commercial District, India',
        },
      });
      customerId = fallbackCustomer.id;
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const effectiveGstRate = Number(quotation.taxableAmount) > 0
      ? Math.round((Number(quotation.gstAmount) / Number(quotation.taxableAmount)) * 10000) / 100
      : 18;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Sales Invoice
      const invoice = await tx.invoice.create({
        data: {
          companyId,
          customerId,
          number: invoiceNumber,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 15 * 86400000),
          status: 'Sent',
          taxableAmount: quotation.taxableAmount,
          gstAmount: quotation.gstAmount,
          gstRate: effectiveGstRate,
          isInterState: false,
          totalAmount: quotation.totalAmount,
          items: {
            create: quotation.items.map((it) => ({
              description: it.description,
              hsnCode: it.hsnCode,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              amount: it.amount,
              gstRate: it.gstRate,
              gstAmount: it.gstAmount,
            })),
          },
        },
      });

      // 2. Update Quotation Status
      await tx.quotation.update({
        where: { id: quotation.id },
        data: {
          status: 'Converted',
          convertedInvoiceId: invoice.id,
        },
      });

      // 3. Post Double-Entry Journal Entry
      const arAcc = await tx.account.findFirst({ where: { companyId, code: '1020' } });
      const revAcc = await tx.account.findFirst({ where: { companyId, code: '4010' } });

      if (arAcc && revAcc) {
        const jLines: any[] = [
          {
            accountId: arAcc.id,
            amount: quotation.totalAmount,
            type: 'debit',
            description: `Receivable for converted Quote #${quotation.number} -> Invoice #${invoice.number}`,
          },
          {
            accountId: revAcc.id,
            amount: quotation.taxableAmount,
            type: 'credit',
            description: `Sales revenue for Invoice #${invoice.number}`,
          },
        ];

        if (Number(quotation.gstAmount) > 0) {
          const gstAcc = await tx.account.findFirst({ where: { companyId, code: '2020' } }) ||
                         await tx.account.findFirst({ where: { companyId, code: '2010' } });
          if (gstAcc) {
            jLines.push({
              accountId: gstAcc.id,
              amount: quotation.gstAmount,
              type: 'credit',
              description: `Output GST on Invoice #${invoice.number}`,
            });
          }
        }

        await tx.journalEntry.create({
          data: {
            companyId,
            date: new Date(),
            description: `Auto-journal for Converted Estimate #${quotation.number} to Invoice #${invoice.number}`,
            status: 'Posted',
            createdById: user.userId,
            lines: { create: jLines },
          },
        });
      }

      return invoice;
    });

    // 4. Record MCA Rule 3(1) Audit Event
    await logAuditEvent({
      companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'CONVERT',
      entityType: 'QUOTATION',
      entityId: quotation.id,
      entityRef: quotation.number,
      details: `Converted Quotation #${quotation.number} into official Tax Invoice #${result.number} for ₹${Number(result.totalAmount).toLocaleString('en-IN')}`,
      newValues: { invoiceId: result.id, invoiceNumber: result.number, quotationNumber: quotation.number },
    });

    return NextResponse.json({
      success: true,
      message: `Quotation converted to Invoice #${result.number} successfully`,
      invoiceId: result.id,
      invoiceNumber: result.number,
      invoice: result,
    });
  } catch (error: any) {
    console.error('Convert quotation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to convert quotation' }, { status: 500 });
  }
}
