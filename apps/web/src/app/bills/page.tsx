'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Storefront as StorefrontIcon } from '@mui/icons-material';
import Link from 'next/link';

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
    field: 'totalAmount', 
    headerName: 'Total Amount (₹)', 
    width: 150, 
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}` 
  },
];

const mockBills = [
  { id: '1', number: 'BILL-8801', vendorName: 'AWS Cloud Services', billDate: '2026-08-01', dueDate: '2026-08-15', status: 'Unpaid', totalAmount: 1800 },
  { id: '2', number: 'BILL-8802', vendorName: 'City Office Supplies Co', billDate: '2026-07-20', dueDate: '2026-08-04', status: 'Paid', totalAmount: 1200 },
  { id: '3', number: 'BILL-8803', vendorName: 'Metropolitan Real Estate', billDate: '2026-07-01', dueDate: '2026-07-15', status: 'Paid', totalAmount: 3500 },
];

export default function BillsPage() {
  const [rows, setRows] = useState<any[]>(mockBills);
  const [openVendorModal, setOpenVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');

  const handleAddVendor = async () => {
    if (!newVendorName) return;
    try {
      await fetch('/api/bills/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVendorName, email: newVendorEmail, companyId: 'demo' })
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
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
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
