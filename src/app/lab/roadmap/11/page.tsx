"use client";

/**
 * Variant 11 — Age Timeline (Gantt).
 * A horizontal age axis (min→max age across all steps). Each step is a bar
 * spanning startAge→endAge; a single-age step renders as a small pill marker.
 * Bars are grouped into stage lanes so overlaps stay visible. Tapping a bar
 * opens its detail beneath. The chart scrolls horizontally on small screens.
 */

import { useMemo, useState } from "react";
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
  STAGE_ORDER,
  type RoadmapStage,
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

const COL_PX = 96; // pixels per year of age

export default function AgeTimelineVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [activeId, setActiveId] = useState<string>(steps[currentStepIndex]?.id ?? steps[0].id);

  const { minAge, maxAge, years } = useMemo(() => {
    const lo = Math.min(...steps.map((s) => s.startAge));
    const hi = Math.max(...steps.map((s) => s.endAge ?? s.startAge + 1));
    const ys: number[] = [];
    for (let a = lo; a <= hi; a++) ys.push(a);
    return { minAge: lo, maxAge: hi, years: ys };
  }, [steps]);

  const chartWidth = (maxAge - minAge) * COL_PX;

  // Group steps into stage lanes (in canonical order).
  const lanes = useMemo(
    () =>
      STAGE_ORDER.map((stage) => ({
        stage,
        items: steps.filter((s) => s.stage === stage),
      })).filter((l) => l.items.length > 0),
    [steps],
  );

  const active = steps.find((s) => s.id === activeId) ?? steps[0];
  const activeMeta = STAGE_META[active.stage];

  const xFor = (age: number) => (age - minAge) * COL_PX;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmFade { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        .rm-fade { animation: rmFade .45s ease both; }
        @media (prefers-reduced-motion: reduce) { .rm-fade { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-12">
        <LabHeader career={career} />

        <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
          <div style={{ width: chartWidth + 24, minWidth: "100%" }}>
            {/* Age axis */}
            <div className="relative mb-3 h-6" style={{ width: chartWidth }}>
              {years.map((age) => (
                <div
                  key={age}
                  className="absolute top-0 flex flex-col items-start"
                  style={{ left: xFor(age) }}
                >
                  <span className="text-[11px] font-medium text-slate-400">{age}</span>
                </div>
              ))}
              <span className="absolute right-0 top-0 text-[10px] uppercase tracking-wide text-slate-600">
                age →
              </span>
            </div>

            {/* Grid + lanes */}
            <div className="relative" style={{ width: chartWidth }}>
              {/* vertical year gridlines */}
              {years.map((age) => (
                <span
                  key={age}
                  aria-hidden
                  className="absolute top-0 bottom-0 w-px bg-slate-800/70"
                  style={{ left: xFor(age) }}
                />
              ))}

              <div className="relative space-y-2.5">
                {lanes.map((lane) => {
                  const meta = STAGE_META[lane.stage];
                  return (
                    <div key={lane.stage} className="relative h-12">
                      {lane.items.map((step) => {
                        const i = steps.indexOf(step);
                        const end = step.endAge ?? step.startAge;
                        const isPoint = step.endAge === undefined;
                        const left = xFor(step.startAge);
                        const width = isPoint ? 0 : (end - step.startAge) * COL_PX;
                        const Icon = ICONS[step.icon] ?? Target;
                        const isActive = step.id === activeId;
                        const isCurrent = i === currentStepIndex;
                        const isDone = i < currentStepIndex;
                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => setActiveId(step.id)}
                            aria-pressed={isActive}
                            title={`${step.title} — age ${step.startAge}${step.endAge ? `–${step.endAge}` : "+"}`}
                            className="group absolute top-1 flex h-10 items-center gap-2 rounded-xl border-2 px-2.5 text-left transition hover:brightness-110"
                            style={{
                              left,
                              width: isPoint ? undefined : Math.max(width, 64),
                              minWidth: isPoint ? "auto" : 64,
                              borderColor: meta.accent,
                              background: isDone ? meta.accent : meta.soft,
                              boxShadow: isActive || isCurrent ? `0 0 0 3px ${meta.ring}` : undefined,
                            }}
                          >
                            <Icon
                              className="h-4 w-4 shrink-0"
                              style={{ color: isDone ? "#0b1220" : meta.accent }}
                            />
                            <span
                              className="truncate text-xs font-semibold"
                              style={{ color: isDone ? "#0b1220" : "#e2e8f0" }}
                            >
                              {step.title}
                            </span>
                            {step.isMilestone && (
                              <span
                                className="ml-1 inline-block h-2 w-2 shrink-0 rotate-45 rounded-[2px]"
                                style={{ background: "#fbbf24" }}
                                aria-label="Milestone"
                              />
                            )}
                            {isCurrent && (
                              <MapPin
                                className="h-3.5 w-3.5 shrink-0 text-emerald-300"
                                aria-label="You are here"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Lane legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {lanes.map((lane) => {
            const meta = STAGE_META[lane.stage];
            return (
              <span key={lane.stage} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="h-2.5 w-4 rounded" style={{ background: meta.accent }} />
                {meta.label}
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="h-2 w-2 rotate-45 rounded-[2px] bg-amber-400" /> Milestone
          </span>
        </div>

        <DetailCard
          step={active}
          meta={activeMeta}
          index={steps.indexOf(active)}
          currentStepIndex={currentStepIndex}
        />
      </div>
    </div>
  );
}

function DetailCard({
  step,
  meta,
  index,
  currentStepIndex,
}: {
  step: RoadmapStep;
  meta: (typeof STAGE_META)[RoadmapStage];
  index: number;
  currentStepIndex: number;
}) {
  const isCurrent = index === currentStepIndex;
  return (
    <div
      key={step.id}
      className="rm-fade mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
      style={isCurrent ? { borderColor: meta.ring } : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: meta.soft, color: meta.accent }}
        >
          {meta.label}
        </span>
        {step.isMilestone && <MilestoneTag />}
        {isCurrent && <YouAreHereTag />}
        <span className="ml-auto text-xs text-slate-500">
          Age {step.startAge}
          {step.endAge ? `–${step.endAge}` : "+"}
        </span>
      </div>
      <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-100">{step.title}</h2>
      {step.subtitle && <p className="text-sm text-slate-500">{step.subtitle}</p>}

      <p className="mt-4 text-sm text-slate-300">{step.description}</p>

      {step.microActions.length > 0 && (
        <Section label="Small next steps">
          <ul className="space-y-1.5">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.accent }} />
                {a}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {step.howTo.length > 0 && (
        <Section label="How to">
          <ol className="space-y-2">
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
        </Section>
      )}

      {step.resources.length > 0 && (
        <Section label="Resources">
          <div className="flex flex-wrap gap-2">
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
        </Section>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function MilestoneTag() {
  return (
    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
      Milestone
    </span>
  );
}

function YouAreHereTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
      <MapPin className="h-3 w-3" /> You are here
    </span>
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
        Laid out by age, so you can see how stages overlap and how long each one
        lasts. Tap a bar for the detail.
      </p>
    </header>
  );
}
