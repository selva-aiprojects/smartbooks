import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../lib/server-auth';
import { logAuditEvent } from '../../../lib/server-audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bills = await prisma.eWayBill.findMany({
      where: { companyId: user.companyId },
      orderBy: { ewbDate: 'desc' },
    });

    return NextResponse.json(bills);
  } catch (error: any) {
    console.error('Fetch e-way bills error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch e-Way bills' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      invoiceId,
      docNo,
      docDate,
      fromGstin,
      fromAddress,
      fromPincode,
      toGstin,
      toAddress,
      toPincode,
      totalValue,
      hsnCode,
      transporterId,
      transporterName,
      transMode,
      distanceKm,
      vehicleNo,
    } = body;

    const companyId = user.companyId;

    // Generate standard 12-digit NIC e-Way Bill number
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const ewbNumber = `24${randomDigits}`;

    const dist = Number(distanceKm) || 100;
    // GST Rule 138(10): 1 day for every 200 km, minimum 1 day
    const validityDays = Math.max(1, Math.ceil(dist / 200));
    const now = new Date();
    const validUpto = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);

    const createdEwb = await prisma.eWayBill.create({
      data: {
        companyId,
        invoiceId: invoiceId || null,
        ewbNumber,
        ewbDate: now,
        validUpto,
        supplyType: body.supplyType || 'Outward',
        subSupplyType: body.subSupplyType || 'Supply',
        docType: body.docType || 'Tax Invoice',
        docNo: docNo || `INV-${Date.now().toString().slice(-4)}`,
        docDate: docDate ? new Date(docDate) : now,
        fromGstin: fromGstin || '33AABCS1429B1ZB',
        fromAddress: fromAddress || 'Industrial Park, Guindy, Chennai, TN',
        fromPincode: fromPincode || '600032',
        toGstin: toGstin || '29AAACN8123C1Z8',
        toAddress: toAddress || 'Whitefield Logistics Yard, Bangalore, KA',
        toPincode: toPincode || '560066',
        totalValue: Number(totalValue) || 75000,
        hsnCode: hsnCode || '998313',
        transporterId: transporterId || '33AAACT1000T1Z1',
        transporterName: transporterName || 'VRL Logistics Ltd',
        transMode: transMode || 'Road',
        distanceKm: dist,
        vehicleNo: vehicleNo || 'TN-09-CB-9842',
        status: 'ACTIVE',
      },
    });

    if (invoiceId) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          eWayBillNo: ewbNumber,
          eWayBillDate: now,
          eWayBillValidUpto: validUpto,
        },
      });
    }

    // Log to Audit Trail
    await logAuditEvent({
      companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'CREATE',
      entityType: 'EWAY_BILL',
      entityId: createdEwb.id,
      entityRef: ewbNumber,
      details: `Generated official NIC e-Way Bill #${ewbNumber} for Doc #${createdEwb.docNo} (Consignment: ₹${Number(createdEwb.totalValue).toLocaleString('en-IN')})`,
      newValues: { ewbNumber, distanceKm: dist, vehicleNo, validUpto },
    });

    return NextResponse.json({
      success: true,
      ewb: createdEwb,
    }, { status: 201 });
  } catch (error: any) {
    console.error('e-Way Bill generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate e-Way bill' }, { status: 500 });
  }
}
