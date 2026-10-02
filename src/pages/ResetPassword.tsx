import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound } from 'lucide-react';
import SEO from '../components/SEO';
import AuthLayout from '../components/layout/AuthLayout';
import PasswordInput from '../components/ui/PasswordInput';
import Spinner from '../components/ui/Spinner';
import { supabase } from '../lib/supabase';
import { homeForRole, useAuth } from '../context/auth-context';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  // Le lien de l'e-mail ouvre une session de récupération. Sans session après
  // quelques secondes, le lien est invalide ou expiré.
  useEffect(() => {
    if (loading || user) return;
    const t = setTimeout(() => setExpired(true), 2500);
    return () => clearTimeout(t);
  }, [loading, user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    if (password !== confirm) return setError('Les deux mots de passe ne correspondent pas.');
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(err.message);
    navigate(homeForRole(role), { replace: true });
  };

  return (
    <AuthLayout>
      <SEO title="Nouveau mot de passe" noindex />
      <div className="grid size-14 place-items-center rounded-2xl bg-cobalt-50 text-cobalt-500">
        <KeyRound className="size-7" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink">Nouveau mot de passe</h1>

      {!user && expired ? (
        <>
          <p className="mt-3 text-muted">Ce lien est invalide ou a expiré. Demandez-en un nouveau depuis la page de connexion.</p>
          <Link to="/auth" className="btn btn-primary mt-8 w-full">
            Retour à la connexion
          </Link>
        </>
      ) : !user ? (
        <div className="mt-10 flex justify-center text-cobalt-500">
          <Spinner className="size-8" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <p className="text-muted">
            Compte : <strong className="text-ink">{user.email}</strong>
          </p>
          {error && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="label" htmlFor="pw">Nouveau mot de passe</label>
            <PasswordInput id="pw" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <div>
            <label className="label" htmlFor="pw2">Confirmer</label>
            <PasswordInput id="pw2" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy && <Spinner />} Enregistrer
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
