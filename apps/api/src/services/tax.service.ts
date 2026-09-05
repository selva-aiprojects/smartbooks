import { prisma } from '../lib/prisma';

export async function getTaxRates(companyId: string) {
  return await prisma.taxRate.findMany({
    where: { companyId, active: true },
    orderBy: { rate: 'asc' }
  });
}

export async function createTaxRate(companyId: string, name: string, rate: number) {
  if (!name || !name.trim()) {
    throw new Error('Tax rate name is required');
  }
  const r = Number(rate) || 0;
  if (r < 0 || r > 100) {
    throw new Error('Rate must be between 0 and 100');
  }
  const existing = await prisma.taxRate.findFirst({ where: { companyId, rate: r } });
  if (existing) {
    throw new Error(`A "${r}%" tax rate already exists for this company`);
  }
  return await prisma.taxRate.create({
    data: { companyId, name: name.trim(), rate: r }
  });
}

interface GstSplit {
  taxable: number;
  gst: number;
  cgst: number;
  sgst: number;
  igst: number;
  byRate: { rate: number; taxable: number; gst: number }[];
}

function emptySplit(): GstSplit {
  return { taxable: 0, gst: 0, cgst: 0, sgst: 0, igst: 0, byRate: [] };
}

function addToSplit(split: GstSplit, taxable: number, gst: number, interstate: boolean) {
  split.taxable += taxable;
  split.gst += gst;
  if (interstate) split.igst += gst;
  else {
    split.cgst += gst / 2;
    split.sgst += gst / 2;
  }
}

function addToRateBreakdown(split: GstSplit, rate: number, taxable: number, gst: number) {
  const bucket = split.byRate.find((b) => b.rate === rate);
  if (bucket) {
    bucket.taxable += taxable;
    bucket.gst += gst;
  } else {
    split.byRate.push({ rate, taxable, gst });
  }
}

export async function getTaxSummary(companyId: string) {
  const [outbound, inbound] = await Promise.all([
    prisma.invoice.findMany({
      where: { companyId, status: { in: ['Sent', 'Paid', 'Overdue'] } },
      select: {
        taxableAmount: true,
        gstAmount: true,
        isInterState: true,
        items: { select: { gstRate: true, amount: true, gstAmount: true } },
      },
    }),
    prisma.bill.findMany({
      where: { companyId, status: { in: ['Unpaid', 'Paid', 'Overdue'] } },
      select: {
        taxableAmount: true,
        gstAmount: true,
        isInterState: true,
        items: { select: { gstRate: true, amount: true, gstAmount: true } },
      },
    }),
  ]);

  const output = emptySplit();
  const input = emptySplit();

  for (const inv of outbound) {
    addToSplit(
      output,
      Number(inv.taxableAmount) || 0,
      Number(inv.gstAmount) || 0,
      inv.isInterState
    );
    for (const line of inv.items) {
      addToRateBreakdown(
        output,
        Number(line.gstRate) || 0,
        Number(line.amount) || 0,
        Number(line.gstAmount) || 0
      );
    }
  }
  for (const bill of inbound) {
    addToSplit(
      input,
      Number(bill.taxableAmount) || 0,
      Number(bill.gstAmount) || 0,
      bill.isInterState
    );
    for (const line of bill.items) {
      addToRateBreakdown(
        input,
        Number(line.gstRate) || 0,
        Number(line.amount) || 0,
        Number(line.gstAmount) || 0
      );
    }
  }

  output.byRate.sort((a, b) => a.rate - b.rate);
  input.byRate.sort((a, b) => a.rate - b.rate);

  const netLiability = output.gst - input.gst;

  return {
    companyId,
    output,
    input,
    netLiability,
    computedAt: new Date().toISOString(),
  };
}