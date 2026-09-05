'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Chip, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch,
  IconButton, Alert, LinearProgress
} from '@mui/material';
import { Percent as TaxIcon, Download as DownloadIcon, Settings as SettingsIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getAuthHeaders } from '../../lib/api';

interface RateBucket { rate: number; taxable: number; gst: number; }
interface TaxSide { taxable: number; gst: number; cgst: number; sgst: number; igst: number; byRate: RateBucket[]; }
interface TaxRateRow { id: string; name: string; rate: number; active: boolean; }

function downloadCsv(filename: string, headers: (string | number)[], rows: (string | number)[][]) {
  const esc = (v: any) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TaxPage() {
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState<TaxSide | null>(null);
  const [input, setInput] = useState<TaxSide | null>(null);
  const [netLiability, setNetLiability] = useState(0);
  const [rates, setRates] = useState<TaxRateRow[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const [manageOpen, setManageOpen] = useState(false);
  const [allRates, setAllRates] = useState<TaxRateRow[]>([]);
  const [newRateName, setNewRateName] = useState('');
  const [newRateValue, setNewRateValue] = useState('18');
  const [rateBusy, setRateBusy] = useState(false);

  const demoOutput: TaxSide = { taxable: 35000, gst: 6300, cgst: 3150, sgst: 3150, igst: 0, byRate: [{ rate: 18, taxable: 35000, gst: 6300 }] };
  const demoInput: TaxSide = { taxable: 18000, gst: 3240, cgst: 1620, sgst: 1620, igst: 0, byRate: [{ rate: 18, taxable: 18000, gst: 3240 }] };

  const loadRates = async (includeInactiveFlag = false) => {
    const q = includeInactiveFlag ? '?includeInactive=1' : '';
    const rateRes = await fetch(`/api/tax/rates${q}`, { headers: getAuthHeaders() });
    if (rateRes.ok) {
      const r = await rateRes.json();
      if (Array.isArray(r)) {
        if (includeInactiveFlag) setAllRates(r);
        else setRates(r);
      }
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, rateRes] = await Promise.all([
          fetch('/api/tax/summary', { headers: getAuthHeaders() }),
          fetch('/api/tax/rates', { headers: getAuthHeaders() }),
        ]);
        if (sumRes.ok) {
          const s = await sumRes.json();
          setOutput(s.output);
          setInput(s.input);
          setNetLiability(Number(s.netLiability) || 0);
          setLive(true);
        }
        if (rateRes.ok) {
          const r = await rateRes.json();
          if (Array.isArray(r)) setRates(r);
        }
      } catch (e) { /* fall back to demo */ }
      setLoading(false);
    }
    load();
  }, []);

  const out = output || demoOutput;
  const inn = input || demoInput;
  const net = live ? netLiability : out.gst - inn.gst;

  const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const exportGstr1 = async () => {
    setExporting('gstr1');
    try {
      const res = await fetch('/api/tax/gstr1', { headers: getAuthHeaders() });
      if (!res.ok) {
        const d = await res.json();
        setNotice(d.error || 'GSTR-1 export failed');
        return;
      }
      const report = await res.json();
      if (!report.rows || report.rows.length === 0) {
        setNotice('No invoices in the period — nothing to export for GSTR-1.');
        return;
      }
      const headers = ['GSTIN', 'Receiver GSTIN', 'Doc Type', 'Invoice No', 'Invoice Date', 'Customer', 'Place of Supply', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Cess', 'Total'];
      const rows = report.rows.map((r: any) => [r.gstin, r.receiverGstin, r.documentType, r.invoiceNumber, r.invoiceDate, r.customerName, r.placeOfSupply, r.taxable, r.cgst, r.sgst, r.igst, r.cess, r.total]);
      rows.push(['', '', '', '', '', 'TOTAL', '', report.totals.taxable, report.totals.cgst, report.totals.sgst, report.totals.igst, '', report.totals.total]);
      downloadCsv(`GSTR-1_${report.period.from}_to_${report.period.to}.csv`, headers, rows);
      setNotice(`GSTR-1 exported — ${report.rows.length} invoice(s), ₹${report.totals.total.toLocaleString('en-IN')} total.`);
    } catch (e) {
      setNotice('Backend unreachable. Export not available (demo mode).');
    } finally {
      setExporting(null);
    }
  };

  const exportGstr3b = async () => {
    setExporting('gstr3b');
    try {
      const res = await fetch('/api/tax/gstr3b', { headers: getAuthHeaders() });
      if (!res.ok) {
        const d = await res.json();
        setNotice(d.error || 'GSTR-3B export failed');
        return;
      }
      const report = await res.json();
      const headers = ['Section', 'GST Rate %', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Tax'];
      const rows: (string | number)[][] = [
        ['Table 4A - Outward taxable supplies (B2C/B2B)', '', '', '', '', ''],
        ...report.outward.map((r: any) => ['Outward', r.rate, r.taxable, r.cgst, r.sgst, r.igst, r.totalTax]),
        ['OUTWARD TOTAL', '', report.outwardTotals.taxable, report.outwardTotals.cgst, report.outwardTotals.sgst, report.outwardTotals.igst, report.outwardTotals.totalTax],
        ['Table 4(B) - ITC from vendor bills', '', '', '', '', ''],
        ...report.itc.map((r: any) => ['ITC', r.rate, r.taxable, r.cgst, r.sgst, r.igst, r.totalTax]),
        ['ITC TOTAL', '', '', report.itcTotals.cgst, report.itcTotals.sgst, report.itcTotals.igst, report.itcTotals.totalTax],
        ['Table 5(D) - Net tax payable (Outward - ITC)', '', '', '', '', ''],
        ...report.net.map((r: any) => ['Net', r.rate, r.taxable, r.cgst, r.sgst, r.igst, r.totalTax]),
        ['NET PAYABLE TOTAL', '', '', report.netTotals.cgst, report.netTotals.sgst, report.netTotals.igst, report.netTotals.totalTax],
      ];
      downloadCsv(`GSTR-3B_${report.period.from}_to_${report.period.to}.csv`, headers, rows);
      setNotice('GSTR-3B exported — outward, ITC and net payable tables.');
    } catch (e) {
      setNotice('Backend unreachable. Export not available (demo mode).');
    } finally {
      setExporting(null);
    }
  };

  const openManage = async () => {
    setManageOpen(true);
    setNewRateName('');
    setNewRateValue('18');
    await loadRates(true);
  };

  const toggleRate = async (id: string, active: boolean) => {
    setRateBusy(true);
    try {
      const res = await fetch(`/api/tax/rates/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ active })
      });
      if (res.ok) {
        await loadRates(true);
        await loadRates(false);
      } else {
        const d = await res.json();
        setNotice(d.error || 'Failed to update tax rate');
      }
    } catch (e) {
      setNotice('Backend unreachable.');
    } finally {
      setRateBusy(false);
    }
  };

  const addRate = async () => {
    if (!newRateName.trim() || !newRateValue) return;
    setRateBusy(true);
    try {
      const res = await fetch('/api/tax/rates', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ name: newRateName, rate: Number(newRateValue) })
      });
      if (res.ok) {
        setNewRateName('');
        setNewRateValue('18');
        await loadRates(true);
        await loadRates(false);
        setNotice('Tax rate added.');
      } else {
        const d = await res.json();
        setNotice(d.error || 'Failed to add tax rate');
      }
    } catch (e) {
      setNotice('Backend unreachable.');
    } finally {
      setRateBusy(false);
    }
  };

  const deleteRate = async (id: string) => {
    setRateBusy(true);
    try {
      const res = await fetch(`/api/tax/rates/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ active: false })
      });
      if (res.ok) {
        await loadRates(true);
        await loadRates(false);
        setNotice('Tax rate deactivated.');
      } else {
        const d = await res.json();
        setNotice(d.error || 'Failed to deactivate tax rate');
      }
    } catch (e) {
      setNotice('Backend unreachable.');
    } finally {
      setRateBusy(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TaxIcon sx={{ fontSize: 36, color: '#0284c7' }} />
            GST / VAT Tax Engine
            <Chip label="Growth / Professional Plan" color="info" size="small" />
            {live ? <Chip label="Live from Backend" color="success" size="small" /> : <Chip label="Sample Data" color="warning" size="small" />}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Output tax and input tax credit computed live from posted invoices and vendor bills, with CGST/SGST/IGST split.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={openManage}>
            Manage Tax Rates
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportGstr1} disabled={!!exporting}>
            {exporting === 'gstr1' ? 'Exporting...' : 'Export GSTR-1'}
          </Button>
          <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={exportGstr3b} disabled={!!exporting}>
            {exporting === 'gstr3b' ? 'Exporting...' : 'Export GSTR-3B'}
          </Button>
        </Box>
      </Box>

      {exporting && <LinearProgress sx={{ mb: 2 }} />}
      {notice && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setNotice(null)}>{notice}</Alert>}

      {rates.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {rates.map((r) => (
            <Chip key={r.id} label={`${r.name} · ${Number(r.rate)}%`} size="small" variant="outlined" />
          ))}
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            <Card sx={{ borderLeft: '5px solid #10b981' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Output Tax (Collected)</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981', mt: 1 }}>{fmt(out.gst)}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Taxable turnover {fmt(out.taxable)}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderLeft: '5px solid #0284c7' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Input Tax Credit (Paid)</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#0284c7', mt: 1 }}>{fmt(inn.gst)}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Purchases {fmt(inn.taxable)}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderLeft: '5px solid #8b5cf6' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Net GST Payable to Govt</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: net < 0 ? '#059669' : '#7c3aed', mt: 1 }}>{fmt(Math.abs(net))} {net < 0 ? '(Credit)' : ''}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Output GST − Input Tax Credit
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
            {([
              { title: 'Output GST (GSTR-1 basis)', side: out, color: '#10b981' },
              { title: 'Input GST / Input Tax Credit (ITC)', side: inn, color: '#0284c7' },
            ] as const).map(({ title, side, color }) => (
              <Paper key={title} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color }}>{title}</Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                  <Chip size="small" label={`CGST ${fmt(side.cgst)}`} sx={{ bgcolor: '#10b981' }} />
                  <Chip size="small" label={`SGST ${fmt(side.sgst)}`} sx={{ bgcolor: '#0284c7' }} />
                  <Chip size="small" label={`IGST ${fmt(side.igst)}`} sx={{ bgcolor: '#7c3aed' }} />
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell>Tax Rate</TableCell>
                        <TableCell align="right">Taxable Gross Amount (₹)</TableCell>
                        <TableCell align="right">Tax Amount (₹)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {side.byRate.length === 0 && (
                        <TableRow><TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>No taxable transactions recorded yet</TableCell></TableRow>
                      )}
                      {side.byRate.map((row) => (
                        <TableRow key={`${title}-${row.rate}`}>
                          <TableCell><Chip label={`GST ${row.rate}%`} size="small" variant="outlined" /></TableCell>
                          <TableCell align="right">{fmt(row.taxable)}</TableCell>
                          <TableCell align="right">{fmt(row.gst)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell align="right"><strong>{fmt(side.taxable)}</strong></TableCell>
                        <TableCell align="right"><strong>{fmt(side.gst)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))}
          </Box>
        </>
      )}

      {/* Manage Tax Rates Dialog */}
      <Dialog open={manageOpen} onClose={() => setManageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage GST / Tax Rates</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Registered rates</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            {allRates.map((r) => (
              <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 0.5 }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">{r.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{Number(r.rate)}%{r.active ? '' : ' · inactive'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Switch
                    size="small"
                    checked={r.active}
                    onChange={(e) => toggleRate(r.id, e.target.checked)}
                    disabled={rateBusy}
                  />
                  <IconButton size="small" color="error" onClick={() => deleteRate(r.id)} disabled={rateBusy}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
            {allRates.length === 0 && <Typography variant="body2" color="text.secondary">No rates yet.</Typography>}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Add a new rate</Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label="Name" value={newRateName} onChange={(e) => setNewRateName(e.target.value)} size="small" fullWidth placeholder="e.g. GST 3% (Gold)" />
            <TextField label="Rate %" type="number" value={newRateValue} onChange={(e) => setNewRateValue(e.target.value)} size="small" sx={{ width: 120 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={addRate} disabled={rateBusy || !newRateName.trim()}>Add</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}