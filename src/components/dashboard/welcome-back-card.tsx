"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, X } from "lucide-react";
import type { WelcomeBackDescriptor } from "@/lib/dashboard/welcome-back";

/** Where the resume line sends a returning user. */
const CTA_HREF: Record<WelcomeBackDescriptor["cta"]["kind"], string> = {
  resume: "/my-journey",
  explore: "/careers",
};

/**
 * Minimal "pick up where you left off" line for a returning user — shown
 * once a day, dismissable. Deliberately understated: no greeting, no name,
 * no sparkle, no card; just one slim, functional resume line with a hairline
 * divider. Presentational only — {@link WelcomeBackDescriptor} carries every
 * decision (selectWelcomeBack). Renders nothing when there's no history.
 */
export function WelcomeBackCard({
  descriptor,
  onDismiss,
}: {
  descriptor: WelcomeBackDescriptor;
  onDismiss: () => void;
}) {
  const t = useTranslations("welcomeBack");
  const { memory, cta } = descriptor;

  // No history to resume → render nothing.
  if (memory.kind === "none" || !memory.career) return null;

  const lead = cta.kind === "resume" ? t("continueResume") : t("continueExplore");

  return (
    <div className="mb-6 flex items-center gap-3 border-b border-border/60 pb-3">
      <Link
        href={CTA_HREF[cta.kind]}
        className="group inline-flex min-w-0 flex-1 items-center gap-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-control"
      >
        <span className="shrink-0 text-foreground/60">{lead}</span>
        <span className="shrink-0 text-muted-foreground/40">—</span>
        <span className="truncate font-medium text-foreground/90 group-hover:text-foreground transition-colors">
          {memory.career}
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
      </Link>
      <button
        onClick={onDismiss}
        aria-label={t("dismiss")}
        title={t("dismiss")}
        className="shrink-0 rounded-control p-1 text-muted-foreground/50 transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
