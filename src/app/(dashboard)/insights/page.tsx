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
  FileText,
  Download,
  Target,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";

// Import insights components
import {
  JobMarketStatsCarousel,
  DidYouKnowCard,
  WeeklyFactNudge,
  WhyThisMatters,
  InsightSection,
  SkillLongevityIndex,
  YouthEventsTable,
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
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  gradient,
  iconBg,
  iconColor,
}: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className={`h-1.5 rounded-full bg-gradient-to-r ${gradient} mb-4`} />
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION DIVIDER
// ============================================

function SectionDivider() {
  return (
    <div className="relative py-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t-2 border-dashed border-muted-foreground/20" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-background px-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          </div>
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
        <div className="rounded-2xl border-2 bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/10 p-6">
          <SectionHeader
            icon={Globe2}
            title="Global Industry & Career Landscape"
            subtitle="Macro trends shaping jobs worldwide — data-led, not youth-specific"
            gradient="from-blue-500 via-cyan-500 to-blue-500"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
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

            {/* PDF Download CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href="/api/reports/fast-facts"
                download="sprout-fast-facts-innovation.pdf"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm text-primary"
              >
                <FileText className="h-4 w-4" />
                <span>Fast Facts (2-page overview)</span>
                <Download className="h-3.5 w-3.5 opacity-60" />
              </a>
              <a
                href="/api/reports/career-snapshot"
                download="world-of-work-career-industry-snapshot.pdf"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border bg-background hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
              >
                <FileText className="h-4 w-4" />
                <span>Full career & industry report</span>
                <Download className="h-3.5 w-3.5 opacity-60" />
              </a>
            </div>
          </motion.div>

          {/* 2. Jobs & Roles on the Rise */}
          <InsightSection sectionKey="jobs-on-the-rise" delay={0.25} />

          {/* 3. Skills That Matter */}
          <InsightSection sectionKey="skills-that-matter" delay={0.3} />

          {/* Skill Longevity Index */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mb-8"
          >
            <SkillLongevityIndex />
          </motion.div>

        </div>
      </motion.section>

      {/* Section Divider */}
      <SectionDivider />

      {/* ============================================ */}
      {/* SECTION 2: YOUTH LENS (15-21) */}
      {/* ============================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-4"
      >
        <div className="rounded-2xl border-2 bg-gradient-to-br from-background via-background to-amber-50/30 dark:to-amber-950/10 p-6">
          <SectionHeader
            icon={Sparkles}
            title="Youth Lens (15-21)"
            subtitle="What the global landscape means for you — warm, actionable, grounded"
            gradient="from-amber-400 via-orange-400 to-amber-400"
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
          />

          {/* 1. Why This Matters (for you) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mb-8"
          >
            <WhyThisMatters />
          </motion.div>

          {/* 2. Did You Know? (rotating facts) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="mb-8"
          >
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Did You Know?
              </h3>
              <p className="text-xs text-muted-foreground">
                Research-backed facts that might surprise you
              </p>
            </div>
            <DidYouKnowCard />
          </motion.div>

          {/* 3. Youth Career Events in Norway */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
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
