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
import { Add as AddIcon, Storefront as StorefrontIcon } from '@mui/icons-material';
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
    width: 140,
    renderCell: (params) => {
      const status = params.value;
      let color: 'default' | 'info' | 'success' | 'warning' | 'error' = 'warning';
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
  { id: '1', number: 'BILL-8801', vendorName: 'AWS Cloud Services', billDate: '2026-08-01', dueDate: '2026-08-15', status: 'Unpaid', taxableAmount: 1525.42, gstAmount: 274.58, totalAmount: 1800 },
  { id: '2', number: 'BILL-8802', vendorName: 'City Office Supplies Co', billDate: '2026-07-20', dueDate: '2026-08-04', status: 'Paid', taxableAmount: 1016.95, gstAmount: 183.05, totalAmount: 1200 },
  { id: '3', number: 'BILL-8803', vendorName: 'Metropolitan Real Estate', billDate: '2026-07-01', dueDate: '2026-07-15', status: 'Paid', taxableAmount: 2966.1, gstAmount: 533.9, totalAmount: 3500 },
];

export default function BillsPage() {
  const [rows, setRows] = useState<any[]>(mockBills);
  const [loading, setLoading] = useState(true);
  const [openVendorModal, setOpenVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');

  useEffect(() => {
    async function fetchBills() {
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
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching bills:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBills();
  }, []);

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
          columns={columns}
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
    </Box>
  );
}
