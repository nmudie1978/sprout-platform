"use client";

/**
 * Variant 14 — Flowing River.
 * A soft, gently-curving gradient ribbon (an SVG "river" with width) flows down
 * the page. Stages are bends/widenings of the river; steps are smooth marker
 * stones resting along the bank. Tranquil blue→teal→green gradient. Tapping a
 * marker opens its detail card. Very calm and organic.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Monitor,
  Shield,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  ShieldCheck,
  Target,
  ArrowUpRight,
  MapPin,
  X,
  type LucideIcon,
} from "lucide-react";
import { SAMPLE_ROADMAP, STAGE_META, type RoadmapStep } from "../_data";

const ICONS: Record<string, LucideIcon> = {
  Monitor,
  Shield,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  ShieldCheck,
  Target,
};

/** Vertical spacing between markers (SVG user units). */
const STEP_GAP = 150;
const TOP_PAD = 80;
const VIEW_W = 360;

export default function FlowingRiverVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [open, setOpen] = useState<string | null>(steps[currentStepIndex]?.id ?? null);

  const height = TOP_PAD * 2 + STEP_GAP * (steps.length - 1);

  // A gentle serpentine centreline: each step's x oscillates softly.
  const xAt = (i: number) => VIEW_W / 2 + Math.sin(i * 0.9) * 64;
  const yAt = (i: number) => TOP_PAD + i * STEP_GAP;

  // Build a smooth river path (centreline) through every node using a cubic
  // spline that passes near each point — calm, no sharp corners.
  const pts = steps.map((_, i) => ({ x: xAt(i), y: yAt(i) }));
  const riverPath = buildSmoothPath(pts);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmFlow { to { stroke-dashoffset: -40; } }
        .rm-river-shimmer { stroke-dasharray: 2 14; animation: rmFlow 5.5s linear infinite; }
        @keyframes rmFade { from { opacity: 0; transform: translateY(6px);} to {opacity:1; transform:none;} }
        .rm-fade { animation: rmFade .45s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .rm-river-shimmer { animation: none; }
          .rm-fade { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-2xl px-5 py-12">
        <LabHeader career={career} />

        <div className="relative mt-10">
          <svg
            viewBox={`0 0 ${VIEW_W} ${height}`}
            className="w-full"
            style={{ overflow: "visible" }}
            role="presentation"
          >
            <defs>
              <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={STAGE_META.foundation.accent} />
                <stop offset="38%" stopColor={STAGE_META.education.accent} />
                <stop offset="68%" stopColor={STAGE_META.experience.accent} />
                <stop offset="100%" stopColor={STAGE_META.career.accent} />
              </linearGradient>
            </defs>

            {/* river bed (wide, soft) */}
            <path
              d={riverPath}
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth={34}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.16}
            />
            {/* river body */}
            <path
              d={riverPath}
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth={18}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.5}
            />
            {/* current shimmer */}
            <path
              d={riverPath}
              fill="none"
              stroke="#ffffff"
              strokeWidth={2}
              strokeLinecap="round"
              className="rm-river-shimmer"
              opacity={0.4}
            />
          </svg>

          {/* Marker stones positioned over the SVG, in % so they scale with it. */}
          <div className="pointer-events-none absolute inset-0">
            {steps.map((step, i) => {
              const meta = STAGE_META[step.stage];
              const Icon = ICONS[step.icon] ?? Target;
              const isCurrent = i === currentStepIndex;
              const isDone = i < currentStepIndex;
              const isOpen = open === step.id;
              const leftPct = (xAt(i) / VIEW_W) * 100;
              const topPct = (yAt(i) / height) * 100;
              const labelLeft = xAt(i) < VIEW_W / 2;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setOpen(isOpen ? null : step.id)}
                  className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  aria-expanded={isOpen}
                  aria-label={`${step.title} — ${meta.label}`}
                >
                  {/* the stone */}
                  <span
                    className="flex items-center justify-center rounded-full border transition"
                    style={{
                      height: step.isMilestone ? 52 : 42,
                      width: step.isMilestone ? 52 : 42,
                      borderColor: meta.accent,
                      background: isDone ? meta.accent : "#0b1220",
                      boxShadow: isCurrent
                        ? `0 0 0 5px ${meta.ring}, 0 6px 18px -6px ${meta.accent}`
                        : `0 4px 14px -8px ${meta.accent}`,
                    }}
                  >
                    <Icon
                      className={step.isMilestone ? "h-5 w-5" : "h-4 w-4"}
                      style={{ color: isDone ? "#0b1220" : meta.accent }}
                    />
                  </span>

                  {/* floating label beside the stone */}
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-left ${
                      labelLeft ? "right-full mr-3" : "left-full ml-3"
                    }`}
                  >
                    <span className="block text-[13px] font-semibold text-slate-100">
                      {step.title}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Age {step.startAge}
                      {step.endAge ? `–${step.endAge}` : "+"}
                      {isCurrent && (
                        <span className="ml-1 inline-flex items-center gap-0.5 text-emerald-300">
                          <MapPin className="inline h-2.5 w-2.5" /> here
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* detail card for the open step */}
        {open && (
          <div className="rm-fade mt-8">
            {steps
              .filter((s) => s.id === open)
              .map((step) => (
                <RiverDetailCard
                  key={step.id}
                  step={step}
                  onClose={() => setOpen(null)}
                  isCurrent={steps.indexOf(step) === currentStepIndex}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function buildSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function RiverDetailCard({
  step,
  onClose,
  isCurrent,
}: {
  step: RoadmapStep;
  onClose: () => void;
  isCurrent: boolean;
}) {
  const meta = STAGE_META[step.stage];
  return (
    <div
      className="rounded-3xl border bg-slate-900/70 p-5 backdrop-blur"
      style={{ borderColor: meta.ring }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: meta.soft, color: meta.accent }}
            >
              {meta.label}
            </span>
            {step.isMilestone && (
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Milestone
              </span>
            )}
            {isCurrent && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                <MapPin className="h-3 w-3" /> You are here
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-100">{step.title}</h3>
          <p className="text-xs text-slate-400">
            {step.subtitle} · Age {step.startAge}
            {step.endAge ? `–${step.endAge}` : "+"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <StepBody step={step} accent={meta.accent} />
    </div>
  );
}

function StepBody({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <>
      <p className="mt-3 text-sm text-slate-300">{step.description}</p>

      {step.microActions.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Small next steps
          </p>
          <ul className="mt-2 space-y-1.5">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-slate-300">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: accent }}
                />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.howTo.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            How to
          </p>
          <ol className="mt-2 space-y-2">
            {step.howTo.map((h, i) => (
              <li key={i} className="text-sm">
                <span className="text-slate-200">
                  <span className="mr-1.5 text-slate-500">{i + 1}.</span>
                  {h.step}
                </span>
                {h.detail && <p className="ml-5 text-xs text-slate-500">{h.detail}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {step.resources.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {step.resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
            >
              {r.label}
              <ArrowUpRight className="h-3 w-3 opacity-60" />
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function LabHeader({ career }: { career: string }) {
  return (
    <header>
      <Link href="/lab/roadmap" className="text-xs text-slate-500 hover:text-slate-300">
        ← Roadmap Lab
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Your roadmap to {career}</h1>
      <p className="mt-1 text-sm text-slate-400">
        Let the journey carry you — follow the current downstream and tap any
        stone to see how to take that step.
      </p>
    </header>
  );
}
