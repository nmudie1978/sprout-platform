'use client';

/**
 * "Worth a look" — a compact dashboard card surfacing ONE fresh, verified
 * read from the world of work, gently leaned toward the sectors the user keeps
 * exploring (their saved/rated careers — NOT the volatile primary goal).
 *
 * Replaces the old Reflections preview. Calm by design: one item, a quiet
 * "show another" shuffle, no feed, no infinite scroll. The full set lives on
 * the Insights page. Reuses the verified insights pool (source-enforced,
 * domain-allowlisted, anti-repeat) — the only personalisation is a soft tag
 * boost, so the card is never empty.
 */

import { useMemo } from 'react';
import { FileText, Play, BarChart3, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInsightsPool } from '@/hooks/use-insights-pool';
import { deriveClusterTags } from '@/lib/insights/cluster-tags';
import type { PoolContentType } from '@/lib/insights/pool-types';

const TYPE_ICON: Record<PoolContentType, typeof FileText> = {
  article: FileText,
  video: Play,
  stat_report: BarChart3,
  pdf: FileText,
};

/** Compact relative-time label from an ISO date, or null if absent/invalid. */
function relTime(iso?: string): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const days = Math.floor((Date.now() - t) / 86_400_000);
  if (days < 0) return null;
  if (days <= 1) return 'this week';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function WorthALook({ careerIds }: { careerIds: string[] }) {
  const tags = useMemo(() => deriveClusterTags(careerIds), [careerIds]);
  // One item at a time; "show another" excludes what's been seen (anti-repeat).
  const { currentBatch, isLoading, fetchMore } = useInsightsPool(1, tags);
  const item = currentBatch[0];

  if (isLoading && !item) {
    return (
      <div className="space-y-2 animate-pulse" aria-hidden>
        <div className="h-3 w-3/4 rounded bg-muted/40" />
        <div className="h-3 w-1/2 rounded bg-muted/30" />
        <div className="h-2.5 w-1/3 rounded bg-muted/20 mt-3" />
      </div>
    );
  }

  if (!item) {
    return (
      <p className="text-xs text-muted-foreground/50">
        Fresh reads from the world of work will appear here.
      </p>
    );
  }

  const Icon = TYPE_ICON[item.contentType] ?? FileText;
  const fresh = relTime(item.publishDate);

  return (
    <div className="relative h-full">
      {/* Quiet "show another" — pulls the next verified item, never repeats. */}
      <button
        type="button"
        onClick={fetchMore}
        title="Show another"
        aria-label="Show another"
        className="absolute -top-1 right-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/40 transition-colors"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
      </button>

      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block pr-7"
      >
        <div className="flex items-start gap-2">
          <Icon className="h-3.5 w-3.5 text-violet-400/80 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-foreground/90 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </p>
        </div>
        {item.summary && (
          <p className="mt-1 text-[11px] text-muted-foreground/70 leading-snug line-clamp-2">
            {item.summary}
          </p>
        )}
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <span className="truncate max-w-[150px]">{item.sourceName}</span>
          {item.duration && <span>· {item.duration}</span>}
          {fresh && <span>· {fresh}</span>}
          <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
        </p>
      </a>
    </div>
  );
}
