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
  TextField
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import Link from 'next/link';
import { getAuthHeaders } from '../../lib/api';

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
    field: 'totalAmount', 
    headerName: 'Total (₹)', 
    width: 130,
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}` 
  },
];

const mockInvoices = [
  { id: '1', number: 'INV-2026-001', customerName: 'Acme Global Tech', issueDate: '2026-08-01', dueDate: '2026-08-15', status: 'Sent', taxableAmount: 3813.56, gstAmount: 686.44, totalAmount: 4500 },
  { id: '2', number: 'INV-2026-002', customerName: 'Nexus Digital Solutions', issueDate: '2026-07-15', dueDate: '2026-07-30', status: 'Paid', taxableAmount: 3389.83, gstAmount: 610.17, totalAmount: 4000 },
  { id: '3', number: 'INV-2026-003', customerName: 'Vanguard Retail Inc', issueDate: '2026-06-01', dueDate: '2026-06-15', status: 'Overdue', taxableAmount: 2372.88, gstAmount: 427.12, totalAmount: 2800 },
];

export default function InvoicesPage() {
  const [rows, setRows] = useState<any[]>(mockInvoices);
  const [loading, setLoading] = useState(true);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch('/api/invoices', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setRows(data.map((item: any) => ({
              id: item.id,
              number: item.number,
              customerName: item.customer?.name || 'N/A',
              issueDate: item.issueDate ? new Date(item.issueDate).toISOString().split('T')[0] : '',
              dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
              status: item.status,
              taxableAmount: item.taxableAmount,
              gstAmount: item.gstAmount,
              totalAmount: item.totalAmount,
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

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
          columns={columns}
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
    </Box>
  );
}
