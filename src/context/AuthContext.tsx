import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/api/auth';
import { decodeToken, isTokenExpired } from '@/utils/jwt';
import { getToken, setToken as persistToken, clearAuth } from '@/utils/tokenStorage';
import type { CurrentUser, LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthContextValue {
  user: CurrentUser | null;
  username: string | null;
  role: 'EMPLOYEE' | 'ADMIN' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<'EMPLOYEE' | 'ADMIN' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFromToken = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded || isTokenExpired(decoded)) {
      clearAuth();
      setIsLoading(false);
      return;
    }

    setUsername(decoded.sub);
    setRole(decoded.role.toUpperCase() as 'EMPLOYEE' | 'ADMIN');

    try {
      const me = await authApi.getCurrentUser();
      setUser(me);
    } catch {
      // Token was rejected by the server (expired/invalid) — reset state
      clearAuth();
      setUsername(null);
      setRole(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromToken();
  }, [loadFromToken]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const { token } = await authApi.login(data);
      persistToken(token);
      await loadFromToken();
    },
    [loadFromToken],
  );

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setUsername(null);
    setRole(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.getCurrentUser();
    setUser(me);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        username,
        role,
        isAuthenticated: Boolean(username),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
