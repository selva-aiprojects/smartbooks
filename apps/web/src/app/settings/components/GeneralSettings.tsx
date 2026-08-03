'use client';

import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';

export default function GeneralSettings() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState(user?.company?.name || 'SmartBooks Demo Corp');
  const [currency, setCurrency] = useState(user?.company?.currency || 'INR');
  const [fiscalYearStart, setFiscalYearStart] = useState('April (1st April - 31st March)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Tenant organization settings updated successfully!');
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Organization Profile & Base Currency
        </Typography>
        <Chip label="Active Tenant" color="success" size="small" />
      </Box>

      <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Company / Tenant Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Base Currency</InputLabel>
          <Select
            value={currency}
            label="Base Currency"
            onChange={(e) => setCurrency(e.target.value)}
          >
            <MenuItem value="INR">INR (₹ - Indian Rupee)</MenuItem>
            <MenuItem value="USD">USD ($ - US Dollar)</MenuItem>
            <MenuItem value="EUR">EUR (€ - Euro)</MenuItem>
            <MenuItem value="GBP">GBP (£ - British Pound)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Fiscal Year Start Month"
          value={fiscalYearStart}
          onChange={(e) => setFiscalYearStart(e.target.value)}
          fullWidth
        />

        <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start', mt: 1, borderRadius: 2 }}>
          Save Organization Settings
        </Button>
      </Box>
    </Paper>
  );
}
