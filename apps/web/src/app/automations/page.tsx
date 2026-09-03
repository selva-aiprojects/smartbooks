'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Switch, Chip, Button, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { AutoMode as AutomationIcon, Add as AddIcon } from '@mui/icons-material';

const mockAutomations = [
  { id: '1', name: 'Auto-Send Overdue Invoice Reminders', trigger: 'Invoice Overdue by 7 Days', action: 'Send Email Reminder to Client', enabled: true },
  { id: '2', name: 'Recurring Monthly Retainer Invoice', trigger: '1st Day of Every Month', action: 'Generate & Send ₹4,500 Invoice to Acme', enabled: true },
  { id: '3', name: 'Auto-Post Bank Reconciliation Matches', trigger: 'Bank Match Confidence > 95%', action: 'Auto-Reconcile & Clear Line', enabled: false },
  { id: '4', name: 'Low Cash Warning Alert', trigger: 'Cash Balance < ₹10,000', action: 'Send SMS & Push Alert to Admin', enabled: true },
];

const triggerOptions = [
  'Invoice Overdue by 7 Days',
  '1st Day of Every Month',
  'Bank Match Confidence > 95%',
  'Cash Balance Below Threshold',
  'New Vendor Bill Recorded',
  'Low Stock Level Reached',
];

export default function AutomationsPage() {
  const [rules, setRules] = useState(mockAutomations);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');

  const handleToggle = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleCreateRule = () => {
    if (!name || !trigger || !action) return;
    const newRule = {
      id: `auto-${Date.now()}`,
      name: name.trim(),
      trigger,
      action: action.trim(),
      enabled: true,
    };
    setRules([...rules, newRule]);
    setOpenAddModal(false);
    setName('');
    setTrigger('');
    setAction('');
    alert('Automation rule created successfully!');
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
            Configure automated rules for recurring invoices, payment reminders, and auto-posting triggers.
          </Typography>
        </Box>

        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpenAddModal(true)}>
          Create Automation Rule
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Active Accounting Rules
        </Typography>

        <List>
          {rules.map((rule, idx) => (
            <Box key={rule.id}>
              <ListItem sx={{ py: 2 }}>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography fontWeight="bold">{rule.name}</Typography>
                      <Chip label={rule.enabled ? 'Active' : 'Disabled'} color={rule.enabled ? 'success' : 'default'} size="small" />
                    </Box>
                  } 
                  secondary={`TRIGGER: ${rule.trigger} ➔ ACTION: ${rule.action}`}
                />
                <ListItemSecondaryAction>
                  <Switch checked={rule.enabled} onChange={() => handleToggle(rule.id)} color="secondary" />
                </ListItemSecondaryAction>
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
          <TextField 
            label="Rule Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            fullWidth 
            required 
            placeholder="e.g. Auto-Send Payment Reminders"
          />
          <FormControl fullWidth required>
            <InputLabel id="automation-trigger-label">Trigger</InputLabel>
            <Select
              labelId="automation-trigger-label"
              label="Trigger"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
            >
              {triggerOptions.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            label="Action" 
            value={action} 
            onChange={(e) => setAction(e.target.value)} 
            fullWidth 
            required 
            placeholder="e.g. Send Email Reminder to Client"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleCreateRule} disabled={!name || !trigger || !action}>
            Create Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
