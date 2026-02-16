"use client";

/**
 * DEMO 6: STORY CARDS
 *
 * DESIGN PHILOSOPHY:
 * Careers presented as mini-stories instead of data. Each card is a
 * "day in the life" narrative — making careers feel human and relatable
 * rather than abstract. Youth connect with stories, not bullet points.
 *
 * VISUAL TONE: Warm, editorial feel. Generous padding. Large text blocks.
 * One story visible at a time in a vertical scroll. Feels like reading a magazine.
 *
 * LAYOUT: Vertical stack of "story cards", each filling most of the viewport.
 * Card shows: emoji + title + narrative paragraph + 3 "things you'd do" +
 * a gentle CTA. Lazy-loads more cards on scroll.
 *
 * INTERACTION: Scroll to browse stories. Tap "Learn more" to expand.
 * Simple category filter at top (horizontal pills). No search needed.
 *
 * REMOVED: Data grids, salary displays, growth labels, skill badges,
 * pagination controls, view toggles, advanced filters.
 *
 * IDEAL USER: The storytelling-driven user. Responds to narrative over data.
 * Wants to feel what a career is like before seeing numbers.
 *
 * WIREFRAME:
 * [Filter] — Small horizontal pills: All, Healthcare, Tech, Business...
 * [Story card 1] — Full-width card with generous padding
 *   [Emoji + Title] — Large, left-aligned
 *   [Narrative] — 3-4 sentence story paragraph
 *   [Three things] — "Three things you'd do:"  bullet list
 *   [CTA] — "Learn more about this career →" subtle link
 * [Story card 2] — Next card after scroll
 * [Load more]
 */

import { useState, useMemo } from "react";
import { CAREER_PATHWAYS, type CareerCategory, type Career } from "@/lib/career-pathways";
import type { DemoProps } from "./demo-types";

const CATEGORY_LABELS: { key: "ALL" | CareerCategory; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "HEALTHCARE_LIFE_SCIENCES", label: "Healthcare" },
  { key: "TECHNOLOGY_IT", label: "Tech" },
  { key: "BUSINESS_MANAGEMENT", label: "Business" },
  { key: "FINANCE_BANKING", label: "Finance" },
  { key: "MANUFACTURING_ENGINEERING", label: "Engineering" },
  { key: "EDUCATION_TRAINING", label: "Education" },
  { key: "HOSPITALITY_TOURISM", label: "Hospitality" },
];

function buildNarrative(c: Career): string {
  const tasks = c.dailyTasks.slice(0, 2);
  const skill = c.keySkills[0] || "problem-solving";
  return `Imagine starting your day by ${tasks[0]?.toLowerCase() || "arriving at work"}. As a ${c.title.toLowerCase()}, you'd spend time ${tasks[1]?.toLowerCase() || "working with your team"}, using skills like ${skill} to make a real difference. ${c.description}`;
}

export default function StoryCards({ careers }: DemoProps) {
  const [category, setCategory] = useState<"ALL" | CareerCategory>("ALL");
  const [limit, setLimit] = useState(5);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (category === "ALL") return careers;
    return CAREER_PATHWAYS[category] || [];
  }, [careers, category]);

  const visible = filtered.slice(0, limit);

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
        {CATEGORY_LABELS.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setCategory(cat.key); setLimit(5); setExpandedId(null); }}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              category === cat.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Story cards */}
      <div className="space-y-8">
        {visible.map((c) => {
          const isExpanded = expandedId === c.id;
          return (
            <div key={c.id} className="rounded-2xl border border-slate-100 p-8">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{c.emoji}</span>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{c.title}</h3>
                  {c.entryLevel && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                      No degree needed
                    </span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-5">
                {buildNarrative(c)}
              </p>

              <div className="mb-5">
                <h4 className="text-sm font-medium text-foreground mb-2">Three things you&apos;d do:</h4>
                <ul className="space-y-1">
                  {c.dailyTasks.slice(0, 3).map((t, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-slate-300 mt-0.5">·</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isExpanded && (
                <div className="space-y-4 mb-5 pt-4 border-t border-slate-100 animate-in fade-in-0 duration-200">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Skills you&apos;d develop</h4>
                    <div className="flex flex-wrap gap-2">
                      {c.keySkills.map((s) => (
                        <span key={s} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Education path</h4>
                    <p className="text-sm text-muted-foreground">{c.educationPath}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Salary range</h4>
                    <p className="text-sm text-muted-foreground">{c.avgSalary}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                className="text-sm text-slate-500 hover:text-foreground transition-colors"
              >
                {isExpanded ? "← Less detail" : "Learn more about this career →"}
              </button>
            </div>
          );
        })}
      </div>

      {limit < filtered.length && (
        <button
          onClick={() => setLimit((l) => l + 5)}
          className="mt-8 w-full py-3 text-sm text-muted-foreground hover:text-foreground border border-slate-200 rounded-xl transition-colors"
        >
          Show more stories ({filtered.length - limit} remaining)
        </button>
      )}
    </div>
  );
}
