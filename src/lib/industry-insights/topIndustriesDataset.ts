/**
 * TOP INDUSTRIES DATASET - CURATED STATIC DATA
 *
 * This is a Tier-1 sourced, curated static dataset for the
 * "Big Picture" chart on Industry Insights.
 *
 * SOURCE: International Labour Organization (ILO)
 * REPORT: World Employment and Social Outlook: Trends 2024
 * GEOGRAPHY: Global (developed economies average)
 * YEAR: 2023 (latest available in report)
 *
 * Data represents employment share by broad sector.
 * Categories have been simplified for youth readability.
 *
 * UPDATE CADENCE: Annually (when new ILO report is published)
 * LAST REVIEWED: January 2025
 */

import { TIER1_SOURCES, TIER2_SOURCES, type ApprovedSourceId } from "./tier1-sources";

// ============================================
// DATASET TYPE DEFINITIONS
// ============================================

export interface IndustryCategory {
  /** Short, youth-friendly label */
  name: string;
  /** Share of total employment (percentage) */
  sharePercent: number;
  /** Optional color for chart rendering */
  color?: string;
}

export interface TopIndustriesDataset {
  /** Unique identifier */
  id: string;
  /** Chart title */
  title: string;
  /** Subtitle / clarification */
  subtitle: string;
  /** Geographic scope of the data */
  geographyScope: string;
  /** Year the data represents */
  year: number;
  /** Approved source identifier (Tier-1 or Tier-2) */
  sourceId: ApprovedSourceId;
  /** Display name for attribution */
  sourceName: string;
  /** Optional URL to source report */
  sourceUrl?: string;
  /** Industry categories (max 6 + Other) */
  categories: IndustryCategory[];
  /** Plain language explanation points */
  explanationBullets: string[];
  /** Last verification date (ISO string) */
  lastVerified: string;
}

// ============================================
// CURATED DATASET
// ============================================

/**
 * Global employment by sector - ILO 2024 Trends Report
 *
 * Based on ILO WESO Trends 2024, employment distribution
 * across major economic sectors in developed economies.
 *
 * Categories simplified from ILO ISIC classifications:
 * - Services (trade, hospitality, admin) → Retail & Services
 * - Manufacturing → Manufacturing
 * - Construction → Construction & Trades
 * - Health/Social work → Healthcare
 * - Information/Communication → Tech & Digital
 * - Education → Education
 * - Other sectors grouped
 */
export const TOP_INDUSTRIES_DATASET: TopIndustriesDataset = {
  id: "global-employment-sectors-2023",
  title: "Where most people work",
  subtitle: "Global employment by industry",
  geographyScope: "Developed economies (OECD average)",
  year: 2023,
  sourceId: TIER1_SOURCES.ILO,
  sourceName: "International Labour Organization",
  sourceUrl: "https://www.ilo.org/publications/world-employment-and-social-outlook-trends-2024",
  categories: [
    {
      name: "Retail & Services",
      sharePercent: 28,
      color: "bg-blue-500",
    },
    {
      name: "Healthcare",
      sharePercent: 15,
      color: "bg-rose-500",
    },
    {
      name: "Manufacturing",
      sharePercent: 14,
      color: "bg-amber-500",
    },
    {
      name: "Education",
      sharePercent: 10,
      color: "bg-purple-500",
    },
    {
      name: "Construction & Trades",
      sharePercent: 9,
      color: "bg-orange-500",
    },
    {
      name: "Tech & Digital",
      sharePercent: 6,
      color: "bg-cyan-500",
    },
    {
      name: "Other",
      sharePercent: 18,
      color: "bg-slate-400",
    },
  ],
  explanationBullets: [
    "This shows how global employment is distributed across major industries.",
  ],
  lastVerified: "2025-01-15",
};

// ============================================
// VALIDATION
// ============================================

/**
 * Validate that categories sum to approximately 100%
 * (allows for rounding differences)
 */
export function validateDatasetTotal(dataset: TopIndustriesDataset): boolean {
  const total = dataset.categories.reduce((sum, cat) => sum + cat.sharePercent, 0);
  return total >= 98 && total <= 102;
}

/**
 * Validate dataset follows requirements:
 * - Max 7 categories (6 + Other)
 * - Has Tier-1 source
 * - Has year
 * - Categories sum to ~100%
 */
export function validateDataset(dataset: TopIndustriesDataset): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (dataset.categories.length > 7) {
    errors.push("Maximum 7 categories allowed (6 named + Other)");
  }

  if (!dataset.sourceId) {
    errors.push("Tier-1 source ID is required");
  }

  if (!dataset.year || dataset.year < 2020) {
    errors.push("Year must be 2020 or later");
  }

  if (!validateDatasetTotal(dataset)) {
    const total = dataset.categories.reduce((sum, cat) => sum + cat.sharePercent, 0);
    errors.push(`Categories must sum to ~100% (currently ${total}%)`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Run validation on module load in development
if (process.env.NODE_ENV === "development") {
  const validation = validateDataset(TOP_INDUSTRIES_DATASET);
  if (!validation.valid) {
    console.warn("[TopIndustriesDataset] Validation errors:", validation.errors);
  }
}
