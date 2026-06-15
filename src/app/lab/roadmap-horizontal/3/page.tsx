"use client";

/**
 * Variant 3 — Chevron Flow.
 * Five bold right-pointing chevron blocks that lock together left→right so the
 * whole row reads as one big arrow toward the goal. Each chevron is
 * stage-coloured (soft tint fill + accent border/heading), carries the step
 * icon + label + one-line detail + year chip. The final (advance) chevron is a
 * fuller accent colour. Text-light. Scrolls horizontally on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

// Chevron geometry. Each block has a left notch + a right point so they nest.
const NOTCH = 22; // px depth of the arrow notch / point
const CHEVRON_CLIP = `polygon(0 0, calc(100% - ${NOTCH}px) 0, 100% 50%, calc(100% - ${NOTCH}px) 100%, 0 100%, ${NOTCH}px 50%)`;
// First block has a flat left edge (no incoming notch).
const FIRST_CLIP = `polygon(0 0, calc(100% - ${NOTCH}px) 0, 100% 50%, calc(100% - ${NOTCH}px) 100%, 0 100%)`;

export default function ChevronFlowVariant() {
  return (
    <LabShell note="Variant 3 — Chevron Flow. Five chevrons lock into one big arrow toward the goal — flip the scenario above to retell it.">
      {(s) => <ChevronFlow scenario={s} />}
    </LabShell>
  );
}

function ChevronFlow({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-[880px] items-stretch">
        {steps.map((step, i) => (
          <Chevron
            key={step.id}
            step={step}
            first={i === 0}
            last={i === steps.length - 1}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

function Chevron({
  step,
  first,
  last,
  index,
}: {
  step: RoadStep;
  first: boolean;
  last: boolean;
  index: number;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;

  // The final chevron is a fuller accent colour; others use the soft tint.
  const bg = last ? meta.accent : meta.soft;
  const fg = last ? "#ffffff" : "#334155";
  const labelColor = last ? "#ffffff" : meta.accent;

  return (
    <div
      className="rmh3-chevron relative flex-1"
      style={{
        // Overlap so the point of one block sits inside the notch of the next.
        marginLeft: first ? 0 : -NOTCH,
        // Stagger the entrance left→right.
        animationDelay: `${index * 90}ms`,
        zIndex: 10 - index,
      }}
    >
      {/* Accent rail behind the clip gives the chevron a crisp coloured edge. */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: first ? FIRST_CLIP : CHEVRON_CLIP,
          background: meta.accent,
        }}
      />
      <div
        className="relative h-full"
        style={{
          clipPath: first ? FIRST_CLIP : CHEVRON_CLIP,
          background: bg,
          // Inset by 2px via padding so the accent rail reads as a border.
          padding: "2px",
        }}
      >
        <div
          className="flex h-full flex-col justify-center"
          style={{
            clipPath: first ? FIRST_CLIP : CHEVRON_CLIP,
            background: bg,
            // Generous left padding so content clears the incoming notch.
            paddingLeft: first ? 18 : NOTCH + 14,
            paddingRight: NOTCH + 12,
            paddingTop: 18,
            paddingBottom: 18,
            minHeight: 168,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: last ? "rgba(255,255,255,0.22)" : "#ffffff",
                color: last ? "#ffffff" : meta.accent,
              }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{
                background: last ? "rgba(255,255,255,0.22)" : "#ffffff",
                color: last ? "#ffffff" : meta.accent,
              }}
            >
              {meta.label}
            </span>
          </div>

          <h3
            className="mt-2.5 text-sm font-bold leading-tight"
            style={{ color: labelColor }}
          >
            {step.label}
          </h3>
          <p
            className="mt-0.5 text-xs leading-snug"
            style={{ color: last ? "rgba(255,255,255,0.9)" : "#64748b" }}
          >
            {step.detail}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1">
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
              style={{
                background: last ? "rgba(255,255,255,0.22)" : "#ffffff",
                color: last ? "#ffffff" : "#475569",
              }}
            >
              {step.yearLabel}
            </span>
            {step.place && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                style={{
                  background: last ? "rgba(255,255,255,0.22)" : "#ffffff",
                  color: last ? "#ffffff" : "#64748b",
                }}
              >
                {step.place}
              </span>
            )}
            {step.isNow && (
              <span
                className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide"
                style={{ color: last ? "#ffffff" : meta.accent }}
              >
                <MapPin className="h-2.5 w-2.5" /> You
              </span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .rmh3-chevron {
          opacity: 0;
          transform: translateX(-8px);
          animation: rmh3-in 480ms ease-out forwards;
          animation-delay: inherit;
        }
        @keyframes rmh3-in {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rmh3-chevron {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
