"use client";

/**
 * Variant 13 — Focus Mode.
 * One step at a time. A large hero card shows the active step in full. Prev/Next
 * buttons plus a slim age scrubber of step dots let you move through the roadmap.
 * Position is conveyed calmly ("Step 4 of 8") without any gamification. Starts at
 * the learner's current step. Buttons are keyboard-friendly.
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
  ArrowLeft,
  ArrowRight,
  MapPin,
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

export default function FocusModeVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [index, setIndex] = useState(currentStepIndex);

  const step = steps[index];
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? Target;
  const isCurrent = index === currentStepIndex;
  const total = steps.length;

  const go = (next: number) => setIndex(Math.max(0, Math.min(total - 1, next)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmSwap { from { opacity: 0; transform: translateY(10px);} to {opacity:1; transform:none;} }
        .rm-swap { animation: rmSwap .4s ease both; }
        @media (prefers-reduced-motion: reduce) { .rm-swap { animation: none; } }
      `}</style>

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-12">
        <LabHeader career={career} />

        {/* Age scrubber */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Step {index + 1} of {total}
            </span>
            <span>
              Age {step.startAge}
              {step.endAge ? `–${step.endAge}` : "+"}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {steps.map((s, i) => {
              const m = STAGE_META[s.stage];
              const isActive = i === index;
              const isHere = i === currentStepIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to step ${i + 1}: ${s.title}`}
                  aria-current={isActive ? "step" : undefined}
                  className="group relative flex-1 py-2"
                >
                  <span
                    className="block h-1.5 w-full rounded-full transition"
                    style={{
                      background: isActive ? m.accent : i < currentStepIndex ? `${m.accent}99` : "#334155",
                      boxShadow: isActive ? `0 0 0 2px ${m.ring}` : undefined,
                    }}
                  />
                  {isHere && !isActive && (
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-300"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero card */}
        <div
          key={step.id}
          className="rm-swap mt-6 flex-1 rounded-3xl border bg-slate-900/50 p-7 sm:p-9"
          style={isCurrent ? { borderColor: meta.ring } : { borderColor: "rgb(30 41 59)" }}
        >
          <div className="flex items-start gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2"
              style={{ borderColor: meta.accent, background: meta.soft }}
            >
              <Icon className="h-6 w-6" style={{ color: meta.accent }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ background: meta.soft, color: meta.accent }}
                >
                  {meta.label}
                </span>
                {step.isMilestone && <MilestoneTag />}
                {isCurrent && <YouAreHereTag />}
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-100">{step.title}</h2>
              {step.subtitle && <p className="text-sm text-slate-500">{step.subtitle}</p>}
            </div>
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-slate-300">{step.description}</p>

          {step.microActions.length > 0 && (
            <Section label="Small next steps">
              <ul className="space-y-2">
                {step.microActions.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.accent }} />
                    {a}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {step.howTo.length > 0 && (
            <Section label="How to">
              <ol className="space-y-3">
                {step.howTo.map((h, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-slate-200">
                      <span className="mr-1.5 text-slate-500">{i + 1}.</span>
                      {h.step}
                    </span>
                    {h.detail && <p className="ml-5 mt-0.5 text-xs text-slate-500">{h.detail}</p>}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {step.resources.length > 0 && (
            <Section label="Resources">
              <div className="flex flex-wrap gap-2">
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
            </Section>
          )}
        </div>

        {/* Prev / Next */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-xs text-slate-500">
            {steps[index].stage === steps[Math.min(index + 1, total - 1)].stage || index === total - 1
              ? STAGE_META[step.stage].blurb
              : "Next stage ahead"}
          </span>

          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === total - 1}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: meta.ring, color: meta.accent, background: meta.soft }}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function MilestoneTag() {
  return (
    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
      Milestone
    </span>
  );
}

function YouAreHereTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
      <MapPin className="h-3 w-3" /> You are here
    </span>
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
        One step at a time, so you can focus. Move through with the arrows or the
        scrubber above.
      </p>
    </header>
  );
}
