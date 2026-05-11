import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@nordic.io');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-up">
        {/* Logo mark */}
        <div style={styles.logoRow}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#3b82f6" fillOpacity="0.15" />
            <path d="M8 24 L16 8 L24 24" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 19 H21" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={styles.logoText}>NORDIC ANALYTICS</span>
        </div>

        <h1 style={styles.heading}>Fund Intelligence</h1>
        <p style={styles.sub}>Sign in to access your portfolio dashboard</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p style={styles.errorMsg}>{error}</p>}

          <button style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={styles.hint}>Demo credentials are pre-filled</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #1e3a5f22 0%, transparent 70%), var(--bg)',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '40px 36px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.15em',
    color: 'var(--muted)',
  },
  heading: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'var(--text)',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: 'var(--muted)',
    marginBottom: 32,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'var(--muted)',
    textTransform: 'uppercase',
  },
  input: {
    background: 'var(--bg)',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: 14,
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  errorMsg: {
    fontSize: 13,
    color: 'var(--red)',
    background: '#ef44441a',
    border: '1px solid #ef444433',
    borderRadius: 6,
    padding: '8px 12px',
  },
  btn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: 'var(--muted)',
    textAlign: 'center',
    marginTop: 20,
  },
};
