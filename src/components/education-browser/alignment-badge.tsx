'use client';

import { cn } from '@/lib/utils';
import { Check, AlertTriangle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AlignmentStatus } from '@/lib/education/programme-alignment';

const CONFIG: Record<
  AlignmentStatus,
  { icon: typeof Check; label: string; description: string; className: string; dot: string }
> = {
  aligned: {
    icon: Check,
    label: 'Aligned',
    description: "Your current subjects match what this programme expects. You're on the right track.",
    className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  partial: {
    icon: HelpCircle,
    label: 'Partially aligned',
    description: "Some of your subjects match, but this programme may need subjects you haven't picked yet. Check the entry requirements.",
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  needs_attention: {
    icon: AlertTriangle,
    label: 'Needs attention',
    description: "Your current subjects don't closely match what this programme requires. You may need to add or change subjects — talk to your school.",
    className: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    dot: 'bg-rose-400',
  },
  unknown: {
    icon: HelpCircle,
    label: '',
    description: '',
    className: '',
    dot: '',
  },
};

interface AlignmentBadgeProps {
  status: AlignmentStatus;
  reason?: string;
  matchedSubjects?: string[];
  missingSubjects?: string[];
  compact?: boolean;
}

export function AlignmentBadge({ status, reason, matchedSubjects, missingSubjects, compact }: AlignmentBadgeProps) {
  if (status === 'unknown') return null;

  const c = CONFIG[status];

  // Build a detailed tooltip from matched/missing subjects if available
  const tooltipLines: string[] = [c.description];
  if (matchedSubjects && matchedSubjects.length > 0) {
    tooltipLines.push(`✓ Matched: ${matchedSubjects.join(', ')}`);
  }
  if (missingSubjects && missingSubjects.length > 0) {
    tooltipLines.push(`⚠ Missing: ${missingSubjects.join(', ')}`);
  }
  if (reason) {
    tooltipLines.push(reason);
  }
  const tooltipText = tooltipLines.join('\n');

  if (compact) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn('inline-flex h-2 w-2 rounded-full shrink-0 cursor-help', c.dot)} />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-snug whitespace-pre-line">
            <p className="font-semibold mb-1">{c.label}</p>
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium cursor-help',
              c.className,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', c.dot)} />
            {c.label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-snug whitespace-pre-line">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
