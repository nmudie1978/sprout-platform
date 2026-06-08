"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { InterestLevelStars } from "@/components/interest-level/interest-level-rating";
import { buildDecisionBoard } from "@/lib/decision-board/build";
import { useDecisionInputs } from "@/hooks/use-decision-inputs";
import { useDecisionBoard } from "@/hooks/use-decision-board";

const STORAGE_KEY = "decision-teaser-minimised";

/**
 * Compact, dismissible dashboard teaser for the Decision Board: surfaces the
 * career the user is currently leaning towards (the board's #1) and links to
 * the full standings. Deliberately subtle — a quiet nudge, not a banner. The
 * user can minimise it to a single line; that choice persists (localStorage).
 */
export function WhereYoureLeaning() {
  const { inputs, userId, isLoading } = useDecisionInputs();
  const { board } = useDecisionBoard();

  // Read the persisted minimised state synchronously on the client (SSR-safe).
  const [minimised, setMinimised] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const setMin = (next: boolean) => {
    setMinimised(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  // Don't render for signed-out users, while loading, or until there are at
  // least 2 explored careers to weigh up (matches the board's own threshold).
  if (!userId || isLoading || inputs.length < 2) return null;

  const { ranked, leader } = buildDecisionBoard(inputs, board);

  // ── Minimised: one quiet line, click to expand ──────────────────────────
  if (minimised) {
    return (
      <button
        type="button"
        onClick={() => setMin(false)}
        aria-expanded={false}
        className="mb-3 flex w-full items-center justify-between gap-2 rounded-control border border-border/30 bg-card/20 px-3 py-1.5 text-left transition-colors hover:border-border/50 hover:bg-card/40"
      >
        <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/45">
          Where you&apos;re leaning
          {leader ? <span className="ml-1.5 normal-case tracking-normal text-muted-foreground/65">{leader.emoji} {leader.title}</span> : null}
        </span>
        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/35" />
      </button>
    );
  }

  // ── Expanded (compact) ──────────────────────────────────────────────────
  return (
    <div className="mb-3 rounded-control border border-border/30 bg-card/20 px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/50">
          Where you&apos;re leaning
        </p>
        <div className="flex items-center gap-2.5">
          <Link
            href="/library?tab=decision"
            className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/40 transition-colors hover:text-muted-foreground/75"
          >
            See the board <ArrowRight className="h-2.5 w-2.5" />
          </Link>
          <button
            type="button"
            onClick={() => setMin(true)}
            aria-label="Minimise"
            title="Minimise"
            className="rounded p-0.5 text-muted-foreground/35 transition-colors hover:text-muted-foreground/70"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
        </div>
      </div>

      {leader ? (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm leading-none">{leader.emoji}</span>
          <span className="text-[13px] font-medium text-foreground/85">{leader.title}</span>
          {leader.interest != null && <InterestLevelStars value={leader.interest} />}
          <span className="text-[10px] text-muted-foreground/45">
            {ranked.length} explored · see how they stack up
          </span>
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-muted-foreground/55">
          Explore a couple of careers and they&apos;ll start stacking up here.
        </p>
      )}
    </div>
  );
}
