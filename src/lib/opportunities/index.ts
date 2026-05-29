/**
 * OPPORTUNITIES — public barrel.
 *
 * Single import point for consumers. Mirrors the src/lib/events/
 * boundary — types + helper functions, but no provider adapters
 * (importing those directly pulls in node-only utilities like fs).
 */

export * from "./types";
export {
  getOpportunitiesConfig,
  getEnabledProviders,
  getProvidersForCadence,
  getProviderConfig,
  hasEnabledProviders,
} from "./config";
export {
  dedupeOpportunities,
  generateDedupeKey,
  normalizeTitle,
  normalizeEmployer,
  normalizeCity,
} from "./dedupe";
