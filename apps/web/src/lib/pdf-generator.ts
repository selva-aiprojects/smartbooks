import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to convert number to Indian currency words
export function numberToIndianWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  return inWords(n).trim() + ' Rupees Only';
}

export interface TaxInvoicePdfInput {
  company: {
    name: string;
    gstin?: string | null;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  customer: {
    name: string;
    gstin?: string | null;
    address?: string | null;
    state?: string | null;
  };
  invoice: {
    number: string;
    issueDate: string;
    dueDate?: string;
    isInterState?: boolean;
    taxableAmount: number;
    gstAmount: number;
    totalAmount: number;
    status: string;
    irn?: string | null;
    ackNo?: string | null;
    ackDate?: string | null;
    items: Array<{
      description: string;
      hsnCode?: string | null;
      quantity: number;
      unitPrice: number;
      amount: number;
      gstRate: number;
      gstAmount: number;
    }>;
  };
}

export function exportTaxInvoicePdf(data: TaxInvoicePdfInput) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageW, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoice.irn ? '(NIC e-Invoice Portal Verified)' : '(Issued under Section 31 of CGST Act, 2017)', 62, 16);
  doc.text('ORIGINAL FOR RECIPIENT', pageW - 60, 16);

  // e-Invoice IRN details bar if present
  let topOffset = 0;
  if (data.invoice.irn) {
    doc.setFillColor(243, 244, 246);
    doc.rect(14, 28, pageW - 28, 8, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('IRN:', 16, 33.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(data.invoice.irn, 26, 33.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(`Ack #${data.invoice.ackNo || '-'}`, pageW - 48, 33.5);
    topOffset = 10;
  }

  // Supplier Details (Left)
  let y = 35 + topOffset;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company.name || 'SmartBooks Enterprise Ltd.', 14, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  y += 5;
  if (data.company.address) {
    doc.text(data.company.address, 14, y);
    y += 4;
  }
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`GSTIN: ${data.company.gstin || '33AABCS1429B1ZB'}`, 14, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${data.company.email || 'billing@smartbooks.com'} | Tel: ${data.company.phone || '+91 98400 12345'}`, 14, y);

  // Invoice Details (Right Box)
  const rightX = pageW - 80;
  let ry = 35 + topOffset;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(rightX - 4, ry - 5, 70, 26, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No:`, rightX, ry);
  doc.setTextColor(2, 132, 199);
  doc.text(data.invoice.number, rightX + 26, ry);

  ry += 5;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Date:`, rightX, ry);
  doc.text(data.invoice.issueDate ? new Date(data.invoice.issueDate).toLocaleDateString('en-IN') : '-', rightX + 26, ry);

  ry += 5;
  doc.text(`Due Date:`, rightX, ry);
  doc.text(data.invoice.dueDate ? new Date(data.invoice.dueDate).toLocaleDateString('en-IN') : '-', rightX + 26, ry);

  ry += 5;
  doc.text(`Place of Supply:`, rightX, ry);
  doc.text(data.invoice.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)', rightX + 26, ry);

  // Bill To / Buyer Section
  y = Math.max(y + 8, 65);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, pageW - 28, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, pageW - 28, 22, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('BILLED TO (BUYER):', 18, y + 5);

  doc.setFontSize(10);
  doc.text(data.customer.name, 18, y + 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const custAddr = data.customer.address || 'Commercial Hub, Business District';
  doc.text(custAddr, 18, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`GSTIN / UIN: ${data.customer.gstin || '33AAACN8123C1Z8'}`, pageW - 90, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`State: ${data.customer.state || 'Tamil Nadu (33)'}`, pageW - 90, y + 16);

  // Line Items Table
  const tableRows = data.invoice.items.map((item, idx) => {
    const isInter = !!data.invoice.isInterState;
    const rate = Number(item.gstRate) || 0;
    const taxable = Number(item.amount) || (Number(item.quantity) * Number(item.unitPrice));
    const gst = Number(item.gstAmount) || (taxable * (rate / 100));

    return [
      idx + 1,
      item.description,
      item.hsnCode || '998313',
      item.quantity,
      `₹${Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `₹${taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      isInter ? '-' : `${rate / 2}%`,
      isInter ? '-' : `${rate / 2}%`,
      isInter ? `${rate}%` : '-',
      `₹${(taxable + gst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ];
  });

  autoTable(doc, {
    startY: y + 26,
    head: [[
      '#',
      'Description of Goods / Services',
      'HSN/SAC',
      'Qty',
      'Rate (₹)',
      'Taxable (₹)',
      'CGST',
      'SGST',
      'IGST',
      'Total (₹)'
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'right', cellWidth: 20 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'center', cellWidth: 14 },
      9: { halign: 'right', cellWidth: 24, fontStyle: 'bold' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 6;

  // Calculation & Summary Box
  const summaryX = pageW - 85;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Taxable Amount:', summaryX, finalY);
  doc.text(`₹${Number(data.invoice.taxableAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 14, finalY, { align: 'right' });

  finalY += 5;
  if (!data.invoice.isInterState) {
    const halfGst = (Number(data.invoice.gstAmount) || 0) / 2;
    doc.text('Output CGST:', summaryX, finalY);
    doc.text(`₹${halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 14, finalY, { align: 'right' });
    finalY += 5;
    doc.text('Output SGST:', summaryX, finalY);
    doc.text(`₹${halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 14, finalY, { align: 'right' });
  } else {
    doc.text('Output IGST:', summaryX, finalY);
    doc.text(`₹${Number(data.invoice.gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 14, finalY, { align: 'right' });
  }

  finalY += 6;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(summaryX, finalY - 2, pageW - 14, finalY - 2);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Total Invoice Value:', summaryX, finalY + 2);
  doc.setTextColor(2, 132, 199);
  doc.text(`₹${Number(data.invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 14, finalY + 2, { align: 'right' });

  // Amount in words
  finalY += 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, finalY, pageW - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Amount in Words: `, 18, finalY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(numberToIndianWords(Number(data.invoice.totalAmount)), 54, finalY + 5.5);

  // Bank Details & Signatures
  finalY += 14;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Bank & Remittance Details:', 14, finalY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  finalY += 4;
  doc.text('Bank Name: HDFC Bank Limited', 14, finalY);
  finalY += 4;
  doc.text('Account No: 50200084920192 (Current A/c)', 14, finalY);
  finalY += 4;
  doc.text('IFSC Code: HDFC0001234 | Branch: Anna Nagar, Chennai', 14, finalY);
  finalY += 4;
  doc.text('UPI ID: smartbooks@hdfcbank', 14, finalY);

  // Authorized Signatory Box (Right)
  const sigX = pageW - 65;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${data.company.name || 'SmartBooks Enterprise'}`, sigX, finalY - 12);
  doc.setDrawColor(203, 213, 225);
  doc.line(sigX, finalY + 6, sigX + 50, finalY + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory', sigX + 8, finalY + 11);

  // Save the PDF
  doc.save(`Tax_Invoice_${data.invoice.number}.pdf`);
}

export function exportAuditTrailPdf(data: {
  companyName: string;
  companyGstin: string;
  logs: any[];
}) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MCA COMPANIES ACT — STATUTORY AUDIT TRAIL', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageW - 70, 14);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Company: ${data.companyName}`, 14, 30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`GSTIN: ${data.companyGstin} | Compliance: Rule 3(1) Companies (Accounts) Rules, 2014`, 14, 35);

  const rows = data.logs.map((l, i) => [
    i + 1,
    new Date(l.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
    l.action,
    l.entityType,
    l.entityRef || '-',
    (l.details || '-').slice(0, 60),
    l.userName || l.userEmail || 'System',
    l.ipAddress || '127.0.0.1'
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['#', 'Timestamp', 'Action', 'Entity', 'Ref #', 'Description', 'Operator', 'IP']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
  });

  doc.save(`Statutory_Audit_Trail_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportReportPdf(options: {
  reportTitle: string;
  companyName: string;
  dateRange: string;
  sections: Array<{
    title: string;
    items: Array<{ code: string; name: string; amount: number }>;
    subtotal: number;
  }>;
  netTotal: { label: string; amount: number };
}) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(options.reportTitle.toUpperCase(), 14, 14);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(options.companyName, 14, 30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Period / As of: ${options.dateRange} | Currency: INR (₹)`, 14, 35);

  let currentY = 42;

  options.sections.forEach((sec) => {
    const tableBody = sec.items.map(it => [
      it.code,
      it.name,
      `₹${Number(it.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]);

    // Subtotal row
    tableBody.push([
      '',
      `Total ${sec.title}`,
      `₹${Number(sec.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [[`Code`, sec.title, 'Amount (₹)']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35, halign: 'right' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  });

  // Net Total Box
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageW - 28, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(options.netTotal.label, 18, currentY + 6.5);
  doc.setTextColor(2, 132, 199);
  doc.text(`₹${Number(options.netTotal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 18, currentY + 6.5, { align: 'right' });

  doc.save(`${options.reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportEWayBillPdf(ewb: {
  ewbNumber: string;
  ewbDate: string;
  validUpto: string;
  docNo: string;
  docDate: string;
  fromGstin: string;
  fromAddress: string;
  toGstin: string;
  toAddress: string;
  totalValue: number;
  transporterName?: string | null;
  transporterId?: string | null;
  vehicleNo?: string | null;
  transMode?: string | null;
  distanceKm: number;
}) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT OF INDIA — e-WAY BILL SLIP', 14, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Rule 138 of CGST Rules, 2017', pageW - 65, 14);

  // EWB Header Details
  let y = 32;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageW - 28, 16, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('e-Way Bill No:', 18, y + 6);
  doc.setTextColor(2, 132, 199);
  doc.text(ewb.ewbNumber, 48, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.text('Generated Date:', 100, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(ewb.ewbDate).toLocaleString('en-IN'), 130, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Valid Until:', 18, y + 12);
  doc.setTextColor(16, 185, 129);
  doc.text(new Date(ewb.validUpto).toLocaleString('en-IN'), 48, y + 12);

  // PART-A Table
  y += 24;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PART-A (Consignment Details)', 14, y);

  autoTable(doc, {
    startY: y + 4,
    body: [
      ['GSTIN of Supplier', ewb.fromGstin, 'Dispatch From Address', ewb.fromAddress],
      ['GSTIN of Recipient', ewb.toGstin, 'Delivery To Address', ewb.toAddress],
      ['Document No.', ewb.docNo, 'Document Date', new Date(ewb.docDate).toLocaleDateString('en-IN')],
      ['Total Invoice Value', `₹${Number(ewb.totalValue).toLocaleString('en-IN')}`, 'Approx Distance', `${ewb.distanceKm} KM`],
      ['HSN Code', '998313 / Standard Goods', 'Transaction Type', 'Regular Outward Supply']
    ],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] },
      3: { cellWidth: 47 }
    }
  });

  // PART-B Table
  const partBY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PART-B (Transportation Details)', 14, partBY);

  autoTable(doc, {
    startY: partBY + 4,
    head: [['Mode', 'Vehicle No / Doc No', 'From Location', 'Entered Date', 'Transporter Name & ID']],
    body: [
      [
        ewb.transMode || 'Road',
        ewb.vehicleNo || 'TN-09-CB-9842',
        ewb.fromAddress.split(',')[0],
        new Date(ewb.ewbDate).toLocaleDateString('en-IN'),
        `${ewb.transporterName || 'Direct Transport'} (${ewb.transporterId || 'Self'})`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.5 }
  });

  const finalNoteY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Note: This document is electronically generated under GST Rule 138 and does not require a physical signature.', 14, finalNoteY);

  doc.save(`eWayBill_${ewb.ewbNumber}.pdf`);
}

export function exportSalarySlipPdf(data: {
  companyName: string;
  companyGstin: string;
  employee: {
    name: string;
    employeeCode: string;
    designation: string;
    department: string;
    pan?: string | null;
    uan?: string | null;
    bankAccount?: string | null;
    bankIfsc?: string | null;
  };
  slip: {
    month: number;
    year: number;
    basicPay: number;
    hra: number;
    allowances: number;
    grossSalary: number;
    pfDeduction: number;
    esiDeduction: number;
    professionalTax: number;
    netSalary: number;
    paymentDate?: string | null;
  };
}) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = months[data.slip.month] || 'Month';

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`PAYSLIP FOR ${monthName.toUpperCase()} ${data.slip.year}`, 14, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('CONFIDENTIAL • EMPLOYEE COPY', pageW - 65, 14);

  // Company Details
  let y = 30;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName, 14, y);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`GSTIN: ${data.companyGstin} | Registered Office: Chennai, India`, 14, y + 5);

  // Employee Information Grid
  y += 12;
  autoTable(doc, {
    startY: y,
    body: [
      ['Employee Name', data.employee.name, 'Employee Code', data.employee.employeeCode],
      ['Designation', data.employee.designation, 'Department', data.employee.department],
      ['PAN Number', data.employee.pan || 'PANNOTAVBL', 'UAN (EPF)', data.employee.uan || '101294819201'],
      ['Bank Account', data.employee.bankAccount || '5010048192012', 'Bank IFSC', data.employee.bankIfsc || 'HDFC0001234']
    ],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, fillColor: [248, 250, 252] },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 35, fillColor: [248, 250, 252] },
      3: { cellWidth: 57 }
    }
  });

  // Earnings & Deductions Table
  const tableY = (doc as any).lastAutoTable.finalY + 8;
  const totalDeductions = Number(data.slip.pfDeduction) + Number(data.slip.esiDeduction) + Number(data.slip.professionalTax);

  autoTable(doc, {
    startY: tableY,
    head: [['Earnings', 'Amount (₹)', 'Deductions', 'Amount (₹)']],
    body: [
      ['Basic Salary', `₹${Number(data.slip.basicPay).toLocaleString('en-IN')}`, 'Provident Fund (EPF 12%)', `₹${Number(data.slip.pfDeduction).toLocaleString('en-IN')}`],
      ['House Rent Allowance (HRA)', `₹${Number(data.slip.hra).toLocaleString('en-IN')}`, 'Employee State Insurance (ESI)', `₹${Number(data.slip.esiDeduction).toLocaleString('en-IN')}`],
      ['Special Allowances', `₹${Number(data.slip.allowances).toLocaleString('en-IN')}`, 'Professional Tax (PT)', `₹${Number(data.slip.professionalTax).toLocaleString('en-IN')}`],
      ['Gross Earnings', `₹${Number(data.slip.grossSalary).toLocaleString('en-IN')}`, 'Total Deductions', `₹${Number(totalDeductions).toLocaleString('en-IN')}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Net Pay Box
  const netY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, netY, pageW - 28, 12, 'F');
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('NET SALARY PAYABLE (TAKE-HOME):', 18, netY + 8);
  doc.setTextColor(2, 132, 199);
  doc.text(`₹${Number(data.slip.netSalary).toLocaleString('en-IN')}`, pageW - 18, netY + 8, { align: 'right' });

  // In words
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Amount in Words: ${numberToIndianWords(Number(data.slip.netSalary))}`, 14, netY + 18);

  const signY = netY + 35;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, signY, 65, signY);
  doc.line(pageW - 65, signY, pageW - 14, signY);

  doc.setFontSize(8);
  doc.text('Employee Signature', 18, signY + 5);
  doc.text('Authorized Signatory', pageW - 55, signY + 5);

  doc.save(`Payslip_${data.employee.employeeCode}_${monthName}_${data.slip.year}.pdf`);
}

export interface CreditDebitNotePdfInput {
  company: {
    name: string;
    gstin?: string | null;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  customer: {
    name: string;
    gstin?: string | null;
    address?: string | null;
  };
  note: {
    noteNumber: string;
    noteType: 'CREDIT' | 'DEBIT' | string;
    issueDate: string;
    originalInvoiceNo?: string | null;
    reason: string;
    taxableAmount: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
    notes?: string | null;
  };
}

export function exportCreditDebitNotePdf(data: CreditDebitNotePdfInput) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const isCredit = data.note.noteType === 'CREDIT';
  const title = isCredit ? 'CREDIT NOTE (GST SECTION 34)' : 'DEBIT NOTE (GST SECTION 34)';
  const themeColor: [number, number, number] = isCredit ? [220, 38, 38] : [2, 132, 199];

  // Header band
  doc.setFillColor(...themeColor);
  doc.rect(0, 0, pageW, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageW / 2, 13, { align: 'center' });

  // Company Details
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company.name, 14, 30);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`GSTIN: ${data.company.gstin || '33AABCS1429B1ZB'}`, 14, 36);
  doc.text(`Address: ${data.company.address || 'HQ Tech Tower, OMR, Chennai, India'}`, 14, 41);
  doc.text(`Contact: ${data.company.email || 'billing@smartbooks.com'} · ${data.company.phone || '+91 98400 12345'}`, 14, 46);

  // Note Info Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageW - 85, 25, 71, 32, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Note #: ${data.note.noteNumber}`, pageW - 80, 32);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${data.note.issueDate}`, pageW - 80, 39);
  doc.text(`Original Inv #: ${data.note.originalInvoiceNo || 'N/A'}`, pageW - 80, 46);
  doc.text(`Reason: ${data.note.reason}`, pageW - 80, 53);

  // Recipient Box
  const billY = 62;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, billY, pageW - 28, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PARTY DETAILS / RECIPIENT', 18, billY + 5);

  doc.setFontSize(10);
  doc.text(data.customer.name, 18, billY + 14);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`GSTIN: ${data.customer.gstin || '33AAACN8123C1Z8'}`, 18, billY + 20);
  doc.text(`Address: ${data.customer.address || 'Client Corporate Office, India'}`, 18, billY + 25);

  // Adjustment Line Table
  const tableY = billY + 32;
  const isInterState = false;
  const cgst = isInterState ? 0 : data.note.gstAmount / 2;
  const sgst = isInterState ? 0 : data.note.gstAmount / 2;
  const igst = isInterState ? data.note.gstAmount : 0;

  autoTable(doc, {
    startY: tableY,
    head: [['Description / Reason for Adjustment', 'Taxable Value', 'GST Rate', 'CGST', 'SGST', 'IGST', 'Adjustment Total']],
    body: [
      [
        `${data.note.reason} (Ref Inv: ${data.note.originalInvoiceNo || 'N/A'})`,
        `₹${Number(data.note.taxableAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `${data.note.gstRate}%`,
        `₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `₹${igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `₹${Number(data.note.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: themeColor, textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Net Box
  const netY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, netY, pageW - 28, 12, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`TOTAL ${isCredit ? 'CREDIT' : 'DEBIT'} ADJUSTMENT:`, 18, netY + 8);
  doc.setTextColor(...themeColor);
  doc.text(`₹${Number(data.note.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 18, netY + 8, { align: 'right' });

  // In words
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Amount in Words: ${numberToIndianWords(Number(data.note.totalAmount))}`, 14, netY + 18);

  // Statutory Footer
  doc.text('Statutory Declaration: Issued in accordance with provisions of Section 34 of the CGST / SGST Act, 2017.', 14, netY + 28);
  doc.text('Authorized Signatory', pageW - 55, netY + 45);
  doc.line(pageW - 65, netY + 40, pageW - 14, netY + 40);

  doc.save(`${isCredit ? 'CreditNote' : 'DebitNote'}_${data.note.noteNumber}.pdf`);
}



