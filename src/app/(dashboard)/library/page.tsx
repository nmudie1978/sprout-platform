"use client";

/**
 * MY LIBRARY
 *
 * A calm, tabbed home for everything a user has saved or written:
 *  - Saved careers   — hearted "curiosities" (localStorage, device-local)
 *  - Compared        — saved career comparisons (localStorage, device-local)
 *  - Reflections     — answered Journey reflections (server)
 *
 * This is the "See all →" destination behind the dashboard preview cards.
 * Tab state lives in `?tab=` so the dashboard can deep-link to a section.
 * Two of the three tabs read localStorage, so the page is a client component
 * behind a `mounted` guard to avoid hydration mismatch.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import {
  getSavedComparisons,
  type SavedComparison,
} from "@/components/career-radar/saved-comparisons-tray";
import { getAllCareers, type Career } from "@/lib/career-pathways";
import {
  resolveLibraryTab,
  filterAnsweredReflections,
  LIBRARY_TABS,
  type LibraryTab,
} from "@/lib/library/tabs";
import type { ReflectionData } from "@/lib/journey/reflections-service";

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = resolveLibraryTab(searchParams.get("tab"));
  const setActive = (tab: LibraryTab) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", tab);
    router.replace(`/library?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-5">
        <h1 className="text-xl font-bold tracking-tight">My Library</h1>
        <p className="text-sm text-muted-foreground">
          Everything you&apos;ve saved and written, in one calm place.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="My Library sections"
        className="flex gap-1.5 mb-5 border-b border-border/60"
      >
        {LIBRARY_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "px-3 py-2 text-sm rounded-t-md transition-colors -mb-px border-b-2",
              active === t.key
                ? "border-teal-400 text-teal-600 dark:text-teal-300 font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!mounted ? (
        <EmptyState>Loading…</EmptyState>
      ) : active === "saved" ? (
        <SavedCareersTab />
      ) : active === "compared" ? (
        <ComparedTab />
      ) : (
        <ReflectionsTab />
      )}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground/60 py-10 text-center">{children}</p>
  );
}

function SavedCareersTab() {
  const { curiosities, removeCuriosity } = useCuriositySaves();
  if (curiosities.length === 0) {
    return (
      <EmptyState>
        Nothing saved yet — explore careers and tap the heart to keep them here.
      </EmptyState>
    );
  }
  const open = (careerId: string) => {
    const career: Career | undefined = getAllCareers().find((c) => c.id === careerId);
    if (career)
      window.dispatchEvent(new CustomEvent("open-career-detail", { detail: career }));
  };
  return (
    <ul className="divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden bg-muted/10">
      {curiosities.map((c) => (
        <li
          key={c.careerId}
          className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
        >
          <button
            type="button"
            onClick={() => open(c.careerId)}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
          >
            <span className="shrink-0">{c.careerEmoji}</span>
            <span className="truncate flex-1">{c.careerTitle}</span>
          </button>
          <button
            type="button"
            onClick={() => removeCuriosity(c.careerId)}
            className="p-1 rounded text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            aria-label={`Remove ${c.careerTitle}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function ComparedTab() {
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  useEffect(() => setComparisons(getSavedComparisons()), []);
  if (comparisons.length === 0) {
    return (
      <EmptyState>
        No comparisons yet — compare careers on My Career Radar and save them to
        revisit here.
      </EmptyState>
    );
  }
  return (
    <ul className="space-y-2">
      {comparisons.map((cmp) => (
        <li
          key={cmp.id}
          className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5"
        >
          {cmp.title && (
            <p className="text-xs text-muted-foreground/70 mb-1">{cmp.title}</p>
          )}
          <p className="text-sm">
            {cmp.careers.map((c) => `${c.emoji} ${c.title}`).join("  vs  ")}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ReflectionsTab() {
  const { data, isLoading } = useQuery<{ reflections: ReflectionData[] }>({
    queryKey: ["library-reflections"],
    queryFn: async () => {
      const res = await fetch(
        "/api/journey/reflections?includeSkipped=false&limit=100"
      );
      if (!res.ok) return { reflections: [] };
      return res.json();
    },
    staleTime: 60 * 1000,
  });
  if (isLoading) return <EmptyState>Loading…</EmptyState>;
  const answered = filterAnsweredReflections(data?.reflections ?? []);
  if (answered.length === 0) {
    return (
      <EmptyState>
        No reflections yet — they appear here as you move through My Journey.
      </EmptyState>
    );
  }
  return (
    <ul className="space-y-3">
      {answered.map((r) => (
        <li
          key={r.id}
          className="rounded-lg border border-border/60 bg-muted/10 px-4 py-3"
        >
          <p className="text-xs text-muted-foreground/70 mb-1">{r.prompt}</p>
          <p className="text-sm whitespace-pre-wrap">{r.response}</p>
        </li>
      ))}
    </ul>
  );
}
