"use client";

/**
 * Variant 15 — Progress Tracker.
 * Compact and scannable. A calm circular progress ring at the top shows
 * position ("N of 8 steps") derived from currentStepIndex — quiet, never
 * gamified. Below, steps are grouped by stage (STAGE_ORDER) as tidy rows with a
 * state indicator (done = filled check, current = ring, upcoming = hollow).
 * Tapping a row expands its detail. Dense, efficient, elegant.
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
  Check,
  ChevronDown,
  ArrowUpRight,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import {
  SAMPLE_ROADMAP,
  STAGE_META,
  STAGE_ORDER,
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

type StepState = "done" | "current" | "upcoming";

export default function ProgressTrackerVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [open, setOpen] = useState<string | null>(steps[currentStepIndex]?.id ?? null);

  const total = steps.length;
  const position = currentStepIndex + 1; // "you are here" counts as the current step
  const fraction = position / total;

  const stateOf = (i: number): StepState =>
    i < currentStepIndex ? "done" : i === currentStepIndex ? "current" : "upcoming";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmRing { from { stroke-dashoffset: var(--rm-circ); } to { stroke-dashoffset: var(--rm-target); } }
        .rm-ring { animation: rmRing 1.1s ease both; }
        @media (prefers-reduced-motion: reduce) { .rm-ring { animation: none; stroke-dashoffset: var(--rm-target); } }
      `}</style>

      <div className="mx-auto max-w-xl px-5 py-12">
        <LabHeader career={career} />

        {/* progress ring */}
        <div className="mt-8 flex items-center gap-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <ProgressRing fraction={fraction} />
          <div>
            <p className="text-sm font-semibold text-slate-100">
              Step {position} of {total}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              You&apos;re on{" "}
              <span className="text-slate-200">{steps[currentStepIndex]?.title}</span>.
              Take it at your own pace.
            </p>
          </div>
        </div>

        {/* grouped rows */}
        <div className="mt-8 space-y-7">
          {STAGE_ORDER.map((stage) => {
            const meta = STAGE_META[stage];
            const groupSteps = steps
              .map((s, i) => ({ s, i }))
              .filter(({ s }) => s.stage === stage);
            if (groupSteps.length === 0) return null;

            return (
              <section key={stage}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: meta.accent }}
                  />
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {meta.label}
                  </h2>
                  <span className="text-[11px] text-slate-600">· {meta.blurb}</span>
                </div>

                <ul className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800">
                  {groupSteps.map(({ s: step, i }) => {
                    const state = stateOf(i);
                    const isOpen = open === step.id;
                    const Icon = ICONS[step.icon] ?? Target;
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : step.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-800/40"
                          aria-expanded={isOpen}
                        >
                          <StateDot state={state} accent={meta.accent} ring={meta.ring} />
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: meta.soft }}
                          >
                            <Icon className="h-3.5 w-3.5" style={{ color: meta.accent }} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span
                                className={`truncate text-sm font-medium ${
                                  state === "done" ? "text-slate-400" : "text-slate-100"
                                }`}
                              >
                                {step.title}
                              </span>
                              {step.isMilestone && (
                                <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                                  Milestone
                                </span>
                              )}
                            </span>
                            <span className="block truncate text-[11px] text-slate-500">
                              {step.subtitle} · Age {step.startAge}
                              {step.endAge ? `–${step.endAge}` : "+"}
                            </span>
                          </span>
                          {state === "current" && (
                            <span className="hidden shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 sm:inline-flex">
                              <MapPin className="h-3 w-3" /> here
                            </span>
                          )}
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && <StepDetail step={step} accent={meta.accent} />}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ fraction }: { fraction: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const target = circ * (1 - fraction);
  const pct = Math.round(fraction * 100);
  return (
    <div className="relative shrink-0" style={{ height: size, width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
        />
        <circle
          className="rm-ring"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={STAGE_META.career.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          style={
            {
              "--rm-circ": `${circ}`,
              "--rm-target": `${target}`,
            } as React.CSSProperties
          }
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-200">
        {pct}%
      </span>
    </div>
  );
}

function StateDot({
  state,
  accent,
  ring,
}: {
  state: StepState;
  accent: string;
  ring: string;
}) {
  if (state === "done") {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ background: accent }}
      >
        <Check className="h-3 w-3 text-slate-950" strokeWidth={3} />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
        style={{ borderColor: accent, boxShadow: `0 0 0 3px ${ring}` }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
      </span>
    );
  }
  return (
    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-700" />
  );
}

function StepDetail({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <div className="border-t border-slate-800 bg-slate-950/40 px-4 py-4">
      <p className="text-sm text-slate-300">{step.description}</p>

      {step.microActions.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Small next steps
          </p>
          <ul className="mt-2 space-y-1.5">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-slate-300">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: accent }}
                />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.howTo.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            How to
          </p>
          <ol className="mt-2 space-y-2">
            {step.howTo.map((h, i) => (
              <li key={i} className="text-sm">
                <span className="text-slate-200">
                  <span className="mr-1.5 text-slate-500">{i + 1}.</span>
                  {h.step}
                </span>
                {h.detail && <p className="ml-5 text-xs text-slate-500">{h.detail}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {step.resources.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {step.resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
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

function LabHeader({ career }: { career: string }) {
  return (
    <header>
      <Link href="/lab/roadmap" className="text-xs text-slate-500 hover:text-slate-300">
        ← Roadmap Lab
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Your roadmap to {career}</h1>
      <p className="mt-1 text-sm text-slate-400">
        A clear, scannable view of where you are and what comes next — tap any
        row to open it.
      </p>
    </header>
  );
}
