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
  Button,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useRouter } from 'next/navigation';
import { getAuthHeaders } from '../../lib/api';
import { useTenant } from '../../context/TenantContext';

interface VoucherRow {
  id: string;
  date: string;
  voucherType: string;
  voucherNumber: string;
  party: string;
  narration: string;
  debit: number;
  credit: number;
  status: string;
}

const demoDayBook: VoucherRow[] = [
  { id: 'd1', date: '2026-09-01', voucherType: 'Sales', voucherNumber: 'INV-001', party: 'Google Cloud India', narration: 'Sales of services', debit: 0, credit: 182000, status: 'OK' },
  { id: 'd2', date: '2026-08-31', voucherType: 'Receipt', voucherNumber: 'RC-042', party: 'Infosys Technologies', narration: 'Payment received against Invoice INV-009', debit: 124000, credit: 0, status: 'OK' },
  { id: 'd3', date: '2026-08-30', voucherType: 'Payment', voucherNumber: 'PMT-118', party: 'AWS Cloud Services', narration: 'Payment to vendor', debit: 0, credit: 18000, status: 'OK' },
  { id: 'd4', date: '2026-08-29', voucherType: 'Purchase', voucherNumber: 'PUR-015', party: 'Metropolitan Real Estate', narration: 'Office rent purchase', debit: 0, credit: 35000, status: 'OK' },
  { id: 'd5', date: '2026-08-28', voucherType: 'Journal', voucherNumber: 'JV-007', party: '—', narration: 'Depreciation adjustment for fixed assets', debit: 0, credit: 5000, status: 'OK' },
];

export default function DayBookPage() {
  const router = useRouter();
  const { activeTenant } = useTenant();
  const [rows, setRows] = useState<VoucherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/journal', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: VoucherRow[] = data.map((j: any) => {
              const debits = (j.lines || []).filter((l: any) => l.type === 'debit').reduce((s: number, l: any) => s + (Number(l.amount) || 0), 0);
              const credits = (j.lines || []).filter((l: any) => l.type === 'credit').reduce((s: number, l: any) => s + (Number(l.amount) || 0), 0);
              const desc = (j.description || '').toLowerCase();
              let vType = 'Journal';
              if (desc.includes('invoice')) vType = 'Sales';
              else if (desc.includes('payment received')) vType = 'Receipt';
              else if (desc.includes('payment')) vType = 'Payment';
              else if (desc.includes('purchase') || desc.includes('bill')) vType = 'Purchase';
              const party = (j.lines || [])[0]?.description || j.description || '—';
              const num = j.id ? String(j.id).slice(0, 8).toUpperCase() : '—';
              return {
                id: j.id,
                date: j.date ? new Date(j.date).toISOString().split('T')[0] : '',
                voucherType: vType,
                voucherNumber: num,
                party: party.replace(/^Accounts receivable from /i, '').replace(/^Cash received from /i, '').replace(/^Sales revenue from /i, ''),
                narration: j.description || '',
                debit: debits,
                credit: credits,
                status: j.status || 'OK',
              };
            });
            setRows(mapped);
            setIsDemo(false);
          } else {
            setRows(demoDayBook);
            setIsDemo(true);
          }
        } else {
          setRows(demoDayBook);
          setIsDemo(true);
        }
      } catch (e) {
        setRows(demoDayBook);
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const types = ['All', 'Sales', 'Purchase', 'Payment', 'Receipt', 'Journal', 'Contra'];

  const filtered = rows.filter((r) => {
    if (filterType !== 'All' && r.voucherType !== filterType) return false;
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
    return true;
  });

  const totalDebit = filtered.reduce((s, r) => s + r.debit, 0);
  const totalCredit = filtered.reduce((s, r) => s + r.credit, 0);

  return (
    <Box sx={{ flexGrow: 1, p: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MenuBookIcon sx={{ fontSize: 32, color: '#7c3aed' }} />
            Day Book
            <Chip label={isDemo ? 'Sample Data' : activeTenant?.name || ''} size="small" color={isDemo ? 'warning' : 'success'} />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All vouchers recorded for {activeTenant?.name} in chronological order.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/vouchers/new')}>
          New Voucher
        </Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField select size="small" label="Voucher Type" value={filterType} onChange={(e) => setFilterType(e.target.value)} sx={{ minWidth: 150 }}>
          {types.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField size="small" type="date" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField size="small" type="date" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </Paper>

      <Paper sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f3ff' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Voucher No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Voucher Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Party / Narration</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Debit (₹)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Credit (₹)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.voucherNumber}</TableCell>
                    <TableCell><Chip label={r.voucherType} size="small" variant="outlined" /></TableCell>
                    <TableCell>
                      <Box>
                        <strong>{r.party}</strong>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{r.narration}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{r.debit ? r.debit.toLocaleString('en-IN') : '—'}</TableCell>
                    <TableCell align="right">{r.credit ? r.credit.toLocaleString('en-IN') : '—'}</TableCell>
                    <TableCell align="center">
                      <Chip label={r.status} size="small" color={r.status === 'OK' || r.status === 'Posted' ? 'success' : 'warning'} />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell colSpan={4} sx={{ fontWeight: 700 }}>Total ({filtered.length} vouchers)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>₹{totalDebit.toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>₹{totalCredit.toLocaleString('en-IN')}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {isDemo && (
        <Paper sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#fffbeb' }}>
          <Typography variant="caption" color="text.warning">
            Showing sample Day Book data. Connect the backend & log in to see live vouchers posted from your invoices, bills, payments and journals.
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Button size="small" variant="outlined" onClick={() => router.push('/invoices/new')}>
            Record a Sale Invoice
          </Button>
        </Paper>
      )}
    </Box>
  );
}
