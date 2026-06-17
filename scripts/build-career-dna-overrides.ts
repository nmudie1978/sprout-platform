/**
 * Builds src/lib/career-dna-overrides.generated.ts from the AI-verification
 * workflow output (/tmp/dna-corrections/final-*.json).
 *
 * Each final-*.json is an array of { id, traits: {traitId: 0..10}, reason }.
 * We keep only the 8 in-scope judgment traits, validate ranges, and emit a
 * sorted, deterministic map. Run: npx tsx scripts/build-career-dna-overrides.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { getAllCareers } from '../src/lib/career-pathways';

const IN_SCOPE = new Set([
  'technical-depth', 'problem-solving', 'people-interaction', 'creativity',
  'leadership', 'ai-exposure', 'work-life-balance', 'independence',
]);

const DIR = '/tmp/dna-corrections';
const validIds = new Set(getAllCareers().map((c) => c.id));

type Correction = { id: string; traits: Record<string, number>; reason?: string };
const overrides: Record<string, Record<string, number>> = {};
let files = 0, careers = 0, traitChanges = 0, skippedUnknownId = 0, skippedOutOfScope = 0;

for (const f of readdirSync(DIR).filter((f) => /^final-\d+\.json$/.test(f)).sort()) {
  files++;
  let arr: Correction[];
  try { arr = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')); } catch { continue; }
  if (!Array.isArray(arr)) continue;
  for (const c of arr) {
    if (!c || typeof c.id !== 'string' || !c.traits) continue;
    if (!validIds.has(c.id)) { skippedUnknownId++; continue; }
    const clean: Record<string, number> = {};
    for (const [trait, score] of Object.entries(c.traits)) {
      if (!IN_SCOPE.has(trait)) { skippedOutOfScope++; continue; }
      const n = Math.round(Number(score));
      if (Number.isFinite(n) && n >= 0 && n <= 10) { clean[trait] = n; traitChanges++; }
    }
    if (Object.keys(clean).length > 0) {
      overrides[c.id] = { ...(overrides[c.id] ?? {}), ...clean };
      careers++;
    }
  }
}

// Deterministic, sorted output.
const sorted = Object.keys(overrides).sort();
const body = sorted
  .map((id) => {
    const traits = overrides[id];
    const inner = Object.keys(traits).sort().map((t) => `'${t}': ${traits[t]}`).join(', ');
    return `  ${JSON.stringify(id)}: { ${inner} },`;
  })
  .join('\n');

const out = `/**
 * AUTO-GENERATED — do not edit by hand.
 *
 * AI-verified accuracy corrections to the heuristically-derived Career DNA.
 * For each career id, a partial map of judgment-trait → corrected score (0–10).
 * Two independent agents reviewed every career's derived scores; only
 * corrections confirmed by an adversarial verifier are recorded here.
 *
 * Regenerate with: npx tsx scripts/build-career-dna-overrides.ts
 * (reads /tmp/dna-corrections/final-*.json from the verification workflow).
 *
 * Out of scope (never overridden): income-potential, education-length —
 * those are computed deterministically from salary / education data.
 */
import type { CareerDNATraitId } from '@/types/career-dna';

export const DNA_TRAIT_OVERRIDES: Record<string, Partial<Record<CareerDNATraitId, number>>> = {
${body}
};
`;

writeFileSync('src/lib/career-dna-overrides.generated.ts', out);
console.log(`Wrote ${sorted.length} career overrides (${traitChanges} trait changes) from ${files} batch files.`);
console.log(`Skipped: ${skippedUnknownId} unknown ids, ${skippedOutOfScope} out-of-scope traits.`);
