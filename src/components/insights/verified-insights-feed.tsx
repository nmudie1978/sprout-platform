"use client";

import {
  Compass,
  ExternalLink,
  RefreshCw,
  Loader2,
  FileText,
  PlayCircle,
  BarChart3,
  FileDown,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedBadge } from "./verified-badge";
import { useInsightsPool } from "@/hooks/use-insights-pool";
import type { PoolContentType, PoolItem } from "@/lib/insights/pool-types";

// ---------------------------------------------------------------------------
// Content type styling
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  PoolContentType,
  { icon: typeof FileText; label: string; color: string; bg: string }
> = {
  article: {
    icon: FileText,
    label: "Article",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  video: {
    icon: PlayCircle,
    label: "Video",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  stat_report: {
    icon: BarChart3,
    label: "Report",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  pdf: {
    icon: FileDown,
    label: "PDF",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
};

// ---------------------------------------------------------------------------
// Single content card
// ---------------------------------------------------------------------------

function InsightCard({ item }: { item: PoolItem }) {
  const config = TYPE_CONFIG[item.contentType];
  const Icon = config.icon;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col gap-3 h-full">
        {/* Type badge + duration */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
          {item.duration && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {item.duration}
            </span>
          )}
        </div>

        {/* Title */}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sm leading-snug hover:text-primary transition-colors line-clamp-2"
        >
          {item.title}
          <ExternalLink className="inline h-3 w-3 ml-1 opacity-0 group-hover:opacity-60 transition-opacity" />
        </a>

        {/* Summary */}
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {item.summary}
        </p>

        {/* Source + verified */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground truncate">
            {item.sourceName}
          </span>
          <VerifiedBadge verifiedAt={item.lastVerifiedAt} />
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[9px] px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Feed component
// ---------------------------------------------------------------------------

export function VerifiedInsightsFeed() {
  const {
    currentBatch,
    isLoading,
    hasMore,
    fetchMore,
  } = useInsightsPool(5);

  // Empty state: no items at all
  if (!isLoading && currentBatch.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Content is being verified. Check back soon.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          Explore More
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verified articles, videos, and reports from trusted sources
        </p>
      </div>

      {/* Loading skeleton */}
      {isLoading && currentBatch.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content grid */}
      {currentBatch.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentBatch.map((item) => (
            <InsightCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Give me more button */}
      <div className="flex justify-center mt-6">
        {hasMore ? (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMore}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isLoading ? "Loading..." : "Give me more"}
          </Button>
        ) : currentBatch.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            You&apos;ve explored everything — check back later
          </p>
        ) : null}
      </div>
    </div>
  );
}
