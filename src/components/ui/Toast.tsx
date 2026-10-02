import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
}

interface ToastProps extends ToastState {
  onClose: () => void;
  duration?: number;
}

const STYLES: Record<ToastType, { icon: typeof Info; tone: string }> = {
  success: { icon: CheckCircle2, tone: 'text-emerald-600' },
  error: { icon: AlertCircle, tone: 'text-red-600' },
  info: { icon: Info, tone: 'text-cobalt-500' },
};

export default function Toast({ message, type, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const { icon: Icon, tone } = STYLES[type];

  return (
    <div className="fixed top-4 right-4 left-4 z-[80] flex justify-end sm:left-auto" role="status" aria-live="polite">
      <div className="flex w-full max-w-sm animate-slide-in items-start gap-3 rounded-[14px] border border-line bg-white px-4 py-3 shadow-[0_18px_40px_-18px_rgba(10,27,77,0.45)]">
        <Icon className={`mt-0.5 size-5 shrink-0 ${tone}`} />
        <p className="flex-1 text-sm font-medium text-ink">{message}</p>
        <button type="button" onClick={onClose} className="text-muted transition hover:text-ink" aria-label="Fermer">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
