export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

export interface TenantCompany {
  id: string;
  name: string;
  subdomain: string;
  gstin?: string;
  currency: string;
  plan: string;
}

export interface MobileInvoice {
  id: string;
  number: string;
  customerName: string;
  customerPhone?: string;
  issueDate: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  irn?: string | null;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    gstRate: number;
  }>;
}

export interface DashboardMetrics {
  todaysCollections: number;
  gstDue: number;
  cashPosition: number;
  receivables: number;
  payables: number;
  netProfit: number;
  topCustomers: Array<{ name: string; amount: number }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
