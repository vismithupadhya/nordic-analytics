-- Nordic Analytics — Fund Intelligence Schema
-- SQLite-compatible DDL
-- Design decisions:
--   • funds & portfolio_companies are separate tables with FK for normalisation of repeated structures
--   • nav_history is its own table; queried heavily by fund+date range → composite index
--   • metrics are inlined into funds (1:1 relationship, avoids join for list view)
--   • flags stored as TEXT (comma-separated); acceptable at this scale, would use junction table in production
--   • users table included for auth; password stored as bcrypt hash

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS funds (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  type              TEXT NOT NULL CHECK(type IN ('Private Equity','Venture Capital','Growth Equity')),
  vintage           INTEGER NOT NULL,
  total_commitments REAL NOT NULL,
  -- Metrics (1:1, denormalised for query simplicity)
  irr               REAL,
  tvpi              REAL,
  dpi               REAL,
  rvpi              REAL,
  nav               REAL,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- NAV history — most-queried table: always filtered by fund_id and optionally date range
CREATE TABLE IF NOT EXISTS nav_history (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  fund_id TEXT NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  month   TEXT NOT NULL,   -- format: YYYY-MM
  nav     REAL NOT NULL,
  UNIQUE(fund_id, month)
);

-- Composite index: supports GET /api/funds/:id/performance?from=&to=
CREATE INDEX IF NOT EXISTS idx_nav_history_fund_month ON nav_history(fund_id, month);

CREATE TABLE IF NOT EXISTS portfolio_companies (
  id               TEXT PRIMARY KEY,
  fund_id          TEXT NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  sector           TEXT NOT NULL,
  country          TEXT NOT NULL,
  revenue          REAL,
  ebitda           REAL,
  ebitda_margin    REAL,
  status           TEXT NOT NULL DEFAULT 'Active',
  investment_date  TEXT,
  invested_capital REAL,
  current_value    REAL,
  flags            TEXT NOT NULL DEFAULT ''  -- comma-separated e.g. "watch,at-risk"
);

CREATE INDEX IF NOT EXISTS idx_portfolio_companies_fund ON portfolio_companies(fund_id);
-- Supports flag-based filtering bonus endpoint
CREATE INDEX IF NOT EXISTS idx_portfolio_companies_flags ON portfolio_companies(flags);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed demo user (password: demo123 — bcrypt hash generated at seed time, placeholder here)
-- INSERT OR IGNORE INTO users (email, password_hash) VALUES ('demo@nordic.io', '<hash>');
