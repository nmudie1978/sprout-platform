import type { CareerLocalizationEntry } from "./types";

/**
 * Spanish per-career overrides. Real, CITED data only — any figure that
 * cannot be verified is omitted (English fallback / suppressed), never
 * invented. Salary/educationPath carry a `source`. See the design spec:
 * docs/superpowers/specs/2026-06-02-spain-substrate-localization-design.md
 *
 * NOTE: this `doctor` entry is a temporary scaffold replaced with fully
 * verified data in plan Task 4.
 */
export const ES_CAREER_LOCALIZATION: Record<string, CareerLocalizationEntry> = {
  doctor: {
    description:
      "Diagnostica y trata enfermedades, y acompaña a los pacientes a lo largo de su recuperación.",
    salary: {
      value: "35.000 - 80.000 €/año (según especialidad y región)",
      source: "PLACEHOLDER — replaced with verified source in Task 4",
    },
    educationPath: {
      value: "Grado en Medicina (6 años) + examen MIR para acceder a la residencia",
      source: "PLACEHOLDER — replaced with verified source in Task 4",
    },
  },
};
