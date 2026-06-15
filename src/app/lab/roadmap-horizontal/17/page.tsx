"use client";

/**
 * Variant 17 — Flight Path.
 * An airline route-map feel: a gentle dotted ARC flight-path curving left→right.
 * Origin marker ("you are here") at the start, destination flag at the end, and
 * a small plane resting on the arc at the current step. Five dots along the arc,
 * each lifting a calm text-light label. Light, aspirational, calm.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin, Plane, Target } from "lucide-react";

// SVG viewBox is 1000 × 360. The arc is a single gentle bezier rising slightly
// then settling, so the journey reads as a calm flight from origin → goal.
const ARC_D = "M 60 280 C 280 110, 720 110, 940 200";

// Five evenly-spaced anchor points sampled along the arc (left→right).
const NODES = [
  { x: 60, y: 280 },
  { x: 285, y: 158 },
  { x: 500, y: 132 },
  { x: 715, y: 152 },
  { x: 940, y: 200 },
];

export default function FlightPathVariant() {
  return (
    <LabShell note="Variant 17 — Flight Path. A dotted route arcs from 'you are here' to the destination; the plane marks where you are now. Flip the scenario above to re-route.">
      {(s) => <Infographic scenario={s} />}
    </LabShell>
  );
}

function Infographic({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  // The plane sits on whichever step is "now" (falls back to the first).
  const nowIndex = Math.max(0, steps.findIndex((st) => st.isNow));
  const planeNode = NODES[nowIndex] ?? NODES[0];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="relative mx-auto h-[440px] min-w-[880px]">
        <svg
          viewBox="0 0 1000 360"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {/* faint sky baseline */}
          <line x1="40" y1="320" x2="960" y2="320" stroke="#eef2f7" strokeWidth="2" />

          {/* dotted flight path */}
          <path
            d={ARC_D}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeDasharray="2 12"
            strokeLinecap="round"
            className="rmh17-trail"
          />

          {/* origin pulse ring at "you are here" */}
          <circle
            cx={NODES[0].x}
            cy={NODES[0].y}
            r="14"
            fill="none"
            stroke={STAGE_META[steps[0].stage].ring}
            strokeWidth="2"
            className="rmh17-pulse"
          />

          {/* node dots along the arc */}
          {steps.map((step, i) => {
            const node = NODES[i] ?? NODES[NODES.length - 1];
            const meta = STAGE_META[step.stage];
            return (
              <g key={step.id}>
                <circle cx={node.x} cy={node.y} r="7.5" fill="#ffffff" />
                <circle cx={node.x} cy={node.y} r="5.5" fill={meta.accent} />
              </g>
            );
          })}
        </svg>

        {/* origin marker — you are here */}
        <Marker node={NODES[0]} accent={STAGE_META[steps[0].stage].accent} kind="origin" />

        {/* destination marker — the goal */}
        <Marker
          node={NODES[NODES.length - 1]}
          accent={STAGE_META[steps[steps.length - 1].stage].accent}
          kind="destination"
          caption={scenario.employer}
        />

        {/* the plane at the current step */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(planeNode.x / 1000) * 100}%`,
            top: `${(planeNode.y / 360) * 100}%`,
          }}
        >
          <span
            className="rmh17-plane flex h-9 w-9 items-center justify-center rounded-full border-4 border-white shadow-md"
            style={{ background: STAGE_META[steps[nowIndex].stage].accent }}
          >
            <Plane className="h-4 w-4 -rotate-45 text-white" />
          </span>
        </div>

        {/* labels — alternate above / below the arc so they never collide */}
        {steps.map((step, i) => {
          const node = NODES[i] ?? NODES[NODES.length - 1];
          const above = i % 2 === 0;
          return (
            <Label
              key={step.id}
              step={step}
              leftPct={`${(node.x / 1000) * 100}%`}
              topPct={`${(node.y / 360) * 100}%`}
              above={above}
            />
          );
        })}
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .rmh17-trail {
            stroke-dashoffset: 0;
            animation: rmh17-drift 2.4s linear infinite;
          }
          .rmh17-pulse {
            transform-box: fill-box;
            transform-origin: center;
            animation: rmh17-ping 2.6s ease-out infinite;
          }
          .rmh17-plane {
            animation: rmh17-bob 3.2s ease-in-out infinite;
          }
        }
        @keyframes rmh17-drift {
          to { stroke-dashoffset: -28; }
        }
        @keyframes rmh17-ping {
          0% { opacity: 0.8; transform: scale(0.7); }
          70%, 100% { opacity: 0; transform: scale(2.1); }
        }
        @keyframes rmh17-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rmh17-trail, .rmh17-pulse, .rmh17-plane { animation: none; }
        }
      `}</style>
    </div>
  );
}

function Marker({
  node,
  accent,
  kind,
  caption,
}: {
  node: { x: number; y: number };
  accent: string;
  kind: "origin" | "destination";
  caption?: string;
}) {
  const Icon = kind === "origin" ? MapPin : Target;
  const text = kind === "origin" ? "Departure" : caption ?? "Destination";
  return (
    <div
      className="absolute z-20 flex -translate-x-1/2 flex-col items-center"
      style={{
        left: `${(node.x / 1000) * 100}%`,
        top: `${(node.y / 360) * 100}%`,
        transform: `translate(-50%, ${kind === "origin" ? "12px" : "-100%"})`,
      }}
    >
      {kind === "destination" && (
        <>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-white shadow"
            style={{ background: accent }}
          >
            <Icon className="h-4 w-4 text-white" />
          </span>
          <span className="mt-1 h-3 w-px" style={{ background: accent }} />
        </>
      )}
      <span
        className="whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest shadow-sm"
        style={{ color: accent }}
      >
        {text}
      </span>
      {kind === "origin" && (
        <>
          <span className="mt-1 h-3 w-px" style={{ background: accent }} />
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-white shadow"
            style={{ background: accent }}
          >
            <Icon className="h-4 w-4 text-white" />
          </span>
        </>
      )}
    </div>
  );
}

function Label({
  step,
  leftPct,
  topPct,
  above,
}: {
  step: RoadStep;
  leftPct: string;
  topPct: string;
  above: boolean;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  return (
    <div
      className="absolute z-10 flex w-[150px] -translate-x-1/2 flex-col items-center text-center"
      style={{
        left: leftPct,
        top: topPct,
        transform: `translate(-50%, ${above ? "calc(-100% - 28px)" : "32px"})`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: meta.soft, color: meta.accent }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-semibold leading-tight text-slate-800">
          {step.label}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{step.detail}</p>
      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
          style={{ background: meta.soft, color: meta.accent }}
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
  );
}
