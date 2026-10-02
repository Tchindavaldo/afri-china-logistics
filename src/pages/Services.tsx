import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Plane, Ship } from 'lucide-react';
import SEO from '../components/SEO';
import PageHero from '../components/layout/PageHero';
import Reveal from '../components/ui/Reveal';
import Photo from '../components/ui/Photo';
import { SERVICES } from '../data/services';
import { cn } from '../lib/format';

const COMPARISON = [
  { label: 'Délai indicatif', sea: '35 à 60 jours', air: '3 à 7 jours' },
  { label: 'Coût', sea: 'Le plus économique au m³', air: 'Facturé au kilo' },
  { label: 'Idéal pour', sea: 'Gros volumes, mobilier, matériaux', air: 'Urgences, petits colis de valeur' },
  { label: 'Unité', sea: 'Groupage (m³) ou conteneur', air: 'Poids réel ou volumétrique' },
  { label: 'Suivi', sea: 'Jour par jour, port par port', air: 'Jour par jour, vol suivi' },
];

export default function Services() {
  return (
    <>
      <SEO />
      <PageHero
        eyebrow="Services"
        crumbs={['Services']}
        title={
          <>
            Du fournisseur chinois <span className="text-cobalt-500">à votre porte.</span>
          </>
        }
        lead="Six services pensés pour s'enchaîner : vous pouvez nous confier tout le trajet ou seulement une étape."
        aside={
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="card flex items-center gap-3 p-3.5 text-sm font-semibold text-ink transition hover:border-cobalt-300 hover:text-cobalt-600">
                <s.icon className="size-5 shrink-0 text-cobalt-500" />
                <span className="leading-tight">{s.title}</span>
              </a>
            ))}
          </div>
        }
      />

      <section className="py-20 sm:py-24">
        <div className="container-x space-y-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id}>
              <article id={s.id} className="group card scroll-mt-28 overflow-hidden">
                <div className="relative h-52 overflow-hidden bg-cobalt-100 sm:h-64">
                  <Photo
                    name={s.image}
                    alt={s.title}
                    sizes="100vw"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/25 to-transparent" />
                  <div className="absolute bottom-6 left-7 flex items-center gap-4 sm:left-10">
                    <span className="grid size-14 place-items-center rounded-[14px] bg-cobalt-500 text-white shadow-[0_12px_30px_-10px_rgba(23,71,230,0.9)]">
                      <s.icon className="size-7" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-xs tracking-[0.18em] text-white/85">SERVICE {String(i + 1).padStart(2, '0')}</span>
                  </div>
                </div>
                <div className="grid lg:grid-cols-12">
                  <div className={cn('p-7 sm:p-10 lg:col-span-7', i % 2 === 1 && 'lg:order-2')}>
                    <h2 className="font-display text-3xl font-bold text-ink">{s.title}</h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted">{s.description}</p>
                    {s.lead && (
                      <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-cobalt-50 px-4 py-2 font-mono text-xs font-medium text-cobalt-700">
                        <Clock3 className="size-4" /> Délai indicatif : {s.lead}
                      </p>
                    )}
                  </div>
                  <div className={cn('border-t border-line bg-cobalt-50/60 p-7 sm:p-10 lg:col-span-5 lg:border-t-0', i % 2 === 1 ? 'lg:order-1 lg:border-r' : 'lg:border-l')}>
                    <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Inclus</p>
                    <ul className="mt-5 space-y-4">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-ink">
                          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-cobalt-500 shadow-sm">
                            <Check className="size-3.5" strokeWidth={3} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/contact#devis" className="btn btn-primary mt-8 w-full sm:w-auto">
                      Demander un devis <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-cobalt-50 py-20 sm:py-24">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Comparatif</span>
            <h2 className="section-title mt-4">Maritime ou aérien ?</h2>
            <p className="section-lead mt-4">Le bon mode dépend du délai, du volume et de la valeur de votre marchandise.</p>
          </Reveal>
          <Reveal delay={100} className="mt-10 overflow-hidden rounded-[18px] border border-line bg-white">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-line bg-white text-sm font-semibold sm:text-base">
              <div className="p-4 sm:p-5" />
              <div className="flex items-center gap-2 border-l border-line p-4 text-cobalt-600 sm:p-5">
                <Ship className="size-5" /> Maritime
              </div>
              <div className="flex items-center gap-2 border-l border-line p-4 text-cobalt-600 sm:p-5">
                <Plane className="size-5" /> Aérien
              </div>
            </div>
            {COMPARISON.map((row) => (
              <div key={row.label} className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-line text-sm last:border-0 sm:text-[15px]">
                <div className="p-4 font-mono text-[11px] tracking-[0.12em] text-muted uppercase sm:p-5">{row.label}</div>
                <div className="border-l border-line p-4 text-ink sm:p-5">{row.sea}</div>
                <div className="border-l border-line p-4 text-ink sm:p-5">{row.air}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
