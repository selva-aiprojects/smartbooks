'use client';

import { useState } from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
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

export default function InventoryPage() {
  const [rows] = useState(mockInventory);

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

        <Button variant="contained" startIcon={<AddIcon />}>
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
    </Box>
  );
}
