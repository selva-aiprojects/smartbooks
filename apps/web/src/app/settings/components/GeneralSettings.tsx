'use client';

import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Chip, Alert, CircularProgress } from '@mui/material';
import { apiFetch } from '../../../lib/api';

export default function GeneralSettings() {
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [gstin, setGstin] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/me/company');
        if (res.ok) {
          const c = await res.json();
          setCompanyName(c.name || '');
          setCurrency(c.currency || 'INR');
          setGstin(c.gstin || '');
          setContactEmail(c.contactEmail || '');
        }
      } catch (e) { /* ignore */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await apiFetch('/api/me/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName, currency, gstin, contactEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg(data?.error || 'Failed to save settings');
        return;
      }
      setMsg('Organization settings saved successfully!');
    } catch (e) {
      setMsg('Unable to reach the backend API');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Organization Profile & Base Currency
        </Typography>
        <Chip label="Active Tenant" color="success" size="small" />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
      )}

      {!loading && (
        <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {msg && <Alert severity={msg.startsWith('Unable') || msg.startsWith('Failed') ? 'error' : 'success'} onClose={() => setMsg(null)}>{msg}</Alert>}
          <TextField
            label="Company / Tenant Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            fullWidth
          />
          <TextField
            label="GSTIN"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            fullWidth
            placeholder="33AAACX9876E1Z5"
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
            label="Contact Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            fullWidth
          />

          <Button type="submit" variant="contained" disabled={saving} sx={{ alignSelf: 'flex-start', mt: 1, borderRadius: 2 }}>
            {saving ? 'Saving...' : 'Save Organization Settings'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
