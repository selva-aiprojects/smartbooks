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
    include: { vendor: true, items: true },
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
  items: Array<{ description: string; quantity: number; unitPrice: number; category?: string }>;
}) {
  const { companyId, vendorId, items, ...rest } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('A bill must have at least one line item');
  }
  const totalAmount = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

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
        totalAmount,
        items: {
          create: items.map(i => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            amount: (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0),
            category: i.category || 'Expense'
          }))
        }
      },
      include: {
        vendor: true,
        items: true
      }
    });

    await postBillJournal(tx, bill.companyId, data.createdById, bill.number, Number(bill.totalAmount), vendor.name);

    return bill;
  });
}

async function postBillJournal(
  tx: any,
  companyId: string,
  createdById: string,
  billNumber: string,
  totalAmount: number,
  vendorName: string
) {
  const expAcc = await tx.account.findFirst({ where: { companyId, code: '5010' } });
  const apAcc = await tx.account.findFirst({ where: { companyId, code: '2010' } });

  if (!expAcc || !apAcc) {
    throw new Error(`Required GL accounts (5010 Expense, 2010 A/P) missing for company ${companyId}`);
  }

  await tx.journalEntry.create({
    data: {
      companyId,
      date: new Date(),
      description: `Bill #${billNumber} recorded`,
      status: 'Posted',
      createdById,
      lines: {
        create: [
          { accountId: expAcc.id, amount: totalAmount, type: 'debit', description: `Expense from ${vendorName}` },
          { accountId: apAcc.id, amount: totalAmount, type: 'credit', description: `Accounts payable to ${vendorName} for Bill #${billNumber}` }
        ]
      }
    }
  });
}

export async function updateBillStatus(id: string, status: string, companyId: string, userId: string) {
  if (!['Unpaid', 'Paid', 'Overdue', 'Void'].includes(status)) {
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
