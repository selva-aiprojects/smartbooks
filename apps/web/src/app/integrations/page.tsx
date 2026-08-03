'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Chip, Button, Switch } from '@mui/material';
import { Extension as IntegrationsIcon, Check as CheckIcon } from '@mui/icons-material';

const mockIntegrations = [
  { id: '1', name: 'Open Banking API (Plaid / Yodlee)', category: 'Banking & Feeds', description: 'Direct real-time sync with 12,000+ banks worldwide.', connected: true },
  { id: '2', name: 'Stripe Merchant Processing', category: 'Payments', description: 'Automatically collect credit card payments and sync payouts.', connected: true },
  { id: '3', name: 'PayPal Checkout Gateway', category: 'Payments', description: 'Process digital wallet payments directly into accounts receivable.', connected: true },
  { id: '4', name: 'Shopify E-Commerce Sync', category: 'E-Commerce', description: 'Sync orders, refunds, inventory, and sales tax automatically.', connected: false },
  { id: '5', name: 'Zapier Workflow Engine', category: 'Automation', description: 'Connect SmartBooks with 5,000+ business web applications.', connected: false },
];

export default function IntegrationsPage() {
  const [apps, setApps] = useState(mockIntegrations);

  const handleToggle = (id: string) => {
    setApps(apps.map(a => a.id === id ? { ...a, connected: !a.connected } : a));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IntegrationsIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
          Banking APIs & Integrations Hub
          <Chip label="Enterprise / Premium Plan" color="secondary" size="small" />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect open banking APIs, merchant payment gateways, and e-commerce platforms.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {apps.map((app) => (
          <Paper key={app.id} sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">{app.name}</Typography>
                <Chip label={app.category} size="small" variant="outlined" />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {app.description}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Chip 
                icon={app.connected ? <CheckIcon /> : undefined} 
                label={app.connected ? 'Connected' : 'Disconnected'} 
                color={app.connected ? 'success' : 'default'} 
                size="small" 
              />
              <Switch checked={app.connected} onChange={() => handleToggle(app.id)} color="secondary" />
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
