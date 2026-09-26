# SmartBooks Mobile App 📱

Enterprise AI-Powered Indian GST Accounting & Compliance Mobile Application built with React Native and Expo.

---

## 🚀 Key Features

1. **Real-time Financial Operations Dashboard**:
   - Live Cash & Bank position with MoM growth metrics.
   - Today's inflow tracking & GSTR-3B tax due countdown.
   - Outstanding accounts receivable with 1-tap **WhatsApp Nudges**.
   - MCA Rule 3(1) tamper-evident audit status indicator.

2. **GST Invoices & e-Invoicing (IRP)**:
   - Invoice list with search and status filtering (All, Sent, Overdue, Paid).
   - 1-click **WhatsApp Payment Reminders** with deep links (`Linking.openURL`).
   - Self-service UPI customer payment portal link sharing (`Share.share`).
   - Official NIC IRP e-Invoice IRN generator.
   - In-app "+ Create Tax Invoice" workflow.

3. **AI CFO Executive Assistant (Gemini Flash RAG)**:
   - Real-time conversational AI assistant connected to company ledger context.
   - Quick financial prompt suggestions (GST liabilities, burn rate, debtors).
   - 1-tap response clipboard copying.

4. **Multimodal Vision AI Scanner**:
   - In-app receipt and vendor bill camera viewfinder.
   - Automatic vendor name, GSTIN, invoice date, line items, and tax split extraction.
   - 1-tap "Approve & Post to General Ledger" posting double-entry journals.

5. **Indian Statutory Compliance Hub**:
   - **e-Way Bills (Rule 138)**: Part-A and Part-B vehicle tracking.
   - **TDS & TCS (Form 26Q)**: Section 194C/J summary and ITNS-281 deposit challans.
   - **Statutory Payroll Engine**: EPF, ESI, Professional Tax, and salary disbursement tracking.
   - **MCA Rule 3(1) Audit Trail**: Cryptographic log verification.
   - Multi-tenant organization switcher and custom backend API configuration.

---

## 🛠️ How to Run Locally

### 1. Install Dependencies
```bash
cd apps/mobile
npm install
```

### 2. Start the Expo Dev Server
```bash
npm start
```

### 3. Open on Devices
- **Physical Phone (iOS / Android)**:
  - Install **Expo Go** from the App Store or Google Play Store.
  - Scan the terminal QR code using your phone's camera (iOS) or Expo Go app (Android).
- **Android Emulator**:
  ```bash
  npm run android
  ```
- **iOS Simulator** (macOS only):
  ```bash
  npm run ios
  ```
- **Web Preview**:
  ```bash
  npm run web
  ```
