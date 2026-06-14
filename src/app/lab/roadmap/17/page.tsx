"use client";

/**
 * Variant 17 — Now / Next / Later.
 * Reframes the roadmap by temporal NEARNESS to currentStepIndex rather than by
 * stage. Four calm lanes: Done (before current), Now (the current step,
 * gently emphasised), Next (the following 2–3 steps), and Later (the rest).
 * Helps the young person see what to focus on right now. Cards expand inline.
 * Lanes are columns on desktop, stacked on mobile.
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
  ChevronDown,
  ArrowUpRight,
  MapPin,
  Check,
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

type Lane = "done" | "now" | "next" | "later";

const LANE_META: Record<Lane, { label: string; blurb: string; tint: string }> = {
  done: { label: "Done", blurb: "Behind you", tint: "#64748b" },
  now: { label: "Now", blurb: "Your focus", tint: STAGE_META.experience.accent },
  next: { label: "Next", blurb: "Coming up soon", tint: STAGE_META.education.accent },
  later: { label: "Later", blurb: "Further ahead", tint: STAGE_META.career.accent },
};

const LANE_ORDER: Lane[] = ["done", "now", "next", "later"];

export default function NowNextLaterVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [open, setOpen] = useState<string | null>(steps[currentStepIndex]?.id ?? null);

  const laneOf = (i: number): Lane => {
    if (i < currentStepIndex) return "done";
    if (i === currentStepIndex) return "now";
    if (i <= currentStepIndex + 3) return "next"; // next 2–3 steps
    return "later";
  };

  const grouped: Record<Lane, { step: RoadmapStep; i: number }[]> = {
    done: [],
    now: [],
    next: [],
    later: [],
  };
  steps.forEach((step, i) => grouped[laneOf(i)].push({ step, i }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmRise { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        .rm-rise { animation: rmRise .45s ease both; }
        @keyframes rmPulse { 0%,100% { box-shadow: 0 0 0 0 var(--rm-glow); } 50% { box-shadow: 0 0 0 6px transparent; } }
        .rm-now-glow { animation: rmPulse 3.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rm-rise { animation: none; }
          .rm-now-glow { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <LabHeader career={career} />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LANE_ORDER.map((lane) => {
            const items = grouped[lane];
            const lm = LANE_META[lane];
            const isNow = lane === "now";
            return (
              <section
                key={lane}
                className={`rounded-2xl border p-3 ${
                  isNow ? "bg-slate-900/60" : "bg-slate-900/30"
                }`}
                style={{
                  borderColor: isNow ? lm.tint : "#1e293b",
                }}
              >
                <header className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: lm.tint }}
                    />
                    <h2 className="text-sm font-semibold text-slate-100">{lm.label}</h2>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-slate-500">
                    {items.length}
                  </span>
                </header>
                <p className="mb-3 px-1 text-[11px] text-slate-500">{lm.blurb}</p>

                <div className="space-y-2.5">
                  {items.length === 0 && (
                    <p className="px-1 py-4 text-center text-xs text-slate-600">
                      Nothing here yet
                    </p>
                  )}
                  {items.map(({ step, i }) => (
                    <LaneCard
                      key={step.id}
                      step={step}
                      lane={lane}
                      laneTint={lm.tint}
                      isOpen={open === step.id}
                      onToggle={() =>
                        setOpen(open === step.id ? null : step.id)
                      }
                      delay={i * 50}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LaneCard({
  step,
  lane,
  laneTint,
  isOpen,
  onToggle,
  delay,
}: {
  step: RoadmapStep;
  lane: Lane;
  laneTint: string;
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const meta = STAGE_META[step.stage];
  const Icon = ICONS[step.icon] ?? Target;
  const isNow = lane === "now";
  const isDone = lane === "done";

  return (
    <div
      className={`rm-rise overflow-hidden rounded-xl border bg-slate-950/50 transition ${
        isNow ? "rm-now-glow" : ""
      }`}
      style={
        {
          borderColor: isNow ? laneTint : "#1e293b",
          animationDelay: `${delay}ms`,
          "--rm-glow": `${meta.ring}`,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left"
        aria-expanded={isOpen}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: isDone ? "#1e293b" : meta.soft }}
        >
          {isDone ? (
            <Check className="h-4 w-4 text-slate-500" strokeWidth={3} />
          ) : (
            <Icon className="h-4 w-4" style={{ color: meta.accent }} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ background: meta.soft, color: meta.accent }}
            >
              {meta.label}
            </span>
            {step.isMilestone && (
              <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                Milestone
              </span>
            )}
            {isNow && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
                <MapPin className="h-2.5 w-2.5" /> here
              </span>
            )}
          </span>
          <span
            className={`mt-1 block text-sm font-medium ${
              isDone ? "text-slate-400" : "text-slate-100"
            }`}
          >
            {step.title}
          </span>
          <span className="block text-[11px] text-slate-500">
            Age {step.startAge}
            {step.endAge ? `–${step.endAge}` : "+"}
          </span>
        </span>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && <StepDetail step={step} accent={meta.accent} />}
    </div>
  );
}

function StepDetail({ step, accent }: { step: RoadmapStep; accent: string }) {
  return (
    <div className="border-t border-slate-800 px-3 py-3">
      <p className="text-sm text-slate-300">{step.description}</p>

      {step.microActions.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Small next steps
          </p>
          <ul className="mt-1.5 space-y-1">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-[13px] text-slate-300">
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
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            How to
          </p>
          <ol className="mt-1.5 space-y-1.5">
            {step.howTo.map((h, i) => (
              <li key={i} className="text-[13px]">
                <span className="text-slate-200">
                  <span className="mr-1.5 text-slate-500">{i + 1}.</span>
                  {h.step}
                </span>
                {h.detail && <p className="ml-5 text-[11px] text-slate-500">{h.detail}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {step.resources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {step.resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
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

function LabHeader({ career }: { career: string }) {
  return (
    <header>
      <Link href="/lab/roadmap" className="text-xs text-slate-500 hover:text-slate-300">
        ← Roadmap Lab
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Your roadmap to {career}</h1>
      <p className="mt-1 text-sm text-slate-400">
        Organised by what matters now — focus on the <span className="text-slate-200">Now</span>{" "}
        lane, and glance ahead when you&apos;re ready.
      </p>
    </header>
  );
}
