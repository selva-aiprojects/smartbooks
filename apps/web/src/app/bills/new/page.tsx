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

export default function NewBillPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState('AWS Cloud Services');
  const [billNumber, setBillNumber] = useState(`BILL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  
  const [items, setItems] = useState([
    { description: 'Cloud Infrastructure Usage - August', quantity: 1, unitPrice: 1800, category: 'Software & Cloud' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, category: 'Software & Cloud' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: '1',
          number: billNumber,
          billDate,
          dueDate,
          items
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
      router.push('/bills');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
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
            <FormControl fullWidth>
              <InputLabel>Vendor</InputLabel>
              <Select value={vendor} label="Vendor" onChange={(e) => setVendor(e.target.value)}>
                <MenuItem value="AWS Cloud Services">AWS Cloud Services</MenuItem>
                <MenuItem value="City Office Supplies Co">City Office Supplies Co</MenuItem>
                <MenuItem value="Metropolitan Real Estate">Metropolitan Real Estate</MenuItem>
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
          </Box>

          <Divider sx={{ my: 1 }} />

          <Typography variant="h6" fontWeight="bold">
            Bill Expense Items
          </Typography>

          {items.map((item, index) => (
            <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2.5fr 1.5fr 1fr 1.5fr auto' }, gap: 2, alignItems: 'center' }}>
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
                  <MenuItem value="Software & Cloud">Software & Cloud</MenuItem>
                  <MenuItem value="Office Supplies">Office Supplies</MenuItem>
                  <MenuItem value="Rent & Facilities">Rent & Facilities</MenuItem>
                  <MenuItem value="Payroll & Wages">Payroll & Wages</MenuItem>
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
                label="Cost ($)" 
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
            Add Expense Line
          </Button>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              Total Payable: ${totalAmount.toLocaleString()}
            </Typography>

            <Button type="submit" variant="contained" color="error" size="large" disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Vendor Bill'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
