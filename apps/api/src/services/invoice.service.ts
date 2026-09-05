import { prisma } from '../lib/prisma';

export async function getCustomers(companyId: string) {
  return await prisma.customer.findMany({
    where: { companyId },
    orderBy: { name: 'asc' }
  });
}

export async function createCustomer(data: { companyId: string; name: string; email?: string | null; phone?: string | null; address?: string | null }) {
  return await prisma.customer.create({ data });
}

export async function getInvoices(companyId: string) {
  return await prisma.invoice.findMany({
    where: { companyId },
    include: { customer: true, items: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createInvoice(data: {
  companyId: string;
  createdById: string;
  customerId: string;
  number: string;
  issueDate: Date | string;
  dueDate: Date | string;
  isInterState?: boolean;
  items: Array<{ description: string; quantity: number; unitPrice: number; hsnCode?: string | null; gstRate?: number }>;
}) {
  const { companyId, createdById, customerId, items, isInterState, ...rest } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('An invoice must have at least one line item');
  }
  const lineTotals = items.map((i) => {
    const taxable = (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0);
    const gstRate = Number(i.gstRate) || 0;
    const gst = taxable * (gstRate / 100);
    return { taxable, gstRate, gst };
  });
  const taxableAmount = lineTotals.reduce((sum, l) => sum + l.taxable, 0);
  const gstAmount = lineTotals.reduce((sum, l) => sum + l.gst, 0);
  const totalAmount = taxableAmount + gstAmount;
  const effectiveGstRate = taxableAmount > 0 ? Math.round((gstAmount / taxableAmount) * 10000) / 100 : 0;

  return await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findFirst({ where: { id: customerId, companyId } });
    if (!customer) {
      throw new Error('Customer not found or does not belong to this company');
    }

    const invoice = await tx.invoice.create({
      data: {
        ...rest,
        companyId,
        customerId,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        status: 'Sent',
        taxableAmount,
        gstAmount,
        gstRate: effectiveGstRate,
        isInterState: !!isInterState,
        totalAmount,
        items: {
          create: items.map((i, idx) => ({
            description: i.description,
            hsnCode: i.hsnCode || null,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            amount: lineTotals[idx].taxable,
            gstRate: lineTotals[idx].gstRate,
            gstAmount: lineTotals[idx].gst
          }))
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    await postInvoiceJournal(
      tx,
      invoice.companyId,
      data.createdById,
      invoice.number,
      Number(invoice.taxableAmount),
      Number(invoice.gstAmount),
      customer.name,
      invoice.isInterState
    );

    return invoice;
  });
}

async function postInvoiceJournal(
  tx: any,
  companyId: string,
  createdById: string,
  invoiceNumber: string,
  taxableAmount: number,
  gstAmount: number,
  customerName: string,
  isInterState: boolean
) {
  const arAcc = await tx.account.findFirst({ where: { companyId, code: '1020' } });
  const revAcc = await tx.account.findFirst({ where: { companyId, code: '4010' } });

  if (!arAcc || !revAcc) {
    throw new Error(`Required GL accounts (1020 A/R, 4010 Revenue) missing for company ${companyId}`);
  }

  const lines: any[] = [
    { accountId: arAcc.id, amount: taxableAmount + gstAmount, type: 'debit', description: `Accounts receivable from ${customerName}` },
    { accountId: revAcc.id, amount: taxableAmount, type: 'credit', description: `Sales revenue from Invoice #${invoiceNumber}` }
  ];

  if (gstAmount > 0) {
    const gstAcc = await tx.account.findFirst({ where: { companyId, code: '2015' } });
    const outputGstAcc = gstAcc || (await tx.account.create({
      data: {
        companyId,
        name: isInterState ? 'IGST Payable' : 'CGST & SGST Payable',
        code: '2015',
        type: 'Liability',
        balance: 0
      }
    }));
    lines.push({
      accountId: outputGstAcc.id,
      amount: gstAmount,
      type: 'credit',
      description: `${isInterState ? 'IGST' : 'CGST/SGST'} output tax on Invoice #${invoiceNumber}`
    });
  }

  await tx.journalEntry.create({
    data: {
      companyId,
      date: new Date(),
      description: `Invoice #${invoiceNumber} issued`,
      status: 'Posted',
      createdById,
      lines: { create: lines }
    }
  });
}

export async function updateInvoiceStatus(id: string, status: string, companyId: string, userId: string) {
  if (!['Draft', 'Sent', 'Paid', 'Overdue', 'Void'].includes(status)) {
    throw new Error(`Invalid invoice status: "${status}"`);
  }

  const existing = await prisma.invoice.findFirst({ where: { id, companyId } });
  if (!existing) {
    throw new Error('Invoice not found or not in this company');
  }

  if (status === existing.status) {
    return prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: true }
    });
  }

  if (status === 'Paid') {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.update({
        where: { id },
        data: { status },
        include: { customer: true, items: true }
      });

      const cashAcc = await tx.account.findFirst({ where: { companyId, code: '1010' } });
      const arAcc = await tx.account.findFirst({ where: { companyId, code: '1020' } });

      if (!cashAcc || !arAcc) {
        throw new Error(`Required GL accounts (1010 Cash, 1020 A/R) missing for company ${companyId}`);
      }

      await tx.journalEntry.create({
        data: {
          companyId,
          date: new Date(),
          description: `Payment received for Invoice #${invoice.number}`,
          status: 'Posted',
          createdById: userId,
          lines: {
            create: [
              { accountId: cashAcc.id, amount: Number(invoice.totalAmount), type: 'debit', description: `Cash received from ${invoice.customer.name}` },
              { accountId: arAcc.id, amount: Number(invoice.totalAmount), type: 'credit', description: `Receivable cleared for Invoice #${invoice.number}` }
            ]
          }
        }
      });

      return invoice;
    });
  }

  return await prisma.invoice.update({
    where: { id },
    data: { status },
    include: { customer: true, items: true }
  });
}
