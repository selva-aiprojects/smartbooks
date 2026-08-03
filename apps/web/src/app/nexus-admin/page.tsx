'use client';

import { useState } from 'react';
import {
  Box, Typography, Grid, Paper, Card, CardContent, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Stack, Divider,
  Alert, LinearProgress, Tabs, Tab, IconButton, Tooltip, Badge,
  Switch, FormControlLabel, RadioGroup, Radio
} from '@mui/material';
import {
  AddBusiness as AddTenantIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Visibility as InspectIcon,
  Edit as EditIcon,
  LockReset as PasswordResetIcon,
  AdminPanelSettings as AdminIcon,
  Pending as PendingIcon,
  ConfirmationNumber as TicketIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
  Dns as DnsIcon,
  SaveAlt as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTenant, Tenant } from '../../context/TenantContext';

const PLAN_COLORS: Record<string, { main: string; bg: string; border: string }> = {
  starter:    { main: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  growth:     { main: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  enterprise: { main: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
};

const PLAN_DETAILS = {
  starter:    { label: 'Starter',    price: '₹1,499/mo',  seats: 5,   features: 'Essentials only' },
  growth:     { label: 'Growth',     price: '₹3,999/mo',  seats: 15,  features: 'POS + GST + Inventory' },
  enterprise: { label: 'Enterprise', price: '₹9,999/mo',  seats: 100, features: 'Full AI ERP – Unlimited' },
};

const MOCK_TICKETS = [
  { id: 'TKT-1001', tenant: 'Nexus Retail & Supermarkets', subject: 'GST API Sync Issue – GSTR-1 auto-filing failed', priority: 'High', status: 'Open', created: '2026-08-03', assignee: 'Ravi Kumar' },
  { id: 'TKT-1002', tenant: 'Acme Global Tech Pvt Ltd', subject: 'Seat Upgrade Request – 10 additional seats needed', priority: 'Medium', status: 'In Progress', created: '2026-08-02', assignee: 'Priya Singh' },
  { id: 'TKT-1003', tenant: 'Apex Healthcare & Diagnostics', subject: 'Bank Feed Re-authorization – HDFC API token expired', priority: 'High', status: 'Open', created: '2026-08-01', assignee: 'Unassigned' },
  { id: 'TKT-1004', tenant: 'Flavors Restaurant & Hospitality', subject: 'Invoice template customization – Add company logo', priority: 'Low', status: 'Resolved', created: '2026-07-31', assignee: 'Sana Mirza' },
  { id: 'TKT-1005', tenant: 'Vanguard Manufacturing Ltd', subject: 'Multi-currency payroll integration – USD payroll support', priority: 'Medium', status: 'In Progress', created: '2026-07-30', assignee: 'Ravi Kumar' },
];

export default function NexusAdminPage() {
  const { tenants, updateTenantPlan } = useTenant();

  const [activeTab, setActiveTab] = useState(0);

  // ── Provision Modal ──────────────────────────────────────────────────────────
  const [openProvisionModal, setOpenProvisionModal] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [plan, setPlan] = useState<'starter' | 'growth' | 'enterprise'>('growth');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [welcomeKitTenant, setWelcomeKitTenant] = useState<{ name: string; adminEmail: string; schema: string; plan: string } | null>(null);

  // ── Welcome Kit Modal ────────────────────────────────────────────────────────
  const [openWelcomeKitModal, setOpenWelcomeKitModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Edit Subscription Modal ──────────────────────────────────────────────────
  const [editSubTenant, setEditSubTenant] = useState<Tenant | null>(null);
  const [editPlan, setEditPlan] = useState<'starter' | 'growth' | 'enterprise'>('growth');
  const [editSeats, setEditSeats] = useState(15);
  const [editBilling, setEditBilling] = useState<'Monthly' | 'Annual'>('Annual');
  const [editStatus, setEditStatus] = useState<'Active' | 'Past Due' | 'Trial'>('Active');
  const [editRenewal, setEditRenewal] = useState('');
  const [isSavingSub, setIsSavingSub] = useState(false);
  const [subSaved, setSubSaved] = useState(false);

  // ── Password Reset Modal ─────────────────────────────────────────────────────
  const [pwdResetTenant, setPwdResetTenant] = useState<Tenant | null>(null);
  const [pwdResetEmail, setPwdResetEmail] = useState('');
  const [pwdResetSent, setPwdResetSent] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleProvision = async () => {
    if (!orgName || !adminEmail || !adminName) return;
    setIsProvisioning(true);
    await new Promise(r => setTimeout(r, 1200));
    const schemaId = `tenant_${(subdomain || orgName).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    setWelcomeKitTenant({ name: orgName, adminEmail, schema: schemaId, plan });
    setIsProvisioning(false);
    setOpenProvisionModal(false);
    setOpenWelcomeKitModal(true);
  };

  const openEditSub = (tenant: Tenant) => {
    setEditSubTenant(tenant);
    setEditPlan(tenant.plan);
    setEditSeats(tenant.seatLimit || 15);
    setEditBilling(tenant.billingCycle || 'Annual');
    setEditStatus(tenant.subscriptionStatus || 'Active');
    setEditRenewal(tenant.nextBillingDate || '');
    setSubSaved(false);
  };

  const handleSaveSub = async () => {
    if (!editSubTenant) return;
    setIsSavingSub(true);
    await new Promise(r => setTimeout(r, 900));
    updateTenantPlan(editSubTenant.id, editPlan);
    setIsSavingSub(false);
    setSubSaved(true);
    setTimeout(() => setEditSubTenant(null), 1200);
  };

  const openPwdReset = (tenant: Tenant) => {
    setPwdResetTenant(tenant);
    setPwdResetEmail(tenant.users?.[0]?.email || '');
    setPwdResetSent(false);
  };

  const handleSendPwdReset = async () => {
    setPwdResetSent(false);
    await new Promise(r => setTimeout(r, 700));
    setPwdResetSent(true);
  };

  const welcomeKitText = welcomeKitTenant
    ? `🎉 Welcome to SmartBooks AI!\n\nDear ${adminName},\n\nYour organization "${welcomeKitTenant.name}" has been successfully provisioned on SmartBooks AI.\n\n📋 Account Details:\n• Email: ${adminEmail}\n• Temporary Password: SB@2026#Welcome\n• Subscription Plan: ${welcomeKitTenant.plan.toUpperCase()}\n• Database Schema: ${welcomeKitTenant.schema}\n\n🔗 Login URL: https://app.smartbooks.ai/login\n\n✅ Next Steps:\n1. Log in and set your permanent password.\n2. Complete your company profile and GSTIN setup.\n3. Configure your Chart of Accounts.\n4. Invite your team members.\n\nNeed help? Contact support@smartbooks.ai\n\nWarm regards,\nSmartBooks AI Platform Team`
    : '';

  const handleCopyWelcomeKit = () => {
    navigator.clipboard.writeText(welcomeKitText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalTenants = tenants.length;
  const openTickets = MOCK_TICKETS.filter(t => t.status === 'Open').length;
  const activeSeats = tenants.reduce((sum, t) => sum + (t.users?.length || 0), 0);
  const totalSeatLimit = tenants.reduce((sum, t) => sum + (t.seatLimit || 15), 0);

  return (
    <Box sx={{ flexGrow: 1, pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src="/logo-icon-badge.png" alt="SmartBooks" sx={{ width: 40, height: 40, borderRadius: 2, objectFit: 'contain' }} />
            <Box>
              <Typography variant="h4" fontWeight="900" color="text.primary" letterSpacing="-0.5px">
                Nexus Platform Admin Console
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                SmartBooks AI · Multi-Tenant Platform Governance Center
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddTenantIcon />}
          onClick={() => setOpenProvisionModal(true)}
          sx={{ borderRadius: 2.5, px: 3, py: 1.3, bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px rgba(2,132,199,0.35)' }}
        >
          Provision New Tenant
        </Button>
      </Box>

      {/* Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Active Tenant Organizations', value: totalTenants, icon: <BusinessIcon />, color: '#0284c7', bg: '#f0f9ff' },
          { label: 'Total Active User Seats', value: `${activeSeats} / ${totalSeatLimit}`, icon: <PeopleIcon />, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Open Support Tickets', value: openTickets, icon: <TicketIcon />, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Database Schemas Healthy', value: `${totalTenants} / ${totalTenants}`, icon: <DnsIcon />, color: '#10b981', bg: '#ecfdf5' },
        ].map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>{metric.label}</Typography>
                    <Typography variant="h4" fontWeight="900" color="text.primary">{metric.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: metric.bg, color: metric.color, width: 40, height: 40 }}>{metric.icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: 13 } }}>
        <Tab label="Tenant Directory & Subscriptions" icon={<BusinessIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
        <Tab label={<Badge badgeContent={openTickets} color="error"><Box sx={{ pr: 1 }}>Support Tickets</Box></Badge>} icon={<TicketIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
        <Tab label="Schema & System Health" icon={<DnsIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
      </Tabs>

      {/* TAB 0: Tenant Directory */}
      {activeTab === 0 && (
        <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Organization</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Edition & Schema</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Subscription Plan</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Seat Usage</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => {
                  const planTheme = PLAN_COLORS[tenant.plan] || PLAN_COLORS.growth;
                  const usedSeats = tenant.users?.length || 0;
                  const limitSeats = tenant.seatLimit || 15;
                  const seatPct = Math.min(Math.round((usedSeats / limitSeats) * 100), 100);
                  return (
                    <TableRow key={tenant.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: planTheme.bg, color: planTheme.main, width: 38, height: 38, fontWeight: 800, fontSize: 15 }}>
                            {tenant.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{tenant.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{tenant.gstin}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{tenant.edition}</Typography>
                        <Chip label={tenant.schema} size="small" sx={{ fontSize: 10, height: 18, mt: 0.5, fontFamily: 'monospace' }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tenant.plan.toUpperCase()}
                          size="small"
                          sx={{ bgcolor: planTheme.bg, color: planTheme.main, fontWeight: 800, border: `1px solid ${planTheme.border}`, fontSize: 11 }}
                        />
                        {tenant.nextBillingDate && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            Renews: {tenant.nextBillingDate}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        <Typography variant="caption" fontWeight={700} color="text.primary">
                          {usedSeats} / {limitSeats} seats
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={seatPct}
                          sx={{ mt: 0.5, height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: planTheme.main, borderRadius: 3 } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CheckIcon style={{ fontSize: 12 }} />}
                          label={tenant.subscriptionStatus || 'Active'}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit Subscription">
                            <IconButton size="small" color="primary" onClick={() => openEditSub(tenant)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Password Reset">
                            <IconButton size="small" sx={{ color: '#f59e0b' }} onClick={() => openPwdReset(tenant)}>
                              <PasswordResetIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Welcome Kit">
                            <IconButton size="small" sx={{ color: '#10b981' }} onClick={() => {
                              setWelcomeKitTenant({ name: tenant.name, adminEmail: tenant.users?.[0]?.email || '', schema: tenant.schema, plan: tenant.plan });
                              setAdminName(tenant.users?.[0]?.name || '');
                              setAdminEmail(tenant.users?.[0]?.email || '');
                              setOpenWelcomeKitModal(true);
                            }}>
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Inspect Workspace">
                            <IconButton size="small" sx={{ color: '#64748b' }}>
                              <InspectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* TAB 1: Support Tickets */}
      {activeTab === 1 && (
        <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Ticket ID</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Tenant Organization</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Issue Subject</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Assignee</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_TICKETS.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: '#0284c7' }}>{ticket.id}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{ticket.tenant}</Typography></TableCell>
                    <TableCell sx={{ maxWidth: 280 }}><Typography variant="body2" noWrap>{ticket.subject}</Typography></TableCell>
                    <TableCell>
                      <Chip label={ticket.priority} size="small" sx={{ fontWeight: 800, fontSize: 10, height: 20,
                        bgcolor: ticket.priority === 'High' ? '#fee2e2' : ticket.priority === 'Medium' ? '#fef3c7' : '#f1f5f9',
                        color: ticket.priority === 'High' ? '#dc2626' : ticket.priority === 'Medium' ? '#d97706' : '#475569' }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={ticket.status === 'Resolved' ? <CheckIcon style={{ fontSize: 12 }} /> : <PendingIcon style={{ fontSize: 12 }} />}
                        label={ticket.status} size="small"
                        color={ticket.status === 'Resolved' ? 'success' : ticket.status === 'In Progress' ? 'primary' : 'default'}
                        variant={ticket.status === 'Open' ? 'outlined' : 'filled'}
                        sx={{ fontWeight: 700, fontSize: 10, height: 20 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={ticket.assignee === 'Unassigned' ? 'error' : 'text.primary'} fontWeight={ticket.assignee === 'Unassigned' ? 700 : 400}>
                        {ticket.assignee}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{ticket.created}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* TAB 2: System Health */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {tenants.map((tenant) => (
            <Grid item xs={12} md={6} key={tenant.id}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{tenant.name}</Typography>
                      <Chip label={tenant.schema} size="small" sx={{ mt: 0.5, fontSize: 10, height: 18, fontFamily: 'monospace', bgcolor: '#f1f5f9' }} />
                    </Box>
                    <Chip icon={<CheckIcon style={{ fontSize: 12 }} />} label="Schema Healthy" size="small" color="success" sx={{ fontWeight: 700 }} />
                  </Box>
                  <Stack spacing={1.5}>
                    {[
                      { label: 'DB Connection Pool', value: '✓ Active (12/20 connections)', ok: true },
                      { label: 'Last Backup', value: '2026-08-03 18:00 UTC', ok: true },
                      { label: 'JWT Auth Status', value: '✓ Valid – Expires 2026-08-04', ok: true },
                    ].map(item => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.label}</Typography>
                        <Typography variant="caption" color={item.ok ? 'success.main' : 'error.main'} fontWeight={600}>{item.value}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: Edit Subscription
      ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!editSubTenant} onClose={() => setEditSubTenant(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EditIcon color="primary" />
              Edit Subscription — {editSubTenant?.name}
            </Box>
            <IconButton size="small" onClick={() => setEditSubTenant(null)}><CloseIcon fontSize="small" /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {subSaved && <Alert severity="success" sx={{ borderRadius: 2 }}>Subscription updated successfully!</Alert>}

          {/* Plan Selection */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Subscription Plan</Typography>
            <RadioGroup value={editPlan} onChange={(e) => {
              const p = e.target.value as 'starter' | 'growth' | 'enterprise';
              setEditPlan(p);
              setEditSeats(PLAN_DETAILS[p].seats);
            }}>
              {(['starter', 'growth', 'enterprise'] as const).map(p => {
                const theme = PLAN_COLORS[p];
                const detail = PLAN_DETAILS[p];
                return (
                  <Paper key={p} elevation={0} sx={{
                    mb: 1, p: 1.5, borderRadius: 2, cursor: 'pointer',
                    border: `2px solid ${editPlan === p ? theme.main : '#e2e8f0'}`,
                    bgcolor: editPlan === p ? theme.bg : 'transparent',
                    transition: 'all 0.15s'
                  }} onClick={() => { setEditPlan(p); setEditSeats(detail.seats); }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <FormControlLabel
                        value={p}
                        control={<Radio size="small" sx={{ color: theme.main, '&.Mui-checked': { color: theme.main } }} />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{detail.label} — {detail.price}</Typography>
                            <Typography variant="caption" color="text.secondary">{detail.features}</Typography>
                          </Box>
                        }
                        sx={{ m: 0 }}
                      />
                      <Chip label={`${detail.seats === 100 ? 'Unlimited' : detail.seats} seats`} size="small"
                        sx={{ bgcolor: theme.bg, color: theme.main, fontWeight: 700, border: `1px solid ${theme.border}` }} />
                    </Box>
                  </Paper>
                );
              })}
            </RadioGroup>
          </Box>

          <Divider />

          {/* Seat Limit Override */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Seat Limit Override</Typography>
            <TextField
              type="number"
              value={editSeats}
              onChange={(e) => setEditSeats(Number(e.target.value))}
              inputProps={{ min: 1, max: 500 }}
              fullWidth
              size="small"
              helperText="Default seats are set by plan. Override here for custom enterprise agreements."
            />
          </Box>

          {/* Billing & Status */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Billing Cycle</InputLabel>
                <Select value={editBilling} label="Billing Cycle" onChange={(e) => setEditBilling(e.target.value as 'Monthly' | 'Annual')}>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Annual">Annual (2 months free)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Subscription Status</InputLabel>
                <Select value={editStatus} label="Subscription Status" onChange={(e) => setEditStatus(e.target.value as 'Active' | 'Past Due' | 'Trial')}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Trial">Trial</MenuItem>
                  <MenuItem value="Past Due">Past Due</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Next Renewal Date"
                type="date"
                value={editRenewal}
                onChange={(e) => setEditRenewal(e.target.value)}
                fullWidth size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setEditSubTenant(null)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSavingSub}
            onClick={handleSaveSub}
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
          >
            {isSavingSub ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: Password Reset
      ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!pwdResetTenant} onClose={() => setPwdResetTenant(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PasswordResetIcon sx={{ color: '#f59e0b' }} />
            Send Password Reset
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            A password reset link will be dispatched to the selected email address for <strong>{pwdResetTenant?.name}</strong>.
          </Typography>

          {pwdResetSent && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Reset link sent to <strong>{pwdResetEmail}</strong>. Valid for 24 hours.
            </Alert>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Send Reset To</InputLabel>
            <Select value={pwdResetEmail} label="Send Reset To" onChange={(e) => setPwdResetEmail(e.target.value)}>
              {pwdResetTenant?.users?.map(u => (
                <MenuItem key={u.id} value={u.email}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{u.email} · {u.role}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
            <Typography variant="caption" color="#92400e" fontWeight={600} display="block">
              📧 Reset Email will contain:
            </Typography>
            <Typography variant="caption" color="#78350f" component="div" sx={{ mt: 0.5, lineHeight: 1.8 }}>
              • Secure reset link (expires in 24 hours)<br />
              • Login URL: https://app.smartbooks.ai/login<br />
              • Support contact: support@smartbooks.ai
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setPwdResetTenant(null)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendPwdReset}
            disabled={!pwdResetEmail || pwdResetSent}
            sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, color: '#000' }}
          >
            {pwdResetSent ? 'Reset Sent ✓' : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: Provision New Tenant
      ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={openProvisionModal} onClose={() => setOpenProvisionModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddTenantIcon color="primary" />
            Provision New Tenant Organization
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Organization / Company Name *" value={orgName} onChange={(e) => setOrgName(e.target.value)} fullWidth required placeholder="e.g. Zenith Pharma Pvt Ltd" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Tenant Subdomain" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} fullWidth placeholder="e.g. zenith-pharma" helperText="Auto-generated if blank" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Base Currency</InputLabel>
                <Select value={currency} label="Base Currency" onChange={(e) => setCurrency(e.target.value)}>
                  <MenuItem value="INR">INR (₹) – Indian Rupee</MenuItem>
                  <MenuItem value="USD">USD ($) – US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR (€) – Euro</MenuItem>
                  <MenuItem value="GBP">GBP (£) – British Pound</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <FormControl fullWidth>
            <InputLabel>Subscription Plan *</InputLabel>
            <Select value={plan} label="Subscription Plan *" onChange={(e) => setPlan(e.target.value as 'starter' | 'growth' | 'enterprise')}>
              <MenuItem value="starter">Starter – ₹1,499/mo (5 Seats · Essentials)</MenuItem>
              <MenuItem value="growth">Growth – ₹3,999/mo (15 Seats · POS + GST + Inventory)</MenuItem>
              <MenuItem value="enterprise">Enterprise – ₹9,999/mo (Unlimited · Full AI ERP)</MenuItem>
            </Select>
          </FormControl>
          <Divider />
          <Typography variant="subtitle2" fontWeight={700} color="primary">Initial Tenant Admin Details</Typography>
          <TextField label="Admin Full Name *" value={adminName} onChange={(e) => setAdminName(e.target.value)} fullWidth required />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField label="Admin Email *" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField label="Admin Phone" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} fullWidth placeholder="+91 98765 43210" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenProvisionModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleProvision} disabled={isProvisioning || !orgName || !adminEmail || !adminName} startIcon={<AddTenantIcon />}>
            {isProvisioning ? 'Provisioning Schema...' : 'Provision & Generate Welcome Kit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: Welcome Kit
      ══════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={openWelcomeKitModal} onClose={() => setOpenWelcomeKitModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EmailIcon sx={{ color: '#10b981' }} />
            Welcome Kit — {welcomeKitTenant?.name}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Tenant provisioned! Isolated schema <strong>{welcomeKitTenant?.schema}</strong> is active.
          </Alert>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
            {welcomeKitText}
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenWelcomeKitModal(false)}>Close</Button>
          <Button variant="outlined" startIcon={<CopyIcon />} onClick={handleCopyWelcomeKit} color={copied ? 'success' : 'primary'}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="contained" startIcon={<SendIcon />} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            onClick={() => { alert(`Welcome Kit sent to ${welcomeKitTenant?.adminEmail || adminEmail}`); setOpenWelcomeKitModal(false); }}>
            Send to Admin Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
