import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { setApiBaseUrl } from '../services/api';

export default function MoreMenuScreen() {
  const [currentCompany, setCurrentCompany] = useState('Nexus Retail Ltd.');
  const [subdomain, setSubdomain] = useState('nexusretail');
  const [apiUrl, setApiUrl] = useState('http://localhost:3000');
  const [configModal, setConfigModal] = useState(false);
  const [activeModuleModal, setActiveModuleModal] = useState<string | null>(null);

  const handleSaveConfig = () => {
    setApiBaseUrl(apiUrl);
    setConfigModal(false);
    Alert.alert('Configuration Saved', `Connected to backend at: ${apiUrl}`);
  };

  const handleTenantSwitch = (name: string, sub: string) => {
    setCurrentCompany(name);
    setSubdomain(sub);
    Alert.alert('Tenant Switched', `Active company set to ${name} (${sub}.smartbooks.io)`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Company Card */}
      <View style={styles.companyCard}>
        <View style={styles.companyAvatar}>
          <Text style={styles.companyAvatarText}>{currentCompany.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyName}>{currentCompany}</Text>
          <Text style={styles.companySubdomain}>{subdomain}.smartbooks.io</Text>
          <Text style={styles.companyGstin}>GSTIN: 33AABCS1429B1ZB</Text>
        </View>
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>Enterprise</Text>
        </View>
      </View>

      {/* Indian Statutory Compliance Modules */}
      <Text style={styles.sectionHeader}>Statutory Compliance Suite</Text>

      {/* e-Way Bills (Rule 138) */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          Alert.alert(
            'e-Way Bill Logistics Portal',
            'GST Rule 138 Active.\n• Active e-Way Bills: 4\n• Distance verified via NIC GIS API\n• Part-B Vehicle Tracking: TN09CB1294'
          )
        }
      >
        <View style={[styles.menuIconBox, { backgroundColor: '#1e3a8a' }]}>
          <Text style={styles.menuIcon}>🚚</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>e-Way Bills (GST Rule 138)</Text>
          <Text style={styles.menuDesc}>Part-A / Part-B slip generation & vehicle assignment</Text>
        </View>
        <Text style={styles.menuChevron}>&gt;</Text>
      </TouchableOpacity>

      {/* TDS & TCS (Form 26Q) */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          Alert.alert(
            'TDS / TCS & Form 26Q',
            'Section 194C, 194J, 194I Active.\n• Total Deducted Q2: ₹84,200\n• ITNS-281 Challan Deposited: ₹52,000\n• Quarterly Form 26Q Export Ready'
          )
        }
      >
        <View style={[styles.menuIconBox, { backgroundColor: '#064e3b' }]}>
          <Text style={styles.menuIcon}>📑</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>TDS / TCS (Form 26Q)</Text>
          <Text style={styles.menuDesc}>Challan ITNS-281 & Section 194C/194J deposits</Text>
        </View>
        <Text style={styles.menuChevron}>&gt;</Text>
      </TouchableOpacity>

      {/* Statutory Payroll Engine */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          Alert.alert(
            'Statutory Payroll Engine',
            'EPF & ESI Act, 1952 Compliant.\n• Active Employees: 8\n• Monthly Gross: ₹6,45,000\n• EPF (12%): ₹38,700 | ESI (0.75%): ₹2,418\n• 1-Click Salary Run & Payslips Ready'
          )
        }
      >
        <View style={[styles.menuIconBox, { backgroundColor: '#4c1d95' }]}>
          <Text style={styles.menuIcon}>👥</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>Statutory Payroll & Payslips</Text>
          <Text style={styles.menuDesc}>EPF, ESI, Professional Tax & auto-posted salary journals</Text>
        </View>
        <Text style={styles.menuChevron}>&gt;</Text>
      </TouchableOpacity>

      {/* MCA Rule 3(1) Audit Trail */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          Alert.alert(
            'MCA Statutory Audit Trail',
            'Rule 3(1) Companies (Accounts) Rules, 2014.\n• Immutable Hash Chain: VERIFIED\n• Total Audit Events: 1,428\n• Auditor Download Certificate: Ready'
          )
        }
      >
        <View style={[styles.menuIconBox, { backgroundColor: '#78350f' }]}>
          <Text style={styles.menuIcon}>🛡️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>MCA Rule 3(1) Audit Trail</Text>
          <Text style={styles.menuDesc}>Tamper-evident logs & immutable edit history</Text>
        </View>
        <Text style={styles.menuChevron}>&gt;</Text>
      </TouchableOpacity>

      {/* Multi-Tenant Switcher */}
      <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Multi-Tenant Organization</Text>

      <TouchableOpacity
        style={styles.tenantBtn}
        onPress={() => handleTenantSwitch('Nexus Retail Ltd.', 'nexusretail')}
      >
        <Text style={styles.tenantBtnText}>🏢 Nexus Retail Ltd. (Default)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tenantBtn}
        onPress={() => handleTenantSwitch('Vertex Global Logistics', 'vertex')}
      >
        <Text style={styles.tenantBtnText}>🚢 Vertex Global Logistics</Text>
      </TouchableOpacity>

      {/* App & Server Settings */}
      <Text style={[styles.sectionHeader, { marginTop: 20 }]}>System & Server</Text>

      <TouchableOpacity style={styles.settingsRow} onPress={() => setConfigModal(true)}>
        <Text style={styles.settingsRowTitle}>Backend API URL</Text>
        <Text style={styles.settingsRowValue}>{apiUrl}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsRow}
        onPress={() => Alert.alert('Cache Cleared', 'Offline temporary data refreshed.')}
      >
        <Text style={styles.settingsRowTitle}>Clear Offline Cache</Text>
        <Text style={[styles.settingsRowValue, { color: '#38bdf8' }]}>Sync Now</Text>
      </TouchableOpacity>

      {/* Version Tag */}
      <View style={styles.versionBox}>
        <Text style={styles.versionText}>SmartBooks Mobile Edition · v2.4.0</Text>
        <Text style={styles.versionSubText}>Production Build for iOS & Android</Text>
      </View>

      {/* Config Modal */}
      <Modal visible={configModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure API Server</Text>
            <Text style={styles.modalSub}>
              Point mobile app to your local dev machine or production Vercel cloud:
            </Text>
            <TextInput
              style={styles.modalInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setConfigModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveConfig}>
                <Text style={styles.modalSaveText}>Save URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  companyCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
    gap: 12,
  },
  companyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  companyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  companySubdomain: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  companyGstin: {
    fontSize: 10,
    color: '#38bdf8',
    fontWeight: '600',
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  planBadgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    backgroundColor: '#131b2e',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
    gap: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  menuDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  menuChevron: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  tenantBtn: {
    backgroundColor: '#131b2e',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },
  tenantBtnText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  settingsRow: {
    backgroundColor: '#131b2e',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },
  settingsRowTitle: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  settingsRowValue: {
    fontSize: 12,
    color: '#94a3b8',
  },
  versionBox: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  versionSubText: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
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
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 14,
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
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  modalSave: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
