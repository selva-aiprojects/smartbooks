import crypto from 'crypto';

export interface EInvoicePayload {
  sellerGstin: string;
  buyerGstin: string;
  docNo: string;
  docType: 'INV' | 'CRN' | 'DBN';
  docDate: string; // DD/MM/YYYY or YYYY-MM-DD
  totInvVal: number;
  itemCount: number;
  mainHsnCode: string;
  financialYear: string;
}

export interface EInvoiceResult {
  irn: string;
  ackNo: string;
  ackDate: string;
  signedQrCode: string;
  status: 'ACT' | 'CNL';
}

/**
 * Computes official 64-character SHA-256 Invoice Reference Number (IRN)
 * Formula specified by GSTN / NIC: SHA256(SupplierGSTIN + FinYear + DocType + DocNo)
 */
export function generateIRN(payload: EInvoicePayload): string {
  const normalizedDocNo = payload.docNo.trim().toUpperCase();
  const rawString = `${payload.sellerGstin.trim().toUpperCase()}${payload.financialYear}${payload.docType}${normalizedDocNo}`;
  return crypto.createHash('sha256').update(rawString, 'utf8').digest('hex').toUpperCase();
}

/**
 * Generates B2B e-Invoice standard QR Code Data Payload
 */
export function generateSignedQrPayload(payload: EInvoicePayload, irn: string): string {
  const qrObject = {
    SellerGstin: payload.sellerGstin,
    BuyerGstin: payload.buyerGstin,
    DocNo: payload.docNo,
    DocTyp: payload.docType,
    DocDt: payload.docDate,
    TotInvVal: payload.totInvVal,
    ItemCnt: payload.itemCount,
    MainHsnCode: payload.mainHsnCode,
    Irn: irn,
  };
  return JSON.stringify(qrObject);
}

/**
 * Generates complete e-Invoice response simulated or connected to IRP (Invoice Registration Portal)
 */
export function processEInvoice(payload: EInvoicePayload): EInvoiceResult {
  const irn = generateIRN(payload);
  const ackNo = `11${Date.now().toString().slice(-13)}`;
  const ackDate = new Date().toISOString();
  const signedQrCode = generateSignedQrPayload(payload, irn);

  return {
    irn,
    ackNo,
    ackDate,
    signedQrCode,
    status: 'ACT',
  };
}
