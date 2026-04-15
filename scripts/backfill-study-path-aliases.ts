/**
 * Backfill `advancedCareerMap` in src/lib/education/data/programmes.json
 * by asking OpenAI to classify each uncovered career against the list of
 * base careers that *do* have real Norwegian programme data.
 *
 * Why: Only 43 unique careerIds carry curated programmes. A further 91
 * are already wired through `advancedCareerMap` (surgeon → doctor,
 * general-surgeon → doctor, etc.). The remaining ~680 careers in the
 * catalogue fall through to the empty state. Most of them share a study
 * path with an existing base career — a "Principal Data Scientist" is
 * fundamentally served by the same programmes as a "Data Scientist".
 *
 * The script NEVER invents programmes or URLs. It only proposes
 * alias mappings from an uncovered career to an existing base career.
 * High-confidence mappings are written into advancedCareerMap. Medium
 * / low confidence suggestions go to a review file for human approval.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/backfill-study-path-aliases.ts
 *   OPENAI_API_KEY=sk-... npx tsx scripts/backfill-study-path-aliases.ts --dry-run
 *   OPENAI_API_KEY=sk-... npx tsx scripts/backfill-study-path-aliases.ts --limit 20
 *   OPENAI_API_KEY=sk-... npx tsx scripts/backfill-study-path-aliases.ts --confidence high
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import OpenAI from "openai";
import { getAllCareers, type Career } from "../src/lib/career-pathways";
import { getNorwayProgrammes } from "../src/lib/education";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const LIMIT_ARG = args.find((a) => a.startsWith("--limit"));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1] ?? args[args.indexOf(LIMIT_ARG) + 1]) : Infinity;
const CONF_ARG = args.find((a) => a.startsWith("--confidence"));
const MIN_CONFIDENCE: "high" | "medium" | "low" = (CONF_ARG ? (CONF_ARG.split("=")[1] ?? args[args.indexOf(CONF_ARG) + 1]) : "high") as "high" | "medium" | "low";

if (!process.env.OPENAI_API_KEY) {
  console.error("✖ OPENAI_API_KEY is required.");
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.BACKFILL_MODEL ?? "gpt-4o-mini";

const PROGRAMMES_PATH = resolve(__dirname, "..", "src", "lib", "education", "data", "programmes.json");
const REVIEW_PATH = resolve(__dirname, "..", "src", "lib", "education", "data", "programme-aliases-review.json");

interface AdvancedCareerMapping {
  baseCareerId: string;
  specialisationNote: string;
}

interface ProgrammesFile {
  meta: Record<string, unknown>;
  careerKeyMap: Record<string, string>;
  advancedCareerMap: Record<string, AdvancedCareerMapping>;
  programmes: Array<{ careerId: string; programme?: string; englishName?: string }>;
  certificationPaths: Record<string, unknown>;
  alternativePaths: Record<string, unknown>;
  careerSummaries: Record<string, unknown>;
}

interface LlmProposal {
  baseCareerId: string | null;
  specialisationNote: string;
  confidence: "high" | "medium" | "low";
}

function isProposal(v: unknown): v is LlmProposal {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    (o.baseCareerId === null || typeof o.baseCareerId === "string") &&
    typeof o.specialisationNote === "string" &&
    (o.confidence === "high" || o.confidence === "medium" || o.confidence === "low")
  );
}

const CONFIDENCE_RANK: Record<"high" | "medium" | "low", number> = { high: 3, medium: 2, low: 1 };

async function classify(
  career: Career,
  baseCareersWithContext: Array<{ id: string; title: string }>,
  attempt = 1,
): Promise<LlmProposal | null> {
  const systemPrompt = `You map a niche Norwegian career to the closest base career that already has curated Norwegian university / college programme data.

You pick EXCLUSIVELY from the allowed list. You never invent a baseCareerId. If no base fits well, return null.

Return JSON with exactly this shape:
{
  "baseCareerId": "<one of the allowed ids, or null if none fit>",
  "specialisationNote": "<one short sentence explaining how this career relates to the base in Norway, 20-40 words>",
  "confidence": "high" | "medium" | "low"
}

Rules:
- "high" = the base career's study path is substantially the same. E.g. 'Principal Data Scientist' → 'data-scientist' (high).
- "medium" = related field, partial overlap, still useful. E.g. 'Growth Marketing Director' → 'marketing-manager' (medium).
- "low" = tenuous link — only pick if there's any connection. E.g. 'Fashion Designer' → 'graphic-designer' (low).
- null = no base career is a reasonable study-path match.
- specialisationNote should be in British English, explain the relationship clearly for a 16-year-old.
- No emoji, no markdown, no prose outside the JSON.`;

  const userPayload = {
    targetCareer: {
      id: career.id,
      title: career.title,
      description: career.description ?? "",
      keySkills: career.keySkills ?? [],
      educationPath: career.educationPath ?? "",
    },
    allowedBaseCareers: baseCareersWithContext,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 300,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isProposal(parsed)) return null;
    return parsed;
  } catch (err) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 1500));
      return classify(career, baseCareersWithContext, attempt + 1);
    }
    console.warn(`  ✖ ${career.id}: ${(err as Error).message}`);
    return null;
  }
}

async function runPool<T, U>(
  items: T[],
  worker: (item: T, index: number) => Promise<U>,
  concurrency = 6,
  onProgress?: (index: number, total: number) => void,
): Promise<U[]> {
  const out: U[] = new Array(items.length);
  let next = 0;
  async function drain() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await worker(items[i], i);
      onProgress?.(i + 1, items.length);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, drain));
  return out;
}

async function main() {
  const raw = await readFile(PROGRAMMES_PATH, "utf-8");
  const programmesFile = JSON.parse(raw) as ProgrammesFile;

  const allCareers = getAllCareers();
  console.log(`Catalogue: ${allCareers.length} careers`);

  // Base careers = those that currently resolve to real programmes.
  const baseCareerIds = new Set<string>();
  for (const p of programmesFile.programmes) baseCareerIds.add(p.careerId);
  const baseCareers = allCareers.filter((c) => baseCareerIds.has(c.id));
  console.log(`Base careers (have curated programmes): ${baseCareers.length}`);

  // Uncovered = careers where getNorwayProgrammes returns no programmes.
  const uncovered = allCareers.filter((c) => {
    const p = getNorwayProgrammes(c.id, c.title);
    return !(p && p.programmes && p.programmes.length > 0);
  });
  console.log(`Uncovered careers needing Study Path: ${uncovered.length}`);

  // Don't re-propose careers we've already mapped.
  const alreadyMapped = new Set(Object.keys(programmesFile.advancedCareerMap));
  const targets = uncovered.filter((c) => !alreadyMapped.has(c.id));
  const limited = targets.slice(0, LIMIT);
  console.log(`New classifications to run: ${limited.length} (skipping ${targets.length - limited.length} over --limit; ${uncovered.length - targets.length} already in advancedCareerMap)`);
  if (limited.length === 0) {
    console.log("Nothing to do. ✓");
    return;
  }

  const baseContext = baseCareers.map((c) => ({ id: c.id, title: c.title }));
  console.log(`Allowed base pool: ${baseContext.length} careers`);

  // Classify in parallel
  const proposals: Array<{ career: Career; proposal: LlmProposal | null }> = [];
  await runPool(
    limited,
    async (career, i) => {
      const proposal = await classify(career, baseContext);
      proposals.push({ career, proposal });
      if ((i + 1) % 20 === 0) {
        console.log(`  [${i + 1}/${limited.length}] processed`);
      }
      return proposal;
    },
    6,
  );

  // Sort proposals by career.id for stable diffs
  proposals.sort((a, b) => a.career.id.localeCompare(b.career.id));

  // Bucket by confidence + decide what to commit vs review
  const committed: Array<{ id: string; mapping: AdvancedCareerMapping; confidence: string }> = [];
  const review: Array<{ id: string; title: string; proposal: LlmProposal | null; reason: string }> = [];

  for (const { career, proposal } of proposals) {
    if (!proposal) {
      review.push({ id: career.id, title: career.title, proposal, reason: "classifier-error" });
      continue;
    }
    if (!proposal.baseCareerId) {
      review.push({ id: career.id, title: career.title, proposal, reason: "no-base-fits" });
      continue;
    }
    if (!baseCareerIds.has(proposal.baseCareerId)) {
      review.push({ id: career.id, title: career.title, proposal, reason: "base-not-in-pool" });
      continue;
    }
    if (CONFIDENCE_RANK[proposal.confidence] < CONFIDENCE_RANK[MIN_CONFIDENCE]) {
      review.push({ id: career.id, title: career.title, proposal, reason: "below-confidence-threshold" });
      continue;
    }
    committed.push({
      id: career.id,
      mapping: {
        baseCareerId: proposal.baseCareerId,
        specialisationNote: proposal.specialisationNote,
      },
      confidence: proposal.confidence,
    });
  }

  // Merge into advancedCareerMap — don't overwrite existing hand-curated
  // entries.
  const updatedMap: Record<string, AdvancedCareerMapping> = { ...programmesFile.advancedCareerMap };
  let added = 0;
  for (const entry of committed) {
    if (updatedMap[entry.id]) continue; // paranoia — already filtered
    updatedMap[entry.id] = entry.mapping;
    added++;
  }

  // Sort the map keys so diffs stay readable
  const sortedMap: Record<string, AdvancedCareerMapping> = {};
  for (const k of Object.keys(updatedMap).sort()) sortedMap[k] = updatedMap[k];

  const updatedFile: ProgrammesFile = { ...programmesFile, advancedCareerMap: sortedMap };

  // Count confidence breakdown
  const byConf: Record<string, number> = { high: 0, medium: 0, low: 0 };
  for (const c of committed) byConf[c.confidence]++;

  console.log("\n── Results ──");
  console.log(`Committed: ${added} mappings (min confidence: ${MIN_CONFIDENCE})`);
  console.log(`  high:   ${byConf.high}`);
  console.log(`  medium: ${byConf.medium}`);
  console.log(`  low:    ${byConf.low}`);
  console.log(`Review queue: ${review.length} careers`);

  if (DRY_RUN) {
    console.log("\n(dry-run — not writing files)");
    console.log("\nSample committed:");
    for (const c of committed.slice(0, 10)) {
      console.log(`  ${c.id.padEnd(32)} → ${c.mapping.baseCareerId.padEnd(24)} [${c.confidence}]`);
    }
    return;
  }

  await writeFile(PROGRAMMES_PATH, JSON.stringify(updatedFile, null, 2) + "\n", "utf-8");
  await writeFile(REVIEW_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), minConfidence: MIN_CONFIDENCE, items: review }, null, 2) + "\n", "utf-8");
  console.log(`\n✓ Wrote ${PROGRAMMES_PATH}`);
  console.log(`✓ Wrote ${REVIEW_PATH} (${review.length} items for manual review)`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
