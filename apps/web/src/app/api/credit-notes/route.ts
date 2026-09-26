import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/server-audit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteType = searchParams.get('type') || undefined;

    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json([]);
    }

    const notes = await prisma.creditNote.findMany({
      where: {
        companyId: company.id,
        ...(noteType ? { noteType } : {}),
      },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    if (notes.length === 0) {
      // Seed with initial realistic Section 34 demo notes
      return NextResponse.json([
        {
          id: 'cn-1',
          noteNumber: 'CN-2026-001',
          noteType: 'CREDIT',
          issueDate: new Date('2026-09-18').toISOString(),
          customerName: 'Acme Global Technologies',
          originalInvoiceNo: 'INV-2026-001',
          reason: '01-Sales Return',
          taxableAmount: 5000,
          gstRate: 18,
          gstAmount: 900,
          totalAmount: 5900,
          status: 'Issued',
          notes: 'Defective hardware modules returned by client',
        },
        {
          id: 'dn-1',
          noteNumber: 'DN-2026-001',
          noteType: 'DEBIT',
          issueDate: new Date('2026-09-14').toISOString(),
          customerName: 'Amazon Web Services India',
          originalInvoiceNo: 'AWS-IN-2026-84912',
          reason: '02-Post Sale Discount',
          taxableAmount: 2500,
          gstRate: 18,
          gstAmount: 450,
          totalAmount: 2950,
          status: 'Issued',
          notes: 'Credit memo discount adjustment on cloud compute bill',
        },
      ]);
    }

    return NextResponse.json(
      notes.map((n) => ({
        id: n.id,
        noteNumber: n.noteNumber,
        noteType: n.noteType,
        issueDate: n.issueDate.toISOString(),
        customerName: n.customer?.name || 'Customer',
        originalInvoiceNo: n.originalInvoiceNo,
        reason: n.reason,
        taxableAmount: Number(n.taxableAmount),
        gstRate: Number(n.gstRate),
        gstAmount: Number(n.gstAmount),
        totalAmount: Number(n.totalAmount),
        status: n.status,
        notes: n.notes,
      }))
    );
  } catch (error: any) {
    console.error('Error fetching credit notes:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch credit notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      noteType = 'CREDIT',
      customerName,
      originalInvoiceNo,
      reason = '01-Sales Return',
      amount,
      gstRate = 18,
      notes,
    } = body;

    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const totalAmt = Number(amount) || 0;
    const rate = Number(gstRate) || 18;
    const taxableAmt = Math.round((totalAmt / (1 + rate / 100)) * 100) / 100;
    const gstAmt = Math.round((totalAmt - taxableAmt) * 100) / 100;

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { name: customerName, companyId: company.id },
    });
    if (!customer && customerName) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          companyId: company.id,
        },
      });
    }

    const prefix = noteType === 'CREDIT' ? 'CN' : 'DN';
    const noteCount = await prisma.creditNote.count({ where: { companyId: company.id, noteType } });
    const noteNumber = `${prefix}-${new Date().getFullYear()}-${String(noteCount + 1).padStart(3, '0')}`;

    const creditNote = await prisma.creditNote.create({
      data: {
        companyId: company.id,
        customerId: customer?.id || null,
        noteNumber,
        noteType,
        issueDate: new Date(),
        reason,
        originalInvoiceNo: originalInvoiceNo || null,
        taxableAmount: taxableAmt,
        gstRate: rate,
        gstAmount: gstAmt,
        totalAmount: totalAmt,
        status: 'Issued',
        notes: notes || null,
      },
      include: { customer: true },
    });

    // Auto-post statutory audit log under MCA Rule 3(1)
    await logAuditEvent({
      companyId: company.id,
      action: 'CREATE',
      entityType: 'INVOICE',
      entityId: creditNote.id,
      entityRef: noteNumber,
      details: `Issued Section 34 ${noteType} Note #${noteNumber} for ${customerName} (₹${totalAmt}, Reason: ${reason})`,
      newValues: {
        noteNumber,
        noteType,
        totalAmount: totalAmt,
        taxableAmount: taxableAmt,
        gstAmount: gstAmt,
        originalInvoiceNo,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Section 34 ${noteType} Note #${noteNumber} generated and posted to statutory ledger!`,
      creditNote: {
        id: creditNote.id,
        noteNumber: creditNote.noteNumber,
        noteType: creditNote.noteType,
        issueDate: creditNote.issueDate.toISOString(),
        customerName: creditNote.customer?.name || customerName,
        originalInvoiceNo: creditNote.originalInvoiceNo,
        reason: creditNote.reason,
        taxableAmount: Number(creditNote.taxableAmount),
        gstRate: Number(creditNote.gstRate),
        gstAmount: Number(creditNote.gstAmount),
        totalAmount: Number(creditNote.totalAmount),
        status: creditNote.status,
        notes: creditNote.notes,
      },
    });
  } catch (error: any) {
    console.error('Error creating credit note:', error);
    return NextResponse.json({ error: error.message || 'Failed to create credit note' }, { status: 500 });
  }
}
