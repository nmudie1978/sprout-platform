# AI usage guardrails (Career Twin)

Everything that stands between a young person's message and the OpenAI bill.

**Where the limits are configured:** [`src/lib/ai-usage/config.ts`](../src/lib/ai-usage/config.ts).
Every value there is overridable by an environment variable, so limits can be
re-tuned in the Vercel dashboard and take effect on the next request — no code
change and no redeploy of new logic.

---

## The request path

```
User → Career Twin UI → POST /api/career-twin (server)
                          ├─ 1. authenticate (NextAuth session)
                          ├─ 2. kill switch?            → refuse, record, no AI call
                          ├─ 3. 5 requests / minute?    → refuse, record, no AI call
                          ├─ 4. 15 questions / 24h?     → refuse, record, no AI call
                          ├─ 5. monthly cost ceiling?   → refuse, record, no AI call
                          ├─ 6. build bounded context (summary + recent turns)
                          ├─ 7. call OpenAI with max_tokens
                          ├─ 8. record tokens + estimated cost
                          └─ 9. stream the reply back
```

The OpenAI key lives only in the server environment (`OPENAI_API_KEY`). No
browser code imports the OpenAI SDK or sees a key; the UI only ever talks to
`/api/career-twin`.

Steps 2–5 are `checkAiGuardrails()` in
[`src/lib/ai-usage/guard.ts`](../src/lib/ai-usage/guard.ts). It **fails open**
on an internal error: a broken counter degrades protection rather than breaking
the product. The hard stops are the kill switch and the cap set in the OpenAI
billing dashboard.

## Configuration

| Setting | Default | Env var |
| --- | --- | --- |
| Daily questions per user (rolling 24h) | 15 | `CAREER_TWIN_DAILY_LIMIT` |
| Requests per minute per user | 5 | `CAREER_TWIN_REQUESTS_PER_MINUTE` |
| Max output tokens per reply | 400 | `CAREER_TWIN_MAX_OUTPUT_TOKENS` |
| Verbatim conversation turns in context | 6 | `CAREER_TWIN_MAX_CONTEXT_TURNS` |
| Token budget for those turns | 1200 | `CAREER_TWIN_MAX_CONTEXT_TOKENS` |
| Older turns before a summary is made | 6 | `CAREER_TWIN_SUMMARY_TRIGGER_TURNS` |
| Max size of the rolling summary | 220 tokens | `CAREER_TWIN_SUMMARY_MAX_TOKENS` |
| AI model | `gpt-4o-mini` | `CAREER_TWIN_MODEL` |
| Summariser model | `gpt-4o-mini` | `CAREER_TWIN_SUMMARY_MODEL` |
| Monthly platform cost ceiling (USD) | 200 | `AI_MONTHLY_COST_CEILING_USD` |
| Scenario-runner max output tokens | 750 | `EXPERIENCE_MAX_OUTPUT_TOKENS` |

An invalid value (a typo, a negative number) is ignored with a warning and the
default is used — a bad env var must never silently switch a limit off.

## Emergency kill switch

Three ways to stop Career Twin AI spend, fastest first:

1. **Runtime, no deploy** — set the Redis flag:
   `SET ai:kill-switch true` (clear with `DEL ai:kill-switch`).
   Takes effect within 30s across all instances.
2. **Env var, all AI features** — `AI_KILL_SWITCH=true`.
3. **Env var, Career Twin only** — `CAREER_TWIN_AI_DISABLED=true`.

While tripped, no request reaches OpenAI. Users see a calm "taking a short
break" message; nothing they've saved is affected. Every blocked request is
recorded with status `disabled`.

## Limits in detail

**5 requests / minute** — Redis-backed (`checkRateLimitAsync`), shared across
serverless instances. Blocks bursts, double-submits and scripted usage.

**15 questions / rolling 24 hours** — counted from the `AiUsageEvent` ledger,
not a fixed-window counter, so the window truly rolls and we can tell the user
*when* their next question unlocks (when the oldest of the 15 ages out).

Only requests with status `successful` count. A refused request, a provider
error, or a reply that tripped the safety guardrail does **not** burn a
question — but its cost, if any, is still recorded.

**Monthly cost ceiling** — the sum of `estimatedCostUsd` for the current UTC
calendar month across all users and features. Memoised for 60s. At the ceiling
every metered surface serves its non-AI fallback and logs an error. This is an
in-app early-trip backstop; the authoritative hard stop is the OpenAI billing
cap.

## Conversation context

Context is bounded by construction, so a two-year-old thread costs the same as
a new one:

```
[system prompt] + [rolling summary of older turns] + [last 6 turns, ≤1200 tokens] + [new message]
```

The rolling summary (`CareerTwinSummary`, one row per user+career) is refreshed
*after* a reply is delivered, via `next/server`'s `after()`, so it never adds
latency to a turn. Each refresh folds the previous summary into the newly aged
out messages and is hard-capped in length, so the summary cannot grow either.
The summary is replayed into later prompts, so it passes the same output safety
guardrail as any model text. See
[`src/lib/career-twin/context.ts`](../src/lib/career-twin/context.ts).

## Usage & cost tracking

Table `AiUsageEvent` (migration `20260831120000_ai_usage_guardrails`) — one row
per request attempt:

`userId`, `feature`, `status`, `model`, `inputTokens`, `outputTokens`,
`totalTokens`, `estimatedCostUsd`, `detail`, `createdAt`.

`feature` is `career_twin` (conversation), `career_twin_experience` (scenario
runner) or `career_twin_summary` (the background summariser).

`status` is `successful` | `rate_limited` | `daily_limit_reached` | `failed` |
`disabled` | `cost_capped`. It is a plain string column, so a new refusal
reason ships without a migration.

Token counts come from OpenAI's reported usage (`stream_options.include_usage`
on the streaming path); a ~4-chars-per-token estimate is the fallback if the
provider doesn't report. Costs come from the rate table in
[`src/lib/ai-usage/pricing.ts`](../src/lib/ai-usage/pricing.ts) — **update
prices there** when OpenAI changes them. An unknown model is priced at the most
expensive known rate so the ceiling trips early rather than late.

**Privacy:** the ledger holds usage metadata only. Prompt and response text
are never written to it, and `detail` is machine-readable only. Rows cascade
delete with the user.

Useful queries:

```sql
-- Spend this month, by feature
SELECT feature, SUM("estimatedCostUsd") AS usd, COUNT(*) AS requests
FROM "AiUsageEvent"
WHERE "createdAt" >= date_trunc('month', now())
GROUP BY feature ORDER BY usd DESC;

-- How often are users hitting the limits?
SELECT status, COUNT(*) FROM "AiUsageEvent"
WHERE "createdAt" > now() - interval '7 days' GROUP BY status;

-- Heaviest accounts this month
SELECT "userId", COUNT(*), SUM("estimatedCostUsd") AS usd
FROM "AiUsageEvent" WHERE "createdAt" >= date_trunc('month', now())
GROUP BY "userId" ORDER BY usd DESC LIMIT 20;
```

## Tuning notes

At the defaults, one Career Twin turn is roughly 1,200 input + 400 output
tokens on `gpt-4o-mini` ≈ **$0.0004**. A user who spends their full 15
questions every day for a month costs ≈ **$0.19**. The $200 monthly ceiling
therefore covers a lot of real usage — raise it deliberately, not reflexively,
and check the "heaviest accounts" query first.
