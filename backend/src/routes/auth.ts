import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getWrapper } from '../db/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nordic-dev-secret';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const db = await getWrapper();
  const user = db.get<{ id: number; email: string; password_hash: string }>(
    'SELECT * FROM users WHERE email = ?', [email]
  );

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign(
    { sub: user.id, email: user.email, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' }
  );
  res.json({ token, refreshToken, email: user.email });
});

// POST /api/auth/refresh
router.post('/refresh', (req: Request, res: Response): void => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) { res.status(400).json({ error: 'refreshToken is required' }); return; }
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as { sub: number; email: string; type?: string };
    if (payload.type !== 'refresh') { res.status(401).json({ error: 'Not a refresh token' }); return; }
    const token = jwt.sign({ sub: payload.sub, email: payload.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

export default router;
