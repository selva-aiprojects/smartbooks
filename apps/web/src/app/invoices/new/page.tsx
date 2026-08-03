'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

export default function NewInvoicePage() {
  const router = useRouter();
  const [customer, setCustomer] = useState('Acme Global Tech');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  
  const [items, setItems] = useState([
    { description: 'Enterprise Accounting Services', quantity: 1, unitPrice: 3500 },
    { description: 'Tax Advisory Setup', quantity: 1, unitPrice: 1000 }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: '1',
          number: invoiceNumber,
          issueDate,
          dueDate,
          items
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
      router.push('/invoices');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
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
            <FormControl fullWidth>
              <InputLabel>Customer</InputLabel>
              <Select value={customer} label="Customer" onChange={(e) => setCustomer(e.target.value)}>
                <MenuItem value="Acme Global Tech">Acme Global Tech</MenuItem>
                <MenuItem value="Nexus Digital Solutions">Nexus Digital Solutions</MenuItem>
                <MenuItem value="Vanguard Retail Inc">Vanguard Retail Inc</MenuItem>
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
          </Box>

          <Divider sx={{ my: 1 }} />

          <Typography variant="h6" fontWeight="bold">
            Invoice Line Items
          </Typography>

          {items.map((item, index) => (
            <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 1fr 1.5fr auto' }, gap: 2, alignItems: 'center' }}>
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
              />

              <TextField 
                label="Price ($)" 
                type="number" 
                value={item.unitPrice} 
                onChange={(e) => {
                  const copy = [...items];
                  copy[index].unitPrice = parseFloat(e.target.value) || 0;
                  setItems(copy);
                }} 
                required 
              />

              <IconButton color="error" onClick={() => handleRemoveItem(index)} disabled={items.length === 1}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddItem} sx={{ alignSelf: 'flex-start' }}>
            Add Line Item
          </Button>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              Total Amount: ${totalAmount.toLocaleString()}
            </Typography>

            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create & Send Invoice'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
