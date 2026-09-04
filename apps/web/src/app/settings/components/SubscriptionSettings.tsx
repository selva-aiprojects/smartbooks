'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  WorkspacePremium as PremiumIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  Upgrade as UpgradeIcon,
  VerifiedUser as VerifiedIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { apiFetch } from '../../../lib/api';

interface PlanInfo {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  seatLimit: number;
  billingCycle: string;
  subscriptionStatus: string;
  gstin?: string | null;
  displayName?: string | null;
  users?: { id: string }[];
}

export default function SubscriptionSettings() {
  const [company, setCompany] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'enterprise'>('growth');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/me/company');
        if (res.ok) {
          const c = await res.json();
          setCompany(c);
          setSelectedPlan((c.plan as 'starter' | 'growth' | 'enterprise') || 'growth');
        }
      } catch (e) { /* ignore */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activePlan = company?.plan || 'growth';
  const userCount = company?.users?.length || 0;
  const seatLimit = company?.seatLimit || (activePlan === 'starter' ? 5 : activePlan === 'growth' ? 15 : 100);
  const seatPercentage = Math.min(Math.round((userCount / seatLimit) * 100), 100);

  const handlePlanUpgrade = async () => {
    if (!company) return;
    setIsUpdating(true);
    setNotice(null);
    const planSeatLimit = selectedPlan === 'starter' ? 5 : selectedPlan === 'growth' ? 15 : 100;
    try {
      const res = await apiFetch(`/api/me/company`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, seatLimit: planSeatLimit }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || 'Failed to update subscription');
        return;
      }
      const data = await res.json();
      setCompany(data.company);
      setOpenUpgradeModal(false);
      alert(`Tenant Subscription updated to ${selectedPlan.toUpperCase()} Plan!`);
    } catch (e) {
      alert('Unable to reach the backend API');
    } finally {
      setIsUpdating(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return { main: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' };
      case 'growth': return { main: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
      case 'enterprise': return { main: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
      default: return { main: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
    }
  };

  const planTheme = getPlanColor(activePlan);

  const MODULE_MATRIX = [
    { module: 'Chart of Accounts & General Ledger', starter: true, growth: true, enterprise: true },
    { module: 'Customer Invoices & Vendor Bills', starter: true, growth: true, enterprise: true },
    { module: 'Financial Reports & Balance Sheet', starter: true, growth: true, enterprise: true },
    { module: 'Point of Sale (POS) Billing', starter: false, growth: true, enterprise: true },
    { module: 'GST/VAT Tax Engine & GSTR-3B Auto-Filing', starter: false, growth: true, enterprise: true },
    { module: '1-Click Bank Reconciliation', starter: false, growth: true, enterprise: true },
    { module: 'Multi-Branch Inventory & Stock Valuation', starter: false, growth: true, enterprise: true },
    { module: 'OCR Smart Receipt & Invoice Scanner', starter: false, growth: false, enterprise: true },
    { module: 'Cashflow AI Forecasting & Scenario Engine', starter: false, growth: false, enterprise: true },
    { module: 'Workflow Automations & Direct Bank APIs', starter: false, growth: false, enterprise: true }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Overview Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3.5,
          background: `linear-gradient(135deg, ${planTheme.bg} 0%, #ffffff 100%)`,
          border: `1px solid ${planTheme.border}`
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <PremiumIcon sx={{ fontSize: 32, color: planTheme.main }} />
              <Typography variant="h5" fontWeight="800" color="text.primary">
                Nexus & Subscription Access Management
              </Typography>
              <Chip
                label={`${activePlan.toUpperCase()} TIER`}
                size="small"
                sx={{
                  bgcolor: planTheme.main,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 11
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Organization: <strong>{company?.name}</strong> ({company?.subdomain})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip icon={<StorageIcon style={{ fontSize: 14 }} />} label={`Schema: ${company?.subdomain}`} size="small" variant="outlined" />
              <Chip icon={<VerifiedIcon style={{ fontSize: 14 }} />} label={`Status: ${company?.subscriptionStatus || 'Active'}`} size="small" color="success" />
              <Chip icon={<SpeedIcon style={{ fontSize: 14 }} />} label={`Cycle: ${company?.billingCycle || 'Annual'}`} size="small" variant="outlined" />
            </Box>
          </Grid>

          <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
            <Button
              variant="contained"
              startIcon={<UpgradeIcon />}
              onClick={() => setOpenUpgradeModal(true)}
              sx={{
                borderRadius: 2.5,
                px: 3,
                py: 1.2,
                bgcolor: planTheme.main,
                '&:hover': { opacity: 0.9, bgcolor: planTheme.main },
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: `0 4px 14px ${planTheme.main}40`
              }}
            >
              Manage / Upgrade Subscription
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Grid Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Seat Usage & Capacity Card */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3.5, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight="700">
                    User Seat Allocation
                  </Typography>
                </Box>
                <Chip
                  label={`${userCount} / ${seatLimit} Seats Used`}
                  size="small"
                  color={seatPercentage >= 90 ? 'warning' : 'primary'}
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Active users provisioned under the <strong>{company?.name}</strong> tenant workspace.
              </Typography>

              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={seatPercentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': { bgcolor: planTheme.main, borderRadius: 5 }
                  }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                {seatLimit - userCount} remaining seat slots available before tier upgrade is required.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Strict Multi-Tenant Security & Isolation Status Card */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3.5, height: '100%', borderColor: '#cbd5e1' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <SecurityIcon color="success" />
                <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                  Multi-Tenant Security & Isolation
                </Typography>
              </Box>

              <Alert severity="success" icon={<CheckIcon fontSize="inherit" />} sx={{ borderRadius: 2, mb: 2, py: 0.5 }}>
                Strict Tenant Isolation Enforced & Active
              </Alert>

              <Typography variant="caption" color="text.secondary" lineHeight={1.5} display="block">
                All ledger records, user credentials, and subscription entitlements for <strong>{company?.name}</strong> are strictly isolated within dedicated database schema <code>{company?.subdomain}</code>. Cross-tenant subscription viewing or unauthorized data switching is strictly blocked at context boundary.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Feature Entitlements & Subscription Tier Matrix */}
      <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', mb: 4 }}>
        <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
          Plan Modules & Entitlements Matrix
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Feature availability based on your active subscription tier.
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Feature / Module Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Starter Plan</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Growth Plan</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Enterprise Plan</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Current Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MODULE_MATRIX.map((row, idx) => {
                const isEnabledInCurrent = 
                  (activePlan === 'starter' && row.starter) ||
                  (activePlan === 'growth' && row.growth) ||
                  (activePlan === 'enterprise' && row.enterprise);

                return (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 600, py: 1.5 }}>{row.module}</TableCell>
                    <TableCell align="center">
                      {row.starter ? <CheckIcon sx={{ color: '#10b981', fontSize: 18 }} /> : <LockIcon sx={{ color: '#cbd5e1', fontSize: 16 }} />}
                    </TableCell>
                    <TableCell align="center">
                      {row.growth ? <CheckIcon sx={{ color: '#0284c7', fontSize: 18 }} /> : <LockIcon sx={{ color: '#cbd5e1', fontSize: 16 }} />}
                    </TableCell>
                    <TableCell align="center">
                      {row.enterprise ? <CheckIcon sx={{ color: '#7c3aed', fontSize: 18 }} /> : <LockIcon sx={{ color: '#cbd5e1', fontSize: 16 }} />}
                    </TableCell>
                    <TableCell align="right">
                      {isEnabledInCurrent ? (
                        <Chip label="Enabled" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
                      ) : (
                        <Chip label="Requires Upgrade" size="small" color="default" sx={{ height: 20, fontSize: 10 }} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Subscription Tier Change / Upgrade Dialog Modal */}
      <Dialog open={openUpgradeModal} onClose={() => setOpenUpgradeModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Change Subscription Plan Tier
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Select a new subscription tier for <strong>{company?.name}</strong>. Modules will be updated immediately upon plan change.
          </Typography>

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="select-plan-label">Subscription Tier</InputLabel>
            <Select
              labelId="select-plan-label"
              value={selectedPlan}
              label="Subscription Tier"
              onChange={(e) => setSelectedPlan(e.target.value as 'starter' | 'growth' | 'enterprise')}
            >
              <MenuItem value="starter">
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Starter Plan (₹1,499 / mo)</Typography>
                  <Typography variant="caption" color="text.secondary">Essentials: Journals, Invoices, Vendor Bills, Financial Reports (5 Seats)</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="growth">
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Growth Plan (₹3,999 / mo)</Typography>
                  <Typography variant="caption" color="text.secondary">Professional: POS Billing, GST/VAT Engine, Bank Reconciliation, Inventory (15 Seats)</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="enterprise">
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Enterprise Plan (₹9,999 / mo)</Typography>
                  <Typography variant="caption" color="text.secondary">Autonomous ERP: OCR Scanner, AI Forecasting, Workflow Automation, Direct APIs (Unlimited)</Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenUpgradeModal(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handlePlanUpgrade} variant="contained" disabled={isUpdating}>
            {isUpdating ? 'Updating Plan...' : 'Confirm Tier Change'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
