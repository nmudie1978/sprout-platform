/**
 * Grade scales, per country.
 *
 * Grade matching was written against the Norwegian VGS 1–6 scale, with the
 * scale's assumptions inlined: a "gap of 1" meant one grade because grades
 * were integers 1–6. Sweden's scale is a 0–22.5 meritvärde, so "gap of 1"
 * there would mean 1/22.5 of the range — nearly nothing.
 *
 * A scale therefore carries its own `step`: the distance that counts as ONE
 * grade's worth of movement. Matching measures gaps in steps rather than raw
 * points, so "one grade short is a stretch, two is a reach" holds in every
 * country without the thresholds being re-tuned per scale.
 *
 * VERIFIED against UHR / antagning.se / studera.nu on 2026-09-06 — see
 * docs/superpowers/specs/2026-09-06-country-packs-sweden-design.md §3.
 */

export interface GradeScale {
  id: "no-vgs-1-6" | "se-meritvarde" | "se-hogskoleprovet";
  /** Lowest value a user can hold on this scale. */
  min: number;
  /** Highest value a user can hold. */
  max: number;
  /**
   * One grade's worth of movement. Drives the stretch/reach thresholds and
   * the "what would change this?" coaching hint.
   */
  step: number;
  /** Label for the self-report control. */
  inputLabel: string;
  /** Render a value for display, in the country's own convention. */
  format: (value: number) => string;
}

/**
 * Norway — videregående grades, integers 1–6, 6 being top. One grade is one
 * point, which is why the original integer arithmetic worked.
 */
export const NORWAY_VGS: GradeScale = {
  id: "no-vgs-1-6",
  min: 1,
  max: 6,
  step: 1,
  inputLabel: "Your typical grade (1–6)",
  format: (v) => String(Math.round(v)),
};

/**
 * Sweden — meritvärde. Jämförelsetal is the grade average on a 0–20 scale
 * (A=20, B=17.5, C=15, D=12.5, E=10, F=0), plus up to 2.5 meritpoäng for
 * advanced courses in mathematics, English and modern languages, giving a
 * 22.5 ceiling.
 *
 * `step` is 2.5 because that is one letter grade on the betygspoäng scale —
 * the interval between E and D, D and C, and so on. So "one grade short"
 * means the same thing to a Swedish student as to a Norwegian one.
 *
 * NOTE ON Gy25: Sweden is mid-reform. Gy25 replaces course grades
 * (kursbetyg) with subject grades (ämnesbetyg); the first Gy25 diplomas are
 * awarded in spring 2028, so a 15-year-old starting gymnasium now graduates
 * under Gy25, not Gy11. The reform changes how grades AGGREGATE, not the
 * numeric scale — A is still 20 and the ceiling is still 22.5 — so this
 * scale is correct for both cohorts.
 */
export const SWEDEN_MERITVARDE: GradeScale = {
  id: "se-meritvarde",
  min: 0,
  max: 22.5,
  step: 2.5,
  inputLabel: "Ditt meritvärde (0–22,5)",
  // Swedish uses a comma as the decimal separator.
  format: (v) => v.toFixed(2).replace(".", ","),
};

/**
 * Sweden — Högskoleprovet, the national aptitude test, which is a parallel
 * route into higher education rather than a grade. Normed 0.00–2.00 in steps
 * of 0.05, and a result stays valid for eight years. At least a third of
 * places on a programme are allocated from this group, so for a student with
 * weak grades it is a genuine second chance, not a footnote.
 */
export const SWEDEN_HOGSKOLEPROVET: GradeScale = {
  id: "se-hogskoleprovet",
  min: 0,
  max: 2,
  // One "grade's worth" here is coarser than the 0.05 reporting increment;
  // 0.2 is roughly the gap between adjacent admission thresholds.
  step: 0.2,
  inputLabel: "Ditt högskoleprovsresultat (0,00–2,00)",
  format: (v) => v.toFixed(2).replace(".", ","),
};

/** The default scale for a country. Norway for anything unrecognised. */
const BY_COUNTRY: Record<string, GradeScale> = {
  Norway: NORWAY_VGS,
  Sweden: SWEDEN_MERITVARDE,
};

/**
 * The grade scale a country's users report against. Falls back to the
 * Norwegian scale, which is what every stored `gradeRange` predating this
 * module is expressed in.
 */
export function gradeScaleFor(country?: string | null): GradeScale {
  return (country && BY_COUNTRY[country]) || NORWAY_VGS;
}

/** Clamp a value into a scale's range. Total — never throws. */
export function clampToScale(value: number, scale: GradeScale): number {
  if (!Number.isFinite(value)) return scale.min;
  return Math.min(scale.max, Math.max(scale.min, value));
}
