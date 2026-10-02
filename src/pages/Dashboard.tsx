import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Package, Plane, Search, Ship, Truck } from 'lucide-react';
import SEO from '../components/SEO';
import AppTopBar from '../components/layout/AppTopBar';
import StageBadge from '../components/StageBadge';
import Spinner from '../components/ui/Spinner';
import { supabase, TABLES } from '../lib/supabase';
import { useAuth } from '../context/auth-context';
import { computeProgress, TRANSPORT_LABELS } from '../lib/tracking';
import { countryName, flag } from '../lib/countries';
import { formatDate } from '../lib/format';
import type { Shipment } from '../types';

type Row = Pick<
  Shipment,
  | 'id'
  | 'tracking_number'
  | 'status'
  | 'origin'
  | 'origin_country'
  | 'destination'
  | 'destination_country'
  | 'transport_mode'
  | 'expected_delivery_date'
  | 'departure_date'
  | 'total_duration_days'
  | 'tracking_progress'
  | 'tracking_stage'
  | 'shipper_email'
  | 'receiver_email'
  | 'created_at'
>;

export default function Dashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    // La sécurité (RLS) ne renvoie que les colis où l'e-mail du compte est
    // celui de l'expéditeur ou du destinataire.
    supabase
      .from(TABLES.shipments)
      .select(
        'id, tracking_number, status, origin, origin_country, destination, destination_country, transport_mode, expected_delivery_date, departure_date, total_duration_days, tracking_progress, tracking_stage, shipper_email, receiver_email, created_at'
      )
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError('Impossible de charger vos expéditions pour le moment.');
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const enriched = useMemo(() => rows.map((r) => ({ ...r, info: computeProgress(r) })), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter((r) =>
      [r.tracking_number, r.status, r.origin, r.destination, countryName(r.destination_country)].some((v) => v?.toLowerCase().includes(q))
    );
  }, [enriched, search]);

  const counts = {
    total: enriched.length,
    moving: enriched.filter((r) => r.info.stage !== 'delivered').length,
    delivered: enriched.filter((r) => r.info.stage === 'delivered').length,
  };

  const displayName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'client';
  const email = user?.email?.toLowerCase();

  return (
    <div className="min-h-screen bg-cobalt-50/50">
      <SEO title="Mon espace" noindex />
      <AppTopBar badge="Espace client" />

      <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-10 2xl:px-16">
        <section className="relative overflow-hidden rounded-[24px] bg-cobalt-500 p-7 text-white sm:p-10">
          <div className="bg-grid-light pointer-events-none absolute inset-0" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-cobalt-200 uppercase">Tableau de bord</p>
              <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Bonjour {displayName}</h1>
              <p className="mt-2 text-cobalt-100">Les expéditions liées à {user?.email} apparaissent ici automatiquement.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Package, value: counts.total, label: 'Total' },
                { icon: Truck, value: counts.moving, label: 'En cours' },
                { icon: CheckCircle2, value: counts.delivered, label: 'Livrés' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <s.icon className="mx-auto size-5 text-cobalt-200" />
                  <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
                  <div className="font-mono text-[10px] tracking-wider text-cobalt-100 uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="relative mt-8">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted/70" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, statut, ville…"
            className="input h-14 pl-12"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-24 text-cobalt-500">
            <Spinner className="size-9" />
          </div>
        ) : error ? (
          <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-white">
              <Package className="size-9 text-cobalt-300" />
            </div>
            <h2 className="mt-6 font-display text-xl font-bold text-ink">{search ? 'Aucun résultat' : 'Aucune expédition pour le moment'}</h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              {search
                ? 'Modifiez votre recherche.'
                : "Dès qu'un envoi sera enregistré avec votre e-mail comme expéditeur ou destinataire, il apparaîtra ici."}
            </p>
            {!search && (
              <Link to="/track" className="btn btn-outline mt-6">
                Suivre un colis avec son numéro
              </Link>
            )}
          </div>
        ) : (
          <ul className="mt-6 grid gap-4">
            {filtered.map((r) => {
              const ModeIcon = r.transport_mode === 'air' ? Plane : Ship;
              const role = r.receiver_email?.toLowerCase() === email ? 'Destinataire' : 'Expéditeur';
              return (
                <li key={r.id} className="card overflow-hidden transition hover:border-cobalt-300">
                  <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-12 md:items-center">
                    <div className="md:col-span-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-lg font-semibold text-ink">{r.tracking_number}</span>
                        <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">{role}</span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted">{r.status || 'En cours de traitement'}</p>
                    </div>
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <span>{flag(r.origin_country)}</span>
                        <span className="truncate">{r.origin || countryName(r.origin_country)}</span>
                        <ArrowRight className="size-4 shrink-0 text-cobalt-300" />
                        <span>{flag(r.destination_country)}</span>
                        <span className="truncate">{r.destination || countryName(r.destination_country)}</span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                        <ModeIcon className="size-3.5" /> {TRANSPORT_LABELS[r.transport_mode]} · Livraison prévue {formatDate(r.expected_delivery_date, '—')}
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <div className="flex items-center justify-between">
                        <StageBadge stage={r.info.stage} />
                        <span className="font-mono text-sm font-semibold text-cobalt-600">{r.info.progress}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cobalt-50">
                        <div className="h-full rounded-full bg-cobalt-500" style={{ width: `${r.info.progress}%` }} />
                      </div>
                    </div>
                    <div className="md:col-span-1 md:text-right">
                      <Link to={`/track?tracking=${encodeURIComponent(r.tracking_number)}`} className="btn btn-sm btn-primary w-full md:w-auto">
                        Suivre
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
