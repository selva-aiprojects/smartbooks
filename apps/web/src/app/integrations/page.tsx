'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Button, Switch, Snackbar, Alert } from '@mui/material';
import { Extension as IntegrationsIcon, Check as CheckIcon, Link as LinkIcon, LinkOff as LinkOffIcon } from '@mui/icons-material';
import { useTenant } from '../../context/TenantContext';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  connected: boolean;
  lastSync?: string;
}

const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: '1', name: 'Open Banking API (Plaid / Yodlee)', category: 'Banking & Feeds', description: 'Direct real-time sync with 12,000+ banks worldwide.', connected: false },
  { id: '2', name: 'Stripe Merchant Processing', category: 'Payments', description: 'Automatically collect credit card payments and sync payouts.', connected: false },
  { id: '3', name: 'PayPal Checkout Gateway', category: 'Payments', description: 'Process digital wallet payments directly into accounts receivable.', connected: false },
  { id: '4', name: 'Shopify E-Commerce Sync', category: 'E-Commerce', description: 'Sync orders, refunds, inventory, and sales tax automatically.', connected: false },
  { id: '5', name: 'Zapier Workflow Engine', category: 'Automation', description: 'Connect SmartBooks with 5,000+ business web applications.', connected: false },
];

const STORAGE_KEY = 'smartbooks_integrations';

export default function IntegrationsPage() {
  const { activeTenant } = useTenant();
  const [apps, setApps] = useState<Integration[]>(DEFAULT_INTEGRATIONS);
  const [snack, setSnack] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setApps(parsed);
      }
    } catch (e) { /* ignore */ }
  }, []);

  const persist = (next: Integration[]) => {
    setApps(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) { /* ignore */ }
  };

  const handleToggle = (id: string) => {
    let message = '';
    let success = true;
    const next = apps.map(a => {
      if (a.id !== id) return a;
      const connected = !a.connected;
      if (connected) {
        message = `${a.name} connected for ${activeTenant?.name}.`;
        return { ...a, connected, lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      }
      success = false;
      message = `${a.name} disconnected.`;
      return { ...a, connected };
    });
    persist(next);
    setSnack({ type: success ? 'success' : 'info', message });
  };

  const connectedCount = apps.filter(a => a.connected).length;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IntegrationsIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
          Banking APIs & Integrations Hub
          <Chip label="Enterprise / Premium Plan" color="secondary" size="small" />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect open banking APIs, merchant payment gateways, and e-commerce platforms for <strong>{activeTenant?.name}</strong>. Connect state persists across visits.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: '#f5f3ff' }}>
          <Typography variant="h4" fontWeight="bold" color="#7c3aed">{apps.length}</Typography>
          <Typography variant="caption" color="text.secondary">Available Integrations</Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: '#ecfdf5' }}>
          <Typography variant="h4" fontWeight="bold" color="#10b981">{connectedCount}</Typography>
          <Typography variant="caption" color="text.secondary">Connected</Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: '#f1f5f9' }}>
          <Typography variant="h4" fontWeight="bold" color="#64748b">{apps.length - connectedCount}</Typography>
          <Typography variant="caption" color="text.secondary">Disconnected</Typography>
        </Paper>
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
              <Box>
                <Chip
                  icon={app.connected ? <LinkIcon /> : <LinkOffIcon />}
                  label={app.connected ? 'Connected' : 'Disconnected'}
                  color={app.connected ? 'success' : 'default'}
                  size="small"
                />
                {app.connected && app.lastSync && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Last sync: {app.lastSync}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {app.connected ? (
                  <Button size="small" onClick={() => handleToggle(app.id)}>Disconnect</Button>
                ) : (
                  <Button size="small" variant="contained" color="secondary" onClick={() => handleToggle(app.id)}>Connect</Button>
                )}
                <Switch checked={app.connected} onChange={() => handleToggle(app.id)} color="secondary" />
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)}>
        <Alert onClose={() => setSnack(null)} severity={snack?.type || 'success'} sx={{ width: '100%' }}>{snack?.message}</Alert>
      </Snackbar>
    </Box>
  );
}
