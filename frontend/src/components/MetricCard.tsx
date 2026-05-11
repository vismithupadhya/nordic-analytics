interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  delay?: number;
}

export default function MetricCard({ label, value, sub, accent, delay = 0 }: MetricCardProps) {
  return (
    <div
      className={`fade-up fade-up-${delay + 1}`}
      style={{
        background: accent ? 'rgba(59,130,246,0.07)' : 'var(--surface)',
        border: `1px solid ${accent ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
        borderRadius: 10,
        padding: '18px 20px',
        minWidth: 0,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: accent ? 'var(--accent2)' : 'var(--text)' }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}
