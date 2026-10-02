import type { PhotoName } from '../lib/images';

export type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Guide' | 'Douane' | 'Transport';
  readingMinutes: number;
  date: string; // AAAA-MM-JJ
  cover: PhotoName;
  body: Block[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'groupage-ou-conteneur-complet',
    cover: 'containerTerminal',
    title: 'Groupage ou conteneur complet : que choisir pour importer de Chine ?',
    excerpt:
      "LCL ou FCL ? Le bon choix dépend surtout de votre volume. Voici comment calculer le point de bascule et éviter de payer pour de l'espace vide.",
    category: 'Transport',
    readingMinutes: 5,
    date: '2026-09-18',
    body: [
      { type: 'p', text: "En fret maritime, deux formules existent : le groupage (LCL, Less than Container Load), où votre marchandise partage un conteneur avec celle d'autres importateurs, et le conteneur complet (FCL, Full Container Load), réservé à votre seul usage." },
      { type: 'h2', text: 'Le groupage : payer uniquement ce que vous occupez' },
      { type: 'p', text: "En groupage, vous êtes facturé au mètre cube (ou à la tonne si la marchandise est très lourde). C'est la formule idéale pour démarrer ou pour des réassorts réguliers de petits volumes." },
      { type: 'ul', items: ['Accessible dès 1 m³', 'Pas besoin de remplir un conteneur', 'Délai un peu plus long : consolidation au départ et dégroupage à l’arrivée'] },
      { type: 'h2', text: 'Le conteneur complet : plus simple au-delà d’un certain volume' },
      { type: 'p', text: "Un 20 pieds offre environ 28 à 30 m³ utiles, un 40 pieds environ 58 à 60 m³, et un 40 pieds HC (High Cube) un peu plus de 65 m³. Le conteneur est scellé chez le fournisseur ou au point de réception et n'est ouvert qu'à destination." },
      { type: 'h3', text: 'Le point de bascule' },
      { type: 'p', text: "En pratique, au-delà de 15 à 18 m³, un 20 pieds devient souvent plus intéressant que le groupage. Demandez-nous les deux devis : nous comparons pour vous." },
      { type: 'h2', text: 'Notre conseil' },
      { type: 'p', text: "Regroupez vos achats de plusieurs fournisseurs dans notre point de réception en Chine. Vous gagnez sur le coût au mètre cube et vous recevez un seul envoi à suivre avec un seul numéro." },
    ],
  },
  {
    slug: 'documents-importation-chine-afrique',
    cover: 'documents',
    title: 'Les documents indispensables pour importer de Chine vers l’Afrique',
    excerpt:
      "Facture commerciale, liste de colisage, connaissement… Un document manquant peut bloquer votre marchandise au port pendant des semaines.",
    category: 'Douane',
    readingMinutes: 6,
    date: '2026-09-04',
    body: [
      { type: 'p', text: "Le passage en douane est l'étape qui génère le plus de retards. Dans la grande majorité des cas, la cause est documentaire : une facture incomplète, un poids incohérent ou un certificat absent." },
      { type: 'h2', text: 'Les trois documents de base' },
      { type: 'ul', items: [
        'La facture commerciale : vendeur, acheteur, description précise, quantités, valeur et Incoterm.',
        'La liste de colisage (packing list) : nombre de colis, poids brut et net, dimensions.',
        'Le titre de transport : connaissement (B/L) en maritime ou lettre de transport aérien (LTA/AWB) en aérien.',
      ] },
      { type: 'h2', text: 'Les documents complémentaires fréquents' },
      { type: 'ul', items: [
        'Certificat d’origine, parfois exigé pour bénéficier d’un taux de droits réduit.',
        'Certificats de conformité ou d’inspection avant embarquement selon le pays et le produit.',
        'Bordereau de suivi électronique des cargaisons, obligatoire dans plusieurs pays d’Afrique centrale et de l’Ouest.',
      ] },
      { type: 'h2', text: 'Bien décrire la marchandise' },
      { type: 'p', text: "« Divers articles » ou « marchandises générales » sont des descriptions à proscrire : elles entraînent quasi systématiquement une inspection. Soyez précis sur la nature, la matière et l'usage des produits." },
      { type: 'p', text: "Avant chaque départ, nous relisons votre dossier et vous signalons ce qui manque. C'est le moyen le plus sûr d'éviter des frais de magasinage au port." },
    ],
  },
  {
    slug: 'fret-aerien-ou-maritime',
    cover: 'plane',
    title: 'Fret aérien ou maritime : le bon calcul selon votre marchandise',
    excerpt:
      "L'aérien est 5 à 10 fois plus rapide, le maritime bien moins cher. Poids volumétrique, valeur et urgence : la méthode pour trancher.",
    category: 'Guide',
    readingMinutes: 4,
    date: '2026-08-21',
    body: [
      { type: 'p', text: "Le choix du mode de transport se joue sur trois critères : le délai acceptable, la valeur de la marchandise et son rapport poids / volume." },
      { type: 'h2', text: 'Comprendre le poids volumétrique' },
      { type: 'p', text: "En aérien, la compagnie facture le plus élevé entre le poids réel et le poids volumétrique (longueur × largeur × hauteur en cm, divisé par 6 000). Un carton léger mais encombrant peut donc coûter cher par avion." },
      { type: 'h2', text: 'Quand choisir l’avion' },
      { type: 'ul', items: ['Marchandise urgente ou saisonnière', 'Produits de forte valeur et peu volumineux (téléphones, accessoires, pièces)', 'Échantillons avant une grosse commande'] },
      { type: 'h2', text: 'Quand choisir le bateau' },
      { type: 'ul', items: ['Volumes importants ou marchandises lourdes', 'Mobilier, matériaux, équipements', 'Réassort planifié à l’avance'] },
      { type: 'p', text: "Beaucoup de nos clients combinent les deux : un petit envoi aérien pour tester le marché, puis le gros de la commande par voie maritime." },
    ],
  },
  {
    slug: 'incoterms-fob-cif-exw',
    cover: 'portAerial',
    title: 'Incoterms : EXW, FOB, CIF… qui paie quoi ?',
    excerpt:
      "Les Incoterms fixent le partage des frais et des risques entre vous et votre fournisseur chinois. Bien les choisir évite les frais cachés.",
    category: 'Guide',
    readingMinutes: 5,
    date: '2026-08-07',
    body: [
      { type: 'p', text: "L'Incoterm figure sur la facture du fournisseur. Il indique jusqu'où le vendeur prend en charge le transport, et à partir de quel moment la marchandise voyage à vos risques." },
      { type: 'h2', text: 'Les plus courants en provenance de Chine' },
      { type: 'ul', items: [
        'EXW (Ex Works) : vous récupérez la marchandise à l’usine. Tout le reste est à votre charge, y compris le dédouanement export.',
        'FOB (Free On Board) : le fournisseur livre la marchandise à bord du navire au port chinois, dédouanée à l’export. C’est le plus répandu.',
        'CIF (Cost, Insurance, Freight) : le fournisseur paie aussi le fret et une assurance minimale jusqu’au port de destination.',
      ] },
      { type: 'h2', text: 'Attention au CIF « pas cher »' },
      { type: 'p', text: "Un prix CIF très bas cache parfois des frais élevés à l'arrivée (manutention, documentation) que vous découvrez au port. Comparez toujours avec un devis FOB + fret organisé par votre transitaire." },
      { type: 'h2', text: 'Notre recommandation' },
      { type: 'p', text: "Achetez en FOB ou en EXW et confiez-nous le transport : vous gardez la maîtrise du coût total et un seul interlocuteur suit votre marchandise de bout en bout." },
    ],
  },
];

export function getArticle(slug: string | undefined): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
