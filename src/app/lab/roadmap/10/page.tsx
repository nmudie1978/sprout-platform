"use client";

/**
 * Variant 10 — Radial Arc.
 * The eight steps sweep along a quarter/semi-circle arc, age increasing outward
 * along the curve. The centre holds the goal/current focus. Tapping a node on
 * the arc reveals its detail below. On narrow screens it degrades to a calm
 * vertical list so mobile stays legible.
 */

import { useEffect, useState } from "react";
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

function useIsWide(breakpoint = 768): boolean {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return wide;
}

export default function RadialArcVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [activeId, setActiveId] = useState<string>(
    steps[currentStepIndex]?.id ?? steps[0].id,
  );
  const wide = useIsWide();
  const active = steps.find((s) => s.id === activeId) ?? steps[0];
  const activeMeta = STAGE_META[active.stage];

  // Arc geometry — a 180° sweep across the top of a square viewbox.
  const VB = 600;
  const cx = VB / 2;
  const cy = VB * 0.92; // pivot near the bottom so the arc rises above it
  const radius = VB * 0.78;
  const total = steps.length;
  // Sweep from ~200° to ~340° (left to right, gentle dome).
  const startDeg = 200;
  const endDeg = 340;

  const positions = steps.map((_, i) => {
    const t = total === 1 ? 0 : i / (total - 1);
    const deg = startDeg + (endDeg - startDeg) * t;
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  });

  // Smooth poly-line path through the node positions.
  const arcPath = positions
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmFade { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        .rm-fade { animation: rmFade .45s ease both; }
        @keyframes rmPulse { 0%,100% { opacity:.55; } 50% { opacity:1; } }
        .rm-pulse { animation: rmPulse 2.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rm-fade, .rm-pulse { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl px-5 py-12">
        <LabHeader career={career} />

        {wide ? (
          <div className="mt-8">
            <div className="relative mx-auto w-full max-w-2xl">
              <svg
                viewBox={`0 0 ${VB} ${VB * 0.62}`}
                className="w-full overflow-visible"
                role="presentation"
              >
                <path
                  d={arcPath}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {/* progress portion of the arc, up to current */}
                <path
                  d={positions
                    .slice(0, currentStepIndex + 1)
                    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                    .join(" ")}
                  fill="none"
                  stroke="#334155"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              </svg>

              {/* Centre focus */}
              <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
                <div className="max-w-[14rem] text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Your goal
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {career}
                  </p>
                </div>
              </div>

              {/* Nodes positioned over the svg */}
              {steps.map((step, i) => {
                const meta = STAGE_META[step.stage];
                const Icon = ICONS[step.icon] ?? Target;
                const isActive = step.id === activeId;
                const isCurrent = i === currentStepIndex;
                const isDone = i < currentStepIndex;
                const p = positions[i];
                const leftPct = (p.x / VB) * 100;
                const topPct = (p.y / (VB * 0.62)) * 100;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveId(step.id)}
                    aria-pressed={isActive}
                    aria-label={`${step.title}, age ${step.startAge}`}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 transition"
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 transition group-hover:scale-110"
                      style={{
                        borderColor: meta.accent,
                        background: isDone ? meta.accent : meta.soft,
                        boxShadow: isActive
                          ? `0 0 0 4px ${meta.ring}`
                          : isCurrent
                            ? `0 0 0 3px ${meta.ring}`
                            : undefined,
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: isDone ? "#0b1220" : meta.accent }}
                      />
                    </span>
                    <span className="mt-1 block whitespace-nowrap text-[10px] font-medium text-slate-400">
                      Age {step.startAge}
                    </span>
                  </button>
                );
              })}
            </div>

            <StageLegend />
            <DetailPanel step={active} meta={activeMeta} index={steps.indexOf(active)} currentStepIndex={currentStepIndex} />
          </div>
        ) : (
          <MobileList
            steps={steps}
            activeId={activeId}
            setActiveId={setActiveId}
            currentStepIndex={currentStepIndex}
          />
        )}
      </div>
    </div>
  );
}

function StageLegend() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {STAGE_ORDER.map((stage) => {
        const meta = STAGE_META[stage];
        return (
          <span key={stage} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.accent }} />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

function MobileList({
  steps,
  activeId,
  setActiveId,
  currentStepIndex,
}: {
  steps: RoadmapStep[];
  activeId: string;
  setActiveId: (id: string) => void;
  currentStepIndex: number;
}) {
  return (
    <ol className="mt-8 space-y-3">
      {steps.map((step, i) => {
        const meta = STAGE_META[step.stage];
        const Icon = ICONS[step.icon] ?? Target;
        const isActive = step.id === activeId;
        const isCurrent = i === currentStepIndex;
        const isDone = i < currentStepIndex;
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => setActiveId(isActive ? "" : step.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left transition hover:border-slate-700"
              style={isActive ? { borderColor: meta.ring } : undefined}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: meta.accent,
                  background: isDone ? meta.accent : meta.soft,
                  boxShadow: isCurrent ? `0 0 0 3px ${meta.ring}` : undefined,
                }}
              >
                <Icon className="h-4 w-4" style={{ color: isDone ? "#0b1220" : meta.accent }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: meta.soft, color: meta.accent }}
                  >
                    {meta.label}
                  </span>
                  {step.isMilestone && <MilestoneTag />}
                  {isCurrent && <YouAreHereTag />}
                </div>
                <p className="mt-1 truncate font-semibold text-slate-100">{step.title}</p>
                <p className="text-xs text-slate-400">
                  Age {step.startAge}
                  {step.endAge ? `–${step.endAge}` : "+"}
                </p>
              </div>
            </button>
            {isActive && (
              <div className="rm-fade mt-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-4">
                <StepBody step={step} accent={meta.accent} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function DetailPanel({
  step,
  meta,
  index,
  currentStepIndex,
}: {
  step: RoadmapStep;
  meta: (typeof STAGE_META)[keyof typeof STAGE_META];
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
      <div className="mt-4">
        <StepBody step={step} accent={meta.accent} />
      </div>
    </div>
  );
}

function StepBody({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <>
      <p className="text-sm text-slate-300">{step.description}</p>

      {step.microActions.length > 0 && (
        <Section label="Small next steps">
          <ul className="space-y-1.5">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
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
              <ResourceLink key={r.url} label={r.label} url={r.url} />
            ))}
          </div>
        </Section>
      )}
    </>
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

function ResourceLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
    >
      {label}
      <ArrowUpRight className="h-3 w-3 opacity-60" />
    </a>
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
        Each step arcs gently outward by age. Tap a point on the arc to see how
        to take it.
      </p>
    </header>
  );
}
