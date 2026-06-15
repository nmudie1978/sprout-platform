"use client";

/**
 * Variant 2 — Pin Markers.
 * A gentle wavy road runs left→right with teardrop MAP-PIN markers planted ON
 * the road (a coloured balloon with the step icon inside, like Google-Maps
 * pins). Each pin tethers a small text-light card above or below, alternating.
 * Text-light. Scrolls horizontally on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

// Pin anchor points (where the teardrop tip touches the road) in the SVG
// viewBox (1000 × 360). cardAbove alternates the tethered card.
const NODES = [
  { x: 90, y: 250, cardAbove: false },
  { x: 300, y: 150, cardAbove: true },
  { x: 510, y: 245, cardAbove: false },
  { x: 720, y: 150, cardAbove: true },
  { x: 915, y: 200, cardAbove: false },
];

// A gentle wavy road threading the five pin tips.
const ROAD_D =
  "M 30 250 C 130 250 180 150 300 150 C 420 150 400 245 510 245 " +
  "C 620 245 610 150 720 150 C 830 150 830 200 915 200 C 945 200 960 200 975 200";

export default function PinMarkersVariant() {
  return (
    <LabShell note="Variant 2 — Pin Markers. Map-style teardrop pins drop onto a wavy road; flip the scenario above to retell the journey.">
      {(s) => <Infographic scenario={s} />}
    </LabShell>
  );
}

function Infographic({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <>
      <style>{`
        @keyframes rmh2-drop {
          0% { transform: translate(-50%, -118%); opacity: 0; }
          100% { transform: translate(-50%, -100%); opacity: 1; }
        }
        .rmh2-pin { animation: rmh2-drop 480ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .rmh2-pin { animation: none; transform: translate(-50%, -100%); opacity: 1; }
        }
      `}</style>
      <div className="overflow-x-auto pb-4">
        <div className="relative mx-auto h-[440px] min-w-[880px]">
          <svg
            viewBox="0 0 1000 360"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <defs>
              <marker id="rmh2-arrow" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
                <path d="M0 0 L9 4.5 L0 9 z" fill="#cbd5e1" />
              </marker>
            </defs>
            {/* road body */}
            <path d={ROAD_D} fill="none" stroke="#e2e8f0" strokeWidth="30" strokeLinecap="round" />
            <path d={ROAD_D} fill="none" stroke="#f8fafc" strokeWidth="22" strokeLinecap="round" />
            {/* dashed centre line + arrowhead at the destination */}
            <path
              d={ROAD_D}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeDasharray="9 12"
              strokeLinecap="round"
              markerEnd="url(#rmh2-arrow)"
            />
          </svg>

          {steps.map((step, i) => {
            const node = NODES[i] ?? NODES[NODES.length - 1];
            const left = `${(node.x / 1000) * 100}%`;
            const top = `${(node.y / 360) * 100}%`;
            return (
              <PinMarker
                key={step.id}
                step={step}
                index={i}
                leftPct={left}
                topPct={top}
                above={node.cardAbove}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

function PinMarker({
  step,
  index,
  leftPct,
  topPct,
  above,
}: {
  step: RoadStep;
  index: number;
  leftPct: string;
  topPct: string;
  above: boolean;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  return (
    <div className="absolute" style={{ left: leftPct, top: topPct }}>
      {/* soft shadow puddle where the pin meets the road */}
      <span className="absolute left-1/2 top-0 h-2 w-7 -translate-x-1/2 rounded-[50%] bg-slate-900/10 blur-[2px]" />

      {/* teardrop pin — tip sits at the anchor (top:0) */}
      <div
        className="rmh2-pin absolute left-1/2 top-0 z-10"
        style={{ animationDelay: `${index * 90}ms` }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white text-white shadow-lg"
          style={{ background: meta.accent, borderRadius: "50% 50% 50% 0", transform: "rotate(45deg)" }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ transform: "rotate(-45deg)" }} />
        </div>
      </div>

      {/* tethered card, above or below the pin tip */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center ${
          above ? "bottom-14" : "top-14"
        }`}
        style={{ width: 172 }}
      >
        {!above && <span className="h-4 w-0.5" style={{ background: meta.ring }} />}
        <div
          className="w-[172px] rounded-xl border bg-white p-3 shadow-sm"
          style={{
            borderColor: step.isNow ? meta.ring : "#e2e8f0",
            borderTopWidth: 3,
            borderTopColor: meta.accent,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ background: meta.soft, color: meta.accent }}
            >
              {meta.label}
            </span>
            <span className="text-[10px] font-medium text-slate-400">{step.yearLabel}</span>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold leading-tight text-slate-800">
            {step.label}
          </h3>
          <p className="text-xs text-slate-500">{step.detail}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
              {step.ageLabel}
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
        {above && <span className="h-4 w-0.5" style={{ background: meta.ring }} />}
      </div>
    </div>
  );
}
