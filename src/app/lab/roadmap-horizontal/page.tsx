import Link from "next/link";
import { VARIANTS, SCENARIOS } from "./_data";

const FAMILY_BADGE: Record<string, string> = {
  road: "bg-amber-100 text-amber-700",
  timeline: "bg-sky-100 text-sky-700",
  steps: "bg-emerald-100 text-emerald-700",
  spatial: "bg-violet-100 text-violet-700",
  editorial: "bg-rose-100 text-rose-700",
};

export default function RoadmapHorizontalHub() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-600">
            Roadmap Lab · Horizontal
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            20 left-to-right roadmap infographics
          </h1>
          <p className="mt-3 max-w-prose text-slate-500">
            Twenty text-light infographic ways to show a young person their path —
            read left → right, aggregated to just <strong>five steps</strong>{" "}
            (school → choose → study → first role → advance). Each variant renders
            the same hypothetical, concrete journey and you can flip the scenario
            inside any variant:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <span
                key={s.id}
                className="rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ background: s.accent }}
              >
                {s.role} · {s.employer}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Open each to compare elegance and clarity, then tell me which to take
            into the real Clarity tab. The live app is untouched.
          </p>
        </header>

        <ol className="space-y-3">
          {VARIANTS.map((v) => (
            <li key={v.n}>
              <Link
                href={`/lab/roadmap-horizontal/${v.n}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700">
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
                  <span className="mt-0.5 block text-sm text-slate-500">
                    {v.idea}
                  </span>
                </span>
                <span className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-500">
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
