"use client";

/**
 * MY LIBRARY
 *
 * A calm, tabbed home for everything a user has saved or written:
 *  - Saved careers   — hearted "curiosities" (localStorage, device-local)
 *  - Compared        — saved career comparisons (localStorage, device-local)
 *  - Reflections     — My Journey reflections (localStorage, device-local)
 *
 * This is the "See all →" destination behind the dashboard preview cards.
 * Tab state lives in `?tab=` so the dashboard can deep-link to a section.
 * All three tabs read localStorage, so the page is a client component
 * behind a `mounted` guard to avoid hydration mismatch.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import { useAllInterestLevels } from "@/hooks/use-interest-level";
import { InterestLevelStars } from "@/components/interest-level/interest-level-rating";
import {
  getSavedComparisons,
  type SavedComparison,
} from "@/components/career-radar/saved-comparisons-tray";
import { getAllCareers, type Career } from "@/lib/career-pathways";
import {
  resolveLibraryTab,
  readLocalJourneyReflections,
  LIBRARY_TABS,
  type LibraryTab,
  type LocalReflectionEntry,
} from "@/lib/library/tabs";

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
          The possible futures you&apos;re considering — everything you&apos;ve saved, compared and written, in one calm place.
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
                ? "border-primary text-primary font-medium"
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
  const interestLevels = useAllInterestLevels();
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
    <ul className="divide-y divide-border/60 rounded-control border border-border/60 overflow-hidden bg-muted/10">
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
          {interestLevels[c.careerId] && (
            <InterestLevelStars value={interestLevels[c.careerId]} className="shrink-0" />
          )}
          <button
            type="button"
            onClick={() => removeCuriosity(c.careerId)}
            className="p-1 rounded-control text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
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
          className="rounded-control border border-border/60 bg-muted/10 px-3 py-2.5"
        >
          {cmp.title && (
            <p className="text-xs text-muted-foreground/70 mb-1">{cmp.title}</p>
          )}
          {/* A comparison spans several careers (not one journey), so each
              career is individually clickable → opens that career on Explore. */}
          <p className="text-sm flex flex-wrap items-center gap-x-1 gap-y-1">
            {cmp.careers.map((c, i) => (
              <span key={c.id} className="inline-flex items-center">
                {i > 0 && <span className="text-muted-foreground/40 mx-1.5">vs</span>}
                <Link
                  href={`/careers?open=${encodeURIComponent(c.id)}`}
                  className="rounded-control px-1 -mx-1 hover:bg-muted/40 hover:underline underline-offset-2 transition-colors"
                >
                  {c.emoji} {c.title}
                </Link>
              </span>
            ))}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ReflectionsTab() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [entries, setEntries] = useState<LocalReflectionEntry[]>([]);

  // Reflections are written to localStorage by the JourneyReflectionsTray,
  // so read them straight from this device (same as Saved/Compared).
  useEffect(() => {
    if (!userId || typeof window === "undefined") {
      setEntries([]);
      return;
    }
    setEntries(readLocalJourneyReflections(userId, window.localStorage));
  }, [userId]);

  if (entries.length === 0) {
    return (
      <EmptyState>
        No reflections yet — write one on My Journey (Discover, Understand or
        Clarity) and it&apos;ll appear here.
      </EmptyState>
    );
  }

  const careers = getAllCareers();
  const careerFor = (slug: string): { label: string; emoji: string } => {
    const c: Career | undefined = careers.find((x) => x.id === slug);
    return c ? { label: c.title, emoji: c.emoji ?? "📝" } : { label: slug, emoji: "📝" };
  };

  return (
    <ul className="space-y-3">
      {entries.map((e) => {
        const career = careerFor(e.careerSlug);
        return (
          <li key={e.id}>
            {/* Click → My Journey, opening the lens (Discover/Understand/
                Clarity) this reflection was written on. The journey reads
                the tab from the URL hash. */}
            <Link
              href={`/my-journey#${e.lens}`}
              className="block rounded-control border border-border/60 bg-muted/10 px-4 py-3 hover:bg-muted/30 hover:border-border transition-colors"
            >
              <p className="text-xs text-muted-foreground/70 mb-1">
                <span className="mr-1">{career.emoji}</span>
                {career.label} · {e.lensLabel}
              </p>
              <p className="text-sm whitespace-pre-wrap">{e.text}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
