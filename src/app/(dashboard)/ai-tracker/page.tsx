'use client';

/**
 * AI Career Tracker — Layer 3.
 *
 * Dedicated page showing how AI is reshaping the career landscape:
 *   - Emerging AI-adjacent roles
 *   - Most-transformed careers (sorted by impact level)
 *   - Skills gaining vs losing value
 *
 * Accessed via sidebar: "AI & Careers"
 */

import { useMemo } from 'react';
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import {
  getAllAIImpactCareers,
  EMERGING_AI_ROLES,
  SKILLS_GAINING_VALUE,
  SKILLS_DECREASING_VALUE,
  type AIImpactLevel,
} from '@/lib/ai-impact';
import { getAllCareers } from '@/lib/career-pathways';

const LEVEL_CONFIG: Record<AIImpactLevel, { label: string; color: string; dot: string }> = {
  high: { label: 'High', color: 'text-red-400', dot: 'bg-red-400' },
  medium: { label: 'Medium', color: 'text-amber-400', dot: 'bg-amber-400' },
  low: { label: 'Low', color: 'text-emerald-400', dot: 'bg-emerald-400' },
};

const DEMAND_CONFIG: Record<string, { label: string; color: string }> = {
  surging: { label: 'Surging demand', color: 'text-emerald-400' },
  growing: { label: 'Growing demand', color: 'text-teal-400' },
  emerging: { label: 'Emerging role', color: 'text-blue-400' },
};

export default function AITrackerPage() {
  const impactCareers = useMemo(() => getAllAIImpactCareers(), []);
  const allCareers = useMemo(() => getAllCareers(), []);

  const getCareerTitle = (id: string) => {
    const c = allCareers.find((c) => c.id === id);
    return c ? `${c.emoji ?? ''} ${c.title}`.trim() : id;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <PageHeader
        title="AI &"
        gradientText="Careers"
        description="How artificial intelligence is reshaping the career landscape — and what it means for your choices."
        icon={Bot}
      />

      <div className="mt-6 space-y-8">
        {/* ── Emerging AI Roles ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground/90">
              Emerging AI-adjacent careers
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EMERGING_AI_ROLES.map((role) => {
              const demand = DEMAND_CONFIG[role.demandTrend];
              return (
                <div
                  key={role.title}
                  className="rounded-lg border border-border/30 bg-card/40 px-3.5 py-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[12px] font-medium text-foreground/90 leading-snug">
                      {role.title}
                    </h3>
                    <span className={cn('text-[9px] font-medium shrink-0', demand.color)}>
                      {demand.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                    {role.description}
                  </p>
                  {role.relatedCareers.length > 0 && (
                    <p className="text-[9px] text-muted-foreground/50">
                      Related: {role.relatedCareers.map(getCareerTitle).join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Most-Transformed Careers ──────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-foreground/90">
              How AI impacts each career
            </h2>
          </div>
          <div className="rounded-lg border border-border/30 bg-card/40 overflow-hidden">
            {impactCareers.map(({ careerId, entry }, idx) => {
              const config = LEVEL_CONFIG[entry.level];
              return (
                <div
                  key={careerId}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-3',
                    idx > 0 && 'border-t border-border/20',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full shrink-0', config.dot)} />
                  <span className="text-[12px] font-medium text-foreground/85 flex-1 truncate">
                    {getCareerTitle(careerId)}
                  </span>
                  <span className={cn('text-[10px] font-medium shrink-0', config.color)}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-muted-foreground/50 mt-2">
            Impact level reflects how much daily work changes, not job loss risk. High-impact careers often have MORE opportunities for people who adapt.
          </p>
        </section>

        {/* ── Skills Shift ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground/90">
              Skills gaining value
            </h2>
          </div>
          <div className="space-y-2">
            {SKILLS_GAINING_VALUE.map((s) => (
              <div key={s.skill} className="flex items-start gap-2">
                <ArrowRight className="h-3 w-3 text-emerald-400/70 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-medium text-foreground/85">{s.skill}</span>
                  <span className="text-[10px] text-muted-foreground/60 ml-1.5">— {s.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-4 w-4 text-red-400/70" />
            <h2 className="text-sm font-semibold text-foreground/90">
              Skills/tasks AI is taking over
            </h2>
          </div>
          <div className="space-y-2">
            {SKILLS_DECREASING_VALUE.map((s) => (
              <div key={s.skill} className="flex items-start gap-2">
                <ArrowRight className="h-3 w-3 text-red-400/50 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-medium text-foreground/70">{s.skill}</span>
                  <span className="text-[10px] text-muted-foreground/50 ml-1.5">— {s.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom note ───────────────────────────────────────── */}
        <div className="rounded-lg bg-primary/[0.04] border border-primary/20 px-4 py-3">
          <p className="text-[11px] text-foreground/75 leading-relaxed">
            <span className="font-medium text-primary/80">Remember:</span> AI impact is about how the work CHANGES, not whether the career disappears. The careers most transformed by AI often have the most opportunities for people who learn to work WITH the technology. The worst strategy is ignoring AI — the best is embracing it early.
          </p>
        </div>
      </div>
    </div>
  );
}
