import express, { Request, Response, NextFunction } from 'express';
import journalRoutes from './routes/journal.routes';
import authRoutes from './routes/auth.routes';
import invoiceRoutes from './routes/invoice.routes';
import billRoutes from './routes/bill.routes';
import reconciliationRoutes from './routes/reconciliation.routes';
import aiRoutes from './routes/ai.routes';
import accountRoutes from './routes/account.routes';
import adminRoutes from './routes/admin.routes';
import meRoutes from './routes/me.routes';
import itemRoutes from './routes/item.routes';
import taxRoutes from './routes/tax.routes';
import reportRoutes from './routes/report.routes';
import { prisma } from './lib/prisma';
import cors from 'cors';
import { config } from './core/config';

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3001', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: config.app_name, time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', meRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/reports', reportRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
