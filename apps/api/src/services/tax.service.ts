import { prisma } from '../lib/prisma';

export async function getTaxRates(companyId: string, includeInactive = false) {
  return await prisma.taxRate.findMany({
    where: { companyId, ...(includeInactive ? {} : { active: true }) },
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

export async function updateTaxRate(
  id: string,
  companyId: string,
  data: { name?: string; rate?: number; active?: boolean }
) {
  const existing = await prisma.taxRate.findFirst({ where: { id, companyId } });
  if (!existing) {
    throw new Error('Tax rate not found or not in this company');
  }

  const update: { name?: string; rate?: number; active?: boolean } = {};
  if (data.name !== undefined) {
    if (!String(data.name).trim()) throw new Error('Tax rate name cannot be empty');
    update.name = String(data.name).trim();
  }
  if (data.rate !== undefined) {
    const r = Number(data.rate) || 0;
    if (r < 0 || r > 100) throw new Error('Rate must be between 0 and 100');
    const dup = await prisma.taxRate.findFirst({ where: { companyId, rate: r, id: { not: id } } });
    if (dup) throw new Error(`A "${r}%" tax rate already exists for this company`);
    update.rate = r;
  }
  if (data.active !== undefined) {
    update.active = !!data.active;
  }
  if (Object.keys(update).length === 0) {
    throw new Error('Nothing to update');
  }

  return await prisma.taxRate.update({ where: { id }, data: update });
}

const GSTR_DATE_FMT = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

function fmtGstrDate(d: Date) {
  return GSTR_DATE_FMT.format(d).replace(/\//g, '-');
}

export async function getGstR1(companyId: string, from: string, to: string) {
  const company = await prisma.company.findFirst({
    where: { id: companyId },
    select: { gstin: true, name: true },
  });

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId,
      status: { in: ['Sent', 'Paid', 'Overdue'] },
      issueDate: { gte: new Date(from), lte: new Date(to) },
    },
    include: { customer: true, items: true },
    orderBy: { issueDate: 'asc' },
  });

  const rows = invoices.map((inv) => {
    const taxable = Number(inv.taxableAmount) || 0;
    const gst = Number(inv.gstAmount) || 0;
    return {
      gstin: company?.gstin || '',
      receiverGstin: '',
      documentType: 'INV',
      invoiceNumber: inv.number,
      invoiceDate: fmtGstrDate(inv.issueDate),
      customerName: inv.customer.name,
      placeOfSupply: inv.isInterState ? '96' : 'In-State',
      taxable: Math.round(taxable * 100) / 100,
      cgst: Math.round((inv.isInterState ? 0 : gst / 2) * 100) / 100,
      sgst: Math.round((inv.isInterState ? 0 : gst / 2) * 100) / 100,
      igst: Math.round((inv.isInterState ? gst : 0) * 100) / 100,
      cess: 0,
      total: Math.round((taxable + gst) * 100) / 100,
    };
  });

  const totals = rows.reduce(
    (acc, r) => {
      acc.taxable += r.taxable;
      acc.cgst += r.cgst;
      acc.sgst += r.sgst;
      acc.igst += r.igst;
      acc.total += r.total;
      return acc;
    },
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
  );

  return { period: { from, to }, companyName: company?.name, rowCount: rows.length, rows, totals };
}

interface RateRow {
  rate: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

function aggregateRates(items: { gstRate: any; amount: any; gstAmount: any }[], interstate: boolean) {
  const map = new Map<number, RateRow>();
  for (const line of items) {
    const rate = Number(line.gstRate) || 0;
    if (rate === 0) continue;
    const taxable = Number(line.amount) || 0;
    const gst = Number(line.gstAmount) || 0;
    const row = map.get(rate) || { rate, taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
    row.taxable = Math.round((row.taxable + taxable) * 100) / 100;
    if (interstate) row.igst = Math.round((row.igst + gst) * 100) / 100;
    else {
      row.cgst = Math.round((row.cgst + gst / 2) * 100) / 100;
      row.sgst = Math.round((row.sgst + gst / 2) * 100) / 100;
    }
    row.totalTax = Math.round((row.totalTax + gst) * 100) / 100;
    map.set(rate, row);
  }
  return [...map.values()].sort((a, b) => a.rate - b.rate);
}

export async function getGstR3B(companyId: string, from: string, to: string) {
  const [invoices, bills] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ['Sent', 'Paid', 'Overdue'] },
        issueDate: { gte: new Date(from), lte: new Date(to) },
      },
      select: { isInterState: true, items: { select: { gstRate: true, amount: true, gstAmount: true } } },
    }),
    prisma.bill.findMany({
      where: {
        companyId,
        status: { in: ['Unpaid', 'Paid', 'Overdue'] },
        billDate: { gte: new Date(from), lte: new Date(to) },
      },
      select: { isInterState: true, items: { select: { gstRate: true, amount: true, gstAmount: true } } },
    }),
  ]);

  const outwardByRate = new Map<number, RateRow>();
  const itcByRate = new Map<number, RateRow>();

  for (const inv of invoices) {
    for (const row of aggregateRates(inv.items, inv.isInterState)) {
      const cur = outwardByRate.get(row.rate) || { rate: row.rate, taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
      cur.taxable = Math.round((cur.taxable + row.taxable) * 100) / 100;
      cur.cgst = Math.round((cur.cgst + row.cgst) * 100) / 100;
      cur.sgst = Math.round((cur.sgst + row.sgst) * 100) / 100;
      cur.igst = Math.round((cur.igst + row.igst) * 100) / 100;
      cur.totalTax = Math.round((cur.totalTax + row.totalTax) * 100) / 100;
      outwardByRate.set(row.rate, cur);
    }
  }
  for (const bill of bills) {
    for (const row of aggregateRates(bill.items, bill.isInterState)) {
      const cur = itcByRate.get(row.rate) || { rate: row.rate, taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
      cur.taxable = Math.round((cur.taxable + row.taxable) * 100) / 100;
      cur.cgst = Math.round((cur.cgst + row.cgst) * 100) / 100;
      cur.sgst = Math.round((cur.sgst + row.sgst) * 100) / 100;
      cur.igst = Math.round((cur.igst + row.igst) * 100) / 100;
      cur.totalTax = Math.round((cur.totalTax + row.totalTax) * 100) / 100;
      itcByRate.set(row.rate, cur);
    }
  }

  const outward = [...outwardByRate.values()];
  const itc = [...itcByRate.values()];

  const net: RateRow[] = [];
  const allRates = new Set([...outward.map((r) => r.rate), ...itc.map((r) => r.rate)]);
  for (const rate of [...allRates].sort((a, b) => a - b)) {
    const o = outward.find((r) => r.rate === rate);
    const i = itc.find((r) => r.rate === rate);
    net.push({
      rate,
      taxable: o?.taxable || 0,
      cgst: Math.round(((o?.cgst || 0) - (i?.cgst || 0)) * 100) / 100,
      sgst: Math.round(((o?.sgst || 0) - (i?.sgst || 0)) * 100) / 100,
      igst: Math.round(((o?.igst || 0) - (i?.igst || 0)) * 100) / 100,
      totalTax: Math.round(((o?.totalTax || 0) - (i?.totalTax || 0)) * 100) / 100,
    });
  }

  const sum = (arr: RateRow[], k: keyof RateRow) => Math.round(arr.reduce((s, r) => s + (Number(r[k]) || 0), 0) * 100) / 100;

  return {
    period: { from, to },
    outward,
    outwardTotals: { taxable: sum(outward, 'taxable'), cgst: sum(outward, 'cgst'), sgst: sum(outward, 'sgst'), igst: sum(outward, 'igst'), totalTax: sum(outward, 'totalTax') },
    itc,
    itcTotals: { cgst: sum(itc, 'cgst'), sgst: sum(itc, 'sgst'), igst: sum(itc, 'igst'), totalTax: sum(itc, 'totalTax') },
    net,
    netTotals: { cgst: sum(net, 'cgst'), sgst: sum(net, 'sgst'), igst: sum(net, 'igst'), totalTax: sum(net, 'totalTax') },
  };
}