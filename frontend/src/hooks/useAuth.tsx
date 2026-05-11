import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api } from '../api/client';

interface AuthCtx {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('na_token'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('na_email'));

  const login = useCallback(async (email: string, password: string) => {
    const { token, refreshToken, email: resEmail } = await api.login(email, password);
    localStorage.setItem('na_token', token);
    localStorage.setItem('na_refresh', refreshToken);
    localStorage.setItem('na_email', resEmail);
    setIsAuthenticated(true);
    setUserEmail(resEmail);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('na_token');
    localStorage.removeItem('na_refresh');
    localStorage.removeItem('na_email');
    setIsAuthenticated(false);
    setUserEmail(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
