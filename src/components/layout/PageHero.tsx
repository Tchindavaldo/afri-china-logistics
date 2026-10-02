import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Photo from '../ui/Photo';
import type { PhotoName } from '../../lib/images';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Fil d'Ariane : dernier élément = page courante. */
  crumbs: string[];
  aside?: ReactNode;
  /** Photo encadrée à droite (ignorée si `aside` est fourni). */
  image?: PhotoName;
  imageAlt?: string;
  /** Petite étiquette posée sur la photo. */
  imageCaption?: string;
  children?: ReactNode;
}

/** En-tête des pages intérieures : blanc, quadrillé, typographie forte, photo encadrée. */
export default function PageHero({ eyebrow, title, lead, crumbs, aside, image, imageAlt = '', imageCaption, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white" data-print-hide>
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-cobalt-100/60 blur-3xl" />

      <div className="container-x relative py-14 sm:py-20">
        <nav aria-label="Fil d'Ariane" className="mb-8 flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
          <Link to="/" className="hover:text-cobalt-500">Accueil</Link>
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-2">
              <span className="text-cobalt-300">/</span>
              <span className={i === crumbs.length - 1 ? 'text-cobalt-500' : ''}>{c}</span>
            </span>
          ))}
        </nav>

        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="mt-4 font-display text-[2.4rem] leading-[1.05] font-extrabold text-ink sm:text-6xl">{title}</h1>
            {lead && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>}
            {children}
          </div>
          {aside ? (
            <div className="lg:col-span-5">{aside}</div>
          ) : (
            image && (
              <div className="relative mr-3 mb-3 lg:col-span-5">
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[24px] bg-cobalt-500" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-[24px] bg-cobalt-100">
                  <Photo
                    name={image}
                    alt={imageAlt}
                    priority
                    maxWidth={1200}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="aspect-[16/10] w-full object-cover lg:aspect-[4/3]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-cobalt-500/10" />
                  {imageCaption && (
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 font-mono text-[11px] font-medium tracking-[0.14em] text-ink uppercase backdrop-blur">
                      <span className="size-1.5 rounded-full bg-cobalt-500" /> {imageCaption}
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
