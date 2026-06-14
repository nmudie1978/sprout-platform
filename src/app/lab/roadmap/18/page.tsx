"use client";

/**
 * Variant 18 — Master–Detail.
 * A calm two-pane productivity layout: a slim selectable rail of all 8 steps on
 * the left, a rich detail panel on the right. Selecting a left item updates the
 * right panel. On mobile the detail slides over the list with a back affordance.
 * Defaults to the "you are here" step. No gamification — quiet, premium focus.
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
  ArrowLeft,
  MapPin,
  Check,
  ChevronRight,
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

type State = "done" | "current" | "upcoming";

function stepState(i: number, current: number): State {
  if (i < current) return "done";
  if (i === current) return "current";
  return "upcoming";
}

export default function MasterDetailVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [selectedId, setSelectedId] = useState<string>(
    steps[currentStepIndex]?.id ?? steps[0].id,
  );
  // mobile: when a step is tapped, show the detail pane over the list
  const [mobileDetail, setMobileDetail] = useState(false);

  const selectedIndex = steps.findIndex((s) => s.id === selectedId);
  const selected = steps[selectedIndex] ?? steps[0];
  const selectedMeta = STAGE_META[selected.stage];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmFade { from { opacity: 0; transform: translateY(6px);} to {opacity:1; transform:none;} }
        .rm-fade { animation: rmFade .35s ease both; }
        @keyframes rmSlideIn { from { opacity: 0; transform: translateX(16px);} to {opacity:1; transform:none;} }
        .rm-slide { animation: rmSlideIn .3s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .rm-fade, .rm-slide { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <header>
          <Link href="/lab/roadmap" className="text-xs text-slate-500 hover:text-slate-300">
            ← Roadmap Lab
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            Your roadmap to {career}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Pick a step on the left to see exactly how to take it.
          </p>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-[300px_1fr]">
          {/* LEFT RAIL */}
          <nav
            className={`${mobileDetail ? "hidden" : "block"} md:block`}
            aria-label="Roadmap steps"
          >
            <ul className="space-y-1.5">
              {steps.map((step, i) => {
                const meta = STAGE_META[step.stage];
                const Icon = ICONS[step.icon] ?? Target;
                const st = stepState(i, currentStepIndex);
                const isSelected = step.id === selectedId;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(step.id);
                        setMobileDetail(true);
                      }}
                      aria-current={isSelected ? "true" : undefined}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "border-slate-600 bg-slate-900"
                          : "border-slate-800/70 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
                      }`}
                    >
                      <span
                        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                        style={{
                          borderColor: meta.accent,
                          background: st === "done" ? meta.accent : meta.soft,
                        }}
                      >
                        {st === "done" ? (
                          <Check className="h-4 w-4" style={{ color: "#0b1220" }} />
                        ) : (
                          <Icon className="h-4 w-4" style={{ color: meta.accent }} />
                        )}
                        {st === "current" && (
                          <span
                            aria-hidden
                            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950"
                            style={{ background: "#34d399" }}
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: meta.accent }}
                          />
                          <span className="truncate text-sm font-medium text-slate-100">
                            {step.title}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 pl-3 text-[11px] text-slate-500">
                          <span>
                            Age {step.startAge}
                            {step.endAge ? `–${step.endAge}` : "+"}
                          </span>
                          {step.isMilestone && (
                            <span className="text-amber-300/90">· Milestone</span>
                          )}
                          {st === "current" && (
                            <span className="text-emerald-300/90">· You are here</span>
                          )}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-600 md:hidden" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* RIGHT DETAIL */}
          <section
            className={`${mobileDetail ? "block" : "hidden"} md:block`}
            aria-label="Step detail"
          >
            <button
              type="button"
              onClick={() => setMobileDetail(false)}
              className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 md:hidden"
            >
              <ArrowLeft className="h-4 w-4" /> All steps
            </button>

            <DetailPanel
              key={selected.id}
              step={selected}
              meta={selectedMeta}
              state={stepState(selectedIndex, currentStepIndex)}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  step,
  meta,
  state,
}: {
  step: RoadmapStep;
  meta: (typeof STAGE_META)[keyof typeof STAGE_META];
  state: State;
}) {
  const Icon = ICONS[step.icon] ?? Target;
  return (
    <div className="rm-slide overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
      <div
        className="relative px-6 pt-6 pb-5"
        style={{
          background: `linear-gradient(180deg, ${meta.soft}, transparent)`,
        }}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
            style={{ borderColor: meta.accent, background: meta.soft }}
          >
            <Icon className="h-5 w-5" style={{ color: meta.accent }} />
          </span>
          <div className="min-w-0 flex-1">
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
              {state === "current" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  <MapPin className="h-3 w-3" /> You are here
                </span>
              )}
              {state === "done" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <Check className="h-3 w-3" /> Behind you
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
  );
}
