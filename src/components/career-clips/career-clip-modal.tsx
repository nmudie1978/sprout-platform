"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import type { CareerClipForDisplay } from "@/lib/career-clips/types";

interface CareerClipModalProps {
  clip: CareerClipForDisplay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Get the embed URL for YouTube Shorts
 */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.pathname.includes("/shorts/")) {
      videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0];
    } else if (parsed.searchParams.has("v")) {
      videoId = parsed.searchParams.get("v");
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Career Clip Modal
 *
 * Opens a clip in a modal with two primary actions:
 * 1. "Continue my journey" - routes to Build stage
 * 2. "Back to Explore" - closes modal
 *
 * For YouTube: attempts embedded playback
 * For TikTok: opens external link (embeds unreliable)
 */
export function CareerClipModal({
  clip,
  open,
  onOpenChange,
}: CareerClipModalProps) {
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  // Reset state when clip changes
  useEffect(() => {
    setEmbedLoaded(false);
    setEmbedError(false);
  }, [clip?.id]);

  if (!clip) return null;

  const isYouTube = clip.platform === "YOUTUBE_SHORTS";
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(clip.url) : null;
  const canEmbed = isYouTube && embedUrl && !embedError;

  // Build the journey continuation URL
  const buildStageUrl = clip.careerSlug
    ? `/my-journey/build?career=${clip.careerSlug}`
    : "/my-journey/build";

  // Handler for opening external link
  const handleOpenExternal = () => {
    // Open in new tab (validated URL is guaranteed to work)
    window.open(clip.url, "_blank", "noopener,noreferrer");
  };

  // Handle embed load timeout
  useEffect(() => {
    if (canEmbed && !embedLoaded) {
      const timeout = setTimeout(() => {
        if (!embedLoaded) {
          setEmbedError(true);
        }
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeout);
    }
  }, [canEmbed, embedLoaded]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-base font-semibold line-clamp-2">
            {clip.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {clip.sourceLabel}
          </DialogDescription>
        </DialogHeader>

        {/* Video area */}
        <div className="relative aspect-[9/16] w-full bg-muted">
          {canEmbed ? (
            <>
              {!embedLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              <iframe
                src={embedUrl}
                title={clip.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setEmbedLoaded(true)}
                onError={() => setEmbedError(true)}
              />
            </>
          ) : (
            // Fallback: Open externally button
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
              {clip.thumbnailUrl ? (
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-30"
                />
              ) : null}

              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Play className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Watch on {clip.platform === "TIKTOK" ? "TikTok" : "YouTube"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Opens in a new tab
                  </p>
                </div>
                <Button onClick={handleOpenExternal} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open on {clip.platform === "TIKTOK" ? "TikTok" : "YouTube"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Feeling inspired? Map out what it takes.
          </p>

          <Button asChild className="w-full gap-2">
            <Link href={buildStageUrl}>
              Continue my journey
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Back to Explore
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
