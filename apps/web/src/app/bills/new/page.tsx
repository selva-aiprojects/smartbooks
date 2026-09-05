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
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

interface Vendor { id: string; name: string; }
interface BillLineItem { description: string; quantity: number; unitPrice: number; category: string; gstRate: number; hsnCode: string; }

const gstRates = [0, 5, 12, 18, 28];
const categories = ['Software & Cloud', 'Office Supplies', 'Rent & Facilities', 'Payroll & Wages', 'Hardware'];

export default function NewBillPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [billNumber, setBillNumber] = useState(`BILL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [isInterState, setIsInterState] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(true);

  const [items, setItems] = useState<BillLineItem[]>([
    { description: 'Cloud Infrastructure Usage', quantity: 1, unitPrice: 1800, category: 'Software & Cloud', gstRate: 18, hsnCode: '998311' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/bills/vendors', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setVendors(data);
            setVendorId(data[0].id);
          }
        }
      } catch (e) { /* fall back to manual entry */ }
      setLoadingEntities(false);
    }
    load();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, category: 'Software & Cloud', gstRate: 18, hsnCode: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const taxable = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const gst = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0) * ((item.gstRate || 0) / 100), 0);
  const totalAmount = taxable + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      alert('Please select a vendor. Add a vendor first from the Bills page if the list is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          vendorId,
          number: billNumber,
          billDate,
          dueDate,
          isInterState,
          items: items.map(i => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            category: i.category,
            gstRate: i.gstRate,
            hsnCode: i.hsnCode
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to record bill');
        setSubmitting(false);
        return;
      }
      router.push('/bills');
    } catch (err) {
      console.error(err);
      alert('Backend unreachable. Bill not recorded.');
      setSubmitting(false);
    }
  };

  const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Button component={Link} href="/bills" startIcon={<ArrowBack />}>
          Back to Vendor Bills
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="error.main">
          Record Vendor Bill / Expense
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <FormControl fullWidth required>
              <InputLabel>Vendor</InputLabel>
              <Select
                value={vendorId}
                label="Vendor"
                onChange={(e) => setVendorId(e.target.value)}
                disabled={loadingEntities}
              >
                {loadingEntities && <MenuItem value=""><em>Loading...</em></MenuItem>}
                {vendors.map((v) => (
                  <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Bill / Invoice #"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Bill Date"
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />

            <TextField
              label="Payment Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />

            <FormControlLabel
              control={<Checkbox checked={isInterState} onChange={(e) => setIsInterState(e.target.checked)} />}
              label="Vendor is out-of-state (IGST charged; use ITC accordingly)"
              sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Typography variant="h6" fontWeight="bold">
            Bill Expense Items
          </Typography>

          {items.map((item, index) => (
            <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2.2fr 1.2fr 0.7fr 1.2fr 0.75fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
              <TextField
                label="Expense Description"
                value={item.description}
                onChange={(e) => {
                  const copy = [...items];
                  copy[index].description = e.target.value;
                  setItems(copy);
                }}
                required
              />

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={item.category}
                  label="Category"
                  onChange={(e) => {
                    const copy = [...items];
                    copy[index].category = e.target.value;
                    setItems(copy);
                  }}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>

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
              />

              <TextField
                label="Cost (₹)"
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
                placeholder="e.g. 998311"
              />

              <IconButton color="error" onClick={() => handleRemoveItem(index)} disabled={items.length === 1}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddItem} sx={{ alignSelf: 'flex-start' }}>
            Add Expense Line
          </Button>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Taxable Value: {fmt(taxable)}</Typography>
              <Typography variant="body2" color="text.secondary">
                GST / ITC ({isInterState ? 'IGST' : 'CGST + SGST'}): {fmt(gst)}
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                Total Payable: {fmt(totalAmount)}
              </Typography>
            </Box>

            <Button type="submit" variant="contained" color="error" size="large" disabled={submitting || loadingEntities}>
              {submitting ? 'Recording...' : 'Record Vendor Bill'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {!loadingEntities && vendors.length === 0 && (
        <Paper sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: '#fff7ed', color: '#9a3412' }}>
          No vendors found for this account yet. Add a vendor from the Bills page before recording a bill.
        </Paper>
      )}
    </Box>
  );
}