import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CircleCheck } from 'lucide-react';
import Logo from '../ui/Logo';
import Photo from '../ui/Photo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-cobalt-500 text-white lg:flex lg:flex-col">
        <Photo
          name="containerTerminal"
          priority
          sizes="50vw"
          className="absolute inset-0 size-full object-cover opacity-35 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cobalt-600 via-cobalt-500/70 to-cobalt-500/30" />
        <div className="bg-grid-light absolute inset-0" />
        <svg className="absolute right-0 bottom-0 w-[85%] opacity-30" viewBox="0 0 600 420" fill="none" aria-hidden="true">
          <path d="M560 60 C 420 20, 160 140, 60 380" stroke="white" strokeWidth="2.5" strokeDasharray="3 12" strokeLinecap="round" className="animate-dash" />
          <circle cx="560" cy="60" r="10" fill="white" />
          <circle cx="60" cy="380" r="16" stroke="white" strokeWidth="3" />
        </svg>
        <div className="relative flex flex-1 flex-col p-12">
          <Logo inverted />
          <div className="mt-auto max-w-md">
            <h2 className="font-display text-4xl leading-tight font-bold">Vos expéditions, au même endroit.</h2>
            <ul className="mt-8 space-y-3 text-cobalt-100">
              {['Tous vos colis liés à votre e-mail', 'Progression jour par jour', 'Bordereaux et QR codes imprimables'].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CircleCheck className="size-5 text-white" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="flex flex-col bg-white">
        <div className="flex items-center justify-between p-5 sm:p-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link to="/" className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-cobalt-500">
            <ArrowLeft className="size-4" /> Retour au site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
