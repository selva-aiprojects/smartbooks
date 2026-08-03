import express from 'express';
import journalRoutes from './routes/journal.routes';
import authRoutes from './routes/auth.routes';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
