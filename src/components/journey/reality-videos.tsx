'use client';

import { useState } from 'react';
import { Play, Video } from 'lucide-react';
import type { RealityVideo } from '@/lib/career-reality-types';

// Show three reality videos side by side; the rest of the pool is revealed on
// demand via "Show more". The API returns up to ~8, so "more" surfaces up to
// five additional clips without any extra fetch.
const INITIAL_VISIBLE = 3;

export function RealityVideos({ videos }: { videos: RealityVideo[] }) {
  const [showAll, setShowAll] = useState(false);

  if (videos.length === 0) return null;

  const visible = showAll ? videos : videos.slice(0, INITIAL_VISIBLE);
  const remaining = videos.length - visible.length;

  return (
    <div className="pt-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/65 mb-1.5">
        Real voices
      </p>
      {/* Three across on desktop, dropping to two then one on smaller screens. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((video) => (
          <div key={video.videoId} className="space-y-1.5">
            <div className="rounded-control overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}`}
                className="w-full aspect-video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title.replace(/&amp;/g, '&')}
              />
            </div>
            <div className="flex items-center gap-1.5 px-0.5">
              <Play className="h-3 w-3 text-muted-foreground/65 shrink-0" />
              <span className="text-xs text-foreground/70 truncate flex-1">
                {video.title.replace(/&amp;/g, '&')}
              </span>
              <span className="text-xs text-muted-foreground/65 shrink-0 hidden lg:inline">
                {video.channel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!showAll && remaining > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Video className="h-3 w-3" />
          Show {remaining} more {remaining === 1 ? 'video' : 'videos'}
        </button>
      )}
    </div>
  );
}
