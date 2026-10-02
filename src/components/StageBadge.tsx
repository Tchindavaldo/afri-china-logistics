import type { TrackingStage } from '../types';
import { stageLabel } from '../lib/tracking';
import { cn } from '../lib/format';

const TONES: Record<TrackingStage, string> = {
  picked_up: 'bg-slate-100 text-slate-700',
  in_transit: 'bg-cobalt-50 text-cobalt-700',
  customs: 'bg-amber-50 text-amber-700',
  out_for_delivery: 'bg-sky-50 text-sky-700',
  delivered: 'bg-emerald-50 text-emerald-700',
};

export default function StageBadge({ stage, className }: { stage: TrackingStage; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', TONES[stage], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {stageLabel(stage)}
    </span>
  );
}
