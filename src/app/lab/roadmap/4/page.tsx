"use client";

/**
 * Variant 4 — Winding Path.
 * An SVG S-curve snakes down the page; step nodes sit on the bends, alternating
 * left and right of the curve. Calm, premium trail feel (not a board game). The
 * path draws in once on load (reduced-motion guarded). Tap a node for detail.
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
  type LucideIcon,
} from "lucide-react";
import {
  SAMPLE_ROADMAP,
  STAGE_META,
  type RoadmapStep,
} from "../_data";

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

// Layout constants for the SVG trail (viewBox units; scales responsively).
const VB_W = 100;
const ROW_H = 16; // vertical units between successive nodes
const LEFT_X = 26;
const RIGHT_X = 74;

export default function WindingPathVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [openId, setOpenId] = useState<string | null>(
    steps[currentStepIndex]?.id ?? null,
  );

  const top = 8;
  const vbH = top + steps.length * ROW_H;

  // Node positions, alternating left/right.
  const nodes = steps.map((step, i) => {
    const x = i % 2 === 0 ? LEFT_X : RIGHT_X;
    const y = top + i * ROW_H + ROW_H / 2;
    return { step, i, x, y };
  });

  // Build a smooth snaking path through the node points.
  const d = nodes
    .map((n, i) => {
      if (i === 0) return `M ${n.x} ${n.y}`;
      const prev = nodes[i - 1]!;
      const midY = (prev.y + n.y) / 2;
      return `C ${prev.x} ${midY}, ${n.x} ${midY}, ${n.x} ${n.y}`;
    })
    .join(" ");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmDraw { to { stroke-dashoffset: 0; } }
        .rm-trail { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: rmDraw 2.2s ease forwards; }
        @keyframes rmPop { from { opacity: 0; transform: scale(.92);} to {opacity:1; transform:none;} }
        .rm-pop { animation: rmPop .4s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .rm-trail { animation: none; stroke-dashoffset: 0; }
          .rm-pop { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-2xl px-5 py-12">
        <header>
          <Link href="/lab/roadmap" className="text-xs text-slate-500 hover:text-slate-300">
            ← Roadmap Lab
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            Your roadmap to {career}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Follow the trail down — each marker is a step on the way to your
            first role. Tap a marker to see how to take it.
          </p>
        </header>

        <div className="relative mt-10">
          <svg
            viewBox={`0 0 ${VB_W} ${vbH}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="rmTrailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={STAGE_META.foundation.accent} />
                <stop offset="35%" stopColor={STAGE_META.education.accent} />
                <stop offset="70%" stopColor={STAGE_META.experience.accent} />
                <stop offset="100%" stopColor={STAGE_META.career.accent} />
              </linearGradient>
            </defs>
            {/* soft under-trail */}
            <path d={d} fill="none" stroke="#1e293b" strokeWidth={3.4} strokeLinecap="round" />
            {/* coloured trail */}
            <path
              className="rm-trail"
              d={d}
              fill="none"
              stroke="url(#rmTrailGrad)"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          </svg>

          {/* Nodes layer — positioned by percentage to align with the curve */}
          <div className="relative" style={{ aspectRatio: `${VB_W} / ${vbH}` }}>
            {nodes.map(({ step, i, x, y }) => {
              const meta = STAGE_META[step.stage];
              const Icon = ICONS[step.icon] ?? Target;
              const isCurrent = i === currentStepIndex;
              const isDone = i < currentStepIndex;
              const onLeft = i % 2 === 0;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setOpenId(openId === step.id ? null : step.id)}
                  className="absolute z-10 flex items-center justify-center rounded-full border-2 bg-slate-950 transition"
                  style={{
                    left: `${x}%`,
                    top: `${(y / vbH) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: step.isMilestone ? 46 : 40,
                    height: step.isMilestone ? 46 : 40,
                    borderColor: meta.accent,
                    background: isDone ? meta.accent : "#0b1220",
                    boxShadow: isCurrent ? `0 0 0 4px ${meta.ring}` : undefined,
                  }}
                  aria-label={`${step.title}, age ${step.startAge}${onLeft ? "" : ""}`}
                >
                  {step.isMilestone && (
                    <span
                      className="absolute inset-1.5 rounded-full border"
                      style={{ borderColor: isDone ? "#0b1220" : meta.accent }}
                    />
                  )}
                  <Icon className="h-4 w-4" style={{ color: isDone ? "#0b1220" : meta.accent }} />
                </button>
              );
            })}

            {/* Labels alongside each node */}
            {nodes.map(({ step, i, y }) => {
              const meta = STAGE_META[step.stage];
              const isCurrent = i === currentStepIndex;
              const onLeft = i % 2 === 0;
              return (
                <div
                  key={`label-${step.id}`}
                  className={`absolute hidden sm:block ${onLeft ? "text-left" : "text-right"}`}
                  style={{
                    top: `${(y / vbH) * 100}%`,
                    [onLeft ? "left" : "right"]: "calc(26% + 36px)",
                    transform: "translateY(-50%)",
                    maxWidth: "38%",
                  }}
                >
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{ color: meta.accent }}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Age {step.startAge}
                    {step.endAge ? `–${step.endAge}` : "+"}
                  </p>
                  {(step.isMilestone || isCurrent) && (
                    <div className={`mt-0.5 flex gap-1.5 ${onLeft ? "" : "justify-end"}`}>
                      {step.isMilestone && (
                        <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                          Milestone
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
                          <MapPin className="h-2.5 w-2.5" /> Here
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail card (single open node) */}
        {openId &&
          (() => {
            const step = steps.find((s) => s.id === openId);
            if (!step) return null;
            const meta = STAGE_META[step.stage];
            return (
              <div
                key={step.id}
                className="rm-pop mt-8 rounded-3xl border bg-slate-900/70 p-6"
                style={{ borderColor: meta.ring }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: meta.soft, color: meta.accent }}
                  >
                    {meta.label}
                  </span>
                  {step.isMilestone && (
                    <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                      Milestone
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-xl font-bold">{step.title}</h2>
                {step.subtitle && <p className="text-sm text-slate-400">{step.subtitle}</p>}
                <NodeDetail step={step} accent={meta.accent} />
              </div>
            );
          })()}
      </div>
    </div>
  );
}

function NodeDetail({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <div className="mt-3">
      <p className="text-sm text-slate-300">{step.description}</p>

      {step.microActions.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Small next steps
          </p>
          <ul className="mt-2 space-y-1.5">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
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
    </div>
  );
}
