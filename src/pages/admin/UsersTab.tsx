import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ShieldCheck, Trash2, UserPlus, UserRound } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { supabase, TABLES } from '../../lib/supabase';
import { useAuth } from '../../context/auth-context';
import { cn, formatShortDate } from '../../lib/format';
import type { AppUser, UserRole } from '../../types';
import type { ToastState } from '../../components/ui/Toast';

/** Comptes masqués de la liste des utilisateurs. */
const HIDDEN_USER_EMAILS = ['junior@gmail.com'];

export default function UsersTab({ notify }: { notify: (t: ToastState) => void }) {
  const { user } = useAuth();
  const me = user?.email?.toLowerCase();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<AppUser | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from(TABLES.users).select('id, email, full_name, role, active, created_at').order('created_at', { ascending: false });
    if (error) notify({ type: 'error', message: `Chargement impossible : ${error.message}` });
    // Le compte propriétaire n'apparaît pas dans la liste (ni modifiable ni supprimable ici).
    setUsers(((data as AppUser[]) ?? []).filter((u) => !HIDDEN_USER_EMAILS.includes(u.email.toLowerCase())));
    setLoading(false);
  }, [notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial depuis Supabase
    void load();
  }, [load]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (HIDDEN_USER_EMAILS.includes(clean)) return notify({ type: 'error', message: 'Cet e-mail a déjà accès.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return notify({ type: 'error', message: 'Adresse e-mail invalide.' });
    setAdding(true);
    const { error } = await supabase.from(TABLES.users).upsert({ email: clean, role, active: true }, { onConflict: 'email' });
    setAdding(false);
    if (error) return notify({ type: 'error', message: error.message });
    setEmail('');
    notify({ type: 'success', message: `${clean} ajouté comme ${role === 'admin' ? 'administrateur' : 'client'}.` });
    void load();
  };

  const update = async (u: AppUser, patch: Partial<Pick<AppUser, 'role' | 'active'>>) => {
    const { error } = await supabase.from(TABLES.users).update(patch).eq('id', u.id);
    if (error) return notify({ type: 'error', message: error.message });
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, ...patch } : x)));
  };

  const remove = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from(TABLES.users).delete().eq('id', toDelete.id);
    if (error) return notify({ type: 'error', message: error.message });
    setUsers((list) => list.filter((x) => x.id !== toDelete.id));
    setToDelete(null);
    notify({ type: 'success', message: 'Accès retiré.' });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">Utilisateurs</h1>
      <p className="mt-1 text-muted">
        Les clients sont inscrits automatiquement à leur première connexion. Ajoutez ici les administrateurs (le compte se crée avec le même
        e-mail).
      </p>

      <form onSubmit={add} className="card mt-6 flex flex-col gap-3 p-4 sm:flex-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" className="input flex-1" />
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="input sm:w-44">
          <option value="client">Client</option>
          <option value="admin">Administrateur</option>
        </select>
        <button type="submit" disabled={adding} className="btn btn-primary">
          {adding ? <Spinner /> : <UserPlus className="size-4" />} Ajouter
        </button>
      </form>

      <div className="card mt-4 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16 text-cobalt-500">
            <Spinner className="size-8" />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {users.map((u) => {
              const isMe = u.email === me;
              return (
                <li key={u.id} className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5', !u.active && 'opacity-60')}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', u.role === 'admin' ? 'bg-cobalt-500 text-white' : 'bg-cobalt-50 text-cobalt-500')}>
                      {u.role === 'admin' ? <ShieldCheck className="size-5" /> : <UserRound className="size-5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {u.email} {isMe && <span className="ml-1 rounded-full bg-cobalt-50 px-2 py-0.5 text-xs text-cobalt-600">vous</span>}
                      </p>
                      <p className="text-xs text-muted">
                        {u.full_name || '—'} · depuis le {formatShortDate(u.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={u.role}
                      disabled={isMe}
                      onChange={(e) => update(u, { role: e.target.value as UserRole })}
                      className="input h-10 w-40 text-sm"
                      aria-label="Rôle"
                    >
                      <option value="client">Client</option>
                      <option value="admin">Administrateur</option>
                    </select>
                    <label className={cn('flex h-10 items-center gap-2 rounded-[10px] border border-line px-3 text-sm', isMe && 'opacity-50')}>
                      <input type="checkbox" className="size-4 accent-cobalt-500" checked={u.active} disabled={isMe} onChange={(e) => update(u, { active: e.target.checked })} />
                      Actif
                    </label>
                    <button
                      type="button"
                      disabled={isMe}
                      onClick={() => setToDelete(u)}
                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                      aria-label="Retirer l'accès"
                    >
                      <Trash2 className="size-[18px]" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Retirer cet accès ?">
        <p className="text-muted">
          <strong className="text-ink">{toDelete?.email}</strong> perdra son rôle sur ce site. S'il se reconnecte, il sera réinscrit comme simple
          client. Pour bloquer l'accès, préférez décocher « Actif ».
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => setToDelete(null)} className="btn btn-outline flex-1">
            Annuler
          </button>
          <button type="button" onClick={remove} className="btn flex-1 bg-red-600 text-white hover:bg-red-700">
            Retirer
          </button>
        </div>
      </Modal>
    </div>
  );
}
