'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Payment as PaymentsIcon, AddLink as AddLinkIcon } from '@mui/icons-material';

const mockPayments = [
  { id: 'p1', txnId: 'TXN-9941', customer: 'Acme Global Tech', date: '2026-08-01', method: 'Stripe Credit Card', amount: 4500, status: 'Completed' },
  { id: 'p2', txnId: 'TXN-9942', customer: 'Nexus Digital Solutions', date: '2026-07-25', method: 'PayPal Checkout', amount: 4000, status: 'Completed' },
  { id: 'p3', txnId: 'TXN-9943', customer: 'Vanguard Retail Inc', date: '2026-07-10', method: 'Direct ACH Bank Transfer', amount: 2800, status: 'Pending' },
];

export default function PaymentsPage() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PaymentsIcon sx={{ fontSize: 36, color: '#0284c7' }} />
            Online Payments & Collections
            <Chip label="Growth / Professional Plan" color="info" size="small" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process online credit card payments, digital wallets, and automated customer collection links.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddLinkIcon />}>
          Generate Payment Link
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Payment Transactions Log</Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell>Transaction Ref</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Amount (₹)</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockPayments.map((row) => (
                <TableRow key={row.id}>
                  <TableCell><code>{row.txnId}</code></TableCell>
                  <TableCell><strong>{row.customer}</strong></TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell><Chip label={row.method} size="small" variant="outlined" /></TableCell>
                  <TableCell align="right"><strong>₹{row.amount.toLocaleString('en-IN')}</strong></TableCell>
                  <TableCell align="center">
                    <Chip label={row.status} color={row.status === 'Completed' ? 'success' : 'warning'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
