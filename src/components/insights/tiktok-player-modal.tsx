/**
 * TIKTOK PLAYER MODAL
 *
 * Embedded TikTok player modal for Industry Insights shorts.
 * Features:
 * - TikTok oEmbed integration
 * - Vertical video display (9:16)
 * - Save to Library integration
 * - Keyboard accessibility (Escape to close)
 */

"use client";

import { useEffect, useCallback, useState } from "react";
import { X, ExternalLink, Bookmark, BookmarkCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export interface TikTokPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  short: {
    platform: "tiktok" | "youtube_shorts" | "instagram";
    videoId: string;
    title: string;
    creatorHandle: string;
    creatorName: string;
    description?: string;
  } | null;
  onSave?: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function TikTokPlayerModal({
  isOpen,
  onClose,
  short,
  onSave,
  isSaved = false,
  isSaving = false,
}: TikTokPlayerModalProps) {
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(true);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !short) return null;

  // Build embed URL based on platform
  const getEmbedUrl = () => {
    switch (short.platform) {
      case "tiktok":
        return `https://www.tiktok.com/embed/v2/${short.videoId}`;
      case "youtube_shorts":
        return `https://www.youtube.com/embed/${short.videoId}?loop=1`;
      case "instagram":
        return `https://www.instagram.com/reel/${short.videoId}/embed`;
      default:
        return "";
    }
  };

  // Build external URL
  const getExternalUrl = () => {
    switch (short.platform) {
      case "tiktok":
        return `https://www.tiktok.com/${short.creatorHandle}/video/${short.videoId}`;
      case "youtube_shorts":
        return `https://www.youtube.com/shorts/${short.videoId}`;
      case "instagram":
        return `https://www.instagram.com/reel/${short.videoId}`;
      default:
        return "";
    }
  };

  const platformLabel = {
    tiktok: "TikTok",
    youtube_shorts: "YouTube Shorts",
    instagram: "Instagram Reel",
  }[short.platform];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tiktok-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content - vertical layout for shorts */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-background rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{platformLabel}</p>
              <p className="text-sm font-medium truncate">{short.creatorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Save button */}
            {onSave && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                disabled={isSaving || isSaved}
                className={cn("h-8 w-8", isSaved && "text-primary")}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Open in app */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8"
            >
              <a
                href={getExternalUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
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
            </Button>
          </div>
        </div>

        {/* Video player - 9:16 aspect ratio */}
        <div className="relative bg-black" style={{ aspectRatio: "9/16", maxHeight: "70vh" }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          <iframe
            src={getEmbedUrl()}
            title={short.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Footer with title */}
        <div className="p-3 border-t bg-muted/30">
          <h3
            id="tiktok-modal-title"
            className="font-medium text-sm line-clamp-2"
          >
            {short.title}
          </h3>
          {short.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {short.description}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-2">
            {short.creatorHandle}
          </p>
        </div>
      </div>
    </div>
  );
}
