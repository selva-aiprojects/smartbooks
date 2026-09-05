'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type TenantRole = 'Owner' | 'Tenant Admin' | 'Finance Manager' | 'Accountant' | 'Inventory Manager' | 'Cashier';

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: TenantRole;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface TenantMetrics {
  todaysCollections: number;
  collectionsGrowth: number;
  gstDue: number;
  gstDueDate: string;
  outputGst: number;
  inputTaxCredit: number;
  cashPosition: number;
  bankAccounts: { name: string; balance: number; type: string }[];
  upcomingPayments: number;
  upcomingPaymentsCount: number;
  receivables: number;
  receivablesAging: { bracket: string; amount: number }[];
  payables: number;
  payablesAging: { bracket: string; amount: number }[];
  burnRate: number;
  cashRunwayMonths: number;
  topCustomers: { id: string; name: string; invoices: number; revenue: number; status: string }[];
  aiAlerts: { type: 'warning' | 'info' | 'success'; message: string }[];
}

export interface TenantEntity {
  id: string;
  name: string;
  displayName: string;
  entityType: 'entity' | 'parent';
  parentId?: string;
  currency: string;
  metrics?: Partial<TenantMetrics>;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  schema: string;
  edition: string;
  gstin: string;
  currency: string;
  plan: 'starter' | 'growth' | 'enterprise';
  seatLimit?: number;
  billingCycle?: 'Monthly' | 'Annual';
  nextBillingDate?: string;
  subscriptionStatus?: 'Active' | 'Past Due' | 'Trial';
  metrics: TenantMetrics;
  users: TenantUser[];
  entities?: TenantEntity[];
}

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-acme',
    name: 'Acme Global Tech Pvt Ltd',
    subdomain: 'acme-tech',
    schema: 'tenant_acme_tech',
    edition: 'Services & Tech Edition',
    gstin: '27AAACA12341Z1',
    currency: '₹',
    plan: 'enterprise',
    seatLimit: 50,
    billingCycle: 'Annual',
    nextBillingDate: '2027-01-10',
    subscriptionStatus: 'Active',
    users: [
      { id: 'u-101', name: 'Vikram Mehta', email: 'owner@acme.com', role: 'Owner', status: 'Active', createdAt: '2026-01-10', lastLogin: '10 mins ago' },
      { id: 'u-102', name: 'Ananya Sharma', email: 'admin@acme.com', role: 'Tenant Admin', status: 'Active', createdAt: '2026-01-12', lastLogin: '1 hour ago' },
      { id: 'u-103', name: 'Rajesh Kumar', email: 'fm@acme.com', role: 'Finance Manager', status: 'Active', createdAt: '2026-02-01', lastLogin: 'Yesterday' },
      { id: 'u-104', name: 'Sanjay Patel', email: 'accountant@acme.com', role: 'Accountant', status: 'Active', createdAt: '2026-03-15', lastLogin: '3 hours ago' },
      { id: 'u-105', name: 'Kavita Singh', email: 'inventory@acme.com', role: 'Inventory Manager', status: 'Active', createdAt: '2026-04-10', lastLogin: '2 days ago' }
    ],
    metrics: {
      todaysCollections: 145000,
      collectionsGrowth: 24,
      gstDue: 48250,
      gstDueDate: '20th Aug 2026',
      outputGst: 82500,
      inputTaxCredit: 34250,
      cashPosition: 1485000,
      bankAccounts: [
        { name: 'HDFC Corporate Operating', balance: 950000, type: 'Checking' },
        { name: 'ICICI Reserve Sweep Account', balance: 485000, type: 'Savings' },
        { name: 'Petty Cash Office Register', balance: 50000, type: 'Cash' }
      ],
      upcomingPayments: 183500,
      upcomingPaymentsCount: 3,
      receivables: 580000,
      receivablesAging: [
        { bracket: '0 - 30 Days', amount: 320000 },
        { bracket: '31 - 60 Days', amount: 150000 },
        { bracket: '61 - 90 Days', amount: 70000 },
        { bracket: '> 90 Days', amount: 40000 }
      ],
      payables: 340000,
      payablesAging: [
        { bracket: '0 - 30 Days', amount: 210000 },
        { bracket: '31 - 60 Days', amount: 90000 },
        { bracket: '61 - 90 Days', amount: 30000 },
        { bracket: '> 90 Days', amount: 10000 }
      ],
      burnRate: 185000,
      cashRunwayMonths: 18.5,
      topCustomers: [
        { id: '1', name: 'Google Cloud India', invoices: 14, revenue: 1850000, status: 'Active' },
        { id: '2', name: 'Infosys Technologies', invoices: 9, revenue: 1240000, status: 'Active' },
        { id: '3', name: 'Wipro Digital', invoices: 7, revenue: 890000, status: 'Active' },
        { id: '4', name: 'TCS Global Services', invoices: 6, revenue: 650000, status: 'Active' },
        { id: '5', name: 'Cognizant India', invoices: 4, revenue: 420000, status: 'Active' }
      ],
      aiAlerts: [
        { type: 'warning', message: '⚠️ Alert: Electricity & Utilities expense increased 24% this month (₹42,500 vs 3-month avg ₹34,200). ₹18,400 unclaimed GST Input Credit detected.' },
        { type: 'info', message: '💡 Cashflow Insight: Customer "Google Cloud India" has ₹3,20,000 due in 5 days. Eligible for 2% early settlement discount.' }
      ]
    }
  },
  {
    id: 'tenant-nexus',
    name: 'Nexus Retail & Supermarkets',
    subdomain: 'nexus-retail',
    schema: 'tenant_nexus_retail',
    edition: 'Retail POS Edition',
    gstin: '29BBBBN56782Z2',
    currency: '₹',
    plan: 'growth',
    seatLimit: 15,
    billingCycle: 'Annual',
    nextBillingDate: '2027-02-01',
    subscriptionStatus: 'Active',
    users: [
      { id: 'u-201', name: 'Priya Nair', email: 'owner@nexusretail.com', role: 'Owner', status: 'Active', createdAt: '2026-02-01', lastLogin: '5 mins ago' },
      { id: 'u-202', name: 'Rahul Deshmukh', email: 'admin@nexusretail.com', role: 'Tenant Admin', status: 'Active', createdAt: '2026-02-05', lastLogin: '30 mins ago' },
      { id: 'u-203', name: 'Amitabh Sen', email: 'cashier1@nexusretail.com', role: 'Cashier', status: 'Active', createdAt: '2026-03-01', lastLogin: 'Just now' },
      { id: 'u-204', name: 'Pooja Verma', email: 'cashier2@nexusretail.com', role: 'Cashier', status: 'Active', createdAt: '2026-03-02', lastLogin: '2 hours ago' },
      { id: 'u-205', name: 'Sunil Rao', email: 'inventory@nexusretail.com', role: 'Inventory Manager', status: 'Active', createdAt: '2026-03-10', lastLogin: 'Yesterday' }
    ],
    metrics: {
      todaysCollections: 392000,
      collectionsGrowth: 18,
      gstDue: 112000,
      gstDueDate: '20th Aug 2026',
      outputGst: 185000,
      inputTaxCredit: 73000,
      cashPosition: 4210000,
      bankAccounts: [
        { name: 'Axis Store Operating Account', balance: 2850000, type: 'Checking' },
        { name: 'SBI Merchant Settlement Account', balance: 1260000, type: 'Checking' },
        { name: 'Branch POS Drawer Registers', balance: 100000, type: 'Cash' }
      ],
      upcomingPayments: 490000,
      upcomingPaymentsCount: 8,
      receivables: 120000,
      receivablesAging: [
        { bracket: '0 - 30 Days', amount: 95000 },
        { bracket: '31 - 60 Days', amount: 20000 },
        { bracket: '61 - 90 Days', amount: 5000 },
        { bracket: '> 90 Days', amount: 0 }
      ],
      payables: 890000,
      payablesAging: [
        { bracket: '0 - 30 Days', amount: 540000 },
        { bracket: '31 - 60 Days', amount: 250000 },
        { bracket: '61 - 90 Days', amount: 80000 },
        { bracket: '> 90 Days', amount: 20000 }
      ],
      burnRate: 420000,
      cashRunwayMonths: 14.2,
      topCustomers: [
        { id: '1', name: 'Metro Cash & Carry', invoices: 42, revenue: 3450000, status: 'Active' },
        { id: '2', name: 'Reliance Retail Direct', invoices: 38, revenue: 2980000, status: 'Active' },
        { id: '3', name: 'D-Mart Distribution', invoices: 29, revenue: 2150000, status: 'Active' },
        { id: '4', name: 'HyperCITY Stores', invoices: 19, revenue: 1420000, status: 'Active' },
        { id: '5', name: 'More Megastore', invoices: 12, revenue: 980000, status: 'Active' }
      ],
      aiAlerts: [
        { type: 'warning', message: '🚨 Fast-Moving Stock Alert: Organic Rice 5kg inventory low (12 units remaining). Auto-drafted PO #8841 to supplier.' },
        { type: 'info', message: '📊 Weekend Trend: POS weekend sales volume surged 31% across Branch #2 (Indiranagar).' }
      ]
    }
  },
  {
    id: 'tenant-vanguard',
    name: 'Vanguard Manufacturing Ltd',
    subdomain: 'vanguard-mfg',
    schema: 'tenant_vanguard_mfg',
    edition: 'Manufacturing MRP Edition',
    gstin: '07CCCCM91013Z3',
    currency: '₹',
    plan: 'enterprise',
    users: [
      { id: 'u-301', name: 'Deepak Joshi', email: 'owner@vanguardmfg.com', role: 'Owner', status: 'Active', createdAt: '2025-11-01', lastLogin: '1 hour ago' },
      { id: 'u-302', name: 'Manish Pandey', email: 'admin@vanguardmfg.com', role: 'Tenant Admin', status: 'Active', createdAt: '2025-11-05', lastLogin: '4 hours ago' },
      { id: 'u-303', name: 'Shruti Gupta', email: 'fm@vanguardmfg.com', role: 'Finance Manager', status: 'Active', createdAt: '2025-12-01', lastLogin: 'Yesterday' },
      { id: 'u-304', name: 'Rohan Kulkarni', email: 'inventory@vanguardmfg.com', role: 'Inventory Manager', status: 'Active', createdAt: '2026-01-15', lastLogin: 'Today' }
    ],
    metrics: {
      todaysCollections: 840000,
      collectionsGrowth: 32,
      gstDue: 245000,
      gstDueDate: '20th Aug 2026',
      outputGst: 420000,
      inputTaxCredit: 175000,
      cashPosition: 8850000,
      bankAccounts: [
        { name: 'ICICI Industrial Corporate Account', balance: 5400000, type: 'Checking' },
        { name: 'Kotak Fixed Treasury Account', balance: 3350000, type: 'Savings' },
        { name: 'Factory Floor Cash Reserve', balance: 100000, type: 'Cash' }
      ],
      upcomingPayments: 1250000,
      upcomingPaymentsCount: 5,
      receivables: 2450000,
      receivablesAging: [
        { bracket: '0 - 30 Days', amount: 1400000 },
        { bracket: '31 - 60 Days', amount: 650000 },
        { bracket: '61 - 90 Days', amount: 300000 },
        { bracket: '> 90 Days', amount: 100000 }
      ],
      payables: 1820000,
      payablesAging: [
        { bracket: '0 - 30 Days', amount: 1100000 },
        { bracket: '31 - 60 Days', amount: 480000 },
        { bracket: '61 - 90 Days', amount: 180000 },
        { bracket: '> 90 Days', amount: 60000 }
      ],
      burnRate: 1250000,
      cashRunwayMonths: 22.0,
      topCustomers: [
        { id: '1', name: 'Tata Motors Assembly', invoices: 18, revenue: 7850000, status: 'Active' },
        { id: '2', name: 'Mahindra & Mahindra', invoices: 14, revenue: 5420000, status: 'Active' },
        { id: '3', name: 'Bharat Forge Ltd', invoices: 11, revenue: 3950000, status: 'Active' },
        { id: '4', name: 'Larsen & Toubro Heavy', invoices: 8, revenue: 2840000, status: 'Active' },
        { id: '5', name: 'Ashok Leyland Motors', invoices: 6, revenue: 1950000, status: 'Active' }
      ],
      aiAlerts: [
        { type: 'warning', message: '⚙️ Raw Material Anomaly: Steel Coil Sheet raw material prices increased 8.5% across 2 vendor quotes.' },
        { type: 'success', message: '✅ WIP Assembly Costing: Job Order #4412 completed 3.2% under budget estimate.' }
      ]
    }
  },
  {
    id: 'tenant-apex',
    name: 'Apex Healthcare & Diagnostics',
    subdomain: 'apex-health',
    schema: 'tenant_apex_health',
    edition: 'Healthcare & Hospital Edition',
    gstin: '33DDDDH43214Z4',
    currency: '₹',
    plan: 'growth',
    users: [
      { id: 'u-401', name: 'Dr. Suresh Reddy', email: 'owner@apexhealth.com', role: 'Owner', status: 'Active', createdAt: '2026-02-10', lastLogin: '2 hours ago' },
      { id: 'u-402', name: 'Meena Saxena', email: 'admin@apexhealth.com', role: 'Tenant Admin', status: 'Active', createdAt: '2026-02-12', lastLogin: '1 day ago' },
      { id: 'u-403', name: 'Ganesh Iyer', email: 'accountant@apexhealth.com', role: 'Accountant', status: 'Active', createdAt: '2026-03-01', lastLogin: '3 hours ago' }
    ],
    metrics: {
      todaysCollections: 215000,
      collectionsGrowth: 15,
      gstDue: 68000,
      gstDueDate: '20th Aug 2026',
      outputGst: 105000,
      inputTaxCredit: 37000,
      cashPosition: 2840000,
      bankAccounts: [
        { name: 'HDFC Healthcare Trust Account', balance: 1950000, type: 'Checking' },
        { name: 'Canara Pharmacy Operating Account', balance: 840000, type: 'Checking' },
        { name: 'Emergency Counter Registers', balance: 50000, type: 'Cash' }
      ],
      upcomingPayments: 310000,
      upcomingPaymentsCount: 4,
      receivables: 980000,
      receivablesAging: [
        { bracket: '0 - 30 Days', amount: 520000 },
        { bracket: '31 - 60 Days', amount: 280000 },
        { bracket: '61 - 90 Days', amount: 140000 },
        { bracket: '> 90 Days', amount: 40000 }
      ],
      payables: 410000,
      payablesAging: [
        { bracket: '0 - 30 Days', amount: 260000 },
        { bracket: '31 - 60 Days', amount: 110000 },
        { bracket: '61 - 90 Days', amount: 30000 },
        { bracket: '> 90 Days', amount: 10000 }
      ],
      burnRate: 310000,
      cashRunwayMonths: 16.8,
      topCustomers: [
        { id: '1', name: 'Star Health Insurance TPA', invoices: 85, revenue: 2450000, status: 'Active' },
        { id: '2', name: 'ICICI Lombard Health TPA', invoices: 64, revenue: 1840000, status: 'Active' },
        { id: '3', name: 'Max Bupa Insurance', invoices: 48, revenue: 1350000, status: 'Active' },
        { id: '4', name: 'HDFC ERGO Health', invoices: 32, revenue: 940000, status: 'Active' },
        { id: '5', name: 'New India Assurance', invoices: 22, revenue: 680000, status: 'Active' }
      ],
      aiAlerts: [
        { type: 'warning', message: '💊 Pharmacy Expiry Audit: 14 batches of antibiotics expire in 30 days. Auto-notified Head Pharmacist.' },
        { type: 'info', message: '🏥 TPA Claim Audit: ₹1,80,000 in Star Health TPA claims cleared and deposited.' }
      ]
    }
  },
  {
    id: 'tenant-flavors',
    name: 'Flavors Restaurant & Hospitality',
    subdomain: 'flavors-fnb',
    schema: 'tenant_flavors_fnb',
    edition: 'Restaurant F&B Edition',
    gstin: '19EEEEF87655Z5',
    currency: '₹',
    plan: 'starter',
    users: [
      { id: 'u-501', name: 'Chef Gordon Das', email: 'owner@flavorsfnb.com', role: 'Owner', status: 'Active', createdAt: '2026-03-01', lastLogin: '10 mins ago' },
      { id: 'u-502', name: 'Arjun Kapoor', email: 'cashier@flavorsfnb.com', role: 'Cashier', status: 'Active', createdAt: '2026-03-05', lastLogin: 'Just now' }
    ],
    metrics: {
      todaysCollections: 98000,
      collectionsGrowth: 22,
      gstDue: 22500,
      gstDueDate: '20th Aug 2026',
      outputGst: 38000,
      inputTaxCredit: 15500,
      cashPosition: 960000,
      bankAccounts: [
        { name: 'HDFC F&B Operating Account', balance: 680000, type: 'Checking' },
        { name: 'Paytm Merchant Settlement', balance: 230000, type: 'Checking' },
        { name: 'Restaurant Cash Counter Register', balance: 50000, type: 'Cash' }
      ],
      upcomingPayments: 145000,
      upcomingPaymentsCount: 6,
      receivables: 45000,
      receivablesAging: [
        { bracket: '0 - 30 Days', amount: 40000 },
        { bracket: '31 - 60 Days', amount: 5000 },
        { bracket: '61 - 90 Days', amount: 0 },
        { bracket: '> 90 Days', amount: 0 }
      ],
      payables: 185000,
      payablesAging: [
        { bracket: '0 - 30 Days', amount: 120000 },
        { bracket: '31 - 60 Days', amount: 45000 },
        { bracket: '61 - 90 Days', amount: 15000 },
        { bracket: '> 90 Days', amount: 5000 }
      ],
      burnRate: 110000,
      cashRunwayMonths: 11.5,
      topCustomers: [
        { id: '1', name: 'Swiggy Corporate Payouts', invoices: 120, revenue: 1420000, status: 'Active' },
        { id: '2', name: 'Zomato Direct Online', invoices: 105, revenue: 1280000, status: 'Active' },
        { id: '3', name: 'Corporate Catering Clients', invoices: 18, revenue: 650000, status: 'Active' },
        { id: '4', name: 'Dine-In Table Cash Register', invoices: 450, revenue: 480000, status: 'Active' },
        { id: '5', name: 'Private Event Bookings', invoices: 6, revenue: 240000, status: 'Active' }
      ],
      aiAlerts: [
        { type: 'warning', message: '🍽️ Food Cost Variance: Dairy & Cheese supplier invoice rose 6.4% above standard recipe cost model.' },
        { type: 'success', message: '✅ Zomato Payout Reconciled: ₹84,200 payout matched perfectly with Kitchen KDT logs.' }
      ]
    }
  },
  {
    id: 'tenant-xyz-corp',
    name: 'XYZ Corporation',
    subdomain: 'xyz-corp',
    schema: 'tenant_xyz_corp',
    edition: 'Enterprise Leather Exports Edition',
    gstin: '33AAACX9876E1Z5',
    currency: '₹',
    plan: 'enterprise',
    seatLimit: 100,
    billingCycle: 'Annual',
    nextBillingDate: '2027-03-15',
    subscriptionStatus: 'Active',
    entities: [
      {
        id: 'entity-xyz-shipment',
        name: 'XYZ Shipment Ltd',
        displayName: 'XYZ Shipment Ltd – Export Logistics',
        entityType: 'entity',
        parentId: 'tenant-xyz-corp',
        currency: '₹',
      },
      {
        id: 'entity-xyz-warehouses',
        name: 'XYZ Warehouses Ltd',
        displayName: 'XYZ Warehouses Ltd – Storage & Distribution',
        entityType: 'entity',
        parentId: 'tenant-xyz-corp',
        currency: '₹',
      },
    ],
    users: [
      { id: 'u-xyz-001', name: 'Arjun Kapoor', email: 'arjun.kapoor@xyzcorp.in', role: 'Owner', status: 'Active', createdAt: '2023-01-10', lastLogin: '5 mins ago' },
      { id: 'u-xyz-002', name: 'Deepa Rajan', email: 'deepa.rajan@xyzcorp.in', role: 'Tenant Admin', status: 'Active', createdAt: '2023-01-12', lastLogin: '30 mins ago' },
      { id: 'u-xyz-003', name: 'Vikram Iyer', email: 'vikram.iyer@xyzcorp.in', role: 'Finance Manager', status: 'Active', createdAt: '2023-02-01', lastLogin: '2 hours ago' },
      { id: 'u-xyz-004', name: 'Priya Menon', email: 'priya.menon@xyzcorp.in', role: 'Accountant', status: 'Active', createdAt: '2023-03-15', lastLogin: '1 hour ago' },
      { id: 'u-xyz-005', name: 'Sanjay Gupta', email: 'sanjay.gupta@xyzcorp.in', role: 'Inventory Manager', status: 'Active', createdAt: '2023-04-10', lastLogin: 'Yesterday' },
      { id: 'u-xyz-006', name: 'Lakshmi Devi', email: 'lakshmi.devi@xyzcorp.in', role: 'Finance Manager', status: 'Active', createdAt: '2024-01-05', lastLogin: '3 hours ago' },
    ],
    metrics: {
      todaysCollections: 1845000,
      collectionsGrowth: 28,
      gstDue: 542000,
      gstDueDate: '20th Sep 2026',
      outputGst: 845000,
      inputTaxCredit: 303000,
      cashPosition: 42500000,
      bankAccounts: [
        { name: 'HDFC Bank – Corporate Forex Account', balance: 18500000, type: 'Checking' },
        { name: 'ICICI Bank – Export Proceeds Account', balance: 12800000, type: 'Checking' },
        { name: 'Standard Chartered – Trade Finance', balance: 8200000, type: 'Savings' },
        { name: 'SBI – GST & Duty Settlement', balance: 2150000, type: 'Checking' },
        { name: 'XYZ Shipment – Operating Account', balance: 1850000, type: 'Checking' },
        { name: 'XYZ Warehouses – Storage Collections', balance: 1420000, type: 'Checking' },
        { name: 'Petty Cash – Head Office', balance: 85000, type: 'Cash' },
        { name: 'Petty Cash – Warehouse Office', balance: 45000, type: 'Cash' },
      ],
      upcomingPayments: 3250000,
      upcomingPaymentsCount: 12,
      receivables: 28500000,
      receivablesAging: [
        { bracket: '0 - 30 Days', amount: 14200000 },
        { bracket: '31 - 60 Days', amount: 8500000 },
        { bracket: '61 - 90 Days', amount: 3800000 },
        { bracket: '> 90 Days', amount: 2000000 },
      ],
      payables: 19200000,
      payablesAging: [
        { bracket: '0 - 30 Days', amount: 9800000 },
        { bracket: '31 - 60 Days', amount: 5400000 },
        { bracket: '61 - 90 Days', amount: 2800000 },
        { bracket: '> 90 Days', amount: 1200000 },
      ],
      burnRate: 2850000,
      cashRunwayMonths: 24.8,
      topCustomers: [
        { id: '1', name: 'Gucci Leather Sourcing Italy', invoices: 48, revenue: 18500000, status: 'Active' },
        { id: '2', name: 'BMW Auto Interiors GmbH', invoices: 36, revenue: 14200000, status: 'Active' },
        { id: '3', name: 'Burberry Supply Chain UK', invoices: 28, revenue: 11800000, status: 'Active' },
        { id: '4', name: 'Asahi Holdings Japan', invoices: 22, revenue: 9400000, status: 'Active' },
        { id: '5', name: 'Al Futtaim Group UAE', invoices: 18, revenue: 7600000, status: 'Active' },
        { id: '6', name: 'Cole Haan USA', invoices: 15, revenue: 6200000, status: 'Active' },
        { id: '7', name: 'Coach Inc. Global', invoices: 12, revenue: 5100000, status: 'Active' },
        { id: '8', name: 'Tod\'s Group Italy', invoices: 10, revenue: 4300000, status: 'Active' },
      ],
      aiAlerts: [
        { type: 'warning', message: '🇮🇹 Italy Exposure Alert: 38% of export revenue (₹68.4 Cr) concentrated in Italian buyers. Diversify into APAC to reduce EU regulatory risk.' },
        { type: 'info', message: '💱 Forex Insight: EUR/INR moved +1.2% this week. Outstanding EUR receivables (€2.4M) gain ₹21.6L. Consider forward contract lock.' },
        { type: 'success', message: '✅ XYZ Shipment Ltd customs clearance efficiency at 94.2% — 2.1% above Q2 target. 847 shipments processed YTD.' },
        { type: 'warning', message: '📦 XYZ Warehouses Ltd: Cold storage utilization at 92% capacity. Recommend activating overflow warehouse block B by Oct 2026.' },
        { type: 'info', message: '📊 YTD Revenue: ₹182.4 Cr (73% export, 27% domestic). On track to exceed FY2026 target of ₹240 Cr by ₹12 Cr.' },
        { type: 'warning', message: '⚠️ GST Compliance: GSTR-1 filing due in 4 days. Export invoices worth ₹24.8 Cr pending e-way bill generation.' },
      ],
    }
  }
];

interface TenantContextType {
  tenants: Tenant[];
  visibleTenants: Tenant[];
  activeTenant: Tenant;
  isSuperAdmin: boolean;
  setIsSuperAdmin: (value: boolean) => void;
  switchTenant: (tenantId: string) => void;
  addTenant: (newTenant: Partial<Tenant>) => void;
  addTenantUser: (tenantId: string, user: Omit<TenantUser, 'id' | 'createdAt'>) => void;
  updateTenantUser: (tenantId: string, userId: string, updates: Partial<TenantUser>) => void;
  deleteTenantUser: (tenantId: string, userId: string) => void;
  updateTenantPlan: (tenantId: string, plan: 'starter' | 'growth' | 'enterprise') => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Initialize to SSR-safe defaults (no window/localStorage) so the server and
  // first client render match, avoiding React hydration errors. Persisted state
  // is restored in a useEffect below after hydration completes.
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant-acme');
  const [isSuperAdmin, setIsSuperAdminState] = useState<boolean>(false);

  useEffect(() => {
    let restoredTenants = INITIAL_TENANTS;
    let restoredActive = 'tenant-acme';
    let restoredSuper = false;

    try {
      // Tenants merged from INITIAL_TENANTS + saved mutations so newly-added seed
      // tenants (e.g. XYZ Corporation) always appear, while runtime-added tenants
      // (via addTenant) and user mutations are preserved.
      const saved = localStorage.getItem('smartbooks_tenants_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedById = new Map<string, Tenant>(parsed.map((t: Tenant) => [t.id, t]));
          const merged = INITIAL_TENANTS.map((init) => {
            const t = savedById.get(init.id);
            if (!t) return init;
            return {
              ...init,
              ...t,
              seatLimit: t.seatLimit || init.seatLimit || 15,
              plan: t.plan || init.plan || 'growth',
              users: t.users || init.users || [],
              entities: t.entities || init.entities,
            };
          });
          const initialIds = new Set(INITIAL_TENANTS.map((i) => i.id));
          const extraSaved = parsed.filter((t: Tenant) => !initialIds.has(t.id));
          restoredTenants = [...merged, ...extraSaved];
        }
      }

      const savedActive = localStorage.getItem('smartbooks_active_tenant_id');
      if (savedActive) restoredActive = savedActive;

      const savedSuper = localStorage.getItem('smartbooks_is_superadmin');
      if (savedSuper !== null) restoredSuper = savedSuper === 'true';
    } catch (e) { /* ignore */ }

    setTenants(restoredTenants);
    setActiveTenantId(restoredActive);
    setIsSuperAdminState(restoredSuper);
  }, []);

  // Keep the active tenant aligned with the authenticated user's company so a
  // demo tenant user (e.g. XYZ Corporation) never lands on ACME details after
  // login or on reload. Super admins are exempt so they can freely switch.
  useEffect(() => {
    if (!user || user.isSuperAdmin) return;
    const tenantId = user.companyId as string | undefined;
    if (!tenantId || !tenants.some(t => t.id === tenantId)) return;
    if (tenantId === activeTenantId) return;
    setActiveTenantId(tenantId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartbooks_active_tenant_id', tenantId);
    }
  }, [user, tenants, activeTenantId]);

  const setIsSuperAdmin = (val: boolean) => {
    setIsSuperAdminState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartbooks_is_superadmin', String(val));
    }
  };

  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];

  // In strict tenant isolation mode (non-SuperAdmin), only the active tenant is visible
  const visibleTenants = isSuperAdmin ? tenants : [activeTenant];

  const switchTenant = (tenantId: string) => {
    // Restrict tenant switching: standard users cannot switch to unauthorized tenants
    if (!isSuperAdmin && tenantId !== activeTenantId) {
      console.warn(`[Security Alert] Access denied: User attempted to access unauthorized tenant (${tenantId}). Enforcing multi-tenant isolation.`);
      return;
    }
    const found = tenants.find(t => t.id === tenantId);
    if (found) {
      setActiveTenantId(tenantId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartbooks_active_tenant_id', tenantId);
      }
    }
  };

  const saveTenants = (updated: Tenant[]) => {
    setTenants(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartbooks_tenants_v2', JSON.stringify(updated));
    }
  };

  const addTenant = (newTenantData: Partial<Tenant>) => {
    const id = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      id,
      name: newTenantData.name || 'New Organization Pvt Ltd',
      subdomain: newTenantData.subdomain || 'new-org',
      schema: `schema_${id.replace(/-/g, '_')}`,
      edition: newTenantData.edition || 'Services Edition',
      gstin: newTenantData.gstin || '27XXXXX0000X1Z1',
      currency: newTenantData.currency || '₹',
      plan: newTenantData.plan || 'enterprise',
      users: [
        { id: `u-${Date.now()}`, name: 'Organization Admin', email: 'admin@org.com', role: 'Tenant Admin', status: 'Active', createdAt: new Date().toISOString().split('T')[0], lastLogin: 'Just now' }
      ],
      metrics: {
        todaysCollections: 85000,
        collectionsGrowth: 12,
        gstDue: 32000,
        gstDueDate: '20th Aug 2026',
        outputGst: 54000,
        inputTaxCredit: 22000,
        cashPosition: 1200000,
        bankAccounts: [{ name: 'HDFC Corporate Account', balance: 1200000, type: 'Checking' }],
        upcomingPayments: 95000,
        upcomingPaymentsCount: 2,
        receivables: 310000,
        receivablesAging: [{ bracket: '0 - 30 Days', amount: 310000 }],
        payables: 180000,
        payablesAging: [{ bracket: '0 - 30 Days', amount: 180000 }],
        burnRate: 140000,
        cashRunwayMonths: 14.5,
        topCustomers: [
          { id: '1', name: 'Alpha Global Solutions', invoices: 5, revenue: 450000, status: 'Active' },
          { id: '2', name: 'Beta Systems India', invoices: 3, revenue: 280000, status: 'Active' }
        ],
        aiAlerts: [
          { type: 'info', message: '🎉 New Tenant Organization provisioned with isolated database schema.' }
        ]
      }
    };

    const updated = [...tenants, newTenant];
    saveTenants(updated);
    switchTenant(id);
  };

  const addTenantUser = (tenantId: string, userData: Omit<TenantUser, 'id' | 'createdAt'>) => {
    const newUser: TenantUser = {
      ...userData,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never'
    };

    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return { ...t, users: [...t.users, newUser] };
      }
      return t;
    });

    saveTenants(updated);
  };

  const updateTenantUser = (tenantId: string, userId: string, updates: Partial<TenantUser>) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          users: t.users.map(u => u.id === userId ? { ...u, ...updates } : u)
        };
      }
      return t;
    });
    saveTenants(updated);
  };

  const deleteTenantUser = (tenantId: string, userId: string) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          users: t.users.filter(u => u.id !== userId)
        };
      }
      return t;
    });
    saveTenants(updated);
  };

  const updateTenantPlan = (tenantId: string, plan: 'starter' | 'growth' | 'enterprise') => {
    const seatLimits = { starter: 5, growth: 15, enterprise: 100 };
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          plan,
          seatLimit: seatLimits[plan]
        };
      }
      return t;
    });
    saveTenants(updated);
  };

  return (
    <TenantContext.Provider value={{ 
      tenants, 
      visibleTenants,
      activeTenant, 
      isSuperAdmin,
      setIsSuperAdmin,
      switchTenant, 
      addTenant,
      addTenantUser,
      updateTenantUser,
      deleteTenantUser,
      updateTenantPlan
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
