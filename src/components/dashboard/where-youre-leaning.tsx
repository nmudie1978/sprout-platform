"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { buildDecisionBoard } from "@/lib/decision-board/build";
import { useDecisionInputs } from "@/hooks/use-decision-inputs";
import { useDecisionBoard } from "@/hooks/use-decision-board";

const STORAGE_KEY = "decision-teaser-closed";

/**
 * One-line dashboard note: states the career the user is currently leaning
 * towards (the Decision Board's #1). Deliberately minimal — a single sentence,
 * dismissible. Once closed, it stays closed (localStorage). The full board
 * still lives in My Library → Decision.
 */
export function WhereYoureLeaning() {
  const { inputs, userId, isLoading } = useDecisionInputs();
  const { board } = useDecisionBoard();

  // Read the persisted closed state synchronously on the client (SSR-safe).
  const [closed, setClosed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const close = () => {
    setClosed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Don't render for signed-out users, while loading, once dismissed, or until
  // there are at least 2 explored careers to weigh up (the board's threshold).
  if (!userId || isLoading || closed || inputs.length < 2) return null;

  const { leader } = buildDecisionBoard(inputs, board);
  if (!leader) return null;

  return (
    <div className="mb-3 flex items-center justify-between gap-2 rounded-control border border-border/30 bg-card/20 px-3.5 py-2">
      <p className="truncate text-[13px] text-foreground/85">
        Your main career focus is:{" "}
        <span className="font-semibold">
          {leader.emoji} {leader.title}
        </span>
      </p>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss"
        title="Dismiss"
        className="shrink-0 rounded p-0.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground/80"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
