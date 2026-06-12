/**
 * Explored-derived career recommendations.
 *
 * Powers the dashboard "Recommended for you" panel. Instead of needing a
 * Discover-quiz profile, it recommends careers adjacent to what the user has
 * already engaged with — explored journeys, saved careers, and interest
 * ratings. A career the user rated highly pulls its neighbours up; a paused,
 * unrated one nudges them only gently.
 *
 * Pure and deterministic (no Date/Math.random), so it's easy to unit-test and
 * safe to memoise on the client.
 */
import type { Career, CareerCategory } from "@/lib/career-pathways";

/**
 * Catalog access this module needs. Passing it in (rather than importing
 * CAREER_PATHWAYS) keeps the heavy catalog out of the client bundle — the
 * dashboard supplies it from useCareerCatalog(). Server callers can pass
 * the static helpers.
 */
export interface CareerLookup {
  all: Career[];
  categoryForCareer: (id: string) => CareerCategory | undefined;
}

export type RecommendationSignalKind = "explored" | "saved" | "rated";

/** One thing the user has engaged with, used as a recommendation seed. */
export interface RecommendationSignal {
  careerId: string;
  /** Higher = stronger pull. Rated careers weigh more than saved/explored. */
  weight: number;
  kind: RecommendationSignalKind;
  /** Display title for the "Because you …" attribution. */
  title?: string;
}

export interface ExploredRecommendation {
  career: Career;
  /**
   * English fallback, e.g. "Because you explored Product Manager".
   * UI should prefer the structured `reasonKind` + `reasonTitle` fields
   * and translate them (see the dashboard "Recommended for you" panel).
   */
  reason: string;
  /** Which engagement produced this pick — drives the localised "Because you …" line. */
  reasonKind: RecommendationSignalKind;
  /** The career title to interpolate into the localised reason. */
  reasonTitle: string;
  sourceCareerId: string;
}

const CATEGORY_MATCH = 3;
const SHARED_SKILL = 1;

function reasonFor(kind: RecommendationSignalKind, title: string): string {
  if (kind === "saved") return `Because you saved ${title}`;
  return `Because you explored ${title}`;
}

/**
 * Rank careers by how strongly they relate (shared category + skills) to the
 * user's engaged careers, weighted by each signal's strength. Already-engaged
 * careers are never recommended back. Returns at most `limit` picks; an empty
 * input (a brand-new user) yields an empty list so the caller can show a
 * cold-start prompt.
 */
export function getExploredRecommendations(
  signals: RecommendationSignal[],
  lookup: CareerLookup,
  limit = 3,
): ExploredRecommendation[] {
  if (signals.length === 0) return [];

  const all = lookup.all;
  const byId = new Map(all.map((c) => [c.id, c]));
  const categoryOf = { get: (id: string) => lookup.categoryForCareer(id) };
  const excluded = new Set(signals.map((s) => s.careerId));

  // Resolve each signal to its career + skill set; drop unknown ids.
  const sources = signals
    .map((s) => {
      const career = byId.get(s.careerId);
      if (!career) return null;
      return {
        signal: s,
        category: categoryOf.get(career.id),
        skills: new Set(career.keySkills.map((k) => k.toLowerCase())),
        title: s.title ?? career.title,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (sources.length === 0) return [];

  interface Acc {
    score: number;
    bestSource: (typeof sources)[number];
    bestContribution: number;
  }
  const scores = new Map<string, Acc>();

  for (const cand of all) {
    if (excluded.has(cand.id)) continue;
    const candCategory = categoryOf.get(cand.id);
    const candSkills = new Set(cand.keySkills.map((k) => k.toLowerCase()));

    for (const src of sources) {
      let affinity = 0;
      if (candCategory && src.category && candCategory === src.category) {
        affinity += CATEGORY_MATCH;
      }
      let shared = 0;
      for (const skill of candSkills) if (src.skills.has(skill)) shared++;
      affinity += shared * SHARED_SKILL;
      if (affinity === 0) continue;

      const contribution = affinity * src.signal.weight;
      const prev = scores.get(cand.id);
      if (!prev) {
        scores.set(cand.id, {
          score: contribution,
          bestSource: src,
          bestContribution: contribution,
        });
      } else {
        prev.score += contribution;
        if (contribution > prev.bestContribution) {
          prev.bestContribution = contribution;
          prev.bestSource = src;
        }
      }
    }
  }

  return [...scores.entries()]
    .map(([id, acc]) => ({ career: byId.get(id)!, acc }))
    .sort((a, b) => {
      if (b.acc.score !== a.acc.score) return b.acc.score - a.acc.score;
      // Deterministic tie-breaks: prefer high-growth, then alphabetical.
      const ga = a.career.growthOutlook === "high" ? 1 : 0;
      const gb = b.career.growthOutlook === "high" ? 1 : 0;
      if (gb !== ga) return gb - ga;
      return a.career.title.localeCompare(b.career.title);
    })
    .slice(0, limit)
    .map(({ career, acc }) => ({
      career,
      sourceCareerId: acc.bestSource.signal.careerId,
      reason: reasonFor(acc.bestSource.signal.kind, acc.bestSource.title),
      reasonKind: acc.bestSource.signal.kind,
      reasonTitle: acc.bestSource.title,
    }));
}
