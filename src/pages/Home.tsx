import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CircleCheck,
  ClipboardList,
  Globe2,
  Landmark,
  Languages,
  Minus,
  Plus,
  Receipt,
  Route,
  Search,
  Ship,
  Truck,
  Warehouse,
} from 'lucide-react';
import SEO from '../components/SEO';
import Reveal from '../components/ui/Reveal';
import Photo from '../components/ui/Photo';
import WhatsAppIcon from '../components/ui/WhatsAppIcon';
import { SERVICES } from '../data/services';
import { FAQ } from '../data/faq';
import { AFRICAN_COUNTRY_COUNT, COUNTRIES, flag } from '../lib/countries';
import { normalizeTrackingNumber } from '../lib/tracking';
import { useSiteSettings } from '../context/settings-context';
import { whatsappLink } from '../lib/site';
import { cn } from '../lib/format';

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
      <div className="relative overflow-hidden rounded-[28px] bg-cobalt-500 shadow-[0_40px_80px_-40px_rgba(23,71,230,0.9)]">
        <Photo
          name="portAerial"
          priority
          maxWidth={1200}
          sizes="(min-width: 1024px) 520px, 100vw"
          className="absolute inset-0 size-full object-cover opacity-50 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cobalt-500/30 via-cobalt-600/20 to-ink/60" />
        <div className="bg-grid-light absolute inset-0" />
        <svg viewBox="0 0 480 400" className="relative w-full" aria-hidden="true">
          {/* Méridiens / parallèles décoratifs */}
          <g stroke="rgba(255,255,255,0.14)" fill="none">
            <circle cx="240" cy="560" r="420" />
            <circle cx="240" cy="560" r="330" />
            <ellipse cx="240" cy="560" rx="180" ry="420" />
            <ellipse cx="240" cy="560" rx="60" ry="420" />
          </g>
          <path id="hero-route" d="M408 96 C 320 40, 150 120, 86 300" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" strokeLinecap="round" />
          <path d="M408 96 C 320 40, 150 120, 86 300" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" className="animate-dash" />

          {/* Départ : Chine */}
          <circle cx="408" cy="96" r="16" fill="rgba(255,255,255,0.18)" />
          <circle cx="408" cy="96" r="7" fill="white" />
          <g transform="translate(300 128)">
            <rect width="132" height="30" rx="8" fill="white" />
            <text x="12" y="20" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="#0A1B4D">
              CN · SHENZHEN
            </text>
          </g>

          {/* Arrivée : Afrique */}
          <circle cx="86" cy="300" r="20" fill="none" stroke="white" strokeWidth="2.5" />
          <circle cx="86" cy="300" r="6" fill="white" />
          <g transform="translate(120 318)">
            <rect width="126" height="30" rx="8" fill="#0A1B4D" />
            <text x="12" y="20" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="600" fill="white">
              CM · DOUALA
            </text>
          </g>

          {/* Navire en mouvement */}
          <g>
            <circle r="13" fill="white" />
            <circle r="5" fill="#1747E6" />
            <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
              <mpath href="#hero-route" />
            </animateMotion>
          </g>
        </svg>

        <div className="absolute top-5 left-5 flex flex-col gap-2 font-mono text-[11px] text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">⚓ Maritime · 35–60 j</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">✈ Aérien · 3–7 j</span>
        </div>
      </div>

      {/* Mini-bordereau d'exemple */}
      <div className="relative z-10 mx-4 -mt-16 animate-float rounded-[18px] border border-line bg-white p-5 shadow-[0_30px_60px_-30px_rgba(10,27,77,0.45)] sm:absolute sm:-bottom-10 sm:-left-8 sm:mx-0 sm:mt-0 sm:w-[300px]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">Exemple de suivi</span>
          <span className="rounded-full bg-cobalt-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-cobalt-600">EN TRANSIT</span>
        </div>
        <p className="mt-2 font-mono text-lg font-semibold text-ink">AFC-7Q2M-K8XD</p>
        <div className="mt-4 flex items-center gap-1.5">
          {[1, 1, 2, 0, 0].map((s, i) => (
            <span key={i} className={cn('h-1.5 flex-1 rounded-full', s === 1 ? 'bg-cobalt-500' : s === 2 ? 'bg-cobalt-300' : 'bg-cobalt-50')} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">Jour 27 / 45</span>
          <span className="text-muted">Shenzhen → Douala</span>
        </div>
      </div>
    </div>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className={cn('font-display text-lg font-semibold transition-colors', isOpen ? 'text-cobalt-500' : 'text-ink')}>{item.q}</span>
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-full border transition-all', isOpen ? 'border-cobalt-500 bg-cobalt-500 text-white' : 'border-line text-ink')}>
                {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
              </span>
            </button>
            <div className={cn('grid transition-all duration-300 ease-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STEPS = [
  { icon: ClipboardList, title: 'Devis & réservation', text: 'Vous décrivez la marchandise, nous proposons le meilleur mode et réservons l’espace.' },
  { icon: Warehouse, title: 'Réception en Chine', text: 'Vos fournisseurs livrent au point de réception : pointage, photos, consolidation.' },
  { icon: Ship, title: 'Transport & suivi', text: 'Départ par mer ou par air, avec un numéro unique pour suivre chaque jour du trajet.' },
  { icon: Truck, title: 'Douane & livraison', text: 'Dédouanement à l’arrivée puis livraison au port, à l’aéroport ou à votre porte.' },
];

const REASONS = [
  { icon: Route, title: 'Un numéro, tout le trajet', text: 'Du pointage en Chine jusqu’à la livraison, le même numéro de suivi et le même interlocuteur.' },
  { icon: Receipt, title: 'Frais affichés clairement', text: 'Assurance et taxes d’importation apparaissent sur votre suivi, avec leur statut payé ou non.' },
  { icon: Languages, title: 'Équipe francophone', text: 'Nous échangeons avec vos fournisseurs en Chine et avec vous en français, par WhatsApp ou e-mail.' },
  { icon: Landmark, title: 'Pays enclavés compris', text: 'Tchad, Centrafrique, Mali, Burkina, Niger, Ouganda… le suivi continue après le port.' },
];

const HIGHLIGHT_DESTINATIONS = ['CM', 'NG', 'CI', 'SN', 'GA', 'CG', 'CD', 'BJ', 'TG', 'GH', 'GN', 'TD', 'CF', 'ML', 'BF', 'KE'];

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const whatsapp = settings.whatsapp_phone || settings.site_phone;

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    const n = normalizeTrackingNumber(trackingNumber);
    if (n) navigate(`/track?tracking=${encodeURIComponent(n)}`);
  };

  const stats = [
    { value: `${AFRICAN_COUNTRY_COUNT}`, label: 'pays africains desservis' },
    { value: '2', label: 'modes : mer & air' },
    { value: '5', label: 'étapes de suivi' },
    { value: '24/7', label: 'suivi en ligne' },
  ];

  return (
    <>
      <SEO />

      {/* Héros */}
      <section className="relative overflow-hidden bg-white">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]" />
        <div className="pointer-events-none absolute -top-56 -left-40 size-[620px] rounded-full bg-cobalt-100/70 blur-3xl" />

        <div className="container-x relative grid items-center gap-14 pt-14 pb-24 sm:pt-20 lg:grid-cols-12 lg:pb-32">
          <div className="lg:col-span-7">
            <span className="eyebrow animate-rise">Transitaire Chine ⇄ Afrique</span>
            <h1 className="mt-5 animate-rise font-display text-[2.7rem] leading-[1.02] font-extrabold text-ink [animation-delay:80ms] sm:text-[4.4rem]">
              De la Chine à l'Afrique, chaque colis suit sa{' '}
              <span className="relative whitespace-nowrap text-cobalt-500">
                route
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 9 C 50 2, 150 2, 198 7" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-7 max-w-xl animate-rise text-lg leading-relaxed text-muted [animation-delay:160ms]">
              Fret maritime et aérien, groupage, réception chez vos fournisseurs et dédouanement. Vous suivez votre marchandise
              jour après jour, jusqu'à la livraison.
            </p>

            <form onSubmit={handleTrack} className="mt-9 max-w-xl animate-rise [animation-delay:240ms]">
              <div className="flex flex-col gap-2 rounded-[16px] border border-line bg-white p-2 shadow-[0_24px_50px_-30px_rgba(10,27,77,0.4)] sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cobalt-300" />
                  <input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="N° de suivi : AFC-XXXX-XXXX"
                    aria-label="Numéro de suivi"
                    className="h-12 w-full rounded-[10px] bg-transparent pr-4 pl-12 font-mono text-[15px] text-ink placeholder:font-sans placeholder:text-muted/70 focus:outline-none"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Suivre le colis <ArrowRight className="size-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 flex animate-rise flex-wrap items-center gap-x-6 gap-y-3 [animation-delay:320ms]">
              <Link to="/contact#devis" className="inline-flex items-center gap-1.5 font-semibold text-cobalt-600 hover:underline">
                Demander un devis <ArrowUpRight className="size-4" />
              </Link>
              {['Suivi jour par jour', 'Maritime & aérien', 'Dédouanement'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-sm text-muted">
                  <CircleCheck className="size-4 text-cobalt-500" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Chiffres (capacités réelles du service) */}
      <section className="bg-cobalt-500 text-white">
        <div className="container-x grid grid-cols-2 divide-white/15 py-10 md:grid-cols-4 md:divide-x">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="px-4 py-4 text-center md:py-2">
              <div className="font-display text-4xl font-extrabold sm:text-5xl">{s.value}</div>
              <div className="mt-1 font-mono text-[11px] tracking-[0.16em] text-cobalt-100 uppercase">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-24 sm:py-28">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal className="max-w-2xl">
              <span className="eyebrow">01 — Nos services</span>
              <h2 className="section-title mt-4">Tout le transport, un seul interlocuteur.</h2>
            </Reveal>
            <Link to="/services" className="btn btn-outline self-start md:self-auto">
              Tous les services <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 90}>
                <Link
                  to={`/services#${s.id}`}
                  className="group card relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-cobalt-300 hover:shadow-[0_24px_50px_-30px_rgba(23,71,230,0.55)]"
                >
                  <div className="relative h-48 overflow-hidden bg-cobalt-100">
                    <Photo
                      name={s.image}
                      alt={s.title}
                      maxWidth={800}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                    <span className="absolute top-4 right-4 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[11px] font-semibold text-ink backdrop-blur">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-7 pb-7">
                    <span className="relative -mt-7 grid size-14 place-items-center rounded-[14px] border-4 border-white bg-cobalt-500 text-white shadow-[0_12px_24px_-12px_rgba(23,71,230,0.9)]">
                      <s.icon className="size-6" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-bold text-ink">{s.title}</h3>
                    <p className="mt-2.5 flex-1 leading-relaxed text-muted">{s.short}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                      <span className="font-mono text-xs text-cobalt-600">{s.lead ? `Délai indicatif · ${s.lead}` : 'Sur mesure'}</span>
                      <ArrowUpRight className="size-5 text-cobalt-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cobalt-500" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="relative overflow-hidden bg-cobalt-50 py-24 sm:py-28">
        <div className="container-x relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">02 — Comment ça marche</span>
            <h2 className="section-title mt-4">Quatre étapes, zéro zone d'ombre.</h2>
            <p className="section-lead mt-4">Du devis à la livraison, vous savez toujours qui s'occupe de votre marchandise et où elle se trouve.</p>
          </Reveal>

          <div className="relative mt-16 grid gap-6 md:grid-cols-4">
            <div className="absolute top-8 right-[12%] left-[12%] hidden border-t-2 border-dashed border-cobalt-200 md:block" />
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 110} className="relative text-center">
                <div className="relative mx-auto grid size-16 place-items-center rounded-full border-4 border-cobalt-50 bg-cobalt-500 text-white shadow-[0_12px_30px_-12px_rgba(23,71,230,0.8)]">
                  <step.icon className="size-7" strokeWidth={1.75} />
                  <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-white font-mono text-[10px] font-bold text-cobalt-600 shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-ink">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-muted">{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi nous */}
      <section className="py-24 sm:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <span className="eyebrow">03 — Pourquoi {settings.company_name}</span>
              <h2 className="section-title mt-4">La logistique, mais lisible.</h2>
              <p className="section-lead mt-5">
                Importer depuis la Chine ne devrait pas être un pari. Nous rendons chaque étape visible, chaque frais explicite, et
                nous restons joignables du départ à l'arrivée.
              </p>
              <Link to="/about" className="btn btn-primary mt-8">
                Découvrir notre approche <ArrowRight className="size-4" />
              </Link>
              <figure className="relative mt-10 overflow-hidden rounded-[22px] bg-cobalt-100">
                <Photo
                  name="picking"
                  alt="Préparation de colis en entrepôt"
                  maxWidth={1200}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <figcaption className="absolute right-5 bottom-5 left-5 text-sm font-semibold text-white">
                  Chaque colis est pointé et photographié à sa réception en Chine.
                </figcaption>
              </figure>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {REASONS.map((r, i) => (
              <Reveal key={r.title} delay={(i % 2) * 90} className="card p-7">
                <r.icon className="size-8 text-cobalt-500" strokeWidth={1.6} />
                <h3 className="mt-6 font-display text-lg font-bold text-ink">{r.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{r.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="relative overflow-hidden bg-ink py-24 text-white sm:py-28">
        <Photo name="containerTerminal" sizes="100vw" className="pointer-events-none absolute inset-0 size-full object-cover opacity-25 mix-blend-luminosity" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="bg-grid-light pointer-events-none absolute inset-0 opacity-60" />
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow eyebrow-light">04 — Destinations</span>
            <h2 className="mt-4 font-display text-[2rem] leading-[1.1] font-bold sm:text-[2.6rem]">
              {AFRICAN_COUNTRY_COUNT} pays africains, ports et corridors compris.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-cobalt-100">
              Départs depuis les grands ports et aéroports chinois, arrivées dans les ports africains, puis acheminement terrestre
              vers les pays enclavés.
            </p>
            <Link to="/network" className="btn btn-white mt-8">
              Voir le réseau <Globe2 className="size-4" />
            </Link>
          </Reveal>
          <Reveal delay={120} className="flex flex-wrap gap-2.5">
            {HIGHLIGHT_DESTINATIONS.map((code) => {
              const c = COUNTRIES.find((x) => x.code === code);
              return c ? (
                <span key={code} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm">
                  <span className="text-base leading-none">{flag(code)}</span>
                  {c.name}
                </span>
              ) : null;
            })}
            <Link to="/network" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-cobalt-600">
              + {AFRICAN_COUNTRY_COUNT - HIGHLIGHT_DESTINATIONS.length} autres
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <span className="eyebrow">05 — Questions fréquentes</span>
            <h2 className="section-title mt-4">Vous vous demandez…</h2>
            <p className="section-lead mt-5">Une autre question ? Notre équipe vous répond rapidement.</p>
            <Link to="/contact" className="mt-6 inline-flex items-center gap-2 font-semibold text-cobalt-600 hover:underline">
              Contacter le support <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-8">
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="pb-24">
        <div className="container-x">
          <Reveal className="relative overflow-hidden rounded-[28px] bg-cobalt-500 px-6 py-14 text-white sm:px-14 sm:py-16">
            <Photo name="plane" sizes="100vw" className="pointer-events-none absolute inset-0 size-full object-cover opacity-30 mix-blend-luminosity" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cobalt-500 via-cobalt-500/80 to-cobalt-500/30" />
            <div className="bg-grid-light pointer-events-none absolute inset-0" />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <BadgeCheck className="size-9 text-cobalt-200" strokeWidth={1.6} />
                <h2 className="mt-4 font-display text-3xl leading-tight font-bold sm:text-4xl">Une marchandise à faire venir de Chine ?</h2>
                <p className="mt-3 text-lg text-cobalt-100">Décrivez-nous votre envoi : nous revenons vers vous avec un devis clair.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact#devis" className="btn btn-white">
                  Demander un devis <ArrowRight className="size-4" />
                </Link>
                {whatsapp && (
                  <a href={whatsappLink(whatsapp, 'Bonjour, je souhaite un devis pour une expédition depuis la Chine.')} target="_blank" rel="noreferrer" className="btn btn-ghost-white">
                    <WhatsAppIcon className="size-5" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
