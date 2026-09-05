'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress } from '@mui/material';
import { Percent as TaxIcon, Download as DownloadIcon } from '@mui/icons-material';
import { getAuthHeaders } from '../../lib/api';

interface RateBucket { rate: number; taxable: number; gst: number; }
interface TaxSide { taxable: number; gst: number; cgst: number; sgst: number; igst: number; byRate: RateBucket[]; }

export default function TaxPage() {
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState<TaxSide | null>(null);
  const [input, setInput] = useState<TaxSide | null>(null);
  const [netLiability, setNetLiability] = useState(0);
  const [rates, setRates] = useState<{ id: string; name: string; rate: number }[]>([]);

  const demoOutput: TaxSide = { taxable: 35000, gst: 6300, cgst: 3150, sgst: 3150, igst: 0, byRate: [{ rate: 18, taxable: 35000, gst: 6300 }] };
  const demoInput: TaxSide = { taxable: 18000, gst: 3240, cgst: 1620, sgst: 1620, igst: 0, byRate: [{ rate: 18, taxable: 18000, gst: 3240 }] };

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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

        <Button variant="contained" startIcon={<DownloadIcon />}>
          Export Tax Return (GSTR / VAT)
        </Button>
      </Box>

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
    </Box>
  );
}