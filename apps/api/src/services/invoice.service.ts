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
    include: { customer: true, items: true, payments: true },
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
  items: Array<{ description: string; quantity: number; unitPrice: number; hsnCode?: string | null; gstRate?: number; itemId?: string | null }>;
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
            itemId: i.itemId || null,
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

    await deductInventory(tx, companyId, items);

    return invoice;
  });
}

async function deductInventory(
  tx: any,
  companyId: string,
  items: Array<{ itemId?: string | null; quantity: number }>
) {
  for (const line of items) {
    if (!line.itemId) continue;
    const item = await tx.item.findFirst({ where: { id: line.itemId, companyId, active: true } });
    if (!item) {
      throw new Error('Item not found or not active for this company');
    }
    if (!item.tracksInventory) continue;
    const qty = Number(line.quantity) || 0;
    const stock = Number(item.stock) || 0;
    if (stock < qty) {
      throw new Error(`Insufficient stock for ${item.name} (SKU ${item.sku}): only ${stock} available, ${qty} required`);
    }
    await tx.item.update({
      where: { id: item.id },
      data: { stock: stock - qty }
    });
  }
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

export async function recordInvoicePayment(
  id: string,
  data: { amount: number; date: Date | string; method?: string; reference?: string | null },
  companyId: string,
  userId: string
) {
  const amount = Number(data.amount) || 0;
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({ where: { id, companyId }, include: { customer: true } });
    if (!invoice) {
      throw new Error('Invoice not found or not in this company');
    }
    if (invoice.status === 'Void') {
      throw new Error('Cannot record a payment against a void invoice');
    }

    const payment = await tx.invoicePayment.create({
      data: {
        invoiceId: id,
        amount,
        date: new Date(data.date || new Date()),
        method: data.method || 'Cash',
        reference: data.reference || null,
        createdById: userId
      }
    });

    const cashAcc = await tx.account.findFirst({ where: { companyId, code: '1010' } });
    const arAcc = await tx.account.findFirst({ where: { companyId, code: '1020' } });
    if (!cashAcc || !arAcc) {
      throw new Error(`Required GL accounts (1010 Cash, 1020 A/R) missing for company ${companyId}`);
    }

    await tx.journalEntry.create({
      data: {
        companyId,
        date: new Date(data.date || new Date()),
        description: `Payment received for Invoice #${invoice.number}${payment.reference ? ` (${payment.reference})` : ''}`,
        status: 'Posted',
        createdById: userId,
        lines: {
          create: [
            { accountId: cashAcc.id, amount, type: 'debit', description: `Cash received from ${invoice.customer.name}` },
            { accountId: arAcc.id, amount, type: 'credit', description: `Receivable reduced for Invoice #${invoice.number}` }
          ]
        }
      }
    });

    const paidSoFar = await tx.invoicePayment.aggregate({
      where: { invoiceId: id },
      _sum: { amount: true }
    });
    const paid = Number(paidSoFar._sum.amount) || 0;
    let status = invoice.status;
    if (paid >= Number(invoice.totalAmount)) {
      status = 'Paid';
    } else if (paid > 0 && invoice.status === 'Sent') {
      status = 'Sent';
    }

    if (status !== invoice.status) {
      await tx.invoice.update({ where: { id }, data: { status } });
    }

    const updated = await tx.invoice.findUnique({
      where: { id },
      include: { customer: true, items: true, payments: true }
    });

    return { payment, invoice: updated };
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
