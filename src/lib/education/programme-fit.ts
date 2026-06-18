/**
 * Programme ↔ career fit.
 *
 * When a university/college user has named their study programme AND a career
 * goal, we can honestly flag when the programme does not naturally lead to that
 * career (e.g. a Robotics programme → Psychologist). Used to drive a calm,
 * non-blocking "check this fits" badge on the Clarity roadmap foundation card.
 *
 * Deterministic and conservative: it only returns `mismatch` when BOTH the
 * programme resolves to a known field AND the career's discipline sits clearly
 * outside that field's discipline family. Anything uncertain → `unknown`
 * (the caller stays silent), so we never cry wolf.
 */
import { FIELD_OPTIONS, getCareersForField, type FieldOption } from "@/lib/discover/field-options";
import { getDisciplineForCareer } from "@/lib/education/alternatives";
import { resolveCareer } from "@/lib/education";

export type ProgrammeFit = "fit" | "mismatch" | "unknown";

/**
 * Resolve a (possibly free-text) study programme to a curated field option.
 * Exact label match first, then exact alias match. Returns null for anything
 * we can't confidently classify — the fit check then stays silent.
 */
export function resolveProgrammeField(text: string | null | undefined): FieldOption | null {
  if (!text) return null;
  const t = text.trim().toLowerCase();
  if (!t) return null;
  return (
    FIELD_OPTIONS.find((o) => o.label.toLowerCase() === t) ??
    FIELD_OPTIONS.find((o) => o.aliases.some((a) => a.toLowerCase() === t)) ??
    null
  );
}

/** The discipline bucket(s) a field represents. */
function programmeDisciplines(field: FieldOption): Set<string> {
  // Synthetic, multi-discipline field (e.g. "robotics") → the disciplines of
  // its curated careers.
  if (field.careerIds && field.careerIds.length > 0) {
    const set = new Set<string>();
    for (const cid of field.careerIds) {
      const d = getDisciplineForCareer(cid);
      if (d) set.add(d);
    }
    return set;
  }
  // Discipline-backed field → the field id IS the discipline id.
  return new Set([field.id]);
}

/**
 * Does the user's study programme naturally lead to their chosen career?
 * Returns `unknown` (caller stays silent) whenever we can't be sure.
 */
export function programmeCareerFit(
  programme: string | null | undefined,
  careerIdOrTitle: string | null | undefined,
): ProgrammeFit {
  if (!careerIdOrTitle) return "unknown";
  const field = resolveProgrammeField(programme);
  if (!field) return "unknown";

  // 1. Direct reachability — the career is in this field's career set.
  const careerId = resolveCareer(careerIdOrTitle) ?? careerIdOrTitle;
  const reachable = new Set(getCareersForField(field.id));
  if (reachable.has(careerId)) return "fit";

  // 2. Discipline-family comparison.
  const careerDiscipline = getDisciplineForCareer(careerIdOrTitle);
  if (!careerDiscipline) return "unknown";
  const progDisciplines = programmeDisciplines(field);
  if (progDisciplines.size === 0) return "unknown";
  return progDisciplines.has(careerDiscipline) ? "fit" : "mismatch";
}
