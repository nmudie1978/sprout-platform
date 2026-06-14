"use client";

/**
 * Variant 16 — Honeycomb.
 * Hexagon nodes arranged in a gentle comb, linked by soft connectors. Each hex
 * shows an icon + short title, coloured by stage. Milestones get an emphasised
 * ring and a touch more size. Tapping a hex opens a detail panel below. On
 * mobile the comb collapses to a calm single column. Crisp geometry, calm palette.
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
  X,
  type LucideIcon,
} from "lucide-react";
import { SAMPLE_ROADMAP, STAGE_META, type RoadmapStep } from "../_data";

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

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

export default function HoneycombVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [open, setOpen] = useState<string | null>(steps[currentStepIndex]?.id ?? null);

  const openStep = steps.find((s) => s.id === open) ?? null;
  const openIndex = openStep ? steps.indexOf(openStep) : -1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmHexIn { from { opacity: 0; transform: scale(.92);} to {opacity:1; transform:none;} }
        .rm-hex-in { animation: rmHexIn .4s ease both; }
        @keyframes rmPanel { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        .rm-panel { animation: rmPanel .35s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .rm-hex-in, .rm-panel { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-3xl px-5 py-12">
        <LabHeader career={career} />

        {/* The comb. Each row is a flex line; odd rows are inset by half a hex to
            interlock. On mobile it gracefully becomes a single calm column. */}
        <div className="mt-10 flex flex-col items-center gap-2 sm:gap-3">
          {chunk(steps, 3).map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-3"
              style={{ marginLeft: 0 }}
            >
              {row.map(({ step, i }) => {
                const meta = STAGE_META[step.stage];
                const Icon = ICONS[step.icon] ?? Target;
                const isCurrent = i === currentStepIndex;
                const isDone = i < currentStepIndex;
                const isOpen = open === step.id;
                const size = step.isMilestone ? 132 : 116;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setOpen(isOpen ? null : step.id)}
                    className="rm-hex-in group relative shrink-0 focus:outline-none"
                    style={{
                      width: size,
                      height: size * 1.0,
                      animationDelay: `${i * 55}ms`,
                      // inset alternating rows on desktop for the comb interlock
                      marginTop: 0,
                    }}
                    aria-expanded={isOpen}
                    aria-label={`${step.title} — ${meta.label}`}
                  >
                    {/* outer ring (milestone / current emphasis) */}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        clipPath: HEX_CLIP,
                        background:
                          isCurrent || step.isMilestone ? meta.accent : "transparent",
                        opacity: isCurrent ? 1 : step.isMilestone ? 0.55 : 0,
                        transform: "scale(1.06)",
                      }}
                    />
                    {/* hex face */}
                    <span
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center transition group-hover:brightness-110"
                      style={{
                        clipPath: HEX_CLIP,
                        background: isDone
                          ? meta.accent
                          : `linear-gradient(160deg, ${meta.soft}, #0f172a)`,
                        border: "none",
                        boxShadow: isOpen ? `inset 0 0 0 2px ${meta.accent}` : undefined,
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: isDone ? "#0b1220" : meta.accent }}
                      />
                      <span
                        className="text-[10px] font-semibold leading-tight"
                        style={{ color: isDone ? "#0b1220" : "#e2e8f0" }}
                      >
                        {step.title}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-950">
                          <MapPin className="h-2.5 w-2.5" /> here
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
          {(["foundation", "education", "experience", "career"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: STAGE_META[s].accent }}
              />
              {STAGE_META[s].label}
            </span>
          ))}
        </div>

        {/* detail panel */}
        {openStep && (
          <div className="rm-panel mt-8">
            <HexDetailPanel
              step={openStep}
              isCurrent={openIndex === currentStepIndex}
              onClose={() => setOpen(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function chunk(
  steps: RoadmapStep[],
  size: number
): { step: RoadmapStep; i: number }[][] {
  const rows: { step: RoadmapStep; i: number }[][] = [];
  for (let i = 0; i < steps.length; i += size) {
    rows.push(steps.slice(i, i + size).map((step, j) => ({ step, i: i + j })));
  }
  return rows;
}

function HexDetailPanel({
  step,
  isCurrent,
  onClose,
}: {
  step: RoadmapStep;
  isCurrent: boolean;
  onClose: () => void;
}) {
  const meta = STAGE_META[step.stage];
  return (
    <div
      className="rounded-2xl border bg-slate-900/60 p-5"
      style={{ borderColor: meta.ring }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
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
          <h3 className="mt-2 text-lg font-semibold text-slate-100">{step.title}</h3>
          <p className="text-xs text-slate-400">
            {step.subtitle} · Age {step.startAge}
            {step.endAge ? `–${step.endAge}` : "+"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-300">{step.description}</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {step.microActions.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Small next steps
            </p>
            <ul className="mt-2 space-y-1.5">
              {step.microActions.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-slate-300">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: meta.accent }}
                  />
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
                  {h.detail && (
                    <p className="ml-5 text-xs text-slate-500">{h.detail}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {step.resources.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
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
        Each cell is a step in your journey — tap one to see how to take it.
      </p>
    </header>
  );
}
