import { Router, Response } from 'express';
import { getWrapper } from '../db/database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

interface FundRow {
  id: string; name: string; type: string; vintage: number;
  total_commitments: number; irr: number; tvpi: number; dpi: number; rvpi: number; nav: number;
}
interface NavRow { month: string; nav: number; }
interface PcRow {
  id: string; fund_id: string; name: string; sector: string; country: string;
  revenue: number; ebitda: number; ebitda_margin: number; status: string;
  investment_date: string; invested_capital: number; current_value: number; flags: string;
}

function fmtFund(r: FundRow) {
  return {
    id: r.id, name: r.name, type: r.type, vintage: r.vintage,
    totalCommitments: r.total_commitments,
    metrics: { irr: r.irr, tvpi: r.tvpi, dpi: r.dpi, rvpi: r.rvpi, nav: r.nav },
  };
}
function fmtPc(r: PcRow) {
  return {
    id: r.id, name: r.name, sector: r.sector, country: r.country,
    revenue: r.revenue, ebitda: r.ebitda, ebitdaMargin: r.ebitda_margin,
    status: r.status, investmentDate: r.investment_date,
    investedCapital: r.invested_capital, currentValue: r.current_value,
    flags: r.flags ? r.flags.split(',').filter(Boolean) : [],
  };
}

// GET /api/funds
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const db = await getWrapper();
  const funds = db.all<FundRow>('SELECT * FROM funds ORDER BY vintage DESC');
  res.json({ funds: funds.map(fmtFund) });
});

// GET /api/funds/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await getWrapper();
  const fund = db.get<FundRow>('SELECT * FROM funds WHERE id = ?', [req.params.id]);
  if (!fund) { res.status(404).json({ error: 'Fund not found' }); return; }

  const navHistory = db.all<NavRow>(
    'SELECT month, nav FROM nav_history WHERE fund_id = ? ORDER BY month ASC', [fund.id]
  );
  const pcs = db.all<PcRow>(
    'SELECT * FROM portfolio_companies WHERE fund_id = ? ORDER BY name ASC', [fund.id]
  );
  res.json({ ...fmtFund(fund), navHistory, portfolioCompanies: pcs.map(fmtPc) });
});

// GET /api/funds/:id/performance?from=YYYY-MM&to=YYYY-MM
router.get('/:id/performance', async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await getWrapper();
  const fund = db.get<{ id: string; name: string }>('SELECT id, name FROM funds WHERE id = ?', [req.params.id]);
  if (!fund) { res.status(404).json({ error: 'Fund not found' }); return; }

  const { from, to } = req.query as { from?: string; to?: string };
  const monthRe = /^\d{4}-\d{2}$/;
  if ((from && !monthRe.test(from)) || (to && !monthRe.test(to))) {
    res.status(400).json({ error: 'from and to must be in YYYY-MM format' }); return;
  }

  let sql = 'SELECT month, nav FROM nav_history WHERE fund_id = ?';
  const params: (string | number | null)[] = [fund.id];
  if (from) { sql += ' AND month >= ?'; params.push(from); }
  if (to)   { sql += ' AND month <= ?'; params.push(to); }
  sql += ' ORDER BY month ASC';

  const navHistory = db.all<NavRow>(sql, params);
  res.json({ fundId: fund.id, fundName: fund.name, navHistory });
});

// GET /api/funds/:id/portfolio?flag=watch  (bonus)
router.get('/:id/portfolio', async (req: AuthRequest, res: Response): Promise<void> => {
  const db = await getWrapper();
  const fund = db.get<{ id: string }>('SELECT id FROM funds WHERE id = ?', [req.params.id]);
  if (!fund) { res.status(404).json({ error: 'Fund not found' }); return; }

  const { flag } = req.query as { flag?: string };
  let companies: PcRow[];
  if (flag) {
    companies = db.all<PcRow>(
      `SELECT * FROM portfolio_companies
       WHERE fund_id = ?
         AND (',' || flags || ',' LIKE '%,' || ? || ',%' OR flags = ?)
       ORDER BY name ASC`,
      [fund.id, flag, flag]
    );
  } else {
    companies = db.all<PcRow>(
      'SELECT * FROM portfolio_companies WHERE fund_id = ? ORDER BY name ASC', [fund.id]
    );
  }
  res.json({ portfolioCompanies: companies.map(fmtPc) });
});

export default router;
