# AFRICHINA LOGISTICS

Site vitrine + suivi de colis (globe 3D) + espace client + administration, pour un transitaire Chine ⇄ Afrique.

React 19 · Vite · TypeScript · Tailwind CSS 4 · Supabase.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # vérifie les types puis construit dans dist/
```

Variables d'environnement : copier `.env.example` vers `.env` et renseigner `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_NAME`, `VITE_SITE_URL`.

En développement, les numéros `DEMO` (maritime) et `DEMO-AIR` (aérien) affichent un colis fictif sur la page de suivi, sans base de données.

## Base de données (Supabase)

Le projet Supabase est partagé avec d'autres sites : tables, fonctions et policies sont préfixées `cyrille_africhina_`.

1. Ouvrir **Supabase › SQL Editor** et exécuter le contenu de
   `supabase/migrations/20261002100000_init_cyrille_africhina_schema.sql` (le script est rejouable).
2. Il crée :
   - `cyrille_africhina_users` : comptes autorisés et rôle (`admin` ou `client`) ;
   - `cyrille_africhina_shipments` : expéditions ;
   - `cyrille_africhina_site_settings` : coordonnées et modèle de message WhatsApp (une seule ligne) ;
   - les fonctions `cyrille_africhina_track` (suivi public d'un seul numéro) et `cyrille_africhina_my_role` ;
   - les règles RLS et les droits du dossier `africhina/` dans le bucket `shipment-images`.
3. L'administrateur initial est `junior@gmail.com` (dernière instruction du script, modifiable avant exécution).

### Comptes

Il n'y a ni inscription publique ni connexion Google : les accès sont créés par l'équipe.

Aucun lien de connexion n'apparaît sur le site : on ouvre directement `/admin` (ou `/dashboard` pour un client), qui renvoie vers la page de connexion `/auth` tant qu'on n'est pas connecté.

1. **Supabase › Authentication › Users › Add user** : créer le compte (e-mail + mot de passe, « Auto confirm »).
2. Dans le site, **Admin › Utilisateurs** : ajouter le même e-mail avec le rôle `admin` ou `client`.

Un compte qui existe dans Supabase Auth mais pas dans `cyrille_africhina_users` est refusé à la connexion.
Un client ne voit que les expéditions où son e-mail est celui de l'expéditeur ou du destinataire.

### Mot de passe oublié

Dans **Authentication › URL Configuration**, ajouter aux « Redirect URLs » :

- `https://www.africhinalogistics.com/reset-password`
- `http://localhost:5173/reset-password` (développement)

## Référencement (SEO)

- Titres, descriptions, mots-clés et images de partage de chaque page : `src/lib/seo.ts`.
- Au build, une page HTML est générée par route publique (`about.html`, `blog/<article>.html`…) avec ses balises
  (Open Graph, Twitter, canonical, hreflang) et ses données structurées Schema.org
  (Organization, WebSite + recherche de colis, FAQ, fil d'Ariane, services, articles). Le `sitemap.xml` est généré au même moment.
- Image de partage par défaut : `public/og-image.png` (1200×630).
- Après la mise en ligne : déclarer le site et le sitemap dans Google Search Console.

## Déploiement

- **Vercel** : `vercel.json` gère la réécriture SPA et les en-têtes de cache/sécurité.
- **Apache / hébergement mutualisé** : déposer le contenu de `dist/` ; `public/.htaccess` (copié dans `dist/`) force HTTPS + www et renvoie toutes les routes vers `index.html`.

Variables à renseigner sur Vercel (Settings › Environment Variables, environnement *Production*) avant le build :

| Variable | Valeur |
| --- | --- |
| `VITE_SUPABASE_URL` | URL du projet Supabase (Project Settings › API) |
| `VITE_SUPABASE_ANON_KEY` | clé publique `anon` (jamais la clé `service_role`) |
| `VITE_SITE_NAME` | `AFRICHINA LOGISTICS` |
| `VITE_SITE_URL` | `https://www.africhinalogistics.com` (sans `/` final) |

## Images

Les photos d'illustration sont servies par le CDN d'Unsplash (`src/lib/images.ts`), en plusieurs tailles selon l'écran. Pour en changer, remplacer l'identifiant de la photo dans ce fichier.
