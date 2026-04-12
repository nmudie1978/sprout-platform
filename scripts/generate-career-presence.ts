/**
 * Generate career presence signal data for every career that doesn't
 * already have seed data in src/lib/career-presence/signals.ts.
 *
 * Outputs: src/lib/career-presence/signals.generated.json
 *
 * Each career gets signal levels (none/low/moderate/high) for 5
 * dimensions across 4 countries (NO, GB, DE, SE).
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-presence.ts
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-presence.ts --force
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-presence.ts --limit=10
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-presence.ts --only=astronaut
 */

import { writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import OpenAI from 'openai';
import { getAllCareers, type Career } from '../src/lib/career-pathways';
import { getCareerSignals } from '../src/lib/career-presence/signals';

// ── CLI args ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const LIMIT_ARG = args.find((a) => a.startsWith('--limit'));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split('=')[1] ?? args[args.indexOf(LIMIT_ARG) + 1]) : Infinity;
const ONLY_ARG = args.find((a) => a.startsWith('--only'));
const ONLY = ONLY_ARG ? (ONLY_ARG.split('=')[1] ?? args[args.indexOf(ONLY_ARG) + 1]) : null;
const CONCURRENCY_ARG = args.find((a) => a.startsWith('--concurrency'));
const CONCURRENCY = CONCURRENCY_ARG ? Number(CONCURRENCY_ARG.split('=')[1]) : 6;

// ── OpenAI ──────────────────────────────────────────────────────────

if (!process.env.OPENAI_API_KEY) {
  console.error('✖ OPENAI_API_KEY is required.');
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.GENERATE_MODEL ?? 'gpt-4o-mini';

// ── Types ───────────────────────────────────────────────────────────

type SignalLevel = 'none' | 'low' | 'moderate' | 'high';
interface CountrySignals {
  jobPostingPresence: SignalLevel;
  companyPresence: SignalLevel;
  industryPresence: SignalLevel;
  pathwayAvailability: SignalLevel;
  remoteViability: SignalLevel;
}
type SignalMap = Record<'NO' | 'GB' | 'DE' | 'SE', CountrySignals>;

// ── Prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You estimate career presence signals for a Nordic youth platform.

Given a career title, description, and key details, estimate how present and accessible this career is in 4 countries: Norway (NO), United Kingdom (GB), Germany (DE), Sweden (SE).

Return a JSON object with this EXACT shape:

{
  "NO": { "jobPostingPresence": "level", "companyPresence": "level", "industryPresence": "level", "pathwayAvailability": "level", "remoteViability": "level" },
  "GB": { "jobPostingPresence": "level", "companyPresence": "level", "industryPresence": "level", "pathwayAvailability": "level", "remoteViability": "level" },
  "DE": { "jobPostingPresence": "level", "companyPresence": "level", "industryPresence": "level", "pathwayAvailability": "level", "remoteViability": "level" },
  "SE": { "jobPostingPresence": "level", "companyPresence": "level", "industryPresence": "level", "pathwayAvailability": "level", "remoteViability": "level" }
}

Signal levels: "none" | "low" | "moderate" | "high"

Dimension definitions:
- jobPostingPresence: How frequently this role appears on job boards in this country
- companyPresence: Whether companies in this country typically employ this role
- industryPresence: Whether the relevant industry ecosystem is established
- pathwayAvailability: Whether education/training/entry pathways exist locally
- remoteViability: Whether this career can realistically be done remotely (desk jobs = moderate/high, hands-on = none/low)

Rules:
- Output ONLY valid JSON. No prose, no markdown.
- Be realistic and honest — don't inflate signals. A niche career should have low signals.
- Norway is a small market (5.5M people) — most careers have lower job posting volume than GB or DE.
- Military careers: high in the country that has the relevant force, low/none elsewhere (Norwegian military = high in NO only).
- Public sector careers (teacher, nurse, police): high pathway availability in all countries, moderate-high job postings.
- Extremely niche careers (astronaut, spacecraft pilot): low/none job postings everywhere, low pathway availability.
- Remote viability: "none" for hands-on roles (chef, nurse, firefighter, plumber), "low" for mostly-in-person, "moderate" for hybrid-possible, "high" for fully remote-capable.
- Consider that GB and DE are much larger job markets than NO and SE.`;

// ── Generate ────────────────────────────────────────────────────────

const VALID_LEVELS: SignalLevel[] = ['none', 'low', 'moderate', 'high'];

function isValid(d: unknown): d is SignalMap {
  if (!d || typeof d !== 'object') return false;
  const o = d as Record<string, unknown>;
  for (const country of ['NO', 'GB', 'DE', 'SE']) {
    const c = o[country] as Record<string, unknown> | undefined;
    if (!c) return false;
    for (const dim of ['jobPostingPresence', 'companyPresence', 'industryPresence', 'pathwayAvailability', 'remoteViability']) {
      if (!VALID_LEVELS.includes(c[dim] as SignalLevel)) return false;
    }
  }
  return true;
}

async function generateOne(career: Career, attempt = 1): Promise<SignalMap | null> {
  const userMsg = JSON.stringify({
    title: career.title,
    description: career.description ?? '',
    avgSalary: career.avgSalary ?? '',
    educationPath: career.educationPath ?? '',
    growthOutlook: career.growthOutlook ?? '',
    entryLevel: career.entryLevel ?? false,
    pathType: career.pathType ?? null,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Career: ${userMsg}` },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValid(parsed)) return null;
    return parsed;
  } catch (err) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 1500));
      return generateOne(career, attempt + 1);
    }
    console.warn(`  ✖ ${career.id}: ${(err as Error).message}`);
    return null;
  }
}

// ── Output ──────────────────────────────────────────────────────────

const OUT_PATH = resolve(__dirname, '..', 'src', 'lib', 'career-presence', 'signals.generated.json');
const AUTOSAVE_EVERY = 50;

async function loadExisting(): Promise<Record<string, SignalMap>> {
  try {
    const raw = await readFile(OUT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function save(data: Record<string, SignalMap>) {
  const sorted = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeFile(OUT_PATH, JSON.stringify(sorted, null, 2), 'utf8');
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const existing = await loadExisting();
  const allCareers = getAllCareers();
  console.log(`Catalogue: ${allCareers.length} careers, ${Object.keys(existing).length} previously generated`);

  const targets = allCareers.filter((c) => {
    if (ONLY) return c.id === ONLY;
    if (FORCE) return true;
    // Skip if already in curated seed data OR in generated file
    return !getCareerSignals(c.id) && !existing[c.id];
  });

  const limited = targets.slice(0, LIMIT);
  console.log(`Generating ${limited.length} entries…`);
  if (limited.length === 0) {
    console.log('Nothing to do. ✓');
    return;
  }

  const out: Record<string, SignalMap> = { ...existing };
  let done = 0;
  let ok = 0;
  let failed = 0;
  const startedAt = Date.now();
  const queue = [...limited];

  async function worker() {
    while (queue.length > 0) {
      const career = queue.shift();
      if (!career) return;
      const result = await generateOne(career);
      done++;
      if (result) {
        out[career.id] = result;
        ok++;
      } else {
        failed++;
      }
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      const rate = (done / Math.max(1, Number(elapsed))).toFixed(2);
      process.stdout.write(
        `  [${done}/${limited.length}] ${career.id.padEnd(40)} ${result ? 'ok ' : 'skip'}  · ${rate}/s · ${elapsed}s\n`,
      );
      if (done % AUTOSAVE_EVERY === 0) {
        await save(out);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await save(out);

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\n✓ ${Object.keys(out).length} entries · ${ok} succeeded · ${failed} failed · ${elapsed}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
