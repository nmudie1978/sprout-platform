'use client';

/**
 * Pivot Preview — "What if I change my mind?"
 *
 * Shows what transfers and what doesn't if the user switches
 * to a related career. Uses the career cluster engine to find
 * the 3-4 closest careers, then compares education requirements
 * to estimate transfer credit.
 */

import { useMemo, useState } from 'react';
import { ArrowRightLeft, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCareerCluster } from '@/lib/matching/career-clusters';
import { getCareerRequirements } from '@/lib/education';
import type { Career } from '@/lib/career-pathways';

interface PivotPreviewProps {
  careerId: string;
  careerTitle: string;
}

interface PivotOption {
  career: Career;
  transfers: string[];
  doesNotTransfer: string[];
  verdict: 'smooth' | 'partial' | 'restart';
  verdictLabel: string;
}

function computePivots(careerId: string): PivotOption[] {
  const cluster = getCareerCluster(careerId, { limit: 4, diversify: true });
  if (!cluster) return [];

  const sourceReqs = getCareerRequirements(careerId);
  const sourceSubjects = sourceReqs?.schoolSubjects?.required ?? [];
  const sourcePath = sourceReqs?.universityPath?.programme ?? '';

  return cluster.related.slice(0, 4).map((r) => {
    const targetReqs = getCareerRequirements(r.career.id);
    const targetSubjects = targetReqs?.schoolSubjects?.required ?? [];
    const targetPath = targetReqs?.universityPath?.programme ?? '';

    const transfers: string[] = [];
    const doesNotTransfer: string[] = [];

    // Check subject overlap
    const sharedSubjects = sourceSubjects.filter((s: string) =>
      targetSubjects.some((t: string) => t.toLowerCase() === s.toLowerCase()),
    );
    if (sharedSubjects.length > 0) {
      transfers.push(`${sharedSubjects.length} school subjects carry over`);
    }

    // Check shared traits from cluster
    if (r.sharedTraits.length > 0) {
      transfers.push(`Similar work style (${r.sharedTraits.slice(0, 2).join(', ')})`);
    }

    // Check if same education pathway
    if (sourcePath && targetPath && sourcePath.toLowerCase() === targetPath.toLowerCase()) {
      transfers.push('Same degree programme — no restart needed');
    } else if (sourcePath && targetPath) {
      doesNotTransfer.push('Different degree programme required');
    }

    // General transferable skills
    transfers.push('General work experience and soft skills');

    // Check what doesn't transfer
    if (r.similarity < 0.6) {
      doesNotTransfer.push('Significant retraining likely needed');
    }
    if (targetReqs?.universityPath && !sourceReqs?.universityPath) {
      doesNotTransfer.push('University degree required (you may not have one on current path)');
    }

    // Verdict
    let verdict: 'smooth' | 'partial' | 'restart';
    let verdictLabel: string;
    if (doesNotTransfer.length === 0 || r.similarity > 0.8) {
      verdict = 'smooth';
      verdictLabel = 'Smooth transition';
    } else if (doesNotTransfer.length <= 1 && r.similarity > 0.6) {
      verdict = 'partial';
      verdictLabel = 'Partial transfer';
    } else {
      verdict = 'restart';
      verdictLabel = 'Significant pivot';
    }

    return { career: r.career, transfers, doesNotTransfer, verdict, verdictLabel };
  });
}

const VERDICT_STYLE: Record<string, { color: string; icon: typeof Check }> = {
  smooth: { color: 'text-emerald-400', icon: Check },
  partial: { color: 'text-amber-400', icon: ArrowRightLeft },
  restart: { color: 'text-red-400', icon: X },
};

export function PivotPreview({ careerId, careerTitle }: PivotPreviewProps) {
  const pivots = useMemo(() => computePivots(careerId), [careerId]);
  const [expanded, setExpanded] = useState(false);

  if (pivots.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 group w-full text-left"
      >
        <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[12px] font-semibold text-foreground/85">
          What if I change my mind?
        </h3>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto" />
        )}
      </button>

      {!expanded && (
        <p className="text-[10px] text-muted-foreground/60">
          See what transfers if you switch from {careerTitle} to a related career.
        </p>
      )}

      {expanded && (
        <div className="space-y-2">
          {pivots.map((p) => {
            const style = VERDICT_STYLE[p.verdict];
            const Icon = style.icon;
            return (
              <div
                key={p.career.id}
                className="rounded-lg border border-border/30 bg-card/40 px-3.5 py-3"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-medium text-foreground/85">
                    {p.career.emoji} {p.career.title}
                  </span>
                  <span className={cn('inline-flex items-center gap-1 text-[9px] font-medium', style.color)}>
                    <Icon className="h-3 w-3" />
                    {p.verdictLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Transfers */}
                  <div>
                    <p className="text-[9px] font-medium text-emerald-400/70 mb-1">Transfers</p>
                    {p.transfers.map((t, i) => (
                      <p key={i} className="text-[9px] text-muted-foreground/60 leading-relaxed flex items-start gap-1">
                        <Check className="h-2.5 w-2.5 text-emerald-400/50 shrink-0 mt-0.5" />
                        {t}
                      </p>
                    ))}
                  </div>
                  {/* Doesn't transfer */}
                  {p.doesNotTransfer.length > 0 && (
                    <div>
                      <p className="text-[9px] font-medium text-red-400/60 mb-1">Needs new work</p>
                      {p.doesNotTransfer.map((t, i) => (
                        <p key={i} className="text-[9px] text-muted-foreground/60 leading-relaxed flex items-start gap-1">
                          <X className="h-2.5 w-2.5 text-red-400/40 shrink-0 mt-0.5" />
                          {t}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
