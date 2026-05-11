import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { NavPoint } from '../api/client';

interface NavChartProps {
  data: NavPoint[];
  fundName: string;
}

function fmt(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border2)',
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
    }}>
      <p style={{ color: 'var(--muted)', marginBottom: 4, fontSize: 11 }}>{label}</p>
      <p style={{ color: 'var(--accent2)', fontWeight: 600 }}>{fmt(payload[0].value)}</p>
    </div>
  );
};

export default function NavChart({ data, fundName }: NavChartProps) {
  const chartData = data.map(d => ({
    month: d.month.slice(5) + ' ' + d.month.slice(0, 4),
    nav: d.nav,
  }));

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px 20px' }}>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
        NAV Performance
      </p>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>{fundName}</p>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e2328" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => `$${(v / 1e6).toFixed(0)}M`}
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="nav"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#navGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#60a5fa', stroke: '#1e3a5f', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
