/**
 * My Library — "Exploring" tab pure logic.
 *
 * Groups the careers a user has explored into one ranked list with category
 * headers. Kept free of React / DOM / Prisma so it can be unit-tested in
 * isolation and reused by the page and (later) the dashboard.
 *
 * Ranking (owner-approved, see docs spec 2026-06-02-library-exploring-tab):
 *   - Categories are ordered by the highest interest rating inside each
 *     (the category holding the user's top-rated career comes first).
 *   - Within a category: interest descending, then title A→Z as a tiebreak.
 *   - Uncategorised careers fall under a final "Other" group, always last.
 *   - Single-career categories still render their own header.
 *   - "Completed" (all three journey lenses) is carried as a flag for a
 *     quiet ✓ badge — it does NOT affect ordering.
 */
import type { CareerCategory } from "@/lib/career-pathways";
import type { InterestLevel } from "@/lib/interest-level/types";

/** Synthetic category for careers with no catalog category. Always sorts last. */
export const OTHER_CATEGORY = "OTHER" as const;
export type ExploringCategory = CareerCategory | typeof OTHER_CATEGORY;

export interface ExploringEntry {
  /** Slugified career id (matches Career.id and JourneyGoalData.goalId). */
  careerId: string;
  title: string;
  emoji: string;
  /** Catalog category, or null when the career isn't categorised. */
  category: CareerCategory | null;
  /** The user's ★1–5 rating, or null if unrated. */
  interest: InterestLevel | null;
  /** True when the journey reached Clarity (all lenses done). */
  completed: boolean;
  /** True when this is the user's current/active primary goal. */
  isActive: boolean;
}

export interface ExploringGroup {
  category: ExploringCategory;
  label: string;
  entries: ExploringEntry[];
}

/** Human-readable header for each career category. */
export const CATEGORY_LABELS: Record<ExploringCategory, string> = {
  HEALTHCARE_LIFE_SCIENCES: "Healthcare & Life Sciences",
  EDUCATION_TRAINING: "Education & Training",
  TECHNOLOGY_IT: "Technology & IT",
  ARTIFICIAL_INTELLIGENCE: "Artificial Intelligence",
  BUSINESS_MANAGEMENT: "Business & Management",
  FINANCE_BANKING: "Finance & Banking",
  SALES_MARKETING: "Sales & Marketing",
  MANUFACTURING_ENGINEERING: "Manufacturing & Engineering",
  LOGISTICS_TRANSPORT: "Logistics & Transport",
  HOSPITALITY_TOURISM: "Hospitality & Tourism",
  TELECOMMUNICATIONS: "Telecommunications",
  CREATIVE_MEDIA: "Creative & Media",
  PUBLIC_SERVICE_SAFETY: "Public Service & Safety",
  MILITARY_DEFENCE: "Military & Defence",
  SPORT_FITNESS: "Sport & Fitness",
  REAL_ESTATE_PROPERTY: "Real Estate & Property",
  SOCIAL_CARE_COMMUNITY: "Social Care & Community",
  CONSTRUCTION_TRADES: "Construction & Trades",
  OTHER: "Other",
};

/** Treat an unrated career as the lowest rank so it sorts below any rating. */
function rank(interest: InterestLevel | null): number {
  return interest ?? 0;
}

/**
 * Group explored careers into ranked, category-headed sections.
 *
 * Pure and deterministic: same input always yields the same output, so the
 * ordering can be unit-tested without a DB or DOM.
 */
export function buildExploringGroups(entries: ExploringEntry[]): ExploringGroup[] {
  const byCategory = new Map<ExploringCategory, ExploringEntry[]>();
  for (const entry of entries) {
    const key: ExploringCategory = entry.category ?? OTHER_CATEGORY;
    const bucket = byCategory.get(key);
    if (bucket) bucket.push(entry);
    else byCategory.set(key, [entry]);
  }

  const groups: ExploringGroup[] = [];
  for (const [category, groupEntries] of byCategory) {
    // Within a category: interest desc, then title A→Z.
    groupEntries.sort(
      (a, b) => rank(b.interest) - rank(a.interest) || a.title.localeCompare(b.title),
    );
    groups.push({ category, label: CATEGORY_LABELS[category], entries: groupEntries });
  }

  // Category order: top interest within each, desc; label A→Z as tiebreak.
  // "Other" is always pinned last regardless of its contents.
  groups.sort((a, b) => {
    if (a.category === OTHER_CATEGORY) return 1;
    if (b.category === OTHER_CATEGORY) return -1;
    const aTop = Math.max(...a.entries.map((e) => rank(e.interest)));
    const bTop = Math.max(...b.entries.map((e) => rank(e.interest)));
    return bTop - aTop || a.label.localeCompare(b.label);
  });

  return groups;
}
