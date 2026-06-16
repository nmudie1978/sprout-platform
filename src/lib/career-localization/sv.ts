import type { CareerLocalizationEntry } from "./types";

/**
 * Sweden career localization (Approach A — partial per-career overrides).
 *
 * Currently EMPTY by design. While this table is registered for Sweden, any
 * career WITHOUT an entry renders with `isLocalized: false`: the universal
 * title/description/skills still show, but the Norway-specific salary and
 * education path are SUPPRESSED (the UI shows a "not yet tailored" marker)
 * rather than displaying wrong NOK figures or Norwegian study routes.
 *
 * TO POPULATE: add entries keyed by `career.id` with VERIFIED, CITED data —
 * SEK salary ranges sourced from SCB (Statistics Sweden) lönestatistik and
 * education paths in Swedish terms (gymnasium → högskola/universitet/YH, CSN,
 * antagning.se). Every `salary`/`educationPath` MUST carry a real `source`;
 * omit any field you cannot cite (see es.ts for the shape).
 */
export const SV_CAREER_LOCALIZATION: Record<string, CareerLocalizationEntry> = {};
