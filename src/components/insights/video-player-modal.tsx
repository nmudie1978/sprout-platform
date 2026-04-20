/**
 * VIDEO PLAYER MODAL
 *
 * Embedded YouTube player modal for Industry Insights.
 * Features:
 * - Embedded playback without leaving the page
 * - Video metadata display
 * - Save to Library integration
 * - Keyboard accessibility (Escape to close)
 */

"use client";

import { useEffect, useCallback } from "react";
import { X, ExternalLink, Bookmark, BookmarkCheck, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    videoId: string;
    title: string;
    channelTitle: string;
    description?: string;
    duration?: string;
    viewCount?: string;
    publishedAt?: string;
  } | null;
  onSave?: (video: { videoId: string; title: string; channelTitle: string }) => void;
  isSaved?: boolean;
  isSaving?: boolean;
}

// ============================================
// HELPERS
// ============================================

function formatViewCount(count: string | undefined): string {
  if (!count) return "";
  const num = parseInt(count, 10);
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M views`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K views`;
  }
  return `${num} views`;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

// ============================================
// COMPONENT
// ============================================

export function VideoPlayerModal({
  isOpen,
  onClose,
  video,
  onSave,
  isSaved = false,
  isSaving = false,
}: VideoPlayerModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !video) return null;

  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-card text-card-foreground rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0 pr-4">
            <h2
              id="video-modal-title"
              className="font-semibold text-base truncate"
            >
              {video.title}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {video.channelTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save button */}
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSave(video)}
                disabled={isSaving || isSaved}
                className={cn(
                  "gap-1.5",
                  isSaved && "text-primary"
                )}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {isSaving ? "Saving..." : "Save"}
                    </span>
                  </>
                )}
              </Button>
            )}

            {/* Open in YouTube */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1.5"
            >
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">YouTube</span>
              </a>
            </Button>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Video player */}
        <div className="relative aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Footer with metadata */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {video.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{video.duration}</span>
              </div>
            )}
            {video.viewCount && (
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>{formatViewCount(video.viewCount)}</span>
              </div>
            )}
            {video.publishedAt && (
              <span>{formatDate(video.publishedAt)}</span>
            )}
          </div>

          {video.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
