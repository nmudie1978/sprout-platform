/**
 * Career Transition Map — curated route ladders (Phase 2).
 *
 * Curated, static step-by-step ladders to a set of top target careers, in four
 * views (Shortest / Most realistic / Highest success / Lowest barrier). NOT
 * runtime AI — hand-curated data baked at build time. Targets without a curated
 * ladder simply don't expose the route-views (the Full Map still works).
 */

import { slugify } from "@/lib/utils";
import { CURATED_ROUTES } from "./route-ladders-data";

export interface RouteStep {
  role: string;
  duration: string;
  why: string;
}

export type RouteViewKey = "shortest" | "realistic" | "highestSuccess" | "lowestBarrier";

export type CareerRoutes = Record<RouteViewKey, RouteStep[]>;

export const ROUTE_VIEW_KEYS: RouteViewKey[] = ["shortest", "realistic", "highestSuccess", "lowestBarrier"];

export const ROUTE_VIEW_LABELS: Record<RouteViewKey, string> = {
  shortest: "Shortest",
  realistic: "Most realistic",
  highestSuccess: "Highest success",
  lowestBarrier: "Lowest barrier",
};

export const ROUTE_VIEW_BLURB: Record<RouteViewKey, string> = {
  shortest: "The minimum realistic path — fewest steps to get there.",
  realistic: "The route most people actually take — often a little longer, but proven.",
  highestSuccess: "The path with the strongest long-term prospects and progression.",
  lowestBarrier: "The most accessible first step when you have little direct experience.",
};

/** Curated ladders for a target career, or null if none is curated. */
export function getRouteLadders(targetCareer: string | null | undefined): CareerRoutes | null {
  if (!targetCareer) return null;
  return CURATED_ROUTES[slugify(targetCareer)] ?? null;
}
