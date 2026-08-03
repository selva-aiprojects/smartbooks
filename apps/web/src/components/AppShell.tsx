'use client';

import { useState } from 'react';
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
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activePlan, setActivePlan] = useState<'starter' | 'growth' | 'enterprise'>('enterprise');

  // Tenant Creation Modal State
  const [openTenantModal, setOpenTenantModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newCurrency, setNewCurrency] = useState('INR');
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
          email: newAdminEmail,
          password: newAdminPassword
        })
      });
      if (res.ok) {
        alert(`New Tenant "${newCompanyName}" (${newCurrency}) provisioned successfully! Log in with ${newAdminEmail}`);
        setOpenTenantModal(false);
        setNewCompanyName('');
        setNewSubdomain('');
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

  const renderNavSection = (items: typeof starterItems, headerTitle: string, tierColor: string, badgeLabel: string) => (
    <Box sx={{ mb: 1.5 }}>
      <ListSubheader 
        sx={{ 
          bgcolor: 'transparent', 
          color: '#94a3b8', 
          fontSize: 10.5, 
          fontWeight: 700, 
          letterSpacing: 0.8, 
          lineHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 2
        }}
      >
        <span>{headerTitle}</span>
        <Chip label={badgeLabel} size="small" sx={{ height: 18, fontSize: 9.5, bgcolor: tierColor, color: '#fff', fontWeight: 'bold' }} />
      </ListSubheader>

      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
            <ListItemButton
              component={Link}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                py: 0.8,
                backgroundColor: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#ffffff' : '#cbd5e1',
                '&:hover': {
                  backgroundColor: isActive ? '#0284c7' : '#334155',
                  color: '#ffffff',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#ffffff' : '#94a3b8', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </Box>
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', color: '#fff' }}>
      <Toolbar component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2, textDecoration: 'none' }}>
        <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks Logo" sx={{ width: 40, height: 40, borderRadius: 2.5, boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)', objectFit: 'contain' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            SmartBooks
          </Typography>
          <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700, fontSize: 10, letterSpacing: 0.5 }}>
            ENTERPRISE
          </Typography>
        </Box>
      </Toolbar>
      
      <Divider sx={{ borderColor: '#1e293b' }} />

      <Box sx={{ p: 2 }}>
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
            '&:hover': { backgroundColor: '#334155' }
          }} 
        />
      </Box>

      <Box sx={{ px: 1, flexGrow: 1, overflowY: 'auto' }}>
        {renderNavSection(starterItems, 'STARTER / ESSENTIALS', '#10b981', 'Starter')}
        <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
        {renderNavSection(growthItems, 'GROWTH / PROFESSIONAL', '#0284c7', 'Growth')}
        <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
        {renderNavSection(enterpriseItems, 'ENTERPRISE / PREMIUM', '#8b5cf6', 'Enterprise')}
      </Box>

      <Divider sx={{ borderColor: '#1e293b' }} />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36 }}>
          {user?.email ? user.email[0].toUpperCase() : 'A'}
        </Avatar>
        <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
          <Typography variant="body2" fontWeight="600" noWrap sx={{ color: '#f8fafc' }}>
            {user?.email || 'admin@smartbooks.com'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            Enterprise Plan User
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleLogout} sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" fontWeight="600" color="text.primary">
            {[...starterItems, ...growthItems, ...enterpriseItems].find((n) => n.path === pathname)?.label || 'SmartBooks Workspace'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddTenantIcon />}
              onClick={() => setOpenTenantModal(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              New Tenant
            </Button>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={activePlan}
                onChange={(e) => setActivePlan(e.target.value as any)}
                sx={{ height: 34, fontSize: 13, fontWeight: 600 }}
              >
                <MenuItem value="starter">Starter / Essentials</MenuItem>
                <MenuItem value="growth">Growth / Professional</MenuItem>
                <MenuItem value="enterprise">Enterprise / Premium</MenuItem>
              </Select>
            </FormControl>

            <IconButton onClick={handleUserMenuOpen}>
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
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>

      {/* Create New Tenant / Organization Modal */}
      <Dialog open={openTenantModal} onClose={() => setOpenTenantModal(false)} maxWidth="xs" fullWidth>
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

            <TextField
              label="Tenant Subdomain ID"
              placeholder="e.g. acme-india"
              value={newSubdomain}
              onChange={(e) => setNewSubdomain(e.target.value)}
              fullWidth
              helperText="Unique identifier for organization isolation"
            />

            <FormControl fullWidth>
              <InputLabel>Base Accounting Currency</InputLabel>
              <Select
                value={newCurrency}
                label="Base Accounting Currency"
                onChange={(e) => setNewCurrency(e.target.value)}
              >
                <MenuItem value="INR">INR (₹ - Indian Rupee)</MenuItem>
                <MenuItem value="USD">USD ($ - US Dollar)</MenuItem>
                <MenuItem value="EUR">EUR (€ - Euro)</MenuItem>
                <MenuItem value="GBP">GBP (£ - British Pound)</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 1 }} />

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
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenTenantModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isProvisioning}>
              {isProvisioning ? 'Provisioning...' : 'Provision Tenant'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
