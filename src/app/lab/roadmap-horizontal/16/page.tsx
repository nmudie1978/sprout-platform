"use client";

/**
 * Variant 16 — Folded Banner.
 * A zig-zag folded-ribbon banner reading left→right: five ribbon tabs, one per
 * stage. The seam between each tab carries a darker triangular "fold" shadow to
 * fake a tactile 3D origami crease, alternating which way the paper folds.
 * Each tab carries the step icon + short label + one-line detail + year chip.
 * Text-light, stage-coloured, elegant, light.
 */

import { LabShell, ICONS } from "../_scenario";
import { STAGE_META, type RoadStep, type Scenario } from "../_data";
import { MapPin } from "lucide-react";

export default function FoldedBannerVariant() {
  return (
    <LabShell note="Variant 16 — Folded Banner. Five paper ribbon tabs creased at the seams; flip the scenario above to refold the banner around a different career.">
      {(s) => <Banner scenario={s} />}
    </LabShell>
  );
}

function Banner({ scenario }: { scenario: Scenario }) {
  const { steps } = scenario;
  return (
    <>
      <style>{`
        @keyframes rmh16-unfold {
          0% { opacity: 0; transform: translateY(10px) rotateX(-18deg); }
          100% { opacity: 1; transform: translateY(0) rotateX(0); }
        }
        .rmh16-tab { animation: rmh16-unfold 0.5s cubic-bezier(.21,.78,.35,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .rmh16-tab { animation: none !important; }
        }
      `}</style>
      <div className="overflow-x-auto pb-4">
        <div
          className="flex min-w-[880px] items-stretch"
          style={{ perspective: 1200 }}
        >
          {steps.map((step, i) => (
            <Tab
              key={step.id}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function Tab({
  step,
  index,
  isLast,
}: {
  step: RoadStep;
  index: number;
  isLast: boolean;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? ICONS.Target;
  // Alternate the fold direction so the banner zig-zags up/down at each crease.
  const foldsDown = index % 2 === 0;

  return (
    <div
      className="rmh16-tab relative flex flex-1 flex-col"
      style={{
        animationDelay: `${index * 90}ms`,
        marginTop: foldsDown ? 0 : 18,
        marginBottom: foldsDown ? 18 : 0,
        zIndex: 10 - index,
      }}
    >
      {/* The ribbon panel */}
      <div
        className="relative flex-1 overflow-hidden border-y px-5 py-5"
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, ${meta.soft} 100%)`,
          borderColor: meta.ring,
          borderRadius: index === 0 ? "14px 0 0 14px" : isLast ? "0 14px 14px 0" : 0,
          boxShadow: `inset 0 1px 0 #ffffffcc, 0 8px 20px -14px ${meta.accent}`,
        }}
      >
        {/* Stage accent strip down the top edge */}
        <span
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: meta.accent }}
        />

        {/* The fold seam at the right edge (skip on last tab) — a darker
            triangular crease + soft shadow to fake the 3D origami fold. */}
        {!isLast && (
          <>
            {/* darker crease wedge */}
            <span
              className="pointer-events-none absolute right-0 top-0 h-full w-6"
              style={{
                background: `linear-gradient(90deg, transparent, ${meta.accent}26)`,
              }}
            />
            {/* triangular notch giving the folded-paper silhouette */}
            <span
              className="pointer-events-none absolute -right-px top-0 h-full"
              aria-hidden
              style={{
                width: 16,
                background: meta.accent,
                opacity: 0.16,
                clipPath: foldsDown
                  ? "polygon(0 0, 100% 50%, 0 100%)"
                  : "polygon(0 50%, 100% 0, 100% 100%)",
              }}
            />
          </>
        )}

        {/* The fold-shadow cast onto the NEXT tab, from the left edge
            (skip on first tab). */}
        {index !== 0 && (
          <span
            className="pointer-events-none absolute left-0 top-0 h-full w-7"
            aria-hidden
            style={{
              background: `linear-gradient(90deg, ${meta.accent}2e, transparent)`,
            }}
          />
        )}

        {/* Header: icon + year chip */}
        <div className="relative flex items-center justify-between">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
            style={{ background: "#fff", color: meta.accent, border: `1px solid ${meta.ring}` }}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: "#fff", color: meta.accent, border: `1px solid ${meta.ring}` }}
          >
            {step.yearLabel}
          </span>
        </div>

        {/* Body: label + detail */}
        <h3 className="relative mt-3 text-sm font-bold leading-tight text-slate-800">
          {step.label}
        </h3>
        <p className="relative mt-0.5 text-xs leading-snug text-slate-500">
          {step.detail}
        </p>

        {/* Footer chips */}
        <div className="relative mt-3 flex flex-wrap items-center gap-1">
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
      </div>
    </div>
  );
}
