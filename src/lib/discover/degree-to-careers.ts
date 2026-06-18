import mapData from "@/lib/education/data/career-discipline-map.json";
import type { Career } from "@/lib/career-pathways";

const map: Record<string, string> = (mapData as { map: Record<string, string> }).map;

// Inverted index: disciplineId -> careerId[] (built once).
const byDiscipline = new Map<string, string[]>();
for (const [careerId, disciplineId] of Object.entries(map)) {
  const list = byDiscipline.get(disciplineId);
  if (list) list.push(careerId);
  else byDiscipline.set(disciplineId, [careerId]);
}

/** Career ids associated with a field of study (discipline bucket). [] if unknown. */
export function getCareersForDiscipline(disciplineId: string): string[] {
  return byDiscipline.get(disciplineId) ?? [];
}

const GROWTH_RANK: Record<Career["growthOutlook"], number> = { high: 0, medium: 1, stable: 2 };

/** Calm, non-spammy ordering: higher growth first, then title A–Z. Stable. */
export function rankDisciplineCareers(careers: Career[]): Career[] {
  return [...careers].sort(
    (a, b) =>
      GROWTH_RANK[a.growthOutlook] - GROWTH_RANK[b.growthOutlook] ||
      a.title.localeCompare(b.title),
  );
}
