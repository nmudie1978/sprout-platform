// src/app/contribute/career-param.ts
import type { Career } from "@/lib/career-pathways";

/**
 * Resolve a ?career=<id> param to the contribute form's tag shape, or null.
 * Takes the lookup as a parameter so this stays free of the heavy
 * CAREER_PATHWAYS import — callers pass the resolver from useCareerCatalog().
 */
export function careerTagFromParam(
  param: string | null,
  getCareerById: (id: string) => Career | undefined,
): { id: string; title: string } | null {
  if (!param) return null;
  const career = getCareerById(param);
  return career ? { id: career.id, title: career.title } : null;
}
