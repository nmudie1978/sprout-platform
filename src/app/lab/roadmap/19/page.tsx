"use client";

/**
 * Variant 19 — Layered Glass.
 * Glassmorphism: frosted translucent step cards with soft inner light, arranged
 * with gentle depth over low-saturation blurred gradient blobs. Milestones float
 * a touch higher / brighter. Tap a card to expand its full detail. Text kept on
 * high-contrast surfaces for legibility. Calm and elegant — never flashy.
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
  ChevronDown,
  MapPin,
  Check,
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

export default function LayeredGlassVariant() {
  const { steps, career, currentStepIndex } = SAMPLE_ROADMAP;
  const [open, setOpen] = useState<string | null>(
    steps[currentStepIndex]?.id ?? null,
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <style>{`
        @keyframes rmDrift {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,-18px,0) scale(1.05); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        .rm-blob { animation: rmDrift 18s ease-in-out infinite; }
        @keyframes rmFade { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        .rm-fade { animation: rmFade .5s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .rm-blob, .rm-fade { animation: none; }
        }
      `}</style>

      {/* Soft blurred gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="rm-blob absolute -left-24 top-10 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #0ea5b7, transparent 70%)" }}
        />
        <div
          className="rm-blob absolute right-[-60px] top-1/3 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c6cf0, transparent 70%)", animationDelay: "-6s" }}
        />
        <div
          className="rm-blob absolute bottom-0 left-1/4 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #d99a2b, transparent 70%)", animationDelay: "-12s" }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl px-5 py-12">
        <header>
          <Link href="/lab/roadmap" className="text-xs text-slate-400 hover:text-slate-200">
            ← Roadmap Lab
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            Your roadmap to {career}
          </h1>
          <p className="mt-1 text-sm text-slate-300/80">
            A calm path, one frosted step at a time — tap to look closer.
          </p>
        </header>

        <ol className="mt-10 space-y-5">
          {steps.map((step, i) => {
            const meta = STAGE_META[step.stage];
            const Icon = ICONS[step.icon] ?? Target;
            const isOpen = open === step.id;
            const isCurrent = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <li
                key={step.id}
                className="rm-fade"
                style={{
                  animationDelay: `${i * 70}ms`,
                  // milestones float a touch higher
                  marginLeft: step.isMilestone ? "0" : i % 2 === 0 ? "0" : "1.25rem",
                  marginRight: step.isMilestone ? "0" : i % 2 === 0 ? "1.25rem" : "0",
                }}
              >
                <div
                  className="rounded-2xl border bg-white/[0.06] backdrop-blur-xl transition"
                  style={{
                    borderColor: step.isMilestone ? meta.ring : "rgba(255,255,255,0.12)",
                    boxShadow: step.isMilestone
                      ? `0 16px 50px -20px ${meta.accent}, inset 0 1px 0 0 rgba(255,255,255,0.12)`
                      : "0 14px 44px -28px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.08)",
                    transform: step.isMilestone ? "translateY(-4px)" : undefined,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : step.id)}
                    className="flex w-full items-start gap-3.5 px-5 py-4 text-left"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md"
                      style={{
                        borderColor: meta.ring,
                        background: isDone
                          ? meta.accent
                          : "rgba(255,255,255,0.08)",
                      }}
                    >
                      {isDone ? (
                        <Check className="h-5 w-5" style={{ color: "#0b1220" }} />
                      ) : (
                        <Icon className="h-5 w-5" style={{ color: meta.accent }} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: meta.soft, color: meta.accent }}
                        >
                          {meta.label}
                        </span>
                        {step.isMilestone && (
                          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                            Milestone
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                            <MapPin className="h-3 w-3" /> You are here
                          </span>
                        )}
                      </span>
                      <span className="mt-1.5 block font-semibold text-white">
                        {step.title}
                      </span>
                      <span className="block text-xs text-slate-300/80">
                        {step.subtitle ? `${step.subtitle} · ` : ""}Age {step.startAge}
                        {step.endAge ? `–${step.endAge}` : "+"}
                      </span>
                    </span>
                    <ChevronDown
                      className={`mt-1 h-4 w-4 shrink-0 text-slate-300/70 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && <GlassDetail step={step} accent={meta.accent} soft={meta.soft} />}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function GlassDetail({
  step,
  accent,
  soft,
}: {
  step: RoadmapStep;
  accent: string;
  soft: string;
}) {
  return (
    <div className="border-t border-white/10 px-5 py-4">
      <p className="text-sm leading-relaxed text-slate-200">{step.description}</p>

      {step.microActions.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Small next steps
          </p>
          <ul className="mt-2 space-y-1.5">
            {step.microActions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-slate-200">
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
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            How to
          </p>
          <ol className="mt-2 space-y-2.5">
            {step.howTo.map((h, i) => (
              <li key={i} className="flex gap-2.5">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{ background: soft, color: accent }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-200">{h.step}</p>
                  {h.detail && (
                    <p className="mt-0.5 text-xs text-slate-400">{h.detail}</p>
                  )}
                </div>
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
              className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-xs text-slate-200 backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.1]"
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
