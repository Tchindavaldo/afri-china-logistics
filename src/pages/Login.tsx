import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import SEO from '../components/SEO';
import AuthLayout from '../components/layout/AuthLayout';
import PasswordInput from '../components/ui/PasswordInput';
import Spinner from '../components/ui/Spinner';
import { supabase } from '../lib/supabase';
import { homeForRole, useAuth } from '../context/auth-context';

type Mode = 'login' | 'forgot';

const DISABLED_MESSAGE = 'Ce compte a été désactivé. Contactez-nous si vous pensez qu’il s’agit d’une erreur.';
const NO_ACCESS_MESSAGE = 'Ce compte n’a pas accès à cet espace. Contactez l’administrateur pour obtenir un accès.';

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
  if (message.includes('Email not confirmed')) return 'Cette adresse e-mail n’a pas encore été confirmée.';
  if (message.includes('rate limit') || message.includes('Too many')) return 'Trop de tentatives. Patientez quelques minutes puis réessayez.';
  if (message.includes('Unable to validate email')) return 'Adresse e-mail invalide.';
  return message;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; error?: string } | null;
  const { user, role, loading: authLoading, signOut } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() =>
    state?.error === 'disabled' ? DISABLED_MESSAGE : state?.error === 'unauthorized' ? NO_ACCESS_MESSAGE : ''
  );
  const [info, setInfo] = useState('');

  // Déjà connecté : redirection selon le rôle
  useEffect(() => {
    if (authLoading || !user) return;
    if (role === 'admin' || role === 'client') {
      const target = state?.from && state.from !== '/auth' ? state.from : homeForRole(role);
      navigate(role === 'admin' && target === '/dashboard' ? '/admin' : target, { replace: true });
    } else {
      // Compte désactivé ou inconnu de ce site : on referme la session.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- affiche l'état du compte
      setError(role === 'disabled' ? DISABLED_MESSAGE : NO_ACCESS_MESSAGE);
      void signOut();
    }
  }, [authLoading, user, role, navigate, state, signOut]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setInfo('');
    setPassword('');
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
        // La redirection est gérée par l'effet ci-dessus une fois le rôle connu.
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (err) throw err;
        setInfo('Si un compte existe pour cet e-mail, un lien de réinitialisation vient d’être envoyé.');
      }
    } catch (err) {
      setError(translateAuthError(err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  };

  const t =
    mode === 'login'
      ? { title: 'Connexion', lead: 'Accédez à vos expéditions ou au tableau de bord.', cta: 'Se connecter' }
      : { title: 'Mot de passe oublié', lead: 'Recevez un lien pour choisir un nouveau mot de passe.', cta: 'Envoyer le lien' };

  return (
    <AuthLayout>
      <SEO title={t.title} noindex />

      <span className="eyebrow">Espace sécurisé</span>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">{t.title}</h1>
      <p className="mt-2 text-muted">{t.lead}</p>

      {error && (
        <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
        </div>
      )}
      {info && (
        <div className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {info}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted/70" />
            <input
              id="email"
              type="email"
              required
              className="input pl-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="vous@exemple.com"
            />
          </div>
        </div>
        {mode === 'login' && (
          <div>
            <div className="flex items-center justify-between">
              <label className="label" htmlFor="password">Mot de passe</label>
              <button type="button" onClick={() => switchMode('forgot')} className="mb-1.5 text-[13px] font-semibold text-cobalt-600 hover:underline">
                Oublié ?
              </button>
            </div>
            <PasswordInput id="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary mt-2 w-full">
          {busy && <Spinner />} {t.cta}
        </button>
      </form>

      {mode === 'forgot' ? (
        <button type="button" onClick={() => switchMode('login')} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> Retour à la connexion
        </button>
      ) : (
        <p className="mt-6 text-xs leading-relaxed text-muted">
          Les accès sont créés par notre équipe. Vous n’avez pas encore de compte ? Contactez-nous avec l’e-mail utilisé lors de vos expéditions.
        </p>
      )}
    </AuthLayout>
  );
}
