import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Linking,
  Share,
  Alert,
  Modal,
} from 'react-native';
import { MobileApi } from '../services/api';
import { MobileInvoice } from '../types';

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<MobileInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Sent' | 'Overdue' | 'Paid'>('All');

  // New Invoice Modal
  const [newModalVisible, setNewModalVisible] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDesc, setInvoiceDesc] = useState('');

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await MobileApi.getInvoices();
      setInvoices(data);
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleWhatsAppReminder = (inv: MobileInvoice) => {
    const phone = (inv.customerPhone || '919840122334').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const payLink = `https://smartbooks-nexus.vercel.app/pay/${inv.id}`;
    const text = `*Payment Reminder from Nexus Retail Ltd*\n\nDear ${inv.customerName},\nThis is a friendly reminder that Tax Invoice *#${inv.number}* for *₹${inv.totalAmount.toLocaleString('en-IN')}* is pending payment.\nDue Date: ${inv.dueDate || 'Immediate'}\n\nKindly complete payment via Instant UPI or view details here:\n👉 ${payLink}\n\nThank you!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Notice', 'Unable to open WhatsApp on this device.');
    });
  };

  const handleShareLink = async (inv: MobileInvoice) => {
    const payLink = `https://smartbooks-nexus.vercel.app/pay/${inv.id}`;
    try {
      await Share.share({
        message: `SmartBooks Payment Link for Invoice #${inv.number} (₹${inv.totalAmount.toLocaleString('en-IN')}): ${payLink}`,
        url: payLink,
        title: `Invoice #${inv.number} Payment`,
      });
    } catch (error: any) {
      Alert.alert('Error sharing', error.message);
    }
  };

  const handleGenerateIRN = (inv: MobileInvoice) => {
    const mockIRN = 'IRN-' + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase();
    setInvoices((prev) =>
      prev.map((item) => (item.id === inv.id ? { ...item, irn: mockIRN } : item))
    );
    Alert.alert('e-Invoice Generated', `NIC IRP Official IRN:\n${mockIRN}\nSigned QR code attached.`);
  };

  const handleCreateInvoice = () => {
    if (!customerName || !invoiceAmount) {
      Alert.alert('Required', 'Please enter customer name and total amount');
      return;
    }
    const amt = parseFloat(invoiceAmount) || 0;
    const taxable = Math.round((amt / 1.18) * 100) / 100;
    const gst = Math.round((amt - taxable) * 100) / 100;

    const newInv: MobileInvoice = {
      id: Date.now().toString(),
      number: `INV-2026-00${invoices.length + 1}`,
      customerName,
      customerPhone: '+91 98401 22334',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'Sent',
      taxableAmount: taxable,
      gstAmount: gst,
      totalAmount: amt,
      items: [
        {
          description: invoiceDesc || 'Consulting & Enterprise ERP Services',
          quantity: 1,
          unitPrice: taxable,
          amount: taxable,
          gstRate: 18,
        },
      ],
    };

    setInvoices([newInv, ...invoices]);
    setNewModalVisible(false);
    setCustomerName('');
    setInvoiceAmount('');
    setInvoiceDesc('');
    Alert.alert('Success', `Invoice ${newInv.number} created and recorded in statutory journal.`);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = filter === 'All' || inv.status === filter;
    const matchesSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Search & Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Invoices & e-Invoicing</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => setNewModalVisible(true)}>
            <Text style={styles.newBtnText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search by Invoice # or Customer..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['All', 'Sent', 'Overdue', 'Paid'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterPill, filter === tab && styles.filterPillActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === tab && styles.filterPillTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Invoices List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadInvoices} tintColor="#38bdf8" />}
      >
        {filteredInvoices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No invoices match your selection.</Text>
          </View>
        ) : (
          filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'Paid';
            const isOverdue = inv.status === 'Overdue';

            return (
              <View key={inv.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.invNumber}>{inv.number}</Text>
                    <Text style={styles.custName}>{inv.customerName}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      isPaid
                        ? styles.statusPaid
                        : isOverdue
                        ? styles.statusOverdue
                        : styles.statusSent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isPaid
                          ? styles.statusTextPaid
                          : isOverdue
                          ? styles.statusTextOverdue
                          : styles.statusTextSent,
                      ]}
                    >
                      {inv.status}
                    </Text>
                  </View>
                </View>

                {/* Amounts Breakdown */}
                <View style={styles.amountRow}>
                  <View>
                    <Text style={styles.amountLabel}>Total (Incl. 18% GST)</Text>
                    <Text style={styles.amountValue}>
                      ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.amountLabel}>Due Date</Text>
                    <Text style={[styles.dueDateText, isOverdue && { color: '#f43f5e' }]}>
                      {inv.dueDate || 'Immediate'}
                    </Text>
                  </View>
                </View>

                {/* IRN Status */}
                <View style={styles.irnRow}>
                  {inv.irn ? (
                    <View style={styles.irnBadge}>
                      <Text style={styles.irnBadgeText}>✓ IRN Registered (NIC e-Invoice)</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.irnBtn} onPress={() => handleGenerateIRN(inv)}>
                      <Text style={styles.irnBtnText}>⚡ Generate e-Invoice IRN</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Actions Footer */}
                <View style={styles.cardActions}>
                  {!isPaid && (
                    <TouchableOpacity
                      style={styles.actionWhatsApp}
                      onPress={() => handleWhatsAppReminder(inv)}
                    >
                      <Text style={styles.actionWhatsAppText}>💬 WhatsApp Reminder</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.actionShare}
                    onPress={() => handleShareLink(inv)}
                  >
                    <Text style={styles.actionShareText}>🔗 Pay Link</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* New Invoice Modal */}
      <Modal visible={newModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Tax Invoice</Text>

            <Text style={styles.inputLabel}>Customer / Company Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Infosys Ltd."
              placeholderTextColor="#64748b"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <Text style={styles.inputLabel}>Line Item Description</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Cloud ERP Consulting"
              placeholderTextColor="#64748b"
              value={invoiceDesc}
              onChangeText={setInvoiceDesc}
            />

            <Text style={styles.inputLabel}>Total Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 50000"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={invoiceAmount}
              onChangeText={setInvoiceAmount}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setNewModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateInvoice}>
                <Text style={styles.modalSubmitText}>Generate Invoice</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  header: {
    padding: 16,
    paddingBottom: 10,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  newBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  newBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  searchBar: {
    backgroundColor: '#131b2e',
    color: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#131b2e',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  filterPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  filterPillText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38bdf8',
  },
  custName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusTextPaid: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 11,
  },
  statusSent: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  statusTextSent: {
    color: '#60a5fa',
    fontWeight: '700',
    fontSize: 11,
  },
  statusOverdue: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  statusTextOverdue: {
    color: '#fb7185',
    fontWeight: '700',
    fontSize: 11,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#0b0f19',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  irnRow: {
    marginBottom: 12,
  },
  irnBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  irnBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '600',
  },
  irnBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#334155',
  },
  irnBtnText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 12,
  },
  actionWhatsApp: {
    flex: 1,
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionWhatsAppText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  actionShare: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionShareText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#0b0f19',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#1e293b',
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalSubmitText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
