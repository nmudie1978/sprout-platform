/**
 * INDUSTRY INSIGHTS PAGE
 *
 * Two-section architecture:
 * 1) Global Industry & Career Landscape - macro job market data (not youth-specific)
 * 2) Youth Lens (15-21) - interpretation of global data for young people
 *
 * Features:
 * - Clear section dividers
 * - Progressive disclosure (accordions, "show more")
 * - Verified events with URL validation
 * - Add to My Journey CTAs
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import {
  TrendingUp,
  Globe2,
  Sparkles,
  Calendar,
  CheckCircle2,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

// Import insights components
import {
  JobMarketStatsCarousel,
  DidYouKnowCard,
  WeeklyFactNudge,
  WhyThisMatters,
  InsightSection,
  YouthEventsTable,
  JobsEconomySpotlight,
} from "@/components/insights";


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
        title="Industry"
        gradientText="Insights"
        description="Understanding what's shaping careers globally"
        icon={TrendingUp}
      />

      {/* World Lens intro text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm text-muted-foreground mb-8 max-w-2xl"
      >
        Industry Insights is your world lens — helping you understand the world beyond job listings.
        Split into two parts: global career landscape data, and what it means for you (15-21).
      </motion.p>

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
            label="Global Lens"
            title="Global Industry & Career Landscape"
            subtitle="Macro trends shaping jobs worldwide — data-led, not youth-specific"
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
                Job Market Statistics
              </h3>
              <p className="text-xs text-muted-foreground">
                Key data points from global employment research
              </p>
            </div>
            <JobMarketStatsCarousel />
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

          {/* Future of Jobs & Economies */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="mb-8"
          >
            <JobsEconomySpotlight />
          </motion.div>

        </div>
      </motion.section>

      {/* ============================================ */}
      {/* SECTION 2: YOUTH LENS (15-21) */}
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
            label="Youth Lens"
            title="What It Means for You (15–21)"
            subtitle="How the global landscape connects to your choices — warm, actionable, grounded"
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

          {/* 3. Youth Career Events in Norway */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.65 }}
            className="mb-4"
          >
            <YouthEventsTable />
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
        className="mt-8 p-5 rounded-lg bg-muted/20 border"
      >
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm mb-1">About the Data</p>
            <p className="text-xs text-muted-foreground mb-2">
              All insights are derived from Tier-1 sources and reviewed quarterly. Content is summarised for clarity.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <a href="https://www.weforum.org" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                World Economic Forum
              </a>
              <span className="text-muted-foreground/50">•</span>
              <a href="https://www.ilo.org" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                ILO
              </a>
              <span className="text-muted-foreground/50">•</span>
              <a href="https://www.oecd.org" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                OECD
              </a>
              <span className="text-muted-foreground/50">•</span>
              <a href="https://www.wipo.int" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                WIPO
              </a>
              <span className="text-muted-foreground/50">•</span>
              <a href="https://www.mckinsey.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                McKinsey
              </a>
              <span className="text-muted-foreground/50">&bull;</span>
              <a href="https://fundforyouthemployment.nl" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                CFYE
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Verification Status Footer */}
      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>Refreshed Q1 2025</span>
        </div>
        {modulesData?.meta?.allVerifiedThisQuarter && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span>Verified</span>
          </div>
        )}
      </div>
    </div>
  );
}
