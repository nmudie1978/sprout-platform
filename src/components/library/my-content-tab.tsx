"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { SKILLS_CONTENT_TAG } from "@/lib/insights/saved-content";

interface SavedContentItem {
  id: string;
  type: string;
  title: string;
  url: string;
  source?: string | null;
  thumbnail?: string | null;
}

/**
 * "My Content" tab — saved Skills That Matter cards. Lists SavedItems tagged
 * SKILLS_CONTENT_TAG, opens them in a new tab, and removes via DELETE.
 */
export function MyContentTab() {
  // null = loading; [] = loaded-empty.
  const [items, setItems] = useState<SavedContentItem[] | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/journey/saved-items?tags=${SKILLS_CONTENT_TAG}&limit=200`,
      );
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = (await res.json()) as { items?: SavedContentItem[] };
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    // Optimistic removal.
    setItems((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
    await fetch(`/api/journey/saved-items?id=${id}`, { method: "DELETE" }).catch(
      () => {},
    );
  }, []);

  if (items === null) {
    return (
      <p className="text-sm text-muted-foreground/60 py-10 text-center">Loading…</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/60 py-10 text-center">
        Nothing saved yet — tap the bookmark on any Skills That Matter card in
        Industry Insights.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.id}
          className="group relative overflow-hidden rounded-card border border-border/60 bg-card/40"
        >
          {it.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={it.thumbnail} alt="" className="h-24 w-full object-cover" />
          )}
          <div className="p-2.5">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-muted-foreground/50">
              {it.type}
            </p>
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block line-clamp-2 text-xs font-medium text-foreground/90 hover:text-primary"
            >
              {it.title}
            </a>
            {it.source && (
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground/60">
                {it.source}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(it.id)}
            aria-label={`Remove ${it.title}`}
            className="absolute right-1.5 top-1.5 rounded-control bg-black/40 p-1 text-white/70 opacity-0 transition-opacity hover:bg-destructive/80 hover:text-white group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
