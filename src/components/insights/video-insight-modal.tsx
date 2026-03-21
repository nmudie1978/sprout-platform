/**
 * VIDEO INSIGHT MODAL
 *
 * shadcn Dialog modal for playing curated Youth Lens videos.
 * - Embedded iframe (YouTube/Vimeo supported)
 * - Title + description above video
 * - Close button top-right (built into DialogContent)
 * - No autoplay
 *
 * Videos must be manually curated by admin.
 * Future: CMS-based moderation system.
 * No user-submitted videos at MVP stage.
 */

"use client";

import { Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  VIDEO_TYPE_LABELS,
  VIDEO_SOURCE_LABELS,
  formatDuration,
  type VideoAsset,
} from "@/lib/youth-lens/types";

// ============================================
// COMPONENT
// ============================================

interface VideoInsightModalProps {
  video: VideoAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoInsightModal({
  video,
  open,
  onOpenChange,
}: VideoInsightModalProps) {
  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Header with metadata */}
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px]">
              {VIDEO_TYPE_LABELS[video.type]}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {VIDEO_SOURCE_LABELS[video.source]}
            </Badge>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {formatDuration(video.durationSec)}
            </span>
          </div>
          <DialogTitle className="text-base">{video.title}</DialogTitle>
          <DialogDescription className="text-xs">
            {video.description}
          </DialogDescription>
        </DialogHeader>

        {/* Embedded video player — no autoplay */}
        <div className="relative aspect-video bg-black">
          <iframe
            src={`${video.embedUrl}?autoplay=0&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
