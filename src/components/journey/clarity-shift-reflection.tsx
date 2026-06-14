"use client";

/**
 * Clarity Shift reflection — the RESPOND half of the loop. Given the before and
 * after clarity scores, it shows a calm, honest narrative plus a small
 * before → after visual (two dots and an arrow).
 *
 * Honesty matters: a drop in clarity is acknowledged as useful information, not
 * spun as a win (see the `lessSure` copy in the i18n namespace). No
 * celebration confetti, no scores-as-points — this is reflection, not a game.
 */

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CLARITY_LEVELS,
  clarityLevelLabelKey,
  computeShift,
  shiftNarrativeKey,
  type ClarityScore,
} from "@/lib/clarity-shift/types";

interface ClarityShiftReflectionProps {
  before: ClarityScore;
  after: ClarityScore;
}

export function ClarityShiftReflection({ before, after }: ClarityShiftReflectionProps) {
  const t = useTranslations("clarityShift");
  const shift = computeShift(before, after);

  const toneClass =
    shift.direction === "clearer"
      ? "text-emerald-500"
      : shift.direction === "less-sure"
        ? "text-amber-500"
        : "text-muted-foreground";

  return (
    <div className="space-y-2.5 rounded-xl border border-border/40 bg-card/40 p-3">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
        <span className="rounded-md bg-muted/40 px-1.5 py-0.5 font-medium text-foreground/75">
          {t(clarityLevelLabelKey(before))}
        </span>
        <ArrowRight className={cn("h-3.5 w-3.5", toneClass)} />
        <span className="rounded-md bg-muted/40 px-1.5 py-0.5 font-medium text-foreground/75">
          {t(clarityLevelLabelKey(after))}
        </span>
      </div>
      <p className="text-[12px] leading-snug text-foreground/85">{t(shiftNarrativeKey(shift))}</p>
      {/* tiny 1..5 scale marker so the move is visible at a glance */}
      <div className="flex gap-0.5" aria-hidden="true">
        {CLARITY_LEVELS.map((level) => (
          <div
            key={level.score}
            className={cn(
              "h-1 flex-1 rounded-full",
              level.score <= after ? "bg-primary/70" : "bg-muted/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
