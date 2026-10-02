import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut } from 'lucide-react';
import Logo from '../ui/Logo';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../context/auth-context';

/** Barre supérieure de l'espace client et de l'admin. */
export default function AppTopBar({ badge, children }: { badge: string; children?: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const logout = async () => {
    setLeaving(true);
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md" data-print-hide>
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10 2xl:px-16">
        <Logo compact className="sm:hidden" />
        <Logo className="hidden sm:inline-flex" />
        <span className="rounded-full bg-cobalt-50 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-cobalt-600 uppercase">{badge}</span>
        {children}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden max-w-[220px] truncate text-sm text-muted md:inline">{user?.email}</span>
          <Link to="/" className="btn btn-sm hidden text-muted hover:bg-cobalt-50 hover:text-ink sm:inline-flex">
            <ExternalLink className="size-4" /> Site
          </Link>
          <button type="button" onClick={logout} disabled={leaving} className="btn btn-sm btn-outline">
            {leaving ? <Spinner className="size-4" /> : <LogOut className="size-4" />}
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
