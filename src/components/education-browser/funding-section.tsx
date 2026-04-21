'use client';

/**
 * Funding & Scholarships section — rendered inside Study Path.
 *
 * Shows universal Lånekassen support (every Norwegian student gets
 * this) plus career-specific scholarships when available. Each
 * funding source links to the official portal.
 */

import { useMemo } from 'react';
import { Banknote, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFundingForCareer, type FundingSource } from '@/lib/education/funding';

interface FundingSectionProps {
  careerId: string | null;
}

function FundingCard({ source }: { source: FundingSource }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-border/30 bg-card/40 px-3.5 py-3 hover:border-border/50 hover:bg-card/60 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[12px] font-medium text-foreground/90 leading-snug">
          {source.name}
        </h4>
        <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0 mt-0.5" />
      </div>
      <p className="text-[11px] text-muted-foreground/75 leading-relaxed mt-1">
        {source.description}
      </p>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-[10px] font-medium text-emerald-400/80">
          {source.amount}
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          {source.provider}
        </span>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {source.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground/65"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

export function FundingSection({ careerId }: FundingSectionProps) {
  const funding = useMemo(() => getFundingForCareer(careerId), [careerId]);
  const totalSources = funding.universal.length + funding.careerSpecific.length;

  if (totalSources === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Banknote className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-foreground/90">
            Funding & Scholarships
          </h3>
          <p className="text-[11px] text-muted-foreground/70">
            How to pay for your studies
          </p>
        </div>
      </div>

      {/* Career-specific scholarships (shown first when available) */}
      {funding.careerSpecific.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-primary/70 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            For this career
          </p>
          <div className="grid grid-cols-1 gap-2">
            {funding.careerSpecific.map((s) => (
              <FundingCard key={s.id} source={s} />
            ))}
          </div>
        </div>
      )}

      {/* Universal funding (Lånekassen) */}
      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Universal (every Norwegian student)
        </p>
        <div className="grid grid-cols-1 gap-2">
          {funding.universal.map((s) => (
            <FundingCard key={s.id} source={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
