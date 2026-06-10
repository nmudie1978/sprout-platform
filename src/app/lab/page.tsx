import Link from "next/link";
import type { Metadata } from "next";
import { VARIANTS } from "./_content";

export const metadata: Metadata = {
  title: "Landing Lab — Endeavrly",
  description: "Internal preview of landing-page style explorations.",
  robots: { index: false, follow: false },
};

const THEME_BADGE: Record<string, string> = {
  light: "bg-amber-100 text-amber-800",
  dark: "bg-slate-700 text-slate-200",
  conceptual: "bg-violet-900/40 text-violet-300",
};

export default function LabHubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Landing Lab
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">10 landing-page styles</h1>
          <p className="mt-3 max-w-prose text-slate-400">
            Ten distinct visual directions for the Endeavrly landing page — all sharing the exact
            same copy, message, and product focus. Open each to compare. The live site at{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-emerald-300">/</code> is
            untouched.
          </p>
        </header>

        <ol className="space-y-3">
          {VARIANTS.map((v) => (
            <li key={v.n}>
              <Link
                href={`/lab/${v.n}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-emerald-500/50 hover:bg-slate-900"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
                  {v.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{v.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${THEME_BADGE[v.theme]}`}
                    >
                      {v.theme}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-slate-400">{v.idea}</span>
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
