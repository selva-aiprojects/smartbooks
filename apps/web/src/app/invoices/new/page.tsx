'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthHeaders } from '../../../lib/api';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

interface Customer { id: string; name: string; }
interface CatalogItem { id: string; name: string; sku: string; hsnCode: string | null; rate: number; gstRate: number; unit: string; stock: number; tracksInventory: boolean; }
interface InvoiceLineItem { itemId: string | null; description: string; quantity: number; unitPrice: number; gstRate: number; hsnCode: string; }

const gstRates = [0, 5, 12, 18, 28];

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [isInterState, setIsInterState] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(true);

  const [items, setItems] = useState<InvoiceLineItem[]>([
    { itemId: null, description: 'Enterprise Accounting Services', quantity: 1, unitPrice: 3500, gstRate: 18, hsnCode: '998313' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/invoices/customers', { headers: getAuthHeaders() }),
      fetch('/api/items', { headers: getAuthHeaders() }),
    ])
      .then(async ([custRes, itemRes]) => {
        if (custRes.ok) {
          const data = await custRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setCustomers(data);
            setCustomerId(data[0].id);
          }
        }
        if (itemRes.ok) {
          const data = await itemRes.json();
          if (Array.isArray(data)) setCatalog(data);
        }
      })
      .catch(() => { /* fall back to manual entry */ })
      .finally(() => {
        setLoadingEntities(false);
        setCatalogLoading(false);
      });
  }, []);

  const applyCatalogItem = (index: number, item: CatalogItem | null) => {
    const copy = [...items];
    if (item) {
      copy[index] = {
        itemId: item.id,
        description: item.name,
        quantity: Math.min(copy[index].quantity || 1, item.tracksInventory && item.stock > 0 ? Number(item.stock) : Number.MAX_SAFE_INTEGER),
        unitPrice: Number(item.rate) || 0,
        gstRate: Number(item.gstRate) || 0,
        hsnCode: item.hsnCode || '',
      };
    } else {
      copy[index] = { ...copy[index], itemId: null };
    }
    setItems(copy);
  };

  const handleAddItem = () => {
    setItems([...items, { itemId: null, description: '', quantity: 1, unitPrice: 0, gstRate: 18, hsnCode: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const taxable = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const gst = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0) * ((item.gstRate || 0) / 100), 0);
  const totalAmount = taxable + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert('Please select a customer. Add a customer first from the Invoices page if the list is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          customerId,
          number: invoiceNumber,
          issueDate,
          dueDate,
          isInterState,
          items: items.map(i => ({
            itemId: i.itemId,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            gstRate: i.gstRate,
            hsnCode: i.hsnCode
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create invoice');
        setSubmitting(false);
        return;
      }
      router.push('/invoices');
    } catch (err) {
      console.error(err);
      alert('Backend unreachable. Invoice not created.');
      setSubmitting(false);
    }
  };

  const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Button component={Link} href="/invoices" startIcon={<ArrowBack />}>
          Back to Invoices
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create Customer Invoice
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <FormControl fullWidth required>
              <InputLabel>Customer</InputLabel>
              <Select
                value={customerId}
                label="Customer"
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={loadingEntities}
              >
                {loadingEntities && <MenuItem value=""><em>Loading...</em></MenuItem>}
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Issue Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />

            <TextField
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />

            <FormControlLabel
              control={<Checkbox checked={isInterState} onChange={(e) => setIsInterState(e.target.checked)} />}
              label="Inter-State supply (IGST applies; GST splits into CGST/SGST otherwise)"
              sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Typography variant="h6" fontWeight="bold">
            Invoice Line Items
          </Typography>

          {items.map((item, index) => {
            const selected = catalog.find((c) => c.id === item.itemId) || null;
            return (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Autocomplete
                options={catalog}
                getOptionLabel={(opt) => `${opt.sku} — ${opt.name}${opt.tracksInventory ? ` (stock: ${Number(opt.stock)})` : ''}`}
                value={selected}
                onChange={(_, val) => applyCatalogItem(index, val)}
                loading={catalogLoading}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} label="Item from catalog (optional)" />
                )}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 0.7fr 1.4fr 0.75fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[index].description = e.target.value;
                    setItems(copy);
                  }}
                  required
                />

                <TextField
                  label="Qty"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[index].quantity = parseInt(e.target.value) || 1;
                    setItems(copy);
                  }}
                  required
                  helperText={selected && selected.tracksInventory && Number(item.quantity) > Number(selected.stock) ? `Only ${Number(selected.stock)} in stock` : undefined}
                  error={!!(selected && selected.tracksInventory && Number(item.quantity) > Number(selected.stock))}
                />

                <TextField
                  label="Price (₹)"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[index].unitPrice = parseFloat(e.target.value) || 0;
                    setItems(copy);
                  }}
                  required
                />

                <FormControl fullWidth>
                  <InputLabel>GST %</InputLabel>
                  <Select
                    value={item.gstRate}
                    label="GST %"
                    onChange={(e) => {
                      const copy = [...items];
                      copy[index].gstRate = Number(e.target.value);
                      setItems(copy);
                    }}
                  >
                    {gstRates.map((g) => (
                      <MenuItem key={g} value={g}>{g}%</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="HSN"
                  value={item.hsnCode}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[index].hsnCode = e.target.value;
                    setItems(copy);
                  }}
                  placeholder="e.g. 998313"
                />

                <IconButton color="error" onClick={() => handleRemoveItem(index)} disabled={items.length === 1}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            );
          })}

          <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddItem} sx={{ alignSelf: 'flex-start' }}>
            Add Line Item
          </Button>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Taxable Value: {fmt(taxable)}</Typography>
              <Typography variant="body2" color="text.secondary">
                GST ({isInterState ? 'IGST' : 'CGST + SGST'}): {fmt(gst)}
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                Total Amount: {fmt(totalAmount)}
              </Typography>
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={submitting || loadingEntities}>
              {submitting ? 'Creating...' : 'Create & Send Invoice'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {!loadingEntities && customers.length === 0 && (
        <Paper sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: '#fff7ed', color: '#9a3412' }}>
          No customers found for this account yet. Add a customer from the Invoices page before creating an invoice.
        </Paper>
      )}
    </Box>
  );
}