/**
 * PODCAST SPOTLIGHT: CFYE "Future Economies Start with Youth"
 *
 * Two-column layout (following FutureSnapshot pattern):
 *   Left  — Programme impact summary (100K+ jobs, 14 countries, key themes)
 *   Right — Featured podcast card with curated episode highlights
 *
 * All external links open in new tabs. No embedded audio (privacy-first).
 */

"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Globe,
  Users,
  GraduationCap,
  Leaf,
  Monitor,
  Heart,
  Lightbulb,
  ArrowUpRight,
  Headphones,
  Mic,
} from "lucide-react";
import { CFYE_PODCAST, getRecentEpisodes } from "@/lib/industry-insights/podcast-data";

// ============================================
// DATA
// ============================================

const IMPACT_ITEMS = [
  {
    icon: Briefcase,
    bold: "100,000+ jobs created",
    detail: "Matched and improved across 11 countries in Africa & MENA",
  },
  {
    icon: Globe,
    bold: "14 countries, 72 initiatives",
    detail: "$171M fund by the Netherlands Ministry of Foreign Affairs",
  },
  {
    icon: Users,
    bold: "49% of jobs went to young women",
    detail: "Near gender parity — a deliberate programme design choice",
  },
  {
    icon: GraduationCap,
    bold: "51,593 young people trained",
    detail: "Completing employment-focused training across the programme",
  },
] as const;

const THEME_ITEMS = [
  { icon: Leaf, label: "Green jobs" },
  { icon: Monitor, label: "Digital skills" },
  { icon: Heart, label: "Gender equity" },
  { icon: Lightbulb, label: "Social enterprise" },
] as const;

// ============================================
// ANIMATION
// ============================================

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ============================================
// COMPONENT
// ============================================

export function PodcastSpotlight() {
  const episodes = getRecentEpisodes(5);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Accent bar — emerald/teal for green jobs theme */}
      <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mic className="h-3.5 w-3.5 text-emerald-500" />
            Spotlight: Youth Employment Worldwide
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            How 100K+ young people across Africa &amp; MENA are building careers &mdash; and what you can learn from it
          </p>
        </div>

        {/* Two-column: Impact + Podcast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Impact summary */}
          <motion.div
            className="flex flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {IMPACT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.bold}
                  variants={itemVariants}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Icon className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      {item.bold}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Thematic areas */}
            <motion.div variants={itemVariants} className="mt-auto pt-3 border-t border-border/40">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-2">
                Key themes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {THEME_ITEMS.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <span
                      key={theme.label}
                      className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md"
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {theme.label}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Podcast card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href={CFYE_PODCAST.listenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full rounded-lg border bg-gradient-to-br from-emerald-50/50 via-background to-teal-50/30 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/10 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group"
            >
              {/* Podcast header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500/70 mb-1 flex items-center gap-1">
                    <Headphones className="h-2.5 w-2.5" />
                    Featured Podcast
                  </p>
                  <h4 className="text-sm font-semibold text-foreground leading-tight">
                    {CFYE_PODCAST.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hosted by {CFYE_PODCAST.host} &bull; {CFYE_PODCAST.organisationFull}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors shrink-0 mt-0.5" />
              </div>

              {/* Description */}
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                {CFYE_PODCAST.description}
              </p>

              {/* Episode highlights */}
              <div className="space-y-1.5">
                {episodes.map((ep) => (
                  <div
                    key={ep.number}
                    className="flex items-baseline gap-2 text-[11px]"
                  >
                    <span className="text-emerald-500 font-bold tabular-nums shrink-0 w-7 text-right">
                      #{ep.number}
                    </span>
                    <span className="font-medium text-foreground truncate">{ep.title}</span>
                    <span className="text-muted-foreground shrink-0 ml-auto">{ep.duration}</span>
                  </div>
                ))}
              </div>

              {/* Listen link */}
              <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                  Browse all episodes
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Footer */}
        <p className="mt-5 pt-3 border-t text-[10px] text-muted-foreground/60 text-center">
          Challenge Fund for Youth Employment &mdash; Netherlands Ministry of Foreign Affairs
          <span className="mx-1.5">&bull;</span>
          <a
            href={CFYE_PODCAST.programmeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-500 transition-colors"
          >
            fundforyouthemployment.nl
          </a>
        </p>
      </div>
    </div>
  );
}
