"use client";

/**
 * Variant 12 — Minimal Cards.
 * Ultra-premium minimalism: a single column of large, airy cards joined by a
 * thin vertical hairline. Refined typography, a tiny stage tag and age,
 * understated milestone / "you are here" cues, and an inline detail reveal kept
 * quiet and elegant. Restraint is the point.
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
  Plus,
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

export default function MinimalCardsVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [open, setOpen] = useState<string | null>(steps[currentStepIndex]?.id ?? null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmReveal { from { opacity: 0; transform: translateY(6px);} to {opacity:1; transform:none;} }
        .rm-reveal { animation: rmReveal .4s ease both; }
        @media (prefers-reduced-motion: reduce) { .rm-reveal { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-xl px-6 py-16">
        <LabHeader career={career} />

        <div className="relative mt-14">
          {/* hairline connector */}
          <span
            aria-hidden
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-800 to-transparent"
          />

          <ol className="relative space-y-14">
            {steps.map((step, i) => {
              const meta = STAGE_META[step.stage];
              const Icon = ICONS[step.icon] ?? Target;
              const isOpen = open === step.id;
              const isCurrent = i === currentStepIndex;
              const isDone = i < currentStepIndex;
              return (
                <li key={step.id} className="relative">
                  {/* hairline node dot */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-0 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-slate-950"
                    style={{ background: isDone ? meta.accent : "#475569" }}
                  />

                  <article
                    className={`rounded-3xl border bg-slate-900/30 px-7 py-7 transition ${
                      isCurrent ? "" : "border-slate-800/80"
                    }`}
                    style={isCurrent ? { borderColor: meta.ring } : undefined}
                  >
                    <header className="flex items-start gap-4">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                        style={{ background: meta.soft }}
                      >
                        <Icon className="h-5 w-5" style={{ color: meta.accent }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                            style={{ color: meta.accent }}
                          >
                            {meta.label}
                          </span>
                          {step.isMilestone && (
                            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300/80">
                              · Milestone
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300/90">
                              · You are here
                            </span>
                          )}
                        </div>
                        <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-slate-100">
                          {step.title}
                        </h2>
                        <p className="mt-0.5 text-[13px] font-light text-slate-500">
                          {step.subtitle ? `${step.subtitle} · ` : ""}Age {step.startAge}
                          {step.endAge ? `–${step.endAge}` : "+"}
                        </p>
                      </div>
                    </header>

                    <p className="mt-5 text-[15px] font-light leading-relaxed text-slate-300">
                      {step.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : step.id)}
                      aria-expanded={isOpen}
                      className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-400 transition hover:text-slate-200"
                    >
                      <Plus
                        className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-45" : ""}`}
                      />
                      {isOpen ? "Hide detail" : "Show how to take this step"}
                    </button>

                    {isOpen && (
                      <div className="rm-reveal mt-6 border-t border-slate-800/80 pt-6">
                        <StepDetail step={step} accent={meta.accent} />
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function StepDetail({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <>
      {step.microActions.length > 0 && (
        <Section label="Small next steps">
          <ul className="space-y-2">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2.5 text-sm font-light text-slate-300">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} />
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
              <li key={i} className="text-sm font-light">
                <span className="text-slate-200">
                  <span className="mr-2 text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                  {h.step}
                </span>
                {h.detail && <p className="ml-7 mt-0.5 text-xs text-slate-500">{h.detail}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {step.resources.length > 0 && (
        <Section label="Resources">
          <div className="flex flex-col gap-1.5">
            {step.resources.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-light text-slate-400 transition hover:text-slate-100"
              >
                <span className="border-b border-transparent group-hover:border-slate-600">{r.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition group-hover:opacity-90" />
              </a>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function LabHeader({ career }: { career: string }) {
  return (
    <header className="text-center">
      <Link href="/lab/roadmap" className="text-xs text-slate-500 hover:text-slate-300">
        ← Roadmap Lab
      </Link>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">Your roadmap to {career}</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-slate-400">
        One quiet step at a time. Read it through, and open any card when you
        want to know how to take that step.
      </p>
    </header>
  );
}
