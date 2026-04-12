/**
 * INDUSTRY INSIGHTS PAGE
 *
 * Four-section architecture:
 * 1) Global Lens — macro job market data + featured reports/podcasts
 * 2) Youth Lens (15-23) — interpretation of global data for young people
 * 3) Dig Deeper — trending roles and in-demand skills
 * 4) Go Further — global perspectives, beyond borders, events
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
import { PageContext } from "@/components/ui/page-context";
import { InsightUpdateToast } from "@/components/insights/insight-update-toast";
import { RecentInsightUpdates } from "@/components/insights/recent-insight-updates";
import { useInsightUpdates } from "@/hooks/use-insight-updates";

// Heavy components loaded lazily - these are below the fold or data-dependent
const JobMarketStatsCarousel = dynamic(
  () => import("@/components/insights/job-market-stats-carousel").then((m) => m.JobMarketStatsCarousel),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-xl bg-muted/50" /> }
);
const InsightSection = dynamic(
  () => import("@/components/insights/insight-section").then((m) => m.InsightSection),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const JobsEconomySpotlight = dynamic(
  () => import("@/components/insights/jobs-economy-spotlight").then((m) => m.JobsEconomySpotlight),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const WhyThisMatters = dynamic(
  () => import("@/components/insights/why-this-matters").then((m) => m.WhyThisMatters),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-xl bg-muted/50" /> }
);
const DidYouKnowCard = dynamic(
  () => import("@/components/insights/did-you-know-card").then((m) => m.DidYouKnowCard),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-xl bg-muted/50" /> }
);
const GoFurtherTabs = dynamic(
  () => import("@/components/insights/go-further-tabs").then((m) => m.GoFurtherTabs),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
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
      <div className={`h-1 rounded-full bg-gradient-to-r ${gradient} mb-3 sm:mb-5`} />
      <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
        <div className={`p-2.5 sm:p-3 rounded-2xl ${iconBg} ring-2 ring-offset-2 ring-offset-background ${labelColor.replace('text-', 'ring-').replace(/\/\d+$/, '/20')}`}>
          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${iconColor}`} />
        </div>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${labelColor}`}>
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

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 pointer-events-none" />

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
          <span className="text-[11px] text-muted-foreground/40">Jump to:</span>
          <a href="#global-lens" className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
            <Globe2 className="h-3 w-3" /> Global Lens
          </a>
          <a href="#youth-lens" className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">
            <Sparkles className="h-3 w-3" /> Youth Lens
          </a>
          <a href="#dig-deeper" className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
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
        <div className="rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/10 p-3 sm:p-6">
          <div className="relative">
            <SectionHeader
              icon={Globe2}
              label={t("globalLens")}
              title={t("globalTitle")}
              subtitle={t("globalSubtitle")}
              gradient="from-blue-500 via-cyan-500 to-blue-500"
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
              labelColor="text-blue-500/80"
            />
            <button
              onClick={toggleContextHints}
              className="absolute top-0 right-0 sm:top-8 flex items-center gap-2 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors z-10"
              aria-pressed={showContextHints}
            >
              <span
                className={`
                  relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200
                  ${showContextHints ? "bg-primary/60" : "bg-muted-foreground/20"}
                `}
              >
                <span
                  className={`
                    inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200
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

          {/* Future of Jobs & Economies (WEF Report + CFYE Podcast) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <JobsEconomySpotlight />
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
        <div className="rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-background via-background to-amber-50/30 dark:to-amber-950/10 p-3 sm:p-4">
          <SectionHeader
            icon={Sparkles}
            label={t("youthLens")}
            title={t("youthTitle")}
            subtitle={t("youthSubtitle")}
            gradient="from-amber-400 via-orange-400 to-amber-400"
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
            labelColor="text-amber-500/80"
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
        <div className="rounded-2xl border-2 border-teal-200/50 dark:border-teal-800/30 bg-gradient-to-br from-background via-background to-teal-50/30 dark:to-teal-950/10 p-3 sm:p-4">
          <SectionHeader
            icon={Layers}
            label="Explore"
            title="Dig Deeper"
            subtitle="Curated videos, podcasts, and articles on growing careers and the skills behind them"
            gradient="from-teal-400 via-teal-400 to-teal-400"
            iconBg="bg-teal-100 dark:bg-teal-900/30"
            iconColor="text-teal-600 dark:text-teal-400"
            labelColor="text-teal-500/80"
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
          >
            <div id="jobs-on-the-rise" className="lg:col-span-6 scroll-mt-20">
              <InsightSection sectionKey="jobs-on-the-rise" delay={0.25} compact contained defaultViewMode="list" />
            </div>
            <div id="skills-that-matter" className="lg:col-span-6 scroll-mt-20">
              <InsightSection sectionKey="skills-that-matter" delay={0.3} compact contained defaultViewMode="list" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ============================================ */}
      {/* SECTION 4: GO FURTHER */}
      {/* ============================================ */}
      <motion.section
        id="go-further"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="mb-4 scroll-mt-20"
      >
        <div className="rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-background via-background to-emerald-50/30 dark:to-emerald-950/10 p-3 sm:p-4">
          <SectionHeader
            icon={Lightbulb}
            label="Explore"
            title="Go Further"
            subtitle="Explore global perspectives and career possibilities beyond borders"
            gradient="from-emerald-400 via-teal-400 to-emerald-400"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
            labelColor="text-emerald-500/80"
          />

          <GoFurtherTabs />
        </div>
      </motion.section>

      {/* ============================================ */}
      {/* DATA SOURCE NOTE */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8 p-5 rounded-lg bg-muted/20 border"
      >
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm mb-1">{t("aboutData")}</p>
            <p className="text-xs text-muted-foreground mb-2">
              {t("aboutDataDesc")}
            </p>
            <div className="flex flex-wrap gap-2 text-[10px]">
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
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>{t("refreshed")}</span>
        </div>
        {modulesData?.meta?.allVerifiedThisQuarter && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span>{t("verified")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
