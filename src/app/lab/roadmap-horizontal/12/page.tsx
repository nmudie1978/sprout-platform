"use client";

/**
 * Variant 12 — Year Axis.
 * A real horizontal time axis: a baseline with year ticks spanning the
 * scenario, and each of the five stages laid out as a small marker + bar
 * sitting on the axis. This conveys WHEN things happen and that study spans
 * years — gantt-lite, calm and text-light. Scrolls horizontally on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

/**
 * Defensively pull the LAST four-digit year out of a yearLabel like
 * "now → 2028", "2028–31", "2031" or "2035". Falls back to undefined if no
 * full year can be read (callers then lay steps out evenly).
 */
function lastYear(label: string): number | undefined {
  const matches = label.match(/\d{4}/g);
  if (!matches || matches.length === 0) return undefined;
  const n = Number(matches[matches.length - 1]);
  return Number.isFinite(n) ? n : undefined;
}

/** First four-digit year, used to start a span. */
function firstYear(label: string): number | undefined {
  const matches = label.match(/\d{4}/g);
  if (!matches || matches.length === 0) return undefined;
  const n = Number(matches[0]);
  return Number.isFinite(n) ? n : undefined;
}

interface Placed {
  step: RoadStep;
  startYear: number;
  endYear: number;
}

/**
 * Build a defensive year range + per-step start/end years. If exact parsing
 * is fragile we fall back to laying the five steps out evenly across a sane
 * default window — correctness over precision, never crash.
 */
function buildTimeline(scenario: Scenario): {
  min: number;
  max: number;
  ticks: number[];
  placed: Placed[];
} {
  const steps = scenario.steps;
  const startBase = scenario.current?.finishYear
    ? scenario.current.finishYear - 3
    : new Date().getFullYear();

  // Try to read each step's end year; track running cursor for missing ones.
  const ends: number[] = [];
  let cursor = startBase;
  for (const step of steps) {
    const end = lastYear(step.yearLabel);
    if (end !== undefined) {
      cursor = end;
    } else {
      cursor = cursor + 2; // gentle advance when unparsable
    }
    ends.push(cursor);
  }

  let min = Math.min(startBase, ...ends);
  let max = Math.max(...ends);
  // Guard against a degenerate (zero-width) range.
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    min = startBase;
    max = startBase + steps.length * 2;
  }
  // Pad the right edge a touch so the final marker breathes.
  max = max + 1;

  const placed: Placed[] = steps.map((step, i) => {
    const parsedEnd = lastYear(step.yearLabel);
    const parsedStart = firstYear(step.yearLabel);
    const fallbackEnd =
      min + Math.round(((i + 1) / steps.length) * (max - min));
    const fallbackStart =
      min + Math.round((i / steps.length) * (max - min));
    const endYear = parsedEnd ?? fallbackEnd;
    let startYear = parsedStart ?? fallbackStart;
    // If a step has a single year (start === end) treat it as a point,
    // but give it a hair of width so its bar is visible.
    if (startYear > endYear) startYear = endYear;
    return { step, startYear, endYear };
  });

  // Build whole-year ticks across the span (cap density for very long spans).
  const span = max - min;
  const stride = span > 16 ? 2 : 1;
  const ticks: number[] = [];
  for (let y = min; y <= max; y += stride) ticks.push(y);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);

  return { min, max, ticks, placed };
}

export default function YearAxisVariant() {
  return (
    <LabShell note="Variant 12 — Year Axis. Stages sit on a real year timeline, so you can see when each step happens and how long study lasts.">
      {(s) => <Timeline scenario={s} />}
    </LabShell>
  );
}

function Timeline({ scenario }: { scenario: Scenario }) {
  const { min, max, ticks, placed } = buildTimeline(scenario);
  const span = max - min || 1;

  const pct = (year: number) => ((year - min) / span) * 100;

  // Alternate cards above / below the axis so labels never collide.
  return (
    <div className="overflow-x-auto pb-4">
      <div className="relative min-w-[880px] px-6">
        {/* upper card lane */}
        <div className="relative h-[150px]">
          {placed.map((p, i) =>
            i % 2 === 0 ? (
              <StepCard
                key={p.step.id}
                placed={p}
                leftPct={pct(p.endYear)}
                above
              />
            ) : null,
          )}
        </div>

        {/* the axis */}
        <div className="relative h-[88px]">
          {/* baseline */}
          <div className="absolute left-0 right-0 top-[20px] h-[3px] rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
          {/* arrowhead at the end of time */}
          <div
            className="absolute top-[20px] -translate-y-1/2 translate-x-1"
            style={{ left: "100%" }}
          >
            <div
              className="h-0 w-0"
              style={{
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
                borderLeft: "8px solid #cbd5e1",
              }}
            />
          </div>

          {/* year ticks */}
          {ticks.map((y) => (
            <div
              key={y}
              className="absolute top-[14px] flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${pct(y)}%` }}
            >
              <span className="h-2.5 w-px bg-slate-300" />
              <span className="mt-1 text-[10px] font-medium tabular-nums text-slate-400">
                {y}
              </span>
            </div>
          ))}

          {/* stage bars + markers sitting on the axis */}
          {placed.map((p) => (
            <AxisBar
              key={`bar-${p.step.id}`}
              placed={p}
              leftPct={pct(p.startYear)}
              rightPct={pct(p.endYear)}
            />
          ))}
        </div>

        {/* lower card lane */}
        <div className="relative h-[150px]">
          {placed.map((p, i) =>
            i % 2 === 1 ? (
              <StepCard
                key={p.step.id}
                placed={p}
                leftPct={pct(p.endYear)}
                above={false}
              />
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

/** The coloured span bar + dot that lives directly on the axis baseline. */
function AxisBar({
  placed,
  leftPct,
  rightPct,
}: {
  placed: Placed;
  leftPct: number;
  rightPct: number;
}) {
  const meta = STAGE_META[placed.step.stage];
  const width = Math.max(rightPct - leftPct, 0);
  const hasSpan = width > 1.2;
  return (
    <>
      {/* span bar (only when the stage actually spans years) */}
      {hasSpan && (
        <div
          className="absolute top-[20px] h-[7px] -translate-y-1/2 rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{
            left: `${leftPct}%`,
            width: `${width}%`,
            background: meta.accent,
            opacity: 0.85,
          }}
        />
      )}
      {/* endpoint marker (the "when it completes" dot) */}
      <span
        className="absolute top-[20px] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow"
        style={{ left: `${rightPct}%`, background: meta.accent }}
      />
    </>
  );
}

/** Text-light label card connected to the axis by a thin stem. */
function StepCard({
  placed,
  leftPct,
  above,
}: {
  placed: Placed;
  leftPct: number;
  above: boolean;
}) {
  const { step } = placed;
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  return (
    <div
      className={`absolute -translate-x-1/2 flex flex-col items-center ${
        above ? "bottom-0" : "top-0"
      }`}
      style={{ left: `${leftPct}%`, width: 176 }}
    >
      {/* below-axis card: stem first */}
      {!above && <span className="h-4 w-px" style={{ background: meta.ring }} />}

      <div
        className="w-[176px] rounded-xl border bg-white p-3 shadow-sm"
        style={{
          borderColor: step.isNow ? meta.ring : "#e2e8f0",
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
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
            style={{ background: meta.soft, color: meta.accent }}
          >
            {step.yearLabel}
          </span>
        </div>

        <h3 className="mt-2 text-sm font-semibold leading-tight text-slate-800">
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

      {/* above-axis card: stem last */}
      {above && <span className="h-4 w-px" style={{ background: meta.ring }} />}
    </div>
  );
}
