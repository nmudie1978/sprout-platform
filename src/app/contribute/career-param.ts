// src/app/contribute/career-param.ts
import { getCareerById } from "@/lib/career-pathways";

/** Resolve a ?career=<id> param to the contribute form's tag shape, or null. */
export function careerTagFromParam(param: string | null): { id: string; title: string } | null {
  if (!param) return null;
  const career = getCareerById(param);
  return career ? { id: career.id, title: career.title } : null;
}
