/**
 * Photos d'illustration, servies par le CDN d'Unsplash (redimensionnées à la
 * volée : on ne télécharge que la largeur nécessaire à l'écran).
 */
const PHOTOS = {
  portAerial: '1494412574643-ff11b0a5c1c3', // port à conteneurs vu du ciel
  containerTerminal: '1578575437130-527eed3abbec', // terminal, piles de conteneurs
  warehouse: '1586528116311-ad8dd3c8310d', // entrepôt, rayonnages
  picking: '1553413077-190dd305871c', // préparation en entrepôt
  parcels: '1566576721346-d4a3b4eaeb55', // colis prêts à livrer
  plane: '1436491865332-7a61a109cc05', // avion en vol
  truck: '1601584115197-04ecc0da31d7', // transport routier
  earthNetwork: '1451187580459-43490279c0fa', // Terre et réseau mondial
  worldMap: '1526778548025-fa2f459cd5c1', // carte du monde
  paperwork: '1454165804606-c3d57bc86b40', // dossiers, réunion de travail
  documents: '1505839673365-e3971f8d9184', // documents
  workspace: '1499750310107-5fef28a66643', // poste de travail
  contactDesk: '1423666639041-f56000c27a9a', // prise de contact
  shopping: '1607082348824-0a96f2a4b9da', // achats, e-commerce
} as const;

export type PhotoName = keyof typeof PHOTOS;

export function photoUrl(name: PhotoName, width = 1200): string {
  return `https://images.unsplash.com/photo-${PHOTOS[name]}?auto=format&fit=crop&w=${width}&q=75`;
}

const WIDTHS = [480, 800, 1200, 1800];

export function photoSrcSet(name: PhotoName, maxWidth = 1800): string {
  return WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${photoUrl(name, w)} ${w}w`)
    .join(', ');
}
