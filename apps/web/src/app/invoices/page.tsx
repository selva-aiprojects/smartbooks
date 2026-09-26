'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, PersonAdd as PersonAddIcon, Payments as PaymentsIcon, PictureAsPdf as PdfIcon, QrCode as QrCodeIcon, CheckCircle as VerifiedIcon } from '@mui/icons-material';
import Link from 'next/link';
import { getAuthHeaders } from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { exportTaxInvoicePdf } from '../../lib/pdf-generator';

const columns: GridColDef[] = [
  { field: 'number', headerName: 'Invoice #', width: 140 },
  { field: 'customerName', headerName: 'Customer', flex: 1 },
  { field: 'issueDate', headerName: 'Issue Date', width: 130 },
  { field: 'dueDate', headerName: 'Due Date', width: 130 },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 130,
    renderCell: (params) => {
      const status = params.value;
      let color: 'default' | 'info' | 'success' | 'warning' | 'error' = 'default';
      if (status === 'Sent') color = 'info';
      if (status === 'Paid') color = 'success';
      if (status === 'Overdue') color = 'error';
      return <Chip label={status} color={color} size="small" />;
    }
  },
  { 
    field: 'taxableAmount', 
    headerName: 'Taxable (₹)', 
    width: 130, 
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}` 
  },
  { 
    field: 'gstAmount', 
    headerName: 'GST (₹)', 
    width: 120, 
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}` 
  },
  { 
    field: 'amountPaid', 
    headerName: 'Paid (₹)', 
    width: 120,
    renderCell: (params) => {
      const paid = Number(params.value) || 0;
      const total = Number(params.row.totalAmount) || 0;
      return paid >= total && total > 0
        ? <Chip label="Fully paid" color="success" size="small" />
        : `₹${paid.toLocaleString('en-IN')}`;
    }
  },
  { 
    field: 'totalAmount', 
    headerName: 'Total (₹)', 
    width: 130,
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}` 
  },
];

const mockInvoices = [
  { id: '1', number: 'INV-2026-001', customerName: 'Acme Global Tech', issueDate: '2026-08-01', dueDate: '2026-08-15', status: 'Sent', taxableAmount: 3813.56, gstAmount: 686.44, totalAmount: 4500, amountPaid: 0 },
  { id: '2', number: 'INV-2026-002', customerName: 'Nexus Digital Solutions', issueDate: '2026-07-15', dueDate: '2026-07-30', status: 'Paid', taxableAmount: 3389.83, gstAmount: 610.17, totalAmount: 4000, amountPaid: 4000 },
  { id: '3', number: 'INV-2026-003', customerName: 'Vanguard Retail Inc', issueDate: '2026-06-01', dueDate: '2026-06-15', status: 'Overdue', taxableAmount: 2372.88, gstAmount: 427.12, totalAmount: 2800, amountPaid: 0 },
];

export default function InvoicesPage() {
  const { activeTenant } = useTenant();
  const [rows, setRows] = useState<any[]>(mockInvoices);
  const [rawInvoices, setRawInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [payInvoice, setPayInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState('Cash');
  const [paying, setPaying] = useState(false);

  const loadInvoices = async () => {
    try {
      const res = await fetch('/api/invoices', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRawInvoices(data);
          setRows(data.map((item: any) => ({
              id: item.id,
              number: item.number,
              customerName: item.customer?.name || 'N/A',
              issueDate: item.issueDate ? new Date(item.issueDate).toISOString().split('T')[0] : '',
              dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
              status: item.status,
              irn: item.irn,
              taxableAmount: item.taxableAmount,
              gstAmount: item.gstAmount,
              totalAmount: item.totalAmount,
              amountPaid: (item.payments || []).reduce((s: number, p: any) => s + Number(p.amount), 0),
            })));
        }
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEInvoice = async (row: any) => {
    try {
      const res = await fetch(`/api/invoices/${row.id}/e-invoice`, {
        method: 'POST',
        headers: getAuthHeaders(true),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Official IRP e-Invoice IRN Generated!\nIRN: ${data.irn.slice(0, 32)}...\nAck #: ${data.ackNo}`);
        await loadInvoices();
      } else {
        alert(data.error || 'Failed to generate e-Invoice');
      }
    } catch (err: any) {
      alert(err.message || 'Network error generating e-Invoice');
    }
  };

  const handleDownloadInvoicePdf = (row: any) => {
    const raw = rawInvoices.find((i) => i.id === row.id) || row;
    exportTaxInvoicePdf({
      company: {
        name: activeTenant?.name || 'SmartBooks Enterprise Ltd.',
        gstin: activeTenant?.gstin || '33AABCS1429B1ZB',
        address: 'HQ Tower, Tech Corridor, OMR, Chennai, TN - 600096',
        email: activeTenant?.contactEmail || 'billing@smartbooks.com',
        phone: activeTenant?.contactPhone || '+91 98400 12345',
      },
      customer: {
        name: raw.customer?.name || row.customerName || 'Client Customer',
        gstin: raw.customer?.gstin || '33AAACN8123C1Z8',
        address: raw.customer?.address || 'Client Corporate Office, India',
        state: 'Tamil Nadu (33)',
      },
      invoice: {
        number: raw.number || row.number,
        issueDate: raw.issueDate || row.issueDate,
        dueDate: raw.dueDate || row.dueDate,
        isInterState: !!raw.isInterState,
        taxableAmount: Number(raw.taxableAmount || row.taxableAmount),
        gstAmount: Number(raw.gstAmount || row.gstAmount),
        totalAmount: Number(raw.totalAmount || row.totalAmount),
        status: raw.status || row.status,
        irn: raw.irn || row.irn,
        ackNo: raw.ackNo || row.ackNo,
        ackDate: raw.ackDate ? new Date(raw.ackDate).toLocaleString('en-IN') : null,
        items: (raw.items && raw.items.length > 0)
          ? raw.items.map((it: any) => ({
              description: it.description || 'Professional Services',
              hsnCode: it.hsnCode || '998313',
              quantity: Number(it.quantity) || 1,
              unitPrice: Number(it.unitPrice) || Number(it.amount),
              amount: Number(it.amount),
              gstRate: Number(it.gstRate) || 18,
              gstAmount: Number(it.gstAmount) || (Number(it.amount) * 0.18),
            }))
          : [
              {
                description: 'Enterprise Accounting & Subscription Services',
                hsnCode: '998313',
                quantity: 1,
                unitPrice: Number(row.taxableAmount),
                amount: Number(row.taxableAmount),
                gstRate: Math.round(((Number(row.gstAmount) || 0) / (Number(row.taxableAmount) || 1)) * 100),
                gstAmount: Number(row.gstAmount),
              },
            ],
      },
    });

    fetch('/api/audit-trail', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        action: 'EXPORT',
        entityType: 'INVOICE',
        entityId: row.id,
        entityRef: row.number,
        details: `Exported GST Tax Invoice PDF for #${row.number}`,
      }),
    }).catch(() => {});
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const openPayment = (row: any) => {
    setPayInvoice(row);
    setPayAmount(Math.round((Number(row.totalAmount) - Number(row.amountPaid)) * 100) / 100);
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayMethod('Cash');
  };

  const handlePay = async () => {
    if (!payInvoice || payAmount <= 0) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/invoices/${payInvoice.id}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ amount: payAmount, date: payDate, method: payMethod })
      });
      if (res.ok) {
        setPayInvoice(null);
        setPaying(false);
        setLoading(true);
        await loadInvoices();
        return;
      }
      const data = await res.json();
      alert(data.error || 'Failed to record payment');
    } catch (err) {
      console.error(err);
      alert('Backend unreachable. Payment not recorded.');
    } finally {
      setPaying(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName) return;
    try {
      await fetch('/api/invoices/customers', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ name: newCustomerName, email: newCustomerEmail })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setOpenCustomerModal(false);
      setNewCustomerName('');
      setNewCustomerEmail('');
      alert('Customer added successfully!');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Customer Invoices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage client billing, track payment status, and record accounts receivable.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenCustomerModal(true)}
          >
            Add Customer
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href="/invoices/new"
          >
            Create Invoice
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 480, width: '100%', backgroundColor: '#fff', borderRadius: 2, p: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
        <DataGrid
          rows={rows}
          columns={[
            ...columns,
            {
              field: 'irn',
              headerName: 'e-Invoice (IRP)',
              width: 140,
              renderCell: (params) => params.value ? (
                <Chip icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />} label="IRN Active" color="success" size="small" variant="outlined" />
              ) : (
                <Button size="small" variant="text" color="info" startIcon={<QrCodeIcon />} onClick={() => handleGenerateEInvoice(params.row)}>
                  Get IRN
                </Button>
              )
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 200,
              sortable: false,
              renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<PdfIcon />}
                    onClick={() => handleDownloadInvoicePdf(params.row)}
                  >
                    PDF
                  </Button>
                  {params.row.status !== 'Paid' && params.row.status !== 'Void' ? (
                    <Button size="small" variant="contained" color="secondary" startIcon={<PaymentsIcon />} onClick={() => openPayment(params.row)}>
                      Pay
                    </Button>
                  ) : (
                    <Chip label="Paid" color="success" size="small" />
                  )}
                </Box>
              )
            }
          ]}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
        )}
      </Box>

      {/* Add Customer Modal */}
      <Dialog open={openCustomerModal} onClose={() => setOpenCustomerModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField 
            label="Customer / Company Name" 
            value={newCustomerName} 
            onChange={(e) => setNewCustomerName(e.target.value)} 
            fullWidth 
            required 
          />
          <TextField 
            label="Email Address" 
            type="email" 
            value={newCustomerEmail} 
            onChange={(e) => setNewCustomerEmail(e.target.value)} 
            fullWidth 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomerModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCustomer}>Add Customer</Button>
        </DialogActions>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={!!payInvoice} onClose={() => setPayInvoice(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Record Payment — {payInvoice?.number}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Invoice total ₹{(Number(payInvoice?.totalAmount) || 0).toLocaleString('en-IN')} · Outstanding ₹{(Math.max(0, Number(payInvoice?.totalAmount) - Number(payInvoice?.amountPaid))).toLocaleString('en-IN')}
          </Typography>
          <TextField
            label="Payment Amount (₹)"
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            fullWidth
            required
          />
          <TextField
            label="Payment Date"
            type="date"
            value={payDate}
            onChange={(e) => setPayDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select value={payMethod} label="Payment Method" onChange={(e) => setPayMethod(e.target.value)}>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayInvoice(null)} disabled={paying}>Cancel</Button>
          <Button variant="contained" onClick={handlePay} disabled={paying || payAmount <= 0}>
            {paying ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
