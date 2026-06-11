"use client";

/**
 * MY LIBRARY
 *
 * A calm, tabbed home for the careers a user is weighing up, plus everything
 * they have saved or written:
 *  - Decision Board  — ranked "league table" of explored careers (server-backed)
 *  - Saved careers   — hearted "curiosities" (localStorage, device-local)
 *  - Reflections     — My Journey reflections (localStorage, device-local)
 *
 * This is the "See all →" destination behind the dashboard preview cards.
 * Tab state lives in `?tab=` so the dashboard can deep-link to a section
 * (the Decision Board is the default tab). Some tabs read localStorage, so the
 * page is a client component behind a `mounted` guard to avoid hydration
 * mismatch.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import { useAllInterestLevels, useInterestLevel } from "@/hooks/use-interest-level";
import {
  InterestLevelStars,
} from "@/components/interest-level/interest-level-rating";
import {
  getAllCareers,
  type Career,
} from "@/lib/career-pathways";
import { DecisionBoardTab } from "@/components/decision-board/decision-board";
import { MyContentTab } from "@/components/library/my-content-tab";
import {
  resolveLibraryTab,
  readLocalJourneyReflections,
  LIBRARY_TABS,
  type LibraryTab,
  type LocalReflectionEntry,
  type ReflectionLens,
} from "@/lib/library/tabs";
import {
  ensureJourneyNotebooksHydrated,
  JOURNEY_NOTEBOOKS_HYDRATED_EVENT,
} from "@/lib/journey/notebook-sync";

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
          The possible futures you&apos;re considering — ranked on your Decision Board, plus everything you&apos;ve saved and written, in one calm place.
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
      ) : active === "decision" ? (
        <DecisionBoardTab />
      ) : active === "saved" ? (
        <SavedCareersTab />
      ) : active === "content" ? (
        <MyContentTab />
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
            className="p-1 rounded-control text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
            aria-label={`Remove ${c.careerTitle}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function ReflectionsTab() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const [entries, setEntries] = useState<LocalReflectionEntry[]>([]);

  // Reflections persist to the JourneyNotebook table; localStorage is the
  // device cache the JourneyReflectionsTray writes. Reconcile with the server
  // once, then re-read whenever the cache refreshes.
  useEffect(() => {
    if (!userId || typeof window === "undefined") {
      setEntries([]);
      return;
    }
    const read = () => setEntries(readLocalJourneyReflections(userId, window.localStorage));
    read();
    void ensureJourneyNotebooksHydrated(userId);
    window.addEventListener(JOURNEY_NOTEBOOKS_HYDRATED_EVENT, read);
    window.addEventListener("endeavrly:journey-reflections-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(JOURNEY_NOTEBOOKS_HYDRATED_EVENT, read);
      window.removeEventListener("endeavrly:journey-reflections-changed", read);
      window.removeEventListener("storage", read);
    };
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

  // Group reflections under the career they belong to. Each career group is
  // ordered by its most recent reflection (so the journey you touched last
  // floats to the top), and within a group the lenses read in journey order
  // (Discover → Understand → Clarity) rather than by timestamp.
  const LENS_RANK: Record<ReflectionLens, number> = {
    discover: 0,
    understand: 1,
    clarity: 2,
  };
  const groupBySlug = new Map<string, LocalReflectionEntry[]>();
  for (const e of entries) {
    const list = groupBySlug.get(e.careerSlug);
    if (list) list.push(e);
    else groupBySlug.set(e.careerSlug, [e]);
  }
  const groups = [...groupBySlug.entries()]
    .map(([slug, list]) => ({
      slug,
      career: careerFor(slug),
      entries: [...list].sort((a, b) => LENS_RANK[a.lens] - LENS_RANK[b.lens]),
      newest: list.reduce((max, e) => {
        const ts = e.updatedAt ?? "";
        return ts > max ? ts : max;
      }, ""),
    }))
    .sort((a, b) => b.newest.localeCompare(a.newest));

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        // Each career is its own bordered container (the "clear container"
        // that was missing) holding a compact table — same dense, scannable
        // shape as the Explore-careers / Explored-journeys tables.
        <section
          key={group.slug}
          className="rounded-card border border-border/60 bg-card/40 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
            <span className="text-sm shrink-0">{group.career.emoji}</span>
            <h3 className="text-xs font-bold uppercase tracking-wide text-foreground truncate">
              {group.career.label}
            </h3>
            <span className="ml-auto text-xs text-muted-foreground/65 tabular-nums">
              {group.entries.length}
            </span>
          </div>
          {/* Compact table — one single-line row per reflection so the list
              stays dense instead of tall cards. Row → My Journey, opening the
              lens (Discover/Understand/Clarity) it was written on. */}
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                <th className="px-3 py-1.5 font-medium w-24">Stage</th>
                <th className="px-3 py-1.5 font-medium">Reflection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {group.entries.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => router.push(`/my-journey#${e.lens}`)}
                  title={`Open ${e.lensLabel} on My Journey`}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-1.5 align-top">
                    <span className="text-xs font-medium text-muted-foreground/70 whitespace-nowrap">
                      {e.lensLabel}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="block truncate text-xs text-foreground/85">
                      {e.text}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
