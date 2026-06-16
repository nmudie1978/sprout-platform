import type { CareerLocalizationEntry } from "./types";

/**
 * Denmark career localization (Approach A — partial per-career overrides).
 *
 * Currently EMPTY by design. While this table is registered for Denmark, any
 * career WITHOUT an entry renders with `isLocalized: false`: the universal
 * title/description/skills still show, but the Norway-specific salary and
 * education path are SUPPRESSED (the UI shows a "not yet tailored" marker)
 * rather than displaying wrong NOK figures or Norwegian study routes.
 *
 * TO POPULATE: add entries keyed by `career.id` with VERIFIED, CITED data —
 * DKK salary ranges sourced from Danmarks Statistik and education paths in
 * Danish terms (ungdomsuddannelse → universitet/professionshøjskole/
 * erhvervsakademi, SU, optagelse.dk). Every `salary`/`educationPath` MUST
 * carry a real `source`; omit any field you cannot cite (see es.ts for shape).
 */
export const DA_CAREER_LOCALIZATION: Record<string, CareerLocalizationEntry> = {};
