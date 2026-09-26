'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Snackbar,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  FileUpload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as SuccessIcon,
  AccountTree as AccountsIcon,
  People as PeopleIcon,
  Storefront as VendorIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import Papa from 'papaparse';
import { getAuthHeaders } from '../../lib/api';

const SAMPLE_TEMPLATES = {
  accounts: 'Code,Name,Type,Balance\n1010,Main Cash on Hand,Asset,25000\n1020,Accounts Receivable,Asset,0\n2010,Accounts Payable,Liability,0\n4010,Sales Revenue,Revenue,0\n5010,General & Admin Expense,Expense,0\n5020,Cloud & Software Services,Expense,0',
  customers: 'Name,Email,Phone,Address\nAcme Global Technologies,billing@acmeglobal.com,+91 98401 22334,"Tech Park, Bangalore, KA"\nVertex Digital Solutions,accounts@vertex.in,+91 99402 33445,"OMR Expressway, Chennai, TN"\nReliance Retail Partners,finance@relretail.com,+91 98840 55667,"BKC Complex, Mumbai, MH"',
  vendors: 'Name,Email,Phone,Address\nAmazon Web Services India,aws-india-invoices@amazon.com,+91 80 4000 1234,"World Trade Center, Bangalore"\nGoogle Cloud India Pvt Ltd,billing@google.com,+91 80 6721 8000,"RMZ Infinity, Bangalore"\nBlue Dart Express Ltd,invoices@bluedart.com,+91 22 2839 6444,"Courier Hub, Mumbai, MH"',
};

export default function BulkImportPage() {
  const [tabValue, setTabValue] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');

  const currentType = tabValue === 0 ? 'accounts' : tabValue === 1 ? 'customers' : 'vendors';
  const typeLabel = tabValue === 0 ? 'Chart of Accounts' : tabValue === 1 ? 'Customers' : 'Vendors';

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(SAMPLE_TEMPLATES[currentType]);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `SmartBooks_Sample_${typeLabel.replace(/\s+/g, '_')}_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError('');
    setFile(selected);

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setError(`CSV parse warning: ${results.errors[0].message}`);
        }
        setParsedRows(results.data || []);
      },
      error: (err) => {
        setError(`Failed to read CSV: ${err.message}`);
      }
    });

    e.target.value = '';
  };

  const handleCommitImport = async () => {
    if (!parsedRows.length) return;
    setImporting(true);
    setError('');

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          type: currentType,
          rows: parsedRows,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSnack(`✅ ${data.message}`);
        setParsedRows([]);
        setFile(null);
      } else {
        setError(data.error || 'Failed to complete migration');
      }
    } catch (err: any) {
      setError(err.message || 'Network error during bulk import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, md: 2 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <SyncIcon sx={{ fontSize: 32, color: '#0284c7' }} />
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
              Data Migration & Bulk CSV Import
            </Typography>
            <Chip label="Tally & Excel Compatible" color="primary" size="small" sx={{ fontWeight: 700 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Seamlessly migrate master records, customer lists, and Chart of Accounts from Tally Prime, Zoho Books, or Excel spreadsheets.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadTemplate}
        >
          Download Sample CSV Template
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => { setTabValue(v); setParsedRows([]); setFile(null); setError(''); }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<AccountsIcon />} iconPosition="start" label="Chart of Accounts" sx={{ fontWeight: 700 }} />
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Customers Directory" sx={{ fontWeight: 700 }} />
          <Tab icon={<VendorIcon />} iconPosition="start" label="Vendors & Suppliers" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Upload Zone */}
      <Paper sx={{ p: 4, mb: 3, borderRadius: 3, border: '2px dashed #cbd5e1', textAlign: 'center', bgcolor: '#f8fafc' }}>
        <Stack spacing={2} alignItems="center">
          <UploadIcon sx={{ fontSize: 48, color: '#0284c7' }} />
          <Typography variant="h6" fontWeight="bold">
            Select or drag your {typeLabel} CSV file
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={500}>
            Download the sample template above to ensure your columns match expected schema. Automatic column matching handles capitalization.
          </Typography>

          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            size="large"
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 700, borderRadius: 2 }}
          >
            Browse CSV File
            <input type="file" accept=".csv,text/csv" hidden onChange={handleFileChange} />
          </Button>

          {file && (
            <Chip
              label={`Selected: ${file.name} (${parsedRows.length} valid rows found)`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600, mt: 1 }}
            />
          )}
        </Stack>
      </Paper>

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  File Preview — Ready for Import
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Showing first 10 rows of {parsedRows.length} detected records
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="success"
                startIcon={<SuccessIcon />}
                onClick={handleCommitImport}
                disabled={importing}
                size="large"
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                {importing ? 'Importing into Database...' : `Commit ${parsedRows.length} Records to Ledger`}
              </Button>
            </Box>

            {importing && <LinearProgress color="success" sx={{ mb: 2, height: 6, borderRadius: 3 }} />}

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    {Object.keys(parsedRows[0] || {}).map((header) => (
                      <TableCell key={header} sx={{ fontWeight: 700 }}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedRows.slice(0, 10).map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{idx + 1}</TableCell>
                      {Object.keys(parsedRows[0] || {}).map((col) => (
                        <TableCell key={col} sx={{ fontSize: '0.85rem' }}>{row[col] || '-'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}>
        <Alert onClose={() => setSnack('')} severity="success" sx={{ width: '100%', fontWeight: 600 }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
