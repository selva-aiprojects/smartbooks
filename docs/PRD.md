# Product Requirements Document (PRD): SmartBooks AI ERP

## Document Control
* **Product Name:** SmartBooks AI ERP
* **Version:** 1.0 (Final Comprehensive Version)
* **Document Owner:** Selvakumar Balakrishnan
* **Product Category:** Cloud-Native, AI-First ERP Platform for Indian SMEs

---

## 1. Executive Summary
SmartBooks AI ERP is a cloud-native, AI-first SaaS platform engineered to modernize business operations for Indian Small and Medium Enterprises (SMEs). 

By blending the lightning-fast, mouse-free operational mechanics of traditional desktop software (like Tally) with advanced cloud collaboration and Generative AI automation, the platform unifies accounting, inventory, procurement, sales, banking, and deep Indian tax compliance (GST/E-way/E-invoice) into a single, cohesive experience. 

---

## 2. Vision Statement
To eliminate manual data entry and disjointed spreadsheets for Indian SMEs by providing a keyboard-optimized, AI-driven ERP that automates bookkeeping, compliance, and cash-flow management with absolute data integrity.

---

## 3. Business Objectives

### Primary Objectives
* **Market Disruption**: Provide an immediate, friction-free cloud alternative for legacy desktop accounting users.
* **Automation-Led Growth**: Reduce manual voucher entry times by 70% using localized AI text/document processing.
* **Compliance Safeguarding**: Ensure 100% compliance with MCA audit trail mandates and automated Input Tax Credit (ITC) maximization.

### Secondary Objectives
* Build an ecosystem of developer-friendly APIs for third-party e-commerce and logistics plug-ins.
* Achieve predictable recurring revenue through optimized, volume-scalable SaaS tiers.

---

## 4. Target Customers & User Personas

### Target Segments
* **Segment A (Micro & Small Enterprises):** 5–25 employees. Retailers, independent distributors, and modern service providers looking to move away from standalone billing apps.
* **Segment B (Growing SMEs):** 25–500 employees. Multi-warehouse manufacturers, larger logistics companies, and multi-branch trading firms.

### Key Personas
* **The Business Owner (SME Promoter):** Focuses heavily on daily cash flow, collection aging, and tax liability. Has no time for complex accounting.
* **The Power Accountant:** Highly proficient with Tally shortcuts. Demands zero-latency data entry, rapid ledger creation, and absolute control over journal adjustments.
* **The Inventory Manager:** Balances multiple warehouses, tracks stock aging, and works to prevent stockouts or capital lock-up.

---

## 5. Functional Scope: Core Modules

### Module 1: System Foundation & Tally Migration Tool
* **Role-Based Access Control (RBAC):** Super Admin, Tenant Admin, Accountant, Sales User, Inventory Manager, and External Auditor views.
* **Multi-Tenant & Multi-Branch Architecture:** Unified corporate view with strict branch-level data isolation.
* **One-Click Tally Importer:** Native ingestion parser for Tally `.xml` master lists and historical trial balances to ensure zero-loss data migration.

### Module 2: Accounting & Core Ledger Architecture
* **Hybrid Chart of Accounts:** Supports standard GAAP layouts alongside a legacy "Tally-Group Mode" mapping (e.g., Sundry Debtors, Sundry Creditors, Duties & Taxes, Contra entry logic).
* **Voucher Type Framework:** Standardized entry workflows for Sales, Purchase, Receipt, Payment, Contra, and Journal vouchers.
* **MCA-Compliant Edit Log:** Permanent, un-deletable audit log capturing the precise user ID, timestamp, old value, and new value for every single voucher alteration or deletion.

### Module 3: Sales, Procurement & Inventory
* **Sales Pipeline:** Quotation → Sales Order → Tax Invoice → Credit Note → Receipt & Allocation.
* **Procurement Pipeline:** Purchase Requisition → PO → Goods Receipt Note (GRN) → Purchase Voucher → Debit Note.
* **Inventory Control:** Real-time multi-warehouse tracking, batch/lot tracking, automated HSN/SAC lookups, and inventory valuation via FIFO or Weighted Average methods.

### Module 4: Indian GST & Banking Engine
* **Connected Banking APIs:** Real-time automated bank feeds, single-click vendor payouts via major Indian banks (ICICI, HDFC, SBI), and smart auto-matching reconciliation rules.
* **Native E-Way Bill & E-Invoice:** Real-time payload generation and direct compliance printing via NIC/GSTN Sandbox APIs.
* **GSTR-2B Auto-Reconciliation Engine:** Automated matching algorithm that pairs internal purchase records with vendor invoices uploaded to the GST portal to accurately pinpoint missing Input Tax Credit (ITC).

---

## 6. AI Features (The Unfair Advantage)

### AI Bookkeeper (MVP Scope - Core Hook)
* **Omnichannel Ingestion:** Users can upload, email, or WhatsApp a picture/PDF of an invoice, vendor bill, or bank statement.
* **Intelligent Ledger Mapping:** Generational AI extracts lines, matches HSN/SAC codes, infers the correct ledger accounts based on past behavior, and flags a ready-to-save voucher draft.

### AI Assistant (Natural Language Query)
* A persistent search bar accepting natural language prompts to surface complex data instantly (e.g., *"Show me all outstanding balances over ₹1 Lakh in South Zone"* or *"Compare my raw material costs between last quarter and this quarter"*).

### AI CFO & Forecasting (Phase 2)
* Predictive algorithms highlighting runway, early cash-crunch alerts, inventory demand spikes, and vendor reliability scoring based on payment patterns.

---

## 7. Zero-Mouse Usability & Keyboard Shortcut Matrix

To eliminate interface friction for users transitioning from desktop legacy software, the web interface must function entirely without a mouse. Field-to-field focus shifts must be instantaneous (<30ms visual response).

### The Dual-Map Shortcut Engine
The system will offer a user configuration setting: `[SmartBooks Native Layout]` or `[Classic Tally Layout]`. Below is the standardized behavioral matrix when Classic Mode is activated.

#### Global & Navigation Shortcuts
* **`Esc`**: Go back to the previous screen / Cancel current voucher entry (with a confirmation prompt if dirty data exists).
* **`Alt + G`**: Global Search Overlay. Instantly jumps to any ledger, voucher, or report from anywhere in the system.
* **`Alt + C`**: Master Creation Popup. If pressed inside a voucher line item, it pops up a modal to instantly create a missing Ledger or Stock Item without leaving the voucher screen.
* **`Alt + D`**: Delete current voucher or current row entry (requires explicit Admin role confirmation).
* **`Alt + P`**: Print / Export current screen or voucher to PDF.

#### Voucher Type Selection (Data Entry Screen)
* **`F4`**: **Contra Voucher** (Bank-to-Cash or Bank-to-Bank transfers).
* **`F5`**: **Payment Voucher** (All outbound cash/bank outlays).
* **`F6`**: **Receipt Voucher** (All inbound cash/bank receipts).
* **`F7`**: **Journal Voucher** (Non-cash adjustments, depreciation, provisions).
* **`F8`**: **Sales Invoice / Voucher**.
* **`F9`**: **Purchase Invoice / Voucher**.

#### Data Entry Grid Navigation
* **`Enter` / `Tab`**: Move focus to the next logical data input field.
* **`Shift + Tab`**: Move focus back to the previous input field.
* **`Ctrl + Enter`**: Alter/Edit the master record of the currently focused ledger or stock item directly from the voucher line.
* **`Ctrl + A`**: Complete Voucher Save. Bypasses all remaining fields to instantly commit the voucher to the database once the math matches.

---

## 8. Trust Engineering & Operational Safety

### 1. The Offline Resiliency Layer (Network Drops)
* **Local Storage Voucher Staging:** If the client's internet connection drops mid-voucher entry, the UI must not freeze or throw an error page. 
* **Unsaved State Safeguard:** The active voucher data must automatically serialize to browser-encrypted local storage. The system displays a subtle top bar notification: *"Network disconnected. Local auto-save active."*
* **Background Sync:** Once connectivity resumes, the system quietly verifies data schema integrity and updates the cloud database without forcing a page refresh.

### 2. Radical Transparency Audit Logging
* **MCA-Compliant Tamper Proofing:** To satisfy Indian regulatory mandates, when a voucher is modified, the system records an immutable entry in the audit trail.
* **Visual Diff Viewer:** An accountant or tax auditor can click a "View History Log" button to view a side-by-side visual difference engine highlighting exactly what modified data looks like (e.g., deleted lines are marked in red, added items are marked in green).

### 3. Balanced Ledger Verification Engine
* **Live Real-Time Mathematical Validation:** The system blocks voucher submission if total Debits do not exactly equal total Credits.
* **Dynamic Voucher Preview:** As the accountant keys in data line items, a minimized preview ledger updates at the footer of the screen, revealing real-time calculation previews of GST, Rounding off offsets, and updated closing ledger balances.

---

## 9. End-to-End Ease of Use (Frictionless Workflows)

### 1. Quick-Launch Onboarding Flow
* **The 60-Second Setup Wizard:** Instead of multi-day configurations, a new company setup requires only three pieces of data: Company Name, State, and GSTIN.
* **Automated GSTIN Scraping:** Upon entering a valid GSTIN, the platform calls the GSTN sandbox API to auto-populate the official legal name, registered trade address, and business configuration type.

### 2. Smart-Fill Fields & Contextual Intelligence
* **Fuzzy Search Ledger Selection:** When typing into a voucher field, typing *"Sbi"* will pull up *"State Bank of India"* or *"SBI Current Account"* instantly, ignoring case sensitivity or spelling errors.
* **Smart Voucher Number Sequence Generation:** The platform tracks prefix patterns automatically. If a user sets up custom tracking schemes (e.g., `SB/26-27/001`), the next sequence initializes reliably with no human overhead.

