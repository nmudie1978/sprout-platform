"use client";

/**
 * Shared client machinery for the horizontal roadmap lab.
 *
 *  • useScenario()  — current scenario, synced across all variant pages via
 *                     localStorage + a window event (no Suspense / URL needed).
 *  • <LabShell>     — consistent chrome (back link + "today" bar + scenario
 *                     switcher), with the infographic supplied as a render-prop.
 *  • ICONS          — lucide icon map the variants share.
 *
 * Every variant is light-themed (white canvas) to suit the infographic brief
 * and keep the shared chrome readable.
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Compass,
  BookOpen,
  Briefcase,
  TrendingUp,
  MapPin,
  Flag,
  Star,
  Award,
  Building2,
  Stethoscope,
  Network,
  Database,
  Briefcase as BriefcaseIcon,
  Target,
  Sparkles,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  SCENARIOS,
  DEFAULT_SCENARIO_ID,
  type Scenario,
} from "./_data";

export const ICONS: Record<string, LucideIcon> = {
  GraduationCap,
  Compass,
  BookOpen,
  Briefcase,
  TrendingUp,
  MapPin,
  Flag,
  Star,
  Award,
  Building2,
  Stethoscope,
  Network,
  Database,
  Target,
  Sparkles,
};

const KEY = "rmh-scenario";

function readStored(): string {
  if (typeof window === "undefined") return DEFAULT_SCENARIO_ID;
  return localStorage.getItem(KEY) ?? DEFAULT_SCENARIO_ID;
}

export function setScenario(id: string) {
  localStorage.setItem(KEY, id);
  window.dispatchEvent(new CustomEvent(KEY, { detail: id }));
}

export function useScenario(): Scenario {
  // Always start from the default on first render (server + client match),
  // then adopt any stored choice after mount to avoid hydration mismatch.
  const [id, setId] = useState<string>(DEFAULT_SCENARIO_ID);
  useEffect(() => {
    setId(readStored());
    const onChange = (e: Event) => setId((e as CustomEvent<string>).detail);
    window.addEventListener(KEY, onChange);
    return () => window.removeEventListener(KEY, onChange);
  }, []);
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

function BackLink() {
  return (
    <Link
      href="/lab/roadmap-horizontal"
      className="text-xs font-medium text-slate-400 transition hover:text-slate-600"
    >
      ← Roadmap Lab (horizontal)
    </Link>
  );
}

function ScenarioBar({ scenario }: { scenario: Scenario }) {
  const { current } = scenario;
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Your situation today */}
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            You today
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
              {current.age} yrs
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {current.stage}
            </span>
            {current.subjects.map((s) => (
              <span
                key={s}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"
              >
                {s}
              </span>
            ))}
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              finishing {current.finishYear}
            </span>
          </div>
        </div>

        {/* Scenario switcher */}
        <div className="shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 md:text-right">
            Where it could lead
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5 md:justify-end">
            {SCENARIOS.map((s) => {
              const active = s.id === scenario.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScenario(s.id)}
                  className="rounded-full border px-3 py-1 text-xs font-medium transition"
                  style={
                    active
                      ? { background: s.accent, borderColor: s.accent, color: "#fff" }
                      : { borderColor: "#e2e8f0", color: "#475569", background: "#fff" }
                  }
                >
                  {s.tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Page chrome shared by every variant. Pass the infographic as a render-prop
 * so it receives the (single, consistent) scenario.
 */
export function LabShell({
  children,
  note,
}: {
  children: (s: Scenario) => ReactNode;
  /** Optional one-line caption shown under the infographic. */
  note?: string;
}) {
  const scenario = useScenario();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
        <BackLink />
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          Your path to{" "}
          <span style={{ color: scenario.accent }}>{scenario.role}</span>
          <span className="text-slate-400"> · {scenario.employer}, {scenario.city}</span>
        </h1>
        <ScenarioBar scenario={scenario} />

        <div className="mt-8 md:mt-10">{children(scenario)}</div>

        {note && (
          <p className="mt-6 flex items-center gap-1.5 text-xs text-slate-400">
            <ChevronRight className="h-3.5 w-3.5" />
            {note}
          </p>
        )}
      </div>
    </div>
  );
}
