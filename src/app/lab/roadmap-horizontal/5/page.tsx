"use client";

/**
 * Variant 5 — Gradient Ribbon.
 * A thick horizontal ribbon sweeps left→right, its soft multi-stop gradient
 * blending the five stage accents (teal → indigo → amber → emerald → pink).
 * Five glowing circular nodes sit on the ribbon (white circle, stage-accent
 * ring, step icon inside); a text-light card floats above each node. The
 * gradient is the colour hero — everything else stays restrained.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

// Even node spacing across a 1000-wide viewBox, ribbon centred at y = 230.
const NODE_X = [100, 300, 500, 700, 900];
const RIBBON_Y = 230;

export default function GradientRibbonVariant() {
  return (
    <LabShell note="Variant 5 — Gradient Ribbon. One flowing gradient blends the five stage colours; flip the scenario above to retell the same ribbon.">
      {(s) => <Ribbon scenario={s} />}
    </LabShell>
  );
}

function Ribbon({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <div className="overflow-x-auto pb-4">
      <style>{`
        @keyframes rmh5-flow { from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; } }
        @keyframes rmh5-pulse { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.18); opacity: .9; } }
        .rmh5-sheen { animation: rmh5-flow 3.4s linear infinite; }
        .rmh5-now { transform-box: fill-box; transform-origin: center; animation: rmh5-pulse 2.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rmh5-sheen, .rmh5-now { animation: none; }
        }
      `}</style>

      <div className="relative mx-auto h-[360px] min-w-[860px]">
        <svg
          viewBox="0 0 1000 360"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="rmh5-ribbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={STAGE_META.foundation.accent} />
              <stop offset="25%" stopColor={STAGE_META.choose.accent} />
              <stop offset="50%" stopColor={STAGE_META.study.accent} />
              <stop offset="75%" stopColor={STAGE_META.entry.accent} />
              <stop offset="100%" stopColor={STAGE_META.advance.accent} />
            </linearGradient>
            <filter id="rmh5-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="9" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* soft glow halo under the ribbon */}
          <line
            x1="60"
            y1={RIBBON_Y}
            x2="940"
            y2={RIBBON_Y}
            stroke="url(#rmh5-ribbon)"
            strokeWidth="40"
            strokeLinecap="round"
            opacity="0.28"
            filter="url(#rmh5-glow)"
          />
          {/* the ribbon body */}
          <line
            x1="60"
            y1={RIBBON_Y}
            x2="940"
            y2={RIBBON_Y}
            stroke="url(#rmh5-ribbon)"
            strokeWidth="26"
            strokeLinecap="round"
          />
          {/* travelling sheen */}
          <line
            x1="60"
            y1={RIBBON_Y - 4}
            x2="940"
            y2={RIBBON_Y - 4}
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="14 46"
            opacity="0.5"
            className="rmh5-sheen"
          />
        </svg>

        {steps.map((step, i) => {
          const x = NODE_X[i] ?? NODE_X[NODE_X.length - 1];
          const leftPct = `${(x / 1000) * 100}%`;
          const topPct = `${(RIBBON_Y / 360) * 100}%`;
          return (
            <Node key={step.id} step={step} leftPct={leftPct} topPct={topPct} />
          );
        })}
      </div>
    </div>
  );
}

function Node({
  step,
  leftPct,
  topPct,
}: {
  step: RoadStep;
  leftPct: string;
  topPct: string;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  return (
    <div className="absolute -translate-x-1/2" style={{ left: leftPct, top: topPct }}>
      {/* floating card above the node */}
      <div
        className="absolute bottom-12 left-1/2 w-[164px] -translate-x-1/2 rounded-2xl border border-white/70 bg-white/85 p-3 text-center shadow-[0_8px_28px_-12px_rgba(15,23,42,0.35)] backdrop-blur"
        style={{ boxShadow: `0 8px 28px -14px ${meta.ring}` }}
      >
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
          style={{ background: meta.soft, color: meta.accent }}
        >
          {meta.label}
        </span>
        <h3 className="mt-1.5 text-sm font-semibold leading-tight text-slate-800">
          {step.label}
        </h3>
        <p className="text-xs leading-snug text-slate-500">{step.detail}</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-medium text-slate-500"
            style={{ background: "#f1f5f9" }}
          >
            {step.yearLabel} · {step.ageLabel}
          </span>
          {step.place && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
              {step.place}
            </span>
          )}
        </div>
        {step.isNow && (
          <span
            className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide"
            style={{ color: meta.accent }}
          >
            <MapPin className="h-2.5 w-2.5" /> You
          </span>
        )}
      </div>

      {/* glowing node on the ribbon */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {step.isNow && (
          <span
            className="rmh5-now absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: meta.ring }}
          />
        )}
        <span
          className="relative flex h-11 w-11 items-center justify-center rounded-full border-[3px] bg-white shadow-md"
          style={{ borderColor: meta.accent, color: meta.accent }}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
