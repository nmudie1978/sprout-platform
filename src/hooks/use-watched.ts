"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WatchedResponse {
  watchedUrls: string[];
}

/**
 * Fetch all watched video URLs for the current user.
 */
export function useWatchedVideos(enabled = true) {
  return useQuery<WatchedResponse>({
    queryKey: ["watched-videos"],
    queryFn: async () => {
      const res = await fetch("/api/insights/interactions");
      if (!res.ok) throw new Error("Failed to fetch watched videos");
      return res.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Mark a video as watched (idempotent upsert).
 */
export function useMarkWatched() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentUrl: string) => {
      const res = await fetch("/api/insights/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentUrl }),
      });
      if (!res.ok) throw new Error("Failed to mark as watched");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watched-videos"] });
    },
  });
}
