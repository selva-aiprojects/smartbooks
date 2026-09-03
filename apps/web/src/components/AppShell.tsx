'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  ListSubheader,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Book as JournalIcon,
  Receipt as InvoicesIcon,
  ReceiptLong as BillsIcon,
  CompareArrows as ReconciliationIcon,
  Psychology as AIIcon,
  AddBox as NewEntryIcon,
  AccountBalance as AccountsIcon,
  Assessment as ReportsIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Inventory as InventoryIcon,
  Percent as TaxIcon,
  Payment as PaymentsIcon,
  Scanner as OCRIcon,
  ShowChart as ForecastIcon,
  AutoMode as AutomationIcon,
  Extension as IntegrationsIcon,
  AddBusiness as AddTenantIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  AdminPanelSettings as NexusAdminIcon,
  ConfirmationNumber as TicketIcon,
  Dns as DnsIcon,
  BusinessCenter as BusinessCenterIcon,
  HomeWork as GatewayIcon,
  MenuBook as DayBookIcon,
  AccountBalanceWallet as LedgerIcon,
  SwapHoriz as VoucherIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';

const DRAWER_WIDTH = 270;

const gatewayItems = [
  { label: 'Gateway of Tally', path: '/gateway', icon: <GatewayIcon /> },
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
];

const voucherItems = [
  { label: 'Accounting Vouchers', path: '/vouchers', icon: <VoucherIcon /> },
];

const booksItems = [
  { label: 'Day Book', path: '/day-book', icon: <DayBookIcon /> },
  { label: 'Ledgers', path: '/ledger', icon: <LedgerIcon /> },
  { label: 'Journals', path: '/journal', icon: <JournalIcon /> },
  { label: 'Chart of Accounts', path: '/accounts', icon: <AccountsIcon /> },
];

const registerItems = [
  { label: 'Customer Invoices', path: '/invoices', icon: <InvoicesIcon /> },
  { label: 'Vendor Bills', path: '/bills', icon: <BillsIcon /> },
  { label: 'Cash / Bank & Payments', path: '/payments', icon: <PaymentsIcon /> },
];

const statutoryItems = [
  { label: 'GST & Statutory', path: '/tax', icon: <TaxIcon /> },
  { label: 'Bank Reconciliation', path: '/reconciliation', icon: <ReconciliationIcon /> },
];

const reportItems = [
  { label: 'Financial Reports', path: '/reports', icon: <ReportsIcon /> },
];

const advancedItems = [
  { label: 'Stock / Inventory', path: '/inventory', icon: <InventoryIcon /> },
  { label: 'AI Assistant', path: '/ai-assistant', icon: <AIIcon /> },
  { label: 'OCR Receipt Scanner', path: '/ocr-scanner', icon: <OCRIcon /> },
  { label: 'Financial Forecasting', path: '/forecasting', icon: <ForecastIcon /> },
  { label: 'Workflow Automations', path: '/automations', icon: <AutomationIcon /> },
  { label: 'Banking APIs & Hub', path: '/integrations', icon: <IntegrationsIcon /> },
  { label: 'User Management', path: '/users', icon: <UsersIcon /> },
  { label: 'System Settings', path: '/settings', icon: <SettingsIcon /> },
];

// Nexus Platform Admin – dedicated governance nav (no operational accounting screens)
const nexusAdminItems = [
  { label: 'Nexus Admin Console', path: '/nexus-admin', icon: <NexusAdminIcon /> },
];
const nexusAdminOpsItems = [
  { label: 'All Tenants Directory', path: '/nexus-admin', icon: <BusinessCenterIcon /> },
  { label: 'Support Tickets', path: '/nexus-admin', icon: <TicketIcon /> },
  { label: 'Schema Health Monitor', path: '/nexus-admin', icon: <DnsIcon /> },
  { label: 'Platform Settings', path: '/settings', icon: <SettingsIcon /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { tenants, visibleTenants, activeTenant, isSuperAdmin, setIsSuperAdmin, switchTenant } = useTenant();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activePlan, setActivePlan] = useState<'starter' | 'growth' | 'enterprise'>('enterprise');

  // Sync active plan with active tenant's plan
  useEffect(() => {
    if (activeTenant?.plan) {
      setActivePlan(activeTenant.plan);
    }
  }, [activeTenant]);

  // Sync isSuperAdmin from AuthContext user object — covers existing sessions on refresh
  useEffect(() => {
    if (!user) return;
    const isAdmin =
      !!user.isSuperAdmin ||
      user.email?.toLowerCase().includes('smartbooks.com') ||
      user.email?.toLowerCase().includes('smartbooks.ai') ||
      user.email?.toLowerCase().includes('superadmin');
    setIsSuperAdmin(isAdmin);
  }, [user]);

  // Tenant Creation Modal State
  const [openTenantModal, setOpenTenantModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newCurrency, setNewCurrency] = useState('INR');
  const [newPlan, setNewPlan] = useState<'starter' | 'growth' | 'enterprise'>('enterprise');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  const isPublicPage = pathname === '/' || pathname === '/login';
  if (isPublicPage) {
    return <>{children}</>;
  }

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleUserMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    router.push('/login');
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newAdminEmail || !newAdminPassword) return;
    setIsProvisioning(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: newCompanyName,
          subdomain: newSubdomain || newCompanyName.toLowerCase().replace(/\s+/g, '-'),
          currency: newCurrency,
          plan: newPlan,
          contactEmail: newContactEmail || newAdminEmail,
          contactPhone: newContactPhone,
          email: newAdminEmail,
          password: newAdminPassword
        })
      });
      if (res.ok) {
        alert(`New Tenant "${newCompanyName}" (${newPlan.toUpperCase()} Plan, ${newCurrency}) provisioned successfully! Contact: ${newContactEmail || newAdminEmail}`);
        setOpenTenantModal(false);
        setNewCompanyName('');
        setNewSubdomain('');
        setNewContactEmail('');
        setNewContactPhone('');
        setNewAdminEmail('');
        setNewAdminPassword('');
      } else {
        const err = await res.json();
        alert(`Tenant creation failed: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend server.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const renderNavSection = (items: typeof gatewayItems, headerTitle: string, tierColor: string, badgeLabel: string, isLocked: boolean = false) => (
    <Box sx={{ mb: 1.5, opacity: isLocked ? 0.6 : 1 }}>
      <ListSubheader 
        disableSticky
        sx={{ 
          bgcolor: '#0f172a', 
          color: '#94a3b8', 
          fontSize: 10.5, 
          fontWeight: 700, 
          letterSpacing: 0.8, 
          lineHeight: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          position: 'static'
        }}
      >
        <span>{headerTitle}</span>
        <Chip label={isLocked ? 'Upgrade Plan' : badgeLabel} size="small" sx={{ height: 18, fontSize: 9.5, bgcolor: isLocked ? '#64748b' : tierColor, color: '#fff', fontWeight: 'bold' }} />
      </ListSubheader>

      <List disablePadding>
        {items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                component={Link}
                href={isLocked ? '/#plans' : item.path}
                selected={isActive}
                sx={{
                  borderRadius: 1.5,
                  py: 0.75,
                  px: 1.5,
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  bgcolor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    color: '#f8fafc',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#38bdf8' : '#94a3b8', '& svg': { fontSize: 20 } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', color: '#f8fafc' }}>
      {/* App Logo Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
        <Box component={Link} href={isSuperAdmin ? '/nexus-admin' : '/gateway'} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
          <Box
            component="img"
            src="/logo-icon-badge.png"
            alt="SmartBooks AI Logo"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              objectFit: 'contain',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
            }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#ffffff', lineHeight: 1.2 }}>
              SmartBooks AI
            </Typography>
            <Typography variant="caption" sx={{ color: isSuperAdmin ? '#c4b5fd' : '#38bdf8', fontWeight: 'bold' }}>
              {isSuperAdmin ? 'Nexus Admin Console' : 'Autonomous ERP'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ px: 1, py: 1, flexGrow: 1, overflowY: 'auto' }}>
        {isSuperAdmin ? (
          // Nexus Platform Admin view – governance tools only, no accounting screens
          <>
            {renderNavSection(nexusAdminItems, 'CONSOLE', '#7c3aed', 'Nexus Admin')}
            <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
            {renderNavSection(nexusAdminOpsItems, 'OPERATIONS', '#64748b', 'Admin')}
          </>
        ) : (
          // Tenant User view – operational accounting screens (Tally-style groups)
          <>
            {renderNavSection(gatewayItems, 'GATEWAY', '#10b981', 'Home')}
            <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
            {renderNavSection(voucherItems, 'ACCOUNTING VOUCHERS', '#0284c7', 'F7-F10')}
            <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
            {renderNavSection(booksItems, 'ACCOUNTING BOOKS', '#0d9488', 'Books')}
            <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
            {renderNavSection(registerItems, 'REGISTERS', '#7c3aed', 'Registers')}
            <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
            {renderNavSection(statutoryItems, 'STATUTORY & MIS', '#dc2626', 'GST/TDS')}
            <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
            {renderNavSection(reportItems, 'REPORTS', '#4f46e5', 'Reports')}
            <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
            {renderNavSection(advancedItems, 'AI & PREMIUM TOOLS', '#8b5cf6', 'Premium', false)}
          </>
        )}
      </Box>

      {/* User Footer Profile */}
      <Box sx={{ flexShrink: 0, borderTop: '1px solid #1e293b', p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36 }}>
          {user?.email ? user.email[0].toUpperCase() : 'A'}
        </Avatar>
        <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
          <Typography variant="body2" fontWeight="600" noWrap sx={{ color: '#f8fafc' }}>
            {user?.email || 'admin@smartbooks.ai'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
            {isSuperAdmin ? 'Platform Super Admin' : 'Tenant Owner'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleLogout} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', overflowX: 'hidden' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          boxSizing: 'border-box'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 }, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flexShrink: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography 
              variant="h6" 
              fontWeight="600" 
              color="text.primary" 
              noWrap 
              sx={{ 
                fontSize: { xs: '0.95rem', sm: '1.25rem' },
                flexShrink: 1, 
                minWidth: 0 
              }}
            >
              {[...gatewayItems, ...voucherItems, ...booksItems, ...registerItems, ...statutoryItems, ...reportItems, ...advancedItems].find((n) => n.path === pathname)?.label || 'SmartBooks Workspace'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
            {/* Multi-Tenant Security & Isolation Control */}
            {isSuperAdmin ? (
              <FormControl size="small" sx={{ minWidth: 200, display: { xs: 'none', sm: 'flex' } }}>
                <Select
                  value={activeTenant.id}
                  onChange={(e) => switchTenant(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#eff6ff',
                    borderColor: '#93c5fd',
                    fontWeight: 700,
                    fontSize: 13,
                    '& .MuiSelect-select': { py: 0.75, display: 'flex', alignItems: 'center', gap: 1 }
                  }}
                >
                  {tenants.map((t) => (
                    <MenuItem key={t.id} value={t.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                      <Typography variant="subtitle2" fontWeight="700">{t.name}</Typography>
                      <Typography variant="caption" color="text.secondary" fontSize={11}>
                        {t.edition} · Schema: {t.schema}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              /* Enforced Tenant Isolation Badge */
              <Box 
                sx={{ 
                  display: { xs: 'none', sm: 'flex' }, 
                  alignItems: 'center', 
                  gap: 1, 
                  px: 1.5, 
                  py: 0.6, 
                  bgcolor: '#f1f5f9', 
                  borderRadius: 2, 
                  border: '1px solid #cbd5e1' 
                }}
              >
                <LockIcon sx={{ fontSize: 16, color: '#64748b' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" fontSize={12} color="text.primary" lineHeight={1.2}>
                    {activeTenant.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize={10} display="block" lineHeight={1.1}>
                    {activeTenant.edition} · Schema: {activeTenant.schema}
                  </Typography>
                </Box>
                <Chip 
                  label="Isolated Tenant" 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                  sx={{ height: 20, fontSize: 10, fontWeight: 700, ml: 0.5 }} 
                />
              </Box>
            )}

            {/* Toggle Super Admin Mode (Restricted Security Control) */}
            {user?.isSuperAdmin || user?.email === 'superadmin@smartbooks.ai' ? (
              <Chip
                icon={<SecurityIcon style={{ fontSize: 14 }} />}
                label={isSuperAdmin ? "Super Admin" : "Tenant Mode"}
                size="small"
                color={isSuperAdmin ? "warning" : "default"}
                onClick={() => setIsSuperAdmin(!isSuperAdmin)}
                sx={{ cursor: 'pointer', fontWeight: 700, fontSize: 11, display: { xs: 'none', md: 'inline-flex' } }}
              />
            ) : (
              <Chip
                icon={<LockIcon style={{ fontSize: 14 }} />}
                label="Tenant Isolated"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: 11, display: { xs: 'none', md: 'inline-flex' } }}
              />
            )}

            {isSuperAdmin && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddTenantIcon />}
                onClick={() => setOpenTenantModal(true)}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  whiteSpace: 'nowrap',
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              >
                New Tenant
              </Button>
            )}

            {/* Active Subscription Plan Badge */}
            <Chip 
              label={`${activePlan.toUpperCase()} TIER`} 
              size="small" 
              sx={{ 
                height: 28, 
                fontWeight: 700, 
                fontSize: 11,
                bgcolor: activePlan === 'starter' ? 'rgba(16, 185, 129, 0.12)' : (activePlan === 'growth' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(139, 92, 246, 0.12)'),
                color: activePlan === 'starter' ? '#059669' : (activePlan === 'growth' ? '#0284c7' : '#7c3aed'),
                border: '1px solid',
                borderColor: activePlan === 'starter' ? '#10b981' : (activePlan === 'growth' ? '#0284c7' : '#8b5cf6'),
                display: { xs: 'none', sm: 'inline-flex' }
              }} 
            />

            <Button
              component={Link}
              href="/settings?tab=subscription"
              variant="contained"
              size="small"
              sx={{ 
                bgcolor: '#8b5cf6', 
                '&:hover': { bgcolor: '#7c3aed' },
                borderRadius: 2, 
                textTransform: 'none', 
                fontWeight: 700, 
                fontSize: 12,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.35)'
              }}
            >
              Subscription Access
            </Button>

            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0.5 }}>
              <Avatar sx={{ bgcolor: '#0284c7', width: 32, height: 32, fontSize: 14 }}>
                {user?.email ? user.email[0].toUpperCase() : 'A'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {isSuperAdmin && (
                <MenuItem onClick={() => { handleUserMenuClose(); setOpenTenantModal(true); }}>
                  <ListItemIcon><AddTenantIcon fontSize="small" /></ListItemIcon>
                  Create New Tenant
                </MenuItem>
              )}
              <MenuItem component={Link} href="/settings" onClick={handleUserMenuClose}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderWidth: 0 },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          maxWidth: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          overflowX: 'auto',
          boxSizing: 'border-box',
          mt: '64px',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>

      {/* Create New Tenant / Organization Modal */}
      <Dialog open={openTenantModal} onClose={() => setOpenTenantModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Tenant Organization</DialogTitle>
        <Box component="form" onSubmit={handleCreateTenant}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Organization / Company Name"
              placeholder="e.g. Acme India Pvt Ltd"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              fullWidth
              required
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Tenant Subdomain ID"
                placeholder="e.g. acme-india"
                value={newSubdomain}
                onChange={(e) => setNewSubdomain(e.target.value)}
                fullWidth
                helperText="Auto-generated if left blank"
              />
              <FormControl fullWidth>
                <InputLabel id="currency-label">Base Ledger Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  value={newCurrency}
                  label="Base Ledger Currency"
                  onChange={(e) => setNewCurrency(e.target.value)}
                >
                  <MenuItem value="INR">INR (₹) - Indian Rupee</MenuItem>
                  <MenuItem value="USD">USD ($) - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR (€) - Euro</MenuItem>
                  <MenuItem value="GBP">GBP (£) - British Pound</MenuItem>
                  <MenuItem value="AED">AED (AED) - UAE Dirham</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Contact Email"
                type="email"
                placeholder="billing@company.com"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="Contact Phone"
                placeholder="+91 98765 43210"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                fullWidth
              />
            </Box>

            <Divider sx={{ my: 0.5 }} />
            <Typography variant="subtitle2" color="primary" fontWeight="bold">
              Initial Admin Credentials
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Admin Email"
                type="email"
                placeholder="admin@company.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Admin Password"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                fullWidth
                required
              />
            </Box>

            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="plan-label">Subscription Tier</InputLabel>
              <Select
                labelId="plan-label"
                value={newPlan}
                label="Subscription Tier"
                onChange={(e) => setNewPlan(e.target.value as 'starter' | 'growth' | 'enterprise')}
              >
                <MenuItem value="starter">Starter Plan (Single User, Base Books)</MenuItem>
                <MenuItem value="growth">Growth Plan (Multi-Branch, Tax Engine)</MenuItem>
                <MenuItem value="enterprise">Enterprise Plan (AI Autonomous ERP)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenTenantModal(false)} disabled={isProvisioning}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isProvisioning}>
              {isProvisioning ? 'Provisioning Schema...' : 'Provision Tenant'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
