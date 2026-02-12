/**
 * Industry Insights Pool — Types
 *
 * Unified content pool for verified articles, videos, stat reports, and PDFs
 * from Tier-1 sources. Served via rotation with anti-repeat tracking.
 */

// ---------------------------------------------------------------------------
// Pool item types
// ---------------------------------------------------------------------------

export type PoolContentType = "article" | "video" | "stat_report" | "pdf";
export type VerificationStatus = "verified" | "failed" | "pending";

export interface PoolItem {
  id: string;
  title: string;
  /** 1-2 sentence summary, Gen-Z friendly tone */
  summary: string;
  sourceName: string;
  sourceUrl: string;
  contentType: PoolContentType;
  tags: string[];
  domain: string;
  publishDate?: string;
  addedAt: string;
  lastVerifiedAt: string;
  verificationStatus: VerificationStatus;
  /** SHA-256 hex of canonicalized URL — used for deduplication */
  canonicalUrlHash: string;
  thumbnailUrl?: string;
  /** For videos, e.g. "5:27" */
  duration?: string;
}

// ---------------------------------------------------------------------------
// Seed candidate (pre-verification input)
// ---------------------------------------------------------------------------

export interface SeedCandidate {
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  contentType: PoolContentType;
  tags: string[];
  publishDate?: string;
  thumbnailUrl?: string;
  duration?: string;
}

// ---------------------------------------------------------------------------
// Pool metadata (written by refresh script)
// ---------------------------------------------------------------------------

export interface VerificationHealthEntry {
  domain: string;
  checked: number;
  passed: number;
  failed: number;
  lastCheckedAt: string;
}

export interface PoolMetadata {
  lastRefreshISO: string;
  totalItems: number;
  totalVerified: number;
  totalFailed: number;
  totalPending: number;
  duplicatesRejected: number;
  byType: Record<PoolContentType, number>;
  byDomain: Record<string, number>;
  verificationHealth: VerificationHealthEntry[];
}

// ---------------------------------------------------------------------------
// Batch request / response (API layer)
// ---------------------------------------------------------------------------

export interface PoolBatchRequest {
  batchSize?: number;
  excludeIds?: string[];
  preferTypes?: PoolContentType[];
  tags?: string[];
}

export interface PoolBatchResponse {
  items: PoolItem[];
  totalPoolSize: number;
  hasMore: boolean;
}

// ---------------------------------------------------------------------------
// localStorage history (client-side anti-repeat)
// ---------------------------------------------------------------------------

export interface InsightHistoryEntry {
  contentId: string;
  shownAt: string;
}
