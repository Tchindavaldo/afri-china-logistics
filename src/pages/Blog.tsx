import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import SEO from '../components/SEO';
import PageHero from '../components/layout/PageHero';
import Reveal from '../components/ui/Reveal';
import Photo from '../components/ui/Photo';
import { ARTICLES } from '../data/blog';
import { formatDate } from '../lib/format';

export default function Blog() {
  const [featured, ...others] = ARTICLES;

  return (
    <>
      <SEO />
      <PageHero
        eyebrow="Blog"
        crumbs={['Blog']}
        image="workspace"
        imageAlt="Poste de travail avec ordinateur portable"
        imageCaption="Guides import"
        title={
          <>
            Importer de Chine, <span className="text-cobalt-500">sans mauvaise surprise.</span>
          </>
        }
        lead="Guides pratiques, douane et transport : l'essentiel à savoir avant votre prochaine commande."
      />

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <Link to={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-[22px] bg-cobalt-500 text-white lg:grid-cols-2">
              <div className="relative min-h-[260px] overflow-hidden">
                <Photo
                  name={featured.cover}
                  alt=""
                  maxWidth={1200}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cobalt-500/60" />
                <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-3 py-1 font-mono text-[11px] font-semibold text-ink backdrop-blur">01</span>
              </div>
              <div className="p-8 sm:p-12">
                <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] tracking-[0.14em] uppercase">À la une · {featured.category}</span>
                <h2 className="mt-6 font-display text-3xl leading-tight font-bold">{featured.title}</h2>
                <p className="mt-4 text-cobalt-100">{featured.excerpt}</p>
                <div className="mt-8 flex items-center justify-between text-sm text-cobalt-100">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="size-4" /> {featured.readingMinutes} min · {formatDate(featured.date)}
                  </span>
                  <ArrowUpRight className="size-6 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          </Reveal>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {others.map((a, i) => (
              <Reveal key={a.slug} delay={i * 90}>
                <Link to={`/blog/${a.slug}`} className="group card flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-cobalt-300">
                  <div className="h-44 overflow-hidden bg-cobalt-100">
                    <Photo
                      name={a.cover}
                      alt=""
                      maxWidth={800}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-cobalt-50 px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-cobalt-600 uppercase">{a.category}</span>
                      <span className="font-mono text-xs text-muted">{String(i + 2).padStart(2, '0')}</span>
                    </div>
                    <h3 className="mt-6 flex-1 font-display text-xl leading-snug font-bold text-ink group-hover:text-cobalt-600">{a.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">{a.excerpt}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
                      <span>{a.readingMinutes} min de lecture</span>
                      <ArrowUpRight className="size-5 text-cobalt-300 transition group-hover:text-cobalt-500" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
