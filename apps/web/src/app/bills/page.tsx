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
import { Add as AddIcon, Storefront as StorefrontIcon, Payments as PaymentsIcon } from '@mui/icons-material';
import Link from 'next/link';
import { getAuthHeaders } from '../../lib/api';

const columns: GridColDef[] = [
  { field: 'number', headerName: 'Bill #', width: 140 },
  { field: 'vendorName', headerName: 'Vendor', flex: 1 },
  { field: 'billDate', headerName: 'Bill Date', width: 130 },
  { field: 'dueDate', headerName: 'Due Date', width: 130 },
  { 
    field: 'status', 
    headerName: 'Payment Status', 
    width: 145,
    renderCell: (params) => {
      const status = params.value;
      let color: 'default' | 'info' | 'success' | 'warning' | 'error' = 'warning';
      if (status === 'Paid') color = 'success';
      if (status === 'Partially Paid') color = 'info';
      if (status === 'Overdue') color = 'error';
      return <Chip label={status} color={color} size="small" />;
    }
  },
  { 
    field: 'amountPaid', 
    headerName: 'Paid (₹)', 
    width: 150,
    valueGetter: (params: any) => Number(params.row.amountPaid) || 0,
    renderCell: (params) => {
      const paid = Number(params.value) || 0;
      const total = Number(params.row.totalAmount) || 0;
      return total > 0 && paid >= total
        ? <Chip label="Fully paid" color="success" size="small" />
        : `₹${paid.toLocaleString('en-IN')}`;
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
    headerName: 'ITC (₹)', 
    width: 120, 
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}` 
  },
  { 
    field: 'totalAmount', 
    headerName: 'Total (₹)', 
    width: 130,
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}` 
  },
];

const mockBills = [
  { id: '1', number: 'BILL-8801', vendorName: 'AWS Cloud Services', billDate: '2026-08-01', dueDate: '2026-08-15', status: 'Unpaid', taxableAmount: 1525.42, gstAmount: 274.58, totalAmount: 1800, amountPaid: 0 },
  { id: '2', number: 'BILL-8802', vendorName: 'City Office Supplies Co', billDate: '2026-07-20', dueDate: '2026-08-04', status: 'Paid', taxableAmount: 1016.95, gstAmount: 183.05, totalAmount: 1200, amountPaid: 1200 },
  { id: '3', number: 'BILL-8803', vendorName: 'Metropolitan Real Estate', billDate: '2026-07-01', dueDate: '2026-07-15', status: 'Paid', taxableAmount: 2966.1, gstAmount: 533.9, totalAmount: 3500, amountPaid: 3500 },
];

export default function BillsPage() {
  const [rows, setRows] = useState<any[]>(mockBills);
  const [loading, setLoading] = useState(true);
  const [openVendorModal, setOpenVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');

  const [payBill, setPayBill] = useState<any>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payDate, setPayDate] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [paying, setPaying] = useState(false);

  const loadBills = async () => {
    try {
      const res = await fetch('/api/bills', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRows(data.map((item: any) => ({
            id: item.id,
            number: item.number,
            vendorName: item.vendor?.name || 'N/A',
            billDate: item.billDate ? new Date(item.billDate).toISOString().split('T')[0] : '',
            dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
            status: item.status,
            taxableAmount: item.taxableAmount,
            gstAmount: item.gstAmount,
            totalAmount: item.totalAmount,
            amountPaid: (item.payments || []).reduce((s: number, p: any) => s + Number(p.amount), 0),
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const openPayment = (row: any) => {
    setPayBill(row);
    setPayAmount(Math.round((Number(row.totalAmount) - Number(row.amountPaid)) * 100) / 100);
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayMethod('Cash');
  };

  const handlePay = async () => {
    if (!payBill || payAmount <= 0) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/bills/${payBill.id}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ amount: payAmount, date: payDate, method: payMethod })
      });
      if (res.ok) {
        setPayBill(null);
        setPaying(false);
        setLoading(true);
        await loadBills();
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

  const handleAddVendor = async () => {
    if (!newVendorName) return;
    try {
      await fetch('/api/bills/vendors', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ name: newVendorName, email: newVendorEmail })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setOpenVendorModal(false);
      setNewVendorName('');
      setNewVendorEmail('');
      alert('Vendor added successfully!');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Vendor Bills & Operating Expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Record supplier bills, track accounts payable, and manage cash disbursements.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<StorefrontIcon />}
            onClick={() => setOpenVendorModal(true)}
          >
            Add Vendor
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<AddIcon />}
            component={Link}
            href="/bills/new"
          >
            Record Bill / Expense
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
              field: 'recordPayment',
              headerName: 'Actions',
              width: 140,
              sortable: false,
              renderCell: (params) =>
                params.row.status !== 'Paid' && params.row.status !== 'Void' ? (
                  <Button size="small" variant="outlined" startIcon={<PaymentsIcon />} onClick={() => openPayment(params.row)}>
                    Record Payment
                  </Button>
                ) : (
                  <Chip label="Paid" color="success" size="small" />
                )
            }
          ]}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
        )}
      </Box>

      {/* Add Vendor Modal */}
      <Dialog open={openVendorModal} onClose={() => setOpenVendorModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Vendor / Supplier</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField 
            label="Vendor Company Name" 
            value={newVendorName} 
            onChange={(e) => setNewVendorName(e.target.value)} 
            fullWidth 
            required 
          />
          <TextField 
            label="Contact Email" 
            type="email" 
            value={newVendorEmail} 
            onChange={(e) => setNewVendorEmail(e.target.value)} 
            fullWidth 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVendorModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddVendor}>Add Vendor</Button>
        </DialogActions>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={!!payBill} onClose={() => setPayBill(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Record Payment — {payBill?.number}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Bill total ₹{(Number(payBill?.totalAmount) || 0).toLocaleString('en-IN')} · Outstanding ₹{(Math.max(0, Number(payBill?.totalAmount) - Number(payBill?.amountPaid))).toLocaleString('en-IN')}
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
          <Button onClick={() => setPayBill(null)} disabled={paying}>Cancel</Button>
          <Button variant="contained" onClick={handlePay} disabled={paying || payAmount <= 0}>
            {paying ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}