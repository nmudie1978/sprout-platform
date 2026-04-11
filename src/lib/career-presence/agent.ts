/**
 * CareerPresenceSignalAgent — Bounded AI Interpretation Layer
 *
 * This agent is NOT a data source. It is a constrained interpreter
 * that takes deterministically scored signals and produces:
 *   1. A plain-English explanation
 *   2. A caution/helper note
 *
 * It must NEVER:
 *   - Invent labour-market facts
 *   - Fabricate country comparisons beyond what the data shows
 *   - Output exact percentages unless explicitly supplied
 *   - Recommend relocation
 *   - Use general model knowledge as evidence
 *
 * When OpenAI is unavailable, it falls back to deterministic
 * template-based explanations that are still useful and honest.
 */

import type { ScoredPresence, PresenceLevel, CareerPresenceResult } from './types';
import { ANCHOR_COUNTRY } from './types';

// ── Deterministic fallback (no AI needed) ───────────────────────────

const PRESENCE_ADJECTIVES: Record<PresenceLevel, string> = {
  high: 'well-established',
  moderate: 'present but not dominant',
  limited: 'less common',
};

const PRESENCE_DESCRIPTORS: Record<PresenceLevel, string> = {
  high: 'appears widely available',
  moderate: 'has a meaningful but more limited presence',
  limited: 'appears to have fewer opportunities',
};

function buildDeterministicExplanation(
  careerTitle: string,
  countries: ScoredPresence[],
): string {
  const norway = countries.find(c => c.countryCode === ANCHOR_COUNTRY);
  if (!norway) return '';

  const others = countries.filter(c => c.countryCode !== ANCHOR_COUNTRY);
  const stronger = others.filter(c => c.rawScore > norway.rawScore + 0.1);
  const similar = others.filter(c => Math.abs(c.rawScore - norway.rawScore) <= 0.1);

  let explanation = `${careerTitle} ${PRESENCE_DESCRIPTORS[norway.presenceLevel]} in Norway.`;

  if (stronger.length > 0) {
    const names = stronger.map(c => c.countryName).join(' and ');
    explanation += ` It appears more ${PRESENCE_ADJECTIVES[stronger[0].presenceLevel]} in ${names}.`;
  }

  if (similar.length > 0 && stronger.length === 0) {
    explanation += ` Availability looks similar across the countries compared here.`;
  }

  if (norway.presenceLevel === 'high') {
    explanation += ` Norway shows strong opportunities in this field.`;
  } else if (norway.presenceLevel === 'moderate') {
    explanation += ` Norway still has real opportunities, though the field may be more concentrated in certain regions or sectors.`;
  } else {
    explanation += ` Fewer roles may be available in Norway, but niche opportunities can still exist.`;
  }

  return explanation;
}

function buildCautionNote(countries: ScoredPresence[]): string {
  const hasLowConfidence = countries.some(c => c.confidenceLevel === 'low');

  if (hasLowConfidence) {
    return 'This is an early signal based on limited indicators. It may not reflect the full picture for every region or specialisation.';
  }

  return 'This is a directional signal based on available indicators. It does not reflect salary, competition, language requirements, or local barriers to entry.';
}

// ── AI-powered explanation (OpenAI, bounded) ────────────────────────

async function buildAIExplanation(
  careerTitle: string,
  countries: ScoredPresence[],
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.length < 10 || !apiKey.startsWith('sk-') || apiKey === 'sk-your-openai-api-key-here') {
    return null;
  }

  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey });

  const norway = countries.find(c => c.countryCode === ANCHOR_COUNTRY)!;
  const dataBlock = countries
    .map(c => `${c.countryName}: ${c.presenceLevel} presence (confidence: ${c.confidenceLevel})`)
    .join('\n');

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `You are a career presence interpreter for a youth app (ages 15-23) focused on Norway.

STRICT RULES:
- Only use the structured data provided below. Do not infer missing facts.
- Do not use general world knowledge as evidence.
- Do not invent statistics, percentages, or exact numbers.
- Do not recommend moving countries.
- Do not imply one country is "best".
- Keep language simple, calm, and honest.
- Write 2-3 short sentences max.
- If confidence is low, say so plainly.
- Norway is the anchor — always mention it first.`,
        },
        {
          role: 'user',
          content: `Career: ${careerTitle}\nNorway presence: ${norway.presenceLevel}\n\nAll data:\n${dataBlock}\n\nWrite a short, plain-English explanation of this career's availability across these countries. Start with Norway.`,
        },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Produce the full CareerPresenceResult by interpreting scored data.
 * Uses AI when available, falls back to deterministic templates.
 */
export async function interpretPresence(
  careerId: string,
  careerTitle: string,
  countries: ScoredPresence[],
): Promise<CareerPresenceResult> {
  // Try AI explanation first, fall back to deterministic
  const aiExplanation = await buildAIExplanation(careerTitle, countries);
  const explanation = aiExplanation || buildDeterministicExplanation(careerTitle, countries);
  const cautionNote = buildCautionNote(countries);

  return {
    careerId,
    careerTitle,
    countries,
    explanation,
    cautionNote,
    available: true,
  };
}

/**
 * Produce a safe fallback when no signal data exists.
 */
export function buildFallbackResult(careerId: string, careerTitle: string): CareerPresenceResult {
  return {
    careerId,
    careerTitle,
    countries: [],
    explanation: '',
    cautionNote: '',
    available: false,
  };
}
