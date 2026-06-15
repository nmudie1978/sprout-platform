"use client";

/**
 * Variant 4 — Milestone Flags.
 * A single straight horizontal progress line across the canvas. The portion up
 * to "you are here" is filled in accent; the rest is a light track. At each of
 * the five milestones a small flag on a pole is planted on the line (stage-
 * coloured), with a compact text-light label card beneath. Clean and calm.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin, Flag as FlagIcon } from "lucide-react";

export default function MilestoneFlagsVariant() {
  return (
    <LabShell note="Variant 4 — Milestone Flags. A straight progress line with a stage-coloured flag at each milestone; the filled portion marks how far you are. Flip the scenario above.">
      {(s) => <Infographic scenario={s} />}
    </LabShell>
  );
}

function Infographic({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  // Fill the line up to (and including) the current "you are here" step.
  const nowIndex = steps.findIndex((s) => s.isNow);
  const lastFilled = nowIndex === -1 ? 0 : nowIndex;
  const denom = Math.max(steps.length - 1, 1);
  const fillPct = (lastFilled / denom) * 100;

  return (
    <>
      <style>{`
        @keyframes rmh4-wave {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2.5deg); }
        }
        @keyframes rmh4-rise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rmh4-flag { transform-origin: bottom left; animation: rmh4-wave 4.5s ease-in-out infinite; }
        .rmh4-card { animation: rmh4-rise 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .rmh4-flag, .rmh4-card { animation: none !important; }
        }
      `}</style>

      <div className="overflow-x-auto pb-4">
        <div className="relative mx-auto min-w-[820px] pt-20">
          {/* The straight progress line */}
          <div className="relative mx-[6%] h-1.5">
            {/* light track */}
            <div className="absolute inset-0 rounded-full bg-slate-200" />
            {/* filled portion (accent) */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
              style={{ width: `${fillPct}%`, background: scenario.accent }}
            />

            {/* Flags + cards, one per milestone, evenly spaced along the line */}
            {steps.map((step, i) => {
              const leftPct = (i / denom) * 100;
              return (
                <Milestone
                  key={step.id}
                  step={step}
                  leftPct={leftPct}
                  reached={i <= lastFilled}
                  delay={i * 0.08}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function Milestone({
  step,
  leftPct,
  reached,
  delay,
}: {
  step: RoadStep;
  leftPct: number;
  reached: boolean;
  delay: number;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;

  return (
    <div
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${leftPct}%` }}
    >
      {/* Flag on a pole, planted on the line */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="relative h-16 w-px">
          {/* pole */}
          <span
            className="absolute bottom-0 left-0 h-16 w-[2px] rounded-full"
            style={{ background: reached ? meta.accent : "#cbd5e1" }}
          />
          {/* flag cloth */}
          <span
            className="rmh4-flag absolute left-[2px] top-0 flex h-6 w-6 items-center justify-center rounded-r-md rounded-bl-sm shadow-sm"
            style={{
              background: reached ? meta.accent : "#e2e8f0",
              color: reached ? "#fff" : "#94a3b8",
            }}
          >
            <FlagIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* node dot on the line */}
      <span
        className="absolute left-1/2 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow"
        style={{ background: reached ? meta.accent : "#cbd5e1" }}
      />

      {/* Label card beneath the flag */}
      <div
        className="rmh4-card absolute left-1/2 top-5 w-[150px] -translate-x-1/2 rounded-xl border bg-white p-3 shadow-sm"
        style={{
          borderColor: step.isNow ? meta.ring : "#e2e8f0",
          borderTopWidth: 3,
          borderTopColor: meta.accent,
          animationDelay: `${delay}s`,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: meta.soft, color: meta.accent }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="text-[10px] font-medium text-slate-400">{step.yearLabel}</span>
        </div>
        <h3 className="mt-2 text-sm font-semibold leading-tight text-slate-800">{step.label}</h3>
        <p className="text-xs leading-snug text-slate-500">{step.detail}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
            style={{ background: meta.soft, color: meta.accent }}
          >
            {meta.label}
          </span>
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
    </div>
  );
}
