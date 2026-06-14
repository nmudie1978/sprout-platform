"use client";

/**
 * Variant 20 — Storyboard.
 * A calm film-storyboard: each step is a ~16:9 "frame" with an icon/illustration
 * area, a numbered corner, and a caption strip (title · age · one-line). Frames
 * sit in a responsive storyboard grid (filmstrip with snap on wider screens).
 * Tap a frame to open a quiet detail overlay with the full step. Cinematic but
 * understated — narrative and sequential, never gamified.
 */

import { useState, useEffect } from "react";
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
  Check,
  X,
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

export default function StoryboardVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [openId, setOpenId] = useState<string | null>(null);

  const openStep = openId ? steps.find((s) => s.id === openId) ?? null : null;

  // Close overlay on Escape
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmFrame { from { opacity: 0; transform: translateY(10px);} to {opacity:1; transform:none;} }
        .rm-frame { animation: rmFrame .5s ease both; }
        @keyframes rmPop { from { opacity: 0; transform: translateY(12px) scale(.98);} to {opacity:1; transform:none;} }
        .rm-pop { animation: rmPop .3s ease both; }
        @keyframes rmDim { from { opacity: 0;} to {opacity:1;} }
        .rm-dim { animation: rmDim .25s ease both; }
        .rm-strip { scrollbar-width: thin; }
        @media (prefers-reduced-motion: reduce) {
          .rm-frame, .rm-pop, .rm-dim { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <header>
          <Link href="/lab/roadmap" className="text-xs text-slate-500 hover:text-slate-300">
            ← Roadmap Lab
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            Your roadmap to {career}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Your story, frame by frame — tap any scene to read the full chapter.
          </p>
        </header>

        {/* Storyboard: grid on small screens, snap filmstrip on large */}
        <div
          className="rm-strip mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:flex lg:snap-x lg:snap-mandatory lg:overflow-x-auto lg:pb-4"
        >
          {steps.map((step, i) => {
            const meta = STAGE_META[step.stage];
            const Icon = ICONS[step.icon] ?? Target;
            const isCurrent = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setOpenId(step.id)}
                className="rm-frame group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 text-left transition hover:border-slate-600 lg:w-72 lg:shrink-0 lg:snap-start"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Frame: ~16:9 illustration area */}
                <div
                  className="relative aspect-video w-full overflow-hidden"
                  style={{
                    background: `radial-gradient(120% 100% at 50% 0%, ${meta.soft}, rgba(2,6,23,0.6))`,
                  }}
                >
                  {/* numbered corner */}
                  <span className="absolute left-3 top-3 font-mono text-xs tracking-widest text-slate-400/80">
                    {String(i + 1).padStart(2, "0")}
                    <span className="text-slate-600"> / {String(steps.length).padStart(2, "0")}</span>
                  </span>

                  {/* status badges */}
                  <span className="absolute right-3 top-3 flex flex-col items-end gap-1">
                    {step.isMilestone && (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                        Milestone
                      </span>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                        <MapPin className="h-3 w-3" /> You are here
                      </span>
                    )}
                    {isDone && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                        <Check className="h-3 w-3" /> Done
                      </span>
                    )}
                  </span>

                  {/* central icon */}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="flex h-16 w-16 items-center justify-center rounded-2xl border transition group-hover:scale-105"
                      style={{
                        borderColor: meta.ring,
                        background: isDone ? meta.accent : "rgba(15,23,42,0.55)",
                      }}
                    >
                      <Icon
                        className="h-7 w-7"
                        style={{ color: isDone ? "#0b1220" : meta.accent }}
                      />
                    </span>
                  </span>

                  {/* film sprockets, subtle */}
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 right-0 flex h-2 items-center justify-around opacity-30"
                  >
                    {Array.from({ length: 8 }).map((_, k) => (
                      <span key={k} className="h-1 w-1 rounded-full bg-slate-500" />
                    ))}
                  </span>
                </div>

                {/* Caption strip */}
                <div className="border-t border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: meta.accent }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: meta.accent }}
                    >
                      {meta.label}
                    </span>
                    <span className="ml-auto text-[11px] text-slate-500">
                      Age {step.startAge}
                      {step.endAge ? `–${step.endAge}` : "+"}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-semibold leading-tight text-slate-100">
                    {step.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {openStep && (
        <FrameOverlay
          step={openStep}
          index={steps.findIndex((s) => s.id === openStep.id)}
          total={steps.length}
          current={currentStepIndex}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

function FrameOverlay({
  step,
  index,
  total,
  current,
  onClose,
}: {
  step: RoadmapStep;
  index: number;
  total: number;
  current: number;
  onClose: () => void;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? Target;
  const isCurrent = index === current;
  const isDone = index < current;

  return (
    <div
      className="rm-dim fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
      onClick={onClose}
    >
      <div
        className="rm-pop relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-slate-800 bg-slate-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* header frame */}
        <div
          className="px-6 pt-7 pb-5"
          style={{
            background: `radial-gradient(120% 100% at 50% 0%, ${meta.soft}, transparent)`,
          }}
        >
          <span className="font-mono text-xs tracking-widest text-slate-400/80">
            {String(index + 1).padStart(2, "0")}
            <span className="text-slate-600"> / {String(total).padStart(2, "0")}</span>
          </span>
          <div className="mt-3 flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
              style={{ borderColor: meta.ring, background: isDone ? meta.accent : meta.soft }}
            >
              <Icon className="h-5 w-5" style={{ color: isDone ? "#0b1220" : meta.accent }} />
            </span>
            <div className="min-w-0">
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
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-100">
                {step.title}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {step.subtitle ? `${step.subtitle} · ` : ""}Age {step.startAge}
                {step.endAge ? `–${step.endAge}` : "+"} · {meta.blurb}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-300">{step.description}</p>

          {step.microActions.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Small next steps
              </p>
              <ul className="mt-3 space-y-2">
                {step.microActions.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: meta.accent }}
                    />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.howTo.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                How to
              </p>
              <ol className="mt-3 space-y-3">
                {step.howTo.map((h, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                      style={{ background: meta.soft, color: meta.accent }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200">{h.step}</p>
                      {h.detail && (
                        <p className="mt-0.5 text-xs text-slate-500">{h.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {step.resources.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Resources
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {step.resources.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
                  >
                    {r.label}
                    <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
