'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip, 
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import { 
  PersonAdd as AddUserIcon, 
  AdminPanelSettings as AdminIcon, 
  Security as RoleIcon, 
  CheckCircle as ActiveIcon, 
  Block as DeactivateIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { useTenant, TenantRole, TenantUser } from '../../context/TenantContext';
import Link from 'next/link';

const ROLE_PERMISSIONS: Record<TenantRole, { color: string; bgColor: string; description: string; modules: string[] }> = {
  'Owner': {
    color: '#7c3aed',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    description: 'Full un-restricted access to all financial ledgers, tax filings, banking APIs, team RBAC, and subscription billing.',
    modules: ['All Modules', 'User Management', 'Subscription Billing', 'System Settings', 'Banking Hub']
  },
  'Tenant Admin': {
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.12)',
    description: 'Manage tenant users, assign roles, configure organization settings, workflow rules, and custom GL accounts.',
    modules: ['User Management', 'Workflow Automations', 'Chart of Accounts', 'System Settings']
  },
  'Finance Manager': {
    color: '#059669',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    description: 'Approve vendor payments, manage cashflow forecasting, run 1-click bank reconciliation, and audit GSTR-3B filings.',
    modules: ['Bank Reconciliation', 'Financial Forecasting', 'Payment Approvals', 'Reports', 'GST Tax Engine']
  },
  'Accountant': {
    color: '#d97706',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    description: 'Create customer invoices, log vendor bills, post balanced double-entry journal entries, and run trial balances.',
    modules: ['Customer Invoices', 'Vendor Bills', 'Journal Entries', 'OCR Receipt Scanner', 'General Ledger']
  },
  'Inventory Manager': {
    color: '#0891b2',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    description: 'Manage stock valuation, raw material Bill of Materials (BOM), purchase orders, and stock re-order thresholds.',
    modules: ['Inventory & Stock', 'Purchase Orders', 'Vendor Bills', 'Product Catalog']
  },
  'Cashier': {
    color: '#db2777',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    description: 'Point-of-Sale (POS) daily billing, instant receipt printing, customer payment collections, and cash drawer logging.',
    modules: ['POS Billing', 'Daily Collections', 'Customer Receipts']
  }
};

export default function TenantUsersPage() {
  const { activeTenant, addTenantUser, updateTenantUser, deleteTenantUser } = useTenant();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TenantRole>('Accountant');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<TenantUser | null>(null);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addTenantUser(activeTenant.id, {
      name,
      email,
      role,
      status: 'Active'
    });

    setOpenAddModal(false);
    setName('');
    setEmail('');
    setRole('Accountant');
  };

  const handleToggleStatus = (user: TenantUser) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    updateTenantUser(activeTenant.id, user.id, { status: newStatus });
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to remove this user from the tenant organization?')) {
      deleteTenantUser(activeTenant.id, userId);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, pb: 6 }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AdminIcon sx={{ fontSize: 32, color: '#0284c7' }} />
            <Typography variant="h4" fontWeight="800" color="text.primary" letterSpacing="-0.5px">
              Tenant User Management & RBAC
            </Typography>
            <Chip
              label={`${activeTenant.users.length} / ${activeTenant.seatLimit || 15} Seats Used`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800, fontSize: 11 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Active Organization: <strong style={{ color: '#0284c7' }}>{activeTenant.name}</strong> ({activeTenant.edition} · Schema: {activeTenant.schema} · Plan: {(activeTenant.plan || 'growth').toUpperCase()})
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            component={Link}
            href="/settings?tab=subscription"
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
              fontWeight: 700,
              textTransform: 'none'
            }}
          >
            Subscription & Seats
          </Button>

          <Button
            variant="contained"
            startIcon={<AddUserIcon />}
            onClick={() => setOpenAddModal(true)}
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 1.2,
              bgcolor: '#0284c7',
              '&:hover': { bgcolor: '#0369a1' },
              fontWeight: 700,
              textTransform: 'none'
            }}
          >
            Add Tenant User
          </Button>
        </Stack>
      </Box>

      {/* Role Summary Badges */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {(Object.keys(ROLE_PERMISSIONS) as TenantRole[]).map((r) => {
          const config = ROLE_PERMISSIONS[r];
          const count = activeTenant.users.filter(u => u.role === r).length;
          return (
            <Grid item xs={12} sm={6} md={2} key={r}>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={r} size="small" sx={{ fontWeight: 800, fontSize: 10, bgcolor: config.bgColor, color: config.color }} />
                  <Typography variant="h6" fontWeight="800" color="text.primary">{count}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, height: 32, overflow: 'hidden' }}>
                  {config.description}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Users Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3.5, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>User Name & Email</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Assigned RBAC Role</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Accessible Modules</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Last Activity</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeTenant.users.map((user) => {
              const roleConfig = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS['Accountant'];
              return (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: roleConfig.color, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
                        {user.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="700" color="text.primary">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      sx={{ fontWeight: 800, bgcolor: roleConfig.bgColor, color: roleConfig.color, border: `1px solid ${roleConfig.color}` }} 
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {roleConfig.modules.slice(0, 3).map((mod, idx) => (
                        <Chip key={idx} label={mod} size="small" variant="outlined" sx={{ fontSize: 9.5, height: 18 }} />
                      ))}
                      {roleConfig.modules.length > 3 && (
                        <Chip label={`+${roleConfig.modules.length - 3} more`} size="small" sx={{ fontSize: 9.5, height: 18, bgcolor: '#f1f5f9' }} />
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      icon={user.status === 'Active' ? <ActiveIcon /> : <DeactivateIcon />} 
                      label={user.status} 
                      color={user.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary" fontSize={13}>
                      {user.lastLogin || 'Recent'}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}>
                      <IconButton size="small" onClick={() => handleToggleStatus(user)} color={user.status === 'Active' ? 'warning' : 'success'}>
                        {user.status === 'Active' ? <DeactivateIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>

                    {user.role !== 'Owner' && (
                      <Tooltip title="Delete User">
                        <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Add User to {activeTenant.name}
        </DialogTitle>
        <Box component="form" onSubmit={handleAddUser}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Provision a new user specifically isolated to tenant schema <strong>{activeTenant.schema}</strong>.
            </Typography>

            <TextField
              label="Full Name"
              placeholder="e.g. Rahul Verma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Work Email Address"
              type="email"
              placeholder="e.g. rahul@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Assign Tenant RBAC Role</InputLabel>
              <Select
                value={role}
                label="Assign Tenant RBAC Role"
                onChange={(e) => setRole(e.target.value as TenantRole)}
              >
                <MenuItem value="Owner">👑 Owner — Full administrative & financial access</MenuItem>
                <MenuItem value="Tenant Admin">🛠️ Tenant Admin — User management & workflow rules</MenuItem>
                <MenuItem value="Finance Manager">💼 Finance Manager — Approvals, forecasting & bank rec</MenuItem>
                <MenuItem value="Accountant">📊 Accountant — Invoices, bills, journals & reports</MenuItem>
                <MenuItem value="Inventory Manager">📦 Inventory Manager — Stock, POs & catalog</MenuItem>
                <MenuItem value="Cashier">💵 Cashier — POS billing & daily collections</MenuItem>
              </Select>
            </FormControl>

            <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                Permission Preview: {role}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize={12.5} sx={{ mb: 1 }}>
                {ROLE_PERMISSIONS[role].description}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                {ROLE_PERMISSIONS[role].modules.map((m, idx) => (
                  <Chip key={idx} label={m} size="small" sx={{ fontSize: 10, bgcolor: ROLE_PERMISSIONS[role].bgColor, color: ROLE_PERMISSIONS[role].color, fontWeight: 700 }} />
                ))}
              </Stack>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}>
              Create User
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Box>
  );
}
