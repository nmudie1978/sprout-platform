"use client";

/**
 * AI & The Future of Work — an engaging /insights section.
 *
 * Anatomy (top → bottom):
 *   • header (Future Lens)
 *   • three pillar cards → each opens a depth modal
 *   • "How people use AI today" — concrete everyday uses
 *   • "Today's leading AI models" — provider chips → models modal
 *   • "AI certification tracks" — recognised credentials (external links)
 *   • "Watch: careers in AI" — real YouTube videos → in-page player
 *   • CTA → a popup modal timeline of the evolution of AI
 *
 * All copy lives in src/lib/insights/ai-future-of-work.ts. Roles deep-link to
 * real catalogue careers via /careers?open=<id>. Framing is enablement, not
 * replacement.
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Cpu,
  Wand2,
  Briefcase,
  Heart,
  Database,
  FileText,
  Code2,
  Workflow,
  Microscope,
  Sparkles,
  Bot,
  Award,
  PlayCircle,
  History,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
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
  type AiVideo,
} from "@/lib/insights/ai-future-of-work";

const ICONS: Record<AiIconKey, LucideIcon> = {
  changesWork: Wand2,
  createsRoles: Briefcase,
  humanSkills: Heart,
  rag: Database,
  generate: FileText,
  build: Code2,
  automate: Workflow,
  research: Microscope,
  assist: Sparkles,
  model: Bot,
  certificate: Award,
  video: PlayCircle,
  timeline: History,
};

export function AiFutureOfWorkSection() {
  const { header, cards, models, certifications, videos, modals, timeline } =
    aiFutureOfWork;
  const [openModal, setOpenModal] = useState<AiModalId | null>(null);
  const [openVideo, setOpenVideo] = useState<AiVideo | null>(null);
  const [credTab, setCredTab] = useState<"models" | "certs">("models");

  return (
    <section id="ai-future-of-work" className="mb-3 scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="rounded-card border-2 border-violet-500/20 bg-card p-3 dark:border-violet-500/30 sm:p-4"
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="mb-3 h-1 rounded-pill bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 sm:mb-5" />
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

        {/* Three pillar cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cards.map((card) => {
            const Icon = ICONS[card.icon];
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setOpenModal(card.modal)}
                className="group flex flex-col rounded-card border border-border/40 bg-card/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-violet-500/[0.03] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
              >
                <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-card bg-violet-500/10 text-violet-500 transition-colors group-hover:bg-violet-500/20">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground/90">{card.title}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 self-start text-xs font-medium text-violet-500">
                  {card.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>

        {/* AI models & certifications — one slick tabbed, tabulated block
            (replaces the old chips + card grid to cut visual noise). */}
        <div className="mt-5">
          <SubHeading
            title="AI models & certifications"
            subtitle="The leading model families — and recognised ways to prove your skills."
          />

          {/* Tab switcher */}
          <div
            role="tablist"
            aria-label="AI models and certifications"
            className="mb-3 inline-flex rounded-pill border border-border/40 bg-card/40 p-0.5 text-xs font-medium"
          >
            <button
              type="button"
              role="tab"
              aria-selected={credTab === "models"}
              onClick={() => setCredTab("models")}
              className={
                "rounded-pill px-3 py-1 transition-colors " +
                (credTab === "models"
                  ? "bg-violet-500/15 text-violet-600 dark:text-violet-300"
                  : "text-muted-foreground hover:text-foreground/80")
              }
            >
              Models
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={credTab === "certs"}
              onClick={() => setCredTab("certs")}
              className={
                "rounded-pill px-3 py-1 transition-colors " +
                (credTab === "certs"
                  ? "bg-violet-500/15 text-violet-600 dark:text-violet-300"
                  : "text-muted-foreground hover:text-foreground/80")
              }
            >
              Certifications
            </button>
          </div>

          {credTab === "models" ? (
            <>
              <div className="overflow-x-auto rounded-card border border-border/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-card/50 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Model</th>
                      <th className="px-3 py-2 font-semibold">Maker</th>
                      <th className="px-3 py-2 font-semibold">Origin</th>
                      <th className="px-3 py-2 text-right font-semibold">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.items.map((m) => (
                      <tr key={m.name} title={m.note} className="border-t border-border/30">
                        <td className="whitespace-nowrap px-3 py-2 font-semibold text-foreground/90">
                          {m.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                          {m.provider}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                          {m.origin}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className={
                              "rounded-pill px-1.5 py-0.5 text-[10px] font-medium " +
                              (m.access === "open"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                                : "bg-violet-500/15 text-violet-600 dark:text-violet-300")
                            }
                          >
                            {m.access === "open" ? "Open" : "Closed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() => setOpenModal("models")}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-violet-500 transition-colors hover:text-violet-400"
              >
                What sets each model apart
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </>
          ) : (
            <div className="overflow-x-auto rounded-card border border-border/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-card/50 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Certification</th>
                    <th className="px-3 py-2 font-semibold">Provider</th>
                    <th className="px-3 py-2 font-semibold">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.items.map((cert) => (
                    <tr
                      key={cert.name}
                      className="border-t border-border/30 transition-colors hover:bg-violet-500/[0.04]"
                    >
                      <td className="px-3 py-2">
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1 font-semibold text-foreground/90 transition-colors hover:text-violet-500"
                        >
                          {cert.name}
                          <ExternalLink
                            className="h-3 w-3 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-violet-500"
                            aria-hidden="true"
                          />
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {cert.provider}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {cert.level}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Watch: careers in AI */}
        <div className="mt-5">
          <SubHeading title={videos.heading} subtitle={videos.subheading} />
          {/* Tiles capped to 50% width (centered) so each video renders ~50% smaller. */}
          <div className="mx-auto grid max-w-[50%] grid-cols-1 gap-3 sm:grid-cols-2">
            {videos.items.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setOpenVideo(v)}
                className="group overflow-hidden rounded-card border border-border/40 bg-card/40 text-left transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                    alt={v.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
                    <PlayCircle className="h-9 w-9 text-white drop-shadow" />
                  </span>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-xs font-semibold text-foreground/90">{v.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{v.channel}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA → evolution-of-AI timeline modal */}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setOpenModal("timeline")}
            className="group inline-flex items-center gap-2 rounded-pill border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-500 transition-colors hover:bg-violet-500/20"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            Explore the evolution of AI
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </motion.div>

      {/* ── Content modals ───────────────────────────────────── */}
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
                      {cluster.roles.map((role) =>
                        role.careerId ? (
                          <Link
                            key={role.label}
                            href={`/careers?open=${role.careerId}`}
                            onClick={() => setOpenModal(null)}
                            className="group inline-flex items-center gap-1 rounded-pill border border-violet-500/30 bg-violet-500/[0.06] px-2.5 py-1 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-500/15 dark:text-violet-300"
                          >
                            {role.label}
                            <ArrowUpRight className="h-3 w-3 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        ) : (
                          <span
                            key={role.label}
                            className="rounded-pill border border-border/40 bg-card/40 px-2.5 py-1 text-xs text-foreground/80"
                          >
                            {role.label}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground/70">
                  Tap a highlighted role to open it in Explore Careers.
                </p>
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

          {openModal === "models" && (
            <>
              <DialogHeader>
                <DialogTitle>{models.heading}</DialogTitle>
                <DialogDescription>{models.subheading}</DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-2">
                {models.items.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-start gap-3 rounded-card border border-border/40 bg-card/40 p-3"
                  >
                    <Bot className="mt-0.5 h-4 w-4 shrink-0 text-violet-500/80" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                        <span className="font-semibold text-foreground/90">{m.name}</span>
                        <span className="text-muted-foreground">· {m.provider}</span>
                        <span className="rounded-pill bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {m.origin}
                        </span>
                        <span
                          className={
                            "rounded-pill px-1.5 py-0.5 text-[10px] font-medium " +
                            (m.access === "open"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                              : "bg-violet-500/15 text-violet-600 dark:text-violet-300")
                          }
                        >
                          {m.access === "open" ? "Open weights" : "Closed / hosted"}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{m.note}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[11px] italic text-muted-foreground/60">{models.note}</p>
              </div>
            </>
          )}

          {openModal === "timeline" && (
            <>
              <DialogHeader>
                <DialogTitle>The evolution of AI</DialogTitle>
                <DialogDescription>
                  From a question in 1950 to the AI agents reshaping work today.
                </DialogDescription>
              </DialogHeader>
              <ol className="mt-3 space-y-0">
                {timeline.map((item, i) => (
                  <li key={item.era} className="relative flex gap-3 pb-4 last:pb-0">
                    {/* spine */}
                    {i < timeline.length - 1 && (
                      <span
                        className="absolute left-[5px] top-4 h-full w-px bg-violet-500/20"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative mt-1 h-2.5 w-2.5 shrink-0 rounded-pill bg-violet-500" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground/90">
                        <span className="text-violet-500">{item.era}</span> · {item.label}
                      </p>
                      {item.detail && (
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Video player modal ───────────────────────────────── */}
      <Dialog open={openVideo !== null} onOpenChange={(o) => !o && setOpenVideo(null)}>
        <DialogContent className="sm:max-w-2xl">
          {openVideo && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6 text-base">{openVideo.title}</DialogTitle>
                <DialogDescription>
                  {openVideo.channel} · {openVideo.blurb}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-1 aspect-video w-full overflow-hidden rounded-card bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${openVideo.id}`}
                  title={openVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${openVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 self-start text-xs font-medium text-violet-500 hover:text-violet-400"
              >
                Watch on YouTube
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function SubHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-sm font-bold text-foreground/90">{title}</h3>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
