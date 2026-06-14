import Link from "next/link";
import type { Metadata } from "next";
import { VARIANTS, SAMPLE_ROADMAP } from "./_data";

export const metadata: Metadata = {
  title: "Roadmap Lab — Endeavrly",
  description: "Internal preview of Clarity-tab roadmap design explorations.",
  robots: { index: false, follow: false },
};

const FAMILY_BADGE: Record<string, string> = {
  vertical: "bg-sky-900/40 text-sky-300",
  horizontal: "bg-amber-900/40 text-amber-300",
  spatial: "bg-violet-900/40 text-violet-300",
  focus: "bg-emerald-900/40 text-emerald-300",
  editorial: "bg-rose-900/40 text-rose-300",
};

export default function RoadmapLabHubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Roadmap Lab
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            20 roadmap designs
          </h1>
          <p className="mt-3 max-w-prose text-slate-400">
            Twenty distinct ways to lay out the Clarity-tab career roadmap — all
            rendering the <em>same</em> sample journey (
            <span className="text-slate-200">{SAMPLE_ROADMAP.career}</span>,{" "}
            {SAMPLE_ROADMAP.steps.length} steps from age{" "}
            {SAMPLE_ROADMAP.startAge}). Open each to compare engagement, clarity
            and elegance, then tell me which direction to take into the real
            Clarity tab. The live app is untouched.
          </p>
        </header>

        <ol className="space-y-3">
          {VARIANTS.map((v) => (
            <li key={v.n}>
              <Link
                href={`/lab/roadmap/${v.n}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-emerald-500/50 hover:bg-slate-900"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
                  {v.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{v.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${FAMILY_BADGE[v.family]}`}
                    >
                      {v.family}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-400">
                    {v.idea}
                  </span>
                </span>
                <span className="shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-emerald-400">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
