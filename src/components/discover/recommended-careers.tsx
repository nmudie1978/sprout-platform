'use client';

import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDiscoverRecommendations } from '@/hooks/use-discover-recommendations';

/**
 * Recommended Careers Section
 *
 * Shows personalised career recommendations based on Discover profile.
 * Can be placed on Dashboard, Explore Careers, or anywhere.
 */
export function RecommendedCareers({ className, limit = 4 }: { className?: string; limit?: number }) {
  const { data, isLoading } = useDiscoverRecommendations();

  if (isLoading || !data) return null;

  // Not completed Discover — show prompt
  if (!data.hasProfile) {
    return (
      <div className={cn('rounded-xl border border-teal-500/20 bg-teal-500/5 p-5', className)}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 shrink-0">
            <Sparkles className="h-5 w-5 text-teal-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1">Get personalised recommendations</h3>
            <p className="text-xs text-muted-foreground/70 mb-3">
              Answer a few quick questions about your interests and strengths to unlock career suggestions tailored to you.
            </p>
            <Link href="/my-journey/discover">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-xs">
                Start Discover
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (data.recommendations.length === 0) return null;

  const recs = data.recommendations.slice(0, limit);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-500" />
          <h3 className="text-sm font-semibold">Recommended for you</h3>
        </div>
        <Link href="/my-journey/discover" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          Update profile
        </Link>
      </div>

      {/* Summary */}
      {data.summary && (
        <p className="text-xs text-muted-foreground/60 -mt-1">{data.summary}</p>
      )}

      {/* Career cards */}
      <div className="grid gap-2 sm:grid-cols-2">
        {recs.map((rec) => (
          <Link
            key={rec.careerId}
            href={`/careers?search=${encodeURIComponent(rec.title)}`}
            className="group rounded-lg border border-border/40 bg-card/50 hover:border-teal-500/30 hover:bg-teal-500/5 p-3 transition-all"
          >
            <div className="flex items-start gap-2.5">
              <span className="text-lg shrink-0">{rec.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold group-hover:text-teal-400 transition-colors truncate">
                  {rec.title}
                </p>
                {rec.reasons.length > 0 && (
                  <p className="text-[10px] text-teal-500/60 mt-0.5 line-clamp-1">
                    {rec.reasons[0]}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  {rec.growthOutlook === 'high' && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-500/70">
                      <TrendingUp className="h-2.5 w-2.5" />
                      High growth
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact Discover Summary Card
 * Shows the user's Discover summary on dashboard.
 */
export function DiscoverSummaryCard({ className }: { className?: string }) {
  const { data } = useDiscoverRecommendations();

  if (!data?.hasProfile || !data.summary) return null;

  return (
    <div className={cn('rounded-lg border border-teal-500/15 bg-teal-500/5 p-3', className)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles className="h-3 w-3 text-teal-500" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-teal-500/60">Your profile</span>
      </div>
      <p className="text-xs text-muted-foreground/80 leading-relaxed">{data.summary}</p>
      <Link
        href="/my-journey/discover"
        className="inline-flex items-center gap-1 mt-2 text-[10px] text-teal-500/50 hover:text-teal-400 transition-colors"
      >
        Update
        <ArrowRight className="h-2.5 w-2.5" />
      </Link>
    </div>
  );
}
