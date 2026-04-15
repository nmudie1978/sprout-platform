/**
 * Generate career progression data for every career in the catalogue
 * that doesn't already have an entry.
 *
 * Outputs both:
 *   - CareerLevel[] (entry/mid/senior/lead with salary ranges)
 *   - CareerPathProgression (entry roles → core roles → next roles)
 *
 * Appends to the existing careerProgressions array and
 * careerPathProgressionMap in src/lib/career-progressions.ts via a
 * generated overlay file: src/lib/career-progressions.generated.ts
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-progressions.ts
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-progressions.ts --force
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-progressions.ts --limit=10
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-progressions.ts --only=astronaut
 */

import { writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import OpenAI from 'openai';
import { getAllCareers, type Career } from '../src/lib/career-pathways';
import { getCareerProgression } from '../src/lib/career-progressions';

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

interface GeneratedProgression {
  levels: Array<{
    level: 'entry' | 'mid' | 'senior' | 'lead';
    title: string;
    yearsExperience: string;
    salaryRange: string;
  }>;
  paths: {
    entry: string[];
    core: string[];
    next: string[];
  };
}

// ── Prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You generate career progression data for a Norwegian youth careers platform (ages 15-23).

Given a career title, description, salary range, and education path, return a JSON object with this EXACT shape:

{
  "levels": [
    { "level": "entry", "title": "Entry-level job title", "yearsExperience": "0-2 years", "salaryRange": "XXX-XXXk kr" },
    { "level": "mid", "title": "Mid-level job title", "yearsExperience": "2-5 years", "salaryRange": "XXX-XXXk kr" },
    { "level": "senior", "title": "Senior job title", "yearsExperience": "5-10 years", "salaryRange": "XXX-XXXk kr" },
    { "level": "lead", "title": "Leadership/expert job title", "yearsExperience": "10+ years", "salaryRange": "XXX-XXXk kr" }
  ],
  "paths": {
    "entry": ["3 realistic entry-level roles that lead into this career"],
    "core": ["2 main role titles at this level"],
    "next": ["3-4 roles you can advance to from here"]
  }
}

Rules:
- Output ONLY valid JSON. No prose, no markdown.
- Use realistic Norwegian salary ranges in kr (kroner). Use "k" for thousands, "M" for millions.
- Salary ranges must increase at each level. Use the career's existing avgSalary as a guide for the mid-level range.
- Job titles must be specific and realistic — not generic ("Senior Professional").
- For vocational/trade careers, adapt titles (e.g. Apprentice → Journeyman → Master → Foreman).
- For military/public sector, use rank-based or grade-based titles.
- For creative/freelance careers, adapt honestly (e.g. Junior → Established → Senior → Creative Director / Studio Owner).
- British English. Reading age ~14. Keep it concise.`;

// ── Generate one career ─────────────────────────────────────────────

function isValid(d: unknown): d is GeneratedProgression {
  if (!d || typeof d !== 'object') return false;
  const o = d as Record<string, unknown>;
  if (!Array.isArray(o.levels) || o.levels.length !== 4) return false;
  const paths = o.paths as Record<string, unknown> | undefined;
  if (!paths) return false;
  return (
    Array.isArray(paths.entry) && paths.entry.length >= 2 &&
    Array.isArray(paths.core) && paths.core.length >= 1 &&
    Array.isArray(paths.next) && paths.next.length >= 2
  );
}

async function generateOne(career: Career, attempt = 1): Promise<GeneratedProgression | null> {
  const userMsg = JSON.stringify({
    title: career.title,
    description: career.description ?? '',
    avgSalary: career.avgSalary ?? '',
    educationPath: career.educationPath ?? '',
    entryLevel: career.entryLevel ?? false,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Career: ${userMsg}` },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
      max_tokens: 800,
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

const OUT_PATH = resolve(__dirname, '..', 'src', 'lib', 'career-progressions.generated.json');
const AUTOSAVE_EVERY = 25;

async function loadExisting(): Promise<Record<string, GeneratedProgression>> {
  try {
    const raw = await readFile(OUT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function save(data: Record<string, GeneratedProgression>) {
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
    // Skip if already in curated progressions OR in generated file
    return !getCareerProgression(c.id) && !existing[c.id];
  });

  const limited = targets.slice(0, LIMIT);
  console.log(`Generating ${limited.length} entries…`);
  if (limited.length === 0) {
    console.log('Nothing to do. ✓');
    return;
  }

  const out: Record<string, GeneratedProgression> = { ...existing };
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
