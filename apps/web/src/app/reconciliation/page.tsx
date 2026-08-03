'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert,
  LinearProgress
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  AutoFixHigh as AutoMatchIcon, 
  CheckCircle as CheckIcon 
} from '@mui/icons-material';

const mockBankFeed = [
  { id: 'b1', date: '2026-08-01', description: 'ACH DEPOSIT - ACME GLOBAL TECH', amount: 4500, type: 'credit', matched: true },
  { id: 'b2', date: '2026-08-02', description: 'DEBIT CARD - AWS CLOUD SERVICES', amount: 1800, type: 'debit', matched: true },
  { id: 'b3', date: '2026-08-03', description: 'WIRE IN - NEXUS DIGITAL SOLUTIONS', amount: 4000, type: 'credit', matched: false },
  { id: 'b4', date: '2026-08-03', description: 'CHECK #402 - CITY SUPPLIES', amount: 1200, type: 'debit', matched: false },
];

export default function ReconciliationPage() {
  const [bankFeed, setBankFeed] = useState(mockBankFeed);
  const [isMatching, setIsMatching] = useState(false);
  const [message, setMessage] = useState('');

  const handleAutoMatch = () => {
    setIsMatching(true);
    setMessage('');
    setTimeout(() => {
      setBankFeed(bankFeed.map(item => ({ ...item, matched: true })));
      setIsMatching(false);
      setMessage('Successfully auto-matched 2 bank feed transactions against posted journal entries!');
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMessage(`Imported ${e.target.files[0].name} successfully. 4 new bank transactions queued for reconciliation.`);
    }
  };

  const matchedCount = bankFeed.filter(t => t.matched).length;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Bank Statement Reconciliation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload CSV bank feeds and auto-match bank transactions against double-entry journal lines.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
          >
            Upload Bank CSV
            <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoMatchIcon />}
            onClick={handleAutoMatch}
            disabled={isMatching}
          >
            {isMatching ? 'Matching...' : 'Run Auto-Match'}
          </Button>
        </Box>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
      {isMatching && <LinearProgress sx={{ mb: 3 }} />}

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Bank Statement Feed vs. Journal Ledger
          </Typography>

          <Chip 
            icon={<CheckIcon />} 
            label={`${matchedCount} / ${bankFeed.length} Reconciled (${Math.round((matchedCount/bankFeed.length)*100)}%)`} 
            color={matchedCount === bankFeed.length ? 'success' : 'primary'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Bank Statement Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount ($)</TableCell>
                <TableCell align="center">Reconciliation Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bankFeed.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell><strong>{row.description}</strong></TableCell>
                  <TableCell>
                    <Chip 
                      label={row.type.toUpperCase()} 
                      size="small" 
                      color={row.type === 'credit' ? 'success' : 'error'} 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <strong>${row.amount.toLocaleString()}</strong>
                  </TableCell>
                  <TableCell align="center">
                    {row.matched ? (
                      <Chip label="Matched & Verified" color="success" size="small" icon={<CheckIcon />} />
                    ) : (
                      <Chip label="Unmatched Line" color="warning" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
