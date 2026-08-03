import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getVendors(companyId: string) {
  return await prisma.vendor.findMany({
    where: { companyId },
    orderBy: { name: 'asc' }
  });
}

export async function createVendor(data: { companyId: string; name: string; email?: string; phone?: string; address?: string }) {
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
  vendorId: string;
  number: string;
  billDate: Date | string;
  dueDate: Date | string;
  items: Array<{ description: string; quantity: number; unitPrice: number; category?: string }>;
}) {
  const totalAmount = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  return await prisma.bill.create({
    data: {
      companyId: data.companyId,
      vendorId: data.vendorId,
      number: data.number,
      billDate: new Date(data.billDate),
      dueDate: new Date(data.dueDate),
      status: 'Unpaid',
      totalAmount,
      items: {
        create: data.items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          amount: i.quantity * i.unitPrice,
          category: i.category || 'Expense'
        }))
      }
    },
    include: {
      vendor: true,
      items: true
    }
  });
}

export async function updateBillStatus(id: string, status: string) {
  const bill = await prisma.bill.update({
    where: { id },
    data: { status },
    include: { vendor: true, items: true }
  });

  // Automatically post double-entry journal when marked Paid
  if (status === 'Paid') {
    const cashAcc = await prisma.account.findFirst({ where: { companyId: bill.companyId, code: '1010' } });
    const expAcc = await prisma.account.findFirst({ where: { companyId: bill.companyId, code: '5010' } });
    const user = await prisma.user.findFirst({ where: { companyId: bill.companyId } });

    if (cashAcc && expAcc && user) {
      await prisma.journalEntry.create({
        data: {
          companyId: bill.companyId,
          date: new Date(),
          description: `Disbursement for Bill #${bill.number}`,
          status: 'Posted',
          createdById: user.id,
          lines: {
            create: [
              { accountId: expAcc.id, amount: bill.totalAmount, type: 'debit', description: `Expense for Bill #${bill.number} to ${bill.vendor.name}` },
              { accountId: cashAcc.id, amount: bill.totalAmount, type: 'credit', description: `Cash disbursement to ${bill.vendor.name}` }
            ]
          }
        }
      });
    }
  }

  return bill;
}
