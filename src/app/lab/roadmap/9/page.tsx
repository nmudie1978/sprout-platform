"use client";

/**
 * Variant 9 — Trail to Summit.
 * A trail-map metaphor: a winding SVG path climbs UP to a calm summit marker
 * (the career goal). Steps are ascending waypoints along the trail — lowest is
 * the start, top is the goal. A quiet "you are here" pin sits at the current
 * step. Tap a waypoint → detail. Soft dawn/outdoors gradient, no confetti.
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
  Flag,
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

/**
 * Waypoint positions on a 100x400 viewBox (y descends from bottom→top so the
 * trail climbs). The summit sits above the last waypoint.
 */
const WAYPOINTS: { x: number; y: number }[] = [
  { x: 28, y: 372 },
  { x: 64, y: 332 },
  { x: 34, y: 292 },
  { x: 70, y: 252 },
  { x: 38, y: 212 },
  { x: 66, y: 172 },
  { x: 40, y: 132 },
  { x: 58, y: 92 },
];
const SUMMIT = { x: 50, y: 40 };

function buildTrailPath(): string {
  const pts = [...WAYPOINTS, SUMMIT];
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const midY = (prev.y + cur.y) / 2;
    d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
  }
  return d;
}

export default function TrailToSummitVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [selected, setSelected] = useState<string>(
    steps[currentStepIndex]?.id ?? steps[0].id,
  );
  const selectedStep = steps.find((s) => s.id === selected) ?? steps[0];
  const selectedMeta = STAGE_META[selectedStep.stage];
  const trail = buildTrailPath();

  return (
    <div
      className="min-h-screen text-slate-900"
      style={{
        background:
          "linear-gradient(180deg, #fde9c8 0%, #f6d6c0 26%, #e6c7d2 55%, #c9c0e0 80%, #b8bfe2 100%)",
      }}
    >
      <style>{`
        @keyframes rmTrailDraw { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
        .rm-trail { stroke-dasharray: 1200; animation: rmTrailDraw 1.8s ease forwards; }
        @keyframes rmPinBob { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-3px);} }
        .rm-pin { animation: rmPinBob 2.6s ease-in-out infinite; }
        @keyframes rmFade { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:none; } }
        .rm-fade { animation: rmFade .4s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .rm-trail { stroke-dasharray: none; animation: none; }
          .rm-pin, .rm-fade { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-12">
        <header>
          <Link
            href="/lab/roadmap"
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            ← Roadmap Lab
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your roadmap to {career}
          </h1>
          <p className="mt-2 max-w-md text-sm text-slate-700">
            A trail climbing to your summit. Tap a waypoint to see how to take
            that part of the climb.
          </p>
        </header>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,360px)_1fr] md:items-start">
          {/* the trail map */}
          <div className="relative mx-auto w-full max-w-[360px]">
            <svg
              viewBox="0 0 100 400"
              className="h-auto w-full overflow-visible"
              role="img"
              aria-label="A winding trail of roadmap waypoints climbing to the summit goal"
            >
              {/* trail shadow */}
              <path
                d={trail}
                fill="none"
                stroke="rgba(120,90,70,0.18)"
                strokeWidth={7}
                strokeLinecap="round"
              />
              {/* trail */}
              <path
                d={trail}
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeDasharray="0.1 6"
                className="rm-trail"
              />

              {/* summit marker */}
              <g>
                <circle
                  cx={SUMMIT.x}
                  cy={SUMMIT.y}
                  r={11}
                  fill="#fff"
                  stroke={STAGE_META.career.accent}
                  strokeWidth={2}
                />
                <circle
                  cx={SUMMIT.x}
                  cy={SUMMIT.y}
                  r={16}
                  fill="none"
                  stroke={STAGE_META.career.accent}
                  strokeOpacity={0.3}
                  strokeWidth={1.5}
                />
              </g>

              {/* waypoints */}
              {steps.map((step, i) => {
                const p = WAYPOINTS[i] ?? { x: 50, y: 200 };
                const meta = STAGE_META[step.stage];
                const isSelected = selected === step.id;
                const isDone = i < currentStepIndex;
                const r = step.isMilestone ? 7 : 5;
                return (
                  <g key={step.id} className="cursor-pointer">
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r + 4}
                        fill="none"
                        stroke={meta.accent}
                        strokeWidth={1.6}
                        strokeOpacity={0.6}
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r}
                      fill={isDone ? meta.accent : "#ffffff"}
                      stroke={meta.accent}
                      strokeWidth={2}
                      onClick={() => setSelected(step.id)}
                    />
                    {step.isMilestone && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={2}
                        fill={isDone ? "#ffffff" : meta.accent}
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* summit label (HTML overlay for crisp type) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 text-center"
              style={{ top: `${(SUMMIT.y / 400) * 100}%`, marginTop: "-58px" }}
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur">
                <Flag
                  className="h-3.5 w-3.5"
                  style={{ color: STAGE_META.career.accent }}
                />
                Summit · {career}
              </div>
            </div>
          </div>

          {/* waypoint detail + list */}
          <div>
            <div key={selectedStep.id} className="rm-fade">
              <DetailCard step={selectedStep} meta={selectedMeta} />
            </div>

            <ol className="mt-5 space-y-1.5">
              {steps.map((step, i) => {
                const meta = STAGE_META[step.stage];
                const isSelected = selected === step.id;
                const isCurrent = i === currentStepIndex;
                const Icon = ICONS[step.icon] ?? Target;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(step.id)}
                      className="flex w-full items-center gap-3 rounded-xl border bg-white/55 px-3 py-2 text-left transition hover:bg-white/80"
                      style={{
                        borderColor: isSelected
                          ? meta.accent
                          : "rgba(255,255,255,0.6)",
                      }}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ background: meta.soft }}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                          style={{ color: meta.accent }}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {step.title}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Age {step.startAge}
                          {step.endAge ? `–${step.endAge}` : "+"}
                        </span>
                      </span>
                      {isCurrent && (
                        <span className="rm-pin inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                          <MapPin className="h-3.5 w-3.5" /> here
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
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
      className="rounded-3xl border bg-white/80 p-6 shadow-sm backdrop-blur sm:p-7"
      style={{ borderColor: `${accent}55` }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: meta.soft, color: accent }}
        >
          {meta.label}
        </span>
        {step.isMilestone && (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Milestone
          </span>
        )}
      </div>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">{step.title}</h2>
      <p className="text-xs text-slate-500">
        {step.subtitle} · Age {step.startAge}
        {step.endAge ? `–${step.endAge}` : "+"}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        {step.description}
      </p>

      {step.microActions.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Small next steps
          </p>
          <ul className="mt-2 space-y-1.5">
            {step.microActions.map((a) => (
              <li
                key={a}
                className="flex items-start gap-2 text-sm text-slate-700"
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
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            How to
          </p>
          <ol className="mt-2 space-y-2">
            {step.howTo.map((h, i) => (
              <li key={i} className="text-sm">
                <span className="text-slate-800">
                  <span className="mr-1.5 text-slate-400">{i + 1}.</span>
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
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white/70 px-2.5 py-1 text-xs text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
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
