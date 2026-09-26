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
  doc.text('(Issued under Section 31 of CGST Act, 2017)', 62, 16);
  doc.text('ORIGINAL FOR RECIPIENT', pageW - 60, 16);

  // Supplier Details (Left)
  let y = 35;
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
  let ry = 35;
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
