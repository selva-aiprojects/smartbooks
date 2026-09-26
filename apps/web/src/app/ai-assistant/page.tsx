'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../../lib/api';
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
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AIIcon,
  AutoFixHigh as AutoFixIcon,
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
  Refresh as ClearIcon,
  TrendingUp,
  AccountBalance,
  Receipt,
  Warning,
  Percent,
  Inventory,
} from '@mui/icons-material';

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  streaming?: boolean;
}

interface ConversationTurn {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// ── Suggested prompts (defined inside component to keep JSX in React context) ─
const SUGGESTED_PROMPT_DEFS = [
  { label: 'What is our net profit this year?', color: '#10b981', iconType: 'trending' },
  { label: 'Which customer invoices are overdue?', color: '#f59e0b', iconType: 'receipt' },
  { label: 'What vendor bills are unpaid?', color: '#ef4444', iconType: 'warning' },
  { label: 'Explain our balance sheet position', color: '#8b5cf6', iconType: 'balance' },
  { label: 'What is our GST liability this quarter?', color: '#0284c7', iconType: 'percent' },
  { label: 'Which items are low in stock?', color: '#f97316', iconType: 'inventory' },
];

// ── Markdown-lite renderer ─────────────────────────────────────────────────
function renderMarkdown(text: string) {
  // Bold **text**
  let html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:0.85em;color:#38bdf8">$1</code>');
  // Convert newlines to <br>
  html = html.replace(/\n/g, '<br />');
  // Bullet points - line
  html = html.replace(/<br \/>- /g, '<br />• ');
  return html;
}

// ── ID generator ────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Main Component ──────────────────────────────────────────────────────────
function getIconForType(type: string) {
  switch (type) {
    case 'trending':   return <TrendingUp />;
    case 'receipt':    return <Receipt />;
    case 'warning':    return <Warning />;
    case 'balance':    return <AccountBalance />;
    case 'percent':    return <Percent />;
    case 'inventory':  return <Inventory />;
    default:           return <TrendingUp />;
  }
}

export default function AIAssistantPage() {
  const [query, setQuery] = useState('');
  // Use lazy initializer (() => ...) so Date() only runs on client, never on SSR
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'init',
      sender: 'ai',
      text: "Hello! I'm your **SmartBooks AI CFO** — powered by **Google Gemini**.\n\nI have read your company's live financial data and can answer questions like:\n- *\"What is our net profit this year?\"*\n- *\"Which invoices are overdue?\"*\n- *\"Explain our GST liability\"*\n- *\"Show me our top expenses\"*\n\nAsk me anything about your finances!",
      timestamp: '',
    },
  ]);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Categorizer state
  const [categorizeDesc, setCategorizeDesc] = useState('');
  const [categorizeAmount, setCategorizeAmount] = useState('');
  const [categorizeResult, setCategorizeResult] = useState<any>(null);
  const [categorizeLoading, setCategorizeLoading] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Streaming send ───────────────────────────────────────────────────────
  const handleSend = useCallback(async (questionText?: string) => {
    const text = (questionText ?? query).trim();
    if (!text || loading) return;

    const userMsgId = uid();
    const aiMsgId = uid();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: now,
    };

    const aiMsg: Message = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: now,
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setQuery('');
    setLoading(true);
    setApiKeyMissing(false);

    let fullText = '';

    try {
      const res = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ query: text, history: conversationHistory }),
      });

      // ── Check HTTP status BEFORE reading stream body ──────────────────────
      if (!res.ok) {
        if (res.status === 401) {
          fullText = '⚠️ **Session expired.** Please refresh the page and log in again.';
        } else if (res.status === 503) {
          setApiKeyMissing(true);
          fullText = '⚠️ **AI not configured.** Add `GEMINI_API_KEY` to your `.env` file, then restart the API server (`Ctrl+C` → `npm run dev`).';
        } else {
          const errJson = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          fullText = `⚠️ ${errJson?.error || `Server error (${res.status})`}`;
        }
      } else {
        // ── Read SSE stream ───────────────────────────────────────────────────
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        readLoop: while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const rawChunk = decoder.decode(value, { stream: true });
          const lines = rawChunk.split('\n').filter((l) => l.startsWith('data: '));

          for (const line of lines) {
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.error) {
                const isKeyError = /gemini_api_key|api key|not configured/i.test(payload.error);
                if (isKeyError) setApiKeyMissing(true);
                fullText = `⚠️ ${payload.error}`;
                break readLoop;
              }
              if (payload.done) break readLoop;
              if (payload.token) {
                fullText += payload.token;
                setMessages((prev) =>
                  prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText } : m))
                );
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }

        // ── Stream was empty — fall back to non-streaming /query endpoint ────
        if (!fullText) {
          try {
            const fallback = await fetch('/api/ai/query', {
              method: 'POST',
              headers: getAuthHeaders(true),
              body: JSON.stringify({ query: text }),
            });
            if (fallback.ok) {
              const data = await fallback.json();
              fullText = data.answer || '⚠️ AI returned no response. Try rephrasing your question.';
            } else if (fallback.status === 503) {
              setApiKeyMissing(true);
              fullText = '⚠️ **AI not configured.** Add `GEMINI_API_KEY` to `.env` and restart the server.';
            } else if (fallback.status === 401) {
              fullText = '⚠️ **Session expired.** Please refresh and log in again.';
            } else {
              fullText = '⚠️ AI service error. Check the API server logs for details.';
            }
          } catch {
            fullText = '⚠️ Could not reach the AI service. Make sure the API server is running on port 3000.';
          }
        }
      }
    } catch (err: any) {
      if (!fullText) {
        fullText = '⚠️ Connection error. Make sure the API server is running (`npm run dev`).';
      }
    } finally {
      // Finalise — never show raw "..."
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText || '⚠️ No response received.', streaming: false } : m))
      );
      // Only add clean answers to conversation history
      if (fullText && !fullText.startsWith('⚠️')) {
        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', parts: [{ text }] },
          { role: 'model', parts: [{ text: fullText }] },
        ]);
      }
      setLoading(false);
    }
  }, [query, loading, conversationHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: uid(),
        sender: 'ai',
        text: 'Conversation cleared. Ask me anything about your finances!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setConversationHistory([]);
    setApiKeyMissing(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Build prompted chip list inside component so JSX icons stay in React scope
  const SUGGESTED_PROMPTS = SUGGESTED_PROMPT_DEFS.map((p) => ({
    ...p,
    icon: getIconForType(p.iconType),
  }));

  // ── Smart Categorizer ────────────────────────────────────────────────────
  const handleCategorize = async () => {
    if (!categorizeDesc) return;
    setCategorizeLoading(true);
    setCategorizeResult(null);
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ description: categorizeDesc, amount: parseFloat(categorizeAmount) || 0 }),
      });
      const data = await res.json();
      setCategorizeResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCategorizeLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AIIcon sx={{ fontSize: 36, color: '#0284c7' }} />
            AI CFO Assistant
            <Chip
              label="Gemini Flash"
              size="small"
              sx={{ bgcolor: 'rgba(2,132,199,0.12)', border: '1px solid #0284c7', color: '#0284c7', fontWeight: 700, fontSize: 11 }}
            />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Powered by Google Gemini with real-time financial data — ask anything about your business
          </Typography>
        </Box>
        <Tooltip title="Clear conversation">
          <IconButton onClick={handleClear} size="small" sx={{ color: 'text.secondary' }}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* API Key Warning */}
      {apiKeyMissing && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <strong>GEMINI_API_KEY not set.</strong> Add your free API key from{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#f59e0b' }}>
            Google AI Studio
          </a>{' '}
          to your <code>.env</code> file and restart the API server.
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, alignItems: 'start' }}>
        {/* ── Chat Panel ─────────────────────────────────────────────────── */}
        <Paper sx={{ p: 0, borderRadius: 3, display: 'flex', flexDirection: 'column', height: 600, overflow: 'hidden' }}>
          {/* Chat header */}
          <Box sx={{ px: 3, py: 2, bgcolor: 'rgba(2,132,199,0.06)', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#0284c7', width: 32, height: 32 }}>
              <AIIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>SmartBooks AI CFO</Typography>
              <Typography variant="caption" color="text.secondary">
                {loading ? 'Analyzing your financials...' : 'Online · Real-time data'}
              </Typography>
            </Box>
            {loading && <LinearProgress sx={{ ml: 'auto', width: 80, borderRadius: 1 }} />}
          </Box>

          {/* Messages area */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              px: 3,
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
            }}
          >
            {messages.map((m) => (
              <Box
                key={m.id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                }}
              >
                {m.sender === 'ai' && (
                  <Avatar sx={{ bgcolor: '#0284c7', width: 32, height: 32, flexShrink: 0, mt: 0.5 }}>
                    <AIIcon sx={{ fontSize: 17 }} />
                  </Avatar>
                )}

                <Box sx={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      px: 2.5,
                      py: 1.75,
                      borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      bgcolor: m.sender === 'user' ? '#0284c7' : 'background.default',
                      border: m.sender === 'ai' ? '1px solid' : 'none',
                      borderColor: 'divider',
                      color: m.sender === 'user' ? '#fff' : 'text.primary',
                      position: 'relative',
                    }}
                  >
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{ lineHeight: 1.65, fontSize: '0.875rem' }}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text || '') }}
                    />
                    {m.streaming && m.text === '' && (
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {[0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 7, height: 7, borderRadius: '50%', bgcolor: '#0284c7',
                              animation: 'bounce 1.2s infinite',
                              animationDelay: `${i * 0.2}s`,
                              '@keyframes bounce': {
                                '0%, 80%, 100%': { transform: 'scale(0)' },
                                '40%': { transform: 'scale(1)' },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      {m.timestamp}
                    </Typography>
                    {m.sender === 'ai' && !m.streaming && m.text && (
                      <Tooltip title="Copy response">
                        <IconButton size="small" onClick={() => handleCopy(m.text)} sx={{ p: 0.25, opacity: 0.5, '&:hover': { opacity: 1 } }}>
                          <CopyIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Suggested prompts */}
          {messages.length <= 1 && (
            <Box sx={{ px: 3, pb: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <Chip
                  key={i}
                  icon={<Box sx={{ color: `${p.color} !important`, fontSize: 15, display: 'flex' }}>{p.icon}</Box>}
                  label={p.label}
                  size="small"
                  onClick={() => handleSend(p.label)}
                  disabled={loading}
                  sx={{
                    cursor: 'pointer',
                    fontSize: 11,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    '&:hover': { borderColor: p.color, bgcolor: `${p.color}11` },
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </Box>
          )}

          <Divider />

          {/* Input area */}
          <Box sx={{ px: 3, py: 2, display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask anything (e.g. 'What is our cash position?', 'Show overdue invoices')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />
            <Button
              variant="contained"
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              sx={{
                minWidth: 48,
                width: 48,
                height: 40,
                borderRadius: 2.5,
                p: 0,
                bgcolor: '#0284c7',
                '&:hover': { bgcolor: '#0369a1' },
                flexShrink: 0,
              }}
            >
              {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
            </Button>
          </Box>
        </Paper>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Smart Categorizer */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: '16px !important' }}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoFixIcon sx={{ color: '#8b5cf6' }} />
                  Smart Categorizer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  AI maps any transaction to your Chart of Accounts
                </Typography>
              </Box>

              <TextField
                label="Transaction Description"
                placeholder="e.g. AWS Cloud Invoice May 2026"
                value={categorizeDesc}
                onChange={(e) => setCategorizeDesc(e.target.value)}
                size="small"
                fullWidth
              />

              <TextField
                label="Amount (₹)"
                type="number"
                placeholder="15000"
                value={categorizeAmount}
                onChange={(e) => setCategorizeAmount(e.target.value)}
                size="small"
                fullWidth
              />

              <Button
                variant="contained"
                onClick={handleCategorize}
                disabled={!categorizeDesc || categorizeLoading}
                fullWidth
                sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, borderRadius: 2 }}
                startIcon={categorizeLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <AutoFixIcon />}
              >
                {categorizeLoading ? 'Analyzing...' : 'Categorize with AI'}
              </Button>

              {categorizeResult && (
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: categorizeResult.engine === 'gemini' ? 'rgba(139,92,246,0.06)' : 'rgba(16,185,129,0.06)',
                    border: '1px solid',
                    borderColor: categorizeResult.engine === 'gemini' ? 'rgba(139,92,246,0.3)' : 'rgba(16,185,129,0.3)',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip
                      icon={<CheckIcon />}
                      label={`${Math.round(categorizeResult.confidence * 100)}% confidence`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={categorizeResult.engine === 'gemini' ? 'Gemini AI' : 'Rule-based'}
                      size="small"
                      sx={{
                        bgcolor: categorizeResult.engine === 'gemini' ? 'rgba(139,92,246,0.15)' : 'rgba(107,114,128,0.15)',
                        color: categorizeResult.engine === 'gemini' ? '#8b5cf6' : '#6b7280',
                        fontWeight: 700, fontSize: 10,
                      }}
                    />
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>GL Code:</strong> {categorizeResult.suggestedAccountCode}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Account:</strong> {categorizeResult.suggestedAccountName}
                  </Typography>
                  {categorizeResult.reasoning && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                      "{categorizeResult.reasoning}"
                    </Typography>
                  )}
                </Paper>
              )}
            </CardContent>
          </Card>

          {/* Capabilities card */}
          <Card sx={{ borderRadius: 3, bgcolor: 'rgba(2,132,199,0.04)', border: '1px solid rgba(2,132,199,0.15)' }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom>
                What SmartBooks AI can do
              </Typography>
              {[
                'Answer questions in plain English / Hindi',
                'Analyze P&L, Balance Sheet, Cash Flow',
                'Identify overdue invoices and unpaid bills',
                'Break down GST liability (CGST/SGST/IGST)',
                'Spot expense anomalies and trends',
                'Explain accounting entries',
                'Give CFO-level business insights',
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4 }}>
                  <CheckIcon sx={{ fontSize: 14, color: '#10b981' }} />
                  <Typography variant="caption" color="text.secondary">{item}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
