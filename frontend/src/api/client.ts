const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('na_token');
}

function authHeaders(): HeadersInit {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders(), ...options });
  if (res.status === 401) {
    localStorage.removeItem('na_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface FundMetrics {
  irr: number; tvpi: number; dpi: number; rvpi: number; nav: number;
}

export interface FundSummary {
  id: string; name: string; type: string; vintage: number;
  totalCommitments: number; metrics: FundMetrics;
}

export interface NavPoint { month: string; nav: number; }

export interface PortfolioCompany {
  id: string; name: string; sector: string; country: string;
  revenue: number; ebitda: number; ebitdaMargin: number; status: string;
  investmentDate: string; investedCapital: number; currentValue: number;
  flags: string[];
}

export interface FundDetail extends FundSummary {
  navHistory: NavPoint[];
  portfolioCompanies: PortfolioCompany[];
}

export interface PerformanceResponse {
  fundId: string; fundName: string; navHistory: NavPoint[];
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; refreshToken: string; email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refreshToken: (refreshToken: string) =>
    request<{ token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  getFunds: () => request<{ funds: FundSummary[] }>('/funds'),

  getFund: (id: string) => request<FundDetail>(`/funds/${id}`),

  getPerformance: (id: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<PerformanceResponse>(`/funds/${id}/performance${qs}`);
  },

  getPortfolio: (id: string, flag?: string) => {
    const qs = flag ? `?flag=${encodeURIComponent(flag)}` : '';
    return request<{ portfolioCompanies: PortfolioCompany[] }>(`/funds/${id}/portfolio${qs}`);
  },
};
