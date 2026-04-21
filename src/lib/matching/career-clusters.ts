/**
 * Career Cluster Engine
 *
 * Computes similarity between careers using the same dimensional
 * profiles the matching engine builds. For any given career, returns
 * the top-N most similar careers with a human-readable relationship
 * label explaining WHY they're similar ("Similar work environment",
 * "Same school subjects apply", etc.).
 *
 * Used by the Career Cluster Map (Career Radar sub-feature) to show
 * "If you're interested in X, you might also like Y, Z, W."
 */

import { buildCareerProfile, clearProfileCache } from "./engine";
import type { CareerMatchProfile } from "./types";
import { getAllCareers, findCareerCategory, type Career } from "@/lib/career-pathways";

// ── Types ──────────────────────────────────────────────────────────

export interface RelatedCareer {
  career: Career;
  similarity: number; // 0-1
  label: string;      // human-readable relationship description
  sharedTraits: string[]; // e.g. ["desk work", "analytical", "high academic demand"]
}

export interface ClusterResult {
  center: Career;
  related: RelatedCareer[];
}

// ── Dimension-level similarity ─────────────────────────────────────

interface DimensionSimilarity {
  name: string;
  label: string;
  similarity: number;
}

function dimensionSimilarities(a: CareerMatchProfile, b: CareerMatchProfile): DimensionSimilarity[] {
  return [
    { name: "workStyle", label: "Similar work environment", similarity: 1 - avgDiff([a.desk - b.desk, a.handsOn - b.handsOn, a.outdoors - b.outdoors, a.creative - b.creative]) },
    { name: "people", label: "Similar people orientation", similarity: 1 - Math.abs(a.peopleOrientation - b.peopleOrientation) },
    { name: "thinking", label: "Similar thinking style", similarity: 1 - avgDiff([a.analytical - b.analytical, a.variety - b.variety]) },
    { name: "academic", label: "Similar study commitment", similarity: 1 - Math.abs(a.academicDemand - b.academicDemand) },
  ];
}

function avgDiff(diffs: number[]): number {
  return diffs.reduce((sum, d) => sum + Math.abs(d), 0) / diffs.length;
}

// ── Shared traits (human-readable) ─────────────────────────────────

function sharedTraits(a: CareerMatchProfile, b: CareerMatchProfile): string[] {
  const traits: string[] = [];
  if (a.desk > 0.6 && b.desk > 0.6) traits.push("desk work");
  if (a.handsOn > 0.6 && b.handsOn > 0.6) traits.push("hands-on work");
  if (a.outdoors > 0.6 && b.outdoors > 0.6) traits.push("outdoor work");
  if (a.creative > 0.6 && b.creative > 0.6) traits.push("creative");
  if (a.analytical > 0.6 && b.analytical > 0.6) traits.push("analytical");
  if (a.peopleOrientation > 0.7 && b.peopleOrientation > 0.7) traits.push("people-focused");
  if (a.peopleOrientation < 0.3 && b.peopleOrientation < 0.3) traits.push("independent work");
  if (a.academicDemand > 0.7 && b.academicDemand > 0.7) traits.push("high academic demand");
  if (a.category === b.category) traits.push("same career family");
  return traits;
}

// ── Overall similarity ─────────────────────────────────────────────

function overallSimilarity(a: CareerMatchProfile, b: CareerMatchProfile): number {
  const dims = dimensionSimilarities(a, b);
  // Weighted average — work style matters most for "feels similar"
  const weights = [0.35, 0.2, 0.25, 0.2]; // workStyle, people, thinking, academic
  let total = 0;
  for (let i = 0; i < dims.length; i++) {
    total += dims[i].similarity * weights[i];
  }
  // Category bonus — same career family bumps similarity
  if (a.category === b.category) total = Math.min(1, total + 0.08);
  return total;
}

// ── Best relationship label ────────────────────────────────────────

function bestLabel(a: CareerMatchProfile, b: CareerMatchProfile): string {
  if (a.category === b.category) return "Same career family";
  const dims = dimensionSimilarities(a, b);
  dims.sort((x, y) => y.similarity - x.similarity);
  return dims[0].label;
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Get the N most similar careers to the given career ID.
 * Returns a ClusterResult with the center career and sorted related
 * careers. Filters out careers from the same category if `diversify`
 * is true (default) — ensures the user sees adjacent fields, not
 * just variations within the same family.
 */
export function getCareerCluster(
  careerId: string,
  options: { limit?: number; diversify?: boolean } = {},
): ClusterResult | null {
  const { limit = 8, diversify = true } = options;
  const allCareers = getAllCareers();
  const center = allCareers.find((c) => c.id === careerId);
  if (!center) return null;

  const centerProfile = buildCareerProfile(center);
  const centerCategory = findCareerCategory(center.id);

  // Score every other career
  const scored: { career: Career; sim: number; profile: CareerMatchProfile }[] = [];
  for (const c of allCareers) {
    if (c.id === careerId) continue;
    const profile = buildCareerProfile(c);
    const sim = overallSimilarity(centerProfile, profile);
    scored.push({ career: c, sim, profile });
  }

  scored.sort((a, b) => b.sim - a.sim);

  // Diversity: cap same-category results to 40% of limit
  const maxSameCategory = diversify ? Math.ceil(limit * 0.4) : limit;
  let sameCategoryCount = 0;
  const selected: RelatedCareer[] = [];

  for (const s of scored) {
    if (selected.length >= limit) break;
    const cat = findCareerCategory(s.career.id);
    if (cat === centerCategory) {
      if (sameCategoryCount >= maxSameCategory) continue;
      sameCategoryCount++;
    }
    selected.push({
      career: s.career,
      similarity: Math.round(s.sim * 100) / 100,
      label: bestLabel(centerProfile, s.profile),
      sharedTraits: sharedTraits(centerProfile, s.profile),
    });
  }

  return { center, related: selected };
}

/**
 * Get clusters for multiple careers at once (e.g. the user's saved
 * careers). Returns a Map of careerId → ClusterResult.
 */
export function getMultipleClusters(
  careerIds: string[],
  options: { limit?: number } = {},
): Map<string, ClusterResult> {
  const map = new Map<string, ClusterResult>();
  for (const id of careerIds) {
    const cluster = getCareerCluster(id, options);
    if (cluster) map.set(id, cluster);
  }
  return map;
}
