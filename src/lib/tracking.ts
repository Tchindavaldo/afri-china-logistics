import type { Shipment, ShipmentInput, TrackingStage, TransportMode } from '../types';

/**
 * Logique de progression partagée par le suivi public, l'espace client et
 * l'admin (auparavant dupliquée dans chaque page).
 */

export const STAGES: { key: TrackingStage; icon: string; label: string }[] = [
  { key: 'picked_up', icon: '📦', label: 'Collecté' },
  { key: 'in_transit', icon: '🚚', label: 'En transit' },
  { key: 'customs', icon: '🛃', label: 'Douane' },
  { key: 'out_for_delivery', icon: '🚛', label: 'En livraison' },
  { key: 'delivered', icon: '✅', label: 'Livré' },
];

export function stageLabel(stage: string | null | undefined): string {
  return STAGES.find((s) => s.key === stage)?.label ?? 'Collecté';
}

/** Règles métier : un avion est rapide, un bateau est lent. */
export const DURATION_RULES = {
  airMaxDays: 7,
  seaMinDays: 30,
} as const;

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  sea: 'Fret maritime',
  air: 'Fret aérien',
};

export function computeStage(pct: number): TrackingStage {
  if (pct >= 100) return 'delivered';
  if (pct >= 85) return 'out_for_delivery';
  if (pct >= 70) return 'customs';
  if (pct >= 15) return 'in_transit';
  return 'picked_up';
}

const DAY_MS = 86_400_000;

/** Lit une date AAAA-MM-JJ sans décalage de fuseau horaire. */
function isoToUTC(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function todayUTC(now = new Date()): number {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isValidISODate(s: string | null | undefined): boolean {
  return !!s && isoToUTC(s) !== null;
}

export function addDaysISO(iso: string, days: number): string {
  const start = isoToUTC(iso);
  if (start === null || !days) return '';
  return new Date(start + days * DAY_MS).toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates ISO (0 si l'une manque ou si l'ordre est inversé). */
export function daysBetweenISO(from: string, to: string): number {
  const a = isoToUTC(from);
  const b = isoToUTC(to);
  if (a === null || b === null) return 0;
  return Math.max(0, Math.round((b - a) / DAY_MS));
}

type ProgressSource = Pick<
  Shipment | ShipmentInput,
  'total_duration_days' | 'departure_date' | 'tracking_progress' | 'tracking_stage'
>;

export interface ProgressInfo {
  totalDays: number;
  elapsedDays: number;
  /** Jour courant du trajet (1..totalDays), 0 si progression manuelle. */
  currentDay: number;
  progress: number;
  stage: TrackingStage;
  automatic: boolean;
}

/**
 * Durée totale + date de départ => progression calculée chaque jour.
 * Sans durée, on garde la progression et l'étape saisies à la main.
 */
export function computeProgress(s: ProgressSource, now = new Date()): ProgressInfo {
  const totalDays = s.total_duration_days || 0;
  const start = s.departure_date ? isoToUTC(s.departure_date) : null;

  if (totalDays > 0 && start !== null) {
    const diff = Math.floor((todayUTC(now) - start) / DAY_MS);
    const elapsedDays = Math.max(0, Math.min(totalDays, diff));
    const progress = Math.round((elapsedDays / totalDays) * 100);
    return {
      totalDays,
      elapsedDays,
      currentDay: Math.min(totalDays, elapsedDays + 1),
      progress,
      stage: computeStage(progress),
      automatic: true,
    };
  }

  const progress = Math.max(0, Math.min(100, s.tracking_progress || 0));
  return {
    totalDays: 0,
    elapsedDays: 0,
    currentDay: 0,
    progress,
    stage: (s.tracking_stage as TrackingStage) || 'picked_up',
    automatic: false,
  };
}

// Sans 0/O, 1/I/L : un numéro dicté au téléphone ne doit pas être ambigu.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/** Numéro de suivi aléatoire, non devinable : AFC-7Q2M-K8XD. */
export function generateTrackingNumber(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  return `AFC-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

export function normalizeTrackingNumber(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}
