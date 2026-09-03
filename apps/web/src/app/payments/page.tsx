'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { Payment as PaymentsIcon, AddLink as AddLinkIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';

const mockPayments = [
  { id: 'p1', txnId: 'TXN-9941', customer: 'Acme Global Tech', date: '2026-08-01', method: 'Stripe Credit Card', amount: 4500, status: 'Completed' },
  { id: 'p2', txnId: 'TXN-9942', customer: 'Nexus Digital Solutions', date: '2026-07-25', method: 'PayPal Checkout', amount: 4000, status: 'Completed' },
  { id: 'p3', txnId: 'TXN-9943', customer: 'Vanguard Retail Inc', date: '2026-07-10', method: 'Direct ACH Bank Transfer', amount: 2800, status: 'Pending' },
];

const methods = ['UPI / QR', 'Credit Card', 'Debit Card', 'Net Banking', 'Digital Wallet', 'Bank Transfer'];

export default function PaymentsPage() {
  const [payments, setPayments] = useState(mockPayments);
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [snackbar, setSnackbar] = useState('');

  const handleGenerateLink = () => {
    if (!customer || !amount || !method) return;
    const link = `https://pay.smartbooks.ai/l/${Math.random().toString(36).slice(2, 10)}`;
    const newPayment = {
      id: `p-${Date.now()}`,
      txnId: `TXN-${Math.floor(9000 + Math.random() * 999)}${Math.floor(10 + Math.random() * 89)}`,
      customer: customer.trim(),
      date: new Date().toISOString().split('T')[0],
      method,
      amount: Number(amount) || 0,
      status: 'Pending',
    };
    setPayments([newPayment, ...payments]);
    setCustomer('');
    setAmount(0);
    setMethod('');
    setSnackbar('Payment link generated and sent successfully!');
  };

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

        <Button variant="contained" startIcon={<AddLinkIcon />} onClick={() => setOpenLinkModal(true)}>
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
              {payments.map((row) => (
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

      {/* Generate Payment Link Modal */}
      <Dialog open={openLinkModal} onClose={() => setOpenLinkModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Payment Link</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField 
            label="Customer Name" 
            value={customer} 
            onChange={(e) => setCustomer(e.target.value)} 
            fullWidth 
            required 
          />
          <TextField 
            label="Amount (₹)" 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            fullWidth 
            required 
          />
          <FormControl fullWidth required>
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              label="Payment Method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {methods.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {generatedLink && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f1f5f9', borderRadius: 1 }}>
              <code style={{ flex: 1, wordBreak: 'break-all' }}>{generatedLink}</code>
              <Button 
                size="small" 
                startIcon={<ContentCopyIcon />} 
                onClick={() => { navigator.clipboard?.writeText(generatedLink); setSnackbar('Payment link copied to clipboard!'); }}
              >
                Copy
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setGeneratedLink(`https://pay.smartbooks.ai/l/${Math.random().toString(36).slice(2, 10)}`); }} disabled={!customer || !amount || !method}>
            Generate Link
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleGenerateLink} 
            disabled={!generatedLink}
          >
            Send to Customer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')}>
        <Alert onClose={() => setSnackbar('')} severity="success" sx={{ width: '100%' }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
}
