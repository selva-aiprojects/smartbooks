'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
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
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Autorenew as RecurringIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  CheckCircle as ActiveIcon,
  PauseCircle as PausedIcon,
  Email as EmailIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export default function RecurringInvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    monthlyRecurringRevenue: 125000,
    activeRetainers: 3,
    nextBatchDate: '2026-10-01',
  });

  const [openModal, setOpenModal] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('50000');
  const [frequency, setFrequency] = useState('Monthly');
  const [description, setDescription] = useState('Enterprise Cloud Retainer');
  const [autoEmail, setAutoEmail] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices/recurring');
      const data = await res.json();
      if (data.profiles) {
        setProfiles(data.profiles);
        setMetrics(data.metrics);
      }
    } catch {
      // Keep state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunNow = async (profileId: string) => {
    try {
      setRunningId(profileId);
      const res = await fetch('/api/invoices/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RUN_NOW', profileId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnack({ type: 'success', message: data.message });
        await loadData();
      } else {
        setSnack({ type: 'error', message: data.error || 'Failed to trigger run' });
      }
    } catch (err: any) {
      setSnack({ type: 'error', message: err.message || 'Error triggering run' });
    } finally {
      setRunningId(null);
    }
  };

  const handleCreateProfile = async () => {
    if (!customerName || !amount) {
      alert('Please provide customer name and amount');
      return;
    }
    try {
      const res = await fetch('/api/invoices/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newProfile: {
            customerName,
            customerEmail,
            amount: Number(amount),
            frequency,
            description,
            autoEmail,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSnack({ type: 'success', message: 'Recurring billing profile created!' });
        setOpenModal(false);
        setCustomerName('');
        setCustomerEmail('');
        await loadData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Button
              component={Link}
              href="/invoices"
              startIcon={<BackIcon />}
              size="small"
              sx={{ color: '#94a3b8', textTransform: 'none', mr: 1 }}
            >
              Invoices
            </Button>
            <Typography variant="h5" fontWeight="800" color="#f8fafc">
              Recurring Invoices & Subscription Billing
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Automate monthly client retainers, subscription renewals, and recurring tax invoice generation.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#2563eb', fontWeight: 700 }}
          >
            New Retainer Schedule
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: '#131b2e', border: '1px solid #1e293b' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              MONTHLY RECURRING REVENUE (MRR)
            </Typography>
            <Typography variant="h4" fontWeight="800" color="#38bdf8" sx={{ mt: 0.5 }}>
              ₹{Number(metrics?.monthlyRecurringRevenue || 0).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
              +100% predictable cash flow
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: '#131b2e', border: '1px solid #1e293b' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              ACTIVE SUBSCRIPTION RETAINERS
            </Typography>
            <Typography variant="h4" fontWeight="800" color="#10b981" sx={{ mt: 0.5 }}>
              {metrics?.activeRetainers || 0} Clients
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Auto-posted on schedule
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: '#131b2e', border: '1px solid #1e293b' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              NEXT BATCH RUN DATE
            </Typography>
            <Typography variant="h4" fontWeight="800" color="#f59e0b" sx={{ mt: 0.5 }}>
              {metrics?.nextBatchDate || '1st of Month'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Auto-generates draft & sent invoices
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table */}
      <TableContainer component={Paper} sx={{ bgcolor: '#131b2e', borderRadius: 3, border: '1px solid #1e293b' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#0b0f19' }}>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Client / Customer</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Frequency</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Retainer Amount (₹)</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Next Run Date</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Invoices Generated</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Auto-Email</TableCell>
              <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: '#64748b', py: 4 }}>
                  No recurring schedules found. Create your first retainer above!
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((p) => (
                <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="700" color="#f8fafc">
                      {p.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.frequency}
                      size="small"
                      sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="800" color="#ffffff">
                      ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Incl. 18% GST (₹{Number(p.gstAmount).toLocaleString('en-IN')})
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                    {p.nextRunDate}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${p.invoicesGenerated} Invoices`}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: '#334155', color: '#94a3b8' }}
                    />
                  </TableCell>
                  <TableCell>
                    {p.autoEmail ? (
                      <Chip
                        icon={<EmailIcon sx={{ fontSize: '14px !important' }} />}
                        label="Auto-PDF"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="Manual" size="small" variant="outlined" sx={{ color: '#64748b' }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={runningId === p.id ? <CircularProgress size={14} /> : <PlayIcon />}
                      onClick={() => handleRunNow(p.id)}
                      disabled={runningId === p.id}
                      sx={{
                        borderColor: '#10b981',
                        color: '#10b981',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: '#059669' },
                      }}
                    >
                      {runningId === p.id ? 'Posting...' : 'Run Now'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Schedule Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', color: '#f8fafc', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #334155' }}>
          Create Recurring Retainer Schedule
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          <TextField
            label="Client / Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            fullWidth
            sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
          />

          <TextField
            label="Client Billing Email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            fullWidth
            sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}>
                <InputLabel>Billing Frequency</InputLabel>
                <Select value={frequency} label="Billing Frequency" onChange={(e) => setFrequency(e.target.value)}>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Annually">Annually</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Amount (₹ Total with GST)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                fullWidth
                sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Line Item Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
          />

          <FormControlLabel
            control={<Switch checked={autoEmail} onChange={(e) => setAutoEmail(e.target.checked)} color="primary" />}
            label="Automatically email Section 31 Tax Invoice PDF upon generation"
            sx={{ color: '#e2e8f0' }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #334155' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateProfile} sx={{ bgcolor: '#2563eb', fontWeight: 700 }}>
            Start Retainer Schedule
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)}>
        <Alert onClose={() => setSnack(null)} severity={snack?.type || 'success'} sx={{ width: '100%' }}>
          {snack?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
