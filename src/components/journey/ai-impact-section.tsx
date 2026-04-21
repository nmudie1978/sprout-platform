'use client';

/**
 * AI Impact Section — Layer 1 + Layer 2 combined.
 *
 * Renders in the Understand tab. Shows:
 *   - Impact level badge (high/medium/low)
 *   - One-line signal
 *   - Today vs 2030 comparison
 *   - Skills gaining / decreasing in value
 *   - Student-specific advice
 */

import { useMemo, useState } from 'react';
import { Bot, TrendingUp, TrendingDown, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAIImpact, type AIImpactEntry, type AIImpactLevel } from '@/lib/ai-impact';

interface AIImpactSectionProps {
  careerId: string | null;
}

const LEVEL_CONFIG: Record<AIImpactLevel, { label: string; color: string; bg: string }> = {
  high: { label: 'High AI impact', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  medium: { label: 'Medium AI impact', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  low: { label: 'Low AI impact', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

export function AIImpactSection({ careerId }: AIImpactSectionProps) {
  const impact = useMemo(() => (careerId ? getAIImpact(careerId) : null), [careerId]);
  const [expanded, setExpanded] = useState(false);

  if (!impact) return null;

  const config = LEVEL_CONFIG[impact.level];

  return (
    <div className="space-y-3">
      {/* Header + badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-[12px] font-semibold text-foreground/85">
            AI & the future of this career
          </h3>
        </div>
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium', config.bg, config.color)}>
          {config.label}
        </span>
      </div>

      {/* Signal line */}
      <p className="text-[11px] text-foreground/75 leading-relaxed">
        {impact.signal}
      </p>

      {/* Expandable detail */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
      >
        {expanded ? 'Show less' : 'What does this mean for me?'}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="space-y-4 pt-1">
          {/* Today vs 2030 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/30 bg-card/40 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Today</p>
              <p className="text-[11px] text-foreground/75 leading-relaxed">{impact.today}</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-primary/70 mb-1">By ~2030</p>
              <p className="text-[11px] text-foreground/75 leading-relaxed">{impact.outlook2030}</p>
            </div>
          </div>

          {/* Skills shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-emerald-400/80 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Skills gaining value
              </p>
              <div className="flex flex-wrap gap-1">
                {impact.skillsGaining.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] text-emerald-300/80">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-red-400/70 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Tasks AI will handle
              </p>
              <div className="flex flex-wrap gap-1">
                {impact.skillsDecreasing.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] text-red-300/60">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Student advice */}
          <div className="rounded-lg bg-primary/[0.04] border border-primary/20 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-primary/80 mb-0.5">What this means for you</p>
                <p className="text-[11px] text-foreground/75 leading-relaxed">{impact.studentAdvice}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
