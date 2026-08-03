import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCustomers(companyId: string) {
  return await prisma.customer.findMany({
    where: { companyId },
    orderBy: { name: 'asc' }
  });
}

export async function createCustomer(data: { companyId: string; name: string; email?: string; phone?: string; address?: string }) {
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
  customerId: string;
  number: string;
  issueDate: Date | string;
  dueDate: Date | string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
}) {
  const totalAmount = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  return await prisma.invoice.create({
    data: {
      companyId: data.companyId,
      customerId: data.customerId,
      number: data.number,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      status: 'Sent',
      totalAmount,
      items: {
        create: data.items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          amount: i.quantity * i.unitPrice
        }))
      }
    },
    include: {
      customer: true,
      items: true
    }
  });
}

export async function updateInvoiceStatus(id: string, status: string) {
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status },
    include: { customer: true, items: true }
  });

  // Automatically post double-entry journal when marked Paid
  if (status === 'Paid') {
    const cashAcc = await prisma.account.findFirst({ where: { companyId: invoice.companyId, code: '1010' } });
    const revAcc = await prisma.account.findFirst({ where: { companyId: invoice.companyId, code: '4010' } });
    const user = await prisma.user.findFirst({ where: { companyId: invoice.companyId } });

    if (cashAcc && revAcc && user) {
      await prisma.journalEntry.create({
        data: {
          companyId: invoice.companyId,
          date: new Date(),
          description: `Payment received for Invoice #${invoice.number}`,
          status: 'Posted',
          createdById: user.id,
          lines: {
            create: [
              { accountId: cashAcc.id, amount: invoice.totalAmount, type: 'debit', description: `Cash received from ${invoice.customer.name}` },
              { accountId: revAcc.id, amount: invoice.totalAmount, type: 'credit', description: `Revenue from Invoice #${invoice.number}` }
            ]
          }
        }
      });
    }
  }

  return invoice;
}
