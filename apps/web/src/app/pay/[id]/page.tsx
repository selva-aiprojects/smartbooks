'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { exportTaxInvoicePdf } from '@/lib/pdf-generator';

export default function PublicPayPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Payment Confirmation Modal state
  const [openModal, setOpenModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pay/${id}`);
      if (!res.ok) {
        throw new Error('Invoice not found or link has expired.');
      }
      const data = await res.json();
      setInvoice(data);
      if (data.status === 'Paid' || data.balanceDue <= 0) {
        setPaymentSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUPI = () => {
    if (invoice?.company?.upiId) {
      navigator.clipboard.writeText(invoice.company.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitPayment = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/pay/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utrNumber: utrNumber.trim() || `UPI-MANUAL-${Date.now()}`,
          amount: invoice.balanceDue,
          method: 'UPI',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentSuccess(true);
        setOpenModal(false);
        await fetchInvoice();
      } else {
        alert(data.error || 'Failed to register payment');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!invoice) return;
    exportTaxInvoicePdf({
      company: {
        name: invoice.company?.name || 'SmartBooks Enterprise Ltd.',
        gstin: invoice.company?.gstin || '33AABCS1429B1ZB',
        address: 'HQ Tower, Tech Corridor, OMR, Chennai, TN - 600096',
        email: invoice.company?.email || 'billing@smartbooks.com',
        phone: invoice.company?.phone || '+91 98400 12345',
      },
      customer: {
        name: invoice.customer?.name || 'Client Customer',
        gstin: '33AAACN8123C1Z8',
        address: 'Client Corporate Office, India',
        state: 'Tamil Nadu (33)',
      },
      invoice: {
        number: invoice.number,
        issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        taxableAmount: Number(invoice.taxableAmount) || 0,
        gstAmount: Number(invoice.gstAmount) || 0,
        totalAmount: Number(invoice.totalAmount) || 0,
        status: invoice.status,
        irn: invoice.irn,
        items: (invoice.items || []).map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          gstRate: 18,
          gstAmount: item.amount * 0.18,
        })),
      },
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0b0f19' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0b0f19', p: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center', bgcolor: '#1e293b', color: '#f8fafc', borderRadius: 3 }}>
          <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 700 }}>
            Invoice Not Available
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            {error || 'The payment link you visited is invalid or has expired.'}
          </Typography>
          <Button variant="outlined" color="primary" href="/">
            Go to SmartBooks Home
          </Button>
        </Paper>
      </Box>
    );
  }

  const upiId = invoice.company?.upiId || 'nexusretail@icici';
  const payeeName = invoice.company?.name || 'Nexus Retail Ltd';
  const balanceDue = Number(invoice.balanceDue) || 0;
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${balanceDue}&tn=Inv_${invoice.number}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiIntentUrl)}`;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#090d16', color: '#f8fafc', py: 5, px: 2 }}>
      <Container maxWidth="md">
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              SB
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, color: '#f8fafc' }}>
              SmartBooks <Box component="span" sx={{ color: '#38bdf8', fontWeight: 500, fontSize: '0.85rem' }}>Pay Portal</Box>
            </Typography>
          </Box>
          <Chip
            icon={<LockIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
            label="256-Bit SSL Secure"
            size="small"
            sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          />
        </Box>

        {paymentSuccess && (
          <Alert
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success"
            sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid #10b981' }}
          >
            <strong>Payment Settled!</strong> This invoice has been marked as fully paid. Thank you for your business.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Invoice Card */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                bgcolor: '#131b2e',
                borderRadius: 3,
                border: '1px solid #1e293b',
              }}
            >
              {/* Payee Info */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                    Payable To
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    {invoice.company?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <VerifiedIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      GSTIN: <strong>{invoice.company?.gstin || '33AABCS1429B1ZB'}</strong>
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={paymentSuccess ? 'PAID' : invoice.status.toUpperCase()}
                  color={paymentSuccess ? 'success' : invoice.status === 'Overdue' ? 'error' : 'warning'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Divider sx={{ my: 2.5, borderColor: '#1e293b' }} />

              {/* Billed To & Dates */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Billed To</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e2e8f0' }}>
                    {invoice.customer?.name}
                  </Typography>
                  {invoice.customer?.phone && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                      {invoice.customer.phone}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Invoice #</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
                    {invoice.number}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                    Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'Upon Receipt'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Line Items Table */}
              <TableContainer sx={{ mt: 2, mb: 2, borderRadius: 2, border: '1px solid #1e293b' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#0f172a' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600, py: 1 }}>Description</TableCell>
                      <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 600, py: 1 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 600, py: 1 }}>Amount (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(invoice.items || []).map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: '#e2e8f0', py: 1.2 }}>{item.description}</TableCell>
                        <TableCell align="right" sx={{ color: '#94a3b8', py: 1.2 }}>{item.quantity}</TableCell>
                        <TableCell align="right" sx={{ color: '#f8fafc', fontWeight: 600, py: 1.2 }}>
                          {Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Price Calculation Summary */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>Taxable Value</Typography>
                  <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                    ₹{Number(invoice.taxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>GST (CGST + SGST / IGST)</Typography>
                  <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                    ₹{Number(invoice.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                {invoice.amountPaid > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#10b981' }}>Amount Paid</Typography>
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                      - ₹{Number(invoice.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1, borderColor: '#1e293b' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    Outstanding Balance Due
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                    ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>

              {/* Tax Invoice PDF Download */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #1e293b' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleDownloadPdf}
                  sx={{
                    borderColor: '#334155',
                    color: '#94a3b8',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#64748b', color: '#f8fafc' },
                  }}
                >
                  Download Section 31 GST Tax Invoice (PDF)
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* UPI Payment Right Panel */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                bgcolor: '#131b2e',
                borderRadius: 3,
                border: '1px solid #1e293b',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', mb: 0.5 }}>
                Instant UPI Payment
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', mb: 2 }}>
                Scan using Google Pay, PhonePe, Paytm, or BHIM
              </Typography>

              {/* Dynamic QR Code Box */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#ffffff',
                  borderRadius: 3,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  mb: 2,
                  display: 'inline-flex',
                }}
              >
                {/* Dynamic QR code generated with exact UPI payment parameters */}
                <Box
                  component="img"
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  sx={{ width: 200, height: 200, borderRadius: 1 }}
                />
              </Box>

              {/* UPI ID display with Copy action */}
              <Box
                sx={{
                  width: '100%',
                  bgcolor: '#0b0f19',
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #1e293b',
                  mb: 2,
                }}
              >
                <Box sx={{ textAlign: 'left', overflow: 'hidden' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    Merchant VPA / UPI ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#38bdf8' }} noWrap>
                    {upiId}
                  </Typography>
                </Box>
                <Tooltip title={copied ? 'Copied!' : 'Copy UPI ID'}>
                  <IconButton onClick={handleCopyUPI} size="small" sx={{ color: copied ? '#10b981' : '#94a3b8' }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Open UPI App Button for Mobile Web */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                href={upiIntentUrl}
                disabled={paymentSuccess || balanceDue <= 0}
                startIcon={<PaymentIcon />}
                sx={{
                  mb: 1.5,
                  bgcolor: '#2563eb',
                  '&:hover': { bgcolor: '#1d4ed8' },
                  fontWeight: 700,
                  textTransform: 'none',
                  py: 1.2,
                }}
              >
                {paymentSuccess ? 'Invoice Paid' : `Pay ₹${balanceDue.toLocaleString('en-IN')} via UPI`}
              </Button>

              {/* Manual Confirmation Button */}
              {!paymentSuccess && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => setOpenModal(true)}
                  sx={{
                    borderColor: '#38bdf8',
                    color: '#38bdf8',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#7dd3fc', bgcolor: 'rgba(56, 189, 248, 0.08)' },
                  }}
                >
                  I Have Completed Payment
                </Button>
              )}

              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                <AccountBalanceIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  Zero convenience fees · Direct to Merchant Bank Account
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Manual Payment Confirmation Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', color: '#f8fafc', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Payment Receipt</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Paid via UPI? Please enter the 12-digit UTR / UPI Reference Number from your payment app (e.g. Google Pay or PhonePe receipt).
          </Typography>
          <TextField
            label="12-Digit UTR / Transaction Reference"
            placeholder="e.g. 423984019283"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiInputBase-root': { color: '#f8fafc', bgcolor: '#0f172a' },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitPayment}
            disabled={submitting}
            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700 }}
          >
            {submitting ? 'Verifying...' : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
