/**
 * INSIGHT VIDEOS — Industry Insights Video Section
 *
 * Enhanced video section with:
 * - Pillar filters (Explore/Learn/Grow/All)
 * - Max 5 videos displayed
 * - Balanced selection across pillars
 * - Source and date metadata
 * - Click-to-watch only (no autoplay)
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Compass, BookOpen, TrendingUp } from "lucide-react";
import {
  getDisplayVideos,
  PILLAR_INFO,
  type VideoPillar,
  type InsightVideo,
} from "@/lib/industry-insights/video-pool";

// ============================================
// TYPES
// ============================================

interface InsightVideosProps {
  className?: string;
}

type FilterOption = VideoPillar | "all";

// ============================================
// PILLAR ICONS
// ============================================

const pillarIcons: Record<VideoPillar, React.ElementType> = {
  explore: Compass,
  learn: BookOpen,
  grow: TrendingUp,
};

const pillarColors: Record<VideoPillar, string> = {
  explore: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  learn: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  grow: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

// ============================================
// DATE FORMATTER
// ============================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

// ============================================
// VIDEO CARD
// ============================================

function VideoCard({ video }: { video: InsightVideo }) {
  const PillarIcon = pillarIcons[video.pillarTag];

  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.videoUrl}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="overflow-hidden border hover:border-muted-foreground/50 transition-all duration-200 hover:shadow-sm h-full">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-3 w-3 text-slate-800 ml-0.5" fill="currentColor" />
            </div>
          </div>
          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 rounded text-white text-[8px]">
              {video.duration}
            </div>
          )}
          {/* Evergreen badge */}
          {video.isEvergreen && (
            <div className="absolute top-1 left-1 px-1 py-0.5 bg-emerald-600/90 rounded text-white text-[7px] font-medium">
              Evergreen
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-2 space-y-1">
          {/* Pillar badge */}
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className={`text-[8px] px-1 py-0 h-4 ${pillarColors[video.pillarTag]}`}
            >
              <PillarIcon className="h-2 w-2 mr-0.5" />
              {PILLAR_INFO[video.pillarTag].label}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-medium text-[11px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>

          {/* Source + Date */}
          <p className="text-[9px] text-muted-foreground">
            {video.sourceName} • {formatDate(video.publishDate)}
          </p>
        </CardContent>
      </Card>
    </a>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function InsightVideos({ className }: InsightVideosProps) {
  const [filter, setFilter] = useState<FilterOption>("all");

  const { videos, isEmpty, message } = getDisplayVideos(filter);

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: "all", label: "All" },
    { value: "explore", label: "Explore" },
    { value: "learn", label: "Learn" },
    { value: "grow", label: "Grow" },
  ];

  return (
    <div className={className}>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-3">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              filter === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Videos grid or empty state */}
      {isEmpty ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          {message}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 max-w-4xl">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <p className="text-[9px] text-muted-foreground text-center mt-3">
        Videos open in YouTube • Curated from Tier-1 sources
      </p>
    </div>
  );
}
