import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/format';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Empêche la fermeture (ex. pendant un enregistrement). */
  locked?: boolean;
}

export default function Modal({ open, onClose, title, children, className, locked = false }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, locked]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-cobalt-950/45 backdrop-blur-[2px]"
        onClick={() => !locked && onClose()}
      />
      <div
        className={cn(
          'relative w-full max-w-md animate-rise rounded-t-[22px] bg-white p-6 shadow-2xl sm:rounded-[22px] sm:p-7',
          className
        )}
      >
        {title !== undefined && (
          <div className="mb-5 flex items-start justify-between gap-4">
            <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              disabled={locked}
              className="-m-1 rounded-lg p-1 text-muted transition hover:bg-cobalt-50 hover:text-ink"
              aria-label="Fermer"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
