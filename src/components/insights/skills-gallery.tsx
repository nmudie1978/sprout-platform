"use client";

/**
 * SkillsGallery — the "Dig Deeper" replacement: a 3D circular gallery that
 * randomly surfaces a mix of "Skills That Matter" articles, podcasts and
 * videos. Each card links out to the underlying content. Deliberately scoped
 * to the skills section only (not "jobs / roles on the rise").
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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

  // Build + shuffle in an effect (not during render) so the selection is
  // random per visit without tripping render-purity rules.
  const [items, setItems] = useState<GalleryItem[]>([]);
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
    setItems(shuffle(all).slice(0, MAX_ITEMS));
  }, [data]);

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
      <div className="h-[390px] w-full overflow-hidden">
        <CircularGallery items={items} />
      </div>
      <p className="text-center text-[11px] text-muted-foreground/45">
        Drag to explore · tap a card to open it
      </p>
    </div>
  );
}
