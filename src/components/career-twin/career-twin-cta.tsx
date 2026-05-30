"use client";

/**
 * Career Twin entry CTAs for the Dashboard ("Meet Future You") and
 * My Journey ("Ask Future Me"). Self-resolves the user's active career via
 * /api/career-twin and only renders when a career exists — so it never nags
 * a user who hasn't picked a path yet.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { track } from "@vercel/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface CareerInfo {
  id: string;
  title: string;
}

export function CareerTwinCta({
  variant = "dashboard",
  className,
}: {
  variant?: "dashboard" | "journey";
  className?: string;
}) {
  const t = useTranslations("careerTwin");
  const [career, setCareer] = useState<CareerInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/career-twin")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && !data.needsCareer && data.career) {
          setCareer({ id: data.career.id, title: data.career.title });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!career) return null;

  const href = `/career-advisor?tab=twin&career=${encodeURIComponent(career.id)}`;
  const title = variant === "dashboard" ? t("meetFutureYou") : t("askFutureMe");

  // Compact inline pill for the Journey surface.
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

  // Dashboard card.
  return (
    <Card className={`border-2 overflow-hidden ${className ?? ""}`}>
      <CardContent className="p-0">
        <Link
          href={href}
          onClick={() => track("career_twin_opened", { source: "dashboard-cta" })}
          className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-r from-primary/10 to-teal-500/10 hover:from-primary/15 hover:to-teal-500/15 transition-colors"
        >
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-teal-600 shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{t("meetFutureYouBody")}</p>
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
      </CardContent>
    </Card>
  );
}
