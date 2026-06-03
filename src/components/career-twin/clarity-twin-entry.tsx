"use client";

/**
 * Career Twin entry inside My Journey → Clarity. The always-on companion to
 * the dashboard's completion-reward surface (`CareerTwinCta variant=
 * "journeyComplete"`): once a user has worked through to Clarity for a career
 * — itself earned, since Clarity is locked behind Discover → Understand — the
 * Twin becomes a calm, ever-present door to talk their direction through.
 *
 * Two states:
 *  - Introduce (one-time per career): a warm card the first time the user
 *    reaches Clarity for this career — "you've got a direction, meet Future
 *    You." Opening it or dismissing it settles it into the pill forever after.
 *  - Steady: the compact "Ask Future Me" pill (reuses CareerTwinCta), grounded
 *    to THIS career rather than the user's primary goal.
 *
 * Never gated, never a cold promo — it only appears once the journey has been
 * walked. Grounding to the Clarity career matters because Clarity may be
 * showing a non-primary explored goal.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";
import { Sparkles, ArrowRight } from "lucide-react";
import { CareerTwinCta } from "./career-twin-cta";

/** Per-career flag: has the Clarity introduction been seen/dismissed yet. */
const INTRO_PREFIX = "endeavrly:twin-introduced";
/** Matches the JourneyReflectionsTray storage key (see use-journey-reflections). */
const REFLECTIONS_PREFIX = "endeavrly-journey-reflections";

interface CareerInfo {
  id: string;
  title: string;
}

export function ClarityTwinEntry({ career }: { career: CareerInfo | null }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const t = useTranslations("careerTwin");
  // null = flag not read yet (avoids a flash of the intro card on every load).
  const [introduced, setIntroduced] = useState<boolean | null>(null);
  const [hasReflections, setHasReflections] = useState(false);

  const careerId = career?.id ?? null;

  useEffect(() => {
    if (!careerId || typeof window === "undefined") {
      setIntroduced(true);
      return;
    }
    try {
      setIntroduced(localStorage.getItem(`${INTRO_PREFIX}:${careerId}`) === "1");
    } catch {
      setIntroduced(true);
    }
  }, [careerId]);

  // Does this career have any reflection yet? Drives the gentle "jot a
  // reflection first" nudge — the Twin works off the goal + quiz alone, so
  // this only encourages substance, it never blocks.
  useEffect(() => {
    if (!userId || !careerId || typeof window === "undefined") {
      setHasReflections(false);
      return;
    }
    try {
      const raw = localStorage.getItem(`${REFLECTIONS_PREFIX}:${userId}:${careerId}`);
      if (!raw) {
        setHasReflections(false);
        return;
      }
      const p = JSON.parse(raw) as Record<string, unknown>;
      const any =
        String(p?.discover ?? "").trim() ||
        String(p?.understand ?? "").trim() ||
        String(p?.clarity ?? "").trim();
      setHasReflections(Boolean(any));
    } catch {
      setHasReflections(false);
    }
  }, [userId, careerId]);

  if (!career || introduced === null) return null;

  const href = `/career-advisor?tab=twin&career=${encodeURIComponent(career.id)}`;

  const markIntroduced = () => {
    setIntroduced(true);
    try {
      localStorage.setItem(`${INTRO_PREFIX}:${career.id}`, "1");
    } catch {
      /* best-effort */
    }
  };

  const tip = !hasReflections ? (
    <p className="mt-2 text-xs text-muted-foreground">{t("reflectionTip")}</p>
  ) : null;

  // Steady state — the calm inline pill, grounded to this career.
  if (introduced) {
    return (
      <div className="px-1">
        <CareerTwinCta variant="journey" career={career} />
        {tip}
      </div>
    );
  }

  // Introduce state — one-time warm card.
  return (
    <div className="overflow-hidden rounded-card border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-teal-500/10">
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <div className="shrink-0 rounded-2xl bg-gradient-to-br from-primary to-teal-600 p-2.5">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-tight">{t("meetFutureYou")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("clarityIntroBody", { career: career.title })}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={href}
              onClick={() => {
                track("career_twin_opened", { source: "clarity-intro" });
                markIntroduced();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-teal-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t("askFutureMe")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => {
                track("career_twin_cta_dismissed", { source: "clarity-intro" });
                markIntroduced();
              }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("maybeLater")}
            </button>
          </div>
          {tip}
        </div>
      </div>
    </div>
  );
}
