/**
 * Country packs — the per-country data that varies by where a user lives.
 *
 * A pack holds ONLY what is country-specific: local salary, the local
 * education route, translated copy. Everything universal about a career
 * (title, emoji, skills, daily tasks, radar tags) stays in the catalog,
 * which is already how `localizeCareer()` treats it.
 *
 * Packs are generated data files behind a thin reader — the same pattern as
 * `education/data/programmes.json` and `career-progressions.generated.json`.
 * They are validated at build time by `scripts/validate-country-packs.ts`;
 * a pack that fails validation does not ship.
 *
 * See docs/superpowers/specs/2026-09-06-country-packs-sweden-design.md
 */

/**
 * How much we actually know about a figure.
 *
 * - `verified`  — anchored to an official source that resolves. The source
 *                 URL is checked at build time.
 * - `estimated` — generated against official sources and validated by rule,
 *                 but not individually confirmed. MUST be surfaced to the
 *                 user as estimated; it is never presented as fact.
 *
 * This generalises the older `Cited<T>`, which required a source and had no
 * tier. Everything migrated from the hand-curated tables is `verified`.
 */
export type ProvenanceTier = "verified" | "estimated";

export interface Provenanced<T> {
  value: T;
  tier: ProvenanceTier;
  /** URL or precise citation. Required; must resolve when tier is verified. */
  source: string;
  /** ISO date the figure was last checked against its source. */
  verifiedAt?: string;
}

/**
 * Per-career country overrides. Every field is optional: a pack that knows
 * a career's education path but not its salary supplies only the path, and
 * the salary is suppressed rather than filled with a Norwegian figure.
 */
export interface PackCareer {
  careerId: string;
  /** Translated copy. Not country-facts, so no provenance needed. */
  description?: string;
  dailyTasks?: string[];
  keySkills?: string[];
  /**
   * Display-ready local salary text, e.g. "38 800–72 500 kr/mån (median ca
   * 52 500 kr/mån)". Kept as text rather than {min,max} because the curated
   * strings carry median and regional context that a numeric range loses.
   * Structured figures arrive with the database follow-on, when something
   * actually needs to compute on them.
   */
  salary?: Provenanced<string>;
  /** The typical local route into this career. */
  educationPath?: Provenanced<string>;
  /**
   * Typical grade band of successful applicants, in the country's OWN scale
   * units — Swedish bands are meritvärde (0–22.5), not the Norwegian 1–6.
   *
   * For Sweden these come from published antagningspoäng: the score of the
   * last person admitted, per institution. The floor is the least
   * competitive institution offering the route and the ceiling the most,
   * which is exactly what GradeBand means by floor and ceiling.
   */
  gradeBand?: Provenanced<PackGradeBand>;
}

/** Floor/ceiling in the country's own grade scale. */
export interface PackGradeBand {
  floor: number;
  ceiling: number;
}

export interface PackMeta {
  /** ISO timestamp; absent for hand-curated packs. */
  generatedAt?: string;
  /** Authoritative sources this pack draws on, for the provenance footer. */
  sources: string[];
  /**
   * Coverage counts, asserted against reality by the build validator so a
   * shortfall fails CI rather than being discovered on launch day.
   */
  coverage: {
    careers: number;
    verified: number;
    estimated: number;
  };
}

export interface CountryPack {
  /** ISO 3166-1 alpha-2. */
  code: string;
  /** Display name — must match `YouthProfile.country` exactly. */
  country: string;
  /** careerId → overrides. */
  careers: Record<string, PackCareer>;
  /**
   * Local names for the shared entry-route vocabulary. The semantics of the
   * routes are common across the Nordics — vocational upper-secondary
   * certificate, short tertiary vocational college, long professional degree
   * — only the names differ. One enum, country-specific display: this is what
   * lets Sweden read "yrkesexamen" where Norway reads "fagbrev" without
   * forking the matching logic.
   *
   * Keyed by `EntryRoute` from career-pathways; partial by design.
   */
  routeLabels?: Record<string, string>;
  meta: PackMeta;
}
