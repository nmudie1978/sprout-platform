"use client";

/**
 * Variant 20 — Compass Trail.
 * An exploration-map feel: a dotted, gently curved trail sweeps left→right with
 * five waypoint markers along it and the goal as a destination marker at the end.
 * A subtle compass rose sits near the start. Text-light, calm, adventurous,
 * colourful accents. Scrolls horizontally on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin, Compass } from "lucide-react";

// Waypoint anchor points along the trail, in the SVG viewBox (1000 × 420).
const NODES = [
  { x: 150, y: 290, cardAbove: false },
  { x: 340, y: 180, cardAbove: true },
  { x: 530, y: 270, cardAbove: false },
  { x: 720, y: 165, cardAbove: true },
  { x: 905, y: 215, cardAbove: false },
];

// A smooth, wandering trail from near the compass to the destination.
const TRAIL_D =
  "M 150 290 C 240 290 250 180 340 180 C 430 180 440 270 530 270 " +
  "C 620 270 630 165 720 165 C 800 165 850 200 905 215";

export default function CompassTrailVariant() {
  return (
    <LabShell note="Variant 20 — Compass Trail. A dotted trail and a compass rose chart the way; flip the scenario above to re-route the journey.">
      {(s) => <Trail scenario={s} />}
    </LabShell>
  );
}

function Trail({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  const goal = steps[steps.length - 1];
  const goalMeta = STAGE_META[goal.stage];
  return (
    <div className="overflow-x-auto pb-4">
      <style>{`
        @keyframes rmh20-dash { to { stroke-dashoffset: -44; } }
        @keyframes rmh20-pulse { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.35); opacity: 0; } }
        .rmh20-trail { animation: rmh20-dash 2.4s linear infinite; }
        .rmh20-ping { animation: rmh20-pulse 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rmh20-trail, .rmh20-ping { animation: none !important; }
        }
      `}</style>

      <div className="relative mx-auto h-[440px] min-w-[880px]">
        <svg
          viewBox="0 0 1000 420"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <marker id="rmh20-arrow" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill={goalMeta.accent} />
            </marker>
          </defs>

          {/* soft underlay glow under the trail */}
          <path d={TRAIL_D} fill="none" stroke="#eef2f7" strokeWidth="14" strokeLinecap="round" />
          {/* dotted exploration trail */}
          <path
            d={TRAIL_D}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 14"
            markerEnd="url(#rmh20-arrow)"
            className="rmh20-trail"
          />

          {/* colourful waypoint pips on the trail */}
          {NODES.map((n, i) => {
            const meta = STAGE_META[steps[i]?.stage ?? "foundation"];
            return (
              <g key={i}>
                <circle cx={n.x} cy={n.y} r="9" fill="#fff" />
                <circle cx={n.x} cy={n.y} r="5.5" fill={meta.accent} />
              </g>
            );
          })}
        </svg>

        {/* compass rose near the start */}
        <CompassRose />

        {/* waypoint cards */}
        {steps.map((step, i) => {
          const node = NODES[i] ?? NODES[NODES.length - 1];
          const left = `${(node.x / 1000) * 100}%`;
          const top = `${(node.y / 420) * 100}%`;
          const isGoal = i === steps.length - 1;
          return (
            <Waypoint
              key={step.id}
              step={step}
              leftPct={left}
              topPct={top}
              above={node.cardAbove}
              isGoal={isGoal}
            />
          );
        })}
      </div>
    </div>
  );
}

function CompassRose() {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(70 / 1000) * 100}%`, top: `${(110 / 420) * 100}%` }}
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-400 shadow-sm backdrop-blur">
        <Compass className="h-8 w-8" strokeWidth={1.5} />
        <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[8px] font-semibold tracking-widest text-slate-300">
          N
        </span>
      </div>
      <p className="mt-1 text-center text-[9px] font-semibold uppercase tracking-widest text-slate-300">
        Start
      </p>
    </div>
  );
}

function Waypoint({
  step,
  leftPct,
  topPct,
  above,
  isGoal,
}: {
  step: RoadStep;
  leftPct: string;
  topPct: string;
  above: boolean;
  isGoal: boolean;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  return (
    <div className="absolute -translate-x-1/2" style={{ left: leftPct, top: topPct }}>
      {/* "you are here" pulse on the trail */}
      {step.isNow && (
        <span
          className="rmh20-ping absolute left-1/2 top-1/2 z-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: meta.accent }}
        />
      )}

      {/* connector tether + card, above or below the trail */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${above ? "bottom-3" : "top-3"} flex flex-col items-center`}
        style={{ width: 172 }}
      >
        {!above && (
          <span
            className="h-6 w-px"
            style={{ background: `linear-gradient(to bottom, transparent, ${meta.ring})` }}
          />
        )}
        <div
          className="w-[172px] rounded-2xl border bg-white p-3 shadow-sm"
          style={{
            borderColor: step.isNow || isGoal ? meta.ring : "#e8edf3",
            borderTopWidth: 3,
            borderTopColor: meta.accent,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: meta.soft, color: meta.accent }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex flex-col items-end leading-tight">
              <span className="text-[10px] font-medium text-slate-400">{step.yearLabel}</span>
              <span className="text-[9px] text-slate-300">{step.ageLabel}</span>
            </div>
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-tight text-slate-800">
            {step.label}
          </h3>
          <p className="text-xs text-slate-500">{step.detail}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ background: meta.soft, color: meta.accent }}
            >
              {isGoal ? "Destination" : meta.label}
            </span>
            {step.place && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                {step.place}
              </span>
            )}
            {step.isNow && (
              <span
                className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide"
                style={{ color: meta.accent }}
              >
                <MapPin className="h-2.5 w-2.5" /> You
              </span>
            )}
          </div>
        </div>
        {above && (
          <span
            className="h-6 w-px"
            style={{ background: `linear-gradient(to top, transparent, ${meta.ring})` }}
          />
        )}
      </div>
    </div>
  );
}
