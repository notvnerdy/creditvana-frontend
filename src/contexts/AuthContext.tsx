import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  hasToken,
  setToken,
  clearToken,
  registerUnauthorizedHandler,
} from '../api/client.ts';
import type { AuthResponse } from '../types/index.ts';
import { AuthContext, type AuthContextValue } from './auth-context.ts';

const KBA_KEY = 'cv_kba_passed';
const UPGRADED_KEY = 'cv_is_upgraded';

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // storage unavailable – keep the in-memory value only
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasToken);
  const [kbaPassed, setKbaPassed] = useState<boolean>(() => readFlag(KBA_KEY));
  const [isUpgraded, setIsUpgraded] = useState<boolean>(() =>
    readFlag(UPGRADED_KEY),
  );

  const signOut = useCallback(() => {
    clearToken();
    try {
      localStorage.removeItem(KBA_KEY);
      localStorage.removeItem(UPGRADED_KEY);
    } catch {
      // noop
    }
    setIsAuthenticated(false);
    setKbaPassed(false);
    setIsUpgraded(false);
  }, []);

  // Register the 401 handler so the API client can force sign-out
  useEffect(() => {
    registerUnauthorizedHandler(signOut);
  }, [signOut]);

  const handleAuthSuccess = useCallback((data: AuthResponse) => {
    setToken(data.access_token);
    setIsAuthenticated(true);

    const kba = data.kba_passed === 1;
    setKbaPassed(kba);
    writeFlag(KBA_KEY, kba);

    const upgraded = data.is_upgraded === 1;
    setIsUpgraded(upgraded);
    writeFlag(UPGRADED_KEY, upgraded);
  }, []);

  const handleKBAPassed = useCallback(() => {
    setKbaPassed(true);
    writeFlag(KBA_KEY, true);
  }, []);

  const setUpgraded = useCallback((upgraded: boolean) => {
    setIsUpgraded(upgraded);
    writeFlag(UPGRADED_KEY, upgraded);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      kbaPassed,
      isUpgraded,
      handleAuthSuccess,
      handleKBAPassed,
      setUpgraded,
      signOut,
    }),
    [
      isAuthenticated,
      kbaPassed,
      isUpgraded,
      handleAuthSuccess,
      handleKBAPassed,
      setUpgraded,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
