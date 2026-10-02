import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, SITE_URL } from '../lib/site';
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  findPage,
  fullTitle,
  OG_IMAGE_ALT,
  ogImage,
  pageJsonLd,
} from '../lib/seo';

interface SEOProps {
  /** Par défaut : les métadonnées de la page dans `lib/seo.ts`. */
  title?: string;
  description?: string;
  noindex?: boolean;
}

const SITE = { url: SITE_URL, name: SITE_NAME };

function setMeta(attr: 'name' | 'property', key: string, content: string | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Met à jour titre, description, canonical, Open Graph, Twitter et données
 * structurées à chaque page. Les mêmes balises sont écrites dans le HTML de
 * chaque route au build (voir `vite.config.ts`).
 */
export default function SEO({ title, description, noindex = false }: SEOProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = noindex ? undefined : findPage(pathname);
    const t = fullTitle(title ?? page?.title ?? SITE_NAME, SITE);
    const desc = description ?? page?.description ?? DEFAULT_DESCRIPTION;
    const url = absoluteUrl(page?.path ?? pathname, SITE);
    const image = ogImage(page, SITE);
    const isArticle = page?.type === 'article';

    document.title = t;
    setMeta('name', 'description', desc);
    setMeta('name', 'keywords', page?.keywords ?? DEFAULT_KEYWORDS);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    setLink('canonical', url);
    setLink('alternate', url, 'fr');
    setLink('alternate', url, 'x-default');

    setMeta('property', 'og:type', isArticle ? 'article' : 'website');
    setMeta('property', 'og:title', t);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:image:alt', page?.imageAlt ?? OG_IMAGE_ALT);
    setMeta('property', 'article:published_time', isArticle ? page?.published : undefined);
    setMeta('property', 'article:section', isArticle ? page?.section : undefined);
    setMeta('name', 'twitter:title', t);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', image);

    // Données structurées de la page (l'organisation est gérée par OrganizationSchema).
    document.head.querySelectorAll('script[data-seo="page"]').forEach((s) => s.remove());
    for (const data of page ? pageJsonLd(page, SITE) : []) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seo = 'page';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    }
  }, [title, description, noindex, pathname]);

  return null;
}
