'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { getAuthHeaders } from '../../lib/api';
import { useTenant } from '../../context/TenantContext';

interface LedgerLine {
  id: string;
  date: string;
  ref: string;
  description: string;
  debit: number;
  credit: number;
}

export default function LedgerPage() {
  const { activeTenant } = useTenant();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function load() {
      let accts: any[] = [];
      try {
        const res = await fetch('/api/accounts', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            accts = data;
            setAccounts(data);
            setIsDemo(false);
          }
        }
      } catch (e) { /* ignore */ }

      if (accts.length === 0) {
        setAccounts([
          { id: '1', code: '1010', name: 'Cash on Hand', type: 'Asset', balance: 0 },
          { id: '2', code: '1020', name: 'Accounts Receivable', type: 'Asset', balance: 0 },
          { id: '3', code: '2010', name: 'Accounts Payable', type: 'Liability', balance: 0 },
          { id: '4', code: '4010', name: 'Sales Revenue', type: 'Revenue', balance: 0 },
          { id: '5', code: '5010', name: 'General & Administrative Expense', type: 'Expense', balance: 0 },
        ]);
        setIsDemo(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  const selectedAccount = accounts.find((a) => a.id === selected);

  const [lines, setLines] = useState<LedgerLine[]>([]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    async function loadAccountPostings() {
      try {
        const res = await fetch('/api/journal', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const journal = data
              .flatMap((j: any) => (j.lines || [])
                .filter((l: any) => l.accountId === selected)
                .map((l: any) => ({
                  id: `${j.id}-${l.id}`,
                  date: j.date ? new Date(j.date).toISOString().split('T')[0] : '',
                  ref: l.type === 'debit' ? 'Dr' : 'Cr',
                  description: l.description || j.description || '',
                  debit: l.type === 'debit' ? (Number(l.amount) || 0) : 0,
                  credit: l.type === 'credit' ? (Number(l.amount) || 0) : 0,
                })));
            journal.sort((a: any, b: any) => (a.date < b.date ? -1 : 1));
            if (!cancelled) setLines(journal);
          }
        }
      } catch (e) { /* ignore */ }
    }
    loadAccountPostings();
    return () => { cancelled = true; };
  }, [selected]);

  const opening = selectedAccount?.balance ? Number(selectedAccount.balance) : 0;
  const closing = lines.reduce((s, l) => s + (l.debit - l.credit), opening);
  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

  return (
    <Box sx={{ flexGrow: 1, p: 0.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#0d9488' }} />
          Ledgers
          <Chip label={isDemo ? 'Sample Accounts' : activeTenant?.name || ''} size="small" color={isDemo ? 'warning' : 'success'} />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Account-wise ledger statement — opening balance, all postings and closing balance.
        </Typography>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <TextField select label="Select Ledger / Account" value={selected} onChange={(e) => setSelected(e.target.value)} fullWidth size="small">
          {accounts.map((a) => (
            <MenuItem key={a.id} value={a.id}>{a.code} — {a.name} ({a.type})</MenuItem>
          ))}
        </TextField>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : selected ? (
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2, backgroundColor: '#ccfbf1' }}>
            <Typography variant="h6" fontWeight="bold">
              {selectedAccount.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedAccount.code} · {selectedAccount.type} · Opening Balance ₹{opening.toLocaleString('en-IN')}
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f0fdfa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ref / Voucher</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Particulars</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Debit (₹)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Credit (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>—</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>To/Balance b/d (Opening)</TableCell>
                  <TableCell align="right">{opening >= 0 ? opening.toLocaleString('en-IN') : '—'}</TableCell>
                  <TableCell align="right">{opening < 0 ? Math.abs(opening).toLocaleString('en-IN') : '—'}</TableCell>
                </TableRow>
                {lines.map((l) => {
                  return (
                    <TableRow key={l.id} hover>
                      <TableCell>{l.date}</TableCell>
                      <TableCell>{l.ref}</TableCell>
                      <TableCell>{l.description}</TableCell>
                      <TableCell align="right">{l.debit ? l.debit.toLocaleString('en-IN') : '—'}</TableCell>
                      <TableCell align="right">{l.credit ? l.credit.toLocaleString('en-IN') : '—'}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>₹{totalDebit.toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>₹{totalCredit.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: '#f0fdfa' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Closing Balance</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{closing >= 0 ? `₹${closing.toLocaleString('en-IN')} Dr` : ''}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{closing < 0 ? `₹${Math.abs(closing).toLocaleString('en-IN')} Cr` : ''}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Ledger postings come from posted vouchers (Day Book). Record a voucher to see it flow into this ledger.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">Select an account above to view its ledger statement.</Typography>
        </Paper>
      )}
    </Box>
  );
}
