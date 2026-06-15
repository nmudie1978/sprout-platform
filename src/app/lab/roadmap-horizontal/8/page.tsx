"use client";

/**
 * Variant 8 — Metro Line.
 * A subway/transit-map style line running left→right. Each segment between two
 * stations takes the colour of the stage it *leads into*. Every step is a
 * station (white circle with a thick stage-accent ring); the current step is an
 * "interchange" double-ring, and the final advance step is a larger terminus.
 * Station-name labels (label + detail) sit beneath each station. Text-light.
 * Scrolls horizontally on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

export default function MetroLineVariant() {
  return (
    <LabShell note="Variant 8 — Metro Line. Each segment is coloured by the stage it leads into; the terminus is the goal. Flip the scenario above to re-route the line.">
      {(s) => <Metro scenario={s} />}
    </LabShell>
  );
}

function Metro({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  const n = steps.length;
  // Evenly space stations across the usable width.
  const stationPct = (i: number) => `${8 + (i / (n - 1)) * 84}%`;

  return (
    <>
      <style>{`
        @keyframes rmh8-draw { from { stroke-dashoffset: 1100; } to { stroke-dashoffset: 0; } }
        @keyframes rmh8-pulse { 0%,100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.18); opacity: .45; } }
        .rmh8-line { stroke-dasharray: 1100; animation: rmh8-draw 1.4s ease-out forwards; }
        .rmh8-now { animation: rmh8-pulse 2.6s ease-in-out infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .rmh8-line { animation: none; stroke-dasharray: none; stroke-dashoffset: 0; }
          .rmh8-now { animation: none; }
        }
      `}</style>

      <div className="overflow-x-auto pb-4">
        <div className="relative mx-auto h-[320px] min-w-[860px]">
          {/* The metro line itself, drawn as stage-coloured segments. */}
          <svg
            viewBox="0 0 1000 120"
            className="absolute inset-x-0 top-[120px] h-[120px] w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            {/* faint base track under everything */}
            <line
              x1="60"
              y1="60"
              x2="940"
              y2="60"
              stroke="#e2e8f0"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {steps.slice(0, -1).map((_, i) => {
              // Segment i goes from station i → station i+1; colour = stage it leads into.
              const next = STAGE_META[steps[i + 1].stage];
              const x1 = 60 + (i / (n - 1)) * 880;
              const x2 = 60 + ((i + 1) / (n - 1)) * 880;
              return (
                <line
                  key={`seg-${i}`}
                  className="rmh8-line"
                  x1={x1}
                  y1="60"
                  x2={x2}
                  y2="60"
                  stroke={next.accent}
                  strokeWidth="9"
                  strokeLinecap="round"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              );
            })}
          </svg>

          {/* Stations + labels. */}
          {steps.map((step, i) => (
            <Station
              key={step.id}
              step={step}
              leftPct={stationPct(i)}
              terminus={i === n - 1}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function Station({
  step,
  leftPct,
  terminus,
}: {
  step: RoadStep;
  leftPct: string;
  terminus: boolean;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  const size = terminus ? 30 : 22;

  return (
    <div
      className="absolute flex -translate-x-1/2 flex-col items-center"
      // top:120px aligns this with the SVG centre line (y=60 of a 120px box).
      style={{ left: leftPct, top: 120 }}
    >
      {/* "You" cue floating above the current station */}
      {step.isNow && (
        <span
          className="absolute -top-7 inline-flex items-center gap-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: meta.accent }}
        >
          <MapPin className="h-3 w-3" /> You
        </span>
      )}

      {/* The station marker (centred on the line). */}
      <span
        className="relative -translate-y-1/2"
        style={{ height: size, width: size }}
      >
        {/* interchange pulse halo for the current step */}
        {step.isNow && (
          <span
            className="rmh8-now absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 0 6px ${meta.ring}` }}
          />
        )}
        <span
          className="absolute inset-0 flex items-center justify-center rounded-full bg-white shadow-sm"
          style={{
            border: `${terminus ? 6 : 5}px solid ${meta.accent}`,
            // interchange = second inner ring
            boxShadow: step.isNow
              ? `inset 0 0 0 3px #fff, inset 0 0 0 5px ${meta.ring}`
              : undefined,
          }}
        >
          {terminus && (
            <Icon className="h-3.5 w-3.5" style={{ color: meta.accent }} />
          )}
        </span>
      </span>

      {/* Station name plate. */}
      <div
        className="mt-3 w-[150px] rounded-xl border bg-white px-3 py-2.5 text-center shadow-sm"
        style={{
          borderColor: step.isNow ? meta.ring : "#e2e8f0",
          borderTopWidth: 3,
          borderTopColor: meta.accent,
        }}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: meta.soft, color: meta.accent }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
            style={{ background: meta.soft, color: meta.accent }}
          >
            {meta.label}
          </span>
        </div>
        <h3 className="mt-1.5 text-sm font-semibold leading-tight text-slate-800">
          {step.label}
        </h3>
        <p className="text-xs leading-snug text-slate-500">{step.detail}</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
            {step.yearLabel} · {step.ageLabel}
          </span>
          {step.place && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
              style={{ background: meta.soft, color: meta.accent }}
            >
              {step.place}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
