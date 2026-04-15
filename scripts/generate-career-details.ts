/**
 * Generate AI-authored CareerDetails for every career in the catalogue
 * that doesn't already have a hand-curated or generated entry.
 *
 * Why: the Understand tab reads from `careerDetailsMap` in
 * `src/lib/career-typical-days.ts`. The curated map covers ~385 of the
 * ~664 careers in `src/lib/career-pathways.ts`. Without this script
 * the remaining ~280 careers (e.g. real-estate-broker) fall back to a
 * bland generic template — and the user notices instantly.
 *
 * Strategy:
 *   1. Walk every career in getAllCareers().
 *   2. Skip if already in the curated map OR the existing generated map.
 *   3. Ask OpenAI for a structured JSON CareerDetails object.
 *   4. Validate shape, append to the generated map.
 *   5. Write `src/lib/career-typical-days.generated.ts` once at the end.
 *
 * Re-runs are cheap and idempotent — only NEW careers get fresh API
 * calls. Pass --force to regenerate everything.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-details.ts
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-details.ts --force
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-details.ts --limit 10
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-details.ts --only=real-estate-broker
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import OpenAI from "openai";
import type { CareerDetails } from "../src/lib/career-typical-days";

// We import the catalogue + the existing maps so the script knows
// what's already covered. Tsx + tsconfig paths make this work even
// though career-pathways.ts is a 12k-line monster.
import { getAllCareers, type Career } from "../src/lib/career-pathways";
import { generatedCareerDetailsMap as existingGenerated } from "../src/lib/career-typical-days.generated";

// We need the curated map too — but it's not exported from
// career-typical-days.ts. We just call hasDetailedContent for each
// career and trust it. If the user passes --force, we regenerate every
// non-curated career anyway.
import { hasDetailedContent } from "../src/lib/career-typical-days";

// ── CLI args ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const LIMIT_ARG = args.find((a) => a.startsWith("--limit"));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1] ?? args[args.indexOf(LIMIT_ARG) + 1]) : Infinity;
const ONLY_ARG = args.find((a) => a.startsWith("--only"));
const ONLY = ONLY_ARG ? (ONLY_ARG.split("=")[1] ?? args[args.indexOf(ONLY_ARG) + 1]) : null;

// ── OpenAI ──────────────────────────────────────────────────────────

if (!process.env.OPENAI_API_KEY) {
  console.error("✖ OPENAI_API_KEY is required.");
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.GENERATE_MODEL ?? "gpt-4o-mini";

// ── Prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You write realistic, calm, honest career profiles for a youth-first careers
platform in Norway (ages 15-23). The audience is teenagers exploring what
a job is really like, not what a recruiter wants to hear.

Given a career title, description, and key skills, return a JSON object
with this EXACT shape:

{
  "typicalDay": {
    "morning":   ["3-5 short concrete tasks done in the morning (08:00–12:00)"],
    "midday":    ["3-5 short concrete tasks done midday (12:00–14:00)"],
    "afternoon": ["3-5 short concrete tasks done in the afternoon (14:00–17:00)"],
    "tools":     ["3-6 specific tools, software, or equipment used daily"],
    "environment": "One sentence describing the physical workplace and rhythm (e.g. 'Mostly indoors at a hospital ward, on your feet, with a mix of patient-facing and admin time.')"
  },
  "whatYouActuallyDo": [
    "5-7 concrete responsibilities — what the role actually involves day to day. Avoid corporate buzzwords. Use plain language a 16-year-old understands."
  ],
  "whoThisIsGoodFor": [
    "3-5 short personality / strength matches. e.g. 'Patient with detail', 'Comfortable speaking up', 'Enjoys working alone for long stretches'."
  ],
  "topSkills": [
    "5-7 specific skills the role demands. Mix hard skills and soft skills. Be concrete — 'teamwork' is too vague; 'coordinating shift handovers' is good."
  ],
  "entryPaths": [
    "3-5 realistic ways into this career in Norway. Mention fagbrev, bachelor, vocational programmes, certifications, apprenticeships, or relevant employers where appropriate."
  ],
  "realityCheck": "ONE honest sentence about the hardest or most surprising part of the job. Not negative — just truthful. e.g. 'The first two years are mostly admin and shadowing, not the glamorous parts you see on TV.'"
}

Rules:
- Output ONLY valid JSON. No prose, no markdown, no commentary.
- Use British English (colour, organise, recognise).
- Norway-relevant where it matters (currency in NOK, fagbrev, Samordna opptak, videregående). Don't invent country-specific programmes that don't exist.
- No emoji. No exclamation marks.
- Reading age ~14. Short sentences. Concrete nouns.
- Never mention salaries here — that's surfaced elsewhere.
- Never sugar-coat. Never doom-mong.`;

interface OpenAIResponse {
  typicalDay: {
    morning: string[];
    midday: string[];
    afternoon: string[];
    tools?: string[];
    environment?: string;
  };
  whatYouActuallyDo: string[];
  whoThisIsGoodFor: string[];
  topSkills: string[];
  entryPaths: string[];
  realityCheck?: string;
}

function isValid(d: unknown): d is OpenAIResponse {
  if (!d || typeof d !== "object") return false;
  const o = d as Record<string, unknown>;
  const td = o.typicalDay as Record<string, unknown> | undefined;
  if (!td) return false;
  return (
    Array.isArray(td.morning) && td.morning.length > 0 &&
    Array.isArray(td.midday) && td.midday.length > 0 &&
    Array.isArray(td.afternoon) && td.afternoon.length > 0 &&
    Array.isArray(o.whatYouActuallyDo) && (o.whatYouActuallyDo as unknown[]).length >= 3 &&
    Array.isArray(o.whoThisIsGoodFor) && (o.whoThisIsGoodFor as unknown[]).length >= 2 &&
    Array.isArray(o.topSkills) && (o.topSkills as unknown[]).length >= 3 &&
    Array.isArray(o.entryPaths) && (o.entryPaths as unknown[]).length >= 2
  );
}

async function generateOne(career: Career, attempt = 1): Promise<CareerDetails | null> {
  const userMsg = JSON.stringify({
    title: career.title,
    description: career.description ?? "",
    keySkills: career.keySkills ?? [],
    educationPath: career.educationPath ?? "",
    growthOutlook: career.growthOutlook ?? "",
    entryLevel: career.entryLevel ?? false,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Career: ${userMsg}` },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
      max_tokens: 1200,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValid(parsed)) return null;
    return parsed as CareerDetails;
  } catch (err) {
    // One transparent retry on transient failures (rate limit, network).
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 1500));
      return generateOne(career, attempt + 1);
    }
    console.warn(`  ✖ ${career.id}: ${(err as Error).message}`);
    return null;
  }
}

// ── Output writer ───────────────────────────────────────────────────

function serialise(map: Record<string, CareerDetails>): string {
  // Sort keys so diffs are stable on re-runs.
  const sortedKeys = Object.keys(map).sort();
  const entries = sortedKeys.map((k) => {
    const v = map[k];
    return `  ${JSON.stringify(k)}: ${JSON.stringify(v, null, 4).split("\n").map((l, i) => (i === 0 ? l : "  " + l)).join("\n")}`;
  });
  return `/**
 * AI-generated career details overlay.
 *
 * DO NOT HAND-EDIT THIS FILE. It is rewritten by
 * \`scripts/generate-career-details.ts\` whenever the script is run.
 *
 * To regenerate (or fill new careers):
 *   npx tsx scripts/generate-career-details.ts
 *
 * Pass --force to overwrite all entries, --limit N to cap, or
 * --only <careerId> to generate a single career.
 */

import type { CareerDetails } from './career-typical-days';

export const generatedCareerDetailsMap: Record<string, CareerDetails> = {
${entries.join(",\n")}
};
`;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const allCareers = getAllCareers();
  console.log(`Catalogue: ${allCareers.length} careers`);

  // Decide what to generate
  const targets = allCareers.filter((c) => {
    if (ONLY) return c.id === ONLY;
    if (FORCE) return !hasDetailedContent(c.id) || existingGenerated[c.id]; // re-do all generated, leave curated alone
    // Default: anything not already covered (curated OR previously generated)
    return !hasDetailedContent(c.id);
  });

  const limited = targets.slice(0, LIMIT);
  console.log(`Generating ${limited.length} entries (skipping ${allCareers.length - limited.length} already covered or out of scope)…`);
  if (limited.length === 0) {
    console.log("Nothing to do. ✓");
    return;
  }

  // Start from existing generated map so we don't lose previous runs.
  const out: Record<string, CareerDetails> = { ...existingGenerated };
  const outPath = resolve(__dirname, "..", "src", "lib", "career-typical-days.generated.ts");

  // Concurrency: 6 parallel calls. Conservative enough to stay under
  // OpenAI tier-1 rate limits while cutting wall time ~6x. Override
  // with --concurrency=N if you have a higher tier.
  const CONCURRENCY_ARG = args.find((a) => a.startsWith("--concurrency"));
  const CONCURRENCY = CONCURRENCY_ARG
    ? Number(CONCURRENCY_ARG.split("=")[1] ?? args[args.indexOf(CONCURRENCY_ARG) + 1])
    : 6;

  // Incremental autosave: every N completions we flush the file so a
  // crash mid-run doesn't waste any of the work that already finished.
  const AUTOSAVE_EVERY = 25;

  let done = 0;
  let ok = 0;
  let failed = 0;
  const startedAt = Date.now();
  const queue = [...limited];

  async function worker() {
    while (queue.length > 0) {
      const career = queue.shift();
      if (!career) return;
      const details = await generateOne(career);
      done++;
      if (details) {
        out[career.id] = details;
        ok++;
      } else {
        failed++;
      }
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      const rate = (done / Math.max(1, Number(elapsed))).toFixed(2);
      process.stdout.write(
        `  [${done}/${limited.length}] ${career.id.padEnd(40)} ${details ? "ok " : "skip"}  · ${rate}/s · ${elapsed}s\n`
      );
      // Autosave so we never lose work to a crash partway through.
      if (done % AUTOSAVE_EVERY === 0) {
        await writeFile(outPath, serialise(out), "utf8");
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Final write
  await writeFile(outPath, serialise(out), "utf8");
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\n✓ Wrote ${Object.keys(out).length} entries to ${outPath}`);
  console.log(`  ${ok} succeeded · ${failed} failed · ${elapsed}s wall time`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
