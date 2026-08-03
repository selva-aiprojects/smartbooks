'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Switch, Chip, Button, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from '@mui/material';
import { AutoMode as AutomationIcon, Add as AddIcon } from '@mui/icons-material';

const mockAutomations = [
  { id: '1', name: 'Auto-Send Overdue Invoice Reminders', trigger: 'Invoice Overdue by 7 Days', action: 'Send Email Reminder to Client', enabled: true },
  { id: '2', name: 'Recurring Monthly Retainer Invoice', trigger: '1st Day of Every Month', action: 'Generate & Send $4,500 Invoice to Acme', enabled: true },
  { id: '3', name: 'Auto-Post Bank Reconciliation Matches', trigger: 'Bank Match Confidence > 95%', action: 'Auto-Reconcile & Clear Line', enabled: false },
  { id: '4', name: 'Low Cash Warning Alert', trigger: 'Cash Balance < $10,000', action: 'Send SMS & Push Alert to Admin', enabled: true },
];

export default function AutomationsPage() {
  const [rules, setRules] = useState(mockAutomations);

  const handleToggle = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
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

        <Button variant="contained" color="secondary" startIcon={<AddIcon />}>
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
    </Box>
  );
}
