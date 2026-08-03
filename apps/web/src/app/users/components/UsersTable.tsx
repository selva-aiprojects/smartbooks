'use client';

import { Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 120 },
  { field: 'email', headerName: 'Email Address', flex: 1 },
  { field: 'role', headerName: 'Role', width: 150 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'createdAt', headerName: 'Created At', width: 150 },
];

const mockUsers = [
  { id: '1', email: 'admin@smartbooks.com', role: 'Admin', status: 'Active', createdAt: '2026-08-01' },
  { id: '2', email: 'accountant@smartbooks.com', role: 'Accountant', status: 'Active', createdAt: '2026-08-02' },
];

export default function UsersTable() {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={mockUsers}
        columns={columns}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
