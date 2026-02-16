"use client";

/**
 * DEMO 2: SWIPE FOCUS
 *
 * DESIGN PHILOSOPHY:
 * Shows ONE career at a time, full-screen. Eliminates choice paralysis entirely.
 * Inspired by dating apps but made calm — no gamification, no scoring, just
 * "Interested" / "Skip" / "Tell me more". Youth can explore without committing.
 *
 * VISUAL TONE: Clean white background. Single accent color per career category.
 * Very large emoji as hero visual. Typography-driven — no images needed.
 *
 * LAYOUT: Single career fills the viewport. Emoji hero → title → description →
 * 3 key skills. Two action buttons at bottom. Subtle card counter.
 *
 * INTERACTION: Tap "Interested" to save, "Skip" to move on, or expand for more detail.
 * No search, no filters. Pure discovery through sequential browsing.
 *
 * REMOVED: Grid layout, search, filters, pagination, category tabs, salary info,
 * growth badges, view modes. Everything except the one career in front of you.
 *
 * IDEAL USER: Curious browser. Doesn't know categories. Wants to stumble into something.
 *
 * WIREFRAME:
 * [Counter] — "3 of 300+" subtle top-right
 * [Emoji] — Huge centered emoji (80px)
 * [Title] — Career name, centered, large
 * [Description] — 2 lines centered, muted
 * [Skills] — 3 pills, centered row
 * [Spacer]
 * [Actions] — "Skip" (ghost) | "Tell me more" (outline) | "Interested ♡" (filled)
 */

import { useState, useMemo, useCallback } from "react";
import type { DemoProps } from "./demo-types";

export default function SwipeFocus({ careers }: DemoProps) {
  const shuffled = useMemo(() => {
    const arr = [...careers];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [careers]);

  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const career = shuffled[index % shuffled.length];

  const advance = useCallback((dir: "left" | "right") => {
    setDirection(dir);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setExpanded(false);
      setDirection(null);
    }, 200);
  }, []);

  const skip = () => advance("left");
  const save = () => {
    setSaved((s) => new Set(s).add(career.id));
    advance("right");
  };

  return (
    <div className="max-w-md mx-auto px-6 py-8 min-h-[80vh] flex flex-col">
      {/* Counter + saved count */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs text-muted-foreground">
          {saved.size > 0 && `${saved.size} saved`}
        </span>
        <span className="text-xs text-muted-foreground">
          {index + 1} explored
        </span>
      </div>

      {/* Career card */}
      <div
        className={`flex-1 flex flex-col items-center justify-center text-center transition-all duration-200 ${
          direction === "left" ? "-translate-x-8 opacity-0" :
          direction === "right" ? "translate-x-8 opacity-0" :
          "translate-x-0 opacity-100"
        }`}
      >
        <span className="text-7xl mb-6">{career.emoji}</span>
        <h2 className="text-2xl font-semibold text-foreground mb-3">{career.title}</h2>
        <p className="text-muted-foreground leading-relaxed max-w-sm mb-6">
          {career.description}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {career.keySkills.slice(0, 3).map((s) => (
            <span key={s} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
              {s}
            </span>
          ))}
        </div>

        {/* Expandable detail */}
        {expanded && (
          <div className="w-full text-left space-y-4 mt-2 mb-4 px-2">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Education</h3>
              <p className="text-sm text-foreground">{career.educationPath}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Typical salary</h3>
              <p className="text-sm text-foreground">{career.avgSalary}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">A typical day</h3>
              <ul className="space-y-1">
                {career.dailyTasks.slice(0, 3).map((t) => (
                  <li key={t} className="text-sm text-muted-foreground">· {t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tell me more ↓
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={skip}
          className="flex-1 py-3 rounded-xl border border-slate-200 text-muted-foreground hover:bg-slate-50 transition-colors text-sm"
        >
          Skip
        </button>
        <button
          onClick={save}
          className={`flex-1 py-3 rounded-xl text-sm transition-colors ${
            saved.has(career.id)
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {saved.has(career.id) ? "Saved ✓" : "Interesting"}
        </button>
      </div>
    </div>
  );
}
