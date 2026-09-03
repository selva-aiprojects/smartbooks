'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { getAuthHeaders } from '../../../lib/api';

const VOUCHER_TYPES = [
  { value: 'payment', label: 'Payment Voucher' },
  { value: 'receipt', label: 'Receipt Voucher' },
  { value: 'sales', label: 'Sales Voucher' },
  { value: 'purchase', label: 'Purchase Voucher' },
  { value: 'journal', label: 'Journal Voucher' },
  { value: 'contra', label: 'Contra Voucher' },
];

const DEFAULT_ACCOUNTS = [
  { id: 'cash', code: '1010', name: 'Cash on Hand' },
  { id: 'bank', code: '1030', name: 'Bank Account' },
  { id: 'ar', code: '1020', name: 'Accounts Receivable' },
  { id: 'ap', code: '2010', name: 'Accounts Payable' },
  { id: 'sales', code: '4010', name: 'Sales Revenue' },
  { id: 'expense', code: '5010', name: 'General & Administrative Expense' },
];

function VoucherForm() {
  const params = useSearchParams();
  const router = useRouter();
  const urlType = params.get('type') || 'payment';

  const [vtype, setVtype] = useState(urlType);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [party, setParty] = useState('');
  const [narration, setNarration] = useState('');
  const [amount, setAmount] = useState('');
  const [fromId, setFromId] = useState('ar');
  const [toId, setToId] = useState('sales');
  const [accounts, setAccounts] = useState<any[]>(DEFAULT_ACCOUNTS);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch('/api/accounts', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setAccounts(data);
        }
      } catch (e) { /* ignore */ }
    }
    loadAccounts();
  }, []);

  useEffect(() => {
    setVtype(urlType);
  }, [urlType]);

  useEffect(() => {
    switch (vtype) {
      case 'payment': setFromId('expense'); setToId('bank'); break;
      case 'receipt': setFromId('bank'); setToId('ar'); break;
      case 'sales': setFromId('ar'); setToId('sales'); break;
      case 'purchase': setFromId('ap'); setToId('expense'); break;
      case 'contra': setFromId('cash'); setToId('bank'); break;
      default: setFromId('ar'); setToId('sales'); break;
    }
  }, [vtype]);

  const amountNum = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum <= 0) {
      setSnack({ type: 'error', message: 'Enter a valid amount' });
      return;
    }
    setSubmitting(true);
    const lines = [
      { accountId: fromId, amount: amountNum, type: 'debit', description: party || vtype },
      { accountId: toId, amount: amountNum, type: 'credit', description: party || vtype },
    ];
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ date, description: narration || `${vtype} voucher - ${party || 'Party'}`, lines }),
      });
      if (res.ok) {
        setSnack({ type: 'success', message: 'Voucher recorded & posted to General Ledger. Check Day Book & Ledgers.' });
        setParty('');
        setAmount('');
        setNarration('');
        setTimeout(() => router.push('/day-book'), 1200);
      } else {
        const data = await res.json();
        setSnack({ type: 'error', message: data.error || 'Failed to post voucher' });
      }
    } catch (err) {
      setSnack({ type: 'error', message: 'Backend unreachable. Voucher not posted (demo mode).' });
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = VOUCHER_TYPES.find((t) => t.value === vtype)?.label || 'Voucher';

  return (
    <Box sx={{ flexGrow: 1, p: 0.5, maxWidth: 720 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SwapHorizIcon sx={{ fontSize: 32, color: '#0284c7' }} />
          Voucher Entry
          <Chip label={typeLabel} color="primary" size="small" />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Record a balanced double-entry voucher. It immediately appears in the Day Book and posts to its Ledgers.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Voucher Type</InputLabel>
            <Select value={vtype} label="Voucher Type" onChange={(e) => setVtype(e.target.value)}>
              {VOUCHER_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField label="Voucher Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} fullWidth size="small" sx={{ mb: 2 }} required />

          <TextField
            label={vtype === 'sales' ? 'Customer' : vtype === 'purchase' ? 'Vendor' : 'Party / Name'}
            value={party}
            onChange={(e) => setParty(e.target.value)}
            fullWidth size="small" sx={{ mb: 2 }} placeholder="e.g. Google Cloud India"
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{vtype === 'payment' ? 'Paid From (Debit)' : 'Dr Ledger'}</InputLabel>
              <Select value={fromId} label={vtype === 'payment' ? 'Paid From (Debit)' : 'Dr Ledger'} onChange={(e) => setFromId(e.target.value)}>
                {accounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>{vtype === 'receipt' ? 'Received To (Credit)' : 'Cr Ledger'}</InputLabel>
              <Select value={toId} label={vtype === 'receipt' ? 'Received To (Credit)' : 'Cr Ledger'} onChange={(e) => setToId(e.target.value)}>
                {accounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth size="small" sx={{ mb: 2 }} required inputProps={{ min: 0, step: '0.01' }}
          />

          <TextField label="Narration" value={narration} onChange={(e) => setNarration(e.target.value)} fullWidth size="small" sx={{ mb: 2 }} />

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Entry is posted as a balanced journal (Debit ₹{amountNum.toLocaleString('en-IN')} / Credit ₹{amountNum.toLocaleString('en-IN')})
            </Typography>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={submitting}>
              {submitting ? 'Posting...' : 'Save Voucher'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)}>
        <Alert severity={snack?.type || 'info'} onClose={() => setSnack(null)} sx={{ width: '100%' }}>{snack?.message}</Alert>
      </Snackbar>

      {submitting && <Box sx={{ mt: 2 }}><CircularProgress size={20} /></Box>}
    </Box>
  );
}

export default function NewVoucherPage() {
  return (
    <Suspense fallback={<Box sx={{ p: 5 }}>Loading voucher...</Box>}>
      <VoucherForm />
    </Suspense>
  );
}
