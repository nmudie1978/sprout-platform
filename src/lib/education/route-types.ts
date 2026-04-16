/**
 * Career-pathway route data model.
 *
 * Implements the entities sketched in §4 of docs/pathway-data-model.md.
 * Storage is JSON (see src/lib/education/data/routes.json + stages.json),
 * not Prisma — routes are slow-changing editorial content, not user
 * data. Migration to a DB-backed model is straightforward later if a
 * CMS is ever built.
 *
 * IMPORTANT: nothing in this file is wired into the user-facing app
 * yet. Phase 2a (current) lands the types + auto-migration from
 * programmes.json. Phase 2b will wrap these in a queryable API. Phase
 * 3 will surface a route picker. Until then this is dormant infra
 * with one regression-protection invariant: every existing
 * programme.id appears in at least one stage.programmeIds.
 */

/**
 * Editorial classification of a route. The picker UI uses these to
 * label routes ("Common", "Elite", "Via abroad") so users understand
 * why each option exists. A route can carry multiple tags.
 *
 * Keep this list small and meaningful. Adding a tag is cheap; deleting
 * one breaks every JSON file that uses it, so think before extending.
 */
export type RouteTag =
  | 'elite'         // highly competitive entry, e.g. profesjonsstudium med 3000 søkere for 150 plasser
  | 'common'        // the typical route most students take
  | 'lateral-entry' // late switch from another field (e.g. teacher via PPU after a non-teaching bachelor)
  | 'via-abroad'    // includes a non-Norwegian leg (e.g. medicine in Hungary, LLM in UK)
  | 'vocational'    // fagbrev / non-university trade route
  | 'self-taught'   // bootcamp, portfolio, OSS — no formal degree required
  | 'fast'          // shorter elapsed time than the elite/default
  | 'experimental'; // niche / less established / emerging

/**
 * What kind of step a stage represents. Affects how the UI renders it
 * (an "education" stage shows institution cards; a "credential" stage
 * shows the exam/licence info; an "experience" stage shows employer
 * candidates and durations).
 */
export type StageKind =
  | 'education'     // university or vocational programme
  | 'credential'    // exam, licence, registration (e.g. autorisasjon as klinisk psykolog)
  | 'experience'   // supervised practice, internship, work years
  | 'abroad-leg'    // a stage taken in a different country
  | 'lateral-entry'; // joining the field laterally (any-bachelor + PPU)

/**
 * One step within a route. Stages are strictly ordered within their
 * parent route via `orderIndex`. A stage may reference zero programmes
 * (e.g. a "1 year supervised practice" stage with no formal programme),
 * one programme, or many (e.g. "bachelor in psychology" with rows for
 * UiO, UiB, NTNU, UiT).
 */
export interface Stage {
  /** Unique within the dataset. Convention: `<careerId>--<routeSlug>--<stageSlug>`. */
  id: string;
  /** FK to Route.id. */
  routeId: string;
  /** 0-indexed order within the route. Strictly monotonic, no gaps required but conventional. */
  orderIndex: number;
  kind: StageKind;
  /** Plain-English title shown to users, e.g. "Profesjonsstudium i psykologi". */
  title: string;
  /** Elapsed time for this stage in years. Use 0.5 for 6-month stages. */
  durationYears: number;
  /** 1-3 sentences describing what happens in this stage. */
  description: string;
  /** FK to Programme.id values. Empty array allowed (e.g. for credential / experience stages). */
  programmeIds: string[];
  /** Optional: prerequisites in plain English, e.g. "Strong gymnasieexamen with biology + maths". */
  prerequisites?: string;
  /** Optional: what completing this stage gets you, e.g. "Authorisation as klinisk psykolog". */
  outcome?: string;
}

/**
 * A named pathway from start to a career outcome. Rendered as a
 * pickable tab in the route picker.
 */
export interface Route {
  /** Unique within the dataset. Convention: `<careerId>--<routeSlug>`. */
  id: string;
  /** FK to a Career id from career-pathways.ts. */
  careerId: string;
  /** Full route name shown in the picker subtitle, e.g. "Clinical psychologist (profesjonsstudium)". */
  name: string;
  /** Short label for the tab itself, e.g. "Clinical (elite)". Aim for ≤ 22 chars. */
  shortName: string;
  /** 1-2 sentences shown beneath the picker explaining when this route applies. */
  summary: string;
  tags: RouteTag[];
  /** Exactly one route per career has isDefault === true. The default is shown first. */
  isDefault: boolean;
  /** ISO-3166 alpha-2 country code if the route is geo-anchored, null if multi-country. */
  countryCode: string | null;
  /** Total elapsed years across all stages. Convenient for the picker's at-a-glance summary. */
  estimatedYears: number;
  /** Optional editorial note (e.g. competition stats, why this route exists). */
  notes?: string;
  /** Ordered list of stages. Source of truth for the stages JSON file is the separate stages.json,
   *  but consumers will typically receive the assembled Route with stages already attached. */
  stages: Stage[];
}

/**
 * Top-level shape of routes.json on disk. Stages live in stages.json
 * to keep diffs small when content evolves.
 */
export interface RoutesFile {
  meta: {
    /** Source / authorship note. */
    source: string;
    /** ISO date string, YYYY-MM-DD. */
    lastUpdated: string;
    /** Schema version for future migrations. Bump when shape changes. */
    schemaVersion: 1;
  };
  routes: Omit<Route, 'stages'>[];
}

/**
 * Top-level shape of stages.json on disk. Stages reference their
 * parent route by routeId.
 */
export interface StagesFile {
  meta: {
    source: string;
    lastUpdated: string;
    schemaVersion: 1;
  };
  stages: Stage[];
}
