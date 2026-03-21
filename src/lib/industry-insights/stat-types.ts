/**
 * INDUSTRY INSIGHTS — STAT TYPES
 *
 * Shared types for the Job Market Stats system.
 * Includes provenance tracking, dataset versioning, and batch rotation.
 */

// ============================================
// PROVENANCE
// ============================================

export interface StatProvenance {
  /** Human-readable source name, e.g. "World Economic Forum" */
  sourceName: string;
  /** Direct URL to the report or dataset (opens in new tab) */
  sourceUrl: string;
  /** Specific report or publication title */
  reportTitle?: string;
  /** When the data was originally published */
  publishedDate?: string;
  /** When we last retrieved/verified the data */
  retrievedAt: string;
  /** Optional methodological note */
  methodology?: string;
  /** Ready-to-copy citation string */
  citation: string;
}

// ============================================
// STAT DATA ITEMS (mirror existing render types)
// ============================================

export type StatRenderType =
  | "barList"
  | "metric"
  | "bullets"
  | "donut"
  | "radar"
  | "rankingBars"
  | "iconGrid"
  | "stackedBar";

export type StatRegion = "global" | "norway";

/** Filter mode for the region toggle */
export type RegionFilter = "all" | StatRegion;

export interface BarItem {
  label: string;
  value: number;
  color?: string;
}

export interface BulletItem {
  text: string;
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface RadarAxis {
  label: string;
  value: number;
  color?: string;
}

export interface RankingItem {
  rank: number;
  label: string;
  trend?: "up" | "down" | "stable";
  color?: string;
}

export interface IconGridItem {
  icon: string;
  label: string;
  sublabel?: string;
}

export interface StackedSegment {
  label: string;
  value: number;
  color: string;
}

export type StatItemData =
  | BarItem[]
  | BulletItem[]
  | DonutSegment[]
  | RadarAxis[]
  | RankingItem[]
  | IconGridItem[]
  | StackedSegment[];

// ============================================
// STAT DATUM — single stat card with provenance
// ============================================

export interface StatDatum {
  id: string;
  region: StatRegion;
  title: string;
  subtitle: string;
  value?: string;
  valueContext?: string;
  items?: StatItemData;
  note?: string;
  /** Optional one-sentence reality signal — normalises uncertainty, never advises */
  realitySignal?: string;
  renderType: StatRenderType;
  gradientColors: string;
  iconColor: string;
  provenance: StatProvenance;
}

// ============================================
// CARD & BATCH — for API responses
// ============================================

/** A stat card as delivered by the API (includes provenance) */
export type IndustryInsightsCard = StatDatum;

/** A batch of stat cards returned by the API */
export interface IndustryInsightsBatch {
  /** Unique seed for this batch (used to avoid duplicates on "Give me more") */
  seed: number;
  /** The stat cards in this batch */
  cards: IndustryInsightsCard[];
  /** Page labels for the batch */
  pageLabels: string[];
  /** Dataset version identifier */
  datasetVersion: string;
  /** When the dataset was last updated */
  retrievedAt: string;
  /** Total available stats in the bank */
  totalAvailable: number;
  /** Whether more batches are available */
  hasMore: boolean;
  /** Active region filter */
  regionFilter: RegionFilter;
  /** Total batches available for this filter */
  totalBatches: number;
}
