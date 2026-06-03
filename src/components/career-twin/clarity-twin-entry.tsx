"use client";

/**
 * Career Twin opt-in inside My Journey → Clarity.
 *
 * Deliberately minimal and entirely optional:
 *  - A single small "Meet Future You" pill — never a promoted card, so it
 *    doesn't clutter Clarity.
 *  - Choose it → the Twin opens INLINE, in a dialog over Clarity. It never
 *    navigates to /career-advisor: leaving the page would break the user's
 *    journey ("I lose focus on Clarity"). Closing the dialog returns them
 *    exactly where they were.
 *  - Don't want it → a quiet ✕ hides the whole section (remembered on this
 *    device); the inline view is then never shown.
 *
 * Grounded to the Clarity career (which may be a non-primary explored goal),
 * not the user's primary goal.
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";
import { Sparkles, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Heavy conversation UI — only load it when the user actually opens the Twin.
const CareerTwinView = dynamic(
  () => import("./career-twin-view").then((m) => m.CareerTwinView),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </div>
    ),
  },
);

/** If set, the user has hidden the Clarity Twin option (device-local). */
const HIDE_KEY = "endeavrly:twin-clarity-hidden";

interface CareerInfo {
  id: string;
  title: string;
}

export function ClarityTwinEntry({ career }: { career: CareerInfo | null }) {
  const t = useTranslations("careerTwin");
  // null = not read yet (avoids a flash before the hidden flag is known).
  const [hidden, setHidden] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(HIDE_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  if (!career || hidden === null || hidden) return null;

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {
      /* best-effort */
    }
    track("career_twin_cta_dismissed", { source: "clarity-pill" });
  };

  return (
    <div className="group flex items-center gap-1 px-1">
      <button
        type="button"
        onClick={() => {
          track("career_twin_opened", { source: "clarity-pill" });
          setOpen(true);
        }}
        className="group/twin inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 transition-colors hover:text-primary"
      >
        <Sparkles className="h-3 w-3 text-primary/50 transition-colors group-hover/twin:text-primary" />
        {t("meetFutureYou")}
      </button>
      <button
        type="button"
        onClick={hide}
        aria-label={t("maybeLater")}
        title={t("maybeLater")}
        className="rounded-full p-0.5 text-muted-foreground/40 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Inline Twin — opens over Clarity, never navigates away. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 p-0">
          <DialogHeader className="border-b border-border/30 px-4 pb-3 pt-4 text-left sm:px-5">
            <DialogTitle className="text-base">{t("meetFutureYou")}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-4 py-4 sm:px-5">
            {open && <CareerTwinView initialCareerId={career.id} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
