'use client';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GeneralSettings from './components/GeneralSettings';
import SecuritySettings from './components/SecuritySettings';
import SubscriptionSettings from './components/SubscriptionSettings';

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'subscription' ? 1 : 0;
  const [tabValue, setTabValue] = useState(initialTab);

  useEffect(() => {
    if (searchParams.get('tab') === 'subscription') {
      setTabValue(1);
    }
  }, [searchParams]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight="800" gutterBottom color="text.primary">
        System & Tenant Settings
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' }
        }}
      >
        <Tab label="General Organization" />
        <Tab label="Subscription & Nexus Access" />
        <Tab label="Security & Authentication" />
      </Tabs>

      {tabValue === 0 && <GeneralSettings />}
      {tabValue === 1 && <SubscriptionSettings />}
      {tabValue === 2 && <SecuritySettings />}
    </Box>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<Box sx={{ p: 3 }}>Loading settings...</Box>}>
      <SettingsContent />
    </Suspense>
  );
}
