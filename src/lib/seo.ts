/**
 * Référencement : métadonnées de chaque page publique et données structurées
 * Schema.org. Fichier sans dépendance au navigateur : il sert à la fois au
 * composant <SEO> (navigation dans le site) et au build, qui écrit une page
 * HTML par route avec les bonnes balises (partage WhatsApp/Facebook, robots
 * qui n'exécutent pas le JavaScript) ainsi que le sitemap.
 */
import { ARTICLES } from '../data/blog';
import { FAQ } from '../data/faq';
import { photoUrl, type PhotoName } from './images';

export interface Site {
  url: string;
  name: string;
}

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  /** Photo de partage (sinon l'image de marque /og-image.png). */
  image?: PhotoName;
  imageAlt?: string;
  type?: 'website' | 'article';
  /** Fil d'Ariane (hors accueil). */
  crumbs?: { name: string; path: string }[];
  published?: string;
  section?: string;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: number;
}

export const DEFAULT_DESCRIPTION =
  "Transitaire Chine – Afrique : fret maritime et aérien, groupage, réception chez vos fournisseurs, dédouanement et suivi de colis en ligne.";

export const DEFAULT_KEYWORDS =
  'fret Chine Afrique, transitaire Chine Cameroun, groupage Chine, fret maritime Chine, fret aérien Chine, suivi colis, dédouanement, import Chine Afrique, conteneur Chine Douala';

export const OG_IMAGE_PATH = '/og-image.png';
export const OG_IMAGE_ALT = 'AFRICHINA LOGISTICS — Fret maritime et aérien Chine – Afrique';

const crumb = (name: string, path: string) => [{ name, path }];

export const STATIC_PAGES: PageMeta[] = [
  {
    path: '/',
    title: 'Fret maritime & aérien Chine ⇄ Afrique',
    description:
      'Transitaire Chine – Afrique : fret maritime et aérien, groupage, réception chez vos fournisseurs, dédouanement et suivi de colis jour par jour sur globe 3D.',
    changefreq: 'weekly',
    priority: 1,
  },
  {
    path: '/track',
    title: 'Suivre un colis',
    description:
      'Suivez votre expédition Chine ⇄ Afrique en temps réel : étape en cours, progression jour par jour et trajet sur globe 3D.',
    keywords: 'suivi colis Chine, suivi conteneur, tracking fret Chine Afrique, numéro de suivi, suivi expédition',
    image: 'earthNetwork',
    imageAlt: 'Suivi des expéditions dans le monde',
    crumbs: crumb('Suivi de colis', '/track'),
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    path: '/services',
    title: 'Services de fret Chine – Afrique',
    description:
      "Fret maritime (FCL, groupage), fret aérien, réception et consolidation en Chine, sourcing, dédouanement et livraison jusqu'aux pays enclavés.",
    keywords: 'fret maritime Chine, fret aérien Chine, groupage LCL, conteneur FCL, sourcing Chine, dédouanement Afrique, livraison pays enclavés',
    image: 'portAerial',
    imageAlt: 'Port à conteneurs',
    crumbs: crumb('Services', '/services'),
    changefreq: 'monthly',
    priority: 0.9,
  },
  {
    path: '/about',
    title: 'À propos',
    description: "Transitaire spécialisé entre la Chine et l'Afrique : notre mission, nos valeurs et nos engagements.",
    image: 'containerTerminal',
    imageAlt: 'Terminal à conteneurs',
    crumbs: crumb('À propos', '/about'),
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    path: '/network',
    title: 'Réseau & destinations',
    description:
      "Ports et aéroports de départ en Chine, ports d'arrivée en Afrique de l'Ouest, centrale, de l'Est et du Nord, et corridors vers les pays enclavés.",
    keywords: 'Guangzhou Douala, Shenzhen Abidjan, Shanghai Lomé, Yiwu, fret Chine Cameroun, fret Chine Côte d’Ivoire, fret Chine Tchad, pays enclavés',
    image: 'worldMap',
    imageAlt: 'Carte du monde',
    crumbs: crumb('Réseau', '/network'),
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    path: '/contact',
    title: 'Contact & devis',
    description: "Contactez-nous et demandez un devis pour votre expédition entre la Chine et l'Afrique.",
    keywords: 'devis fret Chine, contact transitaire, devis groupage Chine Afrique, tarif fret aérien Chine',
    image: 'contactDesk',
    imageAlt: 'Prise de contact',
    crumbs: crumb('Contact', '/contact'),
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/blog',
    title: 'Blog — Guides import Chine-Afrique',
    description:
      "Conseils pratiques pour importer de Chine vers l'Afrique : groupage, documents de douane, Incoterms, fret aérien ou maritime.",
    keywords: 'importer de Chine, guide import Chine Afrique, Incoterms, documents douane, groupage conseils',
    image: 'workspace',
    imageAlt: 'Guides import',
    crumbs: crumb('Blog', '/blog'),
    changefreq: 'weekly',
    priority: 0.7,
  },
  {
    path: '/terms-and-conditions',
    title: 'Conditions générales',
    description: 'Conditions applicables à nos prestations de transport et à l’utilisation du site.',
    image: 'documents',
    imageAlt: 'Documents contractuels',
    crumbs: crumb('Conditions générales', '/terms-and-conditions'),
    changefreq: 'yearly',
    priority: 0.3,
  },
];

export const ARTICLE_PAGES: PageMeta[] = ARTICLES.map((a) => ({
  path: `/blog/${a.slug}`,
  title: a.title,
  description: a.excerpt,
  image: a.cover,
  imageAlt: a.title,
  type: 'article',
  published: a.date,
  section: a.category,
  crumbs: [
    { name: 'Blog', path: '/blog' },
    { name: a.title, path: `/blog/${a.slug}` },
  ],
  changefreq: 'monthly',
  priority: 0.6,
}));

export const PUBLIC_PAGES: PageMeta[] = [...STATIC_PAGES, ...ARTICLE_PAGES];

export function findPage(pathname: string): PageMeta | undefined {
  const clean = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
  return PUBLIC_PAGES.find((p) => p.path === clean);
}

export function fullTitle(title: string, site: Site): string {
  return title.includes(site.name) ? title : `${title} | ${site.name}`;
}

export function absoluteUrl(path: string, site: Site): string {
  return path.startsWith('http') ? path : `${site.url}${path === '/' ? '/' : path}`;
}

/** Image de partage 1200×630 (format attendu par Facebook, WhatsApp, LinkedIn, X). */
export function ogImage(page: Pick<PageMeta, 'image'> | undefined, site: Site): string {
  return page?.image ? `${photoUrl(page.image, 1200)}&h=630` : absoluteUrl(OG_IMAGE_PATH, site);
}

// ---------------------------------------------------------------------------
// Données structurées (Schema.org) — uniquement des informations réelles.
// ---------------------------------------------------------------------------

type Json = Record<string, unknown>;

export function organizationJsonLd(site: Site, extra: Json = {}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    url: `${site.url}/`,
    logo: { '@type': 'ImageObject', url: `${site.url}/logo512x512.png`, width: 512, height: 512 },
    image: absoluteUrl(OG_IMAGE_PATH, site),
    description: "Transitaire spécialisé dans le fret maritime et aérien entre la Chine et l'Afrique.",
    areaServed: ['CN', 'CM', 'NG', 'CI', 'SN', 'GA', 'CG', 'CD', 'BJ', 'TG', 'GH', 'TD', 'CF', 'ML', 'BF', 'NE'],
    knowsLanguage: ['fr', 'en', 'zh'],
    ...extra,
  };
}

function websiteJsonLd(site: Site): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.name,
    url: `${site.url}/`,
    inLanguage: 'fr',
    publisher: { '@id': `${site.url}/#organization` },
    // Champ de recherche Google qui ouvre directement le suivi d'un colis.
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/track?tracking={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

function breadcrumbJsonLd(page: PageMeta, site: Site): Json {
  const items = [{ name: 'Accueil', path: '/' }, ...(page.crumbs ?? [])];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path, site),
    })),
  };
}

function faqJsonLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

const SERVICE_NAMES = [
  'Fret maritime',
  'Fret aérien',
  'Réception & consolidation',
  'Sourcing & contrôle fournisseurs',
  'Dédouanement & formalités',
  'Transport final & corridors',
];

function servicesJsonLd(site: Site): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Services',
    itemListElement: SERVICE_NAMES.map((name, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name,
        serviceType: 'Transport de marchandises',
        provider: { '@id': `${site.url}/#organization` },
        areaServed: [{ '@type': 'Country', name: 'Chine' }, { '@type': 'Continent', name: 'Afrique' }],
      },
    })),
  };
}

function articleJsonLd(page: PageMeta, site: Site): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.title,
    description: page.description,
    image: ogImage(page, site),
    datePublished: page.published,
    dateModified: page.published,
    articleSection: page.section,
    inLanguage: 'fr',
    mainEntityOfPage: absoluteUrl(page.path, site),
    author: { '@id': `${site.url}/#organization` },
    publisher: { '@id': `${site.url}/#organization` },
  };
}

/** Données structurées propres à la page (l'organisation est ajoutée à part). */
export function pageJsonLd(page: PageMeta, site: Site): Json[] {
  const out: Json[] = [];
  if (page.path === '/') out.push(websiteJsonLd(site), faqJsonLd());
  else out.push(breadcrumbJsonLd(page, site));
  if (page.path === '/services') out.push(servicesJsonLd(site));
  if (page.type === 'article') out.push(articleJsonLd(page, site));
  return out;
}
