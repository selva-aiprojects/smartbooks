'use client';

import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Alert, Snackbar } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';

const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

const columns: GridColDef[] = [
  { field: 'code', headerName: 'Account Code', width: 150 },
  { field: 'name', headerName: 'Account Name', flex: 1 },
  { field: 'type', headerName: 'Type', width: 150 },
  { 
    field: 'balance', 
    headerName: 'Current Balance', 
    width: 160, 
    valueFormatter: (value) => `$${value ?? 0}` 
  },
];

const fallbackAccounts = [
  { id: '1', code: '1010', name: 'Cash on Hand', type: 'Asset', balance: 15000 },
  { id: '2', code: '1020', name: 'Accounts Receivable', type: 'Asset', balance: 4500 },
  { id: '3', code: '2010', name: 'Accounts Payable', type: 'Liability', balance: 2300 },
  { id: '4', code: '3010', name: 'Owner Equity', type: 'Equity', balance: 17200 },
  { id: '5', code: '4010', name: 'Sales Revenue', type: 'Revenue', balance: 25000 },
  { id: '6', code: '5010', name: 'Salaries Expense', type: 'Expense', balance: 12000 },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({ name: '', code: '', type: 'Asset' });

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch('/api/accounts');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAccounts(data);
            return;
          }
        }
        setAccounts(fallbackAccounts);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setAccounts(fallbackAccounts);
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  const resetForm = () => setForm({ name: '', code: '', type: 'Asset' });

  const handleOpen = () => { resetForm(); setOpen(true); };
  const handleClose = () => { if (!submitting) setOpen(false); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setSnack({ type: 'error', message: 'Name and code are required' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, balance: 0 }),
      });
      if (res.ok) {
        const created = await res.json();
        setAccounts((prev) => [...prev.filter((a) => a.code !== created.code), created].sort((a, b) => a.code.localeCompare(b.code)));
        setOpen(false);
        setSnack({ type: 'success', message: `Account "${created.name}" created` });
      } else {
        const err = await res.json();
        setSnack({ type: 'error', message: err.error || 'Failed to create account' });
      }
    } catch (err) {
      console.error('Error creating account:', err);
      setSnack({ type: 'error', message: 'Backend unreachable. Add Account is unavailable in demo/offline mode.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Chart of Accounts</Typography>
        <Button variant="contained" onClick={handleOpen}>
          Add Account
        </Button>
      </Box>

      <Box sx={{ height: 450, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={accounts}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Add Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Account Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Account Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              fullWidth
            >
              {ACCOUNT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
      >
        <Alert severity={snack?.type || 'info'} onClose={() => setSnack(null)}>
          {snack?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
