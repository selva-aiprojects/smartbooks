'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function JournalEntryForm() {
  const [entryDate, setEntryDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([{ account: '', debit: 0, credit: 0 }]);
  const router = useRouter();

  const handleAddLine = () => {
    setLines([...lines, { account: '', debit: 0, credit: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    router.push('/journal');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          New Journal Entry
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Entry Date"
              value={entryDate}
              onChange={(newValue) => setEntryDate(newValue!)}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Grid>

          {lines.map((line, index) => (
            <Grid container item spacing={3} key={index}>
              <Grid item xs={12} md={4}>
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
                    {/* TODO: Populate with accounts */}
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="receivables">Accounts Receivable</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={4}>
                <TextField
                  fullWidth
                  label="Debit"
                  type="number"
                  value={line.debit}
                  onChange={(e) => {
                    const newLines = [...lines];
                    newLines[index].debit = parseFloat(e.target.value);
                    setLines(newLines);
                  }}
                />
              </Grid>
              
              <Grid item xs={6} md={4}>
                <TextField
                  fullWidth
                  label="Credit"
                  type="number"
                  value={line.credit}
                  onChange={(e) => {
                    const newLines = [...lines];
                    newLines[index].credit = parseFloat(e.target.value);
                    setLines(newLines);
                  }}
                />
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button 
              variant="outlined" 
              onClick={handleAddLine}
            >
              Add Line
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button 
              type="submit"
              variant="contained"
              size="large"
            >
              Create Entry
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
