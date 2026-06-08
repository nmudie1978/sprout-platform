"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InterestLevelStars } from "@/components/interest-level/interest-level-rating";
import { buildDecisionBoard } from "@/lib/decision-board/build";
import { useDecisionInputs } from "@/hooks/use-decision-inputs";
import { useDecisionBoard } from "@/hooks/use-decision-board";

const STAGE_LABEL = ["Not started", "Discover", "Understand", "Complete"];

/**
 * Compact dashboard teaser for the Decision Board: surfaces the career the
 * user is currently leaning towards (the board's #1) and links through to the
 * full standings. Calm, no score — just a nudge towards a decision.
 */
export function WhereYoureLeaning() {
  const { inputs, userId, isLoading } = useDecisionInputs();
  const { board } = useDecisionBoard();

  // Don't render for signed-out users, while loading, or until there are at
  // least 2 explored careers to weigh up (matches the board's own threshold).
  if (!userId || isLoading || inputs.length < 2) return null;

  const { ranked, leader } = buildDecisionBoard(inputs, board);

  return (
    <div className="mb-4 rounded-card border border-border/60 bg-card/40 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
          Where you&apos;re leaning
        </p>
        <Link
          href="/library?tab=decision"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          See the board <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {leader ? (
        <>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-base">{leader.emoji}</span>
            <span className="text-sm font-medium text-foreground/90">{leader.title}</span>
            {leader.interest != null && <InterestLevelStars value={leader.interest} />}
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/50">
              {STAGE_LABEL[leader.progress] ?? ""}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground/60">
            You&apos;ve explored {ranked.length} {ranked.length === 1 ? "career" : "careers"} — see
            how they stack up.
          </p>
        </>
      ) : (
        <p className="mt-1.5 text-xs text-muted-foreground/60">
          Explore a couple of careers and they&apos;ll start stacking up here.
        </p>
      )}
    </div>
  );
}
