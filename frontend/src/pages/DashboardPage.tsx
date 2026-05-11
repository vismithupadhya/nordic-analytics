import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api, FundSummary, FundDetail } from '../api/client';
import MetricCard from '../components/MetricCard';
import NavChart from '../components/NavChart';
import PortfolioTable from '../components/PortfolioTable';

function fmt(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

export default function DashboardPage() {
  const { userEmail, logout } = useAuth();
  const [funds, setFunds] = useState<FundSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<FundDetail | null>(null);
  const [loadingFunds, setLoadingFunds] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getFunds()
      .then(r => {
        setFunds(r.funds);
        if (r.funds.length > 0) setSelectedId(r.funds[0].id);
      })
      .catch(() => setError('Failed to load funds'))
      .finally(() => setLoadingFunds(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setDetail(null);
    setLoadingDetail(true);
    api.getFund(selectedId)
      .then(setDetail)
      .catch(() => setError('Failed to load fund details'))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  const selected = funds.find(f => f.id === selectedId);

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sideTop}>
          <div style={styles.logoRow}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#3b82f6" fillOpacity="0.15" />
              <path d="M8 24 L16 8 L24 24" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 19 H21" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={styles.logoText}>NORDIC<br />ANALYTICS</span>
          </div>

          <p style={styles.sectionLabel}>Funds</p>

          {loadingFunds ? (
            [1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 6 }} />
            ))
          ) : (
            funds.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                style={{
                  ...styles.fundBtn,
                  background: f.id === selectedId ? 'rgba(59,130,246,0.12)' : 'transparent',
                  border: f.id === selectedId ? '1px solid rgba(59,130,246,0.35)' : '1px solid transparent',
                }}
              >
                <span style={styles.fundName}>{f.name}</span>
                <span style={styles.fundMeta}>{f.type} · {f.vintage}</span>
              </button>
            ))
          )}
        </div>

        <div style={styles.sideBottom}>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
            {userEmail}
          </p>
          <button onClick={logout} style={styles.logoutBtn}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {error && (
          <div style={{ color: 'var(--red)', background: '#ef44441a', border: '1px solid #ef444433', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Header */}
        {selected && (
          <div className="fade-up" style={styles.pageHeader}>
            <div>
              <p style={styles.pageLabel}>{selected.type} · Vintage {selected.vintage}</p>
              <h1 style={styles.pageTitle}>{selected.name}</h1>
            </div>
            <div style={styles.commitment}>
              <p style={styles.pageLabel}>Total Commitments</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>
                {fmt(selected.totalCommitments)}
              </p>
            </div>
          </div>
        )}

        {/* Metrics grid */}
        {(loadingDetail || detail) && (
          <div style={styles.metricsGrid}>
            {loadingDetail
              ? [1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 10 }} />)
              : detail && <>
                <MetricCard label="IRR" value={`${detail.metrics.irr}%`} accent delay={0} />
                <MetricCard label="TVPI" value={`${detail.metrics.tvpi}x`} delay={1} />
                <MetricCard label="DPI" value={`${detail.metrics.dpi}x`} delay={2} />
                <MetricCard label="RVPI" value={`${detail.metrics.rvpi}x`} delay={3} />
                <MetricCard label="NAV" value={fmt(detail.metrics.nav)} delay={4} />
              </>
            }
          </div>
        )}

        {/* NAV Chart */}
        <div className="fade-up fade-up-2" style={{ marginBottom: 24 }}>
          {loadingDetail
            ? <div className="skeleton" style={{ height: 310, borderRadius: 10 }} />
            : detail && <NavChart data={detail.navHistory} fundName={detail.name} />
          }
        </div>

        {/* Portfolio table */}
        <div className="fade-up fade-up-3">
          {loadingDetail
            ? <div className="skeleton" style={{ height: 250, borderRadius: 10 }} />
            : detail && <PortfolioTable companies={detail.portfolioCompanies} />
          }
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    overflowY: 'auto',
  },
  sideTop: { flex: 1 },
  sideBottom: { paddingTop: 16, borderTop: '1px solid var(--border)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 4px' },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: '0.12em',
    lineHeight: 1.4,
    color: 'var(--muted)',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.15em',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    marginBottom: 8,
    padding: '0 8px',
  },
  fundBtn: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    marginBottom: 4,
    transition: 'background 0.15s, border-color 0.15s',
    color: 'var(--text)',
  },
  fundName: { fontSize: 13, fontWeight: 600, lineHeight: 1.3 },
  fundMeta: { fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' },
  logoutBtn: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid var(--border2)',
    background: 'transparent',
    color: 'var(--muted)',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    transition: 'color 0.15s',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 36px',
    background: 'var(--bg)',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 28,
    gap: 16,
  },
  pageLabel: { fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 },
  pageTitle: { fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' },
  commitment: { textAlign: 'right' },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 12,
    marginBottom: 24,
  },
};
