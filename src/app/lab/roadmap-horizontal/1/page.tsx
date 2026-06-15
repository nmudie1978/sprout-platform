"use client";

/**
 * Variant 1 — Winding Road.
 * The classic inspiration: an S-curve road snaking left→right with a milestone
 * flag-card planted on each bend, alternating above / below the road, and an
 * arrowhead at the destination. Text-light. Scrolls horizontally on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

// Node anchor points on the road, in the SVG viewBox (1000 × 420).
const NODES = [
  { x: 90, y: 250, cardAbove: true },
  { x: 300, y: 150, cardAbove: false },
  { x: 510, y: 250, cardAbove: true },
  { x: 720, y: 150, cardAbove: false },
  { x: 910, y: 175, cardAbove: true },
];

const ROAD_D =
  "M 40 300 C 120 300 120 200 210 200 C 320 200 280 320 410 320 " +
  "C 540 320 480 130 620 130 C 740 130 700 210 820 200 C 880 195 900 185 940 175";

export default function WindingRoadVariant() {
  return (
    <LabShell note="Variant 1 — Winding Road. Flip the scenario above to see the same road retell a different career.">
      {(s) => <Road scenario={s} />}
    </LabShell>
  );
}

function Road({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <div className="overflow-x-auto pb-4">
      <div className="relative mx-auto h-[440px] min-w-[880px]">
        <svg
          viewBox="0 0 1000 420"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <marker id="rmh1-arrow" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
              <path d="M0 0 L9 4.5 L0 9 z" fill="#cbd5e1" />
            </marker>
          </defs>
          {/* road body */}
          <path d={ROAD_D} fill="none" stroke="#e2e8f0" strokeWidth="34" strokeLinecap="round" />
          <path d={ROAD_D} fill="none" stroke="#f1f5f9" strokeWidth="26" strokeLinecap="round" />
          {/* dashed centre line */}
          <path
            d={ROAD_D}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeDasharray="10 12"
            strokeLinecap="round"
            markerEnd="url(#rmh1-arrow)"
          />
        </svg>

        {steps.map((step, i) => {
          const node = NODES[i] ?? NODES[NODES.length - 1];
          const left = `${(node.x / 1000) * 100}%`;
          const top = `${(node.y / 420) * 100}%`;
          return (
            <Flag key={step.id} step={step} leftPct={left} topPct={top} above={node.cardAbove} />
          );
        })}
      </div>
    </div>
  );
}

function Flag({
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
      className="absolute -translate-x-1/2"
      style={{ left: leftPct, top: topPct }}
    >
      {/* node dot on the road */}
      <span
        className="absolute left-1/2 top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow"
        style={{ background: meta.accent }}
      />
      {/* pole + card, above or below */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${above ? "bottom-2.5" : "top-2.5"} flex flex-col items-center`}
        style={{ width: 168 }}
      >
        {!above && <span className="h-5 w-0.5" style={{ background: meta.ring }} />}
        <div
          className="w-[168px] rounded-xl border bg-white p-3 shadow-sm"
          style={{ borderColor: step.isNow ? meta.ring : "#e2e8f0", borderTopWidth: 3, borderTopColor: meta.accent }}
        >
          <div className="flex items-center justify-between">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: meta.soft, color: meta.accent }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-medium text-slate-400">{step.yearLabel}</span>
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-tight text-slate-800">{step.label}</h3>
          <p className="text-xs text-slate-500">{step.detail}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ background: meta.soft, color: meta.accent }}>
              {meta.label}
            </span>
            {step.place && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                {step.place}
              </span>
            )}
            {step.isNow && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ color: meta.accent }}>
                <MapPin className="h-2.5 w-2.5" /> You
              </span>
            )}
          </div>
        </div>
        {above && <span className="h-5 w-0.5" style={{ background: meta.ring }} />}
      </div>
    </div>
  );
}
