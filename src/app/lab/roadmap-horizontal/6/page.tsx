"use client";

/**
 * Variant 6 — Stepping Stones.
 * Five evenly-spaced circles connected by a single thin hairline running
 * left→right. Each circle holds the step icon with a stage-accent ring; the
 * label + one supporting line sit neatly below. Premium minimal: restrained
 * colour, generous whitespace. The current step gets a calm filled emphasis.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

export default function SteppingStonesVariant() {
  return (
    <LabShell note="Variant 6 — Stepping Stones. Five quiet circles on a single hairline; flip the scenario above to retrace it.">
      {(s) => <Infographic scenario={s} />}
    </LabShell>
  );
}

function Infographic({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <div className="overflow-x-auto pb-6">
      <div className="relative mx-auto min-w-[760px] px-6 py-4">
        {/* single thin hairline behind the circles */}
        <div
          className="pointer-events-none absolute left-6 right-6 top-[44px] h-px bg-slate-200"
          aria-hidden
        />
        <ol className="relative grid grid-cols-5">
          {steps.map((step) => (
            <Stone key={step.id} step={step} />
          ))}
        </ol>
      </div>
    </div>
  );
}

function Stone({ step }: { step: RoadStep }) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  const now = !!step.isNow;

  return (
    <li className="rmh6-stone flex flex-col items-center px-3 text-center">
      {/* circle */}
      <span
        className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white"
        style={{
          boxShadow: now
            ? `0 0 0 2px ${meta.accent}, 0 8px 24px -10px ${meta.ring}`
            : `0 0 0 1px ${meta.ring}`,
        }}
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: now ? meta.accent : meta.soft,
            color: now ? "#fff" : meta.accent,
          }}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>
        {now && (
          <span
            className="absolute -bottom-1.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide shadow-sm"
            style={{ color: meta.accent }}
          >
            <MapPin className="h-2.5 w-2.5" /> You
          </span>
        )}
      </span>

      {/* stage label */}
      <span
        className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: meta.accent }}
      >
        {meta.label}
      </span>

      {/* headline + one supporting line */}
      <h3 className="mt-1.5 text-sm font-bold leading-tight text-slate-800">
        {step.label}
      </h3>
      <p className="mt-1 text-xs leading-snug text-slate-500">{step.detail}</p>

      {/* year + age chip */}
      <span className="mt-3 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
        {step.yearLabel} · {step.ageLabel}
      </span>

      {/* place chip only when present */}
      {step.place && (
        <span className="mt-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
          {step.place}
        </span>
      )}

      <style jsx>{`
        .rmh6-stone {
          opacity: 0;
          animation: rmh6-rise 0.5s ease-out forwards;
        }
        .rmh6-stone:nth-child(1) {
          animation-delay: 0.02s;
        }
        .rmh6-stone:nth-child(2) {
          animation-delay: 0.1s;
        }
        .rmh6-stone:nth-child(3) {
          animation-delay: 0.18s;
        }
        .rmh6-stone:nth-child(4) {
          animation-delay: 0.26s;
        }
        .rmh6-stone:nth-child(5) {
          animation-delay: 0.34s;
        }
        @keyframes rmh6-rise {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rmh6-stone {
            opacity: 1;
            animation: none;
          }
        }
      `}</style>
    </li>
  );
}
