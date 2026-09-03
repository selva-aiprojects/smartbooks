'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import SavingsIcon from '@mui/icons-material/Savings';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

interface GatewayItem {
  label: string;
  sub: string;
  path: string;
  icon: React.ReactNode;
  accent: string;
}

const leftMenu: GatewayItem[] = [
  { label: 'Accounting Vouchers', sub: 'Receipt · Payment · Sales · Purchase · Journal · Contra', path: '/vouchers/new', icon: <SwapHorizIcon />, accent: '#0284c7' },
  { label: 'Day Book', sub: 'All vouchers in date order', path: '/day-book', icon: <MenuBookIcon />, accent: '#7c3aed' },
  { label: 'Ledgers', sub: 'Account-wise ledger statements', path: '/ledger', icon: <AccountBalanceWalletIcon />, accent: '#0d9488' },
  { label: 'Stock / Inventory', sub: 'Items, godowns & stock summary', path: '/inventory', icon: <Inventory2Icon />, accent: '#ea580c' },
];

const rightMenu: GatewayItem[] = [
  { label: 'Statutory (GST / TDS)', sub: 'GST returns, output tax & ITC', path: '/tax', icon: <RequestQuoteIcon />, accent: '#dc2626' },
  { label: 'Reports', sub: 'Balance Sheet · P&L · Trial Balance', path: '/reports', icon: <AssessmentIcon />, accent: '#4f46e5' },
  { label: 'Sales & Purchase Registers', sub: 'Customer invoices & vendor bills', path: '/invoices', icon: <ReceiptLongIcon />, accent: '#0284c7' },
  { label: 'Cash / Bank & Payments', sub: 'Cash book, bank book & payments', path: '/payments', icon: <PaymentsIcon />, accent: '#16a34a' },
];

const voucherTypes = [
  { label: 'Payment Voucher', path: '/vouchers/new?type=payment' },
  { label: 'Receipt Voucher', path: '/vouchers/new?type=receipt' },
  { label: 'Sales Voucher', path: '/vouchers/new?type=sales' },
  { label: 'Purchase Voucher', path: '/vouchers/new?type=purchase' },
  { label: 'Journal Voucher', path: '/vouchers/new?type=journal' },
  { label: 'Contra Voucher', path: '/vouchers/new?type=contra' },
];

function formatFY(date: Date): string {
  const m = date.getMonth();
  const y = date.getFullYear();
  const startYear = m < 3 ? y - 1 : y;
  return `FY ${startYear}-${String(startYear + 1).slice(2)}`;
}

export default function GatewayPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { activeTenant } = useTenant();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    try {
      setShowGuide(localStorage.getItem('smartbooks_guide_dismissed') !== '1');
    } catch (e) { /* ignore */ }
  }, []);

  const dismissGuide = () => {
    setShowGuide(false);
    try { localStorage.setItem('smartbooks_guide_dismissed', '1'); } catch (e) { /* ignore */ }
  };

  const planLabel = activeTenant?.plan
    ? activeTenant.plan.charAt(0).toUpperCase() + activeTenant.plan.slice(1)
    : 'Starter';

  const navigate = (path: string) => router.push(path);

  const renderItem = (item: GatewayItem) => (
    <Grid item xs={12} sm={6} md={3} key={item.label}>
      <Paper
        onClick={() => navigate(item.path)}
        sx={{
          p: 2.5,
          borderRadius: 3,
          height: '100%',
          cursor: 'pointer',
          borderTop: `4px solid ${item.accent}`,
          transition: 'transform .15s, box-shadow .15s',
          '&:hover': { transform: 'translateY(-3px)', boxShadow: 5 },
        }}
      >
        <Box sx={{ color: item.accent, mb: 1.5 }}>{item.icon}</Box>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: 15 }}>
          {item.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.sub}
        </Typography>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#f8fafc' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HomeWorkIcon sx={{ fontSize: 44, color: '#38bdf8' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: 22, md: 28 } }}>
                {activeTenant?.name || 'Gateway of Tally'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                Gateway of {activeTenant?.name} &nbsp;·&nbsp; GSTIN {activeTenant?.gstin || '—'} &nbsp;·&nbsp; {formatFY(new Date())}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip label={`${planLabel} Plan`} size="small" sx={{ bgcolor: '#334155', color: '#e2e8f0', fontWeight: 'bold' }} />
            <Button
              variant="contained"
              startIcon={<SavingsIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
            >
              New Voucher
            </Button>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              {voucherTypes.map((v) => (
                <MenuItem key={v.label} onClick={() => { setAnchorEl(null); navigate(v.path); }}>
                  <ArrowForwardIosIcon sx={{ fontSize: 12, mr: 1, color: '#0284c7' }} />
                  {v.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>
      </Paper>

      {showGuide && (
        <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3, borderLeft: '5px solid #10b981', position: 'relative' }}>
          <IconButton size="small" onClick={dismissGuide} sx={{ position: 'absolute', top: 8, right: 8, color: '#94a3b8' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ pr: 3 }}>
            Try it in 60 seconds — just like Tally
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight="bold" sx={{ color: '#16a34a' }}>1 · Record a sale</Typography>
              <Typography variant="body2" color="text.secondary">Click <strong>New Voucher → Sales</strong>, pick a customer &amp; amount, Save.</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight="bold" sx={{ color: '#7c3aed' }}>2 · Open the Day Book</Typography>
              <Typography variant="body2" color="text.secondary">See your voucher appear in the chronological Day Book instantly.</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight="bold" sx={{ color: '#0d9488' }}>3 · Check your Ledger</Typography>
              <Typography variant="body2" color="text.secondary">The posting flows into the Ledger and your Balance Sheet / Trial Balance.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Button size="small" variant="contained" color="success" onClick={() => navigate('/vouchers/new?type=sales')}>
                Start Now
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 0', minWidth: 260 }}>
          <Typography variant="overline" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1, display: 'block', mb: 1 }}>
            Gateway of Tally
          </Typography>
          <Grid container spacing={2}>
            {leftMenu.map(renderItem)}
            {rightMenu.map(renderItem)}
          </Grid>
        </Box>

        <Box sx={{ width: { xs: '100%', md: 280 } }}>
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="overline" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
              Company Info
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" sx={{ mb: 0.5 }}><strong>{activeTenant?.name}</strong></Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              GSTIN: {activeTenant?.gstin || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Currency: ₹ (INR)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Schema: {activeTenant?.schema}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
              Want to try it?
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              1. New Voucher → Record a sale · 2. Open Day Book · 3. Check your Ledger
            </Typography>
            <Button fullWidth size="small" variant="outlined" sx={{ mb: 1 }} onClick={() => navigate('/reports')}>
              View Reports
            </Button>
            <Button fullWidth size="small" variant="outlined" startIcon={<SettingsIcon />} sx={{ mb: 1 }} onClick={() => navigate('/settings')}>
              Settings
            </Button>
            <Button fullWidth size="small" variant="text" color="inherit" startIcon={<LogoutIcon />} onClick={() => { logout(); router.push('/login'); }}>
              Quit (Logout)
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
