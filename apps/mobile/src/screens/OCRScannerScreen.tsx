import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface ExtractedBill {
  vendorName: string;
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  category: string;
  confidence: number;
}

export default function OCRScannerScreen() {
  const [scanning, setScanning] = useState(false);
  const [bill, setBill] = useState<ExtractedBill | null>(null);
  const [posted, setPosted] = useState(false);

  const startScan = () => {
    setScanning(true);
    setBill(null);
    setPosted(false);

    // Simulate Multimodal Gemini Flash Vision OCR analysis
    setTimeout(() => {
      setBill({
        vendorName: 'AWS Cloud Infrastructure India Pvt Ltd',
        gstin: '33AAACA9812K1ZX',
        invoiceNumber: 'AWS-IN-2026-84912',
        invoiceDate: '2026-09-22',
        taxableAmount: 14200.0,
        cgst: 1278.0,
        sgst: 1278.0,
        totalAmount: 16756.0,
        category: 'Software & Cloud Infrastructure (6010)',
        confidence: 98.4,
      });
      setScanning(false);
    }, 1800);
  };

  const handlePostLedger = () => {
    setPosted(true);
    Alert.alert(
      'Journal Entry Posted',
      `Vendor Bill #${bill?.invoiceNumber} approved and posted.\n\nDebit: Software & Cloud (₹14,200)\nDebit: Input Tax Credit CGST/SGST (₹2,556)\nCredit: Trade Payables (₹16,756)\n\nAudit Logged under MCA Rule 3(1).`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Multimodal Vision AI Scanner</Text>
        <Text style={styles.subTitle}>
          Instant document ingestion & automated GL entry powered by Gemini Vision
        </Text>
      </View>

      {/* Viewfinder / Capture Card */}
      <View style={styles.viewfinderCard}>
        <View style={styles.viewfinderFrame}>
          <Text style={styles.viewfinderIcon}>📄</Text>
          <Text style={styles.viewfinderText}>
            Align vendor invoice or expense receipt within frame
          </Text>
          <View style={styles.viewfinderCorners} />
        </View>

        <TouchableOpacity
          style={[styles.captureBtn, scanning && styles.captureBtnDisabled]}
          onPress={startScan}
          disabled={scanning}
        >
          {scanning ? (
            <View style={styles.scanningRow}>
              <ActivityIndicator color="#ffffff" size="small" />
              <Text style={styles.captureBtnText}>Analyzing with Gemini Vision...</Text>
            </View>
          ) : (
            <Text style={styles.captureBtnText}>📷 Capture & Extract Fields</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Extracted Data Card */}
      {bill && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.resultTitle}>Extracted Bill Details</Text>
              <Text style={styles.resultSub}>Gemini Flash Vision Parsed</Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>✓ {bill.confidence}% Match</Text>
            </View>
          </View>

          <View style={styles.fieldGrid}>
            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Vendor Name</Text>
              <Text style={styles.fieldValue}>{bill.vendorName}</Text>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Vendor GSTIN</Text>
              <Text style={[styles.fieldValue, { color: '#38bdf8' }]}>{bill.gstin}</Text>
            </View>

            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Invoice #</Text>
                <Text style={styles.fieldValue}>{bill.invoiceNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Bill Date</Text>
                <Text style={styles.fieldValue}>{bill.invoiceDate}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Taxable Amount</Text>
                <Text style={styles.fieldValue}>₹{bill.taxableAmount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>CGST + SGST (18%)</Text>
                <Text style={styles.fieldValue}>
                  ₹{(bill.cgst + bill.sgst).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalAmount}>
                ₹{bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.categoryBox}>
              <Text style={styles.categoryLabel}>Auto-Suggested GL Account:</Text>
              <Text style={styles.categoryValue}>{bill.category}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {posted ? (
              <View style={styles.postedBadge}>
                <Text style={styles.postedText}>✓ Posted to General Ledger & Day Book</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.approveBtn} onPress={handlePostLedger}>
                <Text style={styles.approveBtnText}>
                  Approve & Post to General Ledger
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.retryBtn} onPress={startScan}>
              <Text style={styles.retryBtnText}>Scan Another Bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subTitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 16,
  },
  viewfinderCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewfinderFrame: {
    width: '100%',
    height: 180,
    backgroundColor: '#0b0f19',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 16,
  },
  viewfinderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  viewfinderText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  viewfinderCorners: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
  },
  captureBtn: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  captureBtnDisabled: {
    backgroundColor: '#1e3a8a',
  },
  captureBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  resultSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  confidenceText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  fieldGrid: {
    gap: 10,
  },
  fieldItem: {
    marginBottom: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 4,
  },
  totalBox: {
    backgroundColor: '#0b0f19',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38bdf8',
  },
  categoryBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  categoryLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38bdf8',
    marginTop: 2,
  },
  actionRow: {
    marginTop: 16,
    gap: 10,
  },
  approveBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  postedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  postedText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  retryBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  retryBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
});
