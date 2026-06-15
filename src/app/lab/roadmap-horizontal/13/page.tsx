"use client";

/**
 * Variant 13 — Boarding Pass.
 * The journey styled as a travel boarding-pass / ticket strip: one long
 * horizontal card split into five perforated sections by dashed vertical
 * dividers with little notch circles at the seams (tear-off ticket feel).
 * Each section is a stage with icon, short label, one-line detail and a
 * gate/seat-style year code. The right-most stub is the destination
 * (employer · city). Playful but elegant, light, colour-accented per stage.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin, PlaneTakeoff } from "lucide-react";

export default function BoardingPassVariant() {
  return (
    <LabShell note="Variant 13 — Boarding Pass. A tear-off ticket strip — flip the scenario above to reissue the pass for a different career.">
      {(s) => <Ticket scenario={s} />}
    </LabShell>
  );
}

function Ticket({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <div className="overflow-x-auto pb-4">
      <style>{`
        @keyframes rmh13-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes rmh13-fly { 0% { transform: translateX(0) translateY(0); } 50% { transform: translateX(3px) translateY(-2px); } 100% { transform: translateX(0) translateY(0); } }
        .rmh13-section { animation: rmh13-rise .5s ease-out both; }
        .rmh13-plane { animation: rmh13-fly 3.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rmh13-section, .rmh13-plane { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto min-w-[900px]">
        {/* Airline-style header above the pass */}
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
            <PlaneTakeoff
              className="rmh13-plane h-4 w-4"
              style={{ color: scenario.accent }}
            />
            Boarding Pass
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Passenger · You · Bound for {scenario.role}
          </span>
        </div>

        {/* The ticket strip */}
        <div className="relative flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)]">
          {/* coloured accent rail along the top */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex h-1.5">
            {steps.map((step) => (
              <span
                key={step.id}
                className="flex-1"
                style={{ background: STAGE_META[step.stage].accent }}
              />
            ))}
          </div>

          {steps.map((step, i) => (
            <Section
              key={step.id}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
              scenario={scenario}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({
  step,
  index,
  isLast,
  scenario,
}: {
  step: RoadStep;
  index: number;
  isLast: boolean;
  scenario: Scenario;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;

  // The right-most section is the destination "stub": softly tinted.
  const stub = isLast;

  return (
    <div
      className="rmh13-section relative flex-1 px-5 py-6"
      style={{
        animationDelay: `${index * 90}ms`,
        background: stub ? meta.soft : "#fff",
      }}
    >
      {/* Perforated seam between sections: dashed divider + notch circles */}
      {!isLast && (
        <>
          <span className="pointer-events-none absolute right-0 top-3 bottom-3 border-r border-dashed border-slate-300" />
          {/* top notch */}
          <span className="pointer-events-none absolute -right-2 -top-2 h-4 w-4 rounded-full border border-slate-200 bg-slate-50" />
          {/* bottom notch */}
          <span className="pointer-events-none absolute -right-2 -bottom-2 h-4 w-4 rounded-full border border-slate-200 bg-slate-50" />
        </>
      )}

      {/* Section header: gate code + stage label */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {stub ? "Destination" : `Stage ${index + 1}`}
        </span>
        <span
          className="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider"
          style={{ background: meta.soft, color: meta.accent }}
        >
          {step.yearLabel}
        </span>
      </div>

      {/* Icon */}
      <span
        className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: meta.soft, color: meta.accent }}
      >
        <Icon className="h-5 w-5" />
      </span>

      {/* Label + detail */}
      <h3 className="mt-3 text-sm font-bold leading-tight text-slate-800">
        {step.label}
      </h3>
      <p className="mt-0.5 text-xs leading-snug text-slate-500">{step.detail}</p>

      {/* Footer chips: stage label, place, age, you-cue */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
          style={{ background: meta.soft, color: meta.accent }}
        >
          {meta.label}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500">
          {step.ageLabel}
        </span>
        {step.place && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500">
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

      {/* Destination gate/seat line — only on the stub */}
      {stub && (
        <div className="mt-4 border-t border-dashed border-slate-300 pt-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Gate · {scenario.employer}
          </p>
          <p className="font-mono text-sm font-bold" style={{ color: meta.accent }}>
            {scenario.city}
          </p>
        </div>
      )}
    </div>
  );
}
