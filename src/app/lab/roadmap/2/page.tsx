"use client";

/**
 * Variant 2 — Metro Map.
 * A subway/transit-map layout: steps are stations along a coloured line, with
 * each segment tinted by its step's stage. Milestones are interchange stations
 * (larger ring). Horizontal track that wraps on desktop, becomes a vertical
 * metro line on mobile. Tap a station to reveal its detail in the card below.
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

export default function MetroMapVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [selectedId, setSelectedId] = useState<string>(
    steps[currentStepIndex]?.id ?? steps[0]!.id,
  );
  const selected = steps.find((s) => s.id === selectedId) ?? steps[0]!;
  const selectedMeta = STAGE_META[selected.stage];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmFade { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        .rm-fade { animation: rmFade .35s ease both; }
        @media (prefers-reduced-motion: reduce) { .rm-fade { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-12">
        <header>
          <Link href="/lab/roadmap" className="text-xs text-slate-500 hover:text-slate-300">
            ← Roadmap Lab
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            Your roadmap to {career}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Ride the line from where you are now to your first role — tap any
            station to see how to reach it.
          </p>
        </header>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-3">
          {Object.values(STAGE_META).map((m) => (
            <span key={m.label} className="inline-flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2.5 w-6 rounded-full" style={{ background: m.accent }} />
              {m.label}
            </span>
          ))}
        </div>

        {/* The metro line */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
          <ol className="flex flex-col gap-0 sm:flex-row sm:flex-wrap sm:items-start sm:gap-y-10">
            {steps.map((step, i) => {
              const meta = STAGE_META[step.stage];
              const Icon = ICONS[step.icon] ?? Target;
              const isCurrent = i === currentStepIndex;
              const isDone = i < currentStepIndex;
              const isSelected = step.id === selectedId;
              const prevAccent = i > 0 ? STAGE_META[steps[i - 1]!.stage].accent : meta.accent;
              return (
                <li
                  key={step.id}
                  className="relative flex items-start gap-4 sm:w-[calc(25%-0px)] sm:flex-col sm:items-center sm:gap-3 sm:px-1"
                >
                  {/* Connecting segment — vertical on mobile, horizontal on desktop */}
                  {i > 0 && (
                    <>
                      <span
                        aria-hidden
                        className="absolute left-[19px] -top-1 h-6 w-[5px] -translate-y-full rounded-full sm:hidden"
                        style={{ background: `linear-gradient(${prevAccent}, ${meta.accent})` }}
                      />
                      <span
                        aria-hidden
                        className="absolute right-1/2 top-[19px] hidden h-[5px] w-full rounded-full sm:block"
                        style={{ background: `linear-gradient(90deg, ${prevAccent}, ${meta.accent})` }}
                      />
                    </>
                  )}

                  {/* Station marker */}
                  <button
                    type="button"
                    onClick={() => setSelectedId(step.id)}
                    aria-pressed={isSelected}
                    className="relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 bg-slate-950 transition"
                    style={{
                      width: step.isMilestone ? 44 : 38,
                      height: step.isMilestone ? 44 : 38,
                      borderColor: meta.accent,
                      background: isDone ? meta.accent : "#0b1220",
                      boxShadow: isSelected
                        ? `0 0 0 5px ${meta.ring}`
                        : isCurrent
                          ? `0 0 0 3px ${meta.ring}`
                          : undefined,
                    }}
                  >
                    {step.isMilestone && (
                      <span
                        className="absolute inset-1 rounded-full border"
                        style={{ borderColor: isDone ? "#0b1220" : meta.accent }}
                      />
                    )}
                    <Icon
                      className="h-4 w-4"
                      style={{ color: isDone ? "#0b1220" : meta.accent }}
                    />
                  </button>

                  {/* Station label */}
                  <button
                    type="button"
                    onClick={() => setSelectedId(step.id)}
                    className="min-w-0 flex-1 pt-1 text-left sm:flex-none sm:text-center"
                  >
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{ color: isSelected ? meta.accent : "#e2e8f0" }}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Age {step.startAge}
                      {step.endAge ? `–${step.endAge}` : "+"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5 sm:justify-center">
                      {step.isMilestone && (
                        <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                          Interchange
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
                          <MapPin className="h-2.5 w-2.5" /> You are here
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Detail card */}
        <div
          key={selected.id}
          className="rm-fade mt-6 rounded-3xl border bg-slate-900/60 p-6 sm:p-8"
          style={{ borderColor: selectedMeta.ring }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: selectedMeta.soft, color: selectedMeta.accent }}
            >
              {selectedMeta.label}
            </span>
            {selected.isMilestone && (
              <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Interchange station
              </span>
            )}
          </div>
          <h2 className="mt-2 text-xl font-bold">{selected.title}</h2>
          {selected.subtitle && (
            <p className="text-sm text-slate-400">{selected.subtitle}</p>
          )}
          <StationDetail step={selected} accent={selectedMeta.accent} />
        </div>
      </div>
    </div>
  );
}

function StationDetail({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <div className="mt-4">
      <p className="text-sm text-slate-300">{step.description}</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {step.microActions.length > 0 && (
          <div>
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
          <div>
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
      </div>

      {step.resources.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
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
