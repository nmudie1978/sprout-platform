'use client';

import { cn } from '@/lib/utils';
import { Check, AlertTriangle, HelpCircle } from 'lucide-react';
import type { AlignmentStatus } from '@/lib/education/programme-alignment';

const CONFIG: Record<
  AlignmentStatus,
  { icon: typeof Check; label: string; className: string; dot: string }
> = {
  aligned: {
    icon: Check,
    label: 'Aligned',
    className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  partial: {
    icon: HelpCircle,
    label: 'Partial',
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  needs_attention: {
    icon: AlertTriangle,
    label: 'Needs attention',
    className: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    dot: 'bg-rose-400',
  },
  unknown: {
    icon: HelpCircle,
    label: '',
    className: '',
    dot: '',
  },
};

interface AlignmentBadgeProps {
  status: AlignmentStatus;
  reason?: string;
  compact?: boolean;
}

export function AlignmentBadge({ status, reason, compact }: AlignmentBadgeProps) {
  if (status === 'unknown') return null;

  const c = CONFIG[status];

  if (compact) {
    return (
      <span className={cn('inline-flex h-2 w-2 rounded-full shrink-0', c.dot)} title={c.label} />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
        c.className,
      )}
      title={reason}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  );
}
