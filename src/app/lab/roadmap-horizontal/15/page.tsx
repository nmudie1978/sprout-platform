"use client";

/**
 * Variant 15 — Progress Bar.
 * One elegant rounded horizontal progress bar (a light track) with five labelled
 * stops along it. The track is filled in accent up to the current step
 * ("you are here"), and each stop carries a small pop card: icon + bold label +
 * one supporting line + a year chip. Refined multi-step wizard feel — calm,
 * confident, never gamified. Text-light, light theme, left→right.
 */

import { Fragment } from "react";
import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

export default function ProgressBarVariant() {
  return (
    <LabShell note="Variant 15 — Progress Bar. One refined track with five stops; the fill reaches where you are today. Flip the scenario above to refill the same bar for another career.">
      {(s) => <Infographic scenario={s} />}
    </LabShell>
  );
}

function Infographic({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  // The bar is "filled" up to (and including) the current step. If none is the
  // current position, fall back to the first stop so the fill is never empty.
  const nowIndex = Math.max(
    0,
    steps.findIndex((st) => st.isNow),
  );
  const last = Math.max(steps.length - 1, 1);
  // Stops sit at evenly spaced centres; pad the ends so cards have room.
  const centre = (i: number) => 6 + (i / last) * 88; // percent
  const fillPct = centre(nowIndex);

  return (
    <Fragment>
      <div className="overflow-x-auto pb-4">
        <div className="relative mx-auto min-w-[820px] px-4 py-6">
          {/* ── The bar ───────────────────────────────────────────── */}
          <div className="relative h-3.5">
            {/* light track */}
            <div className="absolute inset-x-0 top-1/2 h-3.5 -translate-y-1/2 rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70" />
            {/* accent fill up to "you are here" */}
            <div
              className="rmh15-fill absolute left-0 top-1/2 h-3.5 -translate-y-1/2 rounded-full"
              style={{
                width: `${fillPct}%`,
                background: `linear-gradient(90deg, ${STAGE_META[steps[0].stage].accent}, ${STAGE_META[steps[nowIndex].stage].accent})`,
              }}
            />
            {/* the stop dots */}
            {steps.map((step, i) => {
              const meta = STAGE_META[step.stage];
              const reached = i <= nowIndex;
              return (
                <span
                  key={step.id}
                  className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${centre(i)}%` }}
                >
                  <span
                    className="block h-5 w-5 rounded-full border-[3px] border-white shadow-sm transition"
                    style={{
                      background: reached ? meta.accent : "#fff",
                      boxShadow: reached
                        ? `0 0 0 2px ${meta.ring}`
                        : "0 0 0 2px #e2e8f0",
                    }}
                  />
                </span>
              );
            })}
          </div>

          {/* ── Pop label cards under each stop ───────────────────── */}
          <div className="relative mt-7 h-[176px]">
            {steps.map((step, i) => (
              <StopCard
                key={step.id}
                step={step}
                leftPct={centre(i)}
                first={i === 0}
                last={i === steps.length - 1}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .rmh15-fill { animation: rmh15-grow 760ms cubic-bezier(.22,.8,.3,1) both; }
        .rmh15-card { animation: rmh15-rise 520ms cubic-bezier(.22,.8,.3,1) both; }
        @keyframes rmh15-grow {
          from { transform: translateY(-50%) scaleX(0); transform-origin: left; }
          to   { transform: translateY(-50%) scaleX(1); transform-origin: left; }
        }
        @keyframes rmh15-rise {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rmh15-fill, .rmh15-card { animation: none !important; }
        }
      `}</style>
    </Fragment>
  );
}

function StopCard({
  step,
  leftPct,
  first,
  last,
  index,
}: {
  step: RoadStep;
  leftPct: number;
  first: boolean;
  last: boolean;
  index: number;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  // Keep the end cards from clipping by anchoring their edge, not their centre.
  const anchor = first
    ? { left: 0, transform: "translateX(0)" as const }
    : last
      ? { left: leftPct, transform: "translateX(-100%)" as const }
      : { left: `${leftPct}%`, transform: "translateX(-50%)" as const };

  return (
    <div
      className="rmh15-card absolute top-0"
      style={{
        ...(first ? { left: 0 } : { left: typeof anchor.left === "number" ? `${anchor.left}%` : anchor.left }),
        transform: anchor.transform,
        width: 168,
        animationDelay: `${120 + index * 90}ms`,
      }}
    >
      {/* little connector tick from the bar down to the card */}
      <span
        className="mx-auto mb-2 block h-3 w-px"
        style={{
          background: meta.ring,
          marginLeft: first ? 10 : last ? "auto" : "auto",
          marginRight: first ? "auto" : last ? 10 : "auto",
        }}
      />
      <div
        className="rounded-2xl border bg-white p-3 shadow-sm"
        style={{
          borderColor: step.isNow ? meta.ring : "#e8edf3",
          borderTopWidth: 3,
          borderTopColor: meta.accent,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: meta.soft, color: meta.accent }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-inset ring-slate-100">
            {step.yearLabel}
          </span>
        </div>

        <h3 className="mt-2 text-sm font-semibold leading-tight text-slate-800">
          {step.label}
        </h3>
        <p className="mt-0.5 text-xs leading-snug text-slate-500">{step.detail}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
            style={{ background: meta.soft, color: meta.accent }}
          >
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
