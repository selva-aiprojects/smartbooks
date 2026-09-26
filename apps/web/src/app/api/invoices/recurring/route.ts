import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/server-audit';

// In-memory / dynamic store with rich initial recurring schedules
let recurringProfiles = [
  {
    id: 'rec-1',
    customerName: 'Acme Global Technologies',
    customerEmail: 'finance@acme.com',
    customerPhone: '+91 98401 22334',
    frequency: 'Monthly',
    billingDay: 1,
    amount: 45000,
    taxableAmount: 38135.59,
    gstAmount: 6864.41,
    description: 'Enterprise Cloud ERP Retainer & Maintenance',
    startDate: '2026-04-01',
    nextRunDate: '2026-10-01',
    status: 'Active',
    invoicesGenerated: 6,
    autoEmail: true,
  },
  {
    id: 'rec-2',
    customerName: 'Vertex Digital Solutions',
    customerEmail: 'billing@vertex.io',
    customerPhone: '+91 99402 33445',
    frequency: 'Monthly',
    billingDay: 15,
    amount: 30000,
    taxableAmount: 25423.73,
    gstAmount: 4576.27,
    description: 'Statutory Compliance & GST Retainer',
    startDate: '2026-06-15',
    nextRunDate: '2026-10-15',
    status: 'Active',
    invoicesGenerated: 4,
    autoEmail: true,
  },
  {
    id: 'rec-3',
    customerName: 'Reliance Retail Ltd',
    customerEmail: 'vendor.invoices@reliance.com',
    customerPhone: '+91 98840 55667',
    frequency: 'Quarterly',
    billingDay: 1,
    amount: 150000,
    taxableAmount: 127118.64,
    gstAmount: 22881.36,
    description: 'Quarterly Financial Advisory & Statutory Audit Support',
    startDate: '2026-01-01',
    nextRunDate: '2026-10-01',
    status: 'Active',
    invoicesGenerated: 3,
    autoEmail: false,
  },
];

export async function GET() {
  try {
    const totalMRR = recurringProfiles
      .filter((p) => p.status === 'Active')
      .reduce((sum, p) => sum + (p.frequency === 'Quarterly' ? p.amount / 3 : p.amount), 0);

    return NextResponse.json({
      profiles: recurringProfiles,
      metrics: {
        totalProfiles: recurringProfiles.length,
        activeRetainers: recurringProfiles.filter((p) => p.status === 'Active').length,
        monthlyRecurringRevenue: Math.round(totalMRR),
        nextBatchDate: '2026-10-01',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch recurring profiles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, profileId, newProfile } = body;

    const company = await prisma.company.findFirst();
    const companyId = company?.id || 'company-nexus';

    // 1. Create New Recurring Profile
    if (newProfile) {
      const amt = Number(newProfile.amount) || 10000;
      const taxable = Math.round((amt / 1.18) * 100) / 100;
      const gst = Math.round((amt - taxable) * 100) / 100;

      const profile = {
        id: `rec-${Date.now()}`,
        customerName: newProfile.customerName,
        customerEmail: newProfile.customerEmail || 'accounts@client.com',
        customerPhone: newProfile.customerPhone || '+91 98400 12345',
        frequency: newProfile.frequency || 'Monthly',
        billingDay: Number(newProfile.billingDay) || 1,
        amount: amt,
        taxableAmount: taxable,
        gstAmount: gst,
        description: newProfile.description || 'Monthly Professional Services Retainer',
        startDate: new Date().toISOString().split('T')[0],
        nextRunDate: newProfile.nextRunDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'Active',
        invoicesGenerated: 0,
        autoEmail: !!newProfile.autoEmail,
      };

      recurringProfiles.push(profile);

      await logAuditEvent({
        companyId,
        action: 'CREATE',
        entityType: 'INVOICE',
        entityId: profile.id,
        entityRef: `RECURRING_${profile.customerName}`,
        details: `Created recurring subscription profile for ${profile.customerName} (₹${amt} / ${profile.frequency})`,
      });

      return NextResponse.json({ success: true, profile });
    }

    // 2. Trigger "Run Now" for a specific profile (or batch)
    if (action === 'RUN_NOW' && profileId) {
      const profile = recurringProfiles.find((p) => p.id === profileId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      // Check or create customer in Prisma
      let customer = await prisma.customer.findFirst({
        where: { name: profile.customerName },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: profile.customerName,
            email: profile.customerEmail,
            phone: profile.customerPhone,
            companyId,
          },
        });
      }

      const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Create actual Invoice record in PostgreSQL database
      const createdInvoice = await prisma.invoice.create({
        data: {
          number: invNumber,
          companyId,
          customerId: customer.id,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 15 * 86400000),
          status: 'Sent',
          taxableAmount: profile.taxableAmount,
          gstAmount: profile.gstAmount,
          totalAmount: profile.amount,
          items: {
            create: [
              {
                description: `${profile.description} (Cycle: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})`,
                quantity: 1,
                unitPrice: profile.taxableAmount,
                amount: profile.taxableAmount,
              },
            ],
          },
        },
      });

      // Advance next run date
      profile.invoicesGenerated += 1;
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + (profile.frequency === 'Quarterly' ? 3 : 1));
      profile.nextRunDate = nextDate.toISOString().split('T')[0];

      await logAuditEvent({
        companyId,
        action: 'CREATE',
        entityType: 'INVOICE',
        entityId: createdInvoice.id,
        entityRef: invNumber,
        details: `Auto-generated recurring retainer invoice #${invNumber} for ${profile.customerName} (₹${profile.amount})`,
        newValues: {
          invoiceId: createdInvoice.id,
          number: invNumber,
          amount: profile.amount,
          generatedVia: 'Recurring Engine Cron',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully generated Tax Invoice #${invNumber} for ${profile.customerName}!`,
        invoice: createdInvoice,
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in recurring invoices API:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
