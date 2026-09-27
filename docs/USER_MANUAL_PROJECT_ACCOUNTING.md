# User Manual: Project & Program Cost-Center Accounting
**SmartBooks Enterprise ERP** · Version 1.1 · Updated: September 2026

---

## 1. Introduction & Overview

Modern businesses often operate **2 to 10 distinct projects or programs each financial year** (e.g., civil contracting, client IT implementations, consultancy retainers, event management, or R&D initiatives). 

These initiatives share the company's **single legal entity, GSTIN, and bank accounts**, but require **independent financial accountability**:
- **Consolidated Entity Level**: All statutory reporting, MCA audit trail, Balance Sheet, and GST filings (GSTR-1, GSTR-3B) remain unified.
- **Individual Project Level**: Each program requires an isolated Profit & Loss (P&L) statement, budget burn rate, gross margin %, and collection tracking.

The **Projects & Cost Centers** module provides dimension-based transaction tagging, eliminating the need to create redundant subsidiary companies or complex inter-company ledger transfers.

```
                          ┌─────────────────────────────────────┐
                          │   Legal Entity (SmartBooks Tenant)  │
                          │   Unified GSTIN · PAN · Bank Ledger │
                          └──────────────────┬──────────────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             │                               │                               │
             ▼                               ▼                               ▼
   ┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
   │ Project 2026-001  │           │ Project 2026-002  │           │ Project 2026-003  │
   │ Smart Metering    │           │ CyberCity Fitout  │           │ Cloud Migration   │
   │ Timeline: 8 Mos   │           │ Timeline: 6 Mos   │           │ Timeline: 4 Mos   │
   │ Budget: ₹45,00,000│           │ Budget: ₹68,00,000│           │ Budget: ₹24,00,000│
   └─────────┬─────────┘           └─────────┬─────────┘           └─────────┬─────────┘
             │                               │                               │
    Tagged Invoices & Bills         Tagged Invoices & Bills         Tagged Invoices & Bills
             │                               │                               │
             ▼                               ▼                               ▼
   ┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
   │  Dedicated P&L    │           │  Dedicated P&L    │           │  Dedicated P&L    │
   │  Margin: 36.4%    │           │  Margin: 24.8%    │           │  Margin: 41.2%    │
   └───────────────────┘           └───────────────────┘           └───────────────────┘
```

---

## 2. Navigating to the Projects Hub

You can access the module from anywhere in the application:
1. **Left Navigation Drawer**: Under **Financial Reports**, click **Projects & Cost Centers**.
2. **Financial Reports Page (`/reports`)**: Click the **Project P&L Hub** button in the header toolbar.
3. **Direct URL**: Navigate to `/projects`.

---

## 3. Step-by-Step Operational Workflows

### Step 1: Creating a New Project / Program

1. Navigate to **Projects & Cost Centers** (`/projects`).
2. Click the **+ New Project** button in the top right.
3. Complete the project configuration modal:
   - **Project Code**: Auto-generated sequence (e.g. `PRJ-2026-005`), or enter a custom internal identifier.
   - **Project / Program Name**: Enter the title (e.g., *DLF Tower B HVAC Automation*).
   - **Linked Customer / Client**: Select the contracting customer from the dropdown, or leave blank for internal R&D/CapEx projects.
   - **Total Allocated Budget (₹)**: Planned expenditure cap for the project.
   - **Timeline (Start Date & Target End Date)**: Set the operating lifecycle.
   - **Status**: Default is `Active`.
   - **Description**: Key milestones, billing terms, and deliverable scope.
4. Click **Create Project**. The creation event is instantly recorded in the **MCA Audit Trail**.

---

### Step 2: Tagging Revenue (Customer Invoices)

When billing a client for project deliverables or milestone certificates:

1. Go to **Customer Invoices** → **+ New Invoice** (`/invoices/new`).
2. Select the **Customer**.
3. In the **Project / Cost Center** dropdown, select the target project (e.g. `[PRJ-2026-001] Govt Smart Metering`).
4. Add line items (services, products, milestone billings) with applicable GST rates.
5. Save the invoice.
   - **Result**: The invoice value is credited to the company's General Ledger **Revenue** account and simultaneously tagged to the **Project's Operating Revenue**.

---

### Step 3: Tagging Expenses (Vendor Bills & Subcontractors)

When procuring materials, hiring contractors, or paying for software/services specific to a project:

1. Go to **Vendor Bills** → **+ New Bill** (`/bills/new`).
2. Select the **Vendor**.
3. In the **Project / Cost Center** dropdown, select the relevant project.
4. Enter line items (materials, contractor fees, cloud hosting) and costs.
5. Save the bill.
   - **Result**: Accounts Payable and Input Tax Credit (ITC) are credited at the entity level, while the cost is debited directly against the **Project's P&L and Budget**.

---

### Step 4: Tracking Budget Utilization & Burn Rate

On the **Projects & Cost Centers** dashboard (`/projects`):

- **Live Progress Bars**: Each project card displays a dynamic budget progress bar:
  - 🟢 **Green (< 80%)**: Healthy budget utilization.
  - 🟠 **Orange (80% – 100%)**: Nearing budget ceiling.
  - 🔴 **Red (> 100%)**: Budget overrun alert.
- **P&L Scorecard**: Displays live **Revenue**, **Direct Costs**, and **Net Profit & Margin %**.

---

### Step 5: Generating the Project P&L Statement

To review the exact financial statement for an individual project:

1. On any project card or table row, click **View P&L**.
2. The **Project P&L Statement** dialog opens, presenting:
   - **Scorecard**: Billed Revenue, Operating Costs, Net Profit, and Budget Variance.
   - **Tab 1: P&L Financial Statement**: A formal 3-tier accounting statement:
     - **I. Operating Revenue & Billings** (Taxable, GST Collected, Total)
     - **II. Direct Operating Costs & Vendor Bills** (Taxable, ITC Claimed, Net Costs)
     - **III. Net Project Profit / (Loss)** and **Operating Margin %**
   - **Tab 2: Tagged Invoices**: Detailed list of all customer invoices with payment statuses.
   - **Tab 3: Tagged Vendor Bills**: Detailed list of vendor bills, payment dates, and item scopes.
   - **Tab 4: Cost by Category**: Visual distribution of spend (e.g., Subcontractors, Materials, Cloud, Hardware).
3. **Exporting**: Click **Export CSV** at the top right to download a spreadsheet for stakeholders or auditing.

---

### Step 6: Managing Temporary Timelines & Archival

When a temporary project completes its 3-to-12-month timeline:

1. On the project card, click the three-dot menu (**⋮**) or **Edit**.
2. Change the status:
   - **`Completed`**: Marks milestones fulfilled; project remains visible in reports.
   - **`Archived`**: Locks the project and removes it from active invoice/bill dropdowns to prevent accidental postings.
3. **Permanent Audit Preservation**: Existing invoices, bills, and historical P&L statements are never lost and remain fully accessible for statutory audits.

---

## 4. Querying Projects with the AI Assistant

SmartBooks AI is integrated with the Project Accounting engine. Open **AI Assistant** (`/ai-assistant`) and ask in natural language:

- *"What is our most profitable project for FY 2026-27?"*
- *"Show me projects that have spent over 80% of their allocated budget."*
- *"Give me a P&L breakdown for Project PRJ-2026-001."*
- *"Compare the gross margins of all active projects."*

---

## 5. Summary Table: Entity vs. Project Accounting

| Dimension | Overall Entity (Company Level) | Individual Project Level |
| :--- | :--- | :--- |
| **GST Returns (GSTR-1, 3B)** | Unified under Company GSTIN | Tagged for customer & vendor ITC attribution |
| **Balance Sheet** | Single company-wide Balance Sheet | Not applicable (asset/liability is corporate) |
| **Profit & Loss** | Consolidated statutory P&L | Independent Operating Margin per project |
| **Audit Trail (MCA Rule 3)** | Permanent log for all vouchers | Tracked with Project ID tagging |
| **Budget Control** | Corporate Annual Budget | Timeline-bound Milestone Budget |
