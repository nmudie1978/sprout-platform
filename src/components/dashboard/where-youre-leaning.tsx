"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const t = useTranslations();
  const reduce = useReducedMotion();
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

  // Key the focus value so AnimatePresence cross-fades/slides to the new
  // leader whenever the user's signal shifts (explore / save / rate). The
  // app visibly "notices" the change rather than silently swapping the
  // label. All motion is disabled under prefers-reduced-motion.
  const leaderKey = `${leader.emoji} ${leader.title}`;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mb-3 flex items-center justify-between gap-2 rounded-control border border-border/30 bg-card/20 px-3.5 py-2"
    >
      <p className="flex min-w-0 items-baseline gap-1 text-[13px] text-foreground/85">
        <span className="shrink-0">{t('dashboard.mainFocus')}</span>{" "}
        {reduce ? (
          <span className="truncate font-semibold">{leaderKey}</span>
        ) : (
          <span className="relative inline-flex min-w-0 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={leaderKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, position: "absolute" }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="truncate font-semibold"
              >
                {leaderKey}
              </motion.span>
            </AnimatePresence>
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss"
        title="Dismiss"
        className="shrink-0 rounded p-0.5 text-muted-foreground/65 transition-colors hover:text-muted-foreground/80"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
