/**
 * DID YOU KNOW — SIMPLE CAROUSEL
 *
 * Replaced swipe-based approach with a lightweight state-driven carousel.
 * Prev/Next arrows, dot indicators, keyboard accessible, no autoplay.
 *
 * View modes: Compact (carousel), List (stacked rows), Grid (2 cards per view).
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  ExternalLink,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Loader2,
  LayoutGrid,
  List,
  Rows3,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getShuffledFacts,
  getFactCount,
  type ResearchFact,
} from "@/lib/researchFacts";
import { useTranslateContent } from "@/hooks/use-translate-content";

type ViewMode = "compact" | "list" | "grid";

const STORAGE_KEY = "didYouKnow_currentIndex";
const SEED_KEY = "didYouKnow_seed";

const VIEW_OPTIONS: { value: ViewMode; icon: typeof Rows3; label: string }[] = [
  { value: "compact", icon: Rows3, label: "Compact" },
  { value: "grid", icon: LayoutGrid, label: "Grid" },
  { value: "list", icon: List, label: "List" },
];

interface DidYouKnowCardProps {
  compact?: boolean;
  onFactViewed?: (factId: string) => void;
  onSourceClicked?: (factId: string) => void;
  onFactSaved?: (factId: string) => void;
}

// ── View Toggle ─────────────────────────────────────────
function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
      {VIEW_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={`p-1.5 rounded-md transition-colors ${
              active
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            <Icon className="h-3 w-3" />
          </button>
        );
      })}
    </div>
  );
}

// ── Single fact card ────────────────────────────────────
function FactCard({
  fact,
  isSaved,
  onSave,
  isSaving,
  isLoggedIn,
  onSourceClick,
}: {
  fact: ResearchFact;
  isSaved: boolean;
  onSave: () => void;
  isSaving: boolean;
  isLoggedIn: boolean;
  onSourceClick: () => void;
}) {
  const sourceYear = new Date(fact.sourcePublishedAt).getFullYear();

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-xs font-semibold text-foreground leading-snug mb-1.5">
        {fact.headline}
      </p>
      {fact.context && (
        <p className="text-[10px] text-muted-foreground leading-relaxed mb-2 line-clamp-3">
          {fact.context}
        </p>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <a
          href={fact.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onSourceClick();
          }}
          className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/60 hover:text-primary transition-colors"
        >
          {fact.sourceName} ({sourceYear})
          <ExternalLink className="h-2 w-2" />
        </a>
        {isLoggedIn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            disabled={isSaving || isSaved}
            className="h-5 px-1.5 text-[9px]"
          >
            {isSaving ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : isSaved ? (
              <>
                <BookmarkCheck className="h-2.5 w-2.5 mr-0.5 text-primary" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-2.5 w-2.5 mr-0.5" />
                Save
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── List row ────────────────────────────────────────────
function FactListRow({
  fact,
  onSourceClick,
}: {
  fact: ResearchFact;
  onSourceClick: () => void;
}) {
  const sourceYear = new Date(fact.sourcePublishedAt).getFullYear();

  return (
    <div className="flex items-center gap-2.5 py-2 px-2 rounded-md hover:bg-white/[0.03] transition-colors group">
      <div className="p-1 rounded bg-amber-500/10 flex-shrink-0">
        <Lightbulb className="h-3 w-3 text-amber-500" />
      </div>
      <p className="text-[11px] font-medium text-foreground flex-1 min-w-0 truncate">
        {fact.headline}
      </p>
      <a
        href={fact.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
          onSourceClick();
        }}
        className="text-[9px] text-muted-foreground/40 hover:text-primary transition-colors flex-shrink-0"
      >
        {fact.sourceName} ({sourceYear})
      </a>
    </div>
  );
}

// ── Dot indicators ──────────────────────────────────────
function DotIndicator({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (i: number) => void;
}) {
  // Show max 8 dots, collapse rest
  const maxDots = 8;
  const showAll = total <= maxDots;

  return (
    <div className="flex items-center gap-1">
      {showAll
        ? Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-4 h-1.5 bg-amber-500"
                  : "w-1.5 h-1.5 bg-white/15 hover:bg-white/25"
              }`}
            />
          ))
        : (
          <span className="text-[9px] text-muted-foreground/50 tabular-nums">
            {current + 1} / {total}
          </span>
        )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────
export function DidYouKnowCard({
  compact = false,
  onFactViewed,
  onSourceClicked,
  onFactSaved,
}: DidYouKnowCardProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const tc = useTranslations("common");
  const { translate, isTranslating, getTranslation } = useTranslateContent();
  const [showTranslated, setShowTranslated] = useState(false);

  const [seed, setSeed] = useState<number | null>(null);
  const [savedFactIds, setSavedFactIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [view, setView] = useState<ViewMode>("list");

  // Initialize seed from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    let storedSeed = localStorage.getItem(SEED_KEY);
    if (!storedSeed) {
      storedSeed = String(Date.now());
      localStorage.setItem(SEED_KEY, storedSeed);
    }
    setSeed(Number(storedSeed));

    // Restore last index
    const storedIndex = localStorage.getItem(STORAGE_KEY);
    if (storedIndex) setCurrentIndex(Number(storedIndex));
  }, []);

  const facts = useMemo(() => {
    if (seed === null) return [];
    return getShuffledFacts(seed);
  }, [seed]);

  const totalFacts = getFactCount();

  // Persist index
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(currentIndex));
    }
  }, [currentIndex]);

  // Track viewed
  useEffect(() => {
    if (facts.length > 0 && onFactViewed) {
      onFactViewed(facts[currentIndex]?.id);
    }
  }, [currentIndex, facts, onFactViewed]);

  // Save fact mutation
  const saveMutation = useMutation({
    mutationFn: async (fact: ResearchFact) => {
      const response = await fetch("/api/journey/saved-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ARTICLE",
          title: fact.headline,
          url: fact.sourceUrl,
          source: fact.sourceName,
          description: fact.context,
        }),
      });
      if (!response.ok) throw new Error("Failed to save fact");
      return response.json();
    },
    onSuccess: (_, fact) => {
      setSavedFactIds((prev) => new Set(prev).add(fact.id));
      queryClient.invalidateQueries({ queryKey: ["journey-library"] });
      onFactSaved?.(fact.id);
    },
  });

  const handleSave = useCallback(
    (fact: ResearchFact) => {
      if (!session?.user) return;
      saveMutation.mutate(fact);
    },
    [session?.user, saveMutation]
  );

  const handleSourceClick = useCallback(
    (factId: string) => {
      onSourceClicked?.(factId);
    },
    [onSourceClicked]
  );

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? facts.length - 1 : i - 1));
  }, [facts.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i === facts.length - 1 ? 0 : i + 1));
  }, [facts.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    },
    [goPrev, goNext]
  );

  const handleTranslate = useCallback(async () => {
    const items = facts.flatMap((fact) => [
      { key: `dyk-headline-${fact.id}`, text: fact.headline },
      ...(fact.context ? [{ key: `dyk-context-${fact.id}`, text: fact.context }] : []),
    ]);
    await translate(items, { targetLocale: "nb-NO", contentType: "insight" });
    setShowTranslated(true);
  }, [facts, translate]);

  const getText = useCallback(
    (key: string, original: string) =>
      showTranslated ? getTranslation(key) ?? original : original,
    [showTranslated, getTranslation]
  );

  if (seed === null || facts.length === 0) return null;

  // ── Compact mode (mobile nudge) ──────────────────────
  if (compact) {
    const currentFact = facts[0];
    const sourceYear = new Date(currentFact.sourcePublishedAt).getFullYear();
    return (
      <div
        role="region"
        aria-label="Did you know facts"
        className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
      >
        <div className="flex items-start gap-2">
          <div className="p-1 rounded-full bg-amber-500/10 flex-shrink-0">
            <Lightbulb className="h-3 w-3 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-amber-500 mb-0.5">
              Did you know?
            </p>
            <p className="text-xs text-foreground font-medium leading-snug">
              {currentFact.headline}
            </p>
            <a
              href={currentFact.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-[9px] text-muted-foreground hover:text-primary transition-colors"
            >
              {currentFact.sourceName} ({sourceYear})
              <ExternalLink className="h-2 w-2" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Grid view: 2 cards at a time
  const gridStartIndex = Math.min(
    currentIndex - (currentIndex % 2),
    facts.length - 2
  );
  const gridFacts = facts.slice(
    Math.max(0, gridStartIndex),
    Math.max(0, gridStartIndex) + 2
  );
  const gridPages = Math.ceil(facts.length / 2);
  const gridPage = Math.floor(gridStartIndex / 2);

  return (
    <section
      role="region"
      aria-label="Did you know facts"
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Did You Know?
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Research-backed facts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {locale === "nb-NO" && (
            <button
              onClick={showTranslated ? () => setShowTranslated(false) : handleTranslate}
              disabled={isTranslating}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            >
              <Languages className="h-3 w-3" />
              {isTranslating ? tc("translating") : showTranslated ? tc("showOriginal") : tc("translateToNorwegian")}
            </button>
          )}
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {/* ── Compact: Single-card carousel ──────────────── */}
      {view === "compact" && (
        <>
          <div className="relative">
            <div className="transition-opacity duration-200">
              <FactCard
                fact={{
                  ...facts[currentIndex],
                  headline: getText(`dyk-headline-${facts[currentIndex].id}`, facts[currentIndex].headline),
                  context: facts[currentIndex].context ? getText(`dyk-context-${facts[currentIndex].id}`, facts[currentIndex].context!) : undefined,
                }}
                isSaved={savedFactIds.has(facts[currentIndex].id)}
                onSave={() => handleSave(facts[currentIndex])}
                isSaving={saveMutation.isPending}
                isLoggedIn={!!session?.user}
                onSourceClick={() =>
                  handleSourceClick(facts[currentIndex].id)
                }
              />
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={goPrev}
              aria-label="Previous fact"
              className="p-1.5 rounded-md border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <DotIndicator
              total={facts.length}
              current={currentIndex}
              onSelect={setCurrentIndex}
            />
            <button
              onClick={goNext}
              aria-label="Next fact"
              className="p-1.5 rounded-md border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}

      {/* ── List: Stacked rows ─────────────────────────── */}
      {view === "list" && (
        <div className="divide-y divide-white/5 max-h-[220px] overflow-y-auto">
          {facts.map((fact) => (
            <FactListRow
              key={fact.id}
              fact={{
                ...fact,
                headline: getText(`dyk-headline-${fact.id}`, fact.headline),
              }}
              onSourceClick={() => handleSourceClick(fact.id)}
            />
          ))}
        </div>
      )}

      {/* ── Grid: 2 cards per view with nav ────────────── */}
      {view === "grid" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {gridFacts.map((fact) => (
              <FactCard
                key={fact.id}
                fact={{
                  ...fact,
                  headline: getText(`dyk-headline-${fact.id}`, fact.headline),
                  context: fact.context ? getText(`dyk-context-${fact.id}`, fact.context) : undefined,
                }}
                isSaved={savedFactIds.has(fact.id)}
                onSave={() => handleSave(fact)}
                isSaving={saveMutation.isPending}
                isLoggedIn={!!session?.user}
                onSourceClick={() => handleSourceClick(fact.id)}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() =>
                setCurrentIndex(Math.max(0, gridStartIndex - 2))
              }
              aria-label="Previous facts"
              className="p-1.5 rounded-md border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[9px] text-muted-foreground/50 tabular-nums">
              {gridPage + 1} / {gridPages}
            </span>
            <button
              onClick={() =>
                setCurrentIndex(
                  Math.min(facts.length - 1, gridStartIndex + 2)
                )
              }
              aria-label="Next facts"
              className="p-1.5 rounded-md border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default DidYouKnowCard;
