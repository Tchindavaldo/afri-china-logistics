import { FileCheck2, PackageSearch, Plane, Ship, Truck, Warehouse, type LucideIcon } from 'lucide-react';
import type { PhotoName } from '../lib/images';

export interface Service {
  id: string;
  icon: LucideIcon;
  title: string;
  short: string;
  description: string;
  features: string[];
  /** Délai indicatif affiché sur la carte. */
  lead?: string;
  image: PhotoName;
}

export const SERVICES: Service[] = [
  {
    id: 'fret-maritime',
    image: 'portAerial',
    icon: Ship,
    title: 'Fret maritime',
    short: 'Conteneurs complets et groupage depuis les grands ports chinois vers les ports africains.',
    description:
      "La solution la plus économique pour les volumes importants. Nous réservons l'espace auprès des armateurs, organisons l'empotage et suivons votre conteneur jusqu'au port de destination, puis jusqu'à l'intérieur des terres pour les pays enclavés.",
    features: [
      'Conteneurs complets 20’, 40’ et 40’ HC (FCL)',
      'Groupage dès 1 m³ (LCL)',
      'Consolidation de plusieurs fournisseurs',
      'Suivi jour par jour sur globe 3D',
    ],
    lead: '35 – 60 jours',
  },
  {
    id: 'fret-aerien',
    image: 'plane',
    icon: Plane,
    title: 'Fret aérien',
    short: 'Vos envois urgents ou de valeur livrés en quelques jours, facturés au kilo.',
    description:
      "Pour les échantillons, pièces détachées, téléphones, textiles ou toute marchandise pressée. Vos colis partent sur les vols cargo et passagers réguliers vers les principaux aéroports africains.",
    features: [
      'Colis express et palettes',
      'Tarification au kilo réel ou volumétrique',
      'Remise à l’aéroport ou porte-à-porte',
      'Idéal pour les petits volumes de valeur',
    ],
    lead: '3 – 7 jours',
  },
  {
    id: 'reception-groupage',
    image: 'warehouse',
    icon: Warehouse,
    title: 'Réception & consolidation',
    short: 'Faites livrer vos achats en Chine : nous réceptionnons, contrôlons et regroupons.',
    description:
      "Vos fournisseurs livrent à notre point de réception en Chine. Chaque colis est pointé, photographié et mesuré, puis regroupé avec vos autres achats pour partir en un seul envoi et réduire le coût du transport.",
    features: [
      'Pointage et photos à la réception',
      'Reconditionnement et étiquetage',
      'Regroupement multi-fournisseurs',
      'Stockage temporaire avant départ',
    ],
  },
  {
    id: 'sourcing',
    image: 'shopping',
    icon: PackageSearch,
    title: 'Sourcing & contrôle fournisseurs',
    short: 'Trouver le bon fournisseur, vérifier la marchandise avant qu’elle ne parte.',
    description:
      "Nous vous aidons à identifier des fournisseurs fiables, à négocier et à vérifier la conformité de la commande avant expédition, pour éviter les mauvaises surprises à l'arrivée.",
    features: [
      'Recherche et comparaison de fournisseurs',
      'Vérification de l’entreprise',
      'Inspection qualité avant départ',
      'Rapport photo et vidéo',
    ],
  },
  {
    id: 'dedouanement',
    image: 'paperwork',
    icon: FileCheck2,
    title: 'Dédouanement & formalités',
    short: 'Documents, déclarations et droits de douane traités pour un passage sans blocage.',
    description:
      "Facture commerciale, liste de colisage, connaissement ou LTA : nous préparons et vérifions les documents, et coordonnons le dédouanement à l'export comme à l'import avec nos partenaires sur place.",
    features: [
      'Préparation des documents export',
      'Estimation des droits et taxes',
      'Coordination avec les agréés en douane',
      'Assurance marchandise sur demande',
    ],
  },
  {
    id: 'livraison',
    image: 'parcels',
    icon: Truck,
    title: 'Transport final & corridors',
    short: 'Du port jusqu’à votre porte, y compris vers les pays sans façade maritime.',
    description:
      "Après le port, la marchandise poursuit par la route ou le rail : Douala – N'Djaména, Douala – Bangui, Dakar – Bamako, Tema – Ouagadougou, Mombasa – Kampala… Le suivi continue jusqu'à la livraison.",
    features: [
      'Enlèvement au port ou à l’aéroport',
      'Corridors vers les pays enclavés',
      'Livraison porte-à-porte',
      'Preuve de livraison',
    ],
  },
];
