import { PortfolioCompany } from '../api/client';

interface PortfolioTableProps {
  companies: PortfolioCompany[];
}

const FLAG_STYLES: Record<string, React.CSSProperties> = {
  'at-risk': {
    background: 'rgba(239,68,68,0.15)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.35)',
  },
  watch: {
    background: 'rgba(245,158,11,0.15)',
    color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.35)',
  },
};

function fmt(v: number) {
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}

function moic(invested: number, current: number) {
  return (current / invested).toFixed(2) + 'x';
}

export default function PortfolioTable({ companies }: PortfolioTableProps) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>
          Portfolio Companies
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Company', 'Sector', 'Country', 'Revenue', 'EBITDA', 'Margin', 'MOIC', 'Status'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map(pc => {
              const hasFlags = pc.flags.length > 0;
              return (
                <tr
                  key={pc.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: pc.flags.includes('at-risk')
                      ? 'rgba(239,68,68,0.04)'
                      : pc.flags.includes('watch')
                      ? 'rgba(245,158,11,0.04)'
                      : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {hasFlags && (
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: pc.flags.includes('at-risk') ? 'var(--red)' : 'var(--amber)',
                          flexShrink: 0,
                        }} />
                      )}
                      {pc.name}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{pc.sector}</td>
                  <td style={{ ...tdStyle, color: 'var(--muted)' }}>{pc.country}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{fmt(pc.revenue)}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: pc.ebitda < 0 ? 'var(--red)' : 'var(--green)' }}>
                    {fmt(pc.ebitda)}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: pc.ebitdaMargin < 0 ? 'var(--red)' : 'var(--text)' }}>
                    {pc.ebitdaMargin.toFixed(1)}%
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {moic(pc.investedCapital, pc.currentValue)}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {pc.flags.length === 0
                        ? <span style={greenBadge}>Active</span>
                        : pc.flags.map(f => (
                          <span key={f} style={{ ...badgeBase, ...FLAG_STYLES[f] }}>
                            {f === 'at-risk' ? '⚠ At Risk' : '● Watch'}
                          </span>
                        ))
                      }
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 24px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 24px',
  color: 'var(--text)',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const badgeBase: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '3px 8px',
  borderRadius: 4,
  letterSpacing: '0.04em',
};

const greenBadge: React.CSSProperties = {
  ...badgeBase,
  background: 'rgba(34,197,94,0.12)',
  color: '#22c55e',
  border: '1px solid rgba(34,197,94,0.3)',
};
