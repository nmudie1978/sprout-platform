/**
 * scripts/seed-pilot-feedback.ts
 *
 * Generate ~40 simulated typed-feedback rows so /admin/feedback has
 * realistic data to demonstrate. Every row is tagged source = "PILOT_SIM"
 * so it's trivial to delete:
 *
 *   npx tsx scripts/seed-pilot-feedback.ts --reset
 *
 * Run:
 *   npx tsx scripts/seed-pilot-feedback.ts
 */

import { PrismaClient, type FeedbackKind, type FeedbackArea, type FeedbackRole } from "@prisma/client";

const prisma = new PrismaClient();

const N_ROWS = 40;
const SOURCE_TAG = "PILOT_SIM";

const KINDS: FeedbackKind[] = ["CONFUSED", "PROBLEM", "IDEA", "PRAISE"];
const AREAS: (FeedbackArea | null)[] = [
  "JOURNEY",
  "CAREER_RADAR",
  "EXPLORE_CAREERS",
  "LIBRARY",
  "CAREER_TWIN",
  "OTHER",
  null,
];
const ROLES: (FeedbackRole | null)[] = ["TEEN_16_20", "PARENT_GUARDIAN", "ADULT_OTHER", null];

const MESSAGES: Record<FeedbackKind, string[]> = {
  CONFUSED: [
    "I wasn't sure what to do after choosing my main goal.",
    "The Understand tab had a lot on it — I didn't know where to look first.",
    "It took me a while to realise I could tap a dot on the radar.",
  ],
  PROBLEM: [
    "A video on the Discover tab wouldn't play on my phone.",
    "The Study Path table looked cramped on a small screen.",
    "My saved careers didn't show up straight away.",
  ],
  IDEA: [
    "It'd be great to compare two careers side by side more easily.",
    "Could the Career Twin remember what we talked about last time?",
    "A short intro the first time you open My Journey would help.",
  ],
  PRAISE: [
    "The Career Radar is brilliant — really easy to read.",
    "Calm and clear, no clutter. Loved it.",
    "The roadmap in Clarity finally made the next steps feel doable.",
  ],
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function recentTimestamp(daysBack: number): Date {
  const now = Date.now();
  const offsetMs = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - offsetMs);
}

async function main() {
  if (process.argv.includes("--reset")) {
    const removed = await prisma.feedback.deleteMany({ where: { source: SOURCE_TAG } });
    console.log(`Removed ${removed.count} previous PILOT_SIM rows.`);
  }

  const rows = Array.from({ length: N_ROWS }, () => {
    const kind = pick(KINDS);
    return {
      kind,
      area: pick(AREAS),
      role: pick(ROLES),
      message: pick(MESSAGES[kind]),
      source: SOURCE_TAG,
      userAgent: "Pilot simulation",
      appVersion: "1.0.0-pilot",
      createdAt: recentTimestamp(14),
    };
  });

  await prisma.feedback.createMany({ data: rows });
  console.log(`Inserted ${rows.length} simulated typed-feedback rows (source="${SOURCE_TAG}").`);
  console.log(`To remove: npx tsx scripts/seed-pilot-feedback.ts --reset`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
