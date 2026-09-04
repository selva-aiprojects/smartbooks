'use client';

import { Box, TextField, Button, Typography, Paper, FormControlLabel, Switch, Alert, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';

export default function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/me/company');
        if (res.ok) {
          const c = await res.json();
          setTwoFactor(!!c.twoFactorEnabled);
          setSessionTimeout(String(c.sessionTimeoutMinutes ?? 30));
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
        body: JSON.stringify({ twoFactorEnabled: twoFactor, sessionTimeoutMinutes: Number(sessionTimeout) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg(data?.error || 'Failed to save security settings');
        return;
      }
      setMsg('Security settings saved!');
    } catch (e) {
      setMsg('Unable to reach the backend API');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Security & Authentication
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
      )}
      {!loading && (
        <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {msg && <Alert severity={msg.startsWith('Unable') || msg.startsWith('Failed') ? 'error' : 'success'} onClose={() => setMsg(null)}>{msg}</Alert>}
          <FormControlLabel
            control={
              <Switch
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
              />
            }
            label="Require Two-Factor Authentication (2FA) for all users"
          />
          <TextField
            label="Session Timeout (minutes)"
            type="number"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={saving} sx={{ alignSelf: 'flex-start', mt: 1 }}>
            {saving ? 'Saving...' : 'Save Security Preferences'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
