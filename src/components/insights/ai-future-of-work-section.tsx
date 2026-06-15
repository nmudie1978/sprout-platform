"use client";

/**
 * AI & The Future of Work — a compact /insights section.
 *
 * Matches the page's section anatomy (bordered bg-card panel + centred header)
 * but is self-contained. Three aggregated cards, an "impact at a glance" chip
 * row, and a thin mini-timeline; each card's CTA opens a modal for depth.
 *
 * All copy lives in src/lib/insights/ai-future-of-work.ts — this file is
 * presentational and maps icon keys to lucide components. Framing is
 * enablement, not replacement.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Wand2,
  Briefcase,
  Heart,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  aiFutureOfWork,
  type AiIconKey,
  type AiModalId,
} from "@/lib/insights/ai-future-of-work";

const ICONS: Record<AiIconKey, LucideIcon> = {
  changesWork: Wand2,
  createsRoles: Briefcase,
  humanSkills: Heart,
  enhanced: TrendingUp,
  changed: RefreshCw,
  created: Sparkles,
  humanWork: ShieldCheck,
};

export function AiFutureOfWorkSection() {
  const { header, cards, impactChips, modals, timeline } = aiFutureOfWork;
  const [openModal, setOpenModal] = useState<AiModalId | null>(null);

  return (
    <section id="ai-future-of-work" className="mb-3 scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="rounded-card border-2 border-violet-500/20 bg-card p-3 dark:border-violet-500/30 sm:p-4"
      >
        {/* Header — matches the page's SectionHeader style (violet accent) */}
        <div className="mb-4 sm:mb-6">
          <div className="mb-3 h-1 rounded-pill bg-violet-500 sm:mb-5" />
          <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
            <div className="rounded-card bg-violet-500/10 p-2.5 ring-2 ring-violet-500/20 ring-offset-2 ring-offset-background dark:bg-violet-500/20 sm:p-3">
              <Cpu className="h-6 w-6 text-violet-500 sm:h-7 sm:w-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-violet-500/80">
                {header.badge}
              </span>
              <h2 className="mt-0.5 text-lg font-bold text-foreground sm:text-2xl">
                {header.title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{header.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Three aggregated cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cards.map((card) => {
            const Icon = ICONS[card.icon];
            return (
              <div
                key={card.id}
                className="flex flex-col rounded-card border border-border/40 bg-card/40 p-4"
              >
                <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-card bg-violet-500/10 text-violet-500">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground/90">{card.title}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
                <button
                  type="button"
                  onClick={() => setOpenModal(card.modal)}
                  className="group mt-3 inline-flex items-center gap-1 self-start text-xs font-medium text-violet-500 transition-colors hover:text-violet-400"
                >
                  {card.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Impact at a glance — subtle icon chips */}
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/55">
            AI impact at a glance
          </p>
          <div className="flex flex-wrap gap-2">
            {impactChips.map((chip) => {
              const Icon = ICONS[chip.icon];
              return (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-border/40 bg-card/40 px-3 py-1.5 text-[11px] font-medium text-foreground/75"
                >
                  <Icon className="h-3.5 w-3.5 text-violet-500/80" aria-hidden="true" />
                  {chip.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Mini timeline — thin, understated */}
        <div className="mt-4 overflow-x-auto">
          <ol className="flex min-w-max items-center gap-2 text-[11px]">
            {timeline.map((item, i) => (
              <li key={item.era} className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-pill bg-muted/30 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-violet-500/70" aria-hidden="true" />
                  <span className="font-semibold text-foreground/80">{item.era}</span>
                  <span className="text-muted-foreground/75">{item.label}</span>
                </span>
                {i < timeline.length - 1 && (
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </motion.div>

      {/* ── Modals ───────────────────────────────────────────── */}
      <Dialog open={openModal !== null} onOpenChange={(o) => !o && setOpenModal(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {openModal === "examples" && (
            <>
              <DialogHeader>
                <DialogTitle>{modals.examples.title}</DialogTitle>
                <DialogDescription>{modals.examples.subtitle}</DialogDescription>
              </DialogHeader>
              <ul className="mt-2 space-y-2.5">
                {modals.examples.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500/80" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {openModal === "roles" && (
            <>
              <DialogHeader>
                <DialogTitle>{modals.roles.title}</DialogTitle>
                <DialogDescription>{modals.roles.subtitle}</DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-4">
                {modals.roles.clusters.map((cluster) => (
                  <div key={cluster.label}>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-500/80">
                      {cluster.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cluster.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-pill border border-border/40 bg-card/40 px-2.5 py-1 text-xs text-foreground/80"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {openModal === "skills" && (
            <>
              <DialogHeader>
                <DialogTitle>{modals.skills.title}</DialogTitle>
                <DialogDescription>{modals.skills.subtitle}</DialogDescription>
              </DialogHeader>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {modals.skills.items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-card border border-border/40 bg-card/40 px-3 py-2 text-sm font-medium text-foreground/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
