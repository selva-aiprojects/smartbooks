'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack
} from '@mui/material';
import {
  Scanner as OCRIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  AutoAwesome as AIIcon,
  ReceiptLong as ReceiptIcon,
  HistoryEdu as GLIcon
} from '@mui/icons-material';
import { useTenant } from '../../context/TenantContext';
import { getAuthHeaders } from '../../lib/api';

interface ParsedLine {
  description: string;
  hsnCode?: string | null;
  quantity?: number;
  unitPrice?: number;
  amount: number;
  gstRate?: number;
  gstAmount?: number;
}

interface ParsedResult {
  vendor: string;
  vendorGstin?: string | null;
  vendorAddress?: string | null;
  receiptNumber: string;
  date: string;
  dueDate?: string;
  isInterState?: boolean;
  taxableAmount?: number;
  gstRate?: number;
  gstAmount?: number;
  totalAmount: number;
  detectedCategory: string;
  lineItems: ParsedLine[];
  confidence: number;
}

const CATEGORIES = [
  'Software & Cloud Infrastructure',
  'Office Supplies',
  'Payroll & Salaries',
  'Rent & Facility',
  'Raw Material & Inventory',
  'Travel & Transport',
  'Professional & Legal Fees',
  'General Expense'
];

export default function OCRScannerPage() {
  const { activeTenant } = useTenant();
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<ParsedResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [category, setCategory] = useState('General Expense');
  const [engineUsed, setEngineUsed] = useState('Google Gemini Flash Vision');
  const [posting, setPosting] = useState(false);
  const [snack, setSnack] = useState('');

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setFileName(file.name);
    setScanning(true);
    setOcrResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ocr/scan', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Scan extraction failed with HTTP ${res.status}`);
      }

      const resData = await res.json();
      if (resData.success && resData.data) {
        setOcrResult(resData.data);
        setCategory(resData.data.detectedCategory || 'General Expense');
        setEngineUsed(resData.engine || 'Gemini Flash Vision');
      } else {
        throw new Error(resData.error || 'Could not parse document data');
      }
    } catch (err: any) {
      console.error('OCR scanning error:', err);
      setError(err.message || 'Failed to process document with Vision AI. Please verify file format.');
    } finally {
      setScanning(false);
      e.target.value = '';
    }
  };

  const handleDiscard = () => {
    setOcrResult(null);
    setFileName('');
  };

  const handlePost = async () => {
    if (!ocrResult) return;
    setPosting(true);
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          vendorName: ocrResult.vendor,
          vendorAddress: ocrResult.vendorAddress || null,
          number: ocrResult.receiptNumber,
          billDate: ocrResult.date,
          dueDate: ocrResult.dueDate || ocrResult.date,
          isInterState: !!ocrResult.isInterState,
          totalAmount: ocrResult.totalAmount,
          category: category || ocrResult.detectedCategory || 'General Expense',
          items: ocrResult.lineItems.map((l) => ({
            description: l.description,
            hsnCode: l.hsnCode || null,
            quantity: Number(l.quantity) || 1,
            unitPrice: Number(l.unitPrice) || Number(l.amount),
            amount: Number(l.amount),
            gstRate: Number(l.gstRate) || 18,
            gstAmount: Number(l.gstAmount) || 0,
            category: category || 'Expense',
          })),
        }),
      });

      if (res.ok) {
        setSnack(`✅ Vendor Bill #${ocrResult.receiptNumber} successfully created & posted to General Ledger!`);
      } else {
        const data = await res.json();
        setSnack(data.error || 'Failed to post vendor bill');
      }
    } catch (err: any) {
      setSnack('Failed to record vendor bill');
    } finally {
      setPosting(false);
      setTimeout(() => {
        setOcrResult(null);
        setFileName('');
      }, 2500);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <OCRIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
              Multimodal Vision AI Bill & Receipt Scanner
            </Typography>
            <Chip
              icon={<AIIcon sx={{ fontSize: '16px !important' }} />}
              label="Gemini Flash Vision Live"
              color="secondary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Upload photos, scans (PNG/JPG/PDF) or digital receipts. Google Gemini Vision extracts supplier details, GSTIN, line items, and auto-posts balanced journals.
          </Typography>
        </Box>

        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          size="large"
          disabled={scanning}
          sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, fontWeight: 700, borderRadius: 2 }}
        >
          {scanning ? 'Analyzing Document...' : 'Upload Receipt / Bill'}
          <input type="file" accept="image/*,.pdf,.txt,.csv,.json" hidden onChange={handleScanReceipt} />
        </Button>
      </Box>

      {fileName && !ocrResult && !scanning && (
        <Alert severity="info" sx={{ mb: 2 }}>Selected file: <strong>{fileName}</strong></Alert>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      {scanning && (
        <Paper sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <AIIcon sx={{ fontSize: 48, color: '#8b5cf6', animation: 'spin 2s linear infinite' }} />
            <Typography variant="h6" fontWeight="bold">
              Gemini Vision AI is extracting document structure from {fileName}...
            </Typography>
            <Typography variant="body2" color="text.secondary" maxWidth={600}>
              Detecting vendor GSTIN, line items, taxable amounts, CGST/SGST/IGST splits, and recommending Chart of Accounts codes.
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              <LinearProgress color="secondary" sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          </Stack>
        </Paper>
      )}

      {ocrResult && (
        <Card sx={{ borderRadius: 3, borderLeft: '6px solid #8b5cf6', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h5" fontWeight="800" color="#0f172a">
                  Extracted Document Intelligence
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Source: {fileName} • Engine: <strong>{engineUsed}</strong>
                </Typography>
              </Box>
              <Chip
                icon={<CheckIcon sx={{ fontSize: '16px !important' }} />}
                label={`${Math.round(ocrResult.confidence * 100)}% Vision Confidence`}
                color="success"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Divider />

            {/* Extracted Metadata Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
              <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography color="text.secondary" variant="caption" fontWeight="700">DETECTED VENDOR</Typography>
                <Typography fontWeight="800" variant="body1" color="#0f172a">{ocrResult.vendor}</Typography>
                <Typography variant="caption" color="text.secondary">
                  GSTIN: {ocrResult.vendorGstin || 'Not detected'}
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography color="text.secondary" variant="caption" fontWeight="700">INVOICE / BILL #</Typography>
                <Typography fontWeight="800" variant="body1" color="#8b5cf6">{ocrResult.receiptNumber}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Place: {ocrResult.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography color="text.secondary" variant="caption" fontWeight="700">DOCUMENT DATE</Typography>
                <Typography fontWeight="800" variant="body1" color="#0f172a">{ocrResult.date}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Due: {ocrResult.dueDate || ocrResult.date}
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, bgcolor: '#f5f3ff', borderRadius: 2, border: '1px solid #ddd6fe' }}>
                <Typography color="secondary.main" variant="caption" fontWeight="700">TOTAL EXTRACTED VALUE</Typography>
                <Typography fontWeight="800" variant="h5" color="secondary.main">
                  ₹{Number(ocrResult.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tax: ₹{Number(ocrResult.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Extracted Line Items Table */}
            <Typography variant="subtitle1" fontWeight="800" color="#0f172a">
              Itemized Line Items ({ocrResult.lineItems.length})
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>HSN/SAC</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price (₹)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>GST %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ocrResult.lineItems.length > 0 ? (
                    ocrResult.lineItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 600 }}>{item.description}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.hsnCode || '-'}</TableCell>
                        <TableCell align="center">{item.quantity || 1}</TableCell>
                        <TableCell align="right">₹{Number(item.unitPrice || item.amount).toLocaleString('en-IN')}</TableCell>
                        <TableCell align="right">{item.gstRate || 18}%</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          ₹{Number(item.amount + (item.gstAmount || 0)).toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                        No specific line items detected. Bill will be recorded as a lump-sum expense.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* General Ledger Expense Category Mapping */}
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>
                General Ledger Account Classification
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Chart of Accounts Category</InputLabel>
                <Select
                  value={category}
                  label="Chart of Accounts Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Auto-assigned by AI based on vendor profile and line-item semantics.
              </Typography>
            </Box>

            {/* Action Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button variant="outlined" onClick={handleDiscard} disabled={posting}>
                Discard
              </Button>
              <Button
                variant="contained"
                startIcon={<GLIcon />}
                onClick={handlePost}
                disabled={posting}
                sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, fontWeight: 700 }}
              >
                {posting ? 'Creating Bill & Posting GL...' : 'Approve & Create Vendor Bill'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}>
        <Alert onClose={() => setSnack('')} severity="success" sx={{ width: '100%', fontWeight: 600 }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
