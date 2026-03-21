/**
 * Seed script for founder spotlights
 *
 * IMPORTANT: This script is for DEVELOPMENT ONLY.
 * In production, only add real, verified stories with valid source URLs.
 *
 * Usage:
 *   npx tsx scripts/seed-founder-spotlights.ts
 *
 * Or add to package.json scripts:
 *   "seed:founders": "tsx scripts/seed-founder-spotlights.ts"
 */

import { addSpotlight, reverifyAllSpotlights } from "../src/lib/founders/store";
import { FounderSpotlightInput } from "../src/lib/founders/types";

/**
 * REAL founder stories with verifiable sources
 *
 * Add entries here ONLY if:
 * 1. The source URL is HTTPS and publicly accessible
 * 2. The story is from a reputable publication
 * 3. All facts can be verified from the source
 *
 * DO NOT add fabricated, invented, or "example" stories.
 */
const REAL_FOUNDER_SPOTLIGHTS: FounderSpotlightInput[] = [
  // Example of how to add a real spotlight:
  // {
  //   title: "From school project to real business",
  //   founderName: "Jane Doe",
  //   founderAgeAtStart: 17,
  //   country: "United States",
  //   whatTheyBuilt: "An app that connects local tutors with students",
  //   whyItMatters: "Shows that identifying a real problem in your community can lead to a viable business",
  //   keyLesson: "Start by solving a problem you personally understand",
  //   sourceName: "Forbes",
  //   sourceUrl: "https://www.forbes.com/path/to/article",
  //   publishedDateISO: "2024-06-15",
  //   tags: ["youth", "tech", "student"],
  // },
];

async function seed() {
  console.log("🌱 Seeding founder spotlights...\n");

  if (REAL_FOUNDER_SPOTLIGHTS.length === 0) {
    console.log("ℹ️  No real founder spotlights to seed.");
    console.log("   Add verified stories to REAL_FOUNDER_SPOTLIGHTS array.");
    console.log("   Each story must have a valid HTTPS source URL.\n");
    return;
  }

  let added = 0;
  let failed = 0;

  for (const spotlight of REAL_FOUNDER_SPOTLIGHTS) {
    console.log(`Processing: ${spotlight.title}`);
    console.log(`  Source: ${spotlight.sourceUrl}`);

    const result = await addSpotlight(spotlight, "seed-script");

    if (result.errors) {
      console.log(`  ❌ Validation failed:`);
      result.errors.forEach((err) => console.log(`     - ${err.field}: ${err.message}`));
      failed++;
    } else if (result.spotlight) {
      if (result.spotlight.verified) {
        console.log(`  ✅ Added and verified`);
      } else {
        console.log(`  ⚠️  Added but verification failed: ${result.spotlight.checkFailReason}`);
      }
      added++;
    }
    console.log("");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Added: ${added}`);
  console.log(`❌ Failed: ${failed}`);

  // Re-verify all existing spotlights
  console.log("\n🔄 Re-verifying all spotlights...");
  const verifyResult = await reverifyAllSpotlights();
  console.log(`   Verified: ${verifyResult.verified}`);
  console.log(`   Failed: ${verifyResult.failed}`);
  console.log(`   Unchanged: ${verifyResult.unchanged}`);
}

seed()
  .then(() => {
    console.log("\n✨ Seed complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed failed:", error);
    process.exit(1);
  });
