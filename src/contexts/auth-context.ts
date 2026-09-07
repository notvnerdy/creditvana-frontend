import { createContext } from 'react';
import type { AuthResponse } from '../types/index.ts';

export interface AuthContextValue {
  isAuthenticated: boolean;
  kbaPassed: boolean;
  isUpgraded: boolean;
  handleAuthSuccess: (data: AuthResponse) => void;
  handleKBAPassed: () => void;
  setUpgraded: (upgraded: boolean) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
