"use client";

/**
 * Variant 5 — Stage Columns.
 * Four calm, editorial columns (Foundation → Education → Experience → Career),
 * each with a stage-coloured header and the steps for that stage stacked as
 * cards. A faint connector implies left-to-right progression. On mobile the
 * columns stack into labelled sections. Detail expands inline on each card.
 * (Editorial — not a productivity kanban: no todo/doing/done, no drag handles.)
 */

import { useState } from "react";
import Link from "next/link";
import {
  Monitor,
  Shield,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  ShieldCheck,
  Target,
  ArrowUpRight,
  MapPin,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  SAMPLE_ROADMAP,
  STAGE_META,
  STAGE_ORDER,
  type RoadmapStep,
  type RoadmapStage,
} from "../_data";

const ICONS: Record<string, LucideIcon> = {
  Monitor,
  Shield,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  ShieldCheck,
  Target,
};

export default function StageColumnsVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [openId, setOpenId] = useState<string | null>(
    steps[currentStepIndex]?.id ?? null,
  );

  // Group steps by stage, keeping original order; track absolute index for cues.
  const byStage: Record<RoadmapStage, { step: RoadmapStep; index: number }[]> = {
    foundation: [],
    education: [],
    experience: [],
    career: [],
  };
  steps.forEach((step, index) => byStage[step.stage].push({ step, index }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmRise { from { opacity: 0; transform: translateY(10px);} to {opacity:1; transform:none;} }
        .rm-rise { animation: rmRise .45s ease both; }
        @media (prefers-reduced-motion: reduce) { .rm-rise { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <header>
          <Link href="/lab/roadmap" className="text-xs text-slate-500 hover:text-slate-300">
            ← Roadmap Lab
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            Your roadmap to {career}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Four chapters from first curiosity to your first role. Tap any card
            to see how to take that step.
          </p>
        </header>

        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {STAGE_ORDER.map((stage, colIdx) => {
            const meta = STAGE_META[stage];
            const items = byStage[stage];
            return (
              <section key={stage} className="relative flex flex-col">
                {/* Faint left-to-right connector between columns (desktop) */}
                {colIdx < STAGE_ORDER.length - 1 && (
                  <ChevronRight
                    aria-hidden
                    className="absolute -right-4 top-5 hidden h-5 w-5 text-slate-700 lg:block"
                  />
                )}

                {/* Column header */}
                <div
                  className="rounded-2xl border px-4 py-3.5"
                  style={{
                    borderColor: meta.ring,
                    background: meta.soft,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: meta.accent }}
                    >
                      {String(colIdx + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-base font-bold" style={{ color: meta.accent }}>
                      {meta.label}
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{meta.blurb}</p>
                </div>

                {/* Cards */}
                <div className="mt-3 flex flex-col gap-3">
                  {items.map(({ step, index }, j) => {
                    const Icon = ICONS[step.icon] ?? Target;
                    const isCurrent = index === currentStepIndex;
                    const isDone = index < currentStepIndex;
                    const isOpen = openId === step.id;
                    return (
                      <div
                        key={step.id}
                        className="rm-rise rounded-2xl border bg-slate-900/60 transition hover:border-slate-700"
                        style={{
                          animationDelay: `${(colIdx * 2 + j) * 50}ms`,
                          borderColor: isCurrent ? meta.ring : "#1e293b",
                          boxShadow: isCurrent ? `0 0 0 1px ${meta.ring}` : undefined,
                          opacity: isDone ? 0.82 : 1,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : step.id)}
                          className="flex w-full items-start gap-3 px-3.5 py-3 text-left"
                        >
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              background: isDone ? meta.accent : meta.soft,
                              color: isDone ? "#0b1220" : meta.accent,
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold leading-snug text-slate-100">
                              {step.title}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              Age {step.startAge}
                              {step.endAge ? `–${step.endAge}` : "+"}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {step.isMilestone && (
                                <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                                  Milestone
                                </span>
                              )}
                              {isCurrent && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
                                  <MapPin className="h-2.5 w-2.5" /> You are here
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronDown
                            className={`mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        {isOpen && <CardDetail step={step} accent={meta.accent} />}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CardDetail({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <div className="border-t border-slate-800 px-3.5 py-3.5">
      <p className="text-sm text-slate-300">{step.description}</p>

      {step.microActions.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Small next steps
          </p>
          <ul className="mt-1.5 space-y-1">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.howTo.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            How to
          </p>
          <ol className="mt-1.5 space-y-1.5">
            {step.howTo.map((h, i) => (
              <li key={i} className="text-xs">
                <span className="text-slate-200">
                  <span className="mr-1 text-slate-500">{i + 1}.</span>
                  {h.step}
                </span>
                {h.detail && <p className="ml-4 text-[11px] text-slate-500">{h.detail}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {step.resources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {step.resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
            >
              {r.label}
              <ArrowUpRight className="h-3 w-3 opacity-60" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
