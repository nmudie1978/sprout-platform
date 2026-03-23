/**
 * INSIGHT SECTION
 *
 * A complete section component for Industry Insights.
 * Wraps InsightCarousel with section header and styling.
 */

"use client";

import { motion } from "framer-motion";
import {
  Globe,
  TrendingUp,
  Zap,
  Lightbulb,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { InsightCarousel } from "./insight-carousel";
import { SectionContainer } from "@/components/ui/section-container";
import { cn } from "@/lib/utils";
import type { InsightSectionKey } from "@/lib/industry-insights/insights-service";

// ============================================
// TYPES
// ============================================

interface InsightSectionProps {
  sectionKey: InsightSectionKey;
  delay?: number;
  compact?: boolean;
  /** Wrap content in a premium SectionContainer for visual separation */
  contained?: boolean;
  /** Default view mode for the carousel (grid or list) */
  defaultViewMode?: "grid" | "list";
}

// ============================================
// SECTION CONFIG
// ============================================

interface SectionConfig {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
}

const SECTION_CONFIG: Record<InsightSectionKey, SectionConfig> = {
  "big-picture": {
    title: "The Big Picture",
    subtitle: "Major shifts shaping the future of work",
    icon: Globe,
    gradient: "from-blue-500/20 to-teal-500/20",
  },
  "jobs-on-the-rise": {
    title: "Jobs & Roles on the Rise",
    subtitle: "Careers growing in demand",
    icon: TrendingUp,
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  "skills-that-matter": {
    title: "Skills That Matter",
    subtitle: "Capabilities employers value most",
    icon: Zap,
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  "industry-spotlights": {
    title: "Industry Spotlights",
    subtitle: "Deep dives into specific sectors",
    icon: Lightbulb,
    gradient: "from-teal-500/20 to-teal-500/20",
  },
  "reality-checks": {
    title: "Reality Checks",
    subtitle: "Honest takes on career expectations",
    icon: CheckCircle,
    gradient: "from-rose-500/20 to-pink-500/20",
  },
};

// ============================================
// COMPONENT
// ============================================

export function InsightSection({ sectionKey, delay = 0, compact, contained, defaultViewMode }: InsightSectionProps) {
  const config = SECTION_CONFIG[sectionKey];
  const Icon = config.icon;

  const content = (
    <>
      {/* Background gradient */}
      <div
        className={`absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${config.gradient} opacity-30 blur-3xl`}
      />

      {/* Section header */}
      <div className={cn("mb-4", contained && "mb-5")}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-muted/50">
            <Icon className={cn("h-4 w-4 text-foreground", contained && "opacity-70")} />
          </div>
          <h2 className={cn("font-semibold", contained ? "text-lg" : "text-base")}>{config.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
      </div>

      {/* Carousel */}
      <InsightCarousel sectionKey={sectionKey} compact={compact} defaultViewMode={defaultViewMode} />
    </>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("relative", !compact && "mb-10")}
    >
      {contained ? (
        <SectionContainer className="relative h-full">{content}</SectionContainer>
      ) : (
        content
      )}
    </motion.section>
  );
}
