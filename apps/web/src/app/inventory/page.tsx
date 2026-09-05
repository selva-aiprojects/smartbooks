'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Alert, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { getAuthHeaders } from '../../lib/api';

const columns: GridColDef[] = [
  { field: 'sku', headerName: 'SKU Code', width: 140 },
  { field: 'name', headerName: 'Item Name', flex: 1 },
  { field: 'category', headerName: 'Category', width: 140 },
  { field: 'hsnCode', headerName: 'HSN/SAC', width: 110 },
  { field: 'unit', headerName: 'Unit', width: 80 },
  {
    field: 'stock',
    headerName: 'In Stock',
    width: 110,
    valueFormatter: (value: any) => Number(value ?? 0).toLocaleString('en-IN'),
  },
  {
    field: 'gstRate',
    headerName: 'GST %',
    width: 90,
    valueFormatter: (value: any) => `GST ${Number(value ?? 0)}%`,
  },
  {
    field: 'rate',
    headerName: 'Unit Price (₹)',
    width: 140,
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}`,
  },
  {
    field: 'totalValue',
    headerName: 'Stock Value (₹)',
    width: 150,
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}`,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => {
      const stock = Number(params.row.stock) || 0;
      if (stock > 20) return <Chip label="In Stock" color="success" size="small" />;
      if (stock > 0) return <Chip label="Low Stock" color="warning" size="small" />;
      return <Chip label="Out of Stock" color="error" size="small" />;
    }
  }
];

const categories = ['Hardware', 'Accessories', 'Consumables', 'Networking', 'Software & Licensing', 'Furniture', 'Raw Material'];

const gstRates = [0, 5, 12, 18, 28];

export default function InventoryPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [unit, setUnit] = useState('Nos');
  const [stock, setStock] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [gstRate, setGstRate] = useState(18);
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadItems = async () => {
    try {
      const res = await fetch('/api/items', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRows(data.map((i: any) => ({ ...i, totalValue: (Number(i.stock) || 0) * (Number(i.rate) || 0) })));
          setLive(true);
        }
      }
      setError(null);
    } catch (e) { /* keep demo fallback silent */ }
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAddProduct = async () => {
    if (!name || !sku || !category) {
      setSnack('Item name, SKU and category are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          name,
          sku,
          category,
          hsnCode,
          unit,
          stock: Number(stock) || 0,
          rate: Number(unitPrice) || 0,
          gstRate: Number(gstRate) || 0,
          location
        })
      });
      if (res.ok) {
        setSnack('Item added to live inventory.');
        setOpenAddModal(false);
        setName('');
        setSku('');
        setCategory('');
        setHsnCode('');
        setStock(0);
        setUnitPrice(0);
        setLocation('');
        await loadItems();
      } else {
        const data = await res.json();
        setSnack(data.error || 'Failed to add item');
      }
    } catch (err) {
      setSnack('Backend unreachable. Item not saved (demo mode).');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const item = rows.find(r => r.id === id);
    if (!item || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setRows(rows.filter(r => r.id !== id));
        setSnack(`Item "${item.sku}" removed from inventory.`);
      } else {
        const data = await res.json();
        setSnack(data.error || 'Failed to delete item');
      }
    } catch (err) {
      setSnack('Backend unreachable. Item not deleted.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <InventoryIcon sx={{ fontSize: 36, color: '#0284c7' }} />
            Inventory & Stock Management
            {live ? <Chip label="Live from Backend" color="success" size="small" /> : <Chip label="Sample Data" color="warning" size="small" />}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Item master with HSN codes, GST rates, stock levels and valuation from the live database.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddModal(true)}>
          Add Product / Item
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {snack && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setSnack(null)}>{snack}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ height: 480, width: '100%', backgroundColor: '#fff', borderRadius: 2, p: 1 }}>
          <DataGrid
            rows={rows}
            columns={[
              ...columns,
              {
                field: 'actions',
                headerName: 'Actions',
                width: 100,
                sortable: false,
                renderCell: (params) => (
                  <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(params.row.id)}>
                    Delete
                  </Button>
                )
              }
            ]}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
          />
        </Box>
      )}

      {/* Add Product/Item Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Product / Item</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="SKU Code"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            fullWidth
            required
            placeholder="e.g. SKU-2001"
          />
          <FormControl fullWidth required>
            <InputLabel id="inventory-category-label">Category</InputLabel>
            <Select
              labelId="inventory-category-label"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="HSN / SAC Code"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              fullWidth
              placeholder="e.g. 84713000"
            />
            <TextField
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              fullWidth
              placeholder="Nos / Kg / Ream"
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Stock Quantity"
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              fullWidth
              required
            />
            <TextField
              label="Unit Price (₹)"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              fullWidth
              required
            />
          </Box>
          <FormControl fullWidth required>
            <InputLabel id="inventory-gst-label">GST Rate</InputLabel>
            <Select
              labelId="inventory-gst-label"
              label="GST Rate"
              value={gstRate}
              onChange={(e) => setGstRate(Number(e.target.value))}
            >
              {gstRates.map((g) => (
                <MenuItem key={g} value={g}>GST {g}%</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Storage Location / Godown"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            placeholder="e.g. Head Office Store"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProduct} disabled={!name || !sku || !category || submitting}>
            {submitting ? 'Saving...' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}