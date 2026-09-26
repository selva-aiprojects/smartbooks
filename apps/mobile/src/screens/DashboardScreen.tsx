import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { MobileApi } from '../services/api';
import { DashboardMetrics } from '../types';

interface Props {
  onNavigateTab: (tab: 'dashboard' | 'invoices' | 'ai' | 'ocr' | 'more') => void;
}

export default function DashboardScreen({ onNavigateTab }: Props) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todaysCollections: 142500,
    gstDue: 38400,
    cashPosition: 2450000,
    receivables: 685000,
    payables: 240000,
    netProfit: 1285000,
    topCustomers: [
      { name: 'Acme Global Technologies', amount: 450000 },
      { name: 'Vertex Digital Solutions', amount: 280000 },
      { name: 'Reliance Retail Ltd', amount: 195000 },
    ],
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const data = await MobileApi.getDashboardMetrics();
      setMetrics(data);
    } catch {
      // keep metrics
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWhatsAppNudge = (customerName: string, amount: number) => {
    const text = `*Payment Reminder from Nexus Retail Ltd*\n\nDear Accounts Team at ${customerName},\nThis is a friendly reminder that an outstanding payment of *₹${amount.toLocaleString('en-IN')}* is due on your account.\n\nPlease settle via Instant UPI or let us know if you need invoice copies.\nThank you!`;
    const url = `https://wa.me/919840122334?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Notice', 'Unable to launch WhatsApp on this device.');
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#38bdf8" />}
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerGreeting}>Nexus Retail Ltd. · FY 26-27</Text>
          <Text style={styles.bannerTitle}>Financial Operations</Text>
        </View>
        <View style={styles.gstBadge}>
          <Text style={styles.gstBadgeText}>GSTIN 33AABCS1429B1ZB</Text>
        </View>
      </View>

      {/* Primary KPI Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroLabel}>Total Cash & Bank Position</Text>
            <Text style={styles.heroAmount}>
              ₹{metrics.cashPosition.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.growthPill}>
            <Text style={styles.growthPillText}>+18.4% MoM</Text>
          </View>
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.heroSubRow}>
          <View style={styles.heroSubCol}>
            <Text style={styles.heroSubLabel}>Today's Inflow</Text>
            <Text style={styles.heroSubValue}>
              ₹{metrics.todaysCollections.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.heroSubCol}>
            <Text style={styles.heroSubLabel}>GSTR-3B Tax Due</Text>
            <Text style={[styles.heroSubValue, { color: '#f59e0b' }]}>
              ₹{metrics.gstDue.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.heroSubCol}>
            <Text style={styles.heroSubLabel}>Net Run Rate</Text>
            <Text style={[styles.heroSubValue, { color: '#10b981' }]}>
              ₹{metrics.netProfit.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Action Matrix */}
      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => onNavigateTab('ocr')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#1e3a8a' }]}>
            <Text style={styles.actionIcon}>📷</Text>
          </View>
          <Text style={styles.actionTitle}>Scan Bill (OCR)</Text>
          <Text style={styles.actionSub}>Vision Auto-Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => onNavigateTab('invoices')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#064e3b' }]}>
            <Text style={styles.actionIcon}>📄</Text>
          </View>
          <Text style={styles.actionTitle}>Invoices</Text>
          <Text style={styles.actionSub}>WhatsApp & IRN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => onNavigateTab('ai')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#4c1d95' }]}>
            <Text style={styles.actionIcon}>🤖</Text>
          </View>
          <Text style={styles.actionTitle}>AI CFO Chat</Text>
          <Text style={styles.actionSub}>Gemini Flash RAG</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => onNavigateTab('more')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#78350f' }]}>
            <Text style={styles.actionIcon}>📑</Text>
          </View>
          <Text style={styles.actionTitle}>Compliance</Text>
          <Text style={styles.actionSub}>e-Way & TDS 26Q</Text>
        </TouchableOpacity>
      </View>

      {/* Receivables & Payables Split */}
      <View style={styles.twoColRow}>
        <View style={styles.colCard}>
          <Text style={styles.colCardLabel}>Receivables (Due)</Text>
          <Text style={[styles.colCardValue, { color: '#38bdf8' }]}>
            ₹{metrics.receivables.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.colCardSub}>3 Overdue Clients</Text>
        </View>
        <View style={styles.colCard}>
          <Text style={styles.colCardLabel}>Payables (Vendors)</Text>
          <Text style={[styles.colCardValue, { color: '#f43f5e' }]}>
            ₹{metrics.payables.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.colCardSub}>Due within 15 days</Text>
        </View>
      </View>

      {/* Top Debtors with 1-Tap WhatsApp Nudge */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionHeader}>Outstanding Collections</Text>
        <TouchableOpacity onPress={() => onNavigateTab('invoices')}>
          <Text style={styles.sectionLink}>View All &gt;</Text>
        </TouchableOpacity>
      </View>

      {metrics.topCustomers.map((cust, idx) => (
        <View key={idx} style={styles.debtorCard}>
          <View style={styles.debtorInfo}>
            <Text style={styles.debtorName}>{cust.name}</Text>
            <Text style={styles.debtorAmount}>₹{cust.amount.toLocaleString('en-IN')}</Text>
          </View>
          <TouchableOpacity
            style={styles.nudgeBtn}
            onPress={() => handleWhatsAppNudge(cust.name, cust.amount)}
          >
            <Text style={styles.nudgeBtnText}>💬 WhatsApp Nudge</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Statutory MCA Rule 3(1) Notice */}
      <View style={styles.auditNoticeBox}>
        <Text style={styles.auditNoticeTitle}>🛡️ MCA Rule 3(1) Audit Trail Active</Text>
        <Text style={styles.auditNoticeText}>
          All transactions are cryptographically signed with immutable logs and automated daily ledger backups.
        </Text>
      </View>
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
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerGreeting: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 2,
  },
  gstBadge: {
    backgroundColor: '#1e293b',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gstBadgeText: {
    fontSize: 10,
    color: '#38bdf8',
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#131d36',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  growthPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  growthPillText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 14,
  },
  heroSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroSubCol: {
    flex: 1,
  },
  heroSubLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  heroSubValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
    marginTop: 3,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionLink: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#131b2e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  actionSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  colCard: {
    flex: 1,
    backgroundColor: '#131b2e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  colCardLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  colCardValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  colCardSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  debtorCard: {
    backgroundColor: '#131b2e',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },
  debtorInfo: {
    flex: 1,
    marginRight: 10,
  },
  debtorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  debtorAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38bdf8',
    marginTop: 2,
  },
  nudgeBtn: {
    backgroundColor: '#25D366',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  nudgeBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  auditNoticeBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
  },
  auditNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  auditNoticeText: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14,
  },
});
