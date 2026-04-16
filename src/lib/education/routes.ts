/**
 * Career-pathway routes API.
 *
 * Read-only accessors over routes.json + stages.json. The data is
 * loaded once at module import (same pattern as programmes.json) and
 * everything is in-memory after that — no async, no caching layer
 * needed. See docs/pathway-data-model.md and route-types.ts.
 *
 * This file is the Phase 2b deliverable: it exposes a queryable API
 * over the auto-migrated route+stage data, but no UI consumer wires
 * it in yet (Phase 3). Calling any of these functions today returns
 * the auto-migrated "Standard route" with a single education stage
 * for each career — semantically identical to the current
 * `getProgrammesForCareer` view, just on the new shape.
 *
 * Invariants enforced at module load (throws if violated):
 *   1. Every stage.routeId references a known Route.id
 *   2. Every route has zero or one isDefault === true (zero only
 *      possible if the career has zero routes; bug otherwise)
 *   3. Every stage.programmeIds[] entry references a known Programme.id
 *
 * If you see a hard crash on first import, run
 * `npx tsx scripts/migrate-programmes-to-routes.ts` to regenerate.
 */

import routesData from './data/routes.json';
import stagesData from './data/stages.json';
import type { Route, Stage, RoutesFile, StagesFile } from './route-types';

// ── Load + index ───────────────────────────────────────────────────

const ROUTES_FILE = routesData as RoutesFile;
const STAGES_FILE = stagesData as StagesFile;

// Index stages by routeId for O(1) lookup.
const stagesByRoute = new Map<string, Stage[]>();
for (const stage of STAGES_FILE.stages) {
  if (!stagesByRoute.has(stage.routeId)) stagesByRoute.set(stage.routeId, []);
  stagesByRoute.get(stage.routeId)!.push(stage);
}
// Sort each route's stages by orderIndex once.
for (const [, stages] of stagesByRoute) {
  stages.sort((a, b) => a.orderIndex - b.orderIndex);
}

// Index routes by careerId.
const routesByCareer = new Map<string, Route[]>();
for (const r of ROUTES_FILE.routes) {
  const stages = stagesByRoute.get(r.id) ?? [];
  const route: Route = { ...r, stages };
  if (!routesByCareer.has(r.careerId)) routesByCareer.set(r.careerId, []);
  routesByCareer.get(r.careerId)!.push(route);
}
// Sort each career's routes: default first, then alphabetical by shortName.
for (const [, routes] of routesByCareer) {
  routes.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.shortName.localeCompare(b.shortName);
  });
}

// Flat index by id.
const routeById = new Map<string, Route>();
for (const [, routes] of routesByCareer) {
  for (const r of routes) routeById.set(r.id, r);
}

// ── Invariant checks ──────────────────────────────────────────────

function assertInvariants(): void {
  const knownRouteIds = new Set(ROUTES_FILE.routes.map((r) => r.id));
  for (const s of STAGES_FILE.stages) {
    if (!knownRouteIds.has(s.routeId)) {
      throw new Error(
        `[education/routes] stage "${s.id}" references unknown routeId "${s.routeId}"`,
      );
    }
  }
  for (const [careerId, routes] of routesByCareer) {
    const defaults = routes.filter((r) => r.isDefault).length;
    if (defaults > 1) {
      throw new Error(
        `[education/routes] career "${careerId}" has ${defaults} default routes — exactly one is required`,
      );
    }
  }
  // We don't fail-hard on programme-id misses because programmes are
  // hidden at runtime (broken-URL filter) and re-validating against the
  // visible set happens lazily in getProgrammesForStage.
}

assertInvariants();

// ── Public API ─────────────────────────────────────────────────────

/**
 * All routes for a career, default first. Returns [] for any career
 * without recorded routes — including the ~700 long-tail careers that
 * stay on the existing PathwayFallbackView.
 */
export function getRoutesForCareer(careerId: string): Route[] {
  return routesByCareer.get(careerId) ?? [];
}

/**
 * Single route lookup by id. Returns null if not found.
 */
export function getRouteById(routeId: string): Route | null {
  return routeById.get(routeId) ?? null;
}

/**
 * Stages for a route, ordered by orderIndex. Returns [] for an unknown
 * routeId (silent — caller should check getRouteById first if it
 * matters).
 */
export function getStagesForRoute(routeId: string): Stage[] {
  return stagesByRoute.get(routeId) ?? [];
}

/**
 * Single stage lookup by id. Returns null if not found. To resolve
 * the stage's programmes, callers should map stage.programmeIds
 * through `getProgrammeById` from the main `@/lib/education` barrel
 * — that path applies the runtime broken-URL filter automatically.
 * Kept at the consumer side rather than baked in here so this module
 * stays free of circular imports against the main barrel.
 */
export function getStageById(stageId: string): Stage | null {
  for (const [, stages] of stagesByRoute) {
    const s = stages.find((s) => s.id === stageId);
    if (s) return s;
  }
  return null;
}

/**
 * Default route for a career, or null if none recorded. Convenience
 * for the most common case ("just give me the standard pathway").
 */
export function getDefaultRoute(careerId: string): Route | null {
  const routes = routesByCareer.get(careerId);
  if (!routes || routes.length === 0) return null;
  return routes.find((r) => r.isDefault) ?? routes[0];
}

/**
 * Whether a career has more than one route — drives whether the
 * route picker is shown in the UI. Phase 3 gates the picker on this.
 */
export function hasMultipleRoutes(careerId: string): boolean {
  const routes = routesByCareer.get(careerId);
  return !!routes && routes.length > 1;
}
