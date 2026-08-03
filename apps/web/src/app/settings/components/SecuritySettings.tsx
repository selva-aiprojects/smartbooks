'use client';

import { Box, TextField, Button, Typography, Paper, FormControlLabel, Switch } from '@mui/material';
import { useState } from 'react';

export default function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Security settings saved!');
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Security & Authentication
      </Typography>
      <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
        <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start', mt: 1 }}>
          Save Security Preferences
        </Button>
      </Box>
    </Paper>
  );
}
