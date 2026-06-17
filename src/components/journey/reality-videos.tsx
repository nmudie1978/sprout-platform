'use client';

import { useCallback, useRef, useState } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import type { RealityVideo } from '@/lib/career-reality-types';

// Reality clips are shown in a horizontal carousel rather than a growing grid:
// it stays one tidy row whatever the pool size, and the user swipes / clicks
// the arrows to browse. Each tile is a lightweight thumbnail until tapped —
// only then does the YouTube player mount, so we never load 8 embeds at once.
// Videos that can't be embedded are already filtered out server-side
// (api/career-reality), so every tile here is genuinely playable.

const decode = (s: string) => s.replace(/&amp;/g, '&');

// YouTube always serves a thumbnail at this URL, so it's a safe fallback when
// the API didn't hand us one.
const thumbFor = (v: RealityVideo) =>
  v.thumbnailUrl || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

export function RealityVideos({ videos }: { videos: RealityVideo[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<Set<string>>(() => new Set());
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  const scrollByPage = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  }, []);

  const play = useCallback((videoId: string) => {
    setPlaying((prev) => {
      const next = new Set(prev);
      next.add(videoId);
      return next;
    });
  }, []);

  if (videos.length === 0) return null;

  return (
    <div className="pt-1">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/65">
          Real voices
        </p>
        {videos.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={atStart}
              aria-label="Previous videos"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border/40 text-muted-foreground/70 transition-colors hover:text-foreground enabled:hover:border-border disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={atEnd}
              aria-label="More videos"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border/40 text-muted-foreground/70 transition-colors hover:text-foreground enabled:hover:border-border disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Scroll-snap track — full-width tiles on mobile, two on tablet, three
          on desktop. The scrollbar is hidden; navigation is via swipe + arrows. */}
      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {videos.map((video) => {
          const title = decode(video.title);
          return (
            <div
              key={video.videoId}
              className="w-full shrink-0 snap-start space-y-1.5 sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-1.5rem)/3)]"
            >
              <div className="overflow-hidden rounded-control bg-muted/30">
                {playing.has(video.videoId) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                    className="aspect-video w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={title}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => play(video.videoId)}
                    aria-label={`Play: ${title}`}
                    className="group relative block aspect-video w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbFor(video)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/15 transition-colors group-hover:bg-black/30">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform group-hover:scale-105">
                        <Play className="h-5 w-5 translate-x-[1px] text-white" fill="currentColor" />
                      </span>
                    </span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-0.5">
                <Play className="h-3 w-3 shrink-0 text-muted-foreground/65" />
                <span className="flex-1 truncate text-xs text-foreground/70">{title}</span>
                <span className="hidden shrink-0 text-xs text-muted-foreground/65 lg:inline">
                  {video.channel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
