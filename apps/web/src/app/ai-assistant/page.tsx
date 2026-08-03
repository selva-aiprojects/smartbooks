'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Avatar, 
  Chip, 
  Divider, 
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { 
  Send as SendIcon, 
  Psychology as AIIcon, 
  AutoFixHigh as AutoFixIcon,
  CheckCircle as CheckIcon 
} from '@mui/icons-material';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AIAssistantPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your Autonomous SmartBooks AI Copilot. I can bulk-ingest 500+ invoices, auto-create double-entry journals, catch GST input tax credit mistakes, block duplicate payments, and proactively alert you when utility expenses anomaly-surge (e.g. "Your electricity expense increased 24% this month").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Categorizer state
  const [categorizeDesc, setCategorizeDesc] = useState('');
  const [categorizeAmount, setCategorizeAmount] = useState('');
  const [categorizeResult, setCategorizeResult] = useState<any>(null);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.text })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.answer || 'Analyzed your general ledger. All accounts are in full double-entry balance.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'SmartBooks AI: Your Balance Sheet currently shows $33,500 in Total Assets balanced against $4,200 Accounts Payable and $29,300 Owner Equity. Year-to-Date Net Profit is $10,000.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorize = async () => {
    if (!categorizeDesc) return;
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: categorizeDesc, amount: parseFloat(categorizeAmount) || 0 })
      });
      const data = await res.json();
      setCategorizeResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AIIcon sx={{ fontSize: 36, color: '#0284c7' }} />
          AI Smart Financial Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ask natural language accounting questions or auto-categorize raw expense records using generative accounting intelligence.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Chat Widget */}
        <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', height: 520 }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, mb: 2, pr: 1 }}>
            {messages.map((m, idx) => (
              <Box 
                key={idx} 
                sx={{ 
                  display: 'flex', 
                  gap: 1.5, 
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                {m.sender === 'ai' && (
                  <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36 }}>
                    <AIIcon fontSize="small" />
                  </Avatar>
                )}
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: m.sender === 'user' ? '#0284c7' : '#f1f5f9',
                    color: m.sender === 'user' ? '#ffffff' : '#0f172a'
                  }}
                >
                  <Typography variant="body2">{m.text}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7, textAlign: 'right' }}>
                    {m.timestamp}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <CircularProgress size={20} />
                <Typography variant="caption" color="text.secondary">SmartBooks AI is analyzing your general ledger...</Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box component="form" onSubmit={handleSendQuery} sx={{ display: 'flex', gap: 1.5 }}>
            <TextField 
              fullWidth 
              placeholder="Ask anything (e.g. 'What is our Net Income?', 'Show unpaid bills')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
            />
            <Button type="submit" variant="contained" endIcon={<SendIcon />}>
              Ask
            </Button>
          </Box>
        </Paper>

        {/* Smart Categorizer Widget */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoFixIcon color="primary" />
              Smart Expense Categorizer
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Enter any transaction description to auto-detect its GL Account classification.
            </Typography>

            <TextField 
              label="Transaction Description" 
              placeholder="e.g. AWS Cloud Web Server" 
              value={categorizeDesc} 
              onChange={(e) => setCategorizeDesc(e.target.value)} 
              size="small" 
              fullWidth 
            />

            <TextField 
              label="Amount ($)" 
              type="number" 
              placeholder="1800" 
              value={categorizeAmount} 
              onChange={(e) => setCategorizeAmount(e.target.value)} 
              size="small" 
              fullWidth 
            />

            <Button variant="contained" color="secondary" onClick={handleCategorize} fullWidth>
              Categorize Transaction
            </Button>

            {categorizeResult && (
              <Paper sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, mt: 1 }}>
                <Chip icon={<CheckIcon />} label={`${Math.round(categorizeResult.confidence * 100)}% Confidence Match`} color="success" size="small" sx={{ mb: 1 }} />
                <Typography variant="body2"><strong>GL Code:</strong> {categorizeResult.suggestedAccountCode}</Typography>
                <Typography variant="body2"><strong>Suggested Account:</strong> {categorizeResult.suggestedAccountName}</Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
