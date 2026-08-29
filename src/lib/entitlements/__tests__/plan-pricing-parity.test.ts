import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { ORGANISATION_TIERS, FAMILY_TIERS } from "@/lib/pricing/tiers";

/**
 * The public pricing page and the seeded licence plans are two descriptions of
 * the same commercial model. They live apart on purpose — one is marketing
 * copy, the other grants access — but a tier advertised with no plan behind it
 * means a signed deal with nothing to issue.
 *
 * This test reads the seed file as text rather than importing it, because
 * importing would construct a PrismaClient and try to reach the database.
 */
const SEED_SOURCE = readFileSync(
  join(process.cwd(), "prisma/seed-licence-plans.ts"),
  "utf8"
);

function seededPlanKeys(): string[] {
  return [...SEED_SOURCE.matchAll(/^\s*key: "([A-Z0-9_]+)",$/gm)].map((m) => m[1]);
}

/** "education-plus" → "EDUCATION_PLUS" */
function tierIdToPlanKey(id: string): string {
  return id.toUpperCase().replace(/-/g, "_");
}

describe("licence plans cover the public pricing page", () => {
  const keys = seededPlanKeys();

  it("seeds at least one plan", () => {
    expect(keys.length).toBeGreaterThan(0);
  });

  it("has no duplicate plan keys", () => {
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(ORGANISATION_TIERS.map((t) => [t.id, t.name] as const))(
    "has a licence plan behind the advertised %s tier",
    (id) => {
      // Two advertised tiers map onto one operational plan where the
      // difference is commercial rather than technical. Keep the mapping
      // explicit so a new tier fails loudly rather than silently passing.
      const ALIASES: Record<string, string> = {
        PUBLIC_SECTOR: "PUBLIC",
        PUBLIC_ENTERPRISE: "ENTERPRISE",
      };
      const expected = tierIdToPlanKey(id);
      expect(keys).toContain(ALIASES[expected] ?? expected);
    }
  );

  it("keeps family pricing out of the organisation licence plans", () => {
    // Families are direct consumers. They resolve through PersonalSubscription
    // tiers, not through an organisation licence — one engine, two sources.
    for (const tier of FAMILY_TIERS) {
      expect(keys).not.toContain(tierIdToPlanKey(tier.id));
    }
  });
});
