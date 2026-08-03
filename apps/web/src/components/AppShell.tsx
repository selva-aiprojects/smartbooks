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
  AddBusiness as AddTenantIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';

const DRAWER_WIDTH = 270;

const starterItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Chart of Accounts', path: '/accounts', icon: <AccountsIcon /> },
  { label: 'Journals', path: '/journal', icon: <JournalIcon /> },
  { label: 'Customer Invoices', path: '/invoices', icon: <InvoicesIcon /> },
  { label: 'Vendor Bills', path: '/bills', icon: <BillsIcon /> },
  { label: 'Financial Reports', path: '/reports', icon: <ReportsIcon /> },
  { label: 'AI Assistant', path: '/ai-assistant', icon: <AIIcon /> },
];

const growthItems = [
  { label: 'Inventory', path: '/inventory', icon: <InventoryIcon /> },
  { label: 'GST/VAT Tax Engine', path: '/tax', icon: <TaxIcon /> },
  { label: 'Bank Reconciliation', path: '/reconciliation', icon: <ReconciliationIcon /> },
  { label: 'Online Payments', path: '/payments', icon: <PaymentsIcon /> },
];

const enterpriseItems = [
  { label: 'OCR Receipt Scanner', path: '/ocr-scanner', icon: <OCRIcon /> },
  { label: 'Financial Forecasting', path: '/forecasting', icon: <ForecastIcon /> },
  { label: 'Workflow Automations', path: '/automations', icon: <AutomationIcon /> },
  { label: 'Banking APIs & Hub', path: '/integrations', icon: <IntegrationsIcon /> },
  { label: 'User Management', path: '/users', icon: <UsersIcon /> },
  { label: 'System Settings', path: '/settings', icon: <SettingsIcon /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { tenants, activeTenant, switchTenant } = useTenant();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activePlan, setActivePlan] = useState<'starter' | 'growth' | 'enterprise'>('enterprise');

  // Sync active plan with active tenant's plan
  useEffect(() => {
    if (activeTenant?.plan) {
      setActivePlan(activeTenant.plan);
    }
  }, [activeTenant]);

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

  const renderNavSection = (items: typeof starterItems, headerTitle: string, tierColor: string, badgeLabel: string, isLocked: boolean = false) => (
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
                href={isLocked ? '#plans' : item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 0.8,
                  backgroundColor: isActive ? '#0284c7' : 'transparent',
                  color: isLocked ? '#64748b' : (isActive ? '#ffffff' : '#cbd5e1'),
                  '&:hover': {
                    backgroundColor: isLocked ? 'rgba(255,255,255,0.05)' : (isActive ? '#0284c7' : '#334155'),
                    color: isLocked ? '#94a3b8' : '#ffffff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isLocked ? '#64748b' : (isActive ? '#ffffff' : '#94a3b8'), minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const showGrowth = activePlan === 'growth' || activePlan === 'enterprise';
  const showEnterprise = activePlan === 'enterprise';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', color: '#fff', overflow: 'hidden' }}>
      <Box sx={{ flexShrink: 0 }}>
        <Toolbar component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, textDecoration: 'none', minHeight: '64px !important' }}>
          <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks Logo" sx={{ width: 38, height: 38, borderRadius: 2.5, boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)', objectFit: 'contain' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              SmartBooks
            </Typography>
            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {activePlan} TIER
            </Typography>
          </Box>
        </Toolbar>
        
        <Divider sx={{ borderColor: '#1e293b' }} />

        <Box sx={{ p: 1.5 }}>
          <Chip 
            label={`${user?.company?.name || 'SmartBooks Demo Corp'} (${user?.company?.currency || 'INR'})`} 
            size="small" 
            onClick={() => setOpenTenantModal(true)}
            sx={{ 
              width: '100%', 
              backgroundColor: '#1e293b', 
              color: '#38bdf8', 
              fontWeight: 600,
              borderRadius: 1.5,
              cursor: 'pointer',
              py: 0.5,
              '&:hover': { backgroundColor: '#334155' }
            }} 
          />
        </Box>
      </Box>

      <Box sx={{ px: 1, py: 1, flexGrow: 1, overflowY: 'auto' }}>
        {renderNavSection(starterItems, 'STARTER / ESSENTIALS', '#10b981', 'Starter')}
        
        <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
        {renderNavSection(growthItems, 'GROWTH / PROFESSIONAL', '#0284c7', 'Growth', !showGrowth)}
        
        <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
        {renderNavSection(enterpriseItems, 'ENTERPRISE / PREMIUM', '#8b5cf6', 'Enterprise', !showEnterprise)}
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <Divider sx={{ borderColor: '#1e293b' }} />

        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36 }}>
            {user?.email ? user.email[0].toUpperCase() : 'A'}
          </Avatar>
          <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
            <Typography variant="body2" fontWeight="600" noWrap sx={{ color: '#f8fafc' }}>
              {user?.email || 'admin@smartbooks.com'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'capitalize' }}>
              {`${activePlan} Plan User`}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleLogout} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
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
              {[...starterItems, ...growthItems, ...enterpriseItems].find((n) => n.path === pathname)?.label || 'SmartBooks Workspace'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
            {/* Active Tenant Organization Selector Dropdown */}
            <FormControl size="small" sx={{ minWidth: 200, display: { xs: 'none', sm: 'flex' } }}>
              <Select
                value={activeTenant.id}
                onChange={(e) => switchTenant(e.target.value)}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#f1f5f9',
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

            <IconButton
              color="primary"
              onClick={() => setOpenTenantModal(true)}
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            >
              <AddTenantIcon fontSize="small" />
            </IconButton>

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

            {activePlan !== 'enterprise' && (
              <Button
                component={Link}
                href="/#plans"
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
                Upgrade Plan
              </Button>
            )}

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
              <MenuItem onClick={() => { handleUserMenuClose(); setOpenTenantModal(true); }}>
                <ListItemIcon><AddTenantIcon fontSize="small" /></ListItemIcon>
                Create New Tenant
              </MenuItem>
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
                helperText="Unique organization identifier"
              />

              <FormControl fullWidth>
                <InputLabel>Base Currency</InputLabel>
                <Select
                  value={newCurrency}
                  label="Base Currency"
                  onChange={(e) => setNewCurrency(e.target.value)}
                >
                  <MenuItem value="INR">INR (₹ - Indian Rupee)</MenuItem>
                  <MenuItem value="USD">USD ($ - US Dollar)</MenuItem>
                  <MenuItem value="EUR">EUR (€ - Euro)</MenuItem>
                  <MenuItem value="GBP">GBP (£ - British Pound)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Subscription Tier / Plan</InputLabel>
              <Select
                value={newPlan}
                label="Subscription Tier / Plan"
                onChange={(e) => setNewPlan(e.target.value as any)}
              >
                <MenuItem value="starter">Starter / Essentials — ₹1,999/mo (Chart of Accounts, Ledger, Invoicing)</MenuItem>
                <MenuItem value="growth">Growth / Professional — ₹4,999/mo (+ Inventory, Bank Rec, Tax Engine)</MenuItem>
                <MenuItem value="enterprise">Enterprise / Premium — ₹11,999/mo (+ AI OCR, Forecasting, Automations)</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 0.5 }}>
              <Chip label="Contact Information" size="small" sx={{ fontSize: 11, fontWeight: 600 }} />
            </Divider>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Contact Email ID"
                type="email"
                placeholder="billing@acme.in"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                fullWidth
                required
                helperText="Primary organization email"
              />

              <TextField
                label="Contact Phone Number"
                placeholder="+91 98765 43210"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                fullWidth
                helperText="Billing / support contact"
              />
            </Box>

            <Divider sx={{ my: 0.5 }}>
              <Chip label="Admin Credentials" size="small" sx={{ fontSize: 11, fontWeight: 600 }} />
            </Divider>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Admin Email Address"
                type="email"
                placeholder="admin@acme.in"
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
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={() => setOpenTenantModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isProvisioning} sx={{ px: 3, fontWeight: 600 }}>
              {isProvisioning ? 'Provisioning...' : 'Provision Tenant'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
