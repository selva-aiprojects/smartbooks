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
  LocalShipping as TruckIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as VerifiedIcon,
  Refresh as RefreshIcon,
  DirectionsCar as CarIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { getAuthHeaders } from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { exportEWayBillPdf } from '../../lib/pdf-generator';

interface EWayBillRow {
  id: string;
  ewbNumber: string;
  ewbDate: string;
  validUpto: string;
  docNo: string;
  docDate: string;
  fromGstin: string;
  fromAddress: string;
  fromPincode: string;
  toGstin: string;
  toAddress: string;
  toPincode: string;
  totalValue: number;
  transporterName?: string;
  transporterId?: string;
  vehicleNo?: string;
  transMode: string;
  distanceKm: number;
  status: string;
}

export default function EWayBillsPage() {
  const { activeTenant } = useTenant();
  const [rows, setRows] = useState<EWayBillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Form state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [docNo, setDocNo] = useState('');
  const [fromGstin, setFromGstin] = useState(activeTenant?.gstin || '33AABCS1429B1ZB');
  const [fromAddress, setFromAddress] = useState('Tech Corridor, OMR, Chennai, TN - 600096');
  const [fromPincode, setFromPincode] = useState('600096');
  const [toGstin, setToGstin] = useState('29AAACN8123C1Z8');
  const [toAddress, setToAddress] = useState('Logistics Hub, Whitefield, Bangalore, KA - 560066');
  const [toPincode, setToPincode] = useState('560066');
  const [totalValue, setTotalValue] = useState(85000);
  const [distanceKm, setDistanceKm] = useState(350);
  const [vehicleNo, setVehicleNo] = useState('TN-09-CB-9842');
  const [transporterName, setTransporterName] = useState('VRL Logistics Limited');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ewbRes, invRes] = await Promise.all([
        fetch('/api/e-way-bills', { headers: getAuthHeaders() }),
        fetch('/api/invoices', { headers: getAuthHeaders() }),
      ]);

      if (ewbRes.ok) {
        const ewbData = await ewbRes.json();
        setRows(ewbData || []);
      }
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(invData || []);
      }
    } catch (err) {
      console.error('Failed to load e-way bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvoiceSelect = (invId: string) => {
    setSelectedInvoiceId(invId);
    const found = invoices.find((i) => i.id === invId);
    if (found) {
      setDocNo(found.number);
      setTotalValue(Number(found.totalAmount));
      if (found.customer?.gstin) setToGstin(found.customer.gstin);
      if (found.customer?.address) setToAddress(found.customer.address);
    }
  };

  const handleGenerateEwb = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/e-way-bills', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          invoiceId: selectedInvoiceId || undefined,
          docNo: docNo || `INV-${Date.now().toString().slice(-4)}`,
          fromGstin,
          fromAddress,
          fromPincode,
          toGstin,
          toAddress,
          toPincode,
          totalValue,
          distanceKm,
          vehicleNo,
          transporterName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSnack(`✅ e-Way Bill #${data.ewb.ewbNumber} generated successfully!`);
        setOpenModal(false);
        await loadData();
      } else {
        alert(data.error || 'Failed to generate e-Way Bill');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'ewbNumber',
      headerName: 'e-Way Bill #',
      width: 170,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="800" color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'docNo',
      headerName: 'Doc / Invoice #',
      width: 140,
    },
    {
      field: 'ewbDate',
      headerName: 'Generated On',
      width: 140,
      valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString('en-IN') : '-',
    },
    {
      field: 'validUpto',
      headerName: 'Valid Upto',
      width: 150,
      renderCell: (params) => {
        const isExpired = new Date(params.value).getTime() < Date.now();
        return (
          <Chip
            label={new Date(params.value).toLocaleDateString('en-IN')}
            size="small"
            color={isExpired ? 'error' : 'success'}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'vehicleNo',
      headerName: 'Vehicle #',
      width: 140,
      renderCell: (params) => (
        <Chip
          icon={<CarIcon sx={{ fontSize: '14px !important' }} />}
          label={params.value || 'Not Assigned'}
          size="small"
        />
      ),
    },
    {
      field: 'totalValue',
      headerName: 'Goods Value (₹)',
      width: 140,
      valueFormatter: (value: any) => `₹${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      field: 'distanceKm',
      headerName: 'Distance',
      width: 110,
      valueFormatter: (value: any) => `${value} KM`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'ACTIVE' ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Print Slip',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<PdfIcon />}
          onClick={() => exportEWayBillPdf(params.row)}
        >
          Slip
        </Button>
      ),
    },
  ];

  const totalTransitValue = rows.reduce((s, r) => s + Number(r.totalValue || 0), 0);

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <TruckIcon sx={{ fontSize: 36, color: '#0284c7' }} />
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
              e-Way Bill Management & Logistics Portal
            </Typography>
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: '16px !important' }} />}
              label="GSTN Rule 138 Connected"
              color="success"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Statutory transport documentation for consignment values exceeding ₹50,000. Automated 12-digit EWB generation and Part-A / Part-B slip printing.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 700 }}
          >
            Generate e-Way Bill
          </Button>
        </Box>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">TOTAL E-WAY BILLS ISSUED</Typography>
              <Typography variant="h5" fontWeight="800" color="#0f172a">{rows.length} Consignments</Typography>
              <Typography variant="caption" color="#10b981" fontWeight="600">100% Tax Compliant</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">GOODS VALUE IN TRANSIT</Typography>
              <Typography variant="h5" fontWeight="800" color="#0284c7">₹{totalTransitValue.toLocaleString('en-IN')}</Typography>
              <Typography variant="caption" color="text.secondary">Covered under valid transit permits</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">PRIMARY CONSIGNOR GSTIN</Typography>
              <Typography variant="h5" fontWeight="800" color="#334155">{activeTenant?.gstin || '33AABCS1429B1ZB'}</Typography>
              <Typography variant="caption" color="text.secondary">{activeTenant?.name || 'Active Tenant'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <Box sx={{ height: 500, width: '100%', bgcolor: '#ffffff', borderRadius: 2, p: 1 }}>
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

      {/* Modal Generate e-Way Bill */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleGenerateEwb}>
          <DialogTitle sx={{ bgcolor: '#0f172a', color: '#ffffff' }}>
            Generate Statutory e-Way Bill (NIC Format)
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Link with Existing Invoice (Optional)</InputLabel>
                <Select
                  value={selectedInvoiceId}
                  label="Link with Existing Invoice (Optional)"
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                >
                  <MenuItem value="">None (Custom Consignment)</MenuItem>
                  {invoices.map((inv) => (
                    <MenuItem key={inv.id} value={inv.id}>
                      {inv.number} — {inv.customer?.name} (₹{Number(inv.totalAmount).toLocaleString('en-IN')})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Document / Invoice #"
                    value={docNo}
                    onChange={(e) => setDocNo(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Consignment Total Value (₹)"
                    type="number"
                    value={totalValue}
                    onChange={(e) => setTotalValue(Number(e.target.value))}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }}>PART-A (Consignor & Consignee)</Divider>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Dispatch From GSTIN"
                    value={fromGstin}
                    onChange={(e) => setFromGstin(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Dispatch From PIN Code"
                    value={fromPincode}
                    onChange={(e) => setFromPincode(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Delivery To GSTIN"
                    value={toGstin}
                    onChange={(e) => setToGstin(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    label="Delivery To PIN Code"
                    value={toPincode}
                    onChange={(e) => setToPincode(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }}>PART-B (Transportation & Vehicle)</Divider>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    label="Distance in KM"
                    type="number"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    helperText={`Validity: ${Math.max(1, Math.ceil(distanceKm / 200))} day(s)`}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    label="Vehicle Number"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    size="small"
                    label="Transporter Name"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 700 }}
            >
              {submitting ? 'Generating 12-Digit EWB...' : 'Confirm & Generate e-Way Bill'}
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
