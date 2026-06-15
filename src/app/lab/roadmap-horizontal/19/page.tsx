"use client";

/**
 * Variant 19 — Train Journey.
 * A horizontal railway: two thin rails with sleeper ticks running left→right.
 * Five stage-coloured "carriages" (rounded-rect cars) coupled together by
 * little coupling links, and a friendly locomotive at the right end = the goal
 * (advance). Each carriage = one stage with icon, short label, one-line detail
 * and a year/place chip. Text-light, light theme, scrolls on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin, Train } from "lucide-react";

export default function TrainJourneyVariant() {
  return (
    <LabShell note="Variant 19 — Train Journey. Five coupled carriages roll toward the engine (the goal). Flip the scenario above to re-route the train.">
      {(s) => <Railway scenario={s} />}
    </LabShell>
  );
}

function Railway({ scenario }: { scenario: Scenario }) {
  const { steps, accent } = scenario;
  // The advance step rides in the locomotive; the first four are carriages.
  const carriages = steps.slice(0, 4);
  const engineStep = steps[steps.length - 1];

  return (
    <div className="overflow-x-auto pb-4">
      <style>{`
        @keyframes rmh19-roll { from { transform: translateX(0); } to { transform: translateX(6px); } }
        .rmh19-engine { animation: rmh19-roll 1.6s ease-in-out infinite alternate; }
        .rmh19-puff { animation: rmh19-rise 2.4s ease-in-out infinite; }
        @keyframes rmh19-rise {
          0% { transform: translateY(2px) scale(0.85); opacity: 0; }
          30% { opacity: 0.7; }
          100% { transform: translateY(-14px) scale(1.15); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rmh19-engine, .rmh19-puff { animation: none !important; }
        }
      `}</style>

      <div className="relative min-w-[900px] pt-8">
        {/* The train: carriages + couplings + locomotive, sitting on the rails */}
        <div className="relative z-10 flex items-end gap-0 px-2">
          {carriages.map((step, i) => (
            <div key={step.id} className="flex items-end">
              <Carriage step={step} index={i} />
              <Coupling />
            </div>
          ))}
          <Locomotive step={engineStep} accent={accent} />
        </div>

        {/* Rails + sleepers under the train */}
        <Rails />
      </div>
    </div>
  );
}

function Carriage({ step, index }: { step: RoadStep; index: number }) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  return (
    <div className="relative flex flex-col items-center" style={{ width: 196 }}>
      {/* car number badge */}
      <span
        className="mb-2 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
        style={{ background: meta.accent }}
      >
        {index + 1}
      </span>

      {/* the carriage body */}
      <div
        className="w-full rounded-2xl border bg-white p-3.5 shadow-sm"
        style={{
          borderColor: step.isNow ? meta.ring : "#e2e8f0",
          borderTopWidth: 4,
          borderTopColor: meta.accent,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: meta.soft, color: meta.accent }}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span className="text-[10px] font-medium text-slate-400">{step.ageLabel} yrs</span>
        </div>

        <h3 className="mt-2.5 text-sm font-semibold leading-tight text-slate-800">{step.label}</h3>
        <p className="text-xs leading-snug text-slate-500">{step.detail}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
            style={{ background: meta.soft, color: meta.accent }}
          >
            {step.yearLabel}
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

      {/* two wheels under the carriage */}
      <div className="mt-1 flex w-2/3 justify-between px-3">
        <Wheel />
        <Wheel />
      </div>
    </div>
  );
}

function Coupling() {
  return (
    <div className="mb-7 flex shrink-0 items-center" style={{ width: 22 }}>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-slate-300 bg-white" />
      <span className="h-0.5 flex-1 bg-slate-300" />
      <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-slate-300 bg-white" />
    </div>
  );
}

function Locomotive({ step, accent }: { step: RoadStep; accent: string }) {
  const meta = STAGE_META[step.stage];
  return (
    <div className="rmh19-engine relative flex flex-col items-center" style={{ width: 216 }}>
      {/* smoke puffs */}
      <div className="pointer-events-none absolute -top-3 left-7 flex gap-1">
        <span className="rmh19-puff h-2 w-2 rounded-full bg-slate-300" style={{ animationDelay: "0s" }} />
        <span className="rmh19-puff h-2.5 w-2.5 rounded-full bg-slate-200" style={{ animationDelay: "0.8s" }} />
        <span className="rmh19-puff h-1.5 w-1.5 rounded-full bg-slate-300" style={{ animationDelay: "1.4s" }} />
      </div>

      <span
        className="mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
        style={{ background: accent }}
      >
        Destination
      </span>

      {/* the engine body */}
      <div
        className="w-full rounded-2xl border bg-white p-3.5 text-white shadow-md"
        style={{ background: accent, borderColor: accent }}
      >
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Train className="h-5 w-5" />
          </span>
          <span className="text-[10px] font-medium text-white/80">{step.yearLabel}</span>
        </div>

        <h3 className="mt-2.5 text-sm font-bold leading-tight">{step.label}</h3>
        <p className="text-xs leading-snug text-white/85">{step.detail}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
            {meta.label}
          </span>
          {step.place && (
            <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-medium text-white/85">
              {step.place}
            </span>
          )}
        </div>
      </div>

      {/* engine wheels — one large driver + a small one */}
      <div className="mt-1 flex w-3/4 items-center justify-between px-3">
        <Wheel large />
        <Wheel />
        <Wheel />
      </div>
    </div>
  );
}

function Wheel({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`block rounded-full border-2 border-slate-300 bg-white ${large ? "h-5 w-5" : "h-3.5 w-3.5"}`}
    />
  );
}

function Rails() {
  // Two thin rails with evenly-spaced sleeper ticks running the full width.
  return (
    <div className="relative -mt-2 h-7 w-full" aria-hidden>
      {/* sleepers */}
      <div className="absolute inset-x-2 top-1 flex justify-between">
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={i} className="h-5 w-1 rounded-sm bg-slate-200" />
        ))}
      </div>
      {/* two rails */}
      <span className="absolute inset-x-0 top-1.5 h-[3px] rounded-full bg-slate-300" />
      <span className="absolute inset-x-0 top-4 h-[3px] rounded-full bg-slate-300" />
    </div>
  );
}
