import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { UserRole } from '../types';

export type RoleState = UserRole | 'disabled' | null;

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: RoleState;
  /** Vrai tant que la session ET le rôle ne sont pas connus. */
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function homeForRole(role: RoleState): string {
  if (role === 'admin') return '/admin';
  if (role === 'client') return '/dashboard';
  return '/auth';
}
