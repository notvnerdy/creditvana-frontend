import {
  createContext,
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

export interface AuthContextValue {
  isAuthenticated: boolean;
  kbaPassed: boolean;
  isUpgraded: boolean;
  handleAuthSuccess: (data: AuthResponse) => void;
  handleKBAPassed: () => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasToken);
  const [kbaPassed, setKbaPassed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cv_kba_passed') === '1';
    } catch {
      return false;
    }
  });
  const [isUpgraded, setIsUpgraded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cv_is_upgraded') === '1';
    } catch {
      return false;
    }
  });

  const signOut = useCallback(() => {
    clearToken();
    try {
      localStorage.removeItem('cv_kba_passed');
      localStorage.removeItem('cv_is_upgraded');
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
    try {
      localStorage.setItem('cv_kba_passed', kba ? '1' : '0');
    } catch {
      // noop
    }

    const upgraded = data.is_upgraded === 1;
    setIsUpgraded(upgraded);
    try {
      localStorage.setItem('cv_is_upgraded', upgraded ? '1' : '0');
    } catch {
      // noop
    }
  }, []);

  const handleKBAPassed = useCallback(() => {
    setKbaPassed(true);
    try {
      localStorage.setItem('cv_kba_passed', '1');
    } catch {
      // noop
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      kbaPassed,
      isUpgraded,
      handleAuthSuccess,
      handleKBAPassed,
      signOut,
    }),
    [isAuthenticated, kbaPassed, isUpgraded, handleAuthSuccess, handleKBAPassed, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
