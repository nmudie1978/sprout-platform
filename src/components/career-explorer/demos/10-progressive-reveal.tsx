"use client";

/**
 * DEMO 10: PROGRESSIVE REVEAL
 *
 * DESIGN PHILOSOPHY:
 * Starts with just 3 random careers. After you explore one (read about it),
 * 2 more unlock. This creates a gentle, curiosity-driven pace. You're never
 * overwhelmed because you only see what you've "earned" through exploration.
 * Gamification-free — no points, no streaks, just natural progression.
 *
 * VISUAL TONE: Airy, spacious. Cards have generous padding and subtle shadows.
 * Unlocked cards appear with a soft fade-in. Counter shows "X explored, Y unlocked."
 * Calm, almost meditative pace.
 *
 * LAYOUT: 3 cards in a loose vertical stack. Each card has emoji + title + teaser.
 * Clicking reveals full detail. Once you've read one, 2 new cards appear below.
 * Locked "coming next" teaser at the bottom.
 *
 * INTERACTION: Read a card → it marks as explored → 2 new cards fade in below.
 * No filters, no search. Pure drip-feed discovery. "Shuffle" button to reseed.
 *
 * REMOVED: Full grid, search, filters, pagination, all at-a-glance metrics,
 * category tabs. The entire paradigm of "show everything" is removed.
 *
 * IDEAL USER: First-time user who would be overwhelmed by 300+ careers.
 * Patient, methodical explorer. Enjoys taking it slow.
 *
 * WIREFRAME:
 * [Counter] — "You've explored 3 careers. 5 more unlocked." muted text
 * [Card 1] — Emoji + Title + Teaser (if not read), or dimmed "Explored ✓"
 * [Card 2] — Same
 * [Card 3] — Same
 * [New cards] — Fade in after exploring, 2 at a time
 * [Teaser] — "Explore one above to unlock more..." blurred placeholder
 * [Shuffle] — "Shuffle and start fresh" link at bottom
 */

import { useState, useMemo, useCallback } from "react";
import type { DemoProps } from "./demo-types";
import type { Career } from "@/lib/career-pathways";

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function ProgressiveReveal({ careers }: DemoProps) {
  const [pool, setPool] = useState<Career[]>(() => shuffle(careers));
  const [explored, setExplored] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(3);

  const visible = useMemo(() => pool.slice(0, unlocked), [pool, unlocked]);
  const exploredCount = explored.size;
  const hasMore = unlocked < pool.length;

  const explore = useCallback((id: string) => {
    if (expanded === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!explored.has(id)) {
      setExplored((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      // Unlock 2 more after a brief delay
      setTimeout(() => {
        setUnlocked((u) => Math.min(u + 2, pool.length));
      }, 500);
    }
  }, [explored, pool.length]);

  const expanded = expandedId;

  const reshuffle = () => {
    setPool(shuffle(careers));
    setExplored(new Set());
    setExpandedId(null);
    setUnlocked(3);
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      {/* Counter */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Discover at your own pace</h2>
        <p className="text-sm text-muted-foreground">
          {exploredCount === 0
            ? "Start by reading about any career below."
            : `You've explored ${exploredCount} career${exploredCount !== 1 ? "s" : ""}. ${unlocked} unlocked.`
          }
        </p>
      </div>

      {/* Visible cards */}
      <div className="space-y-4">
        {visible.map((c, i) => {
          const isExplored = explored.has(c.id);
          const isExpanded = expanded === c.id;
          const isNew = i >= unlocked - 2 && i >= 3 && !isExplored;

          return (
            <div
              key={c.id}
              className={`rounded-xl border transition-all ${
                isNew ? "animate-in fade-in-0 slide-in-from-bottom-2 duration-300" : ""
              } ${
                isExplored && !isExpanded
                  ? "border-slate-100 bg-slate-50/50"
                  : isExpanded
                  ? "border-slate-300 shadow-sm"
                  : "border-slate-200"
              }`}
            >
              <button
                onClick={() => explore(c.id)}
                className="w-full text-left p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{c.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isExplored && !isExpanded ? "text-muted-foreground" : "text-foreground"}`}>
                        {c.title}
                      </h3>
                      {isExplored && !isExpanded && (
                        <span className="text-xs text-emerald-500">✓</span>
                      )}
                    </div>
                    {!isExpanded && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{c.description}</p>
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 animate-in fade-in-0 duration-200">
                  <p className="text-muted-foreground leading-relaxed">{c.description}</p>
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-slate-400 mb-2">What you&apos;d do</h4>
                    <ul className="space-y-1">
                      {c.dailyTasks.slice(0, 3).map((t) => (
                        <li key={t} className="text-sm text-muted-foreground">· {t}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {c.keySkills.slice(0, 5).map((s) => (
                        <span key={s} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-6 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground block mb-0.5">Education</span>
                      {c.educationPath}
                    </div>
                    <div>
                      <span className="font-medium text-foreground block mb-0.5">Growth</span>
                      {c.growthOutlook === "high" ? "High demand" : c.growthOutlook === "medium" ? "Growing" : "Stable"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Locked teaser */}
      {hasMore && exploredCount < visible.length && (
        <div className="mt-4 p-5 rounded-xl border border-dashed border-slate-200 text-center">
          <p className="text-sm text-muted-foreground">
            Read about a career above to unlock more...
          </p>
        </div>
      )}

      {/* Shuffle button */}
      <div className="text-center mt-8">
        <button
          onClick={reshuffle}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ↺ Shuffle and start fresh
        </button>
      </div>
    </div>
  );
}
