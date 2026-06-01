/**
 * Standalone career-events seeder.
 *
 * Loads ONLY the curated CareerEvent rows (idempotent upsert by
 * registrationUrl, past events skipped). Safe to run against production:
 * it touches only the CareerEvent table — no demo data, no deletes of any
 * user/content data — unlike the full `prisma/seed.ts`.
 *
 * Wired into the deploy build (see package.json `build`) so production
 * always has the curated events loaded — fixing the "events page is empty"
 * class of bug where the table was simply never populated. Also runnable
 * manually via `npm run db:seed-events`.
 *
 * Non-blocking by design: any failure logs loudly but exits 0, so a data
 * hiccup never blocks a code deploy (events are non-critical content).
 */
import { PrismaClient } from "@prisma/client";
import { seedCareerEvents } from "./seed-career-events";

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedCareerEvents(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("⚠️  Career-events seed failed (non-blocking):", err?.message ?? err);
    // Exit 0 so this step never blocks a deploy.
    process.exit(0);
  });
