'use client';

/**
 * Funding & Scholarships — compact horizontal scroll.
 *
 * Renders as a single-row carousel of compact cards instead of a
 * tall stacked list. Career-specific scholarships come first (teal
 * accent), then universal Lånekassen cards.
 */

import { useMemo, useRef } from 'react';
import { Banknote, ExternalLink, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFundingForCareer, type FundingSource } from '@/lib/education/funding';

interface FundingSectionProps {
  careerId: string | null;
}

function CompactCard({ source, highlight }: { source: FundingSource; highlight?: boolean }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex flex-col justify-between rounded-lg border px-3 py-2.5 min-w-[220px] max-w-[260px] shrink-0 transition-colors group',
        highlight
          ? 'border-primary/30 bg-primary/[0.06] hover:border-primary/50'
          : 'border-border/30 bg-card/40 hover:border-border/50',
      )}
    >
      {/* Title + link icon */}
      <div>
        <div className="flex items-start justify-between gap-1.5">
          <h4 className="text-[11px] font-medium text-foreground/90 leading-snug line-clamp-2">
            {source.name}
          </h4>
          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0 mt-0.5" />
        </div>
        <p className="text-[10px] text-muted-foreground/65 leading-relaxed mt-1 line-clamp-2">
          {source.description}
        </p>
      </div>

      {/* Amount */}
      <p className="text-[10px] font-medium text-emerald-400/80 mt-2 truncate">
        {source.amount}
      </p>
    </a>
  );
}

export function FundingSection({ careerId }: FundingSectionProps) {
  const funding = useMemo(() => getFundingForCareer(careerId), [careerId]);
  const all = useMemo(() => [
    ...funding.careerSpecific.map((s) => ({ source: s, highlight: true })),
    ...funding.universal.map((s) => ({ source: s, highlight: false })),
  ], [funding]);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (all.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banknote className="h-3.5 w-3.5 text-emerald-400" />
          <h3 className="text-[12px] font-semibold text-foreground/85">
            Funding & Scholarships
          </h3>
          {funding.careerSpecific.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-primary/70 font-medium">
              <Sparkles className="h-2.5 w-2.5" />
              {funding.careerSpecific.length} for this career
            </span>
          )}
        </div>
        {/* Scroll arrows (hidden when everything fits) */}
        {all.length > 2 && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => scroll('left')} className="p-1 rounded hover:bg-muted/40 text-muted-foreground/50 hover:text-foreground transition-colors" aria-label="Scroll left">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => scroll('right')} className="p-1 rounded hover:bg-muted/40 text-muted-foreground/50 hover:text-foreground transition-colors" aria-label="Scroll right">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {all.map(({ source, highlight }) => (
          <CompactCard key={source.id} source={source} highlight={highlight} />
        ))}
      </div>
    </div>
  );
}
