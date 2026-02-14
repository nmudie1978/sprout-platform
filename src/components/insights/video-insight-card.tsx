/**
 * VIDEO INSIGHT CARD
 *
 * Reusable card for curated short-form videos tied to Youth Lens stats.
 * Displays thumbnail, duration badge, video type badge, title, source, and description.
 *
 * - Hover: subtle scale (1.02) + soft shadow
 * - Tap: subtle press animation
 * - Click: triggers parent callback to open modal
 *
 * Videos must be manually curated by admin.
 * Future: CMS-based moderation system.
 * No user-submitted videos at MVP stage.
 */

"use client";

import { useState } from "react";
import { Play, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  VIDEO_TYPE_LABELS,
  VIDEO_SOURCE_LABELS,
  formatDuration,
  type VideoAsset,
  type VideoType,
} from "@/lib/youth-lens/types";

// ============================================
// BADGE STYLES
// ============================================

const TYPE_BADGE_STYLES: Record<VideoType, string> = {
  story: "bg-emerald-500/90 text-white",
  day_in_life: "bg-emerald-600/90 text-white",
  explainer: "bg-emerald-700/90 text-white",
};

// ============================================
// COMPONENT
// ============================================

interface VideoInsightCardProps {
  video: VideoAsset;
  onClick: (video: VideoAsset) => void;
}

export function VideoInsightCard({ video, onClick }: VideoInsightCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      onClick={() => onClick(video)}
      className="group relative w-full text-left rounded-2xl overflow-hidden border bg-card transition-colors"
      whileHover={{
        scale: 1.02,
        boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.08)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        {!imgError && video.thumbnailUrl && (
          <img
            src={video.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="h-4 w-4 text-foreground ml-0.5" />
          </div>
        </div>

        {/* Duration badge — top right */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/75 text-white text-[10px] px-1.5 py-0 font-mono border-0">
            <Clock className="h-2.5 w-2.5 mr-0.5" />
            {formatDuration(video.durationSec)}
          </Badge>
        </div>

        {/* Type badge — top left */}
        <div className="absolute top-2 left-2">
          <Badge
            className={`text-[10px] px-1.5 py-0 border-0 ${TYPE_BADGE_STYLES[video.type]}`}
          >
            {VIDEO_TYPE_LABELS[video.type]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-xs font-semibold leading-snug line-clamp-2 mb-1">
          {video.title}
        </h4>
        <p className="text-[10px] text-muted-foreground/70 mb-1">
          {VIDEO_SOURCE_LABELS[video.source]}
        </p>
        <p className="text-[10px] text-muted-foreground line-clamp-1">
          {video.description}
        </p>
      </div>
    </motion.button>
  );
}
