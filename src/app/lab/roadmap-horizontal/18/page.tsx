"use client";

/**
 * Variant 18 — Arrow Cards.
 * Five full content cards, each shaped as a right-pointing arrow via CSS
 * clip-path: a pointed right edge and a matching notched left edge so they
 * interlock left→right like an arrow strip. Unlike thin chevrons these are
 * tall cards carrying icon + bold label + one-line detail + year/place chips.
 * Each stage-coloured (soft fill + accent left edge). Text-light, light theme.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

// Arrow geometry: a right-pointing chevron block. The notch on the left lets
// the previous card's point nest into it. POINT is the horizontal depth of the
// arrowhead (and notch) as a fraction of the card width.
const ARROW_CLIP =
  "polygon(0 0, calc(100% - 26px) 0, 100% 50%, calc(100% - 26px) 100%, 0 100%, 26px 50%)";
const FIRST_CLIP =
  "polygon(0 0, calc(100% - 26px) 0, 100% 50%, calc(100% - 26px) 100%, 0 100%)";

export default function ArrowCardsVariant() {
  return (
    <LabShell note="Variant 18 — Arrow Cards. Full content cards shaped as interlocking arrows pointing toward the goal. Flip the scenario above to re-tell the path.">
      {(s) => <ArrowStrip scenario={s} />}
    </LabShell>
  );
}

function ArrowStrip({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-[900px] items-stretch gap-[-12px]">
        {steps.map((step, i) => (
          <ArrowCard key={step.id} step={step} index={i} first={i === 0} />
        ))}
      </div>
    </div>
  );
}

function ArrowCard({
  step,
  index,
  first,
}: {
  step: RoadStep;
  index: number;
  first: boolean;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;

  return (
    <div
      className="rmh18-card relative min-w-0 flex-1"
      style={{ marginLeft: first ? 0 : -18, zIndex: 10 - index }}
    >
      <div
        className="relative flex h-[172px] flex-col justify-between"
        style={{
          clipPath: first ? FIRST_CLIP : ARROW_CLIP,
          background: meta.soft,
          // Generous horizontal padding: the clip-path eats ~26px each side.
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: first ? 20 : 44,
          paddingRight: 48,
          animationDelay: `${index * 90}ms`,
        }}
      >
        {/* accent left edge (inside the visible body, after the notch) */}
        <span
          className="pointer-events-none absolute top-3 bottom-3 w-1 rounded-full"
          style={{ left: first ? 8 : 32, background: meta.accent }}
        />

        {/* top row: icon + year chip */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
            style={{ background: "#fff", color: meta.accent }}
          >
            <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
          </span>
          <span
            className="truncate rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: "#ffffffcc", color: meta.accent }}
          >
            {step.yearLabel}
          </span>
        </div>

        {/* middle: stage label tag + bold label + detail */}
        <div className="min-w-0">
          <span
            className="inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
            style={{ background: "#ffffffcc", color: meta.accent }}
          >
            {meta.label}
          </span>
          <h3 className="mt-1 truncate text-[15px] font-bold leading-tight text-slate-800">
            {step.label}
          </h3>
          <p className="truncate text-xs text-slate-500">{step.detail}</p>
        </div>

        {/* bottom row: age + place + You */}
        <div className="flex flex-wrap items-center gap-1">
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
            style={{ background: "#ffffffcc", color: meta.accent }}
          >
            {step.ageLabel}
          </span>
          {step.place && (
            <span className="truncate rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
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

      <style jsx>{`
        .rmh18-card > div {
          animation: rmh18-in 0.5s ease both;
        }
        @keyframes rmh18-in {
          from {
            opacity: 0;
            transform: translateX(-14px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rmh18-card > div {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
