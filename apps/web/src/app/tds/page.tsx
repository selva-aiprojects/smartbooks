'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  AccountBalance as TaxIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  CheckCircle as VerifiedIcon,
  Refresh as RefreshIcon,
  ReceiptLong as ReceiptIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { getAuthHeaders } from '../../lib/api';
import { useTenant } from '../../context/TenantContext';

interface TdsRow {
  id: string;
  vendorName: string;
  vendorPan?: string;
  section: string;
  rate: number;
  taxableAmount: number;
  tdsAmount: number;
  challanNo?: string;
  challanDate?: string;
  bsrCode?: string;
  status: 'PENDING' | 'DEPOSITED';
  quarter: string;
  financialYear: string;
  createdAt: string;
}

const SECTION_OPTIONS = [
  { code: '194C', label: '194C - Contractor (2%)', rate: 2 },
  { code: '194J', label: '194J - Professional / Technical (10%)', rate: 10 },
  { code: '194I', label: '194I - Rent on Land/Building (10%)', rate: 10 },
  { code: '194H', label: '194H - Brokerage / Commission (5%)', rate: 5 },
  { code: '194Q', label: '194Q - Purchase of Goods (0.1%)', rate: 0.1 },
];

export default function TdsPage() {
  const { activeTenant } = useTenant();
  const [rows, setRows] = useState<TdsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openChallanModal, setOpenChallanModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TdsRow | null>(null);

  // New Deduction Form state
  const [vendorName, setVendorName] = useState('');
  const [vendorPan, setVendorPan] = useState('');
  const [section, setSection] = useState('194J');
  const [rate, setRate] = useState(10);
  const [taxableAmount, setTaxableAmount] = useState(50000);
  const [quarter, setQuarter] = useState('Q2');
  const [submitting, setSubmitting] = useState(false);

  // Challan Deposit Form state
  const [challanNo, setChallanNo] = useState('');
  const [challanDate, setChallanDate] = useState(new Date().toISOString().split('T')[0]);
  const [bsrCode, setBsrCode] = useState('0510304');
  const [depositing, setDepositing] = useState(false);

  const [snack, setSnack] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tds', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRows(data || []);
      }
    } catch (err) {
      console.error('Failed to load TDS records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSectionChange = (sec: string) => {
    setSection(sec);
    const found = SECTION_OPTIONS.find((s) => s.code === sec);
    if (found) setRate(found.rate);
  };

  const handleCreateTds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/tds', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          vendorName,
          vendorPan,
          section,
          rate,
          taxableAmount,
          quarter,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSnack(`✅ TDS deduction under Sec ${section} recorded successfully!`);
        setOpenModal(false);
        setVendorName('');
        setVendorPan('');
        await loadData();
      } else {
        alert(data.error || 'Failed to record TDS');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepositChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;
    setDepositing(true);
    try {
      const res = await fetch(`/api/tds/${selectedEntry.id}/challan`, {
        method: 'PATCH',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          challanNo,
          challanDate,
          bsrCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSnack(`✅ Challan ITNS-281 #${challanNo} recorded. Status updated to DEPOSITED!`);
        setOpenChallanModal(false);
        setSelectedEntry(null);
        await loadData();
      } else {
        alert(data.error || 'Failed to update Challan');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setDepositing(false);
    }
  };

  const handleExportForm26Q = () => {
    if (!rows.length) return;
    const headers = ['Quarter', 'Section', 'Vendor Name', 'PAN of Deductee', 'Taxable Base (INR)', 'TDS Rate %', 'TDS Deducted (INR)', 'Challan No', 'BSR Code', 'Status'];
    const csvRows = rows.map((r) => [
      `"${r.quarter}"`,
      `"${r.section}"`,
      `"${r.vendorName}"`,
      `"${r.vendorPan || 'PANNOTAVBL'}"`,
      r.taxableAmount,
      r.rate,
      r.tdsAmount,
      `"${r.challanNo || ''}"`,
      `"${r.bsrCode || ''}"`,
      `"${r.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Form_26Q_Return_${activeTenant?.name || 'SmartBooks'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: GridColDef[] = [
    {
      field: 'section',
      headerName: 'Section',
      width: 110,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="primary" sx={{ fontWeight: 700 }} />
      ),
    },
    {
      field: 'vendorName',
      headerName: 'Deductee / Vendor',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="600">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">PAN: {params.row.vendorPan || 'PANNOTAVBL'}</Typography>
        </Box>
      ),
    },
    {
      field: 'taxableAmount',
      headerName: 'Taxable Base (₹)',
      width: 140,
      valueFormatter: (value: any) => `₹${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      field: 'rate',
      headerName: 'Rate',
      width: 90,
      valueFormatter: (value: any) => `${value}%`,
    },
    {
      field: 'tdsAmount',
      headerName: 'TDS Deducted (₹)',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="800" color="secondary">
          ₹{Number(params.value || 0).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Statutory Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'DEPOSITED' ? 'success' : 'warning'}
          variant={params.value === 'DEPOSITED' ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'challanNo',
      headerName: 'Challan ITNS-281',
      width: 160,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          {params.value || 'Pending Payment'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: (params) =>
        params.row.status === 'PENDING' ? (
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<PaymentIcon />}
            onClick={() => {
              setSelectedEntry(params.row);
              setChallanNo(`CHL-${Date.now().toString().slice(-8)}`);
              setOpenChallanModal(true);
            }}
          >
            Deposit
          </Button>
        ) : (
          <Chip icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />} label="Deposited" color="success" size="small" />
        ),
    },
  ];

  const totalDeducted = rows.reduce((s, r) => s + Number(r.tdsAmount || 0), 0);
  const totalDeposited = rows.filter((r) => r.status === 'DEPOSITED').reduce((s, r) => s + Number(r.tdsAmount || 0), 0);
  const totalPending = totalDeducted - totalDeposited;

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <TaxIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
              TDS / TCS Compliance & Form 26Q Portal
            </Typography>
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: '16px !important' }} />}
              label="Income Tax Act, 1961"
              color="warning"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Statutory tax deduction at source on vendor payments (194C Contractor, 194J Professional, 194I Rent). Track ITNS-281 Challans and quarterly Form 26Q filings.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportForm26Q} disabled={!rows.length}>
            Form 26Q CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, color: '#ffffff', fontWeight: 700 }}
          >
            Record TDS Deduction
          </Button>
        </Box>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">TOTAL TDS DEDUCTED</Typography>
              <Typography variant="h5" fontWeight="800" color="#0f172a">₹{totalDeducted.toLocaleString('en-IN')}</Typography>
              <Typography variant="caption" color="text.secondary">Cumulative FY 2026-27</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">DEPOSITED VIA ITNS-281</Typography>
              <Typography variant="h5" fontWeight="800" color="#10b981">₹{totalDeposited.toLocaleString('en-IN')}</Typography>
              <Typography variant="caption" color="#10b981" fontWeight="600">Paid to Central Govt</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="error.main" fontWeight="700">PENDING DEPOSIT (7th of Month)</Typography>
              <Typography variant="h5" fontWeight="800" color="error.main">₹{totalPending.toLocaleString('en-IN')}</Typography>
              <Typography variant="caption" color="text.secondary">Statutory due date: 7th Next Month</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <Box sx={{ height: 480, width: '100%', bgcolor: '#ffffff', borderRadius: 2, p: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        )}
      </Box>

      {/* Modal: Record TDS Deduction */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateTds}>
          <DialogTitle sx={{ bgcolor: '#0f172a', color: '#ffffff' }}>Record Statutory TDS Deduction</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              <TextField
                size="small"
                label="Vendor / Deductee Company Name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                fullWidth
                required
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Vendor PAN"
                    value={vendorPan}
                    onChange={(e) => setVendorPan(e.target.value.toUpperCase())}
                    helperText="10-digit PAN (e.g. ABCDE1234F)"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Income Tax Section</InputLabel>
                    <Select
                      value={section}
                      label="Income Tax Section"
                      onChange={(e) => handleSectionChange(e.target.value)}
                    >
                      {SECTION_OPTIONS.map((opt) => (
                        <MenuItem key={opt.code} value={opt.code}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Taxable Bill Amount (₹)"
                    type="number"
                    value={taxableAmount}
                    onChange={(e) => setTaxableAmount(Number(e.target.value))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="TDS Rate (%)"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>

              <Paper sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="#92400e">
                  Withholding Tax Calculation:
                </Typography>
                <Typography variant="body1" fontWeight="800" color="#78350f">
                  TDS to be deducted: ₹{(taxableAmount * (rate / 100)).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" color="#92400e">
                  Net payable to vendor: ₹{(taxableAmount - (taxableAmount * (rate / 100))).toLocaleString('en-IN')}
                </Typography>
              </Paper>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined">Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, fontWeight: 700 }}
            >
              {submitting ? 'Recording...' : 'Confirm TDS Deduction'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal: Deposit Challan ITNS-281 */}
      <Dialog open={openChallanModal} onClose={() => setOpenChallanModal(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleDepositChallan}>
          <DialogTitle sx={{ bgcolor: '#0f172a', color: '#ffffff' }}>Record Challan ITNS-281 Deposit</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="body2" color="text.secondary">
                Deductee: <strong>{selectedEntry?.vendorName}</strong> | TDS: <strong>₹{selectedEntry?.tdsAmount}</strong>
              </Typography>

              <TextField
                size="small"
                label="Challan Identification No (CIN / Challan #)"
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                fullWidth
                required
              />

              <TextField
                size="small"
                label="BSR Code (7-digit Bank Branch)"
                value={bsrCode}
                onChange={(e) => setBsrCode(e.target.value)}
                fullWidth
                required
              />

              <TextField
                size="small"
                label="Tender / Deposit Date"
                type="date"
                value={challanDate}
                onChange={(e) => setChallanDate(e.target.value)}
                fullWidth
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenChallanModal(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="success" disabled={depositing} sx={{ fontWeight: 700 }}>
              {depositing ? 'Updating...' : 'Mark as Deposited'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}>
        <Alert onClose={() => setSnack('')} severity="success" sx={{ width: '100%', fontWeight: 600 }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
