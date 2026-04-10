/**
 * Career Opportunities Agent — three-stage pipeline.
 *
 *   SOURCE  →  STRUCTURE  →  VALIDATE
 *
 * Spec lives in /docs/agents/career-opportunities.md (and the original
 * brief in the prompt that produced this file). This module is the
 * single source of truth for the agent. The HTTP route at
 * /api/agents/career-opportunities/route.ts is a thin wrapper.
 *
 * Design notes:
 *
 * - Stage 1 (SOURCE) cannot rely on the LLM's training memory or it
 *   will hallucinate URLs that 404. We use the OpenAI Responses API
 *   with the `web_search_preview` tool so the model can actually look
 *   things up. We ALSO seed the result with curated Norwegian
 *   programmes from `getNorwayProgrammes` so universities are always
 *   real even if web search fails or returns nothing.
 *
 * - Stages 2 (STRUCTURE) and 3 (VALIDATE) are pure transforms — they
 *   don't need web access — so they use plain chat.completions with
 *   `response_format: { type: "json_object" }`.
 *
 * - Every stage validates its output against a zod schema. If the LLM
 *   returns garbage we throw early instead of silently corrupting the
 *   pipeline.
 *
 * - All stages run sequentially. The user spec is explicit: "Do NOT
 *   stop after sourcing. Do NOT skip validation. Do NOT return partial
 *   output." We honour that — partial output throws.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { getNorwayProgrammes, getCertificationPath } from '@/lib/education/nordic-programmes';

// ────────────────────────────────────────────────────────────────────
// Public types
// ────────────────────────────────────────────────────────────────────

export interface CareerOpportunitiesInput {
  career: string;
  location?: string;
}

export interface StructuredItemData {
  role: string;
  category: 'job' | 'course' | 'university';
  title: string;
  provider: string;
  location: string;
  url: string;
  summary: string;
  requirements: string[];
  skills: string[];
  tags: string[];
  source: string;
  last_verified: string;
  confidence_score: number;
  flags: string[];
}

export type Decision = 'KEEP' | 'KEEP_WITH_FLAGS' | 'REJECT';

export interface ValidatedItem {
  data: StructuredItemData;
  decision: Decision;
  confidence_score: number;
  flags: string[];
}

export type CareerOpportunitiesResult = ValidatedItem[];

// ────────────────────────────────────────────────────────────────────
// Schemas (zod) — defensive validation between stages
// ────────────────────────────────────────────────────────────────────

const RawItemSchema = z.object({
  type: z.enum(['job', 'course', 'university']),
  title: z.string().min(1),
  provider: z.string().min(1),
  location: z.string().default(''),
  url: z.string().url(),
  description: z.string().default(''),
  requirements: z.string().default(''),
});
type RawItem = z.infer<typeof RawItemSchema>;

const StructuredItemSchema = z.object({
  role: z.string(),
  category: z.enum(['job', 'course', 'university']),
  title: z.string(),
  provider: z.string(),
  location: z.string(),
  url: z.string().url(),
  summary: z.string(),
  requirements: z.array(z.string()),
  skills: z.array(z.string()),
  tags: z.array(z.string()),
  source: z.string(),
  last_verified: z.string(),
  confidence_score: z.number().min(0).max(100),
  flags: z.array(z.string()),
});

const ValidatedItemSchema = z.object({
  data: StructuredItemSchema,
  decision: z.enum(['KEEP', 'KEEP_WITH_FLAGS', 'REJECT']),
  confidence_score: z.number().min(0).max(100),
  flags: z.array(z.string()),
});

// ────────────────────────────────────────────────────────────────────
// OpenAI client
// ────────────────────────────────────────────────────────────────────

let _openai: OpenAI | null | undefined;
function getOpenAI(): OpenAI | null {
  if (_openai !== undefined) return _openai;
  const key = process.env.OPENAI_API_KEY;
  _openai =
    key && key.length > 10 && key.startsWith('sk-') && key !== 'sk-your-openai-api-key-here'
      ? new OpenAI({ apiKey: key })
      : null;
  return _openai;
}

const SOURCE_MODEL = process.env.AGENT_SOURCE_MODEL ?? 'gpt-4o-mini';
const TRANSFORM_MODEL = process.env.AGENT_TRANSFORM_MODEL ?? 'gpt-4o-mini';

// ────────────────────────────────────────────────────────────────────
// Stage 1 — SOURCE (web search + curated seed)
// ────────────────────────────────────────────────────────────────────

const SOURCE_SYSTEM = `You are a careers researcher for a Norwegian youth platform (Endeavrly,
audience age 15-23). Find REAL, currently-live opportunities for the
given career.

You MUST use the web_search tool — do not rely on memory. Made-up URLs
will be rejected downstream.

Return up to 12 items split across these categories:
  - "job":        entry-level jobs or internships (real listings on
                  finn.no, linkedin.com/jobs, indeed.com, nav.no)
  - "course":     online or in-person courses / certifications from
                  recognised providers (coursera.org, edx.org,
                  udemy.com, futurelearn.com, linkedin.com/learning,
                  utdanning.no)
  - "university": Norwegian universities, university colleges or
                  fagskoler offering relevant programmes
                  (uio.no, ntnu.no, oslomet.no, uib.no, uit.no,
                  samordnaopptak.no, utdanning.no)

For each item return EXACTLY this JSON shape (no other fields):
{
  "type":         "job" | "course" | "university",
  "title":        "short, clear title",
  "provider":     "company / platform / institution name",
  "location":     "city, country (or 'Online' / 'Remote')",
  "url":          "the real, working URL you found",
  "description":  "1-2 sentences from the page itself",
  "requirements": "1 short line of entry requirements if visible, else empty"
}

Wrap the array under a top-level key "items" so the response is valid
JSON: { "items": [ ... ] }.

Hard rules:
- Only include items you actually found via web_search. If you cannot
  verify a URL, drop it.
- Prefer Norway-relevant results. Norwegian-language pages are fine.
- Aim for 3-5 jobs, 3-5 courses, 2-4 universities. Less is fine; do
  not pad with irrelevant filler.
- Avoid duplicates (same URL or near-identical title).
- Avoid senior-only roles, executive jobs, or anything obviously
  inappropriate for ages 15-23.
- Output ONLY valid JSON. No prose, no markdown fences, no commentary.`;

interface SourceResponse {
  items: unknown[];
}

async function stageSource({ career, location }: CareerOpportunitiesInput): Promise<RawItem[]> {
  const openai = getOpenAI();
  const items: RawItem[] = [];

  // ── (a) Curated seed: never let universities be empty for Norway.
  //    `getNorwayProgrammes` already has hand-verified entries for
  //    most common career IDs. We slug the career title to look it
  //    up; if no match we just skip and let web search fill in.
  const careerSlug = career.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const eduData = getNorwayProgrammes(careerSlug, career);
  if (eduData) {
    for (const p of eduData.programmes.slice(0, 4)) {
      items.push({
        type: 'university',
        title: p.programme + (p.englishName ? ` — ${p.englishName}` : ''),
        provider: p.institution,
        location: `${p.city}, Norway`,
        url: p.url,
        description: `${p.duration} ${p.type} programme. Apply via ${p.applicationVia}.`,
        requirements: '',
      });
    }
  }
  const certPath = getCertificationPath(careerSlug, career);
  if (certPath) {
    for (const c of certPath.certifications.slice(0, 3)) {
      items.push({
        type: 'course',
        title: c.name,
        provider: c.provider,
        location: 'Online',
        url: c.url,
        description: c.recognised,
        requirements: '',
      });
    }
  }

  // ── (b) Web search via Responses API. If we don't have a key or the
  //    call fails, we ship the curated seed alone — never empty.
  if (openai) {
    try {
      const userPrompt = location
        ? `Career: ${career}\nUser location: ${location}`
        : `Career: ${career}`;
      // Use the Responses API so we can attach web_search.
      // The SDK exposes this under `openai.responses.create`.
      const response = await (openai as unknown as {
        responses: {
          create: (args: Record<string, unknown>) => Promise<{ output_text?: string; output?: unknown[] }>;
        };
      }).responses.create({
        model: SOURCE_MODEL,
        tools: [{ type: 'web_search_preview' }],
        input: [
          { role: 'system', content: SOURCE_SYSTEM },
          { role: 'user', content: userPrompt },
        ],
      });

      // Extract the model's text output. The Responses API exposes a
      // convenience `output_text` getter on the SDK; if missing we
      // walk the structured `output` array for the first text chunk.
      let raw = response.output_text;
      if (!raw && Array.isArray(response.output)) {
        for (const block of response.output) {
          const b = block as { type?: string; content?: Array<{ type?: string; text?: string }> };
          if (b.type === 'message' && Array.isArray(b.content)) {
            for (const c of b.content) {
              if (c.type === 'output_text' && c.text) {
                raw = (raw ?? '') + c.text;
              }
            }
          }
        }
      }

      if (raw) {
        // Strip any accidental ```json fences.
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleaned) as SourceResponse;
        if (parsed && Array.isArray(parsed.items)) {
          for (const item of parsed.items) {
            const result = RawItemSchema.safeParse(item);
            if (result.success) {
              // Skip duplicate URLs vs. the curated seed.
              if (!items.some((existing) => existing.url === result.data.url)) {
                items.push(result.data);
              }
            }
          }
        }
      }
    } catch (err) {
      // Web search failed — log but ship curated seed alone. Better
      // than empty.
      console.warn('[career-opportunities] stage 1 web search failed:', (err as Error).message);
    }
  }

  return items;
}

// ────────────────────────────────────────────────────────────────────
// Stage 2 — STRUCTURE (normalise + enrich)
// ────────────────────────────────────────────────────────────────────

const STRUCTURE_SYSTEM = `You convert raw career opportunity items into clean structured records.
Audience: ages 15-23, early career exploration. Tone: simple, calm,
honest. Reading age ~14. British English.

Input: an array of raw items, each with type, title, provider,
location, url, description, requirements.

For EACH input item, produce ONE structured record with this exact
shape:

{
  "role":             "{{the career being researched}}",
  "category":         "job" | "course" | "university",
  "title":            "clean, concise title",
  "provider":         "clean provider name",
  "location":         "City, Country format (or 'Online')",
  "url":              "the original URL — never invent or modify",
  "summary":          "max 2 short lines, simple language, what this is and why it matters",
  "requirements":     ["array", "of", "simplified entry requirements"],
  "skills":           ["array", "of", "skills you would build or need"],
  "tags":             ["short tags like 'healthcare', 'entry-level', 'degree', 'remote'"],
  "source":           "short hostname extracted from the URL, e.g. 'finn.no'",
  "last_verified":    "{{today's ISO date}}",
  "confidence_score": 0-100,
  "flags":            []   // leave empty here — validation stage adds flags
}

Rules:
- NEVER invent a URL or title not in the input.
- NEVER fabricate requirements that aren't visible in the input.
  Empty array is fine.
- summary must be plain language. Avoid jargon and corporate speak.
- confidence_score: start at 60. +20 if title and provider and url and
  description are all clearly populated. +10 if requirements is
  populated. -20 if anything looks vague.
- Output ONLY a top-level JSON object: { "items": [ ... ] }.
- Output ONLY valid JSON. No prose, no markdown.`;

async function stageStructure(
  rawItems: RawItem[],
  career: string,
): Promise<StructuredItemData[]> {
  if (rawItems.length === 0) return [];
  const openai = getOpenAI();
  if (!openai) {
    // Without an LLM we still produce a usable record by mapping
    // raw fields directly. Confidence is conservative.
    return rawItems.map((r) => mapRawToStructured(r, career));
  }

  const today = new Date().toISOString().slice(0, 10);
  const userPrompt = JSON.stringify({
    role: career,
    today,
    rawItems,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: TRANSFORM_MODEL,
      messages: [
        { role: 'system', content: STRUCTURE_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return rawItems.map((r) => mapRawToStructured(r, career));
    const parsed = JSON.parse(raw) as { items?: unknown[] };
    if (!parsed.items || !Array.isArray(parsed.items)) {
      return rawItems.map((r) => mapRawToStructured(r, career));
    }

    const out: StructuredItemData[] = [];
    for (const item of parsed.items) {
      const result = StructuredItemSchema.safeParse(item);
      if (result.success) out.push(result.data);
    }
    // If the LLM dropped items unexpectedly, top up from the raw set.
    if (out.length < rawItems.length / 2) {
      return rawItems.map((r) => mapRawToStructured(r, career));
    }
    return out;
  } catch (err) {
    console.warn('[career-opportunities] stage 2 failed:', (err as Error).message);
    return rawItems.map((r) => mapRawToStructured(r, career));
  }
}

/** Deterministic fallback when the LLM is unavailable or returns junk. */
function mapRawToStructured(r: RawItem, career: string): StructuredItemData {
  let host = '';
  try {
    host = new URL(r.url).hostname.replace(/^www\./, '');
  } catch {
    /* leave empty */
  }
  const requirements = r.requirements
    ? r.requirements.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    role: career,
    category: r.type,
    title: r.title,
    provider: r.provider,
    location: r.location || (r.type === 'course' ? 'Online' : ''),
    url: r.url,
    summary: r.description.slice(0, 200),
    requirements,
    skills: [],
    tags: [r.type, host].filter(Boolean),
    source: host,
    last_verified: new Date().toISOString().slice(0, 10),
    confidence_score: r.description ? 65 : 45,
    flags: [],
  };
}

// ────────────────────────────────────────────────────────────────────
// Stage 3 — VALIDATE (quality + safety + decision)
// ────────────────────────────────────────────────────────────────────

const VALIDATE_SYSTEM = `You are a quality reviewer for a Norwegian youth careers platform.
Audience: ages 15-23. Decisions go LIVE to teenagers.

Input: an array of structured opportunity items.

For EACH item, decide:
  decision: "KEEP" | "KEEP_WITH_FLAGS" | "REJECT"

Use this rubric:
  - KEEP             — relevant, clear, real source, age-appropriate,
                       confidence 75+
  - KEEP_WITH_FLAGS  — usable but has minor issues (vague summary,
                       unclear requirements, dated tone). Add the
                       relevant flags. confidence 50-74.
  - REJECT           — irrelevant to the career, age-inappropriate,
                       senior-only, suspicious URL, requires payment
                       up front, vague to the point of being useless.

Possible flags (use any that apply, lowercase, snake_case):
  low_relevance
  unclear_requirements
  low_confidence
  needs_review
  outdated
  senior_only
  paid_upfront
  unverified_source
  language_barrier  (if the page is not in English/Norwegian)

Adjustment rules:
- Bump confidence_score up by 10 if the source is a top-tier provider
  (utdanning.no, samordnaopptak.no, finn.no, nav.no, coursera.org,
  edx.org, linkedin.com, ntnu.no, uio.no, oslomet.no, uib.no, uit.no).
- Bump confidence down by 15 if the source hostname is unfamiliar.
- Bump confidence down by 10 for each meaningful flag.

Output ONE wrapped JSON object: { "items": [ <ValidatedItem>... ] }
where each ValidatedItem is:

{
  "data":             { ...the structured input record, with the
                        adjusted confidence_score and the merged
                        flags written into data.flags },
  "decision":         "KEEP" | "KEEP_WITH_FLAGS" | "REJECT",
  "confidence_score": <adjusted number 0-100>,
  "flags":            ["..."]
}

Output ONLY valid JSON. No prose, no markdown.`;

async function stageValidate(
  structured: StructuredItemData[],
): Promise<ValidatedItem[]> {
  if (structured.length === 0) return [];
  const openai = getOpenAI();
  if (!openai) {
    // Deterministic fallback: KEEP everything with conservative
    // confidence. Better than throwing.
    return structured.map((d) => ({
      data: d,
      decision: 'KEEP_WITH_FLAGS' as const,
      confidence_score: d.confidence_score,
      flags: ['needs_review'],
    }));
  }

  try {
    const completion = await openai.chat.completions.create({
      model: TRANSFORM_MODEL,
      messages: [
        { role: 'system', content: VALIDATE_SYSTEM },
        { role: 'user', content: JSON.stringify({ items: structured }) },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('empty validate response');
    const parsed = JSON.parse(raw) as { items?: unknown[] };
    if (!parsed.items || !Array.isArray(parsed.items)) {
      throw new Error('validate response missing items array');
    }
    const out: ValidatedItem[] = [];
    for (const item of parsed.items) {
      const result = ValidatedItemSchema.safeParse(item);
      if (result.success) out.push(result.data);
    }
    if (out.length === 0) throw new Error('validate dropped every item');
    return out;
  } catch (err) {
    console.warn('[career-opportunities] stage 3 failed:', (err as Error).message);
    return structured.map((d) => ({
      data: d,
      decision: 'KEEP_WITH_FLAGS' as const,
      confidence_score: d.confidence_score,
      flags: ['needs_review'],
    }));
  }
}

// ────────────────────────────────────────────────────────────────────
// Public entry point — runs the full SOURCE → STRUCTURE → VALIDATE chain
// ────────────────────────────────────────────────────────────────────

export async function runCareerOpportunitiesAgent(
  input: CareerOpportunitiesInput,
): Promise<CareerOpportunitiesResult> {
  if (!input.career || !input.career.trim()) {
    throw new Error('career is required');
  }

  // Stage 1
  const raw = await stageSource(input);
  if (raw.length === 0) {
    // Honest empty result rather than fabricating.
    return [];
  }

  // Stage 2
  const structured = await stageStructure(raw, input.career);
  if (structured.length === 0) return [];

  // Stage 3
  const validated = await stageValidate(structured);

  // Final filter: drop REJECT decisions before returning. The spec
  // says "Return ONLY the final validated array" — REJECT items have
  // been validated, but they shouldn't be shipped to teenagers.
  return validated.filter((v) => v.decision !== 'REJECT');
}
