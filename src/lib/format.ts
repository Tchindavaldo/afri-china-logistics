/** Date AAAA-MM-JJ => « 12 octobre 2026 » (sans décalage de fuseau). */
export function formatDate(iso: string | null | undefined, fallback = 'N/A'): string {
  if (!iso) return fallback;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(iso);
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatShortDate(iso: string | null | undefined, fallback = '—'): string {
  if (!iso) return fallback;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function errorMessage(err: unknown, fallback = 'Erreur inconnue'): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
