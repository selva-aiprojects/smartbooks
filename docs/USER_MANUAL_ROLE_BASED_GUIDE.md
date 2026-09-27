# SmartBooks Enterprise ERP: Comprehensive Role-Based User Manual
**Version 1.2** · Updated: September 2026 · Standard Operating Procedure (SOP) & User Guide

---

## Table of Contents
1. [Executive Summary & Role Access Matrix](#1-executive-summary--role-access-matrix)
2. [Universal Login & Entity Navigation](#2-universal-login--entity-navigation)
3. [Role 1: Super Admin (Platform Operator)](#3-role-1-super-admin-platform-operator)
4. [Role 2: Owner / Managing Director (Executive Leadership)](#4-role-2-owner--managing-director-executive-leadership)
5. [Role 3: Tenant Admin (Operations & System Governance)](#5-role-3-tenant-admin-operations--system-governance)
6. [Role 4: Finance Manager (Controller & Tax Auditor)](#6-role-4-finance-manager-controller--tax-auditor)
7. [Role 5: Accountant (Daily Double-Entry Bookkeeper)](#7-role-5-accountant-daily-double-entry-bookkeeper)
8. [Role 6: Inventory Manager (Supply Chain & Warehousing)](#8-role-6-inventory-manager-supply-chain--warehousing)
9. [Role 7: Cashier / POS Executive (Front-Office Billing)](#9-role-7-cashier--pos-executive-front-office-billing)
10. [End-to-End Inter-Role Collaboration Workflows](#10-end-to-end-inter-role-collaboration-workflows)
11. [Audit Trail & MCA Compliance Standards](#11-audit-trail--mca-compliance-standards)

---

## 1. Executive Summary & Role Access Matrix

SmartBooks features an enterprise **Role-Based Access Control (RBAC)** architecture designed for statutory accounting, internal segregation of duties, and compliance with the **Ministry of Corporate Affairs (MCA)** and **GST Act**.

| Role | Default Seed Account | Password | Scope & Primary Modules |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@smartbooks.com` | `admin123` | Platform-wide Nexus Admin, Tenant Provisioning, System Audits. |
| **Owner** | `arjun.kapoor@xyzcorp.in` | `Xyz@2023#Secure` | Holding & Subsidiary P&L, Master Consolidation, Banking Hub, RBAC. |
| **Tenant Admin** | `deepa.rajan@xyzcorp.in` | `Xyz@2023#Secure` | User Invitations, Role Assignments, System Automations, Chart of Accounts. |
| **Finance Manager** | `vikram.iyer@xyzcorp.in` | `Xyz@2023#Secure` | Bank Reconciliation, Financial Forecasting, GSTR-1/3B/2B, TDS Filings. |
| **Accountant** | `priya.menon@xyzcorp.in` | `Xyz@2023#Secure` | Invoices, Vendor Bills, Double-Entry Journals, Vouchers, Project Tagging. |
| **Inventory Manager** | `sanjay.gupta@xyzcorp.in` | `Xyz@2023#Secure` | Stock Ledger, SKU Catalog, Purchase Orders, e-Way Bills, Reorder Alerts. |
| **Cashier / POS** | `cashier@xyzcorp.in` *(or assigned)* | `Xyz@2023#Secure` | Quick Counter Billing, POS Cash Drawer, Customer Receipts, Quotations. |

---

## 2. Universal Login & Entity Navigation

### 2.1 Logging In
1. Open your browser and navigate to the application URL (or `/login`).
2. Enter your registered corporate **Email Address** and **Password**.
3. Click **Sign In**. Upon authentication:
   - A secure JWT session token is created.
   - The user is redirected to the **Executive Dashboard** (`/dashboard`).
   - The header displays the active tenant name, corporate GSTIN, and active user badge.

```
       ┌────────────────────────────────────────────────────────┐
       │                 SmartBooks Portal Login                │
       │                                                        │
       │  Email:    [ priya.menon@xyzcorp.in                  ] │
       │  Password: [ ••••••••••••••••                        ] │
       │                                                        │
       │            [       Sign In to Workspace       ]        │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │ Global Workspace Header:                               │
       │ [XYZ Corporation ▼] [Project: All]  (User: Priya Menon)│
       └────────────────────────────────────────────────────────┘
```

### 2.2 Switching Between Master Holding & Operating Entities
If your organization operates a parent-subsidiary group (e.g. *XYZ Corporation* as Master Holding, *XYZ Shipment Ltd* and *XYZ Warehouses Ltd* as operating subsidiaries):
1. Locate the **Entity Switcher** dropdown in the top-left navigation header.
2. Select any child operating entity.
3. The application re-scopes your active session:
   - Ledgers, invoices, vouchers, and tax calculations switch instantaneously to that entity's books.
   - No logout or re-authentication is required.
4. To return to the Holding Company, click the dropdown and pick **XYZ Corporation (Holding)**.

---

## 3. Role 1: Super Admin (Platform Operator)

### Persona & Purpose
The **Super Admin** oversees the entire multi-tenant infrastructure, monitors system health, provisions new corporate tenants, and verifies strict tenant data isolation.

### Daily / Periodic Workflows

#### A. Managing Tenants in Nexus Admin (`/nexus-admin`)
1. Click **Nexus Admin** in the navigation menu.
2. View all provisioned client tenants, plan tiers (`Growth`, `Enterprise`), seat limits, and current active status.
3. **Provision a New Tenant**:
   - Click **+ Add Tenant Organization**.
   - Fill in Legal Organization Name, Subdomain (e.g., `acme-retail`), Master GSTIN, and Administrative Owner Email.
   - Click **Provision Tenant**. The schema and isolation bounds are created immediately.

#### B. Platform Security & Cross-Tenant Audit Log (`/audit-trail`)
1. Navigate to **Audit Trail** (`/audit-trail`).
2. Filter events across all companies to detect anomalous logins, unauthorized schema modifications, or bulk export attempts.
3. Verify that zero cross-tenant data leaks occur using the automated tenant isolation verification suite.

---

## 4. Role 2: Owner / Managing Director (Executive Leadership)

### Persona & Purpose
The **Owner** has unconstrained authority across the company. The Owner focuses on high-level profitability, group cash flow, Master-level consolidation, banking connections, and statutory compliance.

### Primary Workflows

#### A. Master Corporate Group Consolidation (`/reports` → Tab 5)
1. Go to **Financial Reports** (`/reports`).
2. Click **Tab 5: Corporate Group Consolidation (Master Level)**.
3. Review the top-level group scorecard:
   - **Consolidated Group Revenue**: Total revenue across all subsidiaries.
   - **Consolidated Operating Costs**: Roll-up of all operational expenditures.
   - **Consolidated Net Profit & Group Margin %**: Consolidated group bottom line.
   - **Consolidated Total Assets & Net Equity**: Combined balance sheet valuation.
4. Examine the **Subsidiary & Entity Scorecard Matrix**:
   - Compares Master Holding and individual operating entities side-by-side.
   - Click **Switch & Manage** next to any subsidiary to enter its books directly.

#### B. Strategic Financial Analytics & AI Assistant (`/ai-assistant`)
1. Open the **AI Financial Assistant** (`/ai-assistant`).
2. Submit natural language queries such as:
   - *"What is our projected cash runway over the next 90 days?"*
   - *"Compare gross margins across our domestic vs export divisions."*
   - *"Identify our top 5 overdue debtor accounts exceeding ₹5,00,000."*
3. Export AI strategic summaries to PDF for executive board presentations.

#### C. Subscription & Organization Settings (`/settings`)
1. Go to **Settings** (`/settings`).
2. Review subscription seat limits, API integrations, and legal company identifiers (PAN, CIN, GSTIN).
3. Configure company bank account details for instant payment links on customer invoices.

---

## 5. Role 3: Tenant Admin (Operations & System Governance)

### Persona & Purpose
The **Tenant Admin** configures business settings, manages user accounts, assigns RBAC roles, establishes chart of accounts policies, and creates automated workflow rules.

### Primary Workflows

#### A. Team User Management & RBAC Provisioning (`/users`)
1. Navigate to **User Management** (`/users`).
2. View existing team members, assigned roles, and login activity.
3. **Invite / Add a Team Member**:
   - Click **+ Add Team Member**.
   - Input Full Name, Corporate Email Address, and select their Role:
     - `Finance Manager`: Treasury & tax authority.
     - `Accountant`: Operational bookkeeper.
     - `Inventory Manager`: Supply chain & stock.
     - `Cashier`: Counter sales.
   - Click **Save User**. An activation email with secure credentials is sent to the user.
4. **Modifying or Revoking Access**:
   - Click the **Edit** icon next to any user to change their role.
   - Click **Deactivate** to immediately invalidate their active JWT tokens.

#### B. Customizing Chart of Accounts (`/accounts`)
1. Navigate to **Chart of Accounts** (`/accounts`).
2. View existing 4-digit GL accounts grouped by Assets (1000s), Liabilities (2000s), Equity (3000s), Revenue (4000s), and Expenses (5000s).
3. Click **+ Add GL Account** to create specialized ledgers (e.g. `5045 - Project Subcontractor Fees`).

#### C. Workflow Automations (`/automations`)
1. Navigate to **Automations** (`/automations`).
2. Enable automated rules:
   - **Overdue Invoice Chaser**: Sends automated WhatsApp/Email reminders to customers at 7, 15, and 30 days overdue.
   - **Low Stock Reorder Alert**: Alerts procurement when stock drops below minimum threshold.
   - **High-Value Voucher Approval**: Flags expenses > ₹1,00,000 for Finance Manager pre-approval.

---

## 6. Role 4: Finance Manager (Controller & Tax Auditor)

### Persona & Purpose
The **Finance Manager** oversees treasury, bank reconciliation, cash flow forecasting, statutory tax filings (GST & TDS), and multi-project profitability audits.

### Primary Workflows

#### A. 1-Click Bank Reconciliation (`/reconciliation`)
1. Navigate to **Reconciliation** (`/reconciliation`).
2. Upload the official bank statement CSV or connect via live ICICI/Razorpay banking API.
3. SmartBooks' rule-based matching engine pairs bank transactions with internal ERP invoices/bills.
4. Click **Reconcile Match** for exact matches, or create a 1-click contra/suspense entry for unlisted bank charges.

#### B. Cash Flow Forecasting & Liquidity (`/forecasting`)
1. Navigate to **Cash Flow Forecasting** (`/forecasting`).
2. Review the 30-60-90 day forward-looking cash position.
3. Evaluate upcoming AR receivables against planned AP bill payments to ensure adequate liquidity.

#### C. GST Compliance & Returns Filing (`/tax`)
1. Go to **Tax & GST Center** (`/tax`).
2. **GSTR-1 Preparation**:
   - Filter by month or quarter.
   - Review B2B Invoices, B2CL, B2CS, and Credit Notes.
   - Click **Download GSTR-1 JSON** for direct upload to the GST Common Portal.
3. **GSTR-2B Inward ITC Reconciliation**:
   - Match vendor bills against auto-drafted GSTR-2B data.
   - Identify missing invoices or mismatched tax values before approving vendor payments.
4. **GSTR-3B Computation**:
   - Review Net Tax Liability (Outward Tax minus Eligible Inward ITC).

#### D. TDS Compliance & 26Q Tracking (`/tds`)
1. Navigate to **TDS Module** (`/tds`).
2. View Section-wise TDS deducted on vendor payments (Sec 194C for Contractors, Sec 194J for Professional Fees, Sec 194I for Rent).
3. Click **Generate Challan** to record ITNS-281 payment details (BSR Code, Challan No, Tender Date).
4. Download Form 26Q quarterly returns summary.

#### E. Project & Program Financial Auditing (`/projects`)
1. Navigate to **Projects & Cost Centers** (`/projects`).
2. Audit individual project P&L statements, budget consumption, and profit margin percentages.
3. Flag projects operating below the target 20% margin threshold.

---

## 7. Role 5: Accountant (Daily Double-Entry Bookkeeper)

### Persona & Purpose
The **Accountant** is the workhorse of daily finance operations: issuing customer invoices, logging vendor bills, attaching project tags, capturing receipts via OCR, and posting manual journal vouchers.

### Primary Workflows

#### A. Creating Customer Invoices with Project Tags (`/invoices/new`)
1. Navigate to **Invoices** → Click **+ Create Invoice**.
2. Select the **Customer** from the dropdown. Customer GSTIN, billing address, and state code populate automatically.
3. **Assign Project / Cost Center Tag**:
   - In the **Project / Cost Center** dropdown, select the linked project (e.g., `PRJ-2026-001 - Smart Metering`).
4. **Add Invoice Line Items**:
   - Select Item / Service, enter Quantity, Unit Price, and GST Rate (5%, 12%, 18%, 28%).
   - System calculates CGST + SGST (Intra-state) or IGST (Inter-state) automatically.
5. If invoice value exceeds ₹50,000, toggle **Generate e-Way Bill / e-Invoice**.
6. Click **Save & Approve**.
   - Post balanced ledger entries: Debit Accounts Receivable (`1020`), Credit Sales Revenue (`4010`), Credit GST Output Payable (`2020`).
   - Project P&L updates revenue in real-time.

#### B. Logging Vendor Procurement Bills (`/bills/new`)
1. Navigate to **Bills** → Click **+ New Vendor Bill**.
2. Select the **Vendor**, enter Vendor Invoice Number and Date.
3. Select the applicable **Project / Program** for direct expense allocation.
4. Add expense line items with appropriate HSN/SAC codes.
5. If TDS applies, select the section (e.g., `194C - 1% or 2%`) to auto-deduct TDS Payable.
6. Click **Submit Bill** for payment scheduling.

#### C. OCR AI Receipt Scanner (`/ocr-scanner`)
1. Navigate to **OCR Scanner** (`/ocr-scanner`).
2. Drag and drop receipt/bill images (PNG, JPG, PDF).
3. The AI engine extracts:
   - Vendor Name & GSTIN
   - Date & Invoice Number
   - Line Item descriptions & amounts
   - Tax Breakdown
4. Click **Convert to Bill** to review pre-populated fields and post with 1 click.

#### D. Double-Entry Manual Journal Entries (`/journal/new`)
1. Navigate to **Journal Entries** → Click **+ New Journal Entry**.
2. Enter Entry Date and Reference Note.
3. Add debit and credit ledger rows (must balance: Total Debit = Total Credit).
4. Tag specific cost center / project if allocating overheads.
5. Click **Post Journal**.

---

## 8. Role 6: Inventory Manager (Supply Chain & Warehousing)

### Persona & Purpose
The **Inventory Manager** controls stock movements, warehouse locations, product catalogs, SKU valuations, and logistics dispatch documentation.

### Primary Workflows

#### A. Monitoring Stock Levels & Valuation (`/inventory`)
1. Navigate to **Inventory** (`/inventory`).
2. Track Real-time Stock on Hand across raw materials and finished goods.
3. Review stock valuation based on FIFO / Weighted Average cost models.
4. Filter by **Low Stock** to identify items nearing minimum safety thresholds.

#### B. Managing e-Way Bills for Goods Movement (`/e-way-bills`)
1. Navigate to **e-Way Bills** (`/e-way-bills`).
2. Click **Generate e-Way Bill**.
3. Select the originating invoice or bill.
4. Enter Transporter ID, Transporter Name, Vehicle Number, and Distance in KM.
5. Click **Submit to NIC Portal**.
   - Generates official 12-digit e-Way Bill Number and printable QR code.

---

## 9. Role 7: Cashier / POS Executive (Front-Office Billing)

### Persona & Purpose
The **Cashier** handles walk-in retail sales, counter billing, instant payment collection via UPI/Cash/Card, and daily cash drawer balance reconciliation.

### Primary Workflows

#### A. Rapid Counter Billing (`/invoices/new` or POS view)
1. Add items via barcode scan or quick-search SKU list.
2. Apply instant line discounts or promo codes.
3. Select Payment Mode: **Cash**, **UPI QR Code**, or **Card / POS Terminal**.
4. Click **Print Receipt** for instant thermal POS receipt printing.

#### B. Recording Customer Payments (`/payments`)
1. Navigate to **Payments** (`/payments`).
2. Search customer by Name or Phone Number.
3. Select outstanding unpaid invoices.
4. Enter payment amount received and payment reference (e.g. UPI UTR number).
5. Click **Record Payment**. Generates official customer payment receipt voucher.

#### C. End-of-Day Cash Drawer Closing
1. Sum all cash collected in the physical cash drawer.
2. Cross-verify with the **Day Book** (`/day-book`) Cash Account ledger balance.
3. Submit closing cash summary to the Accountant for bank deposit contra-entry.

---

## 10. End-to-End Inter-Role Collaboration Workflows

Here is how the roles work together seamlessly in a standard procurement-to-payment cycle:

```
  [1. Inventory Manager] ───────► [2. Accountant] ──────────► [3. Finance Manager] ───────► [4. Owner]
    Detects low stock &             Enters vendor bill,         Approves payment run,         Reviews Group P&L,
    issues Purchase Order           verifies GSTIN & TDS,       runs bank reconciliation,     Consolidated reports,
    & matches inward GRN.           tags Project Cost Center.   checks GSTR-2B ITC match.     & strategic cashflow.
```

### Typical Multi-Entity Scenario:
1. **Holding Company (Owner Arjun Kapoor)** negotiates a group-level raw material contract.
2. **Accountant (Priya Menon)** logs into *XYZ Corporation* and posts the master purchase order.
3. **Priya** uses the **Entity Switcher** to switch to *XYZ Shipment Ltd* to issue logistics handling invoices to the client.
4. **Finance Manager (Vikram Iyer)** logs in, audits GST filings across both entities, and executes bank reconciliation.
5. **Owner (Arjun Kapoor)** opens **Reports Tab 5 (Corporate Group Consolidation)** to view the combined group profit across both entities without having to merge spreadsheets.

---

## 11. Audit Trail & MCA Compliance Standards

SmartBooks enforces Indian statutory compliance under the **Companies Act, 2013** and **MCA Audit Trail (Edit Log) Rules**:

1. **Immutable Audit Trail (`/audit-trail`)**:
   - Every invoice, bill, journal entry, or user creation automatically logs:
     - Exact Timestamp (UTC + IST).
     - User Identity & Role.
     - Operation (`CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`).
     - Previous Value vs. New Value diff.
2. **Strict Segregation of Duties (SoD)**:
   - Cashiers cannot edit general ledgers.
   - Accountants cannot alter tenant subscription or RBAC settings.
   - Deletion of posted accounting transactions is strictly prohibited; corrections must be made via reversal vouchers or credit/debit notes.
3. **Multi-Tenant Data Isolation**:
   - Tenant database records are compartmentalized using isolated company IDs and schemas, preventing unauthorized cross-company visibility.

---
*End of User Manual · SmartBooks Enterprise ERP*
