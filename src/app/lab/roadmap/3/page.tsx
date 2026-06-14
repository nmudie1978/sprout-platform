"use client";

/**
 * Variant 3 — Ascending Staircase.
 * Steps climb left-to-right as ascending stairs joined by stepped risers, to
 * convey upward progress. Each stair is a compact card. On mobile this becomes
 * an ascending vertical list with increasing indent. Tap a stair to expand its
 * detail. The "you are here" stair carries a calm emerald cue.
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
  type LucideIcon,
} from "lucide-react";
import {
  SAMPLE_ROADMAP,
  STAGE_META,
  type RoadmapStep,
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

export default function StaircaseVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [openId, setOpenId] = useState<string | null>(
    steps[currentStepIndex]?.id ?? null,
  );
  const total = steps.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmClimb { from { opacity: 0; transform: translateY(14px);} to {opacity:1; transform:none;} }
        .rm-climb { animation: rmClimb .5s ease both; }
        @media (prefers-reduced-motion: reduce) { .rm-climb { animation: none; } }
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
            One step up at a time — each stair climbs you closer to your first
            role. Tap a stair to see how to take it.
          </p>
        </header>

        {/* Desktop staircase / mobile ascending list */}
        <div className="mt-10">
          <ol className="flex flex-col gap-3 md:flex-row md:items-end md:gap-2">
            {steps.map((step, i) => {
              const meta = STAGE_META[step.stage];
              const Icon = ICONS[step.icon] ?? Target;
              const isCurrent = i === currentStepIndex;
              const isDone = i < currentStepIndex;
              const isOpen = openId === step.id;
              // Climb: lift each stair higher on desktop via bottom margin.
              const liftPx = i * 30;
              // Mobile: increasing left indent to suggest ascent.
              const indentPx = i * 12;
              return (
                <li
                  key={step.id}
                  className="rm-climb md:flex md:flex-1 md:flex-col md:justify-end"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    marginLeft: `var(--rm-indent, ${indentPx}px)`,
                  }}
                >
                  {/* riser baseline (desktop) */}
                  <div className="md:flex md:flex-col md:justify-end" style={{ minHeight: 1 }}>
                    <div
                      className="hidden md:block"
                      style={{ height: `${liftPx}px` }}
                      aria-hidden
                    >
                      {i > 0 && (
                        <span
                          className="mx-auto block h-full w-[3px] rounded-full opacity-50"
                          style={{ background: meta.accent }}
                        />
                      )}
                    </div>

                    <div
                      className="rounded-2xl border bg-slate-900/60 transition hover:border-slate-700"
                      style={{
                        borderColor: isCurrent ? meta.ring : "#1e293b",
                        boxShadow: isCurrent ? `0 0 0 1px ${meta.ring}` : undefined,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : step.id)}
                        className="w-full px-3.5 py-3 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{
                              background: isDone ? meta.accent : meta.soft,
                              color: isDone ? "#0b1220" : meta.accent,
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {i + 1}/{total}
                          </span>
                        </div>
                        <span
                          className="mt-2 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                          style={{ background: meta.soft, color: meta.accent }}
                        >
                          {meta.label}
                        </span>
                        <h3 className="mt-1.5 text-sm font-semibold leading-snug text-slate-100">
                          {step.title}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Age {step.startAge}
                          {step.endAge ? `–${step.endAge}` : "+"}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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
                          <ChevronDown
                            className={`ml-auto h-3.5 w-3.5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>

                      {isOpen && <StairDetail step={step} accent={meta.accent} />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function StairDetail({ step, accent }: { step: RoadmapStep; accent: string }) {
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
