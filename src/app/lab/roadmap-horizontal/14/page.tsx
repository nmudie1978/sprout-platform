"use client";

/**
 * Variant 14 — Hexagon Chain.
 * Five hexagons (CSS clip-path) linked in a gentle horizontal comb, raised /
 * lowered slightly to read as a honeycomb strip. Each hex is stage-tinted with
 * the step icon + bold label inside; a one-line detail and year/place chip sit
 * just beneath. Short accent links bridge each pair. Text-light, scrolls on
 * mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

const HEX_CLIP = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

export default function HexagonChainVariant() {
  return (
    <LabShell note="Variant 14 — Hexagon Chain. Five linked hexagons in a comb — flip the scenario above to retell the same chain for another career.">
      {(s) => <Infographic scenario={s} />}
    </LabShell>
  );
}

function Infographic({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <div className="overflow-x-auto pb-4">
      <style>{`
        @keyframes rmh14-pop { from { opacity: 0; transform: translateY(8px) scale(.96); } to { opacity: 1; transform: none; } }
        .rmh14-hex { animation: rmh14-pop .5s cubic-bezier(.2,.7,.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .rmh14-hex { animation: none; }
        }
      `}</style>
      <div className="mx-auto flex min-w-[840px] items-start justify-center gap-0 px-2">
        {steps.map((step, i) => (
          <HexCell
            key={step.id}
            step={step}
            index={i}
            raised={i % 2 === 0}
            last={i === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function HexCell({
  step,
  index,
  raised,
  last,
}: {
  step: RoadStep;
  index: number;
  raised: boolean;
  last: boolean;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  return (
    <div className="flex flex-col items-center" style={{ marginTop: raised ? 0 : 36 }}>
      <div className="flex items-center">
        {/* Hexagon tile */}
        <div
          className="rmh14-hex relative flex h-[150px] w-[164px] flex-col items-center justify-center px-5 text-center"
          style={{
            clipPath: HEX_CLIP,
            background: meta.soft,
            boxShadow: `inset 0 0 0 2px ${step.isNow ? meta.accent : meta.ring}`,
            animationDelay: `${index * 90}ms`,
          }}
        >
          {/* stage badge at the top of the hex */}
          <span
            className="absolute top-[18px] rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest"
            style={{ background: meta.accent, color: "#fff" }}
          >
            {meta.label}
          </span>
          <span
            className="mt-3 flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: meta.accent, color: "#fff" }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <h3
            className="mt-1.5 text-[13px] font-bold leading-tight"
            style={{ color: meta.accent }}
          >
            {step.label}
          </h3>
        </div>

        {/* accent link to the next hex */}
        {!last && (
          <span
            className="h-[3px] w-7 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${meta.accent}, ${meta.ring})`,
            }}
            aria-hidden
          />
        )}
      </div>

      {/* detail + chips under the hex */}
      <div className="mt-2 w-[164px] text-center">
        <p className="text-[11px] leading-snug text-slate-500">{step.detail}</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
            style={{ background: meta.soft, color: meta.accent }}
          >
            {step.yearLabel}
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
      </div>
    </div>
  );
}
