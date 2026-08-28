/**
 * The module catalogue — the single registry of gated capabilities.
 *
 * Application code NEVER asks "is this user on the Enterprise plan?".
 * It asks "does this user have CAREER_TWIN?". Plans, licences and
 * subscriptions are all just different ways of arriving at a set of
 * modules; adding a plan must never require touching feature code.
 *
 * Adding a capability = add an enum member in schema.prisma + a row in
 * MODULE_CATALOGUE here. Nothing else in the app should hard-code a
 * module list.
 */

import { EntitlementModule, OrgRole, SubscriptionTier } from "@prisma/client";

export interface ModuleDefinition {
  module: EntitlementModule;
  label: string;
  /** One line, written for a commercial audience — shown in the admin portal. */
  description: string;
  /**
   * Staff modules are organisational tooling (dashboards, analytics, APIs).
   * They are never granted to a PARTICIPANT or PARENT no matter what a
   * licence enables — see ROLE_PERMITTED_MODULES.
   */
  audience: "participant" | "staff";
}

export const MODULE_CATALOGUE: readonly ModuleDefinition[] = [
  {
    module: EntitlementModule.CORE,
    label: "Core",
    description: "Account, personal profile and the My Journey shell.",
    audience: "participant",
  },
  {
    module: EntitlementModule.CAREER_DISCOVERY,
    label: "Career Discovery",
    description: "Browse, search, compare and save careers; Career Radar matching.",
    audience: "participant",
  },
  {
    module: EntitlementModule.CAREER_DNA,
    label: "Career DNA",
    description: "The objective trait profile behind each career.",
    audience: "participant",
  },
  {
    module: EntitlementModule.UNDERSTAND,
    label: "Understand",
    description: "Education routes, entry paths, realistic expectations.",
    audience: "participant",
  },
  {
    module: EntitlementModule.CLARITY,
    label: "Clarity",
    description: "The personal roadmap, next steps and reflection surface.",
    audience: "participant",
  },
  {
    module: EntitlementModule.CAREER_TWIN,
    label: "Career Twin",
    description: "Conversation with one possible future self in a chosen career.",
    audience: "participant",
  },
  {
    module: EntitlementModule.AI_CAREER_GUIDANCE,
    label: "AI Career Guidance",
    description: "The AI advisor and generated guidance surfaces.",
    audience: "participant",
  },
  {
    module: EntitlementModule.CAREER_PATHWAYS,
    label: "Career Pathways",
    description: "Programme, university and certification pathway data.",
    audience: "participant",
  },
  {
    module: EntitlementModule.PARENT_PORTAL,
    label: "Parent Portal",
    description: "The parent view of a linked young person's journey summary.",
    audience: "participant",
  },
  {
    module: EntitlementModule.LABOUR_MARKET_INTELLIGENCE,
    label: "Labour Market Intelligence",
    description: "Industry insights, demand signals and future-of-work content.",
    audience: "participant",
  },
  {
    module: EntitlementModule.SKILLS_ANALYSIS,
    label: "Skills Analysis",
    description: "Skills mapping, gaps and growth signals.",
    audience: "participant",
  },
  {
    module: EntitlementModule.OPPORTUNITIES,
    label: "Opportunities",
    description: "Career events, open days and programme opportunities.",
    audience: "participant",
  },
  {
    module: EntitlementModule.INSTITUTION_ANALYTICS,
    label: "Institution Analytics",
    description: "Aggregated cohort and programme dashboards for staff.",
    audience: "staff",
  },
  {
    module: EntitlementModule.ADVANCED_ANALYTICS,
    label: "Advanced Analytics",
    description: "Trend analysis, exports and cross-cohort comparison.",
    audience: "staff",
  },
  {
    module: EntitlementModule.API_ACCESS,
    label: "API Access",
    description: "Programmatic access to the organisation's own aggregated data.",
    audience: "staff",
  },
  {
    module: EntitlementModule.CUSTOM_INTEGRATIONS,
    label: "Custom Integrations",
    description: "SSO, SIS/HR sync and bespoke data flows.",
    audience: "staff",
  },
] as const;

const CATALOGUE_BY_MODULE = new Map(MODULE_CATALOGUE.map((d) => [d.module, d]));

export function getModuleDefinition(module: EntitlementModule): ModuleDefinition {
  const found = CATALOGUE_BY_MODULE.get(module);
  if (!found) {
    // Unreachable while the catalogue covers the enum — the test suite asserts
    // that. Throwing beats silently treating an unknown module as staff-only.
    throw new Error(`Module ${module} is missing from MODULE_CATALOGUE`);
  }
  return found;
}

export const STAFF_MODULES: readonly EntitlementModule[] = MODULE_CATALOGUE.filter(
  (d) => d.audience === "staff"
).map((d) => d.module);

/**
 * What EVERY signed-in Endeavrly user gets, forever, with no organisation and
 * no subscription. This is the existing consumer product as it stands today —
 * it is deliberately generous, because the institutional layer must not
 * quietly take anything away from the users already here.
 *
 * If you are about to remove a module from this list, you are about to break
 * the promise in section 3 of the institutional spec. Don't.
 */
export const PLATFORM_BASELINE_MODULES: readonly EntitlementModule[] = [
  EntitlementModule.CORE,
  EntitlementModule.CAREER_DISCOVERY,
  EntitlementModule.CAREER_DNA,
  EntitlementModule.UNDERSTAND,
  EntitlementModule.CLARITY,
  EntitlementModule.CAREER_TWIN,
  EntitlementModule.AI_CAREER_GUIDANCE,
  EntitlementModule.CAREER_PATHWAYS,
  EntitlementModule.LABOUR_MARKET_INTELLIGENCE,
  EntitlementModule.SKILLS_ANALYSIS,
  EntitlementModule.OPPORTUNITIES,
];

/**
 * Direct-consumer tiers. Additive on top of the baseline.
 *
 * These are thin today because the baseline already carries the whole
 * consumer product. They exist so that when a paid tier is introduced the
 * plumbing is already in place and exercised, rather than being retrofitted
 * through feature code.
 */
export const TIER_MODULES: Record<SubscriptionTier, readonly EntitlementModule[]> = {
  [SubscriptionTier.FREE]: [],
  [SubscriptionTier.PREMIUM]: [],
  [SubscriptionTier.FAMILY]: [EntitlementModule.PARENT_PORTAL],
  [SubscriptionTier.FAMILY_PLUS]: [EntitlementModule.PARENT_PORTAL],
};

/**
 * The ceiling on what a licence can grant a given role.
 *
 * This is the mechanism that stops "the school bought Advanced Analytics"
 * from meaning "every 15-year-old at the school can see cohort analytics".
 * Licence modules are intersected with this set before they are granted.
 */
export const ROLE_PERMITTED_MODULES: Record<OrgRole, readonly EntitlementModule[]> = {
  [OrgRole.PARTICIPANT]: MODULE_CATALOGUE.filter((d) => d.audience === "participant").map(
    (d) => d.module
  ),
  [OrgRole.PARENT]: [
    EntitlementModule.CORE,
    EntitlementModule.PARENT_PORTAL,
    EntitlementModule.CAREER_DISCOVERY,
    EntitlementModule.CAREER_PATHWAYS,
    EntitlementModule.LABOUR_MARKET_INTELLIGENCE,
    EntitlementModule.OPPORTUNITIES,
  ],
  // Staff roles keep the participant surfaces too — an advisor needs to see
  // what the young person sees to be able to guide them through it.
  [OrgRole.ADVISOR]: [
    ...MODULE_CATALOGUE.filter((d) => d.audience === "participant").map((d) => d.module),
    EntitlementModule.INSTITUTION_ANALYTICS,
  ],
  [OrgRole.EDUCATOR]: [
    ...MODULE_CATALOGUE.filter((d) => d.audience === "participant").map((d) => d.module),
    EntitlementModule.INSTITUTION_ANALYTICS,
  ],
  [OrgRole.MANAGER]: [
    ...MODULE_CATALOGUE.filter((d) => d.audience === "participant").map((d) => d.module),
    EntitlementModule.INSTITUTION_ANALYTICS,
    EntitlementModule.ADVANCED_ANALYTICS,
  ],
  [OrgRole.ORGANISATION_ADMIN]: MODULE_CATALOGUE.map((d) => d.module),
};

/** Convenience for admin UIs that need the enum in a stable, labelled order. */
export const ALL_MODULES: readonly EntitlementModule[] = MODULE_CATALOGUE.map((d) => d.module);
