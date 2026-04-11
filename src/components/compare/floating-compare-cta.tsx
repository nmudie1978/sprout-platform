'use client';

/**
 * FloatingCompareCTA — sticky bottom-centre pill that shows the
 * current shortlist count and lets the user open the Compare modal.
 *
 * Hidden when the shortlist is empty. Disabled state until 2+ are
 * selected (since "comparing" 1 career doesn't make sense).
 */

import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Career } from '@/lib/career-pathways';

interface FloatingCompareCTAProps {
  shortlist: Career[];
  max: number;
  onCompare: () => void;
  onClear: () => void;
}

export function FloatingCompareCTA({ shortlist, max, onCompare, onClear }: FloatingCompareCTAProps) {
  if (shortlist.length === 0) return null;

  const canCompare = shortlist.length >= 2;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-card/95 backdrop-blur-md shadow-2xl shadow-teal-500/20 px-3 py-2">
        {/* Avatar stack */}
        <div className="flex items-center -space-x-1.5">
          {shortlist.slice(0, 3).map((c) => (
            <span
              key={c.id}
              className="h-7 w-7 rounded-full bg-teal-500/15 ring-2 ring-card flex items-center justify-center text-base"
              title={c.title}
            >
              {c.emoji}
            </span>
          ))}
        </div>

        {/* Count */}
        <span className="text-[11px] font-medium text-foreground/85 ml-0.5">
          {shortlist.length} of {max}
        </span>

        {/* Compare CTA */}
        <button
          type="button"
          onClick={onCompare}
          disabled={!canCompare}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
            canCompare
              ? 'bg-teal-500 text-white hover:bg-teal-400'
              : 'bg-muted/40 text-muted-foreground/50 cursor-not-allowed',
          )}
          title={canCompare ? 'Open compare view' : 'Add at least 2 careers to compare'}
        >
          Compare
          <ArrowRight className="h-3 w-3" />
        </button>

        {/* Clear */}
        <button
          type="button"
          onClick={onClear}
          className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors"
          aria-label="Clear shortlist"
          title="Clear all"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
