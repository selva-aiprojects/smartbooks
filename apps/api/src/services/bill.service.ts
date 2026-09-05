import { prisma } from '../lib/prisma';

export async function getVendors(companyId: string) {
  return await prisma.vendor.findMany({
    where: { companyId },
    orderBy: { name: 'asc' }
  });
}

export async function createVendor(data: { companyId: string; name: string; email?: string | null; phone?: string | null; address?: string | null }) {
  return await prisma.vendor.create({ data });
}

export async function getBills(companyId: string) {
  return await prisma.bill.findMany({
    where: { companyId },
    include: { vendor: true, items: true, payments: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createBill(data: {
  companyId: string;
  createdById: string;
  vendorId: string;
  number: string;
  billDate: Date | string;
  dueDate: Date | string;
  isInterState?: boolean;
  items: Array<{ description: string; quantity: number; unitPrice: number; category?: string; hsnCode?: string | null; gstRate?: number }>;
}) {
  const { companyId, createdById, vendorId, items, isInterState, ...rest } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('A bill must have at least one line item');
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
    const vendor = await tx.vendor.findFirst({ where: { id: vendorId, companyId } });
    if (!vendor) {
      throw new Error('Vendor not found or does not belong to this company');
    }

    const bill = await tx.bill.create({
      data: {
        ...rest,
        companyId,
        vendorId,
        billDate: new Date(data.billDate),
        dueDate: new Date(data.dueDate),
        status: 'Unpaid',
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
            category: i.category || 'Expense',
            gstRate: lineTotals[idx].gstRate,
            gstAmount: lineTotals[idx].gst
          }))
        }
      },
      include: {
        vendor: true,
        items: true
      }
    });

    await postBillJournal(
      tx,
      bill.companyId,
      data.createdById,
      bill.number,
      Number(bill.taxableAmount),
      Number(bill.gstAmount),
      vendor.name,
      bill.isInterState
    );

    return bill;
  });
}

async function postBillJournal(
  tx: any,
  companyId: string,
  createdById: string,
  billNumber: string,
  taxableAmount: number,
  gstAmount: number,
  vendorName: string,
  isInterState: boolean
) {
  const expAcc = await tx.account.findFirst({ where: { companyId, code: '5010' } });
  const apAcc = await tx.account.findFirst({ where: { companyId, code: '2010' } });

  if (!expAcc || !apAcc) {
    throw new Error(`Required GL accounts (5010 Expense, 2010 A/P) missing for company ${companyId}`);
  }

  const lines: any[] = [
    { accountId: expAcc.id, amount: taxableAmount, type: 'debit', description: `Expense from ${vendorName}` },
    { accountId: apAcc.id, amount: taxableAmount + gstAmount, type: 'credit', description: `Accounts payable to ${vendorName} for Bill #${billNumber}` }
  ];

  if (gstAmount > 0) {
    const itcAcc = await tx.account.findFirst({ where: { companyId, code: '1025' } });
    const inputGstAcc = itcAcc || (await tx.account.create({
      data: {
        companyId,
        name: isInterState ? 'IGST Input Credit' : 'CGST & SGST Input Credit',
        code: '1025',
        type: 'Asset',
        balance: 0
      }
    }));
    lines.push({
      accountId: inputGstAcc.id,
      amount: gstAmount,
      type: 'debit',
      description: `${isInterState ? 'IGST' : 'CGST/SGST'} input tax credit on Bill #${billNumber}`
    });
  }

  await tx.journalEntry.create({
    data: {
      companyId,
      date: new Date(),
      description: `Bill #${billNumber} recorded`,
      status: 'Posted',
      createdById,
      lines: { create: lines }
    }
  });
}

export async function recordBillPayment(
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
    const bill = await tx.bill.findFirst({ where: { id, companyId }, include: { vendor: true } });
    if (!bill) {
      throw new Error('Bill not found or not in this company');
    }
    if (bill.status === 'Void') {
      throw new Error('Cannot record a payment against a void bill');
    }

    const payment = await tx.billPayment.create({
      data: {
        billId: id,
        amount,
        date: new Date(data.date || new Date()),
        method: data.method || 'Cash',
        reference: data.reference || null,
        createdById: userId
      }
    });

    const apAcc = await tx.account.findFirst({ where: { companyId, code: '2010' } });
    const cashAcc = await tx.account.findFirst({ where: { companyId, code: '1010' } });
    if (!apAcc || !cashAcc) {
      throw new Error(`Required GL accounts (2010 A/P, 1010 Cash) missing for company ${companyId}`);
    }

    await tx.journalEntry.create({
      data: {
        companyId,
        date: new Date(data.date || new Date()),
        description: `Payment made for Bill #${bill.number}${payment.reference ? ` (${payment.reference})` : ''}`,
        status: 'Posted',
        createdById: userId,
        lines: {
          create: [
            { accountId: apAcc.id, amount, type: 'debit', description: `Payable reduced for Bill #${bill.number}` },
            { accountId: cashAcc.id, amount, type: 'credit', description: `Cash disbursement to ${bill.vendor.name}` }
          ]
        }
      }
    });

    const paidSoFar = await tx.billPayment.aggregate({
      where: { billId: id },
      _sum: { amount: true }
    });
    const paid = Number(paidSoFar._sum.amount) || 0;
    let status = bill.status;
    if (paid >= Number(bill.totalAmount)) {
      status = 'Paid';
    } else if (paid > 0 && bill.status === 'Unpaid') {
      status = 'Partially Paid';
    }

    if (status !== bill.status) {
      await tx.bill.update({ where: { id }, data: { status } });
    }

    const updated = await tx.bill.findUnique({
      where: { id },
      include: { vendor: true, items: true, payments: true }
    });

    return { payment, bill: updated };
  });
}

export async function updateBillStatus(id: string, status: string, companyId: string, userId: string) {
  if (!['Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Void'].includes(status)) {
    throw new Error(`Invalid bill status: "${status}"`);
  }

  const existing = await prisma.bill.findFirst({ where: { id, companyId } });
  if (!existing) {
    throw new Error('Bill not found or not in this company');
  }

  if (status === existing.status) {
    return prisma.bill.findUnique({
      where: { id },
      include: { vendor: true, items: true }
    });
  }

  if (status === 'Paid') {
    return await prisma.$transaction(async (tx) => {
      const bill = await tx.bill.update({
        where: { id },
        data: { status },
        include: { vendor: true, items: true }
      });

      const apAcc = await tx.account.findFirst({ where: { companyId, code: '2010' } });
      const cashAcc = await tx.account.findFirst({ where: { companyId, code: '1010' } });

      if (!apAcc || !cashAcc) {
        throw new Error(`Required GL accounts (2010 A/P, 1010 Cash) missing for company ${companyId}`);
      }

      await tx.journalEntry.create({
        data: {
          companyId,
          date: new Date(),
          description: `Disbursement for Bill #${bill.number}`,
          status: 'Posted',
          createdById: userId,
          lines: {
            create: [
              { accountId: apAcc.id, amount: Number(bill.totalAmount), type: 'debit', description: `Payable cleared for Bill #${bill.number}` },
              { accountId: cashAcc.id, amount: Number(bill.totalAmount), type: 'credit', description: `Cash disbursement to ${bill.vendor.name}` }
            ]
          }
        }
      });

      return bill;
    });
  }

  return await prisma.bill.update({
    where: { id },
    data: { status },
    include: { vendor: true, items: true }
  });
}
