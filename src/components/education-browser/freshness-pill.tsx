'use client';

/**
 * Freshness Pill — a calm, honest indicator showing when a piece of
 * education data was last verified against its source.
 *
 * Used in the Understand tab Education Pathway header to give school
 * procurement teams a credible "this is current" signal, and to be
 * honest about which content is hand-curated vs auto-synced.
 *
 * Design intent (per CLAUDE.md):
 *   - Calm, never alarming. No red. No exclamation.
 *   - Honest about hand-curated content rather than inventing a date.
 *   - Tooltip explains what the state means; no mystery icons.
 */

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  getFreshnessInfo,
  aggregateFreshness,
  type FreshnessInfo,
  type FreshnessState,
} from '@/lib/education/freshness';

const STATE_STYLES: Record<FreshnessState, { dot: string; text: string }> = {
  // Calm emerald — fresh.
  fresh: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  // Soft amber — aging, due for re-check, not alarming.
  aging: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  // Muted grey — stale. Honest, not alarming.
  stale: { dot: 'bg-muted-foreground/60', text: 'text-muted-foreground' },
  // Faintest — hand-curated. The default for editorial content.
  curated: { dot: 'bg-muted-foreground/40', text: 'text-muted-foreground/80' },
};

interface FreshnessPillProps {
  /** Pre-computed info, or pass `lastVerifiedAt` directly via {@link FreshnessPillForRecord}. */
  info: FreshnessInfo;
  className?: string;
  /** Compact rendering: dot only, with the label moved to the tooltip. */
  compact?: boolean;
}

export function FreshnessPill({ info, className, compact = false }: FreshnessPillProps) {
  const styles = STATE_STYLES[info.state];

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full',
              'border border-border/40 bg-background/40 backdrop-blur-sm',
              'px-2 py-0.5 text-[10px] font-medium leading-none',
              'cursor-default select-none',
              styles.text,
              className,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} aria-hidden />
            {!compact && <span>{info.label}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="font-medium mb-0.5">{info.label}</div>
          <div className="text-muted-foreground/90">{info.tooltip}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Convenience wrapper — most callers have a record with
 * `lastVerifiedAt` + `verificationSource` and don't want to construct
 * the FreshnessInfo by hand.
 */
export function FreshnessPillForRecord({
  record,
  className,
  compact,
}: {
  record: { lastVerifiedAt?: string; verificationSource?: string };
  className?: string;
  compact?: boolean;
}) {
  const info = getFreshnessInfo(record.lastVerifiedAt, record.verificationSource);
  return <FreshnessPill info={info} className={className} compact={compact} />;
}

/**
 * Aggregate pill — computes the worst state across many records and
 * renders one pill. Used at the top of the Education Pathway block
 * where multiple programmes / stages are visible at once.
 */
export function FreshnessPillAggregate({
  records,
  className,
  compact,
}: {
  records: Array<{ lastVerifiedAt?: string; verificationSource?: string }>;
  className?: string;
  compact?: boolean;
}) {
  const info = aggregateFreshness(records);
  return <FreshnessPill info={info} className={className} compact={compact} />;
}
