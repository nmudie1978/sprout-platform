/**
 * Career Transition Map — route metadata (Phase 1).
 *
 * Curated, indicative metadata per route type: a one-line blurb, a typical
 * duration, a difficulty band, a success-likelihood (1–5 ★) and a colour key.
 * These are deterministic heuristics — NOT per-career data (that's a later
 * phase). Colours follow the spec: practical=green, network=blue, skills=purple,
 * portfolio=orange, reality/other=slate/grey.
 */

import type { BranchKind } from '@/lib/journey/bridge-mindmap-types';

export type RouteColor = 'green' | 'blue' | 'purple' | 'orange' | 'slate' | 'grey';

export interface RouteMeta {
  /** Strategic title shown on the card (overrides the raw branch title). */
  title: string;
  blurb: string;
  duration: string;
  difficulty: 'Low' | 'Low–Medium' | 'Medium' | 'Medium–High';
  /** Success likelihood, 1–5. */
  likelihood: number;
  color: RouteColor;
}

/** Extra synthetic route kinds the map adds beyond the bridge engine. */
export type MapRouteKind = BranchKind | 'related' | 'reality';

export const ROUTE_META: Record<MapRouteKind, RouteMeta> = {
  'workplace-nav': {
    title: 'Get into a workplace',
    blurb: 'Practical, often funded routes in — placements, supported hiring and NAV measures.',
    duration: '1–6 months',
    difficulty: 'Low–Medium',
    likelihood: 5,
    color: 'green',
  },
  network: {
    title: 'Go through people',
    blurb: 'Reach the roles that never get advertised — most hires happen this way.',
    duration: 'Ongoing',
    difficulty: 'Medium',
    likelihood: 4,
    color: 'blue',
  },
  anchor: {
    title: 'Use the strengths you already have',
    blurb: 'Lean on the transferable skills your background already gives you.',
    duration: 'Ongoing',
    difficulty: 'Low',
    likelihood: 4,
    color: 'purple',
  },
  training: {
    title: 'Targeted upskilling',
    blurb: 'Close one specific gap with a short course or certification — not another full degree.',
    duration: '3–9 months',
    difficulty: 'Medium',
    likelihood: 4,
    color: 'purple',
  },
  proof: {
    title: 'Build proof you can do the job',
    blurb: 'Show evidence — a small portfolio, projects or a short placement that proves it.',
    duration: '1–3 months',
    difficulty: 'Medium',
    likelihood: 4,
    color: 'orange',
  },
  programmes: {
    title: 'Entry-level routes & programmes',
    blurb: 'Where to find graduate schemes, apprenticeships and entry-level openings — plus what they really ask for.',
    duration: 'Ongoing',
    difficulty: 'Low',
    likelihood: 4,
    color: 'slate',
  },
  related: {
    title: 'Related careers',
    blurb: 'Close cousins of your target — if the first choice stalls, these are still open to you.',
    duration: '—',
    difficulty: 'Low',
    likelihood: 4,
    color: 'slate',
  },
  reality: {
    title: 'Reality check',
    blurb: 'An honest read on the transition — supportive, not discouraging.',
    duration: '—',
    difficulty: 'Medium',
    likelihood: 3,
    color: 'grey',
  },
  tried: {
    title: 'Already tried',
    blurb: "Routes you've already explored — set aside so you can focus on what's left.",
    duration: '—',
    difficulty: 'Low',
    likelihood: 3,
    color: 'grey',
  },
};

/** Tailwind class fragments per colour, for the card accents. */
export const ROUTE_COLOR_CLASSES: Record<RouteColor, { border: string; dot: string; text: string; glow: string }> = {
  green: { border: 'border-emerald-500/40', dot: 'bg-emerald-400', text: 'text-emerald-300', glow: 'shadow-emerald-500/10' },
  blue: { border: 'border-sky-500/40', dot: 'bg-sky-400', text: 'text-sky-300', glow: 'shadow-sky-500/10' },
  purple: { border: 'border-violet-500/40', dot: 'bg-violet-400', text: 'text-violet-300', glow: 'shadow-violet-500/10' },
  orange: { border: 'border-orange-500/40', dot: 'bg-orange-400', text: 'text-orange-300', glow: 'shadow-orange-500/10' },
  slate: { border: 'border-slate-400/40', dot: 'bg-slate-300', text: 'text-slate-300', glow: 'shadow-slate-500/10' },
  grey: { border: 'border-border/50', dot: 'bg-muted-foreground/50', text: 'text-muted-foreground', glow: 'shadow-black/10' },
};
