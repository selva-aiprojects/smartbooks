import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import DashboardScreen from './src/screens/DashboardScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';
import OCRScannerScreen from './src/screens/OCRScannerScreen';
import MoreMenuScreen from './src/screens/MoreMenuScreen';

type Tab = 'dashboard' | 'invoices' | 'ai' | 'ocr' | 'more';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />

      {/* Global Mobile Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SB</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>SmartBooks</Text>
            <Text style={styles.brandSubtitle}>Nexus Retail Ltd.</Text>
          </View>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Sync Live</Text>
        </View>
      </View>

      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {activeTab === 'dashboard' && <DashboardScreen onNavigateTab={setActiveTab} />}
        {activeTab === 'invoices' && <InvoicesScreen />}
        {activeTab === 'ai' && <AIAssistantScreen />}
        {activeTab === 'ocr' && <OCRScannerScreen />}
        {activeTab === 'more' && <MoreMenuScreen />}
      </View>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'dashboard' && styles.tabButtonActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text
            style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'invoices' && styles.tabButtonActive]}
          onPress={() => setActiveTab('invoices')}
        >
          <Text style={styles.tabIcon}>📄</Text>
          <Text
            style={[styles.tabLabel, activeTab === 'invoices' && styles.tabLabelActive]}
          >
            Invoices
          </Text>
        </TouchableOpacity>

        {/* Highlighted AI CFO Tab */}
        <TouchableOpacity
          style={[styles.tabButton, styles.aiTabButton, activeTab === 'ai' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ai')}
        >
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
          <Text style={styles.tabIcon}>🤖</Text>
          <Text
            style={[styles.tabLabel, activeTab === 'ai' && styles.tabLabelActive]}
          >
            AI CFO
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ocr' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ocr')}
        >
          <Text style={styles.tabIcon}>📷</Text>
          <Text
            style={[styles.tabLabel, activeTab === 'ocr' && styles.tabLabelActive]}
          >
            OCR Scan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'more' && styles.tabButtonActive]}
          onPress={() => setActiveTab('more')}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text
            style={[styles.tabLabel, activeTab === 'more' && styles.tabLabelActive]}
          >
            More
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0f19',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topBar: {
    height: 56,
    backgroundColor: '#0b0f19',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
  brandTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  screenContainer: {
    flex: 1,
  },
  bottomBar: {
    height: 64,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingBottom: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  aiTabButton: {
    position: 'relative',
  },
  aiBadge: {
    position: 'absolute',
    top: 4,
    right: 18,
    backgroundColor: '#6366f1',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  aiBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
});
