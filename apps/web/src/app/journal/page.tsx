import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'date', headerName: 'Date', width: 120 },
  { field: 'description', headerName: 'Description', flex: 1 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'total', headerName: 'Total', width: 120, valueFormatter: (params) => `$${params.value}` },
];

const rows = [
  { id: 1, date: '2026-08-01', description: 'Sample Entry 1', status: 'Posted', total: 1000 },
  { id: 2, date: '2026-08-02', description: 'Sample Entry 2', status: 'Draft', total: 2000 },
];

export default function JournalPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Journal Entries</Typography>
        <Button 
          variant="contained" 
          component={Link}
          href="/journal/new"
        >
          New Entry
        </Button>
      </Box>
      
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}
