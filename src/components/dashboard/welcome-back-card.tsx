"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WelcomeBackDescriptor } from "@/lib/dashboard/welcome-back";

/** Where the forward prompt sends a returning user. */
const CTA_HREF: Record<WelcomeBackDescriptor["cta"]["kind"], string> = {
  resume: "/my-journey",
  explore: "/careers",
};

/**
 * Calm "we remember you" card shown once a day to a returning user.
 * Presentational only — the {@link WelcomeBackDescriptor} carries every
 * decision (selectWelcomeBack); this just maps it to localized copy.
 */
export function WelcomeBackCard({
  descriptor,
  onDismiss,
}: {
  descriptor: WelcomeBackDescriptor;
  onDismiss: () => void;
}) {
  const t = useTranslations("welcomeBack");
  const { name, memory, cta } = descriptor;

  const memoryLine =
    memory.kind === "none"
      ? t("memory.none")
      : t(`memory.${memory.kind}`, { career: memory.career ?? "" });

  return (
    <div className="mb-6">
      <div
        className={cn(
          "relative overflow-hidden bg-card border border-primary/20 rounded-card",
          "shadow-sm transition-shadow duration-300",
        )}
      >
        <button
          onClick={onDismiss}
          aria-label={t("dismiss")}
          title={t("dismiss")}
          className="absolute top-3 right-3 p-1.5 rounded-control text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-control bg-primary/10 shrink-0">
              <Sparkles className="h-5 w-5 text-primary/80" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground mb-1.5">
                {t("greeting", { name })}
              </h2>
              <p className="text-sm text-muted-foreground/80 leading-relaxed mb-1 max-w-md">
                {memoryLine}
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed mb-4 max-w-md">
                {t("prompt")}
              </p>
              <Link
                href={CTA_HREF[cta.kind]}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-control bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
              >
                {t(`cta.${cta.kind}`)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
