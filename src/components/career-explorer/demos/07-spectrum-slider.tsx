"use client";

/**
 * DEMO 7: SPECTRUM SLIDER
 *
 * DESIGN PHILOSOPHY:
 * Users position themselves on 3 spectrums (people↔solo, creative↔structured,
 * physical↔digital) and careers are scored/ranked by fit. Feels interactive
 * and personalised without needing to answer quiz questions. Sliders are
 * inherently non-committal — you can always adjust.
 *
 * VISUAL TONE: Clean white with subtle colored accent on sliders.
 * Minimal UI — just sliders and a results list. Modern, playful, scientific-ish.
 *
 * LAYOUT: 3 horizontal sliders stacked at top → live-updating results below.
 * Results ordered by relevance score (dot indicator). Max 10 shown.
 *
 * INTERACTION: Drag sliders → results re-sort in real time.
 * No categories, no search. Sliders ARE the filter. Tap a result to expand.
 *
 * REMOVED: Category pills, search, filter chips, pagination, view modes,
 * growth badges. Replaced entirely by the 3 spectrums.
 *
 * IDEAL USER: Reflective user. Enjoys self-discovery tools. Wants
 * personalisation without answering quiz questions. "Show me what fits ME."
 *
 * WIREFRAME:
 * [Header] — "What kind of work suits you?" centered
 * [Slider 1] — "People 👥 ← → 💻 Solo" with draggable thumb
 * [Slider 2] — "Creative 🎨 ← → 📋 Structured" with draggable thumb
 * [Slider 3] — "Physical 🔧 ← → 💻 Digital" with draggable thumb
 * [Divider]
 * [Results] — Ordered list, relevance dot + emoji + title + 1 line
 * [Expand] — Inline detail panel on click
 */

import { useState, useMemo } from "react";
import type { Career } from "@/lib/career-pathways";
import type { DemoProps } from "./demo-types";

interface Spectrum {
  id: string;
  leftLabel: string;
  leftEmoji: string;
  rightLabel: string;
  rightEmoji: string;
  leftSkills: string[];
  rightSkills: string[];
}

const SPECTRUMS: Spectrum[] = [
  {
    id: "social",
    leftLabel: "People",
    leftEmoji: "👥",
    rightLabel: "Solo",
    rightEmoji: "🎧",
    leftSkills: ["communication", "teamwork", "empathy", "leadership", "customer", "teaching", "mentoring", "patient"],
    rightSkills: ["analysis", "research", "programming", "data", "writing", "design", "coding", "technical"],
  },
  {
    id: "style",
    leftLabel: "Creative",
    leftEmoji: "🎨",
    rightLabel: "Structured",
    rightEmoji: "📋",
    leftSkills: ["creativity", "design", "innovation", "visual", "artistic", "imagination", "storytelling"],
    rightSkills: ["organisation", "planning", "detail", "process", "methodology", "compliance", "systematic"],
  },
  {
    id: "mode",
    leftLabel: "Physical",
    leftEmoji: "🔧",
    rightLabel: "Digital",
    rightEmoji: "💻",
    leftSkills: ["hands-on", "repair", "building", "construction", "physical", "outdoor", "installation", "manual"],
    rightSkills: ["software", "programming", "data", "digital", "technology", "web", "computing", "systems"],
  },
];

function scoreCareer(career: Career, values: Record<string, number>): number {
  let score = 0;
  for (const spec of SPECTRUMS) {
    const val = values[spec.id] ?? 50;
    const leftWeight = (100 - val) / 100;
    const rightWeight = val / 100;
    const leftMatch = career.keySkills.filter((s) =>
      spec.leftSkills.some((ls) => s.toLowerCase().includes(ls))
    ).length;
    const rightMatch = career.keySkills.filter((s) =>
      spec.rightSkills.some((rs) => s.toLowerCase().includes(rs))
    ).length;
    score += leftMatch * leftWeight + rightMatch * rightWeight;
  }
  return score;
}

export default function SpectrumSlider({ careers }: DemoProps) {
  const [values, setValues] = useState<Record<string, number>>({
    social: 50,
    style: 50,
    mode: 50,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const results = useMemo(() => {
    return careers
      .map((c) => ({ career: c, score: scoreCareer(c, values) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [careers, values]);

  const maxScore = results[0]?.score || 1;

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold text-foreground text-center mb-2">
        What kind of work suits you?
      </h2>
      <p className="text-muted-foreground text-center mb-10">
        Move the sliders — your results update instantly.
      </p>

      {/* Sliders */}
      <div className="space-y-6 mb-10">
        {SPECTRUMS.map((spec) => (
          <div key={spec.id}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {spec.leftEmoji} {spec.leftLabel}
              </span>
              <span className="text-sm text-muted-foreground">
                {spec.rightLabel} {spec.rightEmoji}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={values[spec.id]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [spec.id]: Number(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-800 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mb-6" />

      <p className="text-xs text-muted-foreground mb-4">
        {results.length} careers match your preferences
      </p>

      {/* Results */}
      <div className="space-y-1">
        {results.map(({ career: c, score }) => {
          const isOpen = expandedId === c.id;
          const fit = Math.round((score / maxScore) * 100);
          return (
            <div key={c.id}>
              <button
                onClick={() => setExpandedId(isOpen ? null : c.id)}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors group flex items-center gap-3"
              >
                {/* Fit indicator */}
                <div className="w-8 flex-shrink-0">
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-slate-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${fit}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{c.title}</p>
                </div>
                <span className={`text-muted-foreground text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
              </button>
              {isOpen && (
                <div className="pl-14 pr-3 pb-4 space-y-3 animate-in fade-in-0 duration-200">
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.keySkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{s}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{c.educationPath}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
