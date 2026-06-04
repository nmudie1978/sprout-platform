'use client';

/**
 * "Worth a look" — a compact dashboard card surfacing TWO fresh, verified
 * reads from the world of work, gently leaned toward the sectors the user keeps
 * exploring (their saved/rated careers — NOT the volatile primary goal).
 *
 * Calm by design: two items as neat rows (no long summaries), a quiet
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
  // Always two items; "show another" swaps both for the next verified pair
  // (anti-repeat). No long summaries — just a title and a quiet source line.
  const { currentBatch, isLoading, fetchMore } = useInsightsPool(2, tags);
  const items = currentBatch.slice(0, 2);

  if (isLoading && items.length === 0) {
    return (
      <div className="space-y-3 animate-pulse" aria-hidden>
        {[0, 1].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-3/4 rounded bg-muted/40" />
            <div className="h-2.5 w-1/3 rounded bg-muted/20" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50">
        Fresh reads from the world of work will appear here.
      </p>
    );
  }

  return (
    <div className="relative h-full">
      {/* Quiet "show another" — pulls the next verified pair, never repeats. */}
      <button
        type="button"
        onClick={fetchMore}
        title="Show another"
        aria-label="Show another"
        className="absolute -top-1 right-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/40 transition-colors"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
      </button>

      <ul className="divide-y divide-border/30 pr-7">
        {items.map((item) => {
          const Icon = TYPE_ICON[item.contentType] ?? FileText;
          const fresh = relTime(item.publishDate);
          return (
            <li key={item.id}>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 py-2 first:pt-0"
              >
                <Icon className="h-3.5 w-3.5 text-violet-400/80 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground/90 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground/50">
                    {item.sourceName}
                    {fresh && ` · ${fresh}`}
                  </p>
                </div>
                <ExternalLink className="h-2.5 w-2.5 shrink-0 mt-1 opacity-0 group-hover:opacity-60 transition-opacity" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
