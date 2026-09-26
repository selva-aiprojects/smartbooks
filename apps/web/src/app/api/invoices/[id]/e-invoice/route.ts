import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../../../lib/server-auth';
import { processEInvoice } from '../../../../../lib/einvoice';
import { logAuditEvent } from '../../../../../lib/server-audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        customer: true,
        items: true,
        company: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.irn) {
      return NextResponse.json({
        message: 'e-Invoice IRN already generated for this invoice',
        irn: invoice.irn,
        ackNo: invoice.ackNo,
        ackDate: invoice.ackDate,
      });
    }

    const sellerGstin = invoice.company.gstin || '33AABCS1429B1ZB';
    const buyerGstin = (invoice.customer as any).gstin || '33AAACN8123C1Z8';
    const issueDateStr = new Date(invoice.issueDate).toISOString().split('T')[0];
    const mainHsn = invoice.items[0]?.hsnCode || '998313';

    // Calculate Indian Financial Year (e.g. 2026-27)
    const d = new Date(invoice.issueDate);
    const yr = d.getFullYear();
    const finYear = d.getMonth() >= 3 ? `${yr}-${String(yr + 1).slice(2)}` : `${yr - 1}-${String(yr).slice(2)}`;

    const eInvoiceResult = processEInvoice({
      sellerGstin,
      buyerGstin,
      docNo: invoice.number,
      docType: 'INV',
      docDate: issueDateStr,
      totInvVal: Number(invoice.totalAmount),
      itemCount: invoice.items.length || 1,
      mainHsnCode: mainHsn,
      financialYear: finYear,
    });

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        irn: eInvoiceResult.irn,
        ackNo: eInvoiceResult.ackNo,
        ackDate: new Date(eInvoiceResult.ackDate),
        signedQrCode: eInvoiceResult.signedQrCode,
      },
    });

    // Log to Audit Trail
    await logAuditEvent({
      companyId: user.companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'UPDATE',
      entityType: 'INVOICE',
      entityId: invoice.id,
      entityRef: invoice.number,
      details: `Generated official IRP e-Invoice IRN: ${eInvoiceResult.irn.slice(0, 16)}... (Ack #${eInvoiceResult.ackNo})`,
      newValues: {
        irn: eInvoiceResult.irn,
        ackNo: eInvoiceResult.ackNo,
        ackDate: eInvoiceResult.ackDate,
      },
    });

    return NextResponse.json({
      success: true,
      irn: eInvoiceResult.irn,
      ackNo: eInvoiceResult.ackNo,
      ackDate: eInvoiceResult.ackDate,
      signedQrCode: eInvoiceResult.signedQrCode,
      invoice: updated,
    });
  } catch (error: any) {
    console.error('e-Invoice generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate e-Invoice' }, { status: 500 });
  }
}
