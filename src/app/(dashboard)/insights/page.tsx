/**
 * INDUSTRY INSIGHTS PAGE
 *
 * Two-section architecture:
 * 1) Global Industry & Career Landscape - macro job market data (not youth-specific)
 * 2) Youth Lens (15-23) - interpretation of global data for young people
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
} from "lucide-react";
import { motion } from "framer-motion";

// Lightweight components loaded eagerly
import { WeeklyFactNudge } from "@/components/insights/weekly-fact-nudge";

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
    <div className="mb-6">
      <div className={`h-1 rounded-full bg-gradient-to-r ${gradient} mb-5`} />
      <div className="flex flex-col items-center text-center gap-3">
        <div className={`p-3 rounded-2xl ${iconBg} ring-2 ring-offset-2 ring-offset-background ${labelColor.replace('text-', 'ring-').replace(/\/\d+$/, '/20')}`}>
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${labelColor}`}>
            {label}
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-0.5">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
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
    <div className="container mx-auto px-4 py-8 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      <PageHeader
        title={t("pageTitle")}
        gradientText={t("pageTitleGradient")}
        description={t("pageDescription")}
        icon={TrendingUp}
      />

      {/* Trust line + context hints toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8"
      >
        <div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("trustLine")}
          </p>
          <p
            className="text-[10px] text-muted-foreground/40 mt-1.5 cursor-default"
            title="Sources include OECD, WEF, ILO, McKinsey, NAV, SSB, and universities. Broken or outdated links are automatically removed. Data is refreshed quarterly."
          >
            {t("verifiedSources")}
          </p>
        </div>
        <button
          onClick={toggleContextHints}
          className="flex items-center gap-2 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors self-start sm:self-auto flex-shrink-0"
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
          {t("showContextHints")}
        </button>
      </motion.div>

      {/* Weekly Mobile Nudge (shows once per week on mobile) */}
      <WeeklyFactNudge />

      {/* ============================================ */}
      {/* SECTION 1: GLOBAL INDUSTRY & CAREER LANDSCAPE */}
      {/* ============================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-4"
      >
        <div className="rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/10 p-6">
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

          {/* 2. Jobs & Roles on the Rise + 3. Skills That Matter (side-by-side) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
            <div className="lg:col-span-6">
              <InsightSection sectionKey="jobs-on-the-rise" delay={0.25} compact contained defaultViewMode="list" />
            </div>
            <div className="lg:col-span-6">
              <InsightSection sectionKey="skills-that-matter" delay={0.3} compact contained defaultViewMode="list" />
            </div>
          </div>

          {/* Future of Jobs & Economies (WEF Report + CFYE Podcast) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38 }}
            className="mb-4"
          >
            <JobsEconomySpotlight />
          </motion.div>

        </div>
      </motion.section>

      {/* ============================================ */}
      {/* SECTION 2: YOUTH LENS (15-23) */}
      {/* ============================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-4"
      >
        <div className="rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-background via-background to-amber-50/30 dark:to-amber-950/10 p-4">
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
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-4"
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
      {/* SECTION 3: GO FURTHER */}
      {/* ============================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-4"
      >
        <div className="rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-background via-background to-emerald-50/30 dark:to-emerald-950/10 p-4">
          <SectionHeader
            icon={Lightbulb}
            label="Explore"
            title="Go Further"
            subtitle="Explore global perspectives and find upcoming career events"
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
