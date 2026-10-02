import { cn } from '../../lib/format';

export default function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin', className ?? 'size-5')} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-cobalt-500">
      <Spinner className="size-9" />
      <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">{label}</p>
    </div>
  );
}
