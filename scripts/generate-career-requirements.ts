/**
 * Generate structured "What You Need" requirements for every career.
 *
 * Outputs: src/lib/education/data/career-requirements.json
 *
 * Each career gets a structured chain:
 *   School subjects → University programme → Entry-level requirements → Career outcome
 *
 * Incremental: only generates for careers not already in the file.
 * Re-run with --force to regenerate everything.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-requirements.ts
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-requirements.ts --force
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-requirements.ts --only=surgeon
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-career-requirements.ts --limit=10
 */

import { writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import OpenAI from 'openai';
import { z } from 'zod';
import { getAllCareers, type Career } from '../src/lib/career-pathways';

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

// ── Schema ──────────────────────────────────────────────────────────

const RequirementsSchema = z.object({
  schoolSubjects: z.object({
    required: z.array(z.string()).min(1),
    recommended: z.array(z.string()),
    minimumGrade: z.string(),
  }),
  universityPath: z.object({
    programme: z.string(),
    duration: z.string(),
    type: z.string(),
    examples: z.array(z.string()).min(1),
    applicationRoute: z.string(),
    competitiveness: z.string(),
  }),
  entryLevelRequirements: z.object({
    title: z.string(),
    description: z.string(),
    whatYouNeed: z.string(),
  }),
  qualifiesFor: z.object({
    immediate: z.string(),
    withExperience: z.string(),
    seniorPath: z.string(),
  }),
  specialisationNote: z.string().nullable(),
});

type CareerRequirements = z.infer<typeof RequirementsSchema>;

// ── Prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You generate structured career entry-requirements data for a Nordic youth platform (ages 15-23, based in Norway).

Given a career title, description, education path, and key skills, return a JSON object with this EXACT shape:

{
  "schoolSubjects": {
    "required": ["3-5 school subjects absolutely needed to enter the university programme for this career"],
    "recommended": ["1-3 additional subjects that help but aren't mandatory"],
    "minimumGrade": "One sentence describing the grade expectations (e.g. 'Top grades in science subjects, typically 5-6 in Norwegian scale' or 'Solid pass in core subjects, no specific grade requirement')"
  },
  "universityPath": {
    "programme": "The name of the degree/programme needed (e.g. 'Bachelor in Nursing', 'Integrated Master in Medicine')",
    "duration": "e.g. '3 years', '6 years', '5 years (integrated)'",
    "type": "bachelor | master | integrated | vocational | fagbrev | diploma",
    "examples": ["2-4 real Nordic university names that offer this programme (UiO, NTNU, Karolinska, etc.)"],
    "applicationRoute": "How to apply (e.g. 'Samordna opptak (Norway), antagning.se (Sweden)')",
    "competitiveness": "One honest sentence about how hard it is to get in"
  },
  "entryLevelRequirements": {
    "title": "The title of the first real job or required post-degree step (e.g. 'LIS1 Internship', 'Graduate Engineer', 'Trainee Nurse')",
    "description": "One sentence describing what this step involves",
    "whatYouNeed": "What qualifications/experience you need to start (e.g. 'Completed nursing degree + Helsedirektoratet authorisation')"
  },
  "qualifiesFor": {
    "immediate": "What job you can do right after qualifying (e.g. 'Junior doctor (LIS1)', 'Staff nurse', 'Graduate developer')",
    "withExperience": "What you can become with 3-5 years experience",
    "seniorPath": "The senior/leadership destination (e.g. 'Consultant surgeon', 'Principal engineer', 'Head of department')"
  },
  "specialisationNote": "If this career is a specialisation of another (e.g. surgeon = specialisation of doctor), explain the additional training path in one sentence. Otherwise null."
}

Rules:
- Output ONLY valid JSON. No prose, no markdown.
- Use real Nordic institutions where possible (Norwegian, Swedish, Danish, Finnish).
- Keep all text concise — one sentence max per field.
- Reading age ~14. British English. No jargon.
- For vocational careers (plumber, electrician, etc.), the "university" path becomes the fagbrev/apprenticeship path.
- For careers that don't need a degree (e.g. entrepreneur, freelancer), adapt the structure honestly — don't invent fake requirements.
- If unsure about specific Nordic details, generalise safely rather than inventing.`;

// ── Generate one career ─────────────────────────────────────────────

async function generateOne(career: Career, attempt = 1): Promise<CareerRequirements | null> {
  const userMsg = JSON.stringify({
    title: career.title,
    description: career.description ?? '',
    educationPath: career.educationPath ?? '',
    keySkills: career.keySkills ?? [],
    growthOutlook: career.growthOutlook ?? '',
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
      max_tokens: 1000,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = RequirementsSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data;
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

const OUT_PATH = resolve(__dirname, '..', 'src', 'lib', 'education', 'data', 'career-requirements.json');
const AUTOSAVE_EVERY = 25;

async function main() {
  // Load existing
  let existing: Record<string, CareerRequirements> = {};
  try {
    const raw = await readFile(OUT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    existing = parsed.requirements ?? {};
  } catch {
    // File doesn't exist yet
  }

  const allCareers = getAllCareers();
  console.log(`Catalogue: ${allCareers.length} careers, ${Object.keys(existing).length} already generated`);

  // Decide what to generate
  const targets = allCareers.filter((c) => {
    if (ONLY) return c.id === ONLY;
    if (FORCE) return true;
    return !existing[c.id];
  });

  const limited = targets.slice(0, LIMIT);
  console.log(`Generating ${limited.length} entries…`);
  if (limited.length === 0) {
    console.log('Nothing to do. ✓');
    return;
  }

  const out: Record<string, CareerRequirements> = { ...existing };
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
      process.stdout.write(
        `  [${done}/${limited.length}] ${career.id.padEnd(40)} ${result ? 'ok ' : 'skip'}  · ${elapsed}s\n`,
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

async function save(data: Record<string, CareerRequirements>) {
  const sorted = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeFile(
    OUT_PATH,
    JSON.stringify(
      {
        meta: {
          source: 'AI-generated from career data + Nordic education context',
          lastUpdated: new Date().toISOString().slice(0, 10),
          note: 'Regenerate with: npx tsx scripts/generate-career-requirements.ts',
        },
        requirements: sorted,
      },
      null,
      2,
    ),
    'utf8',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
