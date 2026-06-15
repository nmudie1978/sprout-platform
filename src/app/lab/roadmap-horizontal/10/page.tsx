"use client";

/**
 * Variant 10 — Signposts.
 * A calm horizon/baseline runs left→right; five roadside signposts stand on it.
 * Each post carries one or two arrow-shaped direction boards pointing right
 * (stage-coloured), bearing the step icon + short label, with a one-line detail
 * and a year/place chip near the post. Evokes a journey down a road past
 * directional signs. Text-light, light theme, scrolls horizontally on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

export default function SignpostsVariant() {
  return (
    <LabShell note="Variant 10 — Signposts. Roadside direction boards along a calm horizon — flip the scenario above to re-sign the route.">
      {(s) => <Infographic scenario={s} />}
    </LabShell>
  );
}

function Infographic({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <div className="overflow-x-auto pb-4">
      <style>{`
        @keyframes rmh10-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-0.6deg); }
        }
        @keyframes rmh10-roll {
          to { stroke-dashoffset: -44; }
        }
        .rmh10-board { transform-origin: bottom center; }
        @media (prefers-reduced-motion: no-preference) {
          .rmh10-board { animation: rmh10-sway 6s ease-in-out infinite; }
          .rmh10-lane { animation: rmh10-roll 2.6s linear infinite; }
        }
      `}</style>

      <div className="relative mx-auto min-w-[860px]">
        {/* horizon / road baseline */}
        <svg
          viewBox="0 0 1000 60"
          preserveAspectRatio="none"
          className="absolute bottom-[64px] left-0 h-[60px] w-full"
          aria-hidden
        >
          {/* soft road band */}
          <rect x="0" y="20" width="1000" height="26" rx="13" fill="#f1f5f9" />
          <rect x="0" y="20" width="1000" height="26" rx="13" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          {/* dashed centre lane, gently rolling */}
          <line
            className="rmh10-lane"
            x1="10"
            y1="33"
            x2="990"
            y2="33"
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeDasharray="20 24"
            strokeLinecap="round"
          />
        </svg>

        {/* the five signposts standing on the baseline */}
        <div className="relative grid grid-cols-5 items-end gap-3 pb-[64px]">
          {steps.map((step, i) => (
            <Signpost key={step.id} step={step} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Signpost({ step, index }: { step: RoadStep; index: number }) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;

  // Alternate post height a touch so the row of signs reads playfully.
  const postHeight = index % 2 === 0 ? 150 : 120;

  return (
    <div className="flex flex-col items-center justify-end">
      {/* direction board(s) — arrow shapes pointing right */}
      <div
        className="rmh10-board relative w-full max-w-[176px]"
        style={{ animationDelay: `${index * 0.5}s` }}
      >
        {/* main board */}
        <div
          className="relative w-full rounded-l-xl bg-white py-2.5 pl-3 pr-5 shadow-sm"
          style={{
            border: `1px solid ${step.isNow ? meta.ring : "#e2e8f0"}`,
            borderLeftWidth: 4,
            borderLeftColor: meta.accent,
            // arrowhead pointing right
            clipPath:
              "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: meta.soft, color: meta.accent }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-tight text-slate-800">
                {step.label}
              </h3>
              <span
                className="text-[9px] font-semibold uppercase tracking-wide"
                style={{ color: meta.accent }}
              >
                {meta.label}
              </span>
            </div>
          </div>
        </div>

        {/* secondary smaller board (detail) — a second arrow plank */}
        <div
          className="relative mt-1 w-[88%] rounded-l-md bg-white py-1.5 pl-3 pr-5 shadow-sm"
          style={{
            border: "1px solid #e2e8f0",
            borderLeftWidth: 3,
            borderLeftColor: meta.ring,
            clipPath:
              "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
          }}
        >
          <p className="truncate text-[11px] text-slate-500">{step.detail}</p>
        </div>
      </div>

      {/* the post */}
      <div className="relative mt-1 flex flex-col items-center" style={{ height: postHeight }}>
        <span
          className="w-[3px] flex-1 rounded-full"
          style={{ background: `linear-gradient(to bottom, ${meta.ring}, #cbd5e1)` }}
        />
        {/* foot collar where the post meets the road */}
        <span
          className="h-2.5 w-2.5 rounded-full border-2 border-white shadow"
          style={{ background: meta.accent }}
        />
      </div>

      {/* chips below the road: year / place / "You" */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1">
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
        {step.isNow && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: meta.accent }}
          >
            <MapPin className="h-3 w-3" /> You
          </span>
        )}
      </div>
    </div>
  );
}
