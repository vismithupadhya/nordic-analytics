import request from 'supertest';
import { app } from './index';
import { initDb, getWrapper, resetForTests } from './db/database';
import bcrypt from 'bcryptjs';

let token: string;

beforeAll(async () => {
  resetForTests(':memory:');
  await initDb();
  const db = await getWrapper();

  const hash = bcrypt.hashSync('demo123', 10);
  db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', ['demo@nordic.io', hash]);

  db.run(
    `INSERT INTO funds (id, name, type, vintage, total_commitments, irr, tvpi, dpi, rvpi, nav)
     VALUES ('fund-001', 'Test Fund', 'Private Equity', 2019, 100000000, 18.4, 1.72, 0.48, 1.24, 80000000)`
  );
  db.run("INSERT INTO nav_history (fund_id, month, nav) VALUES ('fund-001', '2024-01', 70000000)");
  db.run("INSERT INTO nav_history (fund_id, month, nav) VALUES ('fund-001', '2024-06', 75000000)");
  db.run(
    `INSERT INTO portfolio_companies
       (id, fund_id, name, sector, country, revenue, ebitda, ebitda_margin, status,
        investment_date, invested_capital, current_value, flags)
     VALUES ('pc-001', 'fund-001', 'TestCo', 'SaaS', 'Norway',
             1000000, 200000, 20.0, 'Active', '2020-01-01', 500000, 1200000, 'watch')`
  );

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'demo@nordic.io', password: 'demo123' });
  token = res.body.token;
});

describe('POST /api/auth/login', () => {
  it('returns a JWT on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@nordic.io', password: 'demo123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
  });
  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@nordic.io', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/funds', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/funds');
    expect(res.status).toBe(401);
  });
  it('returns fund list with valid token', async () => {
    const res = await request(app)
      .get('/api/funds')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.funds).toBeInstanceOf(Array);
    expect(res.body.funds.length).toBeGreaterThan(0);
  });
});

describe('GET /api/funds/:id', () => {
  it('returns full fund details', async () => {
    const res = await request(app)
      .get('/api/funds/fund-001')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('navHistory');
    expect(res.body).toHaveProperty('portfolioCompanies');
    expect(res.body.portfolioCompanies[0].flags).toContain('watch');
  });
  it('returns 404 for unknown fund', async () => {
    const res = await request(app)
      .get('/api/funds/fund-999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/funds/:id/performance', () => {
  it('returns navHistory filtered by date range', async () => {
    const res = await request(app)
      .get('/api/funds/fund-001/performance?from=2024-01&to=2024-03')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.navHistory.length).toBe(1);
  });
  it('rejects invalid date format', async () => {
    const res = await request(app)
      .get('/api/funds/fund-001/performance?from=bad')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/funds/:id/portfolio', () => {
  it('filters by flag', async () => {
    const res = await request(app)
      .get('/api/funds/fund-001/portfolio?flag=watch')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(
      res.body.portfolioCompanies.every((pc: { flags: string[] }) => pc.flags.includes('watch'))
    ).toBe(true);
  });
});
