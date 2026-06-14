"use client";

/**
 * Clarity Shift prompt — the 1–5 "how clear do you feel about this path?"
 * control. Used for both endpoints; the `phase` prop selects before/after copy.
 *
 * Purely presentational: the parent owns the value and persistence (via
 * useClarityShift), so this stays trivial to test and reuse.
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  CLARITY_LEVELS,
  clarityLevelLabelKey,
  type ClarityPhase,
  type ClarityScore,
} from "@/lib/clarity-shift/types";

interface ClarityShiftPromptProps {
  phase: ClarityPhase;
  value: ClarityScore | null;
  onSelect: (score: ClarityScore) => void;
}

export function ClarityShiftPrompt({ phase, value, onSelect }: ClarityShiftPromptProps) {
  const t = useTranslations("clarityShift");

  return (
    <div className="space-y-2.5">
      <h3 className="text-[12px] font-semibold text-foreground/85">
        {t(phase === "before" ? "prompt.before" : "prompt.after")}
      </h3>
      <div className="flex gap-1.5">
        {CLARITY_LEVELS.map((level) => {
          const isActive = value === level.score;
          return (
            <button
              key={level.score}
              type="button"
              onClick={() => onSelect(level.score)}
              aria-pressed={isActive}
              className={cn(
                "flex-1 rounded-lg border px-1 py-2 text-center transition-all",
                isActive
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border/30 bg-card/30 text-muted-foreground/75 hover:bg-muted/20 hover:text-foreground/80",
              )}
            >
              <span className="block text-[10px] font-medium">{level.score}</span>
              <span className="mt-0.5 block text-[8px] leading-tight">
                {t(clarityLevelLabelKey(level.score))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
