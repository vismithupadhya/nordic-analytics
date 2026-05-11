import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { initDb } from './db/database';
import authRoutes from './routes/auth';
import fundsRoutes from './routes/funds';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rate limiting — 100 requests per 15 min per IP
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use('/api/auth', authRoutes);
app.use('/api/funds', fundsRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

export { app };

async function bootstrap() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Nordic Analytics API running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  bootstrap().catch(err => { console.error(err); process.exit(1); });
}
