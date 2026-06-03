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
 * Pure logic (prompts, verdict parsing, the review runner) lives in
 * src/lib/semantic-qa-core.ts and is unit-tested. This file is the
 * OpenAI + CLI wiring.
 *
 * Usage:
 *   npx tsx scripts/semantic-qa-static-content.ts                 # default target (myths)
 *   npx tsx scripts/semantic-qa-static-content.ts --target=typical-days
 *   npx tsx scripts/semantic-qa-static-content.ts --limit=10      # cost-bounded run
 *   npx tsx scripts/semantic-qa-static-content.ts --verbose
 *
 * Targets:
 *   myths        — src/lib/career-myths.ts
 *   typical-days — src/lib/career-typical-days.ts (curated entries)
 *   employers    — src/lib/career-employers.ts (when added; placeholder for now)
 *
 * Cost: one chat completion per entry, gpt-4o-mini, ~$0.0005 each.
 * Bound runs with --limit during development.
 *
 * Output: scripts/output/qa-review-queue-<target>-<timestamp>.json
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import OpenAI from 'openai';
import { CAREER_MYTHS } from '../src/lib/career-myths';
import { _CAREER_DETAILS_CURATED_FOR_QA } from '../src/lib/career-typical-days';
import {
  SYSTEM_PROMPT,
  userPromptForMyth,
  userPromptForTypicalDay,
  parseVerdict,
  runReview,
  summarise,
  type ReviewItem,
  type VerdictResult,
} from '../src/lib/semantic-qa-core';

// ── Config ────────────────────────────────────────────────────────

const OUT_DIR = resolve(__dirname, 'output');
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
  return arg ? arg.slice(name.length + 3) : null;
}

const TARGET = (parseFlag('target') ?? 'myths') as 'myths' | 'typical-days' | 'employers';
const LIMIT = parseFlag('limit') ? Number.parseInt(parseFlag('limit')!, 10) : Infinity;

// ── OpenAI-backed reviewer ────────────────────────────────────────

async function openAiReview(prompt: string): Promise<VerdictResult> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  });
  return parseVerdict(completion.choices[0]?.message?.content ?? '{}');
}

// ── Item builders (pure: content → review work-list) ──────────────

function mythItems(): ReviewItem[] {
  const items: ReviewItem[] = [];
  for (const [careerId, myths] of Object.entries(CAREER_MYTHS)) {
    myths.forEach((myth, index) => {
      items.push({ target: 'myths', careerId, index, content: myth, prompt: userPromptForMyth(careerId, myth) });
    });
  }
  return items;
}

function typicalDayItems(): ReviewItem[] {
  const items: ReviewItem[] = [];
  let index = 0;
  for (const [careerId, details] of Object.entries(_CAREER_DETAILS_CURATED_FOR_QA)) {
    items.push({
      target: 'typical-days',
      careerId,
      index: index++,
      content: details,
      prompt: userPromptForTypicalDay(careerId, details),
    });
  }
  return items;
}

function itemsForTarget(): ReviewItem[] {
  if (TARGET === 'myths') return mythItems();
  if (TARGET === 'typical-days') return typicalDayItems();
  if (TARGET === 'employers') {
    console.warn('[qa-agent] target=employers not yet implemented (src/lib/career-employers.ts does not exist).');
    return [];
  }
  console.error(`[qa-agent] unknown target: ${TARGET}`);
  process.exit(1);
}

// ── Run ───────────────────────────────────────────────────────────

async function main() {
  console.log(`[qa-agent] target=${TARGET} model=${MODEL} limit=${LIMIT === Infinity ? 'all' : LIMIT}`);

  const items = itemsForTarget();
  const entries = await runReview(items, openAiReview, LIMIT, (item) => {
    if (VERBOSE) console.log(`  reviewing ${item.careerId}#${item.index}`);
  });

  const counts = summarise(entries);
  console.log(
    `[qa-agent] reviewed ${counts.total} entries: ${counts.current} current · ${counts.review} review · ${counts.outdated} outdated.`,
  );

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const stamp = TODAY.replace(/[:.]/g, '-');
  const outPath = resolve(OUT_DIR, `qa-review-queue-${TARGET}-${stamp}.json`);
  writeFileSync(
    outPath,
    JSON.stringify({ reviewedAt: TODAY, model: MODEL, target: TARGET, counts, entries }, null, 2) + '\n',
    'utf-8',
  );
  console.log(`[qa-agent] wrote ${outPath}`);
}

main().catch((err) => {
  console.error('[qa-agent] failed:', err);
  process.exit(1);
});
