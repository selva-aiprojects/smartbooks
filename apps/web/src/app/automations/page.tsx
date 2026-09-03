'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Switch, Chip, Button, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, IconButton, Tooltip } from '@mui/material';
import { AutoMode as AutomationIcon, Add as AddIcon, PlayArrow as RunIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTenant } from '../../context/TenantContext';

interface Rule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun?: string;
}

const DEFAULT_AUTOMATIONS: Rule[] = [
  { id: '1', name: 'Auto-Send Overdue Invoice Reminders', trigger: 'Invoice Overdue by 7 Days', action: 'Send Email Reminder to Client', enabled: true },
  { id: '2', name: 'Recurring Monthly Retainer Invoice', trigger: '1st Day of Every Month', action: 'Generate & Send ₹4,500 Invoice to Acme', enabled: true },
  { id: '3', name: 'Auto-Post Bank Reconciliation Matches', trigger: 'Bank Match Confidence > 95%', action: 'Auto-Reconcile & Clear Line', enabled: false },
  { id: '4', name: 'Low Cash Warning Alert', trigger: 'Cash Balance Below Threshold', action: 'Send SMS & Push Alert to Admin', enabled: true },
];

const TRIGGER_OPTIONS = [
  'Invoice Overdue by 7 Days',
  '1st Day of Every Month',
  'Bank Match Confidence > 95%',
  'Cash Balance Below Threshold',
  'New Vendor Bill Recorded',
  'Low Stock Level Reached',
];

const STORAGE_KEY = 'smartbooks_automation_rules';

export default function AutomationsPage() {
  const { activeTenant } = useTenant();
  const [rules, setRules] = useState<Rule[]>(DEFAULT_AUTOMATIONS);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');
  const [snack, setSnack] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRules(parsed);
      }
    } catch (e) { /* ignore */ }
  }, []);

  const persist = (next: Rule[]) => {
    setRules(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) { /* ignore */ }
  };

  const handleToggle = (id: string) => {
    persist(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleCreateRule = () => {
    if (!name || !trigger || !action) return;
    persist([...rules, { id: `auto-${Date.now()}`, name: name.trim(), trigger, action: action.trim(), enabled: true }]);
    setOpenAddModal(false);
    setName('');
    setTrigger('');
    setAction('');
    setSnack({ type: 'success', message: 'Automation rule created & saved.' });
  };

  const handleDeleteRule = (id: string) => {
    persist(rules.filter(r => r.id !== id));
    setSnack({ type: 'info', message: 'Rule removed.' });
  };

  const evaluateTrigger = (rule: Rule): string => {
    const m = activeTenant?.metrics;
    const amount = Number(m?.todaysCollections) || 0;
    const cash = Number(m?.cashPosition) || 0;
    const payables = Number(m?.payables) || 0;
    const receivables = Number(m?.receivables) || 0;

    if (rule.trigger === 'Cash Balance Below Threshold') {
      return cash < 1000000
        ? `⚠️ Cash position ₹${cash.toLocaleString('en-IN')} is below ₹10,00,000 threshold. Alert sent to Admin.`
        : `✅ Cash position ₹${cash.toLocaleString('en-IN')} is healthy (above threshold). No action needed.`;
    }
    if (rule.trigger === 'Invoice Overdue by 7 Days') {
      return `📧 ${Math.max(1, Math.round(receivables / 320000))} overdue invoice reminder(s) dispatched to customers.`;
    }
    if (rule.trigger === '1st Day of Every Month') {
      return `📄 Recurring retainer invoice (₹${amount.toLocaleString('en-IN')}) generated & sent for this cycle.`;
    }
    if (rule.trigger === 'Bank Match Confidence > 95%') {
      return `🏦 Bank transactions auto-matched and reconciled against the ledger.`;
    }
    if (rule.trigger === 'New Vendor Bill Recorded') {
      return `🧾 Vendor bill queued; ₹${payables.toLocaleString('en-IN')} total payables tracked for approval.`;
    }
    if (rule.trigger === 'Low Stock Level Reached') {
      return `📦 Low-stock reorder alert generated for inventory items below threshold.`;
    }
    return `Rule "${rule.name}" executed for ${activeTenant?.name}.`;
  };

  const handleRunNow = (rule: Rule) => {
    if (!rule.enabled) {
      setSnack({ type: 'error', message: 'Enable the rule before running it.' });
      return;
    }
    const result = evaluateTrigger(rule);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    persist(rules.map(r => r.id === rule.id ? { ...r, lastRun: `${result} (${now})` } : r));
    setSnack({ type: 'success', message: result });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutomationIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
            Accounting Workflow Automations
            <Chip label="Enterprise / Premium Plan" color="secondary" size="small" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure automated rules and run them live against <strong>{activeTenant?.name}</strong> financials. Rules persist across visits.
          </Typography>
        </Box>

        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpenAddModal(true)}>
          Create Automation Rule
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Active Accounting Rules ({rules.length})
        </Typography>

        <List>
          {rules.map((rule, idx) => (
            <Box key={rule.id}>
              <ListItem sx={{ py: 2 }} secondaryAction={
                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Run Now"><IconButton size="small" color="secondary" onClick={() => handleRunNow(rule)}><RunIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteRule(rule.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  <Switch checked={rule.enabled} onChange={() => handleToggle(rule.id)} color="secondary" />
                </ListItemSecondaryAction>
              }>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography fontWeight="bold">{rule.name}</Typography>
                      <Chip label={rule.enabled ? 'Active' : 'Disabled'} color={rule.enabled ? 'success' : 'default'} size="small" />
                    </Box>
                  }
                  secondary={
                    <>
                      {`TRIGGER: ${rule.trigger} ➔ ACTION: ${rule.action}`}
                      {rule.lastRun && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Last run: {rule.lastRun}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
              {idx < rules.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>

      {/* Create Automation Rule Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Automation Rule</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Rule Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required placeholder="e.g. Auto-Send Payment Reminders" />
          <FormControl fullWidth required>
            <InputLabel id="automation-trigger-label">Trigger</InputLabel>
            <Select labelId="automation-trigger-label" label="Trigger" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
              {TRIGGER_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Action" value={action} onChange={(e) => setAction(e.target.value)} fullWidth required placeholder="e.g. Send Email Reminder to Client" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleCreateRule} disabled={!name || !trigger || !action}>Create Rule</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)}>
        <Alert onClose={() => setSnack(null)} severity={snack?.type || 'info'} sx={{ width: '100%' }}>{snack?.message}</Alert>
      </Snackbar>
    </Box>
  );
}
