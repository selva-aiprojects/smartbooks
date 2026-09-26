'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Receipt as NoteIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  TrendingDown as CreditIcon,
  TrendingUp as DebitIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useTenant } from '../../context/TenantContext';
import { exportCreditDebitNotePdf } from '../../lib/pdf-generator';

const REASON_CODES = [
  '01-Sales Return',
  '02-Post Sale Discount',
  '03-Deficiency in Services',
  '04-Correction in Invoice',
  '05-Change in POS',
  '06-Final Settlement Variance',
];

export default function CreditNotesPage() {
  const { activeTenant } = useTenant();
  const [tabValue, setTabValue] = useState(0); // 0: Credit Notes, 1: Debit Notes
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [partyName, setPartyName] = useState('');
  const [originalInvoiceNo, setOriginalInvoiceNo] = useState('');
  const [reason, setReason] = useState(REASON_CODES[0]);
  const [amount, setAmount] = useState('5000');
  const [gstRate, setGstRate] = useState(18);
  const [remarks, setRemarks] = useState('');

  const currentType = tabValue === 0 ? 'CREDIT' : 'DEBIT';

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/credit-notes');
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
      }
    } catch {
      // Keep state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleIssueNote = async () => {
    if (!partyName || !amount) {
      alert('Please provide party name and amount');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/credit-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteType: currentType,
          customerName: partyName,
          originalInvoiceNo,
          reason,
          amount: Number(amount),
          gstRate: Number(gstRate),
          notes: remarks,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnack({ type: 'success', message: data.message });
        setOpenModal(false);
        setPartyName('');
        setOriginalInvoiceNo('');
        setRemarks('');
        await loadNotes();
      } else {
        setSnack({ type: 'error', message: data.error || 'Failed to issue note' });
      }
    } catch (err: any) {
      setSnack({ type: 'error', message: err.message || 'Error issuing note' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = (note: any) => {
    exportCreditDebitNotePdf({
      company: {
        name: activeTenant?.name || 'SmartBooks Enterprise Ltd.',
        gstin: activeTenant?.gstin || '33AABCS1429B1ZB',
        address: 'HQ Tower, Tech Corridor, OMR, Chennai, TN - 600096',
        email: activeTenant?.contactEmail || 'billing@smartbooks.com',
        phone: activeTenant?.contactPhone || '+91 98400 12345',
      },
      customer: {
        name: note.customerName,
        gstin: '33AAACN8123C1Z8',
        address: 'Corporate Office, Industrial Zone, India',
      },
      note: {
        noteNumber: note.noteNumber,
        noteType: note.noteType,
        issueDate: note.issueDate ? new Date(note.issueDate).toLocaleDateString('en-IN') : '',
        originalInvoiceNo: note.originalInvoiceNo,
        reason: note.reason,
        taxableAmount: Number(note.taxableAmount),
        gstRate: Number(note.gstRate),
        gstAmount: Number(note.gstAmount),
        totalAmount: Number(note.totalAmount),
        notes: note.notes,
      },
    });
  };

  const filteredNotes = notes.filter((n) => n.noteType === currentType);
  const totalAdjustment = filteredNotes.reduce((s, n) => s + Number(n.totalAmount || 0), 0);
  const totalTaxAdjusted = filteredNotes.reduce((s, n) => s + Number(n.gstAmount || 0), 0);

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Button
              component={Link}
              href="/invoices"
              startIcon={<BackIcon />}
              size="small"
              sx={{ color: '#94a3b8', textTransform: 'none', mr: 1 }}
            >
              Invoices
            </Button>
            <Typography variant="h5" fontWeight="800" color="#f8fafc">
              Credit & Debit Notes (GST Section 34)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Statutory adjustments for sales returns, post-sale discounts, and purchase corrections reported in Table 9B of GSTR-1.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              bgcolor: currentType === 'CREDIT' ? '#dc2626' : '#0284c7',
              fontWeight: 700,
              '&:hover': { bgcolor: currentType === 'CREDIT' ? '#b91c1c' : '#0369a1' },
            }}
          >
            + Issue {currentType === 'CREDIT' ? 'Credit Note' : 'Debit Note'}
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: '#131b2e', border: '1px solid #1e293b' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              TOTAL {currentType} ADJUSTMENTS
            </Typography>
            <Typography
              variant="h4"
              fontWeight="800"
              sx={{ color: currentType === 'CREDIT' ? '#f43f5e' : '#38bdf8', mt: 0.5 }}
            >
              ₹{totalAdjustment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {filteredNotes.length} Notes in Ledger
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: '#131b2e', border: '1px solid #1e293b' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              GST LIABILITY ADJUSTED
            </Typography>
            <Typography variant="h4" fontWeight="800" color="#10b981" sx={{ mt: 0.5 }}>
              ₹{totalTaxAdjusted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
              Deducted in Table 9B of GSTR-1
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: '#131b2e', border: '1px solid #1e293b' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              STATUTORY STATUS
            </Typography>
            <Typography variant="h5" fontWeight="800" color="#e2e8f0" sx={{ mt: 0.5 }}>
              Section 34 Compliant
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              MCA Rule 3(1) Cryptographic Hash Active
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, v) => setTabValue(v)}
        sx={{
          mb: 2,
          borderBottom: '1px solid #1e293b',
          '& .MuiTab-root': { color: '#94a3b8', fontWeight: 700, textTransform: 'none' },
          '& .Mui-selected': { color: currentType === 'CREDIT' ? '#f43f5e !important' : '#38bdf8 !important' },
        }}
      >
        <Tab icon={<CreditIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Credit Notes (Sales Adjustments)" />
        <Tab icon={<DebitIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Debit Notes (Purchase Adjustments)" />
      </Tabs>

      {/* Main Table */}
      <TableContainer component={Paper} sx={{ bgcolor: '#131b2e', borderRadius: 3, border: '1px solid #1e293b' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#0b0f19' }}>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Note #</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Issue Date</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Party Name</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Original Invoice #</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Reason Code</TableCell>
              <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700 }}>Taxable Value (₹)</TableCell>
              <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700 }}>GST (₹)</TableCell>
              <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700 }}>Total Adjustment (₹)</TableCell>
              <TableCell align="center" sx={{ color: '#94a3b8', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : filteredNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ color: '#64748b', py: 4 }}>
                  No {currentType === 'CREDIT' ? 'Credit' : 'Debit'} Notes issued yet. Issue one using the button above!
                </TableCell>
              </TableRow>
            ) : (
              filteredNotes.map((note) => (
                <TableRow key={note.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ color: currentType === 'CREDIT' ? '#f43f5e' : '#38bdf8', fontWeight: 800 }}>
                    {note.noteNumber}
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>
                    {note.issueDate ? new Date(note.issueDate).toLocaleDateString('en-IN') : ''}
                  </TableCell>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 600 }}>
                    {note.customerName}
                  </TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>
                    {note.originalInvoiceNo || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={note.reason}
                      size="small"
                      sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: 10, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#e2e8f0' }}>
                    ₹{Number(note.taxableAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#e2e8f0' }}>
                    ₹{Number(note.gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 800 }}>
                    ₹{Number(note.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PdfIcon />}
                      onClick={() => handleDownloadPdf(note)}
                      sx={{
                        borderColor: '#334155',
                        color: '#94a3b8',
                        textTransform: 'none',
                        '&:hover': { borderColor: '#64748b', color: '#f8fafc' },
                      }}
                    >
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Issue Note Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1e293b', color: '#f8fafc', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #334155' }}>
          Issue Section 34 {currentType === 'CREDIT' ? 'Credit Note' : 'Debit Note'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          <TextField
            label={currentType === 'CREDIT' ? 'Customer / Client Name' : 'Vendor Name'}
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            required
            fullWidth
            sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
          />

          <TextField
            label="Original Tax Invoice / Bill #"
            placeholder="e.g. INV-2026-001"
            value={originalInvoiceNo}
            onChange={(e) => setOriginalInvoiceNo(e.target.value)}
            fullWidth
            sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
          />

          <FormControl fullWidth sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}>
            <InputLabel>Statutory GST Reason Code</InputLabel>
            <Select value={reason} label="Statutory GST Reason Code" onChange={(e) => setReason(e.target.value)}>
              {REASON_CODES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Adjustment Amount (₹ Total)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                fullWidth
                sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}>
                <InputLabel>GST Rate (%)</InputLabel>
                <Select value={gstRate} label="GST Rate (%)" onChange={(e) => setGstRate(Number(e.target.value))}>
                  <MenuItem value={0}>0%</MenuItem>
                  <MenuItem value={5}>5%</MenuItem>
                  <MenuItem value={12}>12%</MenuItem>
                  <MenuItem value={18}>18%</MenuItem>
                  <MenuItem value={28}>28%</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            label="Internal Remarks / Return Memo"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            multiline
            rows={2}
            fullWidth
            sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: '#0f172a' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #334155' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleIssueNote}
            disabled={submitting}
            sx={{
              bgcolor: currentType === 'CREDIT' ? '#dc2626' : '#0284c7',
              fontWeight: 700,
            }}
          >
            {submitting ? 'Posting...' : `Issue ${currentType === 'CREDIT' ? 'Credit Note' : 'Debit Note'}`}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)}>
        <Alert onClose={() => setSnack(null)} severity={snack?.type || 'success'} sx={{ width: '100%' }}>
          {snack?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
