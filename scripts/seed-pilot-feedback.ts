/**
 * scripts/seed-pilot-feedback.ts
 *
 * Generate 50 simulated PARENT_GUARDIAN feedback rows so the
 * /admin/feedback dashboard has realistic-looking pilot data to
 * demonstrate. Every inserted row is tagged `source = "PILOT_SIM"`
 * so it's trivial to delete later:
 *
 *   await prisma.feedback.deleteMany({ where: { source: "PILOT_SIM" } })
 *
 * Run:
 *   npx tsx scripts/seed-pilot-feedback.ts
 *   npx tsx scripts/seed-pilot-feedback.ts --reset   # wipe sim rows first
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const N_ROWS = 50;
const SOURCE_TAG = "PILOT_SIM";

/**
 * Realistic top-2-box weighted Likert sampler. Means hover ~3.7–4.4
 * with a long tail of 2–3s — typical for a beta survey from
 * supportive but critical parents. Distribution per question is
 * tuned individually so the bar charts don't look uniform.
 *
 *  Index 0..4 → values 1..5
 */
const QUESTION_DISTRIBUTIONS: Record<"q1" | "q2" | "q3" | "q4" | "q5", number[]> = {
  // "I understood what this app is for." — generally clear
  q1: [1, 3, 8, 22, 16],
  // "I understood what I should do first." — onboarding murkier
  q2: [2, 6, 12, 20, 10],
  // "The app felt calm and not overwhelming." — calmest signal
  q3: [1, 2, 7, 22, 18],
  // "The focus on having a main goal made sense to me." — strong
  q4: [1, 3, 6, 18, 22],
  // "I would feel comfortable letting my child use this." — strongest
  q5: [0, 2, 5, 17, 26],
};

const COMMENTS = [
  "Lovely app for helping my daughter explore careers, but the first screen is a bit overwhelming.",
  "Clean and calm — I like that there are no payments inside the app.",
  "It would help to have a quick walkthrough for parents the first time we open it.",
  "My son is 16 and wasn't sure where to click first.",
  "Career radar is the best part. The visualisation is intuitive.",
  "More guidance on what 'Primary Goal' means versus 'Secondary' would help.",
  "Loved the journey idea. Even I learned something about local careers.",
  "Could you add a way for parents to follow along with what the youth is exploring?",
  "Some words felt a little technical — 'Lens' especially. Maybe rename?",
  "Beautifully designed, calm, and trustworthy.",
  "Couldn't see how to get to the small jobs section at first.",
  "Honestly impressed by the safety messaging — felt reassuring as a parent.",
  "AI Advisor was helpful but answered slightly too long.",
  "Real-life paths shared by other parents were the highlight.",
  "Loading on my phone was a bit slow on the journey page.",
  "The dashboard layout is excellent for a quick check-in.",
  "I'd love a Norwegian-only version (we already have a Bokmål toggle but more terms?).",
  "Industry insights felt a bit dry. Could use shorter summaries.",
  "Privacy settings were easy to find — thank you.",
  "My teen kept asking 'what do I do now?'. The next-step prompt was unclear.",
  "Career Radar showing common jobs filter is a brilliant addition.",
];

const CLARITY_TOPIC_POOLS: string[][] = [
  [],
  [],
  ["NEXT_STEPS"],
  ["NEXT_STEPS", "PRIMARY_VS_SECONDARY_GOAL"],
  ["PRIMARY_VS_SECONDARY_GOAL"],
  ["REAL_LIFE_WORK"],
  ["SMALL_JOBS"],
  ["NONE"],
  ["NEXT_STEPS", "REAL_LIFE_WORK"],
  ["PRIMARY_VS_SECONDARY_GOAL", "SMALL_JOBS"],
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function sampleLikert(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i + 1; // 1..5
  }
  return weights.length;
}

function recentTimestamp(daysBack: number): Date {
  const now = Date.now();
  const offsetMs = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - offsetMs);
}

async function main() {
  const reset = process.argv.includes("--reset");
  if (reset) {
    const removed = await prisma.feedback.deleteMany({ where: { source: SOURCE_TAG } });
    console.log(`Removed ${removed.count} previous PILOT_SIM rows.`);
  }

  const rows = Array.from({ length: N_ROWS }, () => {
    // ~35% include a free-text comment; the rest leave it blank.
    const includeComment = Math.random() < 0.35;
    return {
      role: "PARENT_GUARDIAN" as const,
      q1: sampleLikert(QUESTION_DISTRIBUTIONS.q1),
      q2: sampleLikert(QUESTION_DISTRIBUTIONS.q2),
      q3: sampleLikert(QUESTION_DISTRIBUTIONS.q3),
      q4: sampleLikert(QUESTION_DISTRIBUTIONS.q4),
      q5: sampleLikert(QUESTION_DISTRIBUTIONS.q5),
      confusingText: includeComment ? pick(COMMENTS) : null,
      clarityTopics: pick(CLARITY_TOPIC_POOLS),
      source: SOURCE_TAG,
      userAgent: "Pilot simulation",
      appVersion: "1.0.0-pilot",
      createdAt: recentTimestamp(14), // last 2 weeks
    };
  });

  await prisma.feedback.createMany({ data: rows });
  console.log(`Inserted ${rows.length} simulated PARENT_GUARDIAN feedback rows.`);
  console.log(`Tagged with source = "${SOURCE_TAG}". To remove later:`);
  console.log(`  npx tsx scripts/seed-pilot-feedback.ts --reset`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
