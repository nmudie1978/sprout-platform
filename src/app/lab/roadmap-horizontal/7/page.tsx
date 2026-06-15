"use client";

/**
 * Variant 7 — Ascending Arrow.
 * Five step-cards climb UP and to the RIGHT — each higher than the last — joined
 * by short angled risers in the stage accent, like a staircase rising rightward.
 * The journey resolves into an arrowhead / goal flag at the top-right, where the
 * final "advance" step is celebrated subtly. Text-light. Scrolls on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin, Flag } from "lucide-react";

export default function AscendingArrowVariant() {
  return (
    <LabShell note="Variant 7 — Ascending Arrow. Each step climbs higher toward the goal — flip the scenario above to see the same ascent retell a different career.">
      {(s) => <Ascent scenario={s} />}
    </LabShell>
  );
}

function Ascent({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  const last = steps.length - 1;
  // Each step sits progressively higher (larger bottom offset, in px).
  const RISE = 56;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="relative min-w-[840px]">
        {/* The rising row of step-cards + risers */}
        <div className="relative flex items-end gap-3 px-2 pb-4 pt-2 md:gap-5">
          {steps.map((step, i) => {
            const meta = STAGE_META[step.stage];
            const Icon = ICONS[step.icon] ?? ICONS.Target;
            const bottom = i * RISE;
            const isGoal = i === last;
            return (
              <div
                key={step.id}
                className="rmh7-rise relative flex flex-1 flex-col"
                style={{ marginBottom: bottom, ["--d" as string]: `${i * 90}ms` }}
              >
                {/* angled riser to the next (higher) step */}
                {i < last && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 bottom-3 z-0 hidden h-[2px] origin-left md:block md:-right-5"
                    style={{
                      width: 28,
                      background: meta.accent,
                      transform: `rotate(-${Math.min(38, 24 + i * 3)}deg)`,
                      opacity: 0.55,
                    }}
                  />
                )}

                {/* goal flag floating above the final card */}
                {isGoal && (
                  <span
                    className="absolute -top-7 right-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow"
                    style={{ background: meta.accent }}
                  >
                    <Flag className="h-3 w-3" /> Goal
                  </span>
                )}

                <article
                  className="relative z-[1] rounded-2xl border bg-white p-3.5 shadow-sm transition md:p-4"
                  style={{
                    borderColor: step.isNow || isGoal ? meta.ring : "#e2e8f0",
                    borderTopWidth: 3,
                    borderTopColor: meta.accent,
                    boxShadow: isGoal
                      ? `0 10px 30px -12px ${meta.ring}, 0 1px 2px rgba(15,23,42,.06)`
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: meta.soft, color: meta.accent }}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {step.yearLabel}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-sm font-semibold leading-tight text-slate-800">
                    {step.label}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{step.detail}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-1">
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
                </article>

                {/* step number under the card foot */}
                <span className="mt-1.5 text-center text-[10px] font-semibold text-slate-300">
                  {i + 1} / {steps.length}
                </span>
              </div>
            );
          })}
        </div>

        {/* big ascending arrow underlay (decorative, up-and-right) */}
        <svg
          viewBox="0 0 1000 240"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 h-[240px] w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <marker
              id="rmh7-head"
              markerWidth="10"
              markerHeight="10"
              refX="6"
              refY="5"
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10 z" fill="#cbd5e1" />
            </marker>
          </defs>
          <line
            x1="30"
            y1="215"
            x2="965"
            y2="35"
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeDasharray="9 11"
            strokeLinecap="round"
            markerEnd="url(#rmh7-head)"
          />
        </svg>
      </div>

      <style>{`
        .rmh7-rise {
          animation: rmh7-pop 460ms cubic-bezier(.22,1,.36,1) both;
          animation-delay: var(--d, 0ms);
        }
        @keyframes rmh7-pop {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rmh7-rise { animation: none; }
        }
      `}</style>
    </div>
  );
}
