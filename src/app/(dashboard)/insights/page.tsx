/**
 * INDUSTRY INSIGHTS PAGE
 *
 * Three-section architecture:
 * 1) Global Lens — macro job market data + featured reports/podcasts
 * 2) Youth Lens (15-23) — interpretation of global data for young people
 * 3) Dig Deeper — trending roles and in-demand skills
 *
 * Features:
 * - Clear section dividers
 * - Progressive disclosure (accordions, "show more")
 * - Verified events with URL validation
 * - Add to My Journey CTAs
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import {
  TrendingUp,
  Globe2,
  Sparkles,
  Lightbulb,
  Calendar,
  CheckCircle2,
  Target,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

// Lightweight components loaded eagerly
import { WeeklyFactNudge } from "@/components/insights/weekly-fact-nudge";
import { CountryDataNotice } from "@/components/insights/country-data-notice";
import { PageContext } from "@/components/ui/page-context";
import { InsightUpdateToast } from "@/components/insights/insight-update-toast";
import { RecentInsightUpdates } from "@/components/insights/recent-insight-updates";
import { useInsightUpdates } from "@/hooks/use-insight-updates";

// Heavy components loaded lazily - these are below the fold or data-dependent
const JobMarketStatsCarousel = dynamic(
  () => import("@/components/insights/job-market-stats-carousel").then((m) => m.JobMarketStatsCarousel),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-control bg-muted/50" /> }
);
const SkillsGallery = dynamic(
  () => import("@/components/insights/skills-gallery").then((m) => m.SkillsGallery),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-control bg-muted/50" /> }
);
const WhyThisMatters = dynamic(
  () => import("@/components/insights/why-this-matters").then((m) => m.WhyThisMatters),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-control bg-muted/50" /> }
);
const DidYouKnowCard = dynamic(
  () => import("@/components/insights/did-you-know-card").then((m) => m.DidYouKnowCard),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-control bg-muted/50" /> }
);
const CONTEXT_HINTS_KEY = "insights_contextHints";


// ============================================
// SECTION HEADER COMPONENT
// ============================================

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  label: string;
  labelColor: string;
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  gradient,
  iconBg,
  iconColor,
  label,
  labelColor,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className={`h-1 rounded-pill ${gradient} mb-3 sm:mb-5`} />
      <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
        <div className={`p-2.5 sm:p-3 rounded-card ${iconBg} ring-2 ring-offset-2 ring-offset-background ${labelColor.replace('text-', 'ring-').replace(/\/\d+$/, '/20')}`}>
          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${iconColor}`} />
        </div>
        <div>
          <span className={`text-xs font-bold uppercase tracking-[0.15em] ${labelColor}`}>
            {label}
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-foreground mt-0.5">{title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function IndustryInsightsPage() {
  const t = useTranslations("insights");

  // Context hints toggle (OFF by default, persisted to localStorage)
  const [showContextHints, setShowContextHints] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONTEXT_HINTS_KEY);
      if (stored === "true") setShowContextHints(true);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleContextHints = useCallback(() => {
    setShowContextHints((prev) => {
      const next = !prev;
      try { localStorage.setItem(CONTEXT_HINTS_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  // Live insight updates (toast + history)
  const { activeToast, dismissToast, recentUpdates } = useInsightUpdates();

  // Fetch insights modules verification status
  const { data: modulesData } = useQuery({
    queryKey: ["insights-modules-meta"],
    queryFn: async () => {
      const response = await fetch("/api/insights/modules");
      if (!response.ok) throw new Error("Failed to fetch modules");
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // "Refreshed" label — derived from the freshest real verification timestamp
  // across the insight modules (meta.lastVerification, set whenever the
  // content is seeded or re-verified by the refresh pipeline), NOT a hardcoded
  // date. So it stays honest and self-updates instead of drifting stale.
  const lastVerification = modulesData?.meta?.lastVerification as
    | string
    | undefined;
  const refreshedLabel = lastVerification
    ? t("refreshed", {
        quarter: (() => {
          const d = new Date(lastVerification);
          return `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${d.getUTCFullYear()}`;
        })(),
      })
    : t("reviewedRegularly");

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-primary/5 pointer-events-none dark:hidden" />

      {/* Live insight update toast — top-right, non-blocking */}
      <div className="fixed top-20 right-4 z-50 pointer-events-none">
        <InsightUpdateToast update={activeToast} onDismiss={dismissToast} />
      </div>

      <PageContext
        pageKey="insights"
        purpose="Real data about careers, industries, and the job market — designed to help you make informed decisions."
        action="Read articles, watch videos, and save anything useful to your library."
      />

      <PageHeader
        title={t("pageTitle")}
        gradientText={t("pageTitleGradient")}
        description={t("pageDescription")}
        icon={TrendingUp}
        centered
        infoTooltip="Explore real data about careers, industries, and the job market. Browse global trends, youth-specific insights, and curated articles and videos to help you make informed decisions."
      />

      {/* Honesty: Insights data is Norway-based — say so for non-Norway users. */}
      <CountryDataNotice />

      {/* Trust line + section guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          {t("trustLine")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground/40">Jump to:</span>
          <a href="#global-lens" className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-pill bg-info/10 text-info hover:bg-info/20 transition-colors">
            <Globe2 className="h-3 w-3" /> Global Lens
          </a>
          <a href="#youth-lens" className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-pill bg-warning/10 text-warning hover:bg-warning/20 transition-colors">
            <Sparkles className="h-3 w-3" /> Youth Lens
          </a>
          <a href="#dig-deeper" className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-pill bg-success/10 text-success hover:bg-success/20 transition-colors">
            <Lightbulb className="h-3 w-3" /> Explore
          </a>
        </div>
      </motion.div>

      {/* Weekly Mobile Nudge (shows once per week on mobile) */}
      <WeeklyFactNudge />

      {/* ============================================ */}
      {/* SECTION 1: GLOBAL INDUSTRY & CAREER LANDSCAPE */}
      {/* ============================================ */}
      <motion.section
        id="global-lens"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-2 scroll-mt-20"
      >
        <div className="rounded-card border-2 border-info/20 dark:border-info/30 bg-card p-3 sm:p-6">
          <div className="relative">
            <SectionHeader
              icon={Globe2}
              label={t("globalLens")}
              title={t("globalTitle")}
              subtitle={t("globalSubtitle")}
              gradient="bg-info"
              iconBg="bg-info/10 dark:bg-info/20"
              iconColor="text-info"
              labelColor="text-info/80"
            />
            <button
              onClick={toggleContextHints}
              className="absolute top-0 right-0 sm:top-8 flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors z-10"
              aria-pressed={showContextHints}
            >
              <span
                className={`
                  relative inline-flex h-4 w-7 items-center rounded-pill transition-colors duration-200
                  ${showContextHints ? "bg-primary/60" : "bg-muted-foreground/20"}
                `}
              >
                <span
                  className={`
                    inline-block h-3 w-3 rounded-pill bg-background shadow-sm transition-transform duration-200
                    ${showContextHints ? "translate-x-3.5" : "translate-x-0.5"}
                  `}
                />
              </span>
              <span className="hidden sm:inline">{t("showContextHints")}</span>
            </button>
          </div>

          {/* 1. Job Market Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                {t("jobMarketStats")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("jobMarketStatsDesc")}
              </p>
            </div>
            <JobMarketStatsCarousel showContextHints={showContextHints} />
          </motion.div>

        </div>
      </motion.section>

      {/* ============================================ */}
      {/* SECTION 2: YOUTH LENS (15-23) */}
      {/* ============================================ */}
      <motion.section
        id="youth-lens"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mb-3 scroll-mt-20"
      >
        <div className="rounded-card border-2 border-warning/20 dark:border-warning/30 bg-card p-3 sm:p-4">
          <SectionHeader
            icon={Sparkles}
            label={t("youthLens")}
            title={t("youthTitle")}
            subtitle={t("youthSubtitle")}
            gradient="bg-warning"
            iconBg="bg-warning/10 dark:bg-warning/20"
            iconColor="text-warning"
            labelColor="text-warning/80"
          />

          {/* Side-by-side: Why This Matters + Did You Know */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mb-4 grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            <div className="lg:col-span-7">
              <WhyThisMatters />
            </div>
            <div className="lg:col-span-5">
              <DidYouKnowCard />
            </div>
          </motion.div>

        </div>
      </motion.section>

      {/* ============================================ */}
      {/* SECTION 3: DIG DEEPER */}
      {/* ============================================ */}
      <motion.section
        id="dig-deeper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-3 scroll-mt-20"
      >
        <div className="rounded-card border-2 border-primary/20 dark:border-primary/30 bg-card p-3 sm:p-4">
          <SectionHeader
            icon={Layers}
            label="Explore"
            title="Skills That Matter"
            subtitle="Articles, podcasts, and videos on the skills that matter most — drag the gallery to explore"
            gradient="bg-primary"
            iconBg="bg-primary/10 dark:bg-primary/20"
            iconColor="text-primary"
            labelColor="text-primary/80"
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            id="skills-that-matter"
            className="scroll-mt-20"
          >
            <SkillsGallery />
          </motion.div>
        </div>
      </motion.section>

      {/* ============================================ */}
      {/* DATA SOURCE NOTE */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8 p-5 rounded-control bg-muted/20 border"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <p className="font-medium text-sm">{t("aboutData")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 max-w-xl">
              {t("aboutDataDesc")}
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {[
                { name: "WEF", url: "https://www.weforum.org" },
                { name: "ILO", url: "https://www.ilo.org" },
                { name: "OECD", url: "https://www.oecd.org" },
                { name: "McKinsey", url: "https://www.mckinsey.com" },
                { name: "Deloitte", url: "https://www.deloitte.com" },
                { name: "LinkedIn", url: "https://economicgraph.linkedin.com" },
                { name: "Eurostat", url: "https://ec.europa.eu/eurostat" },
                { name: "NAV/SSB", url: "https://www.ssb.no" },
                { name: "NHO", url: "https://www.nho.no" },
                { name: "Lightcast", url: "https://lightcast.io" },
                { name: "ManpowerGroup", url: "https://go.manpowergroup.com" },
                { name: "CFYE", url: "https://fundforyouthemployment.nl" },
              ].map((source, idx, arr) => (
                <span key={source.name} className="flex items-center gap-2">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    {source.name}
                  </a>
                  {idx < arr.length - 1 && <span className="text-muted-foreground/50">·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent detected updates (quiet history) */}
      <RecentInsightUpdates updates={recentUpdates} />

      {/* Verification Status Footer */}
      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-pill bg-success" />
          <span>{refreshedLabel}</span>
        </div>
        {modulesData?.meta?.allVerifiedThisQuarter && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span>{t("verified")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
