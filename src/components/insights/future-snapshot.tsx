/**
 * FUTURE SNAPSHOT: WORK IN 2030
 *
 * Two-column layout:
 *   Left  — 5 icon-led trend items
 *   Right — Featured deep-dive article card (WEF source)
 *
 * Data grounded in WEF Future of Jobs Report & OECD Employment Outlook.
 */

"use client";

import { motion } from "framer-motion";
import { Cpu, RefreshCw, Layers, Globe, BookOpen, ArrowUpRight, BarChart3, Users, Zap } from "lucide-react";

// ============================================
// DATA
// ============================================

const SNAPSHOT_ITEMS = [
  {
    icon: Cpu,
    bold: "40% of tasks automated",
    detail: "Routine work reduced; human judgment increases",
  },
  {
    icon: RefreshCw,
    bold: "3\u20135 career pivots",
    detail: "Most people change roles or fields multiple times",
  },
  {
    icon: Layers,
    bold: "Skills > job titles",
    detail: "Hiring shifts toward capability, not labels",
  },
  {
    icon: Globe,
    bold: "Hybrid by default",
    detail: "Location flexibility becomes standard, not a perk",
  },
  {
    icon: BookOpen,
    bold: "Learning never \u2018finishes\u2019",
    detail: "Skills refresh every 3\u20135 years",
  },
] as const;

const FEATURED_ARTICLE = {
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

export function FutureSnapshot() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Accent bar — blue/cyan for future theme */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />

      <div className="p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground mb-1">
          Future Snapshot: Work in 2030
        </h3>
        <p className="text-xs text-muted-foreground">
          A realistic picture of how jobs are changing &mdash; not disappearing
        </p>
      </div>

      {/* Two-column: Items + Article */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Trend items */}
        <motion.div
          className="space-y-3.5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {SNAPSHOT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.bold}
                variants={itemVariants}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                  <Icon className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-snug">
                    {item.bold}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Right: Featured article card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href={FEATURED_ARTICLE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border bg-gradient-to-br from-blue-50/50 via-background to-cyan-50/30 dark:from-blue-950/20 dark:via-background dark:to-cyan-950/10 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            {/* Article header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-blue-500/70 mb-1">
                  Featured Report
                </p>
                <h4 className="text-sm font-semibold text-foreground leading-tight">
                  {FEATURED_ARTICLE.title}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {FEATURED_ARTICLE.source}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" />
            </div>

            {/* Description */}
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
              {FEATURED_ARTICLE.description}
            </p>

            {/* Key findings */}
            <div className="space-y-2.5">
              {FEATURED_ARTICLE.keyFindings.map((finding) => {
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

            {/* Read link */}
            <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/30">
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                Read the full report
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </a>
        </motion.div>
      </div>

      {/* Footer */}
      <p className="mt-5 pt-3 border-t border-white/5 text-[10px] text-muted-foreground/60 text-center">
        Most jobs won&apos;t disappear &mdash; they&apos;ll evolve.
        <span className="mx-1.5">&bull;</span>
        Sources: WEF Future of Jobs 2025, OECD Employment Outlook
      </p>
      </div>
    </div>
  );
}
