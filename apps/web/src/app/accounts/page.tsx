'use client';

import { Box, Typography, Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'code', headerName: 'Account Code', width: 150 },
  { field: 'name', headerName: 'Account Name', flex: 1 },
  { field: 'type', headerName: 'Type', width: 150 },
  { 
    field: 'balance', 
    headerName: 'Current Balance', 
    width: 160, 
    valueFormatter: (value) => `$${value ?? 0}` 
  },
];

const mockAccounts = [
  { id: '1', code: '1010', name: 'Cash on Hand', type: 'Asset', balance: 15000 },
  { id: '2', code: '1020', name: 'Accounts Receivable', type: 'Asset', balance: 4500 },
  { id: '3', code: '2010', name: 'Accounts Payable', type: 'Liability', balance: 2300 },
  { id: '4', code: '3010', name: 'Owner Equity', type: 'Equity', balance: 17200 },
  { id: '5', code: '4010', name: 'Sales Revenue', type: 'Revenue', balance: 25000 },
  { id: '6', code: '5010', name: 'Salaries Expense', type: 'Expense', balance: 12000 },
];

export default function AccountsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Chart of Accounts</Typography>
        <Button variant="contained">
          Add Account
        </Button>
      </Box>
      
      <Box sx={{ height: 450, width: '100%' }}>
        <DataGrid
          rows={mockAccounts}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}
