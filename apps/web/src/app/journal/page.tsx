'use client';

import { Box, Button, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 180 },
  { field: 'date', headerName: 'Date', width: 130 },
  { field: 'description', headerName: 'Description', flex: 1 },
  { field: 'status', headerName: 'Status', width: 120 },
  { 
    field: 'total', 
    headerName: 'Total ($)', 
    width: 130, 
    valueFormatter: (value) => `$${value ?? 0}` 
  },
];

const fallbackRows = [
  { id: '1', date: '2026-08-01', description: 'Initial Capital Investment', status: 'Posted', total: 10000 },
  { id: '2', date: '2026-08-02', description: 'Office Equipment Purchase', status: 'Draft', total: 2500 },
];

export default function JournalPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJournalEntries() {
      try {
        const res = await fetch('/api/journal');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setRows(data.map((item: any) => ({
              id: item.id,
              date: new Date(item.date).toISOString().split('T')[0],
              description: item.description || 'N/A',
              status: item.status || 'Posted',
              total: item.lines ? item.lines.reduce((acc: number, l: any) => acc + (Number(l.amount) || 0), 0) : 0
            })));
          } else {
            setRows(fallbackRows);
          }
        } else {
          setRows(fallbackRows);
        }
      } catch (err) {
        console.error('Error fetching journal entries:', err);
        setRows(fallbackRows);
      } finally {
        setLoading(false);
      }
    }
    fetchJournalEntries();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Journal Entries</Typography>
        <Button 
          variant="contained" 
          component={Link}
          href="/journal/new"
        >
          New Entry
        </Button>
      </Box>
      
      <Box sx={{ height: 450, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        )}
      </Box>
    </Box>
  );
}
