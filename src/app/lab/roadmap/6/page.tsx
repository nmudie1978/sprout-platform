"use client";

/**
 * Variant 6 — Expandable Spine.
 * A centred vertical spine with nodes sitting ON the line. Tapping a node opens
 * a large, immersive inline detail panel that expands smoothly beneath it
 * (single-open accordion). Distinct from variant 1's left-rail: centred,
 * bigger, full-width detail.
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

export default function ExpandableSpineVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [open, setOpen] = useState<string | null>(
    steps[currentStepIndex]?.id ?? null,
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmSpineRise { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        .rm-spine-rise { animation: rmSpineRise .5s ease both; }
        .rm-spine-panel { overflow: hidden; transition: grid-template-rows .42s cubic-bezier(.4,0,.2,1), opacity .42s ease; display: grid; }
        @media (prefers-reduced-motion: reduce) {
          .rm-spine-rise { animation: none; }
          .rm-spine-panel { transition: none; }
        }
      `}</style>

      <div className="mx-auto max-w-2xl px-5 py-12">
        <header className="text-center">
          <Link
            href="/lab/roadmap"
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            ← Roadmap Lab
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Your roadmap to {career}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Follow the spine from where you are now. Tap a node to open its full
            detail.
          </p>
        </header>

        <ol className="relative mt-12">
          {/* centred spine */}
          <span
            aria-hidden
            className="absolute left-1/2 top-0 bottom-0 -ml-px w-0.5 bg-gradient-to-b from-slate-700 via-slate-700 to-transparent"
          />
          {steps.map((step, i) => {
            const meta = STAGE_META[step.stage];
            const Icon = ICONS[step.icon] ?? Target;
            const isOpen = open === step.id;
            const isCurrent = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <li
                key={step.id}
                className="rm-spine-rise relative pb-8"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                {/* node on the centre line */}
                <div className="relative flex justify-center">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : step.id)}
                    aria-expanded={isOpen}
                    className="group relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-slate-950 transition hover:scale-105"
                    style={{
                      borderColor: meta.accent,
                      background: isDone ? meta.accent : "#020617",
                      boxShadow: isCurrent
                        ? `0 0 0 5px ${meta.ring}`
                        : `0 0 0 4px ${meta.soft}`,
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: isDone ? "#020617" : meta.accent }}
                    />
                    {step.isMilestone && (
                      <span
                        aria-hidden
                        className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-amber-300"
                      />
                    )}
                  </button>
                </div>

                {/* compact label under node */}
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : step.id)}
                  className="mt-3 flex w-full flex-col items-center text-center"
                >
                  <div className="flex flex-wrap items-center justify-center gap-2">
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
                  <h3 className="mt-1.5 text-base font-semibold text-slate-100">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {step.subtitle} · Age {step.startAge}
                    {step.endAge ? `–${step.endAge}` : "+"}
                  </p>
                  <ChevronDown
                    className={`mt-1.5 h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* immersive expanding panel */}
                <div
                  className="rm-spine-panel mt-4"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="min-h-0">
                    <StepDetail step={step} accent={meta.accent} />
                  </div>
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
    <div
      className="rounded-3xl border bg-slate-900/70 p-6 sm:p-7"
      style={{ borderColor: `${accent}40` }}
    >
      <p className="text-sm leading-relaxed text-slate-200">
        {step.description}
      </p>

      {step.microActions.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Small next steps
          </p>
          <ul className="mt-3 space-y-2">
            {step.microActions.map((a) => (
              <li
                key={a}
                className="flex items-start gap-2.5 text-sm text-slate-300"
              >
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
        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            How to
          </p>
          <ol className="mt-3 space-y-3">
            {step.howTo.map((h, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: `${accent}22`, color: accent }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-slate-200">{h.step}</p>
                  {h.detail && (
                    <p className="mt-0.5 text-xs text-slate-500">{h.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {step.resources.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Resources
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {step.resources.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
              >
                {r.label}
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
