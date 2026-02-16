"use client";

/**
 * DEMO 3: QUIET BROWSER
 *
 * DESIGN PHILOSOPHY:
 * Maximum whitespace, minimum noise. A stripped-back reading experience like
 * a Wikipedia contents page — just titles you can expand. For the user who wants
 * to browse at their own pace without visual stimulation. Anti-anxiety design.
 *
 * VISUAL TONE: Pure white, generous line-height, serif-ish headings for warmth.
 * No colors, no badges, no icons except minimal chevrons. Near-monochrome.
 *
 * LAYOUT: Single column, full-width. Career titles as expandable rows.
 * Only one expanded at a time (accordion). A simple text search at top.
 *
 * INTERACTION: Scan titles → click to expand one → read details inline.
 * Optional text search filters the list. That's it. No categories, no tabs.
 *
 * REMOVED: Cards, grid, emojis, badges, category pills, view modes,
 * pagination, growth indicators, salary highlights, filter chips.
 *
 * IDEAL USER: Thoughtful, introverted user. Returning visitor who knows
 * roughly what they're looking for. Prefers reading over browsing.
 *
 * WIREFRAME:
 * [Search] — Simple text input, placeholder "Search careers..."
 * [Count] — "Showing 47 of 300 careers" in small text
 * [List] — Vertical list of career titles (plain text rows)
 *   [Expanded row] — Description + skills + education, inline below title
 * [Load more] — "Show more" text button (loads 20 at a time)
 */

import { useState, useMemo } from "react";
import type { DemoProps } from "./demo-types";

export default function QuietBrowser({ careers }: DemoProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  const filtered = useMemo(() => {
    if (!search.trim()) return careers;
    const q = search.toLowerCase();
    return careers.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.keySkills.some((s) => s.toLowerCase().includes(q))
    );
  }, [careers, search]);

  const visible = filtered.slice(0, limit);
  const hasMore = limit < filtered.length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setLimit(20); }}
        placeholder="Search careers..."
        className="w-full px-0 py-3 border-0 border-b border-slate-200 bg-transparent text-lg text-foreground placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors"
      />

      <p className="text-xs text-muted-foreground mt-3 mb-8">
        {filtered.length} career{filtered.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </p>

      {/* Career list */}
      <div className="divide-y divide-slate-100">
        {visible.map((c) => {
          const isOpen = expandedId === c.id;
          return (
            <div key={c.id}>
              <button
                onClick={() => setExpandedId(isOpen ? null : c.id)}
                className="w-full text-left py-4 flex items-center justify-between group"
              >
                <span className={`text-base transition-colors ${isOpen ? "text-foreground font-medium" : "text-slate-600 group-hover:text-foreground"}`}>
                  {c.title}
                </span>
                <span className={`text-muted-foreground text-sm transition-transform ${isOpen ? "rotate-90" : ""}`}>
                  ›
                </span>
              </button>
              {isOpen && (
                <div className="pb-6 pl-0 space-y-4 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                  <p className="text-muted-foreground leading-relaxed">{c.description}</p>
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Skills</h4>
                    <p className="text-sm text-muted-foreground">{c.keySkills.join(" · ")}</p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Education</h4>
                    <p className="text-sm text-muted-foreground">{c.educationPath}</p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Typical day</h4>
                    <p className="text-sm text-muted-foreground">{c.dailyTasks.join(" · ")}</p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Salary range</h4>
                    <p className="text-sm text-muted-foreground">{c.avgSalary}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setLimit((l) => l + 20)}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Show more ({filtered.length - limit} remaining)
        </button>
      )}
    </div>
  );
}
