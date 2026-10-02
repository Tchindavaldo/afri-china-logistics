import { Link } from 'react-router-dom';
import { Anchor, ArrowRight, Factory, Plane, Truck } from 'lucide-react';
import SEO from '../components/SEO';
import PageHero from '../components/layout/PageHero';
import Reveal from '../components/ui/Reveal';
import Photo from '../components/ui/Photo';
import { AFRICA_NETWORK, CHINA_ORIGINS } from '../data/network';
import { COUNTRIES, flag } from '../lib/countries';

const OTHER_REGIONS = ['Europe', 'Amériques', 'Asie'] as const;

export default function Network() {
  const landlocked = AFRICA_NETWORK.flatMap((r) => r.gateways).filter((g) => g.corridor);

  return (
    <>
      <SEO />
      <PageHero
        eyebrow="Réseau"
        crumbs={['Réseau']}
        image="worldMap"
        imageAlt="Carte du monde"
        imageCaption="Chine ⇄ Afrique"
        title={
          <>
            Des ports chinois <span className="text-cobalt-500">aux villes africaines.</span>
          </>
        }
        lead="Nous organisons les départs depuis les principaux ports et aéroports de Chine, puis l'arrivée dans les ports africains et l'acheminement terrestre."
      />

      {/* Origines */}
      <section className="py-20 sm:py-24">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Au départ de la Chine</span>
            <h2 className="section-title mt-4">Points de départ.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: Anchor, title: 'Ports maritimes', items: CHINA_ORIGINS.ports, image: 'portAerial' as const },
              { icon: Plane, title: 'Aéroports cargo', items: CHINA_ORIGINS.airports, image: 'plane' as const },
              { icon: Factory, title: 'Bassins fournisseurs', items: CHINA_ORIGINS.hubs, image: 'warehouse' as const },
            ].map((col, i) => (
              <Reveal key={col.title} delay={i * 90} className="card overflow-hidden">
                <Photo
                  name={col.image}
                  alt={col.title}
                  maxWidth={800}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="h-40 w-full bg-cobalt-100 object-cover"
                />
                <div className="p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-cobalt-50 text-cobalt-500">
                      <col.icon className="size-5" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink">{col.title}</h3>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {col.items.map((it) => (
                      <li key={it} className="flex items-center gap-3 text-ink">
                        <span className="size-1.5 bg-cobalt-500" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations africaines */}
      <section className="bg-cobalt-50 py-20 sm:py-24">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">À l'arrivée en Afrique</span>
            <h2 className="section-title mt-4">Ports d'arrivée par région.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {AFRICA_NETWORK.map((region, i) => (
              <Reveal key={region.name} delay={(i % 2) * 90} className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-6 py-4">
                  <h3 className="font-display text-lg font-bold text-ink">{region.name}</h3>
                  <span className="font-mono text-xs text-muted">{region.gateways.length} pays</span>
                </div>
                <ul className="divide-y divide-line">
                  {region.gateways.map((g) => {
                    const c = COUNTRIES.find((x) => x.code === g.code);
                    return (
                      <li key={g.code} className="flex items-center justify-between gap-4 px-6 py-3.5 text-[15px]">
                        <span className="flex items-center gap-3 font-semibold text-ink">
                          <span className="text-lg leading-none">{flag(g.code)}</span>
                          {c?.name}
                        </span>
                        <span className="text-right text-sm text-muted">
                          {g.corridor ? (
                            <span className="inline-flex items-center gap-1.5 text-cobalt-600">
                              <Truck className="size-4" /> {g.corridor}
                            </span>
                          ) : (
                            g.port
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Corridors */}
      <section className="py-20 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow">Pays enclavés</span>
            <h2 className="section-title mt-4">Le suivi ne s'arrête pas au port.</h2>
            <p className="section-lead mt-5">
              Pour les pays sans façade maritime, le conteneur poursuit par la route ou le rail. Sur le globe de suivi, le navire
              s'amarre et un camion prend le relais jusqu'à destination.
            </p>
            <div className="relative mt-8 overflow-hidden rounded-[22px] bg-cobalt-100">
              <Photo
                name="truck"
                alt="Transport routier de marchandises"
                maxWidth={1200}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[16/10] w-full object-cover"
              />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-ink uppercase backdrop-blur">
                <Truck className="size-3.5 text-cobalt-500" /> Port → destination finale
              </span>
            </div>
          </Reveal>
          <Reveal delay={100} className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {landlocked.map((g) => (
              <div key={g.code} className="card flex items-center gap-4 p-4">
                <span className="text-2xl leading-none">{flag(g.code)}</span>
                <div>
                  <p className="font-semibold text-ink">{COUNTRIES.find((c) => c.code === g.code)?.name}</p>
                  <p className="font-mono text-xs text-cobalt-600">{g.corridor}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Autres destinations */}
      <section className="pb-24">
        <div className="container-x">
          <Reveal className="rounded-[22px] border border-line p-7 sm:p-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">Et au-delà de l'Afrique</h2>
                <p className="mt-2 text-muted">Nous traitons aussi des envois vers l'Europe, les Amériques et le reste de l'Asie.</p>
              </div>
              <Link to="/contact#devis" className="btn btn-primary self-start">
                Demander un devis <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {COUNTRIES.filter((c) => (OTHER_REGIONS as readonly string[]).includes(c.region)).map((c) => (
                <span key={c.code} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink">
                  <span className="leading-none">{flag(c.code)}</span> {c.name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
