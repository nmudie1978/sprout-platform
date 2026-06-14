"use client";

/**
 * Variant 1 — Vertical Rail.
 * Refined classic spine: a calm vertical line with alternating nodes, milestone
 * emphasis, a quiet "you are here" ring, and tap-to-expand detail. This is the
 * reference variant — other variants share its data contract and brand rules.
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
  ChevronDown,
  ArrowUpRight,
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

export default function VerticalRailVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [open, setOpen] = useState<string | null>(steps[currentStepIndex]?.id ?? null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmRise { from { opacity: 0; transform: translateY(10px);} to {opacity:1; transform:none;} }
        .rm-rise { animation: rmRise .5s ease both; }
        @media (prefers-reduced-motion: reduce) { .rm-rise { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-2xl px-5 py-12">
        <LabHeader career={career} />

        <ol className="relative mt-10">
          {/* the rail */}
          <span
            aria-hidden
            className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-slate-700 via-slate-700 to-transparent"
          />
          {steps.map((step, i) => {
            const meta = STAGE_META[step.stage];
            const Icon = ICONS[step.icon] ?? Target;
            const isOpen = open === step.id;
            const isCurrent = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <li key={step.id} className="rm-rise relative pl-14 pb-6" style={{ animationDelay: `${i * 60}ms` }}>
                {/* node */}
                <span
                  className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 transition"
                  style={{
                    borderColor: meta.accent,
                    background: isDone ? meta.accent : meta.soft,
                    boxShadow: isCurrent ? `0 0 0 4px ${meta.ring}` : undefined,
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: isDone ? "#0b1220" : meta.accent }} />
                </span>

                <div
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-slate-700"
                  style={isCurrent ? { borderColor: meta.ring } : undefined}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : step.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: meta.soft, color: meta.accent }}
                        >
                          {meta.label}
                        </span>
                        {step.isMilestone && (
                          <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                            Milestone
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                            <MapPin className="h-3 w-3" /> You are here
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 font-semibold text-slate-100">{step.title}</h3>
                      <p className="text-xs text-slate-400">
                        {step.subtitle} · Age {step.startAge}
                        {step.endAge ? `–${step.endAge}` : "+"}
                      </p>
                    </div>
                    <ChevronDown
                      className={`mt-1 h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && <StepDetail step={step} accent={meta.accent} />}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function StepDetail({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <div className="border-t border-slate-800 px-4 py-4">
      <p className="text-sm text-slate-300">{step.description}</p>

      {step.microActions.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Small next steps
          </p>
          <ul className="mt-2 space-y-1.5">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
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
        A calm path from where you are now to your first role — tap any step to
        see how to take it.
      </p>
    </header>
  );
}
