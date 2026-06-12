'use client';

/**
 * "Worth a look" — a compact dashboard card surfacing THREE fresh, verified
 * reads from the world of work, gently leaned toward the sectors the user keeps
 * exploring (their saved/rated careers — NOT the volatile primary goal).
 *
 * Calm by design: three items as neat rows (no long summaries), a quiet
 * "show another" shuffle, no feed, no infinite scroll. The full set lives on
 * the Insights page. Reuses the verified insights pool (source-enforced,
 * domain-allowlisted, anti-repeat) — the only personalisation is a soft tag
 * boost, so the card is never empty.
 *
 * Auto-rotation: the visible three quietly cycle every 10s by windowing through
 * an already-loaded pool (no per-tick network call — gentle on the server).
 * Rotation pauses on hover/focus and respects `prefers-reduced-motion`, and the
 * manual "show another" button still pulls a brand-new verified set.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Play, BarChart3, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInsightsPool } from '@/hooks/use-insights-pool';
import { deriveClusterTags } from '@/lib/insights/cluster-tags';
import { useCareerCatalog } from '@/hooks/use-career-catalog';
import type { PoolContentType } from '@/lib/insights/pool-types';

const TYPE_ICON: Record<PoolContentType, typeof FileText> = {
  article: FileText,
  video: Play,
  stat_report: BarChart3,
  pdf: FileText,
};

const VISIBLE = 3;
/** Larger pool fetched once, then windowed 3-at-a-time on auto-rotate. */
const POOL_SIZE = 9;
const ROTATION_INTERVAL = 10_000; // 10 seconds

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
  const { findCareerCategory } = useCareerCatalog();
  const tags = useMemo(
    () => deriveClusterTags(careerIds, findCareerCategory),
    [careerIds, findCareerCategory],
  );
  // Fetch a larger verified pool once; we window 3 items at a time. "Show
  // another" still pulls the next fresh set (anti-repeat). No long summaries —
  // just a title and a quiet source line.
  const { currentBatch, isLoading, fetchMore } = useInsightsPool(POOL_SIZE, tags);

  // Rolling window into the loaded pool — advances on the 10s auto-rotate.
  const [windowStart, setWindowStart] = useState(0);

  // Pause auto-rotation on hover/focus and when reduced motion is preferred.
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Respect the user's reduced-motion preference (accessibility / calm-by-design).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const pool = currentBatch;
  const poolLen = pool.length;

  // Keep the window in range whenever the pool changes (e.g. after "show another").
  useEffect(() => {
    setWindowStart(0);
  }, [poolLen]);

  // Auto-rotate: step the window forward by VISIBLE every 10s, wrapping round.
  // Only worth rotating if the pool holds more than one screenful.
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (isPaused || prefersReducedMotion || poolLen <= VISIBLE) return;

    intervalRef.current = setInterval(() => {
      setWindowStart((prev) => (prev + VISIBLE) % poolLen);
    }, ROTATION_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, prefersReducedMotion, poolLen]);

  // Manual refresh: pull a brand-new verified set and reset the window.
  const handleShowAnother = useCallback(() => {
    fetchMore();
    setWindowStart(0);
  }, [fetchMore]);

  // Pause handlers (pause while the user is reading/interacting).
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
  const handleFocusIn = useCallback(() => setIsPaused(true), []);
  const handleFocusOut = useCallback((e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsPaused(false);
    }
  }, []);

  // Window VISIBLE items, wrapping so a partial tail still fills three rows.
  const items =
    poolLen === 0
      ? []
      : Array.from({ length: Math.min(VISIBLE, poolLen) }, (_, i) => pool[(windowStart + i) % poolLen]);

  if (isLoading && poolLen === 0) {
    return (
      <div className="space-y-3 animate-pulse" aria-hidden>
        {[0, 1, 2].map((i) => (
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
      <p className="text-xs text-muted-foreground/70">
        Fresh reads from the world of work will appear here.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
      aria-live="polite"
      className="relative h-full"
    >
      {/* Quiet "show another" — pulls the next verified set, never repeats. */}
      <button
        type="button"
        onClick={handleShowAnother}
        title="Show another"
        aria-label="Show another"
        className="absolute -top-1 right-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/65 hover:text-foreground hover:bg-muted/40 transition-colors"
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
                className={cn(
                  'group flex items-start gap-2 py-2 first:pt-0',
                  prefersReducedMotion ? '' : 'transition-opacity duration-300',
                )}
              >
                <Icon className="h-3.5 w-3.5 text-violet-400/80 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground/90 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground/70">
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
