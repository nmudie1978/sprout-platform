/**
 * JOBS & ECONOMY SPOTLIGHT
 *
 * Single panel combining:
 *   Left  — Featured WEF Report card (Future of Jobs 2025)
 *   Right — Featured CFYE Podcast card (Future Economies Start with Youth)
 *
 * Sources: WEF Future of Jobs Report 2025, OECD Employment Outlook, CFYE.
 */

"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Users,
  Zap,
  Headphones,
  TrendingUp,
} from "lucide-react";
import { CFYE_PODCAST, getRecentEpisodes } from "@/lib/industry-insights/podcast-data";

// ============================================
// DATA
// ============================================

const FEATURED_REPORT = {
  title: "Future of Jobs Report 2025",
  source: "World Economic Forum",
  url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
  description:
    "The definitive global analysis of how technology, green transition, and demographics are reshaping 14 million jobs across 22 industries by 2030.",
  keyFindings: [
    { icon: BarChart3, stat: "170M", label: "new roles created globally" },
    { icon: Users, stat: "92M", label: "roles displaced by automation" },
    { icon: Zap, stat: "59%", label: "of workers will need reskilling" },
  ],
} as const;

// ============================================
// ANIMATION
// ============================================

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ============================================
// COMPONENT
// ============================================

export function JobsEconomySpotlight() {
  const episodes = getRecentEpisodes(5);

  return (
    <div className="pt-2">
        {/* Divider */}
        <div className="border-t border-border/30 mb-5" />

        {/* Header */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            Future of Jobs &amp; Economies
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            How work is changing globally &mdash; key reports and voices shaping the future
          </p>
        </div>

        {/* Two cards side by side */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          {/* Featured Report */}
          <motion.div variants={cardVariants}>
            <a
              href={FEATURED_REPORT.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full rounded-lg border bg-gradient-to-br from-blue-50/50 via-background to-cyan-50/30 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/10 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-blue-500/70 mb-1">
                    Featured Report
                  </p>
                  <h4 className="text-sm font-semibold text-foreground leading-tight">
                    {FEATURED_REPORT.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {FEATURED_REPORT.source}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                {FEATURED_REPORT.description}
              </p>

              <div className="space-y-2.5">
                {FEATURED_REPORT.keyFindings.map((finding) => {
                  const Icon = finding.icon;
                  return (
                    <div key={finding.stat} className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 shrink-0">
                        <Icon className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-foreground">{finding.stat}</span>
                        <span className="text-[11px] text-muted-foreground">{finding.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/30">
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                  Read the full report
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </a>
          </motion.div>

          {/* Featured Podcast */}
          <motion.div variants={cardVariants}>
            <a
              href={CFYE_PODCAST.listenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full rounded-lg border bg-gradient-to-br from-emerald-50/50 via-background to-teal-50/30 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/10 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group"
            >
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

              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                {CFYE_PODCAST.description}
              </p>

              <div className="space-y-2">
                {episodes.map((ep) => (
                  <div key={ep.number} className="flex items-start gap-2 text-[11px]">
                    <span className="text-emerald-500 font-bold tabular-nums shrink-0 mt-px">
                      #{ep.number}
                    </span>
                    <div className="min-w-0">
                      <span className="font-medium text-foreground">{ep.title}</span>
                      <span className="text-muted-foreground ml-1.5">{ep.duration}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                  Browse all episodes
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </a>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <p className="mt-5 pt-3 border-t text-[10px] text-muted-foreground/60 text-center">
          Sources: WEF Future of Jobs 2025, OECD Employment Outlook, CFYE
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
  );
}
