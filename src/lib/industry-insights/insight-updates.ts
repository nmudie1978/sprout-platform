/**
 * Insight Update Types & Utilities
 *
 * Lightweight data model for detected industry insight updates.
 * Derived from IndustryInsightsModule version changes — no new DB table needed.
 */

// ============================================
// TYPES
// ============================================

export interface InsightUpdate {
  id: string;
  sourceName: string;
  sourceType: "report" | "outlook" | "research" | "data" | "resource";
  title: string;
  summary: string;
  url?: string;
  publishedAt: string;
  detectedAt: string;
  relevanceType: "annual_report" | "labour_outlook" | "skills_forecast" | "salary_update" | "ai_impact" | "regional" | "resource";
  moduleKey: string;
  version: number;
}

// ============================================
// MODULE → UPDATE MAPPING
// ============================================

/** Map module keys to human-readable update metadata */
const MODULE_UPDATE_META: Record<string, {
  sourceType: InsightUpdate["sourceType"];
  relevanceType: InsightUpdate["relevanceType"];
  titleTemplate: string;
  summaryTemplate: string;
}> = {
  top_industries: {
    sourceType: "report",
    relevanceType: "annual_report",
    titleTemplate: "New industry update",
    summaryTemplate: "Updated industry growth data is now available.",
  },
  hot_roles: {
    sourceType: "outlook",
    relevanceType: "labour_outlook",
    titleTemplate: "New report detected",
    summaryTemplate: "In-demand roles have been refreshed with newer data.",
  },
  skills_trends: {
    sourceType: "research",
    relevanceType: "skills_forecast",
    titleTemplate: "Fresh insight added",
    summaryTemplate: "Skills demand data has been updated.",
  },
  salary_bands: {
    sourceType: "data",
    relevanceType: "salary_update",
    titleTemplate: "Updated outlook available",
    summaryTemplate: "Salary range data has been refreshed.",
  },
  ai_impact: {
    sourceType: "research",
    relevanceType: "ai_impact",
    titleTemplate: "New industry update",
    summaryTemplate: "AI and automation impact insights have been updated.",
  },
  regional_insights: {
    sourceType: "data",
    relevanceType: "regional",
    titleTemplate: "Fresh insight added",
    summaryTemplate: "Regional job market data has been refreshed.",
  },
  resources_links: {
    sourceType: "resource",
    relevanceType: "resource",
    titleTemplate: "New resources detected",
    summaryTemplate: "New learning resources and courses are available.",
  },
  whats_new: {
    sourceType: "outlook",
    relevanceType: "labour_outlook",
    titleTemplate: "New report detected",
    summaryTemplate: "New job market updates are available.",
  },
};

// ============================================
// CONVERSION
// ============================================

/**
 * Convert a raw module record (from the API) into an InsightUpdate.
 * Only modules with version > 1 represent a real update (version 1 = initial seed).
 */
export function moduleToUpdate(module: {
  key: string;
  title: string;
  version: number;
  lastUpdated: string;
  source?: { name?: string; url?: string } | null;
}): InsightUpdate | null {
  if (module.version <= 1) return null;

  const meta = MODULE_UPDATE_META[module.key];
  if (!meta) return null;

  return {
    id: `${module.key}-v${module.version}`,
    sourceName: module.source?.name ?? module.title,
    sourceType: meta.sourceType,
    title: meta.titleTemplate,
    summary: meta.summaryTemplate,
    url: module.source?.url,
    publishedAt: module.lastUpdated,
    detectedAt: module.lastUpdated,
    relevanceType: meta.relevanceType,
    moduleKey: module.key,
    version: module.version,
  };
}

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const SEEN_KEY = "insight-updates-seen";
const TOAST_SHOWN_KEY = "insight-updates-toasted";

/** Get set of update IDs the user has already seen in the recent-updates list */
export function getSeenUpdateIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Mark an update ID as seen */
export function markUpdateSeen(id: string): void {
  try {
    const seen = getSeenUpdateIds();
    seen.add(id);
    // Keep only last 50 to avoid unbounded growth
    const arr = [...seen].slice(-50);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch { /* noop */ }
}

/** Get set of update IDs already shown as toasts */
export function getToastedUpdateIds(): Set<string> {
  try {
    const raw = localStorage.getItem(TOAST_SHOWN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Mark an update ID as having been shown in a toast */
export function markUpdateToasted(id: string): void {
  try {
    const toasted = getToastedUpdateIds();
    toasted.add(id);
    const arr = [...toasted].slice(-50);
    localStorage.setItem(TOAST_SHOWN_KEY, JSON.stringify(arr));
  } catch { /* noop */ }
}
