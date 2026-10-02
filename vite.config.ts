import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {
  absoluteUrl,
  DEFAULT_KEYWORDS,
  fullTitle,
  OG_IMAGE_ALT,
  ogImage,
  organizationJsonLd,
  pageJsonLd,
  PUBLIC_PAGES,
  type PageMeta,
  type Site,
} from './src/lib/seo';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

/** Balises <head> d'une page, identiques à celles posées par le composant <SEO>. */
function headTags(page: PageMeta, site: Site): string {
  const title = fullTitle(page.title, site);
  const url = absoluteUrl(page.path, site);
  const image = ogImage(page, site);
  const article = page.type === 'article';
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<meta name="keywords" content="${esc(page.keywords ?? DEFAULT_KEYWORDS)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" hreflang="fr" href="${url}" />`,
    `<link rel="alternate" hreflang="x-default" href="${url}" />`,
    `<meta property="og:type" content="${article ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:alt" content="${esc(page.imageAlt ?? OG_IMAGE_ALT)}" />`,
    ...(article
      ? [
          `<meta property="article:published_time" content="${page.published}" />`,
          `<meta property="article:section" content="${esc(page.section ?? '')}" />`,
        ]
      : []),
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<script type="application/ld+json" id="organization-schema">${json(organizationJsonLd(site))}</script>`,
    ...pageJsonLd(page, site).map((d) => `<script type="application/ld+json" data-seo="page">${json(d)}</script>`),
  ];
  return tags.map((t) => `    ${t}`).join('\n');
}

function sitemap(site: Site): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_PAGES.map(
    (p) => `  <url>
    <loc>${absoluteUrl(p.path, site)}</loc>
    <lastmod>${p.published ?? today}</lastmod>
    <changefreq>${p.changefreq ?? 'monthly'}</changefreq>
    <priority>${(p.priority ?? 0.5).toFixed(1)}</priority>
  </url>`
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/**
 * Après le build : une page HTML par route publique (about.html,
 * blog/<article>.html…) avec son titre, sa description, son image de partage
 * et ses données structurées, plus le sitemap.xml à jour. Le contenu reste
 * l'application React ; seules les balises <head> changent.
 */
function seoPages(site: Site): Plugin {
  let outDir = 'dist';
  return {
    name: 'africhina-seo-pages',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const template = readFileSync(resolve(outDir, 'index.html'), 'utf8');
      const block = /^[ \t]*<!-- seo:start[\s\S]*?<!-- seo:end -->/m;
      if (!block.test(template)) throw new Error('index.html : bloc <!-- seo:start --> … <!-- seo:end --> introuvable.');

      for (const page of PUBLIC_PAGES) {
        const html = template.replace(block, headTags(page, site));
        const file = page.path === '/' ? resolve(outDir, 'index.html') : resolve(outDir, `.${page.path}.html`);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      }
      rmSync(resolve(outDir, 'sitemap.xml'), { force: true });
      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap(site));
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const site: Site = {
    url: (env.VITE_SITE_URL || 'https://www.africhinalogistics.com').replace(/\/$/, ''),
    name: env.VITE_SITE_NAME || 'AFRICHINA LOGISTICS',
  };

  return {
    plugins: [react(), tailwindcss(), seoPages(site)],
    build: {
      // Seul le morceau « globe » (three.js) dépasse, et il n'est chargé qu'à l'affichage d'un colis.
      chunkSizeWarningLimit: 2200,
      rollupOptions: {
        output: {
          // Le globe 3D (three.js) est lourd : on l'isole pour que le reste
          // du site se charge sans l'attendre.
          manualChunks(id) {
            if (/node_modules\/(three|three-globe|react-globe\.gl|globe\.gl|three-render-objects|h3-js|d3-)/.test(id)) {
              return 'globe';
            }
            if (id.includes('node_modules/@supabase')) return 'supabase';
            return undefined;
          },
        },
      },
    },
  };
});
