"use client";

/**
 * Career Twin entry CTAs for the Dashboard ("Meet Future You") and
 * My Journey ("Ask Future Me"). Self-resolves the user's active career via
 * /api/career-twin and only renders when a career exists — so it never nags
 * a user who hasn't picked a path yet.
 *
 * The dashboard card is dismissible: a quiet ✕ hides it and remembers the
 * choice in localStorage (per device), so a user who isn't interested isn't
 * shown it again. The compact Journey pill is not dismissible — it's small
 * and lives inline within the Journey flow.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X, CheckCircle2 } from "lucide-react";

interface CareerInfo {
  id: string;
  title: string;
}

const DISMISS_KEY = "endeavrly:career-twin-cta-dismissed";

export function CareerTwinCta({
  variant = "dashboard",
  className,
  career: careerProp,
}: {
  variant?: "dashboard" | "journey" | "journeyComplete";
  className?: string;
  /** When provided, the CTA is grounded to this career instead of
   *  self-resolving the user's primary goal — needed inside My Journey →
   *  Clarity, which may be showing a non-primary explored goal. */
  career?: CareerInfo | null;
}) {
  const t = useTranslations("careerTwin");
  const router = useRouter();
  const [career, setCareer] = useState<CareerInfo | null>(careerProp ?? null);
  const [dismissed, setDismissed] = useState(false);
  const [returning, setReturning] = useState(false);

  // Read the saved dismissal once on mount (guards against SSR/localStorage
  // throwing in private tabs). Only relevant to the dashboard card.
  useEffect(() => {
    if (variant !== "dashboard") return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      /* localStorage unavailable — show the card */
    }
  }, [variant]);

  useEffect(() => {
    // Grounded by the caller (e.g. Clarity) → use it directly, no fetch.
    if (careerProp) {
      setCareer(careerProp);
      return;
    }
    let cancelled = false;
    fetch("/api/career-twin")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.needsCareer && data.career) {
          setCareer({ id: data.career.id, title: data.career.title });
        }
        if (data?.checkIn?.returning) setReturning(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [careerProp]);

  if (!career) return null;

  const href = `/career-advisor?tab=twin&career=${encodeURIComponent(career.id)}`;
  const title =
    variant === "dashboard"
      ? returning
        ? t("checkInFutureYou")
        : t("meetFutureYou")
      : t("askFutureMe");

  // Completion pointer embedded inside the dashboard My Journey card, shown
  // only once the journey reaches 3/3 (gated by the parent). Now that the
  // Career Twin lives in My Journey → Clarity, this is just a quiet one-line
  // pointer — deliberately small and subtle. Rendered as a <button> rather
  // than a <Link> because the journey card is itself wrapped in a
  // <Link href="/my-journey"> — nested anchors are invalid HTML. We navigate
  // via the router and stop propagation so the click doesn't also trigger the
  // surrounding card link.
  if (variant === "journeyComplete") {
    return (
      <div className={`mt-3 pt-2.5 border-t border-border/20 ${className ?? ""}`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            track("career_twin_opened", { source: "journey-complete" });
            router.push(href);
          }}
          className="group/twin inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/60" />
          <span>{t("meetFutureSelfAs", { career: career.title })}</span>
          <ArrowRight className="h-3 w-3 shrink-0 transition-transform group-hover/twin:translate-x-0.5" />
        </button>
      </div>
    );
  }

  // Compact inline pill for the Journey surface (not dismissible).
  if (variant === "journey") {
    return (
      <Link
        href={href}
        onClick={() => track("career_twin_opened", { source: "journey-cta" })}
        className={`inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-teal-500/10 px-4 py-2 text-sm font-medium hover:border-primary/60 transition-colors ${className ?? ""}`}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        {title}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  }

  // Dashboard card — hidden once the user dismisses it.
  if (dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* best-effort persistence */
    }
    track("career_twin_cta_dismissed", { source: "dashboard-cta" });
  };

  return (
    <Card className={`border-2 overflow-hidden ${className ?? ""}`}>
      <CardContent className="relative p-0">
        <Link
          href={href}
          onClick={() => track("career_twin_opened", { source: "dashboard-cta" })}
          className="flex items-center gap-4 p-4 sm:p-5 pr-10 sm:pr-12 bg-gradient-to-r from-primary/10 to-teal-500/10 hover:from-primary/15 hover:to-teal-500/15 transition-colors"
        >
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-teal-600 shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {returning ? t("checkInFutureYouBody") : t("meetFutureYouBody")}
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-gradient-to-r from-primary to-teal-600 hidden sm:inline-flex"
            tabIndex={-1}
          >
            {t("talkToFutureSelfAs", { career: career.title })}
          </Button>
          <ArrowRight className="h-5 w-5 text-primary shrink-0 sm:hidden" />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Hide this"
          title="Hide this"
          className="absolute top-2 right-2 z-10 rounded-full p-1 text-muted-foreground/60 bg-background/40 hover:bg-background hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </CardContent>
    </Card>
  );
}
