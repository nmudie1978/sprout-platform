"use client";

import { motion } from "framer-motion";
import { Play, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CareerClipForDisplay } from "@/lib/career-clips/types";

interface CareerClipCardProps {
  clip: CareerClipForDisplay;
  onClick: () => void;
  className?: string;
}

/**
 * Format duration from seconds to MM:SS
 */
function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get platform icon and color
 */
function getPlatformStyles(platform: "TIKTOK" | "YOUTUBE_SHORTS") {
  switch (platform) {
    case "TIKTOK":
      return {
        bgColor: "bg-gradient-to-br from-pink-500/10 to-cyan-500/10",
        iconColor: "text-pink-500",
      };
    case "YOUTUBE_SHORTS":
      return {
        bgColor: "bg-gradient-to-br from-red-500/10 to-orange-500/10",
        iconColor: "text-red-500",
      };
    default:
      return {
        bgColor: "bg-muted/30",
        iconColor: "text-muted-foreground",
      };
  }
}

export function CareerClipCard({
  clip,
  onClick,
  className,
}: CareerClipCardProps) {
  const platformStyles = getPlatformStyles(clip.platform);
  const duration = formatDuration(clip.durationSecs);

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border bg-card text-left transition-all",
        "hover:border-primary/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Thumbnail area */}
      <div
        className={cn(
          "relative aspect-[9/16] w-full overflow-hidden rounded-t-xl",
          platformStyles.bgColor
        )}
      >
        {clip.thumbnailUrl ? (
          <img
            src={clip.thumbnailUrl}
            alt={clip.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className={cn("h-12 w-12", platformStyles.iconColor)} />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-3 shadow-lg">
            <Play className="h-6 w-6 text-gray-900" />
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="p-3">
        <h4 className="line-clamp-2 text-sm font-medium leading-tight">
          {clip.title}
        </h4>

        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            {clip.sourceLabel}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
