import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Handshake, MessagesSquare, ShieldCheck, Timer, Waypoints } from 'lucide-react';
import SEO from '../components/SEO';
import PageHero from '../components/layout/PageHero';
import Reveal from '../components/ui/Reveal';
import Photo from '../components/ui/Photo';
import { useSiteSettings } from '../context/settings-context';

const VALUES = [
  { icon: Eye, title: 'Transparence', text: 'Étapes, délais, assurance et taxes : tout ce qui concerne votre envoi est visible sur votre suivi.' },
  { icon: Timer, title: 'Réactivité', text: 'Une question sur votre colis ? Une réponse rapide, par WhatsApp, téléphone ou e-mail.' },
  { icon: ShieldCheck, title: 'Fiabilité', text: 'Documents vérifiés avant le départ, marchandise pointée et photographiée à la réception.' },
  { icon: Handshake, title: 'Proximité', text: 'Une équipe qui connaît les réalités des ports africains et les attentes des importateurs.' },
];

const COMMITMENTS = [
  'Un devis écrit et détaillé avant chaque expédition',
  'Un numéro de suivi unique, actif dès l’enregistrement',
  'Des photos de votre marchandise à la réception en Chine',
  'Un interlocuteur identifié jusqu’à la livraison',
  'Les frais d’assurance et de douane affichés clairement',
  'Un accompagnement jusqu’aux pays sans façade maritime',
];

export default function About() {
  const { settings } = useSiteSettings();

  return (
    <>
      <SEO />
      <PageHero
        eyebrow="À propos"
        crumbs={['À propos']}
        image="containerTerminal"
        imageAlt="Terminal à conteneurs"
        imageCaption="Chine ⇄ Afrique"
        title={
          <>
            Relier deux continents, <span className="text-cobalt-500">simplement.</span>
          </>
        }
        lead={
          settings.company_description ||
          `${settings.company_name} accompagne les importateurs, commerçants et entreprises qui font venir leurs marchandises de Chine vers l'Afrique.`
        }
      />

      <section className="py-20 sm:py-24">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow">Notre mission</span>
            <h2 className="section-title mt-4">Rendre l'import depuis la Chine prévisible.</h2>
            <div className="mt-10 grid grid-cols-5 gap-3">
              <Photo
                name="warehouse"
                alt="Entrepôt de réception"
                maxWidth={800}
                sizes="(min-width: 1024px) 25vw, 60vw"
                className="col-span-3 aspect-[3/4] h-full w-full rounded-[18px] object-cover"
              />
              <div className="col-span-2 flex flex-col gap-3">
                <Photo
                  name="parcels"
                  alt="Colis prêts au départ"
                  maxWidth={480}
                  sizes="(min-width: 1024px) 16vw, 40vw"
                  className="aspect-square w-full rounded-[18px] object-cover"
                />
                <div className="flex flex-1 flex-col justify-end rounded-[18px] bg-cobalt-500 p-4 text-white">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-cobalt-100 uppercase">Suivi</span>
                  <span className="mt-1 font-display text-xl leading-tight font-bold">Jour par jour</span>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} className="space-y-5 text-lg leading-relaxed text-muted lg:col-span-7">
            <p>
              Commander en Chine est devenu facile. Faire arriver la marchandise à bon port, au bon prix et sans mauvaise surprise
              l'est beaucoup moins : fournisseurs multiples, documents, transbordements, passage en douane, acheminement vers
              l'intérieur des terres…
            </p>
            <p>
              Notre rôle est de prendre en charge cette chaîne de bout en bout et de vous la rendre <strong className="text-ink">visible</strong>.
              Chaque expédition reçoit un numéro de suivi : vous voyez l'étape en cours, les jours restants et le trajet sur un globe,
              où que vous soyez.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cobalt-50 py-20 sm:py-24">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Nos valeurs</span>
            <h2 className="section-title mt-4">Ce qui guide chaque expédition.</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80} className="card p-7">
                <v.icon className="size-8 text-cobalt-500" strokeWidth={1.6} />
                <h3 className="mt-6 font-display text-lg font-bold text-ink">{v.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-x grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Nos engagements</span>
            <h2 className="section-title mt-4">Ce sur quoi vous pouvez compter.</h2>
            <p className="section-lead mt-4">Des engagements concrets, vérifiables à chaque expédition.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact#devis" className="btn btn-primary">
                Demander un devis <ArrowRight className="size-4" />
              </Link>
              <Link to="/track" className="btn btn-outline">
                Suivre un colis
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ol className="card divide-y divide-line">
              {COMMITMENTS.map((c, i) => (
                <li key={c} className="flex items-center gap-5 p-5">
                  <span className="font-mono text-sm font-semibold text-cobalt-500">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-medium text-ink">{c}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-x">
          <Reveal className="grid gap-5 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-[22px] bg-cobalt-500 p-8 text-white sm:p-10">
              <Photo name="truck" sizes="(min-width: 768px) 50vw, 100vw" maxWidth={1200} className="pointer-events-none absolute inset-0 size-full object-cover opacity-30 mix-blend-luminosity" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cobalt-500 via-cobalt-500/85 to-cobalt-500/40" />
              <div className="relative">
                <Waypoints className="size-9 text-cobalt-200" strokeWidth={1.6} />
                <h3 className="mt-6 font-display text-2xl font-bold">Un réseau de corridors</h3>
                <p className="mt-3 text-cobalt-100">Ports d'Afrique de l'Ouest, centrale, de l'Est et du Nord, et routes terrestres vers les pays enclavés.</p>
                <Link to="/network" className="mt-6 inline-flex items-center gap-2 font-semibold hover:underline">
                  Voir le réseau <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[22px] bg-ink p-8 text-white sm:p-10">
              <Photo name="contactDesk" sizes="(min-width: 768px) 50vw, 100vw" maxWidth={1200} className="pointer-events-none absolute inset-0 size-full object-cover opacity-25 mix-blend-luminosity" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink via-ink/85 to-ink/40" />
              <div className="relative">
                <MessagesSquare className="size-9 text-cobalt-300" strokeWidth={1.6} />
                <h3 className="mt-6 font-display text-2xl font-bold">Parlons de votre projet</h3>
                <p className="mt-3 text-cobalt-100">Premier import, réassort régulier ou conteneur complet : nous adaptons la solution.</p>
                <Link to="/contact" className="mt-6 inline-flex items-center gap-2 font-semibold hover:underline">
                  Nous contacter <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
