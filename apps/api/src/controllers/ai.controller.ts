import { Response } from 'express';
import { categorizeTransaction, askAccountingAI, askAccountingAIStream } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth.middleware';

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/ai/categorize
// Gemini-powered transaction → GL Account classification
// ──────────────────────────────────────────────────────────────────────────────
export async function categorize(req: AuthRequest, res: Response) {
  try {
    const { description, amount } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }
    const result = await categorizeTransaction(req.user.companyId, description, amount || 0);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/ai/query
// Single-turn Gemini query with full financial RAG context
// ──────────────────────────────────────────────────────────────────────────────
export async function queryAI(req: AuthRequest, res: Response) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    const answer = await askAccountingAI(req.user.companyId, query);
    res.json({ answer });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg.includes('GEMINI_API_KEY')) {
      return res.status(503).json({
        error: 'AI service not configured',
        detail: 'GEMINI_API_KEY is missing. Add it to your .env file.',
      });
    }
    res.status(400).json({ error: msg });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/ai/stream
// Server-Sent Events streaming for real-time typewriter AI responses
// ──────────────────────────────────────────────────────────────────────────────
export async function streamAI(req: AuthRequest, res: Response) {
  const { query, history = [] } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    const streamResult = await askAccountingAIStream(req.user.companyId, query, history);

    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        // SSE format: "data: <payload>\n\n"
        res.write(`data: ${JSON.stringify({ token: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    const msg = (error as Error).message;
    if (msg.includes('GEMINI_API_KEY')) {
      res.write(`data: ${JSON.stringify({ error: 'AI service not configured — GEMINI_API_KEY missing.' })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    }
    res.end();
  }
}
