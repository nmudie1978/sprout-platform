"use client";

/**
 * DEMO 8: SEARCH FIRST
 *
 * DESIGN PHILOSOPHY:
 * Google-style simplicity. Start with nothing but a large search input.
 * Results appear as you type. For the confident user who knows roughly
 * what they want — or even a skill/keyword they're curious about.
 * Zero friction, zero distraction.
 *
 * VISUAL TONE: Ultra-minimal. White page, one input, one results list.
 * No chrome, no navigation, no headers beyond the input. Felt-tip simplicity.
 *
 * LAYOUT: Centered search input with large placeholder → results appear
 * below as user types → click to expand inline detail.
 *
 * INTERACTION: Type anything (career name, skill, interest) → fuzzy results
 * appear. Click to expand. Before typing: suggested starting prompts shown.
 *
 * REMOVED: All filters, category tabs, grid layouts, pagination, cards,
 * badges, icons (except search icon). Literally just search and results.
 *
 * IDEAL USER: Returning user. Knows what area interests them. Just wants
 * to find something quickly. Also good for skill-based exploration.
 *
 * WIREFRAME:
 * [Spacer — generous top margin]
 * [Search input] — Large, centered, with search icon and placeholder
 * [Suggestions] — Before typing: "Try: nursing, coding, teamwork, design"
 * [Results] — After typing: Instant list with emoji + title + match context
 * [Expanded] — Click shows full detail inline
 * [Empty state] — "No careers match — try a different word"
 */

import { useState, useMemo } from "react";
import type { DemoProps } from "./demo-types";

const SUGGESTIONS = ["nursing", "coding", "design", "teaching", "engineering", "finance", "teamwork", "creative"];

export default function SearchFirst({ careers }: DemoProps) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return careers
      .map((c) => {
        const titleMatch = c.title.toLowerCase().includes(q);
        const descMatch = c.description.toLowerCase().includes(q);
        const skillMatch = c.keySkills.some((s) => s.toLowerCase().includes(q));
        const taskMatch = c.dailyTasks.some((t) => t.toLowerCase().includes(q));
        const score = (titleMatch ? 10 : 0) + (skillMatch ? 5 : 0) + (descMatch ? 3 : 0) + (taskMatch ? 1 : 0);
        let context = "";
        if (titleMatch) context = c.description;
        else if (skillMatch) {
          const matched = c.keySkills.find((s) => s.toLowerCase().includes(q));
          context = `Uses ${matched} — ${c.description.slice(0, 60)}...`;
        } else if (descMatch) context = c.description;
        else if (taskMatch) {
          const matched = c.dailyTasks.find((t) => t.toLowerCase().includes(q));
          context = matched || c.description;
        }
        return { career: c, score, context };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }, [careers, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="max-w-xl mx-auto px-6 pt-24 pb-12">
      {/* Search input */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setExpandedId(null); }}
          placeholder="Search for a career, skill, or interest..."
          className="w-full pl-12 pr-4 py-4 text-lg border border-slate-200 rounded-2xl bg-white text-foreground placeholder:text-slate-300 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
          autoFocus
        />
      </div>

      {/* Suggestions — shown when no query */}
      {!hasQuery && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Try searching for:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-sm hover:bg-slate-100 hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasQuery && results.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No careers match &ldquo;{query}&rdquo; — try a different word.
        </p>
      )}

      {hasQuery && results.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground mb-3">{results.length} result{results.length !== 1 ? "s" : ""}</p>
          {results.map(({ career: c, context }) => {
            const isOpen = expandedId === c.id;
            return (
              <div key={c.id}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : c.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{c.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{c.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{context}</p>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="ml-10 mr-3 pb-4 space-y-3 animate-in fade-in-0 duration-200">
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.keySkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{s}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground block mb-0.5">Education</span>
                        {c.educationPath}
                      </div>
                      <div>
                        <span className="font-medium text-foreground block mb-0.5">Salary</span>
                        {c.avgSalary}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
