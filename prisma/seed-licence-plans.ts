/**
 * Seed the licence plans.
 *
 * These mirror the tiers already advertised publicly on /pricing
 * (`src/lib/pricing/tiers.ts`), so the commercial conversation and the
 * operational record use the same names. The pricing page stays the
 * marketing copy; these rows are what actually grants access.
 *
 * Idempotent — upserts by `key`, so it is safe to re-run and safe to run
 * against production. Existing licences are NEVER touched: a licence carries
 * its own copy of `enabledModules` from the moment it is issued.
 *
 *   npx tsx prisma/seed-licence-plans.ts
 */

import { EntitlementModule, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const M = EntitlementModule;

/** The participant-facing product, in full. What a young person gets. */
const FULL_PARTICIPANT_EXPERIENCE = [
  M.CORE,
  M.CAREER_DISCOVERY,
  M.CAREER_DNA,
  M.UNDERSTAND,
  M.CLARITY,
  M.CAREER_TWIN,
  M.AI_CAREER_GUIDANCE,
  M.CAREER_PATHWAYS,
  M.LABOUR_MARKET_INTELLIGENCE,
  M.SKILLS_ANALYSIS,
  M.OPPORTUNITIES,
];

const PLANS = [
  {
    key: "PILOT",
    name: "Pilot",
    description:
      "Fixed-scope, fixed-price trial with a defined user group. Matches the Pilot tier on /pricing.",
    defaultModules: [...FULL_PARTICIPANT_EXPERIENCE, M.INSTITUTION_ANALYTICS],
    defaultUserLimit: 500,
    defaultTermMonths: 6,
    sortOrder: 10,
  },
  {
    key: "EDUCATION",
    name: "Education",
    description: "Single school or college. Full participant experience plus cohort analytics.",
    defaultModules: [...FULL_PARTICIPANT_EXPERIENCE, M.INSTITUTION_ANALYTICS],
    defaultUserLimit: 1_000,
    defaultTermMonths: 12,
    sortOrder: 20,
  },
  {
    key: "EDUCATION_PLUS",
    name: "Education Plus",
    description: "Multi-school groups and larger institutions. Adds advanced analytics.",
    defaultModules: [
      ...FULL_PARTICIPANT_EXPERIENCE,
      M.PARENT_PORTAL,
      M.INSTITUTION_ANALYTICS,
      M.ADVANCED_ANALYTICS,
    ],
    defaultUserLimit: 5_000,
    defaultTermMonths: 12,
    sortOrder: 30,
  },
  {
    key: "PUBLIC",
    name: "Public Sector",
    description: "Municipalities, employment services and career-guidance organisations.",
    defaultModules: [
      ...FULL_PARTICIPANT_EXPERIENCE,
      M.INSTITUTION_ANALYTICS,
      M.ADVANCED_ANALYTICS,
    ],
    defaultUserLimit: 10_000,
    defaultTermMonths: 12,
    sortOrder: 40,
  },
  {
    key: "ENTERPRISE",
    name: "Public Enterprise",
    description: "National-scale deployments. Everything, including API access and integrations.",
    defaultModules: [
      ...FULL_PARTICIPANT_EXPERIENCE,
      M.PARENT_PORTAL,
      M.INSTITUTION_ANALYTICS,
      M.ADVANCED_ANALYTICS,
      M.API_ACCESS,
      M.CUSTOM_INTEGRATIONS,
    ],
    defaultUserLimit: null,
    defaultTermMonths: 24,
    sortOrder: 50,
  },
  {
    key: "WORKFORCE",
    name: "Workforce",
    description: "Employers, graduate schemes, apprenticeship and training providers.",
    defaultModules: [
      ...FULL_PARTICIPANT_EXPERIENCE,
      M.INSTITUTION_ANALYTICS,
      M.ADVANCED_ANALYTICS,
    ],
    defaultUserLimit: 5_000,
    defaultTermMonths: 12,
    sortOrder: 60,
  },
  {
    key: "CUSTOM",
    name: "Custom",
    description:
      "Starting point for a bespoke agreement. Modules and seats are set per licence.",
    defaultModules: FULL_PARTICIPANT_EXPERIENCE,
    defaultUserLimit: null,
    defaultTermMonths: 12,
    sortOrder: 90,
  },
] as const;

async function main() {
  for (const plan of PLANS) {
    await prisma.licencePlan.upsert({
      where: { key: plan.key },
      create: {
        key: plan.key,
        name: plan.name,
        description: plan.description,
        defaultModules: [...plan.defaultModules],
        defaultUserLimit: plan.defaultUserLimit,
        defaultTermMonths: plan.defaultTermMonths,
        currency: "EUR",
        sortOrder: plan.sortOrder,
        isActive: true,
      },
      // Re-running refreshes the descriptive fields but deliberately leaves
      // `defaultModules` alone if someone has since tuned it in the portal.
      update: {
        name: plan.name,
        description: plan.description,
        sortOrder: plan.sortOrder,
      },
    });
    console.log(`✓ ${plan.key} — ${plan.name}`);
  }
  console.log(`\n${PLANS.length} licence plans ready.`);
}

main()
  .catch((error) => {
    console.error("Seeding licence plans failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
