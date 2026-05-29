/**
 * Semantic-QA agent for slow-drift static content.
 *
 * Walks hand-curated career content (myths, typical-days, employers)
 * and asks an LLM whether each entry is still accurate, has aged out,
 * or names organisations / facts that may have changed. Writes a
 * REVIEW QUEUE — does NOT modify source files. Humans triage.
 *
 * The whole point of this agent is to convert "static-forever content
 * we never touch" into "static content we re-verify on a quarterly
 * cadence" without doing the work by hand.
 *
 * Usage:
 *   npx tsx scripts/semantic-qa-static-content.ts                 # all targets, default model
 *   npx tsx scripts/semantic-qa-static-content.ts --target=myths  # only career myths
 *   npx tsx scripts/semantic-qa-static-content.ts --limit=10      # cost-bounded run
 *   npx tsx scripts/semantic-qa-static-content.ts --verbose
 *
 * Targets:
 *   myths        — src/lib/career-myths.ts
 *   typical-days — src/lib/career-typical-days.ts (+ .generated.ts)
 *   employers    — src/lib/career-employers.ts (when added; placeholder for now)
 *
 * Cost: each entry is one chat completion, gpt-4o-mini, ~300 input
 * tokens / ~150 output tokens. ~$0.0005 per entry. A full pass over
 * all career myths (~200 entries) is ~$0.10. Bound runs with --limit
 * during development.
 *
 * Output: scripts/output/qa-review-queue-<timestamp>.json
 *   { reviewedAt, model, entries: [{ target, careerId, content,
 *     verdict: "current" | "review" | "outdated", reasoning,
 *     suggestedUpdate? }] }
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import OpenAI from 'openai';
import { CAREER_MYTHS, type CareerMyth } from '../src/lib/career-myths';

// ── Config ────────────────────────────────────────────────────────

const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'scripts/output');
const MODEL = process.env.QA_MODEL ?? 'gpt-4o-mini';
const TODAY = new Date().toISOString();

if (!process.env.OPENAI_API_KEY) {
  console.error('[qa-agent] OPENAI_API_KEY not set. Aborting.');
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── CLI args ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');

function parseFlag(name: string): string | null {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  if (!arg) return null;
  return arg.slice(name.length + 3);
}

const TARGET = (parseFlag('target') ?? 'myths') as 'myths' | 'typical-days' | 'employers';
const LIMIT = parseFlag('limit') ? Number.parseInt(parseFlag('limit')!, 10) : Infinity;

// ── Verdict shape ────────────────────────────────────────────────

type Verdict = 'current' | 'review' | 'outdated';

interface ReviewEntry {
  target: string;
  careerId: string;
  index: number;
  content: unknown;
  verdict: Verdict;
  reasoning: string;
  suggestedUpdate?: string;
}

// ── Prompt builder ────────────────────────────────────────────────

/**
 * The system prompt. Calibrated to favour false negatives over false
 * positives — i.e. we'd rather flag a borderline-outdated claim than
 * miss it. Humans do the final call. The model is explicitly told it
 * is allowed to say "current".
 */
const SYSTEM_PROMPT = `
You are a fact-checker for a youth career-guidance platform serving
15-23 year olds in Norway and the wider Nordics. You are reviewing a
single piece of editorial content for accuracy.

Your job: classify the content as exactly one of:
  - "current"  — the claim is still accurate as of today.
  - "review"   — the claim was accurate but specific facts (numbers,
                 organisation names, salary figures, percentages, dates)
                 may have drifted and a human should re-check the source.
  - "outdated" — the claim is materially wrong today and should not be
                 shown to students.

Rules:
  1. Be honest. If the claim is fine, return "current". Don't invent
     problems to look thorough.
  2. Numbers and percentages drift the fastest; flag any specific
     figure as "review" by default unless you're sure it's stable.
  3. Organisation names that may have been acquired / merged / wound
     up in 2024-2026 are "review".
  4. Universal claims about a profession (e.g. "developers spend time
     in meetings") are usually "current" unless they're specifically
     time-bound.
  5. Always include a one-sentence reasoning. If you flag, optionally
     include a "suggestedUpdate" with what to change.

Respond with ONLY a JSON object: { "verdict": "current"|"review"|"outdated",
"reasoning": "...", "suggestedUpdate": "..." (optional) }.
`.trim();

function userPromptForMyth(careerId: string, myth: CareerMyth): string {
  return `Career: ${careerId}

CLAIM: "${myth.claim}"
REALITY: "${myth.reality}"

Is this still accurate today? Classify as current / review / outdated.`;
}

// ── Reviewer ──────────────────────────────────────────────────────

async function reviewOne(prompt: string): Promise<{
  verdict: Verdict;
  reasoning: string;
  suggestedUpdate?: string;
}> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  try {
    const parsed = JSON.parse(raw);
    const verdict: Verdict =
      parsed.verdict === 'outdated'
        ? 'outdated'
        : parsed.verdict === 'review'
          ? 'review'
          : 'current';
    return {
      verdict,
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
      suggestedUpdate:
        typeof parsed.suggestedUpdate === 'string' ? parsed.suggestedUpdate : undefined,
    };
  } catch {
    return {
      verdict: 'review',
      reasoning: 'Model response could not be parsed; default to review.',
    };
  }
}

// ── Targets ───────────────────────────────────────────────────────

async function reviewMyths(): Promise<ReviewEntry[]> {
  const entries: ReviewEntry[] = [];
  let count = 0;
  for (const [careerId, myths] of Object.entries(CAREER_MYTHS)) {
    for (let i = 0; i < myths.length; i++) {
      if (count >= LIMIT) return entries;
      const myth = myths[i];
      if (VERBOSE) console.log(`  reviewing ${careerId}#${i}: "${myth.claim.slice(0, 60)}…"`);
      const result = await reviewOne(userPromptForMyth(careerId, myth));
      entries.push({
        target: 'myths',
        careerId,
        index: i,
        content: myth,
        verdict: result.verdict,
        reasoning: result.reasoning,
        suggestedUpdate: result.suggestedUpdate,
      });
      count += 1;
    }
  }
  return entries;
}

async function reviewTypicalDays(): Promise<ReviewEntry[]> {
  console.warn('[qa-agent] target=typical-days not yet implemented in this scaffold.');
  console.warn('  Add a reviewer here that imports from src/lib/career-typical-days and');
  console.warn('  evaluates each Day record (typicalDay, dailyTasks, topSkills, realityCheck).');
  return [];
}

async function reviewEmployers(): Promise<ReviewEntry[]> {
  console.warn('[qa-agent] target=employers not yet implemented in this scaffold.');
  console.warn('  Wire when src/lib/career-employers.ts becomes the source of truth.');
  return [];
}

// ── Run ───────────────────────────────────────────────────────────

async function main() {
  console.log(`[qa-agent] target=${TARGET} model=${MODEL} limit=${LIMIT === Infinity ? 'all' : LIMIT}`);

  let entries: ReviewEntry[] = [];
  if (TARGET === 'myths') entries = await reviewMyths();
  else if (TARGET === 'typical-days') entries = await reviewTypicalDays();
  else if (TARGET === 'employers') entries = await reviewEmployers();
  else {
    console.error(`[qa-agent] unknown target: ${TARGET}`);
    process.exit(1);
  }

  const review = entries.filter((e) => e.verdict === 'review').length;
  const outdated = entries.filter((e) => e.verdict === 'outdated').length;
  const current = entries.filter((e) => e.verdict === 'current').length;

  console.log(`[qa-agent] reviewed ${entries.length} entries: ${current} current · ${review} review · ${outdated} outdated.`);

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const stamp = TODAY.replace(/[:.]/g, '-');
  const outPath = resolve(OUT_DIR, `qa-review-queue-${TARGET}-${stamp}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        reviewedAt: TODAY,
        model: MODEL,
        target: TARGET,
        counts: { current, review, outdated, total: entries.length },
        entries,
      },
      null,
      2,
    ) + '\n',
    'utf-8',
  );
  console.log(`[qa-agent] wrote ${outPath}`);
}

main().catch((err) => {
  console.error('[qa-agent] failed:', err);
  process.exit(1);
});
