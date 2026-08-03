'use client';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import GeneralSettings from './components/GeneralSettings';
import SecuritySettings from './components/SecuritySettings';

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="General" />
        <Tab label="Security" />
        <Tab label="Integrations" />
      </Tabs>

      {tabValue === 0 && <GeneralSettings />}
      {tabValue === 1 && <SecuritySettings />}
    </Box>
  );
}
