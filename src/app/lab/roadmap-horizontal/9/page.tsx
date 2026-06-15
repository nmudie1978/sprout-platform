"use client";

/**
 * Variant 9 — Numbered Track.
 * Five LARGE numerals (01–05) seated on a horizontal connector rail. Each
 * numeral is big and stage-coloured (tinted outline) with a compact text-light
 * label + detail beneath. The current step's numeral gets a subtle filled
 * emphasis. Clean classic step-infographic, left→right.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

export default function NumberedTrackVariant() {
  return (
    <LabShell note="Variant 9 — Numbered Track. Big stage-coloured numerals on a connector rail; flip the scenario above to retell the steps.">
      {(s) => <Infographic scenario={s} />}
    </LabShell>
  );
}

function Infographic({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <div className="overflow-x-auto pb-4">
      <div className="relative min-w-[820px] px-4 pt-2">
        {/* connector rail — sits behind the numerals, centred on their row */}
        <div className="pointer-events-none absolute left-8 right-8 top-[64px] h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

        <ol className="relative grid grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <NumberStep key={step.id} step={step} index={i} />
          ))}
        </ol>
      </div>

      <style>{`
        @keyframes rmh9-rise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rmh9-step { animation: rmh9-rise 0.5s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .rmh9-step { animation: none; }
        }
      `}</style>
    </div>
  );
}

function NumberStep({ step, index }: { step: RoadStep; index: number }) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  const numeral = String(index + 1).padStart(2, "0");
  const now = !!step.isNow;

  return (
    <li
      className="rmh9-step flex flex-col items-center text-center"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* the big numeral — outline by default, filled when current */}
      <div className="relative flex h-32 w-full items-center justify-center">
        <span
          className="select-none text-[68px] font-black leading-none tracking-tight tabular-nums"
          style={
            now
              ? { color: meta.accent }
              : {
                  color: "transparent",
                  WebkitTextStroke: `2px ${meta.ring}`,
                  // graceful fallback for engines without -webkit-text-stroke
                  textShadow: `0 0 0 ${meta.soft}`,
                }
          }
        >
          {numeral}
        </span>

        {/* small icon node anchored on the rail */}
        <span
          className="absolute left-1/2 top-[58px] z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white shadow-sm"
          style={{
            borderColor: now ? meta.accent : meta.ring,
            color: meta.accent,
            background: now ? meta.soft : "#fff",
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>

      {/* text-light label block */}
      <div className="mt-5 flex flex-col items-center gap-1.5 px-1">
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
          style={{ background: meta.soft, color: meta.accent }}
        >
          {meta.label}
        </span>

        <h3 className="text-sm font-bold leading-tight text-slate-800">
          {step.label}
        </h3>
        <p className="text-xs leading-snug text-slate-500">{step.detail}</p>

        <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {step.yearLabel}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {step.ageLabel}
          </span>
          {step.place && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: meta.soft, color: meta.accent }}
            >
              {step.place}
            </span>
          )}
        </div>

        {now && (
          <span
            className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: meta.accent }}
          >
            <MapPin className="h-3 w-3" /> You
          </span>
        )}
      </div>
    </li>
  );
}
