"use client";

/**
 * Clarity Shift section — the composed, self-contained unit dropped into the
 * career detail sheet. Owns the before → after → reflect flow so the host
 * surface only needs a one-line mount.
 *
 * Flow:
 *   1. no before score  → ask the BEFORE question
 *   2. before, no after → show the AFTER question (with the before captured)
 *   3. both             → show the reflection (re-rate stays available)
 *
 * Renders nothing when signed out or no career — never an empty shell.
 */

import { useTranslations } from "next-intl";
import { Gauge } from "lucide-react";
import { useClarityShift } from "@/hooks/use-clarity-shift";
import { ClarityShiftPrompt } from "./clarity-shift-prompt";
import { ClarityShiftReflection } from "./clarity-shift-reflection";

interface ClarityShiftSectionProps {
  careerId: string;
}

export function ClarityShiftSection({ careerId }: ClarityShiftSectionProps) {
  const t = useTranslations("clarityShift");
  const { beforeScore, afterScore, status, enabled, setBefore, setAfter } =
    useClarityShift(careerId);

  if (!enabled || status === "loading") return null;

  const bothRated = beforeScore != null && afterScore != null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Gauge className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[12px] font-semibold text-foreground/85">{t("sectionTitle")}</h3>
      </div>

      {bothRated ? (
        <>
          <ClarityShiftReflection before={beforeScore} after={afterScore} />
          {/* Let them update their "now" rating if they keep exploring. */}
          <ClarityShiftPrompt phase="after" value={afterScore} onSelect={setAfter} />
        </>
      ) : beforeScore != null ? (
        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground/80">{t("afterCta")}</p>
          <ClarityShiftPrompt phase="after" value={afterScore} onSelect={setAfter} />
        </div>
      ) : (
        <ClarityShiftPrompt phase="before" value={beforeScore} onSelect={setBefore} />
      )}
    </section>
  );
}
