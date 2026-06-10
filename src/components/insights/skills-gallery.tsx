"use client";

/**
 * SkillsGallery — the "Dig Deeper" replacement: a 3D circular gallery that
 * randomly surfaces a mix of "Skills That Matter" articles, podcasts and
 * videos. Each card links out to the underlying content. Deliberately scoped
 * to the skills section only (not "jobs / roles on the rise").
 */

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import type { SectionContent } from "@/lib/industry-insights/insights-service";

const SECTION = "skills-that-matter";
const MAX_ITEMS = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SkillsGallery() {
  const { data, isLoading } = useQuery<SectionContent>({
    queryKey: ["insights-section", SECTION],
    queryFn: async () => {
      const res = await fetch(`/api/insights/section/${SECTION}`);
      if (!res.ok) throw new Error("Failed to load skills content");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  // Build + shuffle the full pool in an effect (not during render) so the
  // ordering is random per visit without tripping render-purity rules. We keep
  // the whole shuffled pool and page through it in MAX_ITEMS-sized batches —
  // "Generate more" surfaces the next fresh batch (wrapping when exhausted),
  // mirroring the "Give me more" pattern in the stats carousel. Content is the
  // existing curated articles/podcasts/videos; nothing is fabricated.
  const [pool, setPool] = useState<GalleryItem[]>([]);
  const [batch, setBatch] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  useEffect(() => {
    if (!data) return;
    const all: GalleryItem[] = [];
    for (const a of data.articles ?? []) {
      if (!a.thumbnail) continue;
      all.push({ id: a.id, image: a.thumbnail, title: a.title, subtitle: a.source, badge: "Article", href: a.url });
    }
    for (const p of data.podcasts ?? []) {
      if (!p.thumbnail) continue;
      all.push({ id: p.id, image: p.thumbnail, title: p.title, subtitle: p.podcastName, badge: "Podcast", href: p.externalUrl });
    }
    for (const v of data.videos ?? []) {
      if (!v.thumbnail) continue;
      all.push({
        id: v.id,
        image: v.thumbnail,
        title: v.title,
        subtitle: v.channelTitle,
        badge: "Video",
        href: `https://www.youtube.com/watch?v=${v.videoId}`,
      });
    }
    setPool(shuffle(all));
    setBatch(0);
  }, [data]);

  const totalBatches = Math.max(1, Math.ceil(pool.length / MAX_ITEMS));
  const start = (batch % totalBatches) * MAX_ITEMS;
  const items = pool.slice(start, start + MAX_ITEMS);

  const handleGenerateMore = useCallback(async () => {
    setIsLoadingMore(true);
    // Brief pause so the refresh reads as a deliberate action, matching the
    // stats carousel's "Give me more".
    await new Promise((r) => setTimeout(r, 400));
    setBatch((prev) => (prev + 1) % totalBatches);
    setIsLoadingMore(false);
  }, [totalBatches]);

  if (isLoading) {
    return (
      <div className="flex h-[260px] items-center justify-center text-muted-foreground/60">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-[160px] items-center justify-center text-xs text-muted-foreground/50">
        Skills content is coming soon.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="h-[430px] w-full overflow-hidden">
        <CircularGallery items={items} />
      </div>
      <p className="text-center text-[11px] text-muted-foreground/45">
        Drag to explore · tap a card to open it
      </p>
      {totalBatches > 1 && (
        <div className="flex flex-col items-center gap-1.5 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateMore}
            disabled={isLoadingMore}
            className="text-xs gap-1.5"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate more content
              </>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground/50">
            Set {(batch % totalBatches) + 1} of {totalBatches} · {pool.length} pieces total
          </p>
        </div>
      )}
    </div>
  );
}
