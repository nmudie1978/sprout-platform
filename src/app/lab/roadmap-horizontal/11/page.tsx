"use client";

/**
 * Variant 11 — Summit Climb.
 * An SVG mountain ridge that rises left→right, with five markers ascending the
 * slope and a flag planted at the peak (the final "advance" goal). A soft
 * sky-gradient sits behind the ridge — calm and aspirational. Each marker
 * lifts a text-light label card; the current step ("you are here") sits at the
 * base of the climb. Light-themed, scrolls horizontally on mobile.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin, Flag } from "lucide-react";

// Marker anchor points along the ascending ridge, in the SVG viewBox
// (1000 × 420). Each rises higher (smaller y) toward the peak on the right.
const NODES = [
  { x: 95, y: 330 },
  { x: 300, y: 270 },
  { x: 510, y: 205 },
  { x: 720, y: 140 },
  { x: 905, y: 70 },
];

// Ridge silhouette — a calm slope climbing to the peak, then closing to a base.
const RIDGE_D =
  "M 0 380 " +
  "C 90 360 110 345 180 320 " +
  "C 260 292 250 300 320 270 " +
  "C 400 235 430 250 500 205 " +
  "C 580 155 640 175 710 140 " +
  "C 790 100 850 110 905 70 " +
  "L 1000 30 L 1000 420 L 0 420 Z";

// A softer foreground ridge for depth.
const FORE_D =
  "M 0 420 L 0 405 " +
  "C 120 395 200 390 320 360 " +
  "C 470 322 560 320 690 285 " +
  "C 820 250 900 240 1000 215 " +
  "L 1000 420 Z";

export default function SummitClimbVariant() {
  return (
    <LabShell note="Variant 11 — Summit Climb. The same journey as a ridge rising to the goal at the peak — flip the scenario above to re-climb it.">
      {(s) => <Summit scenario={s} />}
    </LabShell>
  );
}

function Summit({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <>
      <style>{`
        @keyframes rmh11-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rmh11-wave { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
        .rmh11-marker { animation: rmh11-rise 600ms cubic-bezier(.2,.7,.2,1) both; }
        .rmh11-flag { transform-origin: bottom left; animation: rmh11-wave 2.4s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .rmh11-marker, .rmh11-flag { animation: none !important; }
        }
      `}</style>

      <div className="overflow-x-auto pb-4">
        <div className="relative mx-auto h-[460px] min-w-[880px]">
          <svg
            viewBox="0 0 1000 420"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <defs>
              <linearGradient id="rmh11-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eef6ff" />
                <stop offset="55%" stopColor="#f5fafe" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
              <linearGradient id="rmh11-ridge" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#dbe7f3" />
                <stop offset="100%" stopColor="#c7d9ec" />
              </linearGradient>
              <linearGradient id="rmh11-fore" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e8eef6" />
                <stop offset="100%" stopColor="#dde7f2" />
              </linearGradient>
            </defs>

            {/* sky */}
            <rect x="0" y="0" width="1000" height="420" fill="url(#rmh11-sky)" rx="18" />

            {/* soft sun glow near the peak */}
            <circle cx="900" cy="60" r="120" fill="#fff7e6" opacity="0.7" />
            <circle cx="900" cy="60" r="46" fill="#ffefca" opacity="0.85" />

            {/* far ridge */}
            <path d={RIDGE_D} fill="url(#rmh11-ridge)" opacity="0.9" />
            {/* foreground ridge for depth */}
            <path d={FORE_D} fill="url(#rmh11-fore)" />

            {/* dotted ascent trail tracing the markers up to the peak */}
            <polyline
              points={NODES.map((n) => `${n.x},${n.y}`).join(" ")}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeDasharray="2 9"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>

          {steps.map((step, i) => {
            const node = NODES[i] ?? NODES[NODES.length - 1];
            const isPeak = i === steps.length - 1;
            return (
              <Marker
                key={step.id}
                step={step}
                leftPct={`${(node.x / 1000) * 100}%`}
                topPct={`${(node.y / 420) * 100}%`}
                index={i}
                isPeak={isPeak}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

function Marker({
  step,
  leftPct,
  topPct,
  index,
  isPeak,
}: {
  step: RoadStep;
  leftPct: string;
  topPct: string;
  index: number;
  isPeak: boolean;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  return (
    <div
      className="rmh11-marker absolute -translate-x-1/2"
      style={{ left: leftPct, top: topPct, animationDelay: `${index * 110}ms` }}
    >
      {/* peak flag, or marker dot on the ridge */}
      {isPeak ? (
        <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <span
            className="rmh11-flag flex h-9 w-9 items-center justify-center rounded-full border-4 border-white shadow-md"
            style={{ background: meta.accent }}
          >
            <Flag className="h-4 w-4 text-white" />
          </span>
        </span>
      ) : (
        <span
          className="absolute left-1/2 top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow"
          style={{ background: meta.accent }}
        />
      )}

      {/* connector + label card, lifted above the marker */}
      <div
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center"
        style={{ width: 168 }}
      >
        <div
          className="w-[168px] rounded-xl border bg-white/95 p-3 shadow-sm backdrop-blur-sm"
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
            <span className="text-[10px] font-medium text-slate-400">{step.yearLabel}</span>
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-tight text-slate-800">{step.label}</h3>
          <p className="text-xs text-slate-500">{step.detail}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ background: meta.soft, color: meta.accent }}
            >
              {step.ageLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
              {meta.label}
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
        {/* short pole down to the marker */}
        <span className="h-4 w-0.5" style={{ background: meta.ring }} />
      </div>

      {/* "you are here" footing label at the base */}
      {step.isNow && (
        <span
          className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow"
          style={{ background: meta.accent }}
        >
          you are here
        </span>
      )}
    </div>
  );
}
