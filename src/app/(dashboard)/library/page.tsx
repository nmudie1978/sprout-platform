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
import { useQuery } from "@tanstack/react-query";
import { Check, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCuriositySaves } from "@/hooks/use-curiosity-saves";
import { useAllInterestLevels, useInterestLevel } from "@/hooks/use-interest-level";
import {
  InterestLevelStars,
  InterestLevelPicker,
} from "@/components/interest-level/interest-level-rating";
import {
  getSavedComparisons,
  type SavedComparison,
} from "@/components/career-radar/saved-comparisons-tray";
import {
  getAllCareers,
  getCareerById,
  getCategoryForCareer,
  type Career,
} from "@/lib/career-pathways";
import { clampInterestLevel, readAllInterestLevels } from "@/lib/interest-level/types";
import {
  isDiscoverConfirmed,
  isUnderstandConfirmed,
  isClarityActive,
} from "@/lib/journey/lens-progress";
import { buildExploringGroups, type ExploringEntry } from "@/lib/library/exploring";
import { CompareModal } from "@/components/compare/compare-modal";
import {
  resolveLibraryTab,
  readLocalJourneyReflections,
  LIBRARY_TABS,
  type LibraryTab,
  type LocalReflectionEntry,
} from "@/lib/library/tabs";
import {
  ensureJourneyNotebooksHydrated,
  JOURNEY_NOTEBOOKS_HYDRATED_EVENT,
} from "@/lib/journey/notebook-sync";

// Journey order + per-lens accent for the Reflections rail. Calm, distinct
// dots so a career's Discover → Understand → Clarity arc reads at a glance.
const LENS_RANK: Record<string, number> = { discover: 0, understand: 1, clarity: 2 };
const LENS_STYLE: Record<string, { dot: string; label: string }> = {
  discover: { dot: "bg-sky-400/80", label: "text-sky-400/80" },
  understand: { dot: "bg-violet-400/80", label: "text-violet-400/80" },
  clarity: { dot: "bg-emerald-400/80", label: "text-emerald-400/80" },
};

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
          The possible futures you&apos;re considering — the careers you&apos;re exploring, plus everything you&apos;ve saved, compared and written, in one calm place.
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
      ) : active === "exploring" ? (
        <ExploringTab />
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

interface ExploredGoal {
  goalId: string;
  goalTitle: string;
  journeyCompletedSteps: string[];
  isActive: boolean;
}

/** Inline interest rating for an Exploring row — relocated here from the
 *  career detail sheet so users still set the ★ that powers the ranking.
 *  Writes server + localStorage and fires the sync event the parent's
 *  useAllInterestLevels listens to, so the list re-ranks on the spot. */
function ExploringRowRating({ careerId }: { careerId: string }) {
  const { level, setLevel, enabled } = useInterestLevel(careerId);
  if (!enabled) return null;
  return (
    <InterestLevelPicker
      value={level}
      onChange={setLevel}
      size="sm"
      showLabel={false}
      className="shrink-0"
    />
  );
}

/**
 * EXPLORING — the careers a user has explored in My Journey, as one ranked
 * list grouped by category. Server-authoritative: the journey list and the
 * ★ interest ratings come from the DB so they survive logout and follow the
 * user across devices. On mount it also backfills any device-local interest
 * and lens-completion the server doesn't have yet (idempotent endpoints).
 */
function ExploringTab() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const localInterest = useAllInterestLevels();

  const { data: goalsData } = useQuery({
    queryKey: ["exploring-goals", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch("/api/journey/goal-data/list");
      if (!res.ok) throw new Error("Failed to load journeys");
      return (await res.json()) as { goals: ExploredGoal[] };
    },
  });

  const { data: interestData } = useQuery({
    queryKey: ["career-interest", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch("/api/career-interest");
      if (!res.ok) throw new Error("Failed to load interest");
      return (await res.json()) as { interests: Record<string, number> };
    },
  });

  const goals = goalsData?.goals ?? [];
  const serverInterest = interestData?.interests ?? {};
  const goalsLoaded = goals.length;

  // Backfill device-local signals the server hasn't captured yet. Both
  // endpoints are idempotent (create-if-missing / union), so running on
  // mount is safe and self-healing.
  useEffect(() => {
    if (!userId || typeof window === "undefined" || goalsLoaded === 0) return;

    const localLevels = readAllInterestLevels(userId, window.localStorage);
    if (Object.keys(localLevels).length > 0) {
      void fetch("/api/career-interest/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: localLevels }),
      }).catch(() => {});
    }

    const completions: Record<string, string[]> = {};
    for (const g of goals) {
      const steps: string[] = [];
      if (isDiscoverConfirmed(g.goalTitle)) steps.push("discover");
      if (isUnderstandConfirmed(g.goalTitle)) steps.push("understand");
      if (isClarityActive(g.goalTitle)) steps.push("clarity");
      if (steps.length > 0) completions[g.goalId] = steps;
    }
    if (Object.keys(completions).length > 0) {
      void fetch("/api/journey/completion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completions }),
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, goalsLoaded]);

  if (userId && goalsLoaded === 0) {
    return (
      <EmptyState>
        Careers you explore will show up here, ranked by how interested you are.
      </EmptyState>
    );
  }

  const entries: ExploringEntry[] = goals.map((g) => {
    const career = getCareerById(g.goalId);
    // Prefer the live local map (updates instantly when a row is rated below,
    // and is itself server-reconciled) so the ranking re-sorts on the spot.
    const interest = clampInterestLevel(localInterest[g.goalId] ?? serverInterest[g.goalId]);
    const completed =
      (g.journeyCompletedSteps ?? []).includes("clarity") || isClarityActive(g.goalTitle);
    return {
      careerId: g.goalId,
      title: career?.title ?? g.goalTitle,
      emoji: career?.emoji ?? "🧭",
      category: getCategoryForCareer(g.goalId) ?? null,
      interest,
      completed,
      isActive: g.isActive ?? false,
    };
  });

  const groups = buildExploringGroups(entries);

  const open = (careerId: string) => {
    const career = getAllCareers().find((c) => c.id === careerId);
    if (career)
      window.dispatchEvent(new CustomEvent("open-career-detail", { detail: career }));
  };

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.category}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 mb-2">
            {group.label}
          </h2>
          <ul className="divide-y divide-border/60 rounded-control border border-border/60 overflow-hidden bg-muted/10">
            {group.entries.map((e) => (
              <li
                key={e.careerId}
                className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => open(e.careerId)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <span className="shrink-0">{e.emoji}</span>
                  <span className="truncate">{e.title}</span>
                  {e.isActive && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Current goal
                    </span>
                  )}
                  {e.completed && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs text-primary">
                      <Check className="h-3.5 w-3.5" />
                      Explored
                    </span>
                  )}
                </button>
                <ExploringRowRating careerId={e.careerId} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
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
  const [openCareers, setOpenCareers] = useState<Career[] | null>(null);
  useEffect(() => setComparisons(getSavedComparisons()), []);

  if (comparisons.length === 0) {
    return (
      <EmptyState>
        No comparisons yet — compare careers on My Career Radar and save them to
        revisit here.
      </EmptyState>
    );
  }

  // Resolve the saved career ids to full Career records, then open the
  // side-by-side comparison modal.
  const allCareers = getAllCareers();
  const openComparison = (cmp: SavedComparison) => {
    const resolved = cmp.careers
      .map((c) => allCareers.find((x) => x.id === c.id))
      .filter((x): x is Career => !!x);
    if (resolved.length > 0) setOpenCareers(resolved);
  };

  return (
    <>
      <ul className="space-y-2">
        {comparisons.map((cmp) => (
          <li key={cmp.id}>
            {/* One clickable row → opens the full side-by-side comparison. */}
            <button
              onClick={() => openComparison(cmp)}
              className="w-full text-left rounded-control border border-border/60 bg-muted/10 px-3 py-2.5 hover:bg-muted/30 hover:border-border transition-colors"
            >
              <p className="text-sm flex flex-wrap items-center gap-x-1 gap-y-1">
                {cmp.careers.map((c, i) => (
                  <span key={c.id} className="inline-flex items-center">
                    {i > 0 && <span className="text-muted-foreground/40 mx-1.5">vs</span>}
                    <span>{c.emoji} {c.title}</span>
                  </span>
                ))}
              </p>
            </button>
          </li>
        ))}
      </ul>
      <CompareModal
        open={!!openCareers}
        careers={openCareers ?? []}
        preferences={null}
        onClose={() => setOpenCareers(null)}
        onRemove={() => {}}
      />
    </>
  );
}

function ReflectionsTab() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
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

  // Group reflections under the career they belong to, then order each
  // group's notes into journey order (Discover → Understand → Clarity) so a
  // career card reads as one continuous reflection arc. Careers themselves
  // surface most-recently-touched first.
  const groups = (() => {
    const byCareer = new Map<string, LocalReflectionEntry[]>();
    for (const e of entries) {
      const list = byCareer.get(e.careerSlug);
      if (list) list.push(e);
      else byCareer.set(e.careerSlug, [e]);
    }
    return Array.from(byCareer.entries())
      .map(([slug, items]) => ({
        slug,
        latest: items.reduce((acc, e) => (e.updatedAt && e.updatedAt > acc ? e.updatedAt : acc), ""),
        items: [...items].sort(
          (a, b) => (LENS_RANK[a.lens] ?? 9) - (LENS_RANK[b.lens] ?? 9),
        ),
      }))
      .sort((a, b) => b.latest.localeCompare(a.latest));
  })();

  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const career = careerFor(g.slug);
        return (
          <section
            key={g.slug}
            className="rounded-control border border-border/60 bg-muted/10 overflow-hidden"
          >
            {/* Career header — one heading per journey, not per note. */}
            <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/20 px-4 py-3">
              <span className="text-lg leading-none">{career.emoji}</span>
              <h3 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">
                {career.label}
              </h3>
              <span className="shrink-0 text-[11px] text-muted-foreground/60">
                {g.items.length} {g.items.length === 1 ? "note" : "notes"}
              </span>
            </div>

            {/* The career's reflections as a vertical journey rail. */}
            <ol className="relative px-4 py-3.5">
              <span
                aria-hidden
                className="absolute left-[19px] top-6 bottom-6 w-px bg-border/50"
              />
              {g.items.map((e, i) => {
                const lens = LENS_STYLE[e.lens] ?? LENS_STYLE.discover;
                return (
                  <li key={e.id} className={cn("relative pl-5", i > 0 && "mt-3.5")}>
                    {/* Click → My Journey, opening the lens this note was
                        written on (the journey reads the tab from the hash). */}
                    <Link href={`/my-journey#${e.lens}`} className="group block">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full ring-2 ring-muted/10",
                          lens.dot,
                        )}
                      />
                      <span
                        className={cn(
                          "text-[11px] font-medium uppercase tracking-wide",
                          lens.label,
                        )}
                      >
                        {e.lensLabel}
                      </span>
                      <p className="whitespace-pre-wrap text-sm text-foreground/90 transition-colors group-hover:text-foreground">
                        {e.text}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
