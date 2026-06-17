"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CAREER_VIDEO_TAG } from "@/lib/insights/saved-content";

export interface SaveableVideo {
  /** YouTube video id — the only field we strictly need. */
  videoId: string;
  title?: string | null;
  /** Channel / publisher name, stored as the item's `source`. */
  channel?: string | null;
  /** Optional career slug so the saved video can be grouped by career. */
  careerPathId?: string | null;
}

/**
 * Bookmark career videos into the My Library "My Content" tab. Mirrors the
 * optimistic-save pattern used by the (now-retired) Skills That Matter
 * gallery: flip local state instantly + toast, POST to the shared saved-items
 * API tagged CAREER_VIDEO_TAG, and roll back on failure.
 *
 * `isSaved` reflects this session's saves only (no pre-load of server state),
 * which is enough for the bookmark to feel responsive; the server dedupes by
 * URL so re-saving across sessions never creates duplicates.
 */
export function useVideoSaves() {
  const { toast } = useToast();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const isSaved = useCallback(
    (videoId: string) => savedIds.has(videoId),
    [savedIds],
  );

  const save = useCallback(
    async (video: SaveableVideo) => {
      if (!video.videoId || savedIds.has(video.videoId)) return;

      // Optimistic: show the bookmark filled immediately.
      setSavedIds((prev) => new Set(prev).add(video.videoId));
      toast({ title: "Saved to My Library" });

      try {
        const res = await fetch("/api/journey/saved-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "VIDEO",
            title: video.title?.trim() || "Career video",
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
            source: video.channel?.trim() || "YouTube",
            thumbnail: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
            tags: [CAREER_VIDEO_TAG],
            ...(video.careerPathId ? { careerPathId: video.careerPathId } : {}),
          }),
        });
        if (!res.ok) throw new Error("save failed");
      } catch {
        // Roll back the optimistic state and let the user know.
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(video.videoId);
          return next;
        });
        toast({
          title: "Couldn't save",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    },
    [savedIds, toast],
  );

  return { save, isSaved };
}
