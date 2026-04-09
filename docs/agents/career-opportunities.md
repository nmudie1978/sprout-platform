# Career Opportunities Agent

Three-stage AI agent that finds, structures, and validates real-world
career opportunities for the Endeavrly youth platform.

```
SOURCE  →  STRUCTURE  →  VALIDATE
```

## Why three stages

Each stage has one job and is independently testable / replaceable.

- **SOURCE** — pull real items from the web (and the curated Norway
  programmes already in the codebase). Cannot rely on LLM memory or
  it will hallucinate URLs that 404.
- **STRUCTURE** — normalise raw fields into a consistent schema, add
  derived metadata (skills, tags, source hostname, confidence).
- **VALIDATE** — quality + safety review. Decide KEEP / KEEP_WITH_FLAGS
  / REJECT and adjust confidence.

The pipeline runs sequentially. Stage 2 only sees Stage 1's output;
Stage 3 only sees Stage 2's output. Each stage validates its own input
against a zod schema so a misbehaving LLM gets caught immediately.

## Files

| File | Role |
| --- | --- |
| `src/lib/agents/career-opportunities.ts` | Core pipeline. All three stages live here. |
| `src/app/api/agents/career-opportunities/route.ts` | HTTP wrapper. POST endpoint with 7-day cache. |

## Models

Configurable via env, defaults to `gpt-4o-mini` for everything:

| Env var | Default | Purpose |
| --- | --- | --- |
| `AGENT_SOURCE_MODEL` | `gpt-4o-mini` | Stage 1 (web search via Responses API) |
| `AGENT_TRANSFORM_MODEL` | `gpt-4o-mini` | Stages 2 + 3 (chat.completions, JSON mode) |

For higher quality bump SOURCE to `gpt-4o`. Transform stages are pure
JSON shaping and don't benefit much from the bigger model.

## Stage 1 — SOURCE

Uses the OpenAI **Responses API** with the `web_search_preview` tool
so the model can actually look things up. Returns up to 12 items
across three categories:

- `job` — entry-level jobs / internships
- `course` — online or in-person courses / certifications
- `university` — Norwegian universities, university colleges, fagskoler

Before the web search runs, the stage **seeds** the result with curated
Norwegian programmes from `getNorwayProgrammes()` and
`getCertificationPath()` (the same data that powers the Education &
Certs table on My Journey). This guarantees universities are never
empty even if web search fails.

Output is validated against `RawItemSchema`. Anything that doesn't
match is dropped silently.

## Stage 2 — STRUCTURE

Plain `chat.completions.create` call with `response_format:
{ type: "json_object" }`. Maps each raw item to a `StructuredItemData`
record:

```ts
{
  role: string;            // the career being researched
  category: 'job' | 'course' | 'university';
  title: string;
  provider: string;
  location: string;
  url: string;
  summary: string;         // max 2 lines, simple language
  requirements: string[];
  skills: string[];
  tags: string[];
  source: string;          // hostname extracted from URL
  last_verified: string;   // ISO date
  confidence_score: number;
  flags: string[];         // empty here, validation stage adds these
}
```

If the LLM call fails or returns unparseable data, a deterministic
TypeScript fallback (`mapRawToStructured`) maps the raw fields one-for-one
with conservative confidence. The pipeline never throws here.

## Stage 3 — VALIDATE

Plain `chat.completions.create` call with `response_format:
{ type: "json_object" }`. For each structured item, decides:

- `KEEP` — relevant, real source, age-appropriate, confidence ≥ 75
- `KEEP_WITH_FLAGS` — usable but minor issues, confidence 50–74
- `REJECT` — irrelevant, age-inappropriate, suspicious, paid upfront

Available flags (snake_case):

```
low_relevance         unclear_requirements    low_confidence
needs_review          outdated                senior_only
paid_upfront          unverified_source       language_barrier
```

Confidence is bumped:

- **+10** for top-tier Norwegian sources (utdanning.no, samordnaopptak.no,
  finn.no, nav.no, ntnu.no, uio.no, uib.no, uit.no, oslomet.no) and
  global ones (coursera.org, edx.org, linkedin.com).
- **−15** for unfamiliar hostnames.
- **−10** per meaningful flag.

REJECT items are filtered out before the result is returned to the
caller. The route only ships KEEP and KEEP_WITH_FLAGS.

## HTTP API

```
POST /api/agents/career-opportunities
Content-Type: application/json

{
  "career": "Healthcare Worker",
  "location": "Oslo"      // optional
}
```

Response:

```json
{
  "items": [
    {
      "data": { /* StructuredItemData */ },
      "decision": "KEEP" | "KEEP_WITH_FLAGS",
      "confidence_score": 0,
      "flags": []
    }
  ],
  "cached": false,
  "generatedAt": "2026-04-09T..."
}
```

## Caching

7-day cache in the existing `VideoCache` table (the table name is
legacy — it's a generic key/value JSON store). Key format:

```
agent:career-opportunities:v1:<career-slug>[:<location-slug>]
```

If the agent returns an empty array (e.g. web search quota exhausted),
the cache TTL drops to 1 hour so retries happen sooner instead of
locking in a bad result for a week.

Bump the `v1` suffix in the route file when you make breaking changes
to the pipeline output shape.

## Cost & latency

Per fresh request (no cache hit), expect roughly:

- 1× Responses-API call with web_search_preview (~$0.02–0.05, 5–15s)
- 1× chat.completions call with ~3000 input tokens (~$0.001, 1–2s)
- 1× chat.completions call with ~3000 input tokens (~$0.001, 1–2s)

Total: **~$0.03–0.06 and 8–20 seconds wall time** per uncached career.
After caching, cost drops to a single Postgres row read.

## Smoke test (CLI)

With `npm run dev` running:

```bash
curl -X POST http://localhost:3000/api/agents/career-opportunities \
  -H 'Content-Type: application/json' \
  -d '{"career":"Healthcare Worker","location":"Oslo"}' | jq
```

Or against a deployed instance:

```bash
curl -X POST https://YOUR-DOMAIN/api/agents/career-opportunities \
  -H 'Content-Type: application/json' \
  -d '{"career":"Software Developer"}' | jq '.items | length'
```

## How to wire it into the UI

The current Momentum / Real Voices / Real Career Paths sections in My
Journey already have their own (simpler) data sources. To use this
agent's output you can either:

1. Replace the URL-template `mockRealWorldProvider` in
   `src/lib/journey/real-world-provider.ts` with a fetch to this route
   (cache-first, fall back to mock on failure).
2. Add a new "Live opportunities" section under Grow that calls this
   route directly via React Query, keyed by the active goal title.

Either way, the route already returns shippable data — the consumer
just needs to render `data.title`, `data.summary`, `data.url`, and
the badges from `decision` / `flags`.

## Failure modes & fallbacks

The agent is defensive at every layer so you never get a 500 because
one stage misbehaved:

| Failure | Behaviour |
| --- | --- |
| `OPENAI_API_KEY` missing | Stage 1 returns curated Norway programmes only. Stages 2 & 3 use deterministic TypeScript fallbacks. Result is honest but smaller. |
| Web search times out | Stage 1 returns the curated seed alone. |
| Stage 2 LLM returns invalid JSON | Falls back to `mapRawToStructured` per raw item. |
| Stage 3 LLM returns invalid JSON | Falls back to `KEEP_WITH_FLAGS + needs_review` for every structured item. |
| Career field missing from POST body | 400 with zod error details. |
| Pipeline throws a real error | 500 with the error message. Cache is not written. |

## Hard rules baked into the prompts

These come from the original brief and are mirrored in the system
prompts of every stage so the LLM cannot drift:

- No hallucinated jobs, courses, or universities. Web-verified URLs
  only.
- Reading age ~14. British English. No jargon. No emoji. No exclamation
  marks.
- Norway-relevant where it matters (NOK, fagbrev, Samordna opptak,
  videregående).
- Audience is age 15–23. No senior-only roles. No paid-upfront content.
- Trust > volume. Few good items beats many mediocre ones.
- If unsure, the rule is **REJECT**.
