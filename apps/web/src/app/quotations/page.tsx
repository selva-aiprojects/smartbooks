'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  IconButton,
  Divider,
  Stack,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as InvoiceIcon,
  ArrowForward as ArrowForwardIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as ConvertIcon,
  Delete as DeleteIcon,
  WhatsApp as WhatsAppIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuthHeaders } from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { exportTaxInvoicePdf } from '../../lib/pdf-generator';

interface QuotationItem {
  id?: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  gstRate: number;
  gstAmount: number;
}

interface Quotation {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Converted' | 'Expired' | string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  convertedInvoiceId?: string | null;
  customer?: { id: string; name: string; email?: string; phone?: string; address?: string } | null;
  items: QuotationItem[];
}

const mockQuotations: Quotation[] = [
  {
    id: 'demo-q1',
    number: 'EST-2026-1042',
    date: '2026-09-10',
    validUntil: '2026-10-10',
    status: 'Sent',
    taxableAmount: 45000,
    gstAmount: 8100,
    totalAmount: 53100,
    customer: { id: 'c1', name: 'Tata Consultancy Enterprise', email: 'procurement@tata.com', phone: '+91 98401 22334' },
    items: [
      { description: 'Cloud ERP Migration & Custom Ledger Modules', hsnCode: '998313', quantity: 1, unitPrice: 45000, amount: 45000, gstRate: 18, gstAmount: 8100 }
    ]
  },
  {
    id: 'demo-q2',
    number: 'EST-2026-1043',
    date: '2026-09-15',
    validUntil: '2026-10-15',
    status: 'Converted',
    taxableAmount: 28000,
    gstAmount: 5040,
    totalAmount: 33040,
    convertedInvoiceId: 'inv-demo-202',
    customer: { id: 'c2', name: 'Infosys FinTech Labs', email: 'accounts@infosys.com' },
    items: [
      { description: 'Autonomous MCA Compliance & Statutory Audit Setup', hsnCode: '998311', quantity: 1, unitPrice: 28000, amount: 28000, gstRate: 18, gstAmount: 5040 }
    ]
  },
  {
    id: 'demo-q3',
    number: 'EST-2026-1044',
    date: '2026-09-20',
    validUntil: '2026-10-20',
    status: 'Draft',
    taxableAmount: 18500,
    gstAmount: 3330,
    totalAmount: 21830,
    customer: { id: 'c3', name: 'Wipro Digital Media', email: 'billing@wipro.com' },
    items: [
      { description: 'Multi-Tenant General Ledger Subscription (Annual)', hsnCode: '998315', quantity: 1, unitPrice: 18500, amount: 18500, gstRate: 18, gstAmount: 3330 }
    ]
  }
];

export default function QuotationsPage() {
  const router = useRouter();
  const { activeTenant } = useTenant();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Convert to Invoice state
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // New Quotation Modal
  const [openModal, setOpenModal] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [quoteNumber, setQuoteNumber] = useState(`EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [items, setItems] = useState<Array<{ description: string; hsnCode: string; quantity: number; unitPrice: number; gstRate: number }>>([
    { description: 'ERP Accounting Integration & Training', hsnCode: '998313', quantity: 1, unitPrice: 20000, gstRate: 18 },
  ]);
  const [saving, setSaving] = useState(false);

  const fetchQuotations = async () => {
    try {
      const [qRes, cRes] = await Promise.all([
        fetch('/api/quotations', { headers: getAuthHeaders() }),
        fetch('/api/invoices/customers', { headers: getAuthHeaders() }),
      ]);

      if (qRes.ok) {
        const data = await qRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setQuotations(data);
        } else {
          setQuotations(mockQuotations);
        }
      } else {
        setQuotations(mockQuotations);
      }

      if (cRes.ok) {
        const cData = await cRes.json();
        if (Array.isArray(cData)) setCustomers(cData);
      }
    } catch {
      setQuotations(mockQuotations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Calculate modal line totals
  const modalTaxable = items.reduce((s, it) => s + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0), 0);
  const modalGst = items.reduce((s, it) => s + ((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0) * (Number(it.gstRate) || 0)) / 100, 0);
  const modalTotal = modalTaxable + modalGst;

  const handleAddItem = () => {
    setItems([...items, { description: '', hsnCode: '', quantity: 1, unitPrice: 0, gstRate: 18 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSaveQuotation = async (status: 'Draft' | 'Sent') => {
    if (!customerId && !customerName.trim()) {
      alert('Please specify a client name or select an existing customer.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          customerId: customerId || undefined,
          customerName: customerName || undefined,
          number: quoteNumber,
          date: quoteDate,
          validUntil,
          status,
          items: items.map(it => ({
            description: it.description,
            hsnCode: it.hsnCode,
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            gstRate: Number(it.gstRate) || 0,
          })),
        }),
      });

      if (res.ok) {
        setOpenModal(false);
        setQuoteNumber(`EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
        fetchQuotations();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save quotation');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating quotation');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToInvoice = async (quote: Quotation) => {
    if (quote.status === 'Converted') return;
    setConvertingId(quote.id);
    try {
      const res = await fetch(`/api/quotations/${quote.id}/convert`, {
        method: 'POST',
        headers: getAuthHeaders(true),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessBanner(`Success! Quotation ${quote.number} was converted into Tax Invoice #${data.invoiceNumber}. Click below to view.`);
        fetchQuotations();
      } else {
        const err = await res.json();
        alert(err.error || 'Conversion failed');
      }
    } catch (e: any) {
      alert(e.message || 'Error converting to invoice');
    } finally {
      setConvertingId(null);
    }
  };

  const handleDownloadPdf = (quote: Quotation) => {
    exportTaxInvoicePdf({
      company: {
        name: activeTenant?.name || 'SmartBooks Enterprise Corp',
        gstin: '33AABCS1429B1ZB',
        address: 'HQ Financial District, Chennai, India',
        email: 'billing@smartbooks.com',
        phone: '+91 98400 12345',
      },
      customer: {
        name: quote.customer?.name || 'Valued Client',
        gstin: '33AAACN8123C1Z8',
        address: quote.customer?.address || 'Corporate Client Campus, India',
      },
      invoice: {
        number: `${quote.number} (PROFORMA / ESTIMATE)`,
        issueDate: quote.date ? new Date(quote.date).toISOString().split('T')[0] : '',
        dueDate: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '',
        isInterState: false,
        taxableAmount: Number(quote.taxableAmount),
        gstAmount: Number(quote.gstAmount),
        totalAmount: Number(quote.totalAmount),
        status: quote.status,
        items: quote.items.map(it => ({
          description: it.description,
          hsnCode: it.hsnCode,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
          amount: Number(it.amount),
          gstRate: Number(it.gstRate),
          gstAmount: Number(it.gstAmount),
        })),
      },
    });
  };

  // Metrics calculation
  const totalCount = quotations.length;
  const totalValue = quotations.reduce((s, q) => s + Number(q.totalAmount || 0), 0);
  const draftCount = quotations.filter(q => q.status === 'Draft').length;
  const sentCount = quotations.filter(q => q.status === 'Sent' || q.status === 'Accepted').length;
  const convertedCount = quotations.filter(q => q.status === 'Converted').length;
  const conversionRate = totalCount > 0 ? Math.round((convertedCount / totalCount) * 100) : 0;

  const filteredQuotes = quotations.filter(q => {
    if (filterStatus === 'ALL') return true;
    return q.status.toUpperCase() === filterStatus.toUpperCase();
  });

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'Draft': return 'warning';
      case 'Sent': return 'info';
      case 'Accepted': return 'success';
      case 'Converted': return 'primary';
      case 'Expired': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" fontWeight="600">Quotations &amp; Estimates</Typography>
            <Chip label="Pre-Accounting" color="primary" variant="outlined" size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage pre-sale quotes, send client estimates, and convert accepted deals directly into GST Tax Invoices in 1-click.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            component={Link}
            href="/invoices"
            variant="outlined"
            startIcon={<InvoiceIcon />}
          >
            Go to Invoices
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}
          >
            New Quotation
          </Button>
        </Stack>
      </Box>

      {/* Success Notification */}
      {successBanner && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" component={Link} href="/invoices">
              View Invoices
            </Button>
          }
          onClose={() => setSuccessBanner(null)}
        >
          {successBanner}
        </Alert>
      )}

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3 }}>
        <Card sx={{ borderLeft: '4px solid #0284c7' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Total Estimates Pipeline</Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: '#0284c7' }}>
              ₹{totalValue.toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" color="text.secondary">{totalCount} total proposal(s)</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Draft Estimates</Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: '#f59e0b' }}>
              {draftCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">Awaiting dispatch</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '4px solid #06b6d4' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Sent to Clients</Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: '#06b6d4' }}>
              {sentCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">In negotiation</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '4px solid #10b981' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Converted to Invoices</Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: '#10b981' }}>
              {convertedCount} <Typography component="span" variant="body2" sx={{ color: 'text.secondary', fontWeight: 'normal' }}>({conversionRate}%)</Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">Win / conversion rate</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'CONVERTED'].map((st) => (
          <Chip
            key={st}
            label={st}
            clickable
            color={filterStatus === st ? 'primary' : 'default'}
            variant={filterStatus === st ? 'filled' : 'outlined'}
            onClick={() => setFilterStatus(st)}
          />
        ))}
      </Box>

      {/* Quotations List */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : filteredQuotes.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <ReceiptLongIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">No quotations found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create an estimate to start pre-accounting deal tracking.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
              Create First Quotation
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell><strong>Quote #</strong></TableCell>
                  <TableCell><strong>Customer</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Valid Until</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Taxable (₹)</strong></TableCell>
                  <TableCell align="right"><strong>GST (₹)</strong></TableCell>
                  <TableCell align="right"><strong>Total (₹)</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuotes.map((q) => (
                  <TableRow key={q.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#0284c7' }}>
                        {q.number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {q.items.length} line item(s)
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {q.customer?.name || 'Walk-in Client'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {q.customer?.email || q.customer?.phone || 'No direct contact'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {q.date ? new Date(q.date).toLocaleDateString('en-IN') : '—'}
                    </TableCell>
                    <TableCell>
                      {q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-IN') : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={q.status}
                        color={getStatusColor(q.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      ₹{Number(q.taxableAmount).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell align="right">
                      ₹{Number(q.gstAmount).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell align="right">
                      <strong>₹{Number(q.totalAmount).toLocaleString('en-IN')}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {q.status === 'Converted' ? (
                          <Chip
                            icon={<InvoiceIcon fontSize="small" />}
                            label="Invoice Created"
                            color="success"
                            size="small"
                            component={Link}
                            href="/invoices"
                            clickable
                          />
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={convertingId === q.id ? <CircularProgress size={14} color="inherit" /> : <ConvertIcon fontSize="small" />}
                            disabled={convertingId === q.id}
                            onClick={() => handleConvertToInvoice(q)}
                            sx={{ textTransform: 'none', py: 0.5, px: 1.5, fontSize: '0.78rem' }}
                          >
                            Convert to Invoice
                          </Button>
                        )}
                        <Tooltip title="Download Proforma / Estimate PDF">
                          <IconButton size="small" onClick={() => handleDownloadPdf(q)}>
                            <PdfIcon fontSize="small" color="action" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share via WhatsApp">
                          <IconButton
                            size="small"
                            color="success"
                            component="a"
                            href={`https://wa.me/?text=${encodeURIComponent(`Dear Client, Please review your estimate #${q.number} for ₹${Number(q.totalAmount).toLocaleString('en-IN')} from ${activeTenant?.name || 'SmartBooks'}.`)}`}
                            target="_blank"
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create New Quotation Modal Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#0f172a', color: '#fff' }}>
          Create New Quotation / Estimate
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Customer</InputLabel>
              <Select
                value={customerId}
                label="Select Customer"
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  const found = customers.find(c => c.id === e.target.value);
                  if (found) setCustomerName(found.name);
                }}
              >
                <MenuItem value=""><em>-- New / Custom Customer --</em></MenuItem>
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Customer Name"
              size="small"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Acme Innovations Ltd"
              helperText={!customerId ? 'Enter custom customer name' : ''}
              fullWidth
            />

            <TextField
              label="Quotation Number"
              size="small"
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Date"
                type="date"
                size="small"
                value={quoteDate}
                onChange={(e) => setQuoteDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                label="Valid Until"
                type="date"
                size="small"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">Line Items</Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={handleAddItem}>
              Add Line Item
            </Button>
          </Box>

          {/* Line Items Builder Table */}
          <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 1, mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ minWidth: 200 }}>Description</TableCell>
                  <TableCell sx={{ width: 100 }}>HSN/SAC</TableCell>
                  <TableCell sx={{ width: 80 }}>Qty</TableCell>
                  <TableCell sx={{ width: 110 }}>Rate (₹)</TableCell>
                  <TableCell sx={{ width: 90 }}>GST %</TableCell>
                  <TableCell align="right" sx={{ width: 110 }}>Amount (₹)</TableCell>
                  <TableCell sx={{ width: 50 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it, idx) => {
                  const lineTaxable = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
                  const lineTotal = lineTaxable * (1 + (Number(it.gstRate) || 0) / 100);
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={it.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Service / Product name"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={it.hsnCode}
                          onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                          placeholder="998313"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={it.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={it.gstRate}
                          onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                        >
                          <MenuItem value={0}>0%</MenuItem>
                          <MenuItem value={5}>5%</MenuItem>
                          <MenuItem value={12}>12%</MenuItem>
                          <MenuItem value={18}>18%</MenuItem>
                          <MenuItem value={28}>28%</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell align="right">
                        <strong>₹{lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => handleRemoveItem(idx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Subtotal & Tax Box */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Paper sx={{ p: 2, minWidth: 260, bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Taxable Amount:</Typography>
                <Typography variant="body2">₹{modalTaxable.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Estimated GST:</Typography>
                <Typography variant="body2">₹{modalGst.toLocaleString('en-IN')}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="bold">Total Proposal:</Typography>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0284c7' }}>
                  ₹{modalTotal.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="outlined"
            disabled={saving}
            onClick={() => handleSaveQuotation('Draft')}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
            onClick={() => handleSaveQuotation('Sent')}
            sx={{ backgroundColor: '#0284c7' }}
          >
            Save &amp; Mark Sent
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
