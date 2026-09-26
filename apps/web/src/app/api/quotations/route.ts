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

    const quotations = await prisma.quotation.findMany({
      where: { companyId: user.companyId },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(quotations);
  } catch (error: any) {
    console.error('Fetch quotations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch quotations' }, { status: 500 });
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
      date,
      validUntil,
      status,
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

    const quoteNumber = number || `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const lineItems = Array.isArray(items) && items.length > 0
      ? items
      : [{ description: 'Software Implementation & Advisory', quantity: 1, unitPrice: 25000, gstRate: 18, hsnCode: '998313' }];

    const lineTotals = lineItems.map((i: any) => {
      const taxable = (Number(i.quantity) || 1) * (Number(i.unitPrice) || 0);
      const gstRate = Number(i.gstRate) || 0;
      const gst = taxable * (gstRate / 100);
      return { taxable, gstRate, gst };
    });

    const taxableAmount = lineTotals.reduce((sum, l) => sum + l.taxable, 0);
    const gstAmount = lineTotals.reduce((sum, l) => sum + l.gst, 0);
    const totalAmount = taxableAmount + gstAmount;

    const quoteDate = date ? new Date(date) : new Date();
    const expiryDate = validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 86400000);

    const quotation = await prisma.quotation.create({
      data: {
        companyId,
        customerId: resolvedCustomerId || null,
        number: quoteNumber,
        date: quoteDate,
        validUntil: expiryDate,
        status: status || 'Draft',
        taxableAmount,
        gstAmount,
        totalAmount,
        items: {
          create: lineItems.map((i: any, idx: number) => ({
            description: i.description || 'Quotation item',
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
      },
    });

    // Statutory audit log
    await logAuditEvent({
      companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'CREATE',
      entityType: 'QUOTATION',
      entityId: quotation.id,
      entityRef: quotation.number,
      details: `Generated pre-accounting estimate / quotation #${quotation.number} for ₹${Number(quotation.totalAmount).toLocaleString('en-IN')}`,
      newValues: { number: quotation.number, totalAmount: quotation.totalAmount, customer: customerRecord?.name },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error: any) {
    console.error('Create quotation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create quotation' }, { status: 500 });
  }
}
