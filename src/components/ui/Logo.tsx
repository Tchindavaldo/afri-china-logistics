import { Link } from 'react-router-dom';
import { cn } from '../../lib/format';

interface LogoMarkProps {
  className?: string;
  /** Version inversée pour fond bleu : carré blanc, tracé bleu. */
  inverted?: boolean;
}

export function LogoMark({ className = 'size-10', inverted = false }: LogoMarkProps) {
  const bg = inverted ? '#FFFFFF' : '#1747E6';
  const fg = inverted ? '#1747E6' : '#FFFFFF';
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="15" fill={bg} />
      <path d="M17 46 C 19 26, 33 16, 47 19" fill="none" stroke={fg} strokeWidth="5" strokeLinecap="round" />
      <circle cx="17" cy="46" r="6.5" fill={fg} />
      <circle cx="47" cy="19" r="7.5" fill={fg} />
      <circle cx="47" cy="19" r="3" fill={bg} />
    </svg>
  );
}

interface LogoProps {
  inverted?: boolean;
  className?: string;
  compact?: boolean;
}

export default function Logo({ inverted = false, className, compact = false }: LogoProps) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label="AfriChina Logistics — accueil">
      <LogoMark inverted={inverted} className="size-10 shrink-0 transition-transform duration-300 group-hover:-rotate-6" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display text-[19px] font-extrabold tracking-tight', inverted ? 'text-white' : 'text-ink')}>
            Afri<span className={inverted ? 'text-cobalt-200' : 'text-cobalt-500'}>China</span>
          </span>
          <span
            className={cn(
              'mt-1 font-mono text-[9.5px] font-medium tracking-[0.32em]',
              inverted ? 'text-cobalt-200' : 'text-muted'
            )}
          >
            LOGISTICS
          </span>
        </span>
      )}
    </Link>
  );
}
