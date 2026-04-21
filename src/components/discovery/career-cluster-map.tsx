'use client';

/**
 * Career Cluster Map
 *
 * Visual exploration surface: given a career, shows the 6-8 most
 * related careers as cards radiating around a central "you picked
 * this" node. Each card shows the career emoji + title + a one-line
 * relationship label ("Similar work environment", "Same career
 * family", etc.) + shared traits as small badges.
 *
 * Designed as a sub-feature of Career Radar. When a user taps a
 * career on the radar, this component answers "what else might I
 * like?" without requiring them to re-do the quiz.
 *
 * The cluster data is computed client-side via getCareerCluster()
 * from the matching engine — no API call needed.
 */

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { getCareerCluster, type RelatedCareer, type ClusterResult } from '@/lib/matching/career-clusters';
import { Network, ChevronRight, Sparkles } from 'lucide-react';

interface CareerClusterMapProps {
  /** The career to show clusters for. */
  careerId: string;
  /** Called when the user taps a related career to explore it. */
  onSelectCareer?: (careerId: string) => void;
  /** Max related careers to show. Default 8. */
  limit?: number;
}

export function CareerClusterMap({ careerId, onSelectCareer, limit = 8 }: CareerClusterMapProps) {
  const cluster = useMemo(() => getCareerCluster(careerId, { limit }), [careerId, limit]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!cluster || cluster.related.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Network className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-foreground/90">
            Related careers
          </h3>
          <p className="text-[11px] text-muted-foreground/70">
            If you like {cluster.center.emoji} {cluster.center.title}, you might also explore
          </p>
        </div>
      </div>

      {/* ── Cluster grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {cluster.related.map((r) => (
          <button
            key={r.career.id}
            type="button"
            onClick={() => onSelectCareer?.(r.career.id)}
            onMouseEnter={() => setHoveredId(r.career.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              'group flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
              hoveredId === r.career.id
                ? 'border-primary/40 bg-primary/[0.06]'
                : 'border-border/30 bg-card/40 hover:border-border/50',
            )}
          >
            {/* Emoji */}
            <span className="text-lg leading-none mt-0.5 shrink-0">
              {r.career.emoji ?? '💼'}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-foreground/90 truncate">
                  {r.career.title}
                </span>
                <span className="text-[10px] text-primary/70 font-medium tabular-nums shrink-0">
                  {Math.round(r.similarity * 100)}%
                </span>
              </div>

              {/* Relationship label */}
              <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">
                {r.label}
              </p>

              {/* Shared traits */}
              {r.sharedTraits.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {r.sharedTraits.slice(0, 3).map((trait) => (
                    <span
                      key={trait}
                      className="inline-flex items-center rounded-full bg-muted/50 px-1.5 py-0.5 text-[9px] text-muted-foreground/75"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors mt-1 shrink-0" />
          </button>
        ))}
      </div>

      {/* ── Hint ────────────────────────────────────────────────── */}
      <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Based on work style, skills, and study requirements
      </p>
    </div>
  );
}
