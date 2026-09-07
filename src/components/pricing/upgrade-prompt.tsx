"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UPGRADE_COPY, upgradeHref, type UpgradeReason } from "@/lib/pricing/upgrade-reasons";

/**
 * Shown when a Free user meets a limit.
 *
 * Deliberately quiet. Someone has just been stopped mid-task, so this states
 * what happened and what would change it, and then gets out of the way — no
 * urgency, no countdown, no implication they have done something wrong.
 *
 * The CTA carries the current path, so the pricing page can send them back to
 * what they were doing. Losing your place on top of being interrupted is the
 * thing the brief calls out specifically.
 */
export function UpgradePrompt({
  reason,
  variant = "panel",
  className = "",
}: {
  reason: UpgradeReason;
  /** "panel" fills a blocked area; "inline" sits under existing content. */
  variant?: "panel" | "inline";
  className?: string;
}) {
  const pathname = usePathname();
  const copy = UPGRADE_COPY[reason];
  const href = upgradeHref(reason, pathname ?? undefined);

  if (variant === "inline") {
    return (
      <p className={`text-sm text-muted-foreground ${className}`}>
        {copy.headline}{" "}
        <Link href={href} className="text-primary font-medium hover:underline">
          {copy.cta}
        </Link>
      </p>
    );
  }

  return (
    <div
      className={`rounded-card border border-primary/20 bg-primary/[0.04] p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-2">
          <p className="font-medium text-foreground">{copy.headline}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{copy.body}</p>
          <Button asChild size="sm" className="mt-1">
            <Link href={href}>{copy.cta}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
