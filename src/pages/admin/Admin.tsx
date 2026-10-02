import { useCallback, useState } from 'react';
import { Package, Settings, Users } from 'lucide-react';
import SEO from '../../components/SEO';
import AppTopBar from '../../components/layout/AppTopBar';
import Toast, { type ToastState } from '../../components/ui/Toast';
import ShipmentsTab from './ShipmentsTab';
import SettingsTab from './SettingsTab';
import UsersTab from './UsersTab';
import { cn } from '../../lib/format';

type Tab = 'shipments' | 'settings' | 'users';

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: 'shipments', label: 'Expéditions', icon: Package },
  { key: 'settings', label: 'Paramètres', icon: Settings },
  { key: 'users', label: 'Utilisateurs', icon: Users },
];

export default function Admin() {
  const [tab, setTab] = useState<Tab>('shipments');
  const [toast, setToast] = useState<ToastState | null>(null);
  const notify = useCallback((t: ToastState) => setToast(t), []);
  const closeToast = useCallback(() => setToast(null), []);

  return (
    <div className="min-h-screen bg-cobalt-50/50">
      <SEO title="Administration" noindex />
      <AppTopBar badge="Admin" />

      <div className="flex w-full gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-10 2xl:px-16">
        <nav className="hidden w-56 shrink-0 lg:block" aria-label="Sections">
          <ul className="sticky top-24 space-y-1">
            {TABS.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-[15px] font-semibold transition',
                    tab === t.key ? 'bg-cobalt-500 text-white shadow-[0_10px_24px_-12px_rgba(23,71,230,0.8)]' : 'text-ink/75 hover:bg-white hover:text-ink'
                  )}
                >
                  <t.icon className="size-5" /> {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          {tab === 'shipments' && <ShipmentsTab notify={notify} />}
          {tab === 'settings' && <SettingsTab notify={notify} />}
          {tab === 'users' && <UsersTab notify={notify} />}
        </main>
      </div>

      {/* Onglets mobiles */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line bg-white lg:hidden" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn('flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold', tab === t.key ? 'text-cobalt-500' : 'text-muted')}
          >
            <t.icon className="size-5" /> {t.label}
          </button>
        ))}
      </nav>

      {toast && <Toast {...toast} onClose={closeToast} />}
    </div>
  );
}
