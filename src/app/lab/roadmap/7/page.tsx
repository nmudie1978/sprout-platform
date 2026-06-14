"use client";

/**
 * Variant 7 — Constellation.
 * A deep night canvas where milestone steps shine as bright "stars" connected
 * by thin lines into a constellation, and non-milestone steps are smaller dots.
 * Calm cosmic theme, soft glows (never neon). Tap a node → detail appears below.
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
  Sparkles,
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

/** Hand-placed positions (percentage of canvas) forming a gentle rising arc. */
const POSITIONS: { x: number; y: number }[] = [
  { x: 12, y: 80 },
  { x: 26, y: 58 },
  { x: 38, y: 78 },
  { x: 50, y: 50 },
  { x: 62, y: 66 },
  { x: 74, y: 38 },
  { x: 84, y: 56 },
  { x: 92, y: 24 },
];

export default function ConstellationVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [selected, setSelected] = useState<string>(
    steps[currentStepIndex]?.id ?? steps[0].id,
  );
  const selectedStep = steps.find((s) => s.id === selected) ?? steps[0];
  const selectedMeta = STAGE_META[selectedStep.stage];

  return (
    <div className="min-h-screen bg-[#070611] text-slate-100">
      <style>{`
        @keyframes rmTwinkle { 0%,100% { opacity:.55; } 50% { opacity:1; } }
        .rm-twinkle { animation: rmTwinkle 4s ease-in-out infinite; }
        @keyframes rmFade { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:none; } }
        .rm-fade { animation: rmFade .4s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .rm-twinkle, .rm-fade { animation: none; }
        }
      `}</style>

      {/* soft cosmic backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 78% 18%, rgba(124,108,240,0.18), transparent 70%), radial-gradient(50% 50% at 18% 82%, rgba(14,165,183,0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-5 py-12">
        <header>
          <Link
            href="/lab/roadmap"
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            ← Roadmap Lab
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Your roadmap to {career}
          </h1>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Each milestone is a star. Trace the constellation and tap a point to
            explore it.
          </p>
        </header>

        {/* the canvas */}
        <div className="relative mt-8 aspect-[4/3] w-full rounded-3xl border border-white/5 bg-white/[0.015]">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {POSITIONS.slice(0, steps.length - 1).map((p, i) => {
              const n = POSITIONS[i + 1];
              return (
                <line
                  key={i}
                  x1={p.x}
                  y1={p.y}
                  x2={n.x}
                  y2={n.y}
                  stroke="rgba(180,190,255,0.22)"
                  strokeWidth={0.4}
                  strokeDasharray="1.4 1.4"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {steps.map((step, i) => {
            const pos = POSITIONS[i] ?? { x: 50, y: 50 };
            const meta = STAGE_META[step.stage];
            const Icon = ICONS[step.icon] ?? Target;
            const isSelected = selected === step.id;
            const isCurrent = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            const size = step.isMilestone ? 44 : 26;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setSelected(step.id)}
                aria-pressed={isSelected}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition ${step.isMilestone ? "rm-twinkle" : ""}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: size,
                  height: size,
                }}
                title={step.title}
              >
                <span
                  className="flex h-full w-full items-center justify-center rounded-full border transition"
                  style={{
                    borderColor: meta.accent,
                    background: isDone ? meta.accent : meta.soft,
                    boxShadow: isSelected
                      ? `0 0 18px 4px ${meta.ring}, 0 0 0 4px ${meta.ring}`
                      : `0 0 ${step.isMilestone ? 16 : 8}px 1px ${meta.soft}`,
                  }}
                >
                  {step.isMilestone && (
                    <Icon
                      className="h-4 w-4"
                      style={{ color: isDone ? "#070611" : meta.accent }}
                    />
                  )}
                </span>
                {isCurrent && (
                  <span
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-emerald-300"
                  >
                    you are here
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* selected detail */}
        <div key={selectedStep.id} className="rm-fade mt-6">
          <DetailCard step={selectedStep} meta={selectedMeta} />
        </div>

        {/* quick legend / picker */}
        <div className="mt-5 flex flex-wrap gap-2">
          {steps.map((step) => {
            const meta = STAGE_META[step.stage];
            const isSelected = selected === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setSelected(step.id)}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition"
                style={{
                  borderColor: isSelected ? meta.accent : "rgba(255,255,255,0.08)",
                  color: isSelected ? meta.accent : "rgb(148 163 184)",
                  background: isSelected ? meta.soft : "transparent",
                }}
              >
                {step.isMilestone && <Sparkles className="h-3 w-3" />}
                {step.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  step,
  meta,
}: {
  step: RoadmapStep;
  meta: (typeof STAGE_META)[keyof typeof STAGE_META];
}) {
  const accent = meta.accent;
  return (
    <article
      className="rounded-3xl border bg-white/[0.025] p-6 backdrop-blur-sm sm:p-7"
      style={{ borderColor: `${accent}33` }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: meta.soft, color: accent }}
        >
          {meta.label}
        </span>
        {step.isMilestone && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
            <Sparkles className="h-3 w-3" /> Milestone
          </span>
        )}
      </div>
      <h2 className="mt-2 text-xl font-semibold text-slate-100">{step.title}</h2>
      <p className="text-xs text-slate-400">
        {step.subtitle} · Age {step.startAge}
        {step.endAge ? `–${step.endAge}` : "+"}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        {step.description}
      </p>

      {step.microActions.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Small next steps
          </p>
          <ul className="mt-2 space-y-1.5">
            {step.microActions.map((a) => (
              <li
                key={a}
                className="flex items-start gap-2 text-sm text-slate-300"
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
        <div className="mt-5">
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

      {step.resources.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {step.resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:text-slate-100"
            >
              {r.label}
              <ArrowUpRight className="h-3 w-3 opacity-60" />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
