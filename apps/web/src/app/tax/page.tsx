'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Chip, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { Percent as TaxIcon, Download as DownloadIcon } from '@mui/icons-material';

export default function TaxPage() {
  const taxSummary = [
    { type: 'Output GST/VAT (Collected on Sales)', rate: '18%', taxableAmount: 35000, taxAmount: 6300 },
    { type: 'Input GST/VAT (Paid on Purchases)', rate: '18%', taxableAmount: 18000, taxAmount: 3240 },
  ];

  const netTaxLiability = 6300 - 3240;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TaxIcon sx={{ fontSize: 36, color: '#0284c7' }} />
            GST / VAT Tax Engine
            <Chip label="Growth / Professional Plan" color="info" size="small" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Automated tax calculation, input tax credit matching, and tax return filing reports.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<DownloadIcon />}>
          Export Tax Return (GSTR / VAT)
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ borderLeft: '5px solid #10b981' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Output Tax (Collected)</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981', mt: 1 }}>₹6,300</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '5px solid #0284c7' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Input Tax Credit (Paid)</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#0284c7', mt: 1 }}>₹3,240</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '5px solid #8b5cf6' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Net Tax Payable to Govt</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#8b5cf6', mt: 1 }}>₹{netTaxLiability.toLocaleString('en-IN')}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Tax Breakdown Summary</Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell>Tax Category</TableCell>
                <TableCell>Default Rate</TableCell>
                <TableCell align="right">Taxable Gross Amount (₹)</TableCell>
                <TableCell align="right">Tax Amount (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxSummary.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell><strong>{row.type}</strong></TableCell>
                  <TableCell><Chip label={row.rate} size="small" variant="outlined" /></TableCell>
                  <TableCell align="right">₹{row.taxableAmount.toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right">₹{row.taxAmount.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell colSpan={3}><strong>Net Tax Payable</strong></TableCell>
                <TableCell align="right"><strong>₹{netTaxLiability.toLocaleString('en-IN')}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
