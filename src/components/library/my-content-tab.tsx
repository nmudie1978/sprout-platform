"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X, LayoutGrid, List, Rows3, Waypoints, Video, FileText, Mic, ExternalLink } from "lucide-react";
import {
  MY_CONTENT_TAGS,
  categorizeSavedItem,
  CONTENT_CATEGORY_LABEL,
  type ContentCategory,
} from "@/lib/insights/saved-content";
import { cn } from "@/lib/utils";

interface SavedContentItem {
  id: string;
  type: string;
  title: string;
  url: string;
  source?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  tags?: string[] | null;
}

type ViewMode = "grid" | "list" | "detailed";
type Filter = "all" | ContentCategory;

const CATEGORY_ICON: Record<ContentCategory, typeof Video> = {
  videos: Video,
  articles: FileText,
  mindmaps: Waypoints,
  podcasts: Mic,
};

const VIEW_MODES: { key: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { key: "grid", label: "Grid", icon: LayoutGrid },
  { key: "list", label: "List", icon: List },
  { key: "detailed", label: "Detailed", icon: Rows3 },
];

/**
 * "My Content" tab — saved content, organised by type with a choice of views.
 * Lists SavedItems tagged with any MY_CONTENT_TAGS (saved videos, articles,
 * skills cards, and saved Career Transition Maps), filterable by category
 * (Videos / Articles / Mindmaps / Podcasts) and viewable as grid / list /
 * detailed. Opens items in a new tab; removes via DELETE.
 */
export function MyContentTab() {
  const [items, setItems] = useState<SavedContentItem[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<ViewMode>("grid");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/journey/saved-items?tags=${MY_CONTENT_TAGS.join(",")}&limit=200`);
      if (!res.ok) { setItems([]); return; }
      const data = (await res.json()) as { items?: SavedContentItem[] };
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const remove = useCallback(async (id: string) => {
    setItems((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
    await fetch(`/api/journey/saved-items?id=${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  // Categories actually present (so we only show relevant filter chips).
  const present = useMemo(() => {
    const set = new Set<ContentCategory>();
    (items ?? []).forEach((it) => set.add(categorizeSavedItem(it)));
    return set;
  }, [items]);

  const visible = useMemo(
    () => (items ?? []).filter((it) => filter === "all" || categorizeSavedItem(it) === filter),
    [items, filter],
  );

  if (items === null) {
    return <p className="text-sm text-muted-foreground/60 py-10 text-center">Loading…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/60 py-10 text-center">
        Nothing saved yet — bookmark a video or article in Industry Insights, or save your
        Career Transition Map from My Journey.
      </p>
    );
  }

  const chips: Filter[] = ["all", ...(["videos", "articles", "mindmaps", "podcasts"] as ContentCategory[]).filter((c) => present.has(c))];

  return (
    <div className="space-y-3">
      {/* Toolbar — type filters (left) + view switch (right) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => {
            const count = c === "all" ? items.length : items.filter((it) => categorizeSavedItem(it) === c).length;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                  filter === c
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border/30 bg-muted/10 text-muted-foreground/70 hover:bg-muted/20",
                )}
              >
                {c === "all" ? "All" : CONTENT_CATEGORY_LABEL[c]}{" "}
                <span className="tabular-nums opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-0.5 rounded-full border border-border/30 bg-muted/10 p-0.5">
          {VIEW_MODES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              title={`${label} view`}
              aria-label={`${label} view`}
              aria-pressed={view === key}
              className={cn(
                "rounded-full p-1.5 transition-colors",
                view === key ? "bg-primary/15 text-primary" : "text-muted-foreground/60 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">Nothing in this category yet.</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map((it) => <GridCard key={it.id} item={it} onRemove={remove} />)}
        </div>
      ) : view === "list" ? (
        <div className="divide-y divide-border/30 rounded-card border border-border/40">
          {visible.map((it) => <ListRow key={it.id} item={it} onRemove={remove} />)}
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((it) => <DetailedRow key={it.id} item={it} onRemove={remove} />)}
        </div>
      )}
    </div>
  );
}

function CategoryBadge({ item }: { item: SavedContentItem }) {
  const cat = categorizeSavedItem(item);
  const Icon = CATEGORY_ICON[cat];
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/70">
      <Icon className="h-3 w-3" /> {CONTENT_CATEGORY_LABEL[cat].replace(/s$/, "")}
    </span>
  );
}

function RemoveButton({ item, onRemove, floating }: { item: SavedContentItem; onRemove: (id: string) => void; floating?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onRemove(item.id)}
      aria-label={`Remove ${item.title}`}
      className={cn(
        "rounded-control text-muted-foreground/60 transition-colors hover:text-destructive",
        floating
          ? "absolute right-1.5 top-1.5 bg-black/40 p-2 text-white/70 opacity-70 hover:bg-destructive/80 hover:text-white group-hover:opacity-100"
          : "shrink-0 p-1.5",
      )}
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

function GridCard({ item, onRemove }: { item: SavedContentItem; onRemove: (id: string) => void }) {
  const cat = categorizeSavedItem(item);
  const Icon = CATEGORY_ICON[cat];
  return (
    <div className="group relative overflow-hidden rounded-card border border-border/60 bg-card/40">
      {item.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumbnail} alt="" className="h-24 w-full object-cover" />
      ) : (
        <div className="flex h-24 w-full items-center justify-center bg-muted/20">
          <Icon className="h-7 w-7 text-muted-foreground/40" />
        </div>
      )}
      <div className="p-2.5">
        <CategoryBadge item={item} />
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 block line-clamp-2 text-xs font-medium text-foreground/90 hover:text-primary"
        >
          {item.title}
        </a>
        {item.source && <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground/60">{item.source}</p>}
      </div>
      <RemoveButton item={item} onRemove={onRemove} floating />
    </div>
  );
}

function ListRow({ item, onRemove }: { item: SavedContentItem; onRemove: (id: string) => void }) {
  const cat = categorizeSavedItem(item);
  const Icon = CATEGORY_ICON[cat];
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 truncate text-xs font-medium text-foreground/90 hover:text-primary"
      >
        {item.title}
        {item.source && <span className="ml-2 text-[10px] font-normal text-muted-foreground/55">{item.source}</span>}
      </a>
      <RemoveButton item={item} onRemove={onRemove} />
    </div>
  );
}

function DetailedRow({ item, onRemove }: { item: SavedContentItem; onRemove: (id: string) => void }) {
  const cat = categorizeSavedItem(item);
  const Icon = CATEGORY_ICON[cat];
  return (
    <div className="group flex gap-3 rounded-card border border-border/40 bg-card/40 p-3">
      {item.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumbnail} alt="" className="h-16 w-24 shrink-0 rounded-control object-cover" />
      ) : (
        <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-control bg-muted/20">
          <Icon className="h-6 w-6 text-muted-foreground/40" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <CategoryBadge item={item} />
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 flex items-center gap-1 text-sm font-medium text-foreground/90 hover:text-primary"
        >
          <span className="line-clamp-1">{item.title}</span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
        </a>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground/75">{item.description}</p>
        )}
        {item.source && <p className="mt-0.5 text-[10px] text-muted-foreground/55">{item.source}</p>}
      </div>
      <RemoveButton item={item} onRemove={onRemove} />
    </div>
  );
}
