import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react';
import SEO from '../components/SEO';
import Photo from '../components/ui/Photo';
import { ARTICLES, getArticle, type Block } from '../data/blog';
import { formatDate } from '../lib/format';

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case 'h2':
      return <h2 key={i}>{block.text}</h2>;
    case 'h3':
      return <h3 key={i}>{block.text}</h3>;
    case 'p':
      return <p key={i}>{block.text}</p>;
    case 'ul':
      return (
        <ul key={i}>
          {block.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
  }
}

export default function BlogPost() {
  const { slug } = useParams();
  const article = getArticle(slug);
  if (!article) return <Navigate to="/blog" replace />;

  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <SEO />
      <article>
        <header className="relative overflow-hidden border-b border-line">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="container-x relative max-w-4xl py-14 sm:py-20">
            <Link to="/blog" className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted uppercase hover:text-cobalt-500">
              <ArrowLeft className="size-4" /> Tous les articles
            </Link>
            <span className="mt-8 block">
              <span className="rounded-full bg-cobalt-50 px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-cobalt-600 uppercase">{article.category}</span>
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] font-extrabold text-ink sm:text-5xl">{article.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">{article.excerpt}</p>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted">
              <Clock3 className="size-4" /> {article.readingMinutes} min de lecture · {formatDate(article.date)}
            </p>
          </div>
        </header>

        <div className="container-x pt-10">
          <Photo
            name={article.cover}
            alt=""
            priority
            sizes="100vw"
            className="aspect-[16/9] w-full sm:aspect-[21/9] xl:aspect-[3/1] rounded-[22px] bg-cobalt-100 object-cover"
          />
        </div>

        <div className="container-x grid gap-12 py-14 lg:grid-cols-[minmax(0,860px)_340px] lg:justify-between">
          <div className="prose-article text-[17px]">{article.body.map(renderBlock)}</div>
          <aside>
            <div className="sticky top-28 rounded-[20px] bg-cobalt-500 p-7 text-white">
              <p className="font-display text-xl font-bold">Un projet d'import ?</p>
              <p className="mt-2 text-cobalt-100">Nous préparons votre devis et vérifions vos documents avant le départ.</p>
              <Link to="/contact#devis" className="btn btn-white mt-6 w-full">
                Demander un devis <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </article>

      <section className="border-t border-line bg-cobalt-50 py-16">
        <div className="container-x">
          <h2 className="font-display text-2xl font-bold text-ink">À lire aussi</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {related.map((a) => (
              <Link key={a.slug} to={`/blog/${a.slug}`} className="card group flex items-center gap-5 p-4 transition hover:border-cobalt-300">
                <Photo name={a.cover} alt="" maxWidth={480} sizes="128px" className="size-24 shrink-0 rounded-[14px] bg-cobalt-100 object-cover sm:size-28" />
                <div>
                  <span className="font-mono text-[11px] tracking-[0.12em] text-cobalt-600 uppercase">{a.category}</span>
                  <h3 className="mt-2 font-display text-lg leading-snug font-bold text-ink group-hover:text-cobalt-600">{a.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
