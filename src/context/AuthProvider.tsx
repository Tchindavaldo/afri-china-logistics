import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { RPC, supabase } from '../lib/supabase';
import { AuthContext, type RoleState } from './auth-context';

async function fetchRole(): Promise<RoleState> {
  const { data, error } = await supabase.rpc(RPC.myRole);
  if (error) {
    console.error('Lecture du rôle impossible :', error.message);
    return null;
  }
  return (data as RoleState) ?? null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<RoleState>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let lastUserId: string | null = null;

    // onAuthStateChange émet INITIAL_SESSION au démarrage : pas besoin
    // d'appeler getSession() en parallèle.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      const userId = next?.user.id ?? null;

      if (!userId) {
        lastUserId = null;
        setRole(null);
        setLoading(false);
        return;
      }

      // Rafraîchissement de jeton : le rôle n'a pas changé.
      if (userId === lastUserId && event === 'TOKEN_REFRESHED') return;
      lastUserId = userId;
      setLoading(true);

      // Ne jamais appeler Supabase directement dans ce callback (verrou
      // interne de supabase-js) : on diffère d'un tick.
      setTimeout(async () => {
        const r = await fetchRole();
        if (cancelled) return;
        setRole(r);
        setLoading(false);
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setSession(null);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, session, role, loading, signOut }),
    [session, role, loading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
