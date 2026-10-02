import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Clock, Mail, Menu, Phone, X } from 'lucide-react';
import Logo from '../ui/Logo';
import { useSiteSettings } from '../../context/settings-context';
import { cn } from '../../lib/format';
import { NAV_ITEMS } from '../../data/nav';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ferme le menu mobile à chaque navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Bandeau d'informations */}
      <div className="hidden bg-cobalt-500 text-white md:block" data-print-hide>
        <div className="container-x flex h-9 items-center justify-between font-mono text-[11.5px] tracking-wide">
          <div className="flex items-center gap-6 text-cobalt-100">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {settings.opening_hours}
            </span>
            {settings.site_email && (
              <a href={`mailto:${settings.site_email}`} className="inline-flex items-center gap-1.5 transition hover:text-white">
                <Mail className="size-3.5" /> {settings.site_email}
              </a>
            )}
            {settings.site_phone && (
              <a href={`tel:${settings.site_phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 transition hover:text-white">
                <Phone className="size-3.5" /> {settings.site_phone}
              </a>
            )}
          </div>
          <span className="text-cobalt-100">CN ⇄ AFRIQUE · FRET MARITIME & AÉRIEN</span>
        </div>
      </div>

      <header
        data-print-hide
        className={cn(
          'sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-all duration-300',
          scrolled ? 'border-line shadow-[0_10px_30px_-20px_rgba(10,27,77,0.35)]' : 'border-transparent'
        )}
      >
        <div className={cn('container-x flex items-center justify-between gap-6 transition-all', scrolled ? 'h-16' : 'h-[76px]')}>
          <Logo />

          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Navigation principale">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => cn('nav-link', isActive && 'active')}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Link to="/track" className="btn btn-primary btn-sm">
              Suivre un colis
            </Link>
          </div>

          <button
            type="button"
            className="-mr-2 rounded-lg p-2 text-ink lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            <Menu className="size-7" />
          </button>
        </div>
      </header>

      {/* Menu mobile */}
      <div
        className={cn('fixed inset-0 z-[70] lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!open}
      >
        <div
          className={cn('absolute inset-0 bg-cobalt-950/40 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            'absolute top-0 right-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex h-[76px] items-center justify-between border-b border-line px-5">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} className="-mr-2 rounded-lg p-2" aria-label="Fermer le menu">
              <X className="size-7" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 py-4">
            {NAV_ITEMS.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between border-b border-line py-4 font-display text-xl font-semibold transition-colors',
                    isActive ? 'text-cobalt-500' : 'text-ink'
                  )
                }
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </span>
                <ArrowUpRight className="size-5 text-cobalt-300" />
              </NavLink>
            ))}
          </nav>
          <div className="space-y-3 border-t border-line p-5">
            <Link to="/track" className="btn btn-primary w-full">
              Suivre un colis
            </Link>
            {settings.site_phone && (
              <a href={`tel:${settings.site_phone.replace(/\s/g, '')}`} className="block pt-1 text-center font-mono text-xs text-muted">
                {settings.site_phone}
              </a>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
