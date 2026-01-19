"use client";

import { ExternalLink, Headphones, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPodcastsForGoal,
  hasPodcastsForGoal,
  type PodcastRecommendation,
} from "@/lib/podcasts/recommendations";

/**
 * Goal Podcasts Component
 *
 * Displays "Voices from the field" podcast recommendations within a goal section.
 *
 * Rules:
 * - Max 3 podcasts per goal
 * - Clearly optional
 * - No autoplay, no feed, no discovery
 * - Links open externally in new tab
 * - If no podcasts exist for a goal, component returns null (no empty state)
 */

interface GoalPodcastsProps {
  goalTitle: string;
  isPrimary?: boolean;
  isCollapsed?: boolean; // For secondary goal - can be collapsed
}

export function GoalPodcasts({
  goalTitle,
  isPrimary = true,
  isCollapsed = false,
}: GoalPodcastsProps) {
  // Get podcasts for this goal
  const podcasts = getPodcastsForGoal(goalTitle);

  // If no podcasts, don't render anything (as per requirements)
  if (podcasts.length === 0) {
    return null;
  }

  // Secondary goal - lighter styling, collapsed by default handled by parent
  if (isCollapsed) {
    return null;
  }

  return (
    <div
      className={`mt-4 pt-4 border-t ${
        isPrimary
          ? "border-purple-200/50 dark:border-purple-800/50"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-2">
        <Headphones
          className={`h-4 w-4 ${
            isPrimary ? "text-purple-500" : "text-slate-500"
          }`}
        />
        <h4 className="text-sm font-medium">Voices from the field</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Optional listening from professionals in this area.
      </p>

      {/* Podcast List */}
      <div className="space-y-2">
        {podcasts.map((podcast) => (
          <PodcastItem key={podcast.id} podcast={podcast} isPrimary={isPrimary} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual podcast item
 */
function PodcastItem({
  podcast,
  isPrimary,
}: {
  podcast: PodcastRecommendation;
  isPrimary: boolean;
}) {
  return (
    <div
      className={`p-2.5 rounded-lg border transition-colors ${
        isPrimary
          ? "border-purple-100 dark:border-purple-900/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/30"
          : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Podcast title and episode */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <Volume2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate">{podcast.title}</span>
          </div>
          {podcast.episodeTitle && (
            <p className="text-xs text-muted-foreground truncate pl-4.5 mb-0.5">
              {podcast.episodeTitle}
            </p>
          )}
          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 pl-4.5">
            {podcast.description}
          </p>
        </div>

        {/* External link button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-950/50 flex-shrink-0"
          asChild
        >
          <a
            href={podcast.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Listen to ${podcast.title} on Spotify`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 mr-1"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Spotify
            <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}

/**
 * Utility export for checking if podcasts exist
 */
export { hasPodcastsForGoal };
