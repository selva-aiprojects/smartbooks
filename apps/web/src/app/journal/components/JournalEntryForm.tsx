'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { getAuthHeaders } from '../../../lib/api';

export default function JournalEntryForm() {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([{ account: 'cash', debit: 0, credit: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleAddLine = () => {
    setLines([...lines, { account: 'cash', debit: 0, credit: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/journal', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          date: entryDate,
          description,
          lines: lines.map((l) => ({
            accountId: l.account,
            amount: l.debit > 0 ? l.debit : l.credit,
            type: l.debit > 0 ? 'debit' : 'credit',
          })),
        }),
      });
    } catch (err) {
      console.error('Failed to submit entry:', err);
    } finally {
      setSubmitting(false);
      router.push('/journal');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" gutterBottom>
        New Journal Entry
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <TextField
          fullWidth
          type="date"
          label="Entry Date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
        />
        
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Box>

        {lines.map((line, index) => (
          <Box 
            key={index} 
            sx={{ 
              gridColumn: { xs: 'span 1', md: 'span 2' },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
              gap: 2,
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={line.account}
                label="Account"
                onChange={(e) => {
                  const newLines = [...lines];
                  newLines[index].account = e.target.value;
                  setLines(newLines);
                }}
                required
              >
                <MenuItem value="cash">Cash on Hand</MenuItem>
                <MenuItem value="receivables">Accounts Receivable</MenuItem>
                <MenuItem value="payables">Accounts Payable</MenuItem>
                <MenuItem value="revenue">Sales Revenue</MenuItem>
                <MenuItem value="expense">General Expense</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Debit (₹)"
              type="number"
              value={line.debit}
              onChange={(e) => {
                const newLines = [...lines];
                newLines[index].debit = parseFloat(e.target.value) || 0;
                setLines(newLines);
              }}
            />

            <TextField
              fullWidth
              label="Credit (₹)"
              type="number"
              value={line.credit}
              onChange={(e) => {
                const newLines = [...lines];
                newLines[index].credit = parseFloat(e.target.value) || 0;
                setLines(newLines);
              }}
            />
          </Box>
        ))}

        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' }, display: 'flex', gap: 2, mt: 1 }}>
          <Button 
            variant="outlined" 
            onClick={handleAddLine}
          >
            Add Line
          </Button>

          <Button 
            type="submit"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Entry'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
