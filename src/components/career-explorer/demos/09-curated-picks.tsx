"use client";

/**
 * DEMO 9: CURATED PICKS
 *
 * DESIGN PHILOSOPHY:
 * Netflix-style horizontal rows grouped by relatable themes.
 * "If you like helping people...", "If you're creative...", "Fastest growing...".
 * Curated sections reduce the paradox of choice — each row is a small,
 * digestible set. Browsing feels leisurely, not exhausting.
 *
 * VISUAL TONE: Soft background. Each row has a warm heading. Cards are
 * compact with emoji + title only. Expands on click. Horizontal scroll
 * per row gives a sense of discovery.
 *
 * LAYOUT: Vertical stack of themed horizontal carousels.
 * Each carousel = themed heading + 8-12 horizontally scrollable cards.
 * Click a card to see detail in a floating panel.
 *
 * INTERACTION: Scroll rows horizontally to discover. Tap to expand.
 * No filters, no search. Curation IS the filter.
 *
 * REMOVED: Category tabs, search bar, all filter UI, pagination,
 * growth badges, salary on cards, grid/list toggles.
 *
 * IDEAL USER: Casual browser. Wants to be inspired, not to search.
 * Enjoys being shown things rather than hunting for them.
 *
 * WIREFRAME:
 * [Section 1] — "If you like helping people" heading
 *   [Horizontal scroll] — Small cards: emoji + title
 * [Section 2] — "If you're creative" heading
 *   [Horizontal scroll] — Small cards
 * [Section 3] — "Fastest-growing careers" heading
 *   [Horizontal scroll] — Small cards
 * [... more sections]
 * [Expanded panel] — Appears below the row when a card is clicked
 */

import { useState, useMemo } from "react";
import type { Career } from "@/lib/career-pathways";
import type { DemoProps } from "./demo-types";

interface CuratedRow {
  title: string;
  subtitle: string;
  filter: (c: Career) => boolean;
}

const ROWS: CuratedRow[] = [
  {
    title: "If you like helping people",
    subtitle: "Careers built around empathy, care, and connection",
    filter: (c) => c.keySkills.some((s) => /empathy|communication|patient|care|support|teamwork|teaching/i.test(s)),
  },
  {
    title: "If you're creative",
    subtitle: "Make, design, and imagine for a living",
    filter: (c) => c.keySkills.some((s) => /creative|design|visual|innovation|artistic|writing|storytelling/i.test(s)),
  },
  {
    title: "If you like solving puzzles",
    subtitle: "Analytical roles for curious minds",
    filter: (c) => c.keySkills.some((s) => /analysis|problem.solving|data|research|mathematics|logic/i.test(s)),
  },
  {
    title: "No degree needed",
    subtitle: "Start without higher education",
    filter: (c) => c.entryLevel === true,
  },
  {
    title: "Fastest growing",
    subtitle: "High-growth careers with strong demand",
    filter: (c) => c.growthOutlook === "high",
  },
  {
    title: "If you prefer working with your hands",
    subtitle: "Physical, practical, and hands-on roles",
    filter: (c) => c.keySkills.some((s) => /hands.on|repair|building|construction|physical|installation|manual|maintenance/i.test(s)),
  },
];

export default function CuratedPicks({ careers }: DemoProps) {
  const [selected, setSelected] = useState<{ career: Career; rowIdx: number } | null>(null);

  const rows = useMemo(() => {
    return ROWS.map((row) => ({
      ...row,
      careers: careers.filter(row.filter).slice(0, 12),
    }));
  }, [careers]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="px-6 mb-10">
        <h2 className="text-2xl font-semibold text-foreground mb-1">Explore careers</h2>
        <p className="text-muted-foreground">Browse by what matters to you.</p>
      </div>

      <div className="space-y-10">
        {rows.map((row, rowIdx) => {
          if (row.careers.length === 0) return null;
          return (
            <div key={row.title}>
              <div className="px-6 mb-3">
                <h3 className="text-lg font-semibold text-foreground">{row.title}</h3>
                <p className="text-sm text-muted-foreground">{row.subtitle}</p>
              </div>

              {/* Horizontal scroll */}
              <div className="flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-none">
                {row.careers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(selected?.career.id === c.id ? null : { career: c, rowIdx })}
                    className={`flex-shrink-0 w-36 p-4 rounded-xl border text-left transition-all ${
                      selected?.career.id === c.id
                        ? "border-slate-400 bg-slate-50 scale-[1.02]"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{c.emoji}</span>
                    <p className="text-sm font-medium text-foreground leading-tight">{c.title}</p>
                  </button>
                ))}
              </div>

              {/* Expanded detail — appears below the row */}
              {selected && selected.rowIdx === rowIdx && (
                <div className="mx-6 mt-3 p-6 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl">{selected.career.emoji}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{selected.career.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{selected.career.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-foreground mb-1">Skills</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.career.keySkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-white rounded text-xs text-slate-600">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">Education</h5>
                      <p className="text-muted-foreground text-xs">{selected.career.educationPath}</p>
                      <h5 className="font-medium text-foreground mb-1 mt-3">Salary</h5>
                      <p className="text-muted-foreground text-xs">{selected.career.avgSalary}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
