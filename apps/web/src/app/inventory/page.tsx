'use client';

import { useState } from 'react';
import { Box, Typography, Button, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Inventory as InventoryIcon } from '@mui/icons-material';

const columns: GridColDef[] = [
  { field: 'sku', headerName: 'SKU Code', width: 130 },
  { field: 'name', headerName: 'Item Name', flex: 1 },
  { field: 'category', headerName: 'Category', width: 150 },
  { field: 'stock', headerName: 'In Stock', width: 120 },
  { 
    field: 'unitPrice', 
    headerName: 'Unit Price (₹)', 
    width: 140, 
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}` 
  },
  { 
    field: 'totalValue', 
    headerName: 'Stock Value (₹)', 
    width: 150, 
    valueFormatter: (value: any) => `₹${(Number(value) || 0).toLocaleString('en-IN')}` 
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => {
      const stock = params.row.stock;
      if (stock > 20) return <Chip label="In Stock" color="success" size="small" />;
      if (stock > 0) return <Chip label="Low Stock" color="warning" size="small" />;
      return <Chip label="Out of Stock" color="error" size="small" />;
    }
  }
];

const mockInventory = [
  { id: '1', sku: 'SKU-1001', name: 'SmartBooks Workstation Pro', category: 'Hardware', stock: 45, unitPrice: 1200, totalValue: 54000 },
  { id: '2', sku: 'SKU-1002', name: 'Wireless Ergonomic Keyboard', category: 'Accessories', stock: 12, unitPrice: 85, totalValue: 1020 },
  { id: '3', sku: 'SKU-1003', name: 'UltraHD 27" IPS Monitor', category: 'Hardware', stock: 0, unitPrice: 350, totalValue: 0 },
];

const categories = ['Hardware', 'Accessories', 'Consumables', 'Software & Licensing', 'Furniture', 'Raw Material'];

export default function InventoryPage() {
  const [rows, setRows] = useState<any[]>(mockInventory);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);

  const handleAddProduct = () => {
    if (!name || !sku || !category) return;
    const id = `item-${Date.now()}`;
    const newItem = {
      id,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      stock: Number(stock) || 0,
      unitPrice: Number(unitPrice) || 0,
      totalValue: (Number(stock) || 0) * (Number(unitPrice) || 0),
    };
    setRows([...rows, newItem]);
    setOpenAddModal(false);
    setName('');
    setSku('');
    setCategory('');
    setStock(0);
    setUnitPrice(0);
    alert('Product added successfully!');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <InventoryIcon sx={{ fontSize: 36, color: '#0284c7' }} />
            Inventory & Stock Management
            <Chip label="Growth / Professional Plan" color="info" size="small" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track product stock levels, SKUs, inventory valuation, and reorder points in real time.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddModal(true)}>
          Add Product / Item
        </Button>
      </Box>

      <Box sx={{ height: 480, width: '100%', backgroundColor: '#fff', borderRadius: 2, p: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>

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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProduct} disabled={!name || !sku || !category}>
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
