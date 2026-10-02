import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Copy, Globe2, History, ListChecks, Printer, QrCode, Search, SearchX, Share2, X } from 'lucide-react';
import SEO from '../components/SEO';
import Photo from '../components/ui/Photo';
import Spinner from '../components/ui/Spinner';
import TrackingResult from '../components/tracking/TrackingResult';
import { RPC, supabase } from '../lib/supabase';
import { normalizeTrackingNumber } from '../lib/tracking';
import { trackingUrl } from '../lib/site';
import type { Shipment } from '../types';

const RECENT_KEY = 'africhina:recent-tracking';

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string').slice(0, 4) : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 4)));
  } catch {
    /* stockage indisponible (navigation privée) : sans importance */
  }
}

type Status = 'idle' | 'loading' | 'found' | 'not-found' | 'error';

export default function Track() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = normalizeTrackingNumber(searchParams.get('tracking') ?? '');
  const [input, setInput] = useState(queryParam);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [status, setStatus] = useState<Status>(queryParam ? 'loading' : 'idle');
  const [recent, setRecent] = useState<string[]>(readRecent);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const lookup = useCallback(async (number: string) => {
    setStatus('loading');
    setShipment(null);
    if (import.meta.env.DEV && (number === 'DEMO' || number === 'DEMO-AIR')) {
      const { demoShipment } = await import('../lib/demoShipment');
      setShipment(demoShipment(number === 'DEMO' ? 'sea' : 'air'));
      setStatus('found');
      return;
    }
    const { data, error } = await supabase.rpc(RPC.track, { p_tracking_number: number });
    if (error) {
      console.error('Suivi :', error.message);
      setStatus('error');
      return;
    }
    const row = (Array.isArray(data) ? data[0] : data) as Shipment | undefined;
    if (!row) {
      setStatus('not-found');
      return;
    }
    setShipment(row);
    setStatus('found');
    setRecent((prev) => {
      const next = [row.tracking_number, ...prev.filter((n) => n !== row.tracking_number)];
      writeRecent(next);
      return next.slice(0, 4);
    });
  }, []);

  // Amène le bordereau à l'écran dès qu'un colis est affiché.
  useEffect(() => {
    if (status !== 'found' || !shipment) return;
    const t = setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => clearTimeout(t);
  }, [status, shipment]);

  // L'URL est la source de vérité : un lien /track?tracking=… est partageable.
  useEffect(() => {
    if (!queryParam) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronise la recherche avec l'URL
    setInput(queryParam);
    void lookup(queryParam);
  }, [queryParam, lookup]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = normalizeTrackingNumber(input);
    if (!n) return;
    if (n === queryParam) void lookup(n);
    else setSearchParams({ tracking: n });
  };

  const clearRecent = () => {
    setRecent([]);
    writeRecent([]);
  };

  const copyLink = async () => {
    if (!shipment) return;
    const url = trackingUrl(shipment.tracking_number);
    try {
      if (navigator.share) {
        await navigator.share({ title: `Suivi ${shipment.tracking_number}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* partage annulé */
    }
  };

  return (
    <>
      <SEO
        title={queryParam ? `Suivi ${queryParam}` : 'Suivre un colis'}
        description="Suivez votre expédition Chine ⇄ Afrique en temps réel : étape en cours, progression jour par jour et trajet sur globe 3D."
      />

      {/* Saisie du numéro */}
      <section className="relative overflow-hidden bg-cobalt-500 text-white" data-print-hide>
        <Photo name="earthNetwork" priority sizes="100vw" className="pointer-events-none absolute inset-0 size-full object-cover opacity-35 mix-blend-luminosity" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cobalt-500/60 via-cobalt-500/80 to-cobalt-500" />
        <div className="bg-grid-light pointer-events-none absolute inset-0" />
        <svg className="pointer-events-none absolute -right-24 -bottom-24 hidden w-[620px] opacity-25 lg:block" viewBox="0 0 600 400" fill="none" aria-hidden="true">
          <path d="M20 360 C 140 120, 380 40, 580 90" stroke="white" strokeWidth="2" strokeDasharray="6 10" className="animate-dash" />
          <circle cx="20" cy="360" r="9" fill="white" />
          <circle cx="580" cy="90" r="12" stroke="white" strokeWidth="3" />
        </svg>

        <div className="container-x relative pt-14 pb-28 sm:pt-20 sm:pb-36">
          <span className="eyebrow eyebrow-light">Suivi en temps réel</span>
          <h1 className="mt-4 max-w-3xl font-display text-[2.6rem] leading-[1.02] font-extrabold sm:text-7xl">
            Où en est votre colis&nbsp;?
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cobalt-100">
            Saisissez le numéro reçu à l'enregistrement : étape en cours, jours restants et position sur le globe.
          </p>

          <form onSubmit={submit} className="mt-10 max-w-3xl">
            <label htmlFor="tracking" className="mb-2 block font-mono text-[11px] tracking-[0.2em] text-cobalt-100 uppercase">
              N° de suivi
            </label>
            <div className="flex flex-col gap-2 rounded-[16px] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(6,16,47,0.8)] sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cobalt-300" />
                <input
                  id="tracking"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="AFC-XXXX-XXXX"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-14 w-full rounded-[10px] bg-transparent pr-4 pl-12 font-mono text-lg tracking-wider text-ink uppercase placeholder:text-muted/50 focus:outline-none sm:text-xl"
                />
              </div>
              <button type="submit" disabled={status === 'loading'} className="btn btn-primary h-14 px-8 text-base">
                {status === 'loading' ? <Spinner /> : <ArrowRight className="size-5" />}
                {status === 'loading' ? 'Recherche…' : 'Suivre'}
              </button>
            </div>
          </form>

          {recent.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-cobalt-100">
                <History className="size-4" /> Récents :
              </span>
              {recent.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => (n === queryParam ? void lookup(n) : setSearchParams({ tracking: n }))}
                  className="rounded-full border border-white/25 px-3 py-1 font-mono text-xs transition hover:border-white hover:bg-white/10"
                >
                  {n}
                </button>
              ))}
              <button type="button" onClick={clearRecent} className="rounded-full p-1 text-cobalt-200 hover:text-white" aria-label="Effacer l'historique">
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Résultat */}
      <section className="relative pb-20">
        <div className="container-x -mt-16 sm:-mt-20">
          <div
            ref={resultRef}
            className="mx-auto max-w-6xl scroll-mt-24 overflow-hidden rounded-[22px] border border-line bg-white p-0 shadow-[0_30px_70px_-40px_rgba(10,27,77,0.5)] sm:p-8"
          >
            {status === 'found' && shipment && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 sm:mb-6 sm:border-0 sm:p-0" data-print-hide>
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Bordereau</p>
                    <p className="font-mono text-xl font-semibold text-ink">{shipment.tracking_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={copyLink} className="btn btn-outline btn-sm">
                      {copied ? <Check className="size-4" /> : typeof navigator.share === 'function' ? <Share2 className="size-4" /> : <Copy className="size-4" />}
                      {copied ? 'Lien copié' : 'Partager'}
                    </button>
                    <button type="button" onClick={() => window.print()} className="btn btn-outline btn-sm">
                      <Printer className="size-4" /> Imprimer
                    </button>
                  </div>
                </div>
                <TrackingResult shipment={shipment} />
              </>
            )}

            {status === 'loading' && (
              <div className="space-y-5 p-6 sm:p-2" aria-busy="true">
                <div className="mx-auto h-6 w-56 animate-pulse rounded-full bg-cobalt-50" />
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-cobalt-50" />
                  ))}
                </div>
                <div className="h-3 animate-pulse rounded-full bg-cobalt-50" />
                <div className="h-[360px] animate-pulse rounded-2xl bg-cobalt-50" />
              </div>
            )}

            {status === 'not-found' && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-cobalt-50">
                  <SearchX className="size-9 text-cobalt-500" />
                </div>
                <h2 className="font-display text-2xl font-bold text-ink">Numéro introuvable</h2>
                <p className="mx-auto mt-3 max-w-md text-muted">
                  Aucun colis ne correspond à <span className="font-mono font-semibold text-ink">{queryParam}</span>. Vérifiez la
                  saisie (format AFC-XXXX-XXXX) ou contactez-nous.
                </p>
                <Link to="/contact" className="btn btn-outline mt-8">
                  Contacter le service client
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="px-6 py-16 text-center">
                <h2 className="font-display text-2xl font-bold text-ink">Le suivi est momentanément indisponible</h2>
                <p className="mx-auto mt-3 max-w-md text-muted">Une erreur est survenue lors de la recherche. Réessayez dans un instant.</p>
                <button type="button" onClick={() => queryParam && lookup(queryParam)} className="btn btn-primary mt-8">
                  Réessayer
                </button>
              </div>
            )}

            {status === 'idle' && (
              <div className="p-6 sm:p-4">
                <div className="text-center">
                  <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-cobalt-50">
                    <QrCode className="size-9 text-cobalt-500" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-ink">Prêt pour le suivi</h2>
                  <p className="mt-2 text-muted">Entrez votre numéro ci-dessus, ou scannez le QR code de votre bordereau.</p>
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  {[
                    { icon: ListChecks, title: '5 étapes', text: 'Collecté, en transit, douane, en livraison, livré : vous savez toujours où vous en êtes.' },
                    { icon: Globe2, title: 'Trajet sur globe 3D', text: "Le bateau ou l'avion avance chaque jour sur la vraie route, port par port." },
                    { icon: Printer, title: 'Bordereau imprimable', text: 'Expéditeur, destinataire, frais et QR code réunis sur une seule page.' },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="rounded-[16px] border border-line p-5">
                      <Icon className="size-6 text-cobalt-500" />
                      <h3 className="mt-4 font-display text-base font-bold text-ink">{title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
