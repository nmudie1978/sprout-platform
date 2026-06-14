"use client";

/**
 * Arrival Check-in card — "How are you arriving today?"
 *
 * The SENSING surface of Endeavrly's emotional-signal loop. A calm, optional,
 * self-reported mood tap. On selection it collapses to a short, in-voice
 * acknowledgement (the RESPOND half), computed locally so it feels instant.
 *
 * Renders nothing when: still loading, already checked in earlier today, or
 * skipped this session. Never blocks; never nags (CLAUDE.md: no dark patterns).
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ARRIVAL_MOODS,
  moodAcknowledgementKey,
  type ArrivalMood,
} from "@/lib/arrival/types";
import { useArrivalCheckIn } from "@/hooks/use-arrival-check-in";

export function ArrivalCheckIn() {
  const t = useTranslations("arrival");
  const { today, skipped, status, submit, skip } = useArrivalCheckIn();
  const [selectedMood, setSelectedMood] = useState<ArrivalMood | null>(null);

  const handleSelect = (mood: ArrivalMood) => {
    setSelectedMood(mood);
    void submit(mood);
  };

  if (status === "loading" || skipped) return null;

  // Acknowledgement state — shown only right after the user taps, never on a
  // later page load (that's what `today` + null `selectedMood` guards below).
  if (selectedMood) {
    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-border/40 bg-card/40 px-4 py-3"
      >
        <p className="text-sm text-foreground/85">{t(moodAcknowledgementKey(selectedMood))}</p>
      </section>
    );
  }

  // Already checked in earlier today (or nothing to ask): stay quiet.
  if (today) return null;

  return (
    <section className="rounded-2xl border border-border/40 bg-card/40 px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-foreground/90">{t("prompt")}</h2>
          <p className="text-xs text-muted-foreground/80">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ARRIVAL_MOODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => handleSelect(m.key)}
            className={cn(
              "rounded-xl border border-border/30 bg-card/30 px-3 py-2.5 text-sm font-medium",
              "text-foreground/80 transition-all hover:bg-muted/30 hover:text-foreground",
            )}
          >
            {t(m.labelKey)}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={skip}
        className="mt-3 text-xs text-muted-foreground/70 transition-colors hover:text-foreground/80"
      >
        {t("skip")}
      </button>
    </section>
  );
}
