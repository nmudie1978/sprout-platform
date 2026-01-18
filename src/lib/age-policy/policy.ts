/**
 * Age Safety Policy - Single Source of Truth
 *
 * This module defines the centralized, versioned age policy that determines:
 * - Which job categories map to which risk levels
 * - Baseline minimum ages by risk level
 * - Additional safety constraints (adult present, max lifting, night work, etc.)
 *
 * RULES:
 * - Employers can INCREASE minimum age, never decrease below baseline
 * - Workers under minimum age cannot see or apply to jobs (server-side enforced)
 * - All changes must be versioned and auditable
 *
 * LANGUAGE: English only.
 */

import { JobCategory, JobRiskCategory } from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CategoryRule {
  category: string;
  riskCategory: JobRiskCategory;
  baselineMinAge: number;
  requiresAdultPresentDefault: boolean;
  constraints?: {
    maxLiftingKg?: number;
    nightWorkDisallowed?: boolean;
    chemicalsDisallowed?: boolean;
    powerToolsDisallowed?: boolean;
    heightsDisallowed?: boolean;
  };
  notes?: string;
}

export interface AgePolicyConfig {
  version: number;
  baselineMinAgeByRisk: {
    LOW_RISK: number;
    MEDIUM_RISK: number;
    HIGH_RISK: number;
  };
  categoryRules: CategoryRule[];
  constraintFlags: {
    nightWorkDisallowedUnder18: boolean;
    chemicalsDisallowedUnder18: boolean;
    powerToolsDisallowedUnder18: boolean;
    heightsDisallowedUnder18: boolean;
    maxLiftingKgUnder16: number;
    maxLiftingKgUnder18: number;
  };
}

// ============================================
// BASELINE MINIMUM AGES BY RISK LEVEL
// ============================================

export const BASELINE_MIN_AGE_BY_RISK: Record<JobRiskCategory, number> = {
  LOW_RISK: 15,
  MEDIUM_RISK: 16,
  HIGH_RISK: 18,
};

// ============================================
// CATEGORY → RISK → MINIMUM AGE MAPPING
// ============================================
// This is the authoritative mapping for all job categories.
// Platform categories (JobCategory enum) map to detailed rules.

export const CATEGORY_RULES: CategoryRule[] = [
  // ============================================
  // LOW RISK (minAge 15)
  // ============================================
  {
    category: "DOG_WALKING",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
    notes: "Pet care - dog walking, light pet sitting",
  },
  {
    category: "BABYSITTING",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: true, // Adult should be reachable
    notes: "Daytime babysitting with adult available",
  },
  {
    category: "TECH_HELP",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
    notes: "Basic tech support - phones, computers, internet",
  },
  {
    category: "ERRANDS",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
    notes: "Grocery shopping, picking up items, light deliveries (daytime)",
  },
  {
    category: "OTHER",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
    notes: "Miscellaneous light tasks - default to low risk",
  },

  // ============================================
  // MEDIUM RISK (minAge 16)
  // ============================================
  {
    category: "CLEANING",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: {
      chemicalsDisallowed: true, // No strong chemicals for minors
    },
    notes: "Light cleaning with non-toxic products only",
  },
  {
    category: "SNOW_CLEARING",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: {
      maxLiftingKg: 10,
    },
    notes: "Physical outdoor work - weather dependent",
  },
  {
    category: "DIY_HELP",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: {
      powerToolsDisallowed: true,
      heightsDisallowed: true,
      maxLiftingKg: 15,
    },
    notes: "Basic DIY - furniture assembly, painting (no ladders), moving light items",
  },

  // ============================================
  // HIGH RISK (minAge 18) - Platform should prevent these for minors
  // ============================================
  // Note: These are included for completeness but should be
  // automatically blocked for users under 18.
];

// ============================================
// DETAILED SUB-CATEGORIES (for future expansion)
// ============================================
// These can be used when we have more granular job types

export const DETAILED_CATEGORY_RULES: Record<string, CategoryRule> = {
  // LOW_RISK (15+)
  PET_CARE_DOG_WALKING: {
    category: "PET_CARE_DOG_WALKING",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
  },
  PET_SITTING: {
    category: "PET_SITTING",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
  },
  BABYSITTING_DAYTIME: {
    category: "BABYSITTING_DAYTIME",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: true,
  },
  TUTORING_HOMEWORK_HELP: {
    category: "TUTORING_HOMEWORK_HELP",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
  },
  TECH_HELP_BASIC: {
    category: "TECH_HELP_BASIC",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
  },
  GROCERY_HELP_ERRANDS_DAYTIME: {
    category: "GROCERY_HELP_ERRANDS_DAYTIME",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
  },
  CAR_WASHING_HAND: {
    category: "CAR_WASHING_HAND",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
  },
  LIGHT_CLEANING_NON_TOXIC: {
    category: "LIGHT_CLEANING_NON_TOXIC",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
  },
  EVENT_HELP_SUPERVISED: {
    category: "EVENT_HELP_SUPERVISED",
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: true,
  },

  // MEDIUM_RISK (16+)
  GARDENING_WITH_HAND_TOOLS: {
    category: "GARDENING_WITH_HAND_TOOLS",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: { powerToolsDisallowed: true },
  },
  MOVING_LIGHT_ITEMS: {
    category: "MOVING_LIGHT_ITEMS",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: { maxLiftingKg: 10 },
  },
  FURNITURE_ASSEMBLY_BASIC: {
    category: "FURNITURE_ASSEMBLY_BASIC",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: { powerToolsDisallowed: true },
  },
  PAINTING_INDOOR_NO_LADDERS: {
    category: "PAINTING_INDOOR_NO_LADDERS",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: { heightsDisallowed: true },
  },
  SNOW_SHOVELING: {
    category: "SNOW_SHOVELING",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: { maxLiftingKg: 10 },
  },
  BIKE_DELIVERY_LOCAL_DAYTIME: {
    category: "BIKE_DELIVERY_LOCAL_DAYTIME",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: { nightWorkDisallowed: true },
  },
  RETAIL_HELP_STOCKING_LIGHT: {
    category: "RETAIL_HELP_STOCKING_LIGHT",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
    constraints: { maxLiftingKg: 10 },
  },
  ADMIN_DATA_ENTRY: {
    category: "ADMIN_DATA_ENTRY",
    riskCategory: "MEDIUM_RISK",
    baselineMinAge: 16,
    requiresAdultPresentDefault: false,
  },

  // HIGH_RISK (18+) - Hard restrict for minors
  ANY_POWER_TOOLS: {
    category: "ANY_POWER_TOOLS",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  CONSTRUCTION_SITE: {
    category: "CONSTRUCTION_SITE",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  LADDER_WORK_ANY: {
    category: "LADDER_WORK_ANY",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  ROOF_WORK: {
    category: "ROOF_WORK",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  ELECTRICAL_WORK: {
    category: "ELECTRICAL_WORK",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  PLUMBING_WORK: {
    category: "PLUMBING_WORK",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  CHEMICALS_STRONG: {
    category: "CHEMICALS_STRONG",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  HEAVY_LIFTING: {
    category: "HEAVY_LIFTING",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  DRIVING_CAR_VAN: {
    category: "DRIVING_CAR_VAN",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  ALCOHOL_SERVICE: {
    category: "ALCOHOL_SERVICE",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  NIGHT_WORK: {
    category: "NIGHT_WORK",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  CARE_WORK_FOR_STRANGERS: {
    category: "CARE_WORK_FOR_STRANGERS",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
  SECURITY_GUARD: {
    category: "SECURITY_GUARD",
    riskCategory: "HIGH_RISK",
    baselineMinAge: 18,
    requiresAdultPresentDefault: false,
  },
};

// ============================================
// CURRENT POLICY VERSION
// ============================================

export const CURRENT_POLICY_VERSION = 1;

export const CURRENT_POLICY: AgePolicyConfig = {
  version: CURRENT_POLICY_VERSION,
  baselineMinAgeByRisk: {
    LOW_RISK: 15,
    MEDIUM_RISK: 16,
    HIGH_RISK: 18,
  },
  categoryRules: CATEGORY_RULES,
  constraintFlags: {
    nightWorkDisallowedUnder18: true,
    chemicalsDisallowedUnder18: true,
    powerToolsDisallowedUnder18: true,
    heightsDisallowedUnder18: true,
    maxLiftingKgUnder16: 5,
    maxLiftingKgUnder18: 10,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the rule for a given JobCategory
 */
export function getCategoryRule(category: JobCategory): CategoryRule {
  const rule = CATEGORY_RULES.find((r) => r.category === category);
  if (rule) return rule;

  // Default to OTHER category if not found
  return {
    category: category,
    riskCategory: "LOW_RISK",
    baselineMinAge: 15,
    requiresAdultPresentDefault: false,
    notes: "Defaulting to low risk",
  };
}

/**
 * Get baseline minimum age for a risk category
 */
export function getBaselineMinAge(riskCategory: JobRiskCategory): number {
  return BASELINE_MIN_AGE_BY_RISK[riskCategory];
}

/**
 * Get the next age bracket unlock threshold
 * Returns the next minimum age a user will unlock, or null if they can see all
 */
export function getNextAgeUnlock(currentAge: number): number | null {
  if (currentAge < 15) return 15;
  if (currentAge < 16) return 16;
  if (currentAge < 18) return 18;
  return null; // Can see all jobs
}

/**
 * Check if a user can see jobs at a given minimum age
 */
export function canSeeJobsWithMinAge(userAge: number, jobMinAge: number): boolean {
  return userAge >= jobMinAge;
}

/**
 * Convert policyJson to AgePolicyConfig for type safety
 */
export function parsePolicyJson(policyJson: unknown): AgePolicyConfig | null {
  try {
    if (typeof policyJson === "object" && policyJson !== null) {
      const p = policyJson as Record<string, unknown>;
      if (
        typeof p.version === "number" &&
        typeof p.baselineMinAgeByRisk === "object" &&
        Array.isArray(p.categoryRules)
      ) {
        return policyJson as AgePolicyConfig;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get policy JSON for database storage
 */
export function getPolicyJson(): AgePolicyConfig {
  return CURRENT_POLICY;
}
