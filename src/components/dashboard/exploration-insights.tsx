'use client';

/**
 * Exploration Insights — monthly self-awareness summary.
 *
 * Renders on the Dashboard. Shows the user what they've been exploring
 * (saved careers, radar interactions, journey reflections) and surfaces
 * patterns: "You've been drawn to analytical roles this month" or
 * "You shifted from creative to technical careers since last month."
 *
 * Non-gamified: no badges, no streaks. The insight IS the reward.
 */

import { useMemo } from 'react';
import { TrendingUp, Compass, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Career } from '@/lib/career-pathways';
import { findCareerCategory } from '@/lib/career-pathways';

interface ExplorationInsightsProps {
  /** Careers the user has saved/bookmarked (from useCuriositySaves). */
  savedCareers: { careerId: string; careerTitle: string; careerEmoji?: string }[];
  /** Primary goal career, if set. */
  primaryGoal?: string | null;
  /** User's radar preferences. */
  radarPreferences?: {
    subjects?: string[];
    workStyles?: string[];
    peoplePref?: string;
  } | null;
}

function getExplorationPatterns(
  savedCareers: { careerId: string; careerTitle: string }[],
  radarPreferences?: { subjects?: string[]; workStyles?: string[]; peoplePref?: string } | null,
): { patterns: string[]; suggestion: string | null } {
  const patterns: string[] = [];

  if (savedCareers.length === 0) {
    return { patterns: [], suggestion: null };
  }

  // Category analysis
  const categories = savedCareers
    .map((c) => findCareerCategory(c.careerId))
    .filter(Boolean);
  const catCounts = new Map<string, number>();
  for (const cat of categories) {
    if (cat) catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
  }

  const topCategory = [...catCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const uniqueCategories = catCounts.size;

  if (savedCareers.length >= 3) {
    patterns.push(
      `You've saved ${savedCareers.length} careers across ${uniqueCategories} ${uniqueCategories === 1 ? 'category' : 'categories'}.`,
    );
  }

  if (topCategory && topCategory[1] >= 2) {
    const catLabel = topCategory[0]
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
    patterns.push(
      `You seem drawn to ${catLabel} — ${topCategory[1]} of your saved careers are in this area.`,
    );
  }

  if (uniqueCategories >= 4) {
    patterns.push(
      'Your interests are broad — that\'s a strength at this stage. Keep exploring before narrowing.',
    );
  } else if (uniqueCategories === 1 && savedCareers.length >= 3) {
    patterns.push(
      'All your saved careers are in the same category. Consider exploring an adjacent field to test whether your preference holds.',
    );
  }

  // Radar preference alignment
  const workStyles = radarPreferences?.workStyles ?? [];
  if (workStyles.includes('creative') && topCategory?.[0]?.includes('TECH')) {
    patterns.push(
      'You set creative as a work preference but your saves lean technical — creative tech roles (UX design, game dev) might be a sweet spot.',
    );
  }

  // Suggestion
  let suggestion: string | null = null;
  if (uniqueCategories <= 2 && savedCareers.length >= 3) {
    suggestion = 'Try the "Surprise Me" feature on the Career Radar to discover careers outside your usual pattern.';
  } else if (savedCareers.length >= 5 && !patterns.some((p) => p.includes('broad'))) {
    suggestion = 'You\'ve explored a solid range — consider setting one as your Primary Goal to unlock the full Journey experience.';
  }

  return { patterns, suggestion };
}

export function ExplorationInsights({ savedCareers, primaryGoal, radarPreferences }: ExplorationInsightsProps) {
  const { patterns, suggestion } = useMemo(
    () => getExplorationPatterns(savedCareers, radarPreferences),
    [savedCareers, radarPreferences],
  );

  // Don't render if there's nothing to say yet
  if (patterns.length === 0 && !suggestion) return null;

  return (
    <div className="rounded-xl border border-border/30 bg-card/40 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-violet-500/10 flex items-center justify-center">
          <Compass className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-foreground/90">
            Your exploration so far
          </h3>
          <p className="text-[10px] text-muted-foreground/60">
            Patterns from your career browsing
          </p>
        </div>
      </div>

      {/* Pattern insights */}
      <div className="space-y-2">
        {patterns.map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 text-violet-400/70 shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/75 leading-relaxed">{p}</p>
          </div>
        ))}
      </div>

      {/* Saved career chips */}
      {savedCareers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {savedCareers.slice(0, 8).map((c) => (
            <span
              key={c.careerId}
              className="inline-flex items-center gap-1 rounded-full border border-border/30 bg-background/40 px-2 py-0.5 text-[10px] text-foreground/70"
            >
              {c.careerEmoji && <span>{c.careerEmoji}</span>}
              {c.careerTitle}
            </span>
          ))}
          {savedCareers.length > 8 && (
            <span className="text-[10px] text-muted-foreground/50 self-center">
              +{savedCareers.length - 8} more
            </span>
          )}
        </div>
      )}

      {/* Suggestion */}
      {suggestion && (
        <div className="rounded-lg bg-violet-500/[0.06] border border-violet-500/20 px-3 py-2">
          <p className="text-[10px] text-violet-200/80 leading-relaxed flex items-start gap-1.5">
            <TrendingUp className="h-3 w-3 shrink-0 mt-0.5" />
            {suggestion}
          </p>
        </div>
      )}
    </div>
  );
}
