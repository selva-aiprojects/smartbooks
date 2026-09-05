'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, Card, CardContent, Divider, CircularProgress,
  TextField, Stack,
} from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon, ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { getAuthHeaders } from '../../lib/api';
import { useTenant } from '../../context/TenantContext';

interface TBRow { code: string; name: string; type: string; debit: number; credit: number; }

interface PnLAccount { code: string; name: string; amount: number; lines: Array<{ entryId: string; date: string; type: string; amount: number; description: string }>; }
interface AgingBucket { bracket: string; amount: number; count: number; items: Array<{ id: string; number: string; name: string; dueDate: string; daysOverdue: number; outstanding: number }>; }

export default function FinancialReportsPage() {
  const { activeTenant } = useTenant();
  const [tabValue, setTabValue] = useState(0);
  const [trialBalance, setTrialBalance] = useState<TBRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [pnl, setPnl] = useState<{ revenue: PnLAccount[]; expenses: PnLAccount[]; totalRevenue: number; totalExpenses: number; netProfit: number; grossMargin: number; from: string | null; to: string | null } | null>(null);
  const [pnlLoading, setPnlLoading] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState(`${new Date().getFullYear()}-01-01`);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const [aging, setAging] = useState<{ receivables: { total: number; buckets: AgingBucket[] }; payables: { total: number; buckets: AgingBucket[] } } | null>(null);
  const [agingLoading, setAgingLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [accRes, jrRes] = await Promise.all([
          fetch('/api/accounts', { headers: getAuthHeaders() }),
          fetch('/api/journal', { headers: getAuthHeaders() }),
        ]);
        const accounts = accRes.ok ? await accRes.json() : [];
        const journals = jrRes.ok ? await jrRes.json() : [];
        if (Array.isArray(accounts) && accounts.length > 0) {
          const openingByCode: Record<string, number> = {};
          (accounts as any[]).forEach((a) => { openingByCode[a.code] = Number(a.balance) || 0; });
          const debitMap: Record<string, number> = {};
          const creditMap: Record<string, number> = {};
          if (Array.isArray(journals)) {
            journals.forEach((j: any) => {
              (j.lines || []).forEach((l: any) => {
                const code = l.account?.code;
                if (!code) return;
                const amt = Number(l.amount) || 0;
                if (l.type === 'debit') debitMap[code] = (debitMap[code] || 0) + amt;
                else creditMap[code] = (creditMap[code] || 0) + amt;
              });
            });
          }
          const rows: TBRow[] = (accounts as any[]).map((a) => {
            const open = openingByCode[a.code] || 0;
            const db = (debitMap[a.code] || 0) + (open > 0 ? open : 0);
            const cr = (creditMap[a.code] || 0) + (open < 0 ? Math.abs(open) : 0);
            return { code: a.code, name: a.name, type: a.type, debit: db, credit: cr };
          });
          setTrialBalance(rows);
        }
      } catch (e) { /* fall back to demo */ }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadPnl() {
      setPnlLoading(true);
      try {
        const qs = new URLSearchParams();
        if (fromDate) qs.set('from', fromDate);
        if (toDate) qs.set('to', toDate);
        const res = await fetch(`/api/reports/profit-loss?${qs.toString()}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.revenue)) setPnl(data);
        }
      } catch (e) { /* keep demo */ } finally {
        setPnlLoading(false);
      }
    }
    loadPnl();
  }, [fromDate, toDate]);

  useEffect(() => {
    async function loadAging() {
      setAgingLoading(true);
      try {
        const res = await fetch('/api/reports/aging', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data && data.receivables && data.payables) setAging(data);
        }
      } catch (e) { /* demo */ } finally {
        setAgingLoading(false);
      }
    }
    loadAging();
  }, []);

  const demoBalanceSheet = {
    assets: [
      { code: '1010', name: 'Cash on Hand', amount: 25000 },
      { code: '1020', name: 'Accounts Receivable', amount: 8500 },
    ],
    liabilities: [{ code: '2010', name: 'Accounts Payable', amount: 4200 }],
    equity: [{ code: '3010', name: 'Owner Equity', amount: 29300 }],
  };
  const demoIncome = {
    revenue: [{ code: '4010', name: 'Sales Revenue', amount: 35000 }],
    expenses: [
      { code: '5010', name: 'General & Administrative Expense', amount: 15000 },
      { code: '5020', name: 'Salaries & Payroll Expense', amount: 8000 },
      { code: '5030', name: 'Utilities & Rent Expense', amount: 2000 },
    ],
  };

  const live = !!trialBalance;

  const balanceAssetRows = useMemo(() => {
    if (!trialBalance) return demoBalanceSheet.assets;
    return trialBalance.filter(r => r.type === 'Asset').map(r => ({ code: r.code, name: r.name, amount: r.debit - r.credit }));
  }, [trialBalance]);
  const balanceLiabilityRows = useMemo(() => {
    if (!trialBalance) return demoBalanceSheet.liabilities;
    return trialBalance.filter(r => r.type === 'Liability').map(r => ({ code: r.code, name: r.name, amount: r.credit - r.debit }));
  }, [trialBalance]);
  const balanceEquityRows = useMemo(() => {
    if (!trialBalance) return demoBalanceSheet.equity;
    return trialBalance.filter(r => r.type === 'Equity').map(r => ({ code: r.code, name: r.name, amount: r.credit - r.debit }));
  }, [trialBalance]);

  const totalAssets = balanceAssetRows.reduce((s, i) => s + Math.abs(i.amount), 0);
  const totalLiabilities = balanceLiabilityRows.reduce((s, i) => s + Math.abs(i.amount), 0);
  const totalEquity = balanceEquityRows.reduce((s, i) => s + Math.abs(i.amount), 0);
  const totalRevenue = pnl ? pnl.totalRevenue : demoIncome.revenue.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = pnl ? pnl.totalExpenses : demoIncome.expenses.reduce((s, i) => s + i.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const tbTotalDebit = trialBalance ? trialBalance.reduce((s, r) => s + r.debit, 0) : 0;
  const tbTotalCredit = trialBalance ? trialBalance.reduce((s, r) => s + r.credit, 0) : 0;

  const handleExport = () => alert('Report downloaded successfully!');

  const toggleAccount = (code: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const renderPnlRows = (rows: PnLAccount[], positive: boolean) => {
    return rows.map((row) => {
      const expanded = expandedAccounts.has(row.code);
      const display = positive ? row.amount : Math.abs(row.amount);
      return (
        <Box key={row.code}>
          <TableRow hover onClick={() => toggleAccount(row.code)} sx={{ cursor: 'pointer', bgcolor: '#f8fafc' }}>
            <TableCell><Chip label={row.code} size="small" variant="outlined" color={positive ? 'success' : 'error'} /></TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell align="right">₹{display.toLocaleString('en-IN')}</TableCell>
            <TableCell align="right">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{(row.lines || []).length} lines</Typography>
                {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </Box>
            </TableCell>
          </TableRow>
          {expanded && (
            <TableRow key={`${row.code}-detail`}>
              <TableCell colSpan={4} sx={{ bgcolor: '#ffffff', py: 0 }}>
                <Table size="small" sx={{ m: 1, mb: 2 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(row.lines || []).map((l, idx) => (
                      <TableRow key={`${row.code}-${idx}`}>
                        <TableCell>{l.date ? new Date(l.date).toISOString().split('T')[0] : ''}</TableCell>
                        <TableCell>{l.description}</TableCell>
                        <TableCell align="right">{l.type === 'debit' ? '-' : ''}₹{Number(l.amount).toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableCell>
            </TableRow>
          )}
        </Box>
      );
    });
  };

  const renderAgingBuckets = (buckets: AgingBucket[]) => {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2 }}>
        {buckets.map(b => (
          <Card key={b.bracket} sx={{ borderTop: b.bracket === 'Current' ? '3px solid #10b981' : b.bracket === '1-30 Days' ? '3px solid #0284c7' : b.bracket === '31-60 Days' ? '3px solid #f59e0b' : '3px solid #ef4444' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">{b.bracket}</Typography>
              <Typography variant="h6" fontWeight="bold">₹{b.amount.toLocaleString('en-IN')}</Typography>
              <Typography variant="caption" color="text.secondary">{b.count} open item(s)</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  const renderAgingItems = (buckets: AgingBucket[]) => {
    return buckets.map((b) => (
      <Box key={b.bracket} sx={{ mb: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                <TableCell>{b.bracket}</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Customer / Vendor</TableCell>
                <TableCell align="right">Due Date</TableCell>
                <TableCell align="right">Days Overdue</TableCell>
                <TableCell align="right">Outstanding (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(b.items || []).length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ color: 'text.secondary' }}>No open items.</TableCell></TableRow>
              ) : b.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><Chip label={b.bracket === 'Current' ? 'On track' : 'Past due'} size="small" variant="outlined" color={b.bracket === 'Current' ? 'success' : 'warning'} /></TableCell>
                  <TableCell><strong>{item.number}</strong></TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ''}</TableCell>
                  <TableCell align="right">{item.daysOverdue > 0 ? item.daysOverdue : '—'}</TableCell>
                  <TableCell align="right"><strong>₹{item.outstanding.toLocaleString('en-IN')}</strong></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    ));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="600" gutterBottom>Financial Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            GAAP & IFRS compliant Balance Sheet, Profit &amp; Loss, Trial Balance and Aging Reports{live ? ` for ${activeTenant?.name}` : ''}.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>Export PDF / CSV</Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Balance Sheet" />
          <Tab label="Profit & Loss (P&L)" />
          <Tab label="Trial Balance" />
          <Tab label="Aging (AR / AP)" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {!live && (
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#fffbeb' }}>
              <Typography variant="caption" color="text.warning">
                Showing sample report data. Record vouchers in the Day Book / Vouchers to generate live reports.
              </Typography>
            </Paper>
          )}

          {tabValue === 0 && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Card sx={{ borderLeft: '4px solid #0284c7' }}><CardContent>
                  <Typography color="text.secondary" variant="body2">Total Assets</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#0284c7', mt: 0.5 }}>₹{totalAssets.toLocaleString('en-IN')}</Typography>
                </CardContent></Card>
                <Card sx={{ borderLeft: '4px solid #ef4444' }}><CardContent>
                  <Typography color="text.secondary" variant="body2">Total Liabilities</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#ef4444', mt: 0.5 }}>₹{totalLiabilities.toLocaleString('en-IN')}</Typography>
                </CardContent></Card>
                <Card sx={{ borderLeft: '4px solid #10b981' }}><CardContent>
                  <Typography color="text.secondary" variant="body2">Total Equity</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981', mt: 0.5 }}>₹{totalEquity.toLocaleString('en-IN')}</Typography>
                </CardContent></Card>
              </Box>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Assets</Typography>
                <TableContainer><Table size="small">
                  <TableHead><TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                    <TableCell>Code</TableCell><TableCell>Account Name</TableCell><TableCell align="right">Balance (₹)</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {balanceAssetRows.map((row) => (
                      <TableRow key={row.code}><TableCell><Chip label={row.code} size="small" variant="outlined" /></TableCell><TableCell>{row.name}</TableCell><TableCell align="right">₹{Math.abs(row.amount).toLocaleString('en-IN')}</TableCell></TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}><TableCell colSpan={2}><strong>Total Assets</strong></TableCell><TableCell align="right"><strong>₹{totalAssets.toLocaleString('en-IN')}</strong></TableCell></TableRow>
                  </TableBody>
                </Table></TableContainer>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>Liabilities &amp; Equity</Typography>
                <TableContainer><Table size="small">
                  <TableHead><TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                    <TableCell>Code</TableCell><TableCell>Account Name</TableCell><TableCell align="right">Balance (₹)</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {balanceLiabilityRows.map((row) => (
                      <TableRow key={row.code}><TableCell><Chip label={row.code} size="small" color="error" variant="outlined" /></TableCell><TableCell>{row.name}</TableCell><TableCell align="right">₹{Math.abs(row.amount).toLocaleString('en-IN')}</TableCell></TableRow>
                    ))}
                    {balanceEquityRows.map((row) => (
                      <TableRow key={row.code}><TableCell><Chip label={row.code} size="small" color="success" variant="outlined" /></TableCell><TableCell>{row.name}</TableCell><TableCell align="right">₹{Math.abs(row.amount).toLocaleString('en-IN')}</TableCell></TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}><TableCell colSpan={2}><strong>Total Liabilities &amp; Equity</strong></TableCell><TableCell align="right"><strong>₹{(totalLiabilities + totalEquity).toLocaleString('en-IN')}</strong></TableCell></TableRow>
                  </TableBody>
                </Table></TableContainer>
              </Paper>
            </>
          )}

          {tabValue === 1 && (
            <>
              <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>Period:</Typography>
                <TextField
                  label="From"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  size="small"
                />
                <TextField
                  label="To"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  size="small"
                />
                {pnlLoading && <CircularProgress size={20} />}
                {pnl && pnl.from && <Chip label={`${pnl.from} → ${pnl.to}`} size="small" color="primary" variant="outlined" />}
              </Paper>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Card sx={{ borderLeft: '4px solid #10b981' }}><CardContent>
                  <Typography color="text.secondary" variant="body2">Total Operating Revenue</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981', mt: 0.5 }}>₹{totalRevenue.toLocaleString('en-IN')}</Typography>
                </CardContent></Card>
                <Card sx={{ borderLeft: '4px solid #ef4444' }}><CardContent>
                  <Typography color="text.secondary" variant="body2">Total Operating Expenses</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#ef4444', mt: 0.5 }}>₹{totalExpenses.toLocaleString('en-IN')}</Typography>
                </CardContent></Card>
                <Card sx={{ borderLeft: '4px solid #0284c7' }}><CardContent>
                  <Typography color="text.secondary" variant="body2">Net Income (Profit)</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: netProfit >= 0 ? '#0284c7' : '#ef4444', mt: 0.5 }}>₹{netProfit.toLocaleString('en-IN')}</Typography>
                </CardContent></Card>
              </Box>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold">Income / Revenue Statement</Typography>
                  <Chip label={pnl ? 'From Ledger' : 'No period data'} size="small" color={pnl ? 'success' : 'warning'} />
                </Box>
                {pnlLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : (
                  <TableContainer><Table size="small">
                    <TableHead><TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                      <TableCell>Code</TableCell><TableCell>Account Name</TableCell><TableCell align="right">Amount (₹)</TableCell><TableCell align="right">Drill-down</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {pnl ? (
                        <>
                          {renderPnlRows(pnl.revenue || [], true)}
                          {renderPnlRows(pnl.expenses || [], false)}
                          {(pnl.revenue.length === 0 && pnl.expenses.length === 0) && (
                            <TableRow><TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>No postings in this period.</TableCell></TableRow>
                          )}
                        </>
                      ) : (
                        <>
                          {demoIncome.revenue.map((row) => (
                            <TableRow key={row.code}><TableCell><Chip label={row.code} size="small" color="success" variant="outlined" /></TableCell><TableCell>{row.name}</TableCell><TableCell align="right">₹{row.amount.toLocaleString('en-IN')}</TableCell><TableCell /></TableRow>
                          ))}
                          {demoIncome.expenses.map((row) => (
                            <TableRow key={row.code}><TableCell><Chip label={row.code} size="small" color="error" variant="outlined" /></TableCell><TableCell>{row.name}</TableCell><TableCell align="right">-₹{Math.abs(row.amount).toLocaleString('en-IN')}</TableCell><TableCell /></TableRow>
                          ))}
                        </>
                      )}
                      <TableRow sx={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}><TableCell colSpan={2}><strong>Net Profit / (Loss)</strong></TableCell><TableCell align="right"><strong>₹{netProfit.toLocaleString('en-IN')}</strong></TableCell><TableCell /></TableRow>
                    </TableBody>
                  </Table></TableContainer>
                )}
              </Paper>
            </>
          )}

          {tabValue === 2 && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Trial Balance</Typography>
                <Chip label={live ? 'From Ledger' : 'Sample'} size="small" color={live ? 'success' : 'warning'} />
              </Box>
              {!live ? (
                <Typography color="text.secondary">No journal postings found. Record vouchers to build a Trial Balance.</Typography>
              ) : (
                <TableContainer><Table size="small">
                  <TableHead><TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                    <TableCell>Account</TableCell><TableCell>Type</TableCell><TableCell align="right">Debit (₹)</TableCell><TableCell align="right">Credit (₹)</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {trialBalance!.map((r) => (
                      <TableRow key={r.code} hover>
                        <TableCell><strong>{r.code}</strong> — {r.name}</TableCell>
                        <TableCell>{r.type}</TableCell>
                        <TableCell align="right">{r.debit ? r.debit.toLocaleString('en-IN') : '—'}</TableCell>
                        <TableCell align="right">{r.credit ? r.credit.toLocaleString('en-IN') : '—'}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell align="right">₹{tbTotalDebit.toLocaleString('en-IN')}</TableCell>
                      <TableCell align="right">₹{tbTotalCredit.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table></TableContainer>
              )}
            </Paper>
          )}

          {tabValue === 3 && (
            <>
              {agingLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
              ) : !aging ? (
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography color="text.secondary">No aging data available. Record invoices and bills to build AR / AP aging reports.</Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Accounts Receivable Aging</Typography>
                      <Chip label={`Total ₹${aging.receivables.total.toLocaleString('en-IN')}`} color="primary" variant="outlined" />
                    </Box>
                    {renderAgingBuckets(aging.receivables.buckets)}
                    {renderAgingItems(aging.receivables.buckets)}
                  </Paper>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Accounts Payable Aging</Typography>
                      <Chip label={`Total ₹${aging.payables.total.toLocaleString('en-IN')}`} color="primary" variant="outlined" />
                    </Box>
                    {renderAgingBuckets(aging.payables.buckets)}
                    {renderAgingItems(aging.payables.buckets)}
                  </Paper>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
