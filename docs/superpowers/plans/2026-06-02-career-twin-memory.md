# Career Twin Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Career Twin remember the user — persist every conversation turn server-side, rehydrate the thread on return, and give the future-self persona real "memory" (recent reflections, goal changes, quiz signal, time-since-last-talk) so it greets a returning teen like someone it knows, with a "check in with Future You" re-entry after a gap.

**Architecture:** Add a per-user, per-career `CareerTwinMessage` table (mirrors the existing `AiChatMessage` pattern). The server — not the client — becomes the source of truth for conversation history: the POST handler loads prior turns from the DB, builds a compact `TwinMemory` struct from already-server-side data (`CareerTwinMessage`, `JourneyReflection`, `JourneyGoalData`, `CareerQuizResult`), injects it into the system prompt, calls the model, then persists the new user+assistant turns. The GET handler returns prior messages + a `checkIn` signal so the client rehydrates and shows a warm re-entry after a gap. Pure logic (cadence math, prompt formatting, history clamping) is unit-tested; DB/route wiring is verified manually.

**Tech Stack:** Next.js 16 App Router (route handlers), Prisma + Postgres, NextAuth (session), OpenAI `gpt-4o-mini`, Vitest (jsdom), husky pre-commit runs `vitest run`.

**Dependency note:** This is self-contained — it uses data that is *already* persisted server-side. It does **not** require Priority #1 (server-side journey progress). When Priority #1 lands, `TwinMemory` gains a richer "what changed" signal for free (it already reads `JourneyGoalData`/`JourneyReflection`).

**Privacy note (CLAUDE.md privacy-by-design):** persisted Twin turns are youth conversation data. They must be (a) strictly user-scoped in every query, (b) cascade-deleted with the user (`onDelete: Cascade`), and (c) covered by account export/delete. Task 7 enforces this.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `prisma/schema.prisma` (modify) + new migration | `CareerTwinMessage` model + `User.careerTwinMessages` relation |
| `src/lib/career-twin/history.ts` (create) | DB read/write of Twin turns + pure `toPromptHistory()` clamp |
| `src/lib/career-twin/memory.ts` (create) | `loadTwinMemory()` (DB) + pure `daysBetween()` / `isReturningAfterGap()` / `extractQuizLabels()` |
| `src/lib/career-twin/types.ts` (modify) | add `TwinMemory` type + `memory?` on `BuildPromptInput` |
| `src/lib/career-twin/prompt.ts` (modify) | inject a "WHAT YOU REMEMBER ABOUT THEM" section when `memory` is present |
| `src/app/api/career-twin/route.ts` (modify) | POST: load DB history + memory, persist turns; GET: return history + `checkIn` |
| `src/components/career-twin/career-twin-view.tsx` (modify) | rehydrate `messages` from GET; show re-entry banner |
| `src/app/api/account/export/route.ts` (modify) | include Twin messages in the user's data export |
| `src/components/career-twin/career-twin-cta.tsx` (modify) | "Check in with Future You — it's been N weeks" when returning after a gap |
| `src/lib/career-twin/__tests__/twin-memory.test.ts` (create) | unit tests for the pure logic |

---

### Task 1: Add the `CareerTwinMessage` model + migration

**Files:**
- Modify: `prisma/schema.prisma` (near the existing `AiChatMessage` model, ~line 1951; and the `User` model relations block)
- Create: `prisma/migrations/20260602100000_add_career_twin_message/migration.sql`

- [ ] **Step 1: Add the model to the schema**

In `prisma/schema.prisma`, immediately after the `AiChatMessage` model block, add:

```prisma
/// One persisted turn of a Career Twin conversation. Scoped per user AND per
/// career so "Doctor future self" and "Software dev future self" are distinct
/// threads. Youth conversation data — always query by userId; cascade-delete.
model CareerTwinMessage {
  id        String   @id @default(cuid())
  userId    String
  careerId  String // resolved catalog id, or a title hint for off-catalog careers
  role      String // "user" | "assistant"
  content   String   @db.Text
  mode      String? // career-twin mode id active for this turn (e.g. "hard_truths")
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, careerId, createdAt])
}
```

- [ ] **Step 2: Add the back-relation on `User`**

In the `model User { ... }` relations section (where other `[]` relations like `careerTwinMessages` siblings live, e.g. near `aiChatMessages` if present, otherwise alongside other relations), add:

```prisma
  careerTwinMessages CareerTwinMessage[]
```

- [ ] **Step 3: Write the migration SQL**

Create `prisma/migrations/20260602100000_add_career_twin_message/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "CareerTwinMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerTwinMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerTwinMessage_userId_careerId_createdAt_idx" ON "CareerTwinMessage"("userId", "careerId", "createdAt");

-- AddForeignKey
ALTER TABLE "CareerTwinMessage" ADD CONSTRAINT "CareerTwinMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

- [ ] **Step 4: Regenerate the client + validate**

Run: `npx prisma generate && npx prisma validate`
Expected: "✔ Generated Prisma Client" and a valid-schema message (the `DIRECT_URL` env warning is fine locally). This migration is **additive** (new table only) — safe to auto-apply via the build's `prisma migrate deploy`.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: the pre-existing baseline count (34) — no new errors.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma "prisma/migrations/20260602100000_add_career_twin_message/migration.sql"
git commit -m "feat(career-twin): add CareerTwinMessage model for persisted conversations"
```

---

### Task 2: Conversation persistence helpers (`history.ts`)

**Files:**
- Create: `src/lib/career-twin/history.ts`
- Create/append test: `src/lib/career-twin/__tests__/twin-memory.test.ts`

- [ ] **Step 1: Write the failing test for the pure clamp**

Create `src/lib/career-twin/__tests__/twin-memory.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { toPromptHistory } from "@/lib/career-twin/history";

describe("toPromptHistory", () => {
  it("keeps only the last N turns and clamps content length", () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: "x".repeat(5000),
      mode: null,
      createdAt: new Date(),
    }));
    const out = toPromptHistory(rows, 6);
    expect(out).toHaveLength(6);
    expect(out[0].content.length).toBeLessThanOrEqual(2000);
    expect(out.every((m) => m.role === "user" || m.role === "assistant")).toBe(true);
  });

  it("drops rows with unknown roles", () => {
    const rows = [
      { role: "system", content: "a", mode: null, createdAt: new Date() },
      { role: "user", content: "b", mode: null, createdAt: new Date() },
    ];
    expect(toPromptHistory(rows, 6)).toEqual([{ role: "user", content: "b" }]);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/lib/career-twin/__tests__/twin-memory.test.ts`
Expected: FAIL — `toPromptHistory` is not exported / module not found.

- [ ] **Step 3: Implement `history.ts`**

Create `src/lib/career-twin/history.ts`:

```ts
/**
 * Server-side persistence for Career Twin conversations.
 * Import only from server code (route handlers) — touches Prisma.
 */
import { prisma } from "@/lib/prisma";

export interface TwinRow {
  role: string;
  content: string;
  mode: string | null;
  createdAt: Date;
}

export interface TwinTurn {
  role: "user" | "assistant";
  content: string;
}

/** Pure: clamp DB rows to the last `limit` valid turns for the model context. */
export function toPromptHistory(rows: TwinRow[], limit: number): TwinTurn[] {
  return rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .slice(-limit)
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content.slice(0, 2000) }));
}

/** Load a user's prior turns for one career, oldest → newest. */
export async function loadTwinHistory(
  userId: string,
  careerId: string,
  limit = 12,
): Promise<TwinRow[]> {
  return prisma.careerTwinMessage.findMany({
    where: { userId, careerId },
    orderBy: { createdAt: "asc" },
    take: limit * 2,
    select: { role: true, content: true, mode: true, createdAt: true },
  });
}

/** Persist one or more turns (user message + assistant reply). */
export async function appendTwinTurns(
  userId: string,
  careerId: string,
  turns: { role: "user" | "assistant"; content: string; mode?: string | null }[],
): Promise<void> {
  await prisma.careerTwinMessage.createMany({
    data: turns.map((t) => ({
      userId,
      careerId,
      role: t.role,
      content: t.content.slice(0, 4000),
      mode: t.mode ?? null,
    })),
  });
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/lib/career-twin/__tests__/twin-memory.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/career-twin/history.ts src/lib/career-twin/__tests__/twin-memory.test.ts
git commit -m "feat(career-twin): persistence helpers + history clamp (toPromptHistory)"
```

---

### Task 3: Memory + cadence (`memory.ts`, `types.ts`)

**Files:**
- Modify: `src/lib/career-twin/types.ts`
- Create: `src/lib/career-twin/memory.ts`
- Append test: `src/lib/career-twin/__tests__/twin-memory.test.ts`

- [ ] **Step 1: Add the `TwinMemory` type**

In `src/lib/career-twin/types.ts`, add (after `CareerTwinProfileContext`):

```ts
/** What the Twin "remembers" about a returning user — built server-side. */
export interface TwinMemory {
  /** ISO timestamp of the user's previous turn with THIS career's Twin, or null on first visit. */
  lastVisitAt: string | null;
  /** Whole days since the last turn (null on first ever visit). */
  daysSinceLastVisit: number | null;
  /** Up to 2 recent journey reflection responses (trimmed). */
  recentReflections: string[];
  /** Short labels of things that changed since lastVisitAt (e.g. "set a new primary goal"). */
  changedSinceLastVisit: string[];
  /** Top industry/strength labels from the user's latest career quiz. */
  quizLabels: string[];
}
```

Then add `memory?: TwinMemory | null;` to the `BuildPromptInput` interface in the same file.

- [ ] **Step 2: Write failing tests for the pure helpers**

Append to `src/lib/career-twin/__tests__/twin-memory.test.ts`:

```ts
import { daysBetween, isReturningAfterGap, extractQuizLabels, TWIN_CHECKIN_DAYS } from "@/lib/career-twin/memory";

describe("cadence + quiz extraction", () => {
  const now = Date.parse("2026-06-02T00:00:00.000Z");

  it("daysBetween returns whole days, null on bad/empty input", () => {
    expect(daysBetween("2026-05-26T00:00:00.000Z", now)).toBe(7);
    expect(daysBetween(null, now)).toBeNull();
    expect(daysBetween("not-a-date", now)).toBeNull();
  });

  it("isReturningAfterGap triggers only at/above threshold", () => {
    expect(isReturningAfterGap(TWIN_CHECKIN_DAYS)).toBe(true);
    expect(isReturningAfterGap(TWIN_CHECKIN_DAYS - 1)).toBe(false);
    expect(isReturningAfterGap(null)).toBe(false);
  });

  it("extractQuizLabels handles string[] and object[] JSON shapes", () => {
    expect(extractQuizLabels(["Healthcare", "Tech"])).toEqual(["Healthcare", "Tech"]);
    expect(extractQuizLabels([{ industry: "Design" }, { name: "Trades" }])).toEqual(["Design", "Trades"]);
    expect(extractQuizLabels(null)).toEqual([]);
    expect(extractQuizLabels("garbage")).toEqual([]);
  });
});
```

- [ ] **Step 3: Run to confirm failure**

Run: `npx vitest run src/lib/career-twin/__tests__/twin-memory.test.ts`
Expected: FAIL — `@/lib/career-twin/memory` not found.

- [ ] **Step 4: Implement `memory.ts`**

Create `src/lib/career-twin/memory.ts`:

```ts
/**
 * Builds the Career Twin's "memory" of a returning user from data that is
 * already persisted server-side. Server-only (touches Prisma).
 */
import { prisma } from "@/lib/prisma";
import type { TwinMemory } from "./types";

/** Days a user must be away before the Twin greets them as "returning". */
export const TWIN_CHECKIN_DAYS = 21;

/** Pure: whole days between an ISO timestamp and now (ms). Null on bad input. */
export function daysBetween(fromIso: string | null, nowMs: number): number | null {
  if (!fromIso) return null;
  const then = Date.parse(fromIso);
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((nowMs - then) / 86_400_000));
}

/** Pure: should we show a warm "it's been a while" re-entry? */
export function isReturningAfterGap(daysSince: number | null): boolean {
  return daysSince != null && daysSince >= TWIN_CHECKIN_DAYS;
}

/** Pure: defensively pull string labels from the quiz `topIndustries` JSON. */
export function extractQuizLabels(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const v = o.industry ?? o.name ?? o.label ?? o.title;
        return typeof v === "string" ? v : null;
      }
      return null;
    })
    .filter((s): s is string => !!s)
    .slice(0, 4);
}

/** Load the Twin's memory of this user for this career. */
export async function loadTwinMemory(
  userId: string,
  careerId: string,
  nowMs: number = Date.now(),
): Promise<TwinMemory> {
  const [lastTurn, reflections, activeGoal, quiz] = await Promise.all([
    prisma.careerTwinMessage.findFirst({
      where: { userId, careerId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.journeyReflection.findMany({
      where: { profile: { userId }, skipped: false, response: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { response: true, createdAt: true },
    }),
    prisma.journeyGoalData.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: "desc" },
      select: { goalTitle: true, updatedAt: true },
    }),
    prisma.careerQuizResult.findFirst({
      where: { userId },
      orderBy: { completedAt: "desc" },
      select: { topIndustries: true },
    }),
  ]);

  const lastVisitAt = lastTurn?.createdAt?.toISOString() ?? null;
  const daysSinceLastVisit = daysBetween(lastVisitAt, nowMs);

  const recentReflections = reflections
    .map((r) => (r.response ?? "").trim().slice(0, 160))
    .filter(Boolean)
    .slice(0, 2);

  const changedSinceLastVisit: string[] = [];
  if (lastVisitAt) {
    const since = Date.parse(lastVisitAt);
    if (activeGoal?.updatedAt && activeGoal.updatedAt.getTime() > since) {
      changedSinceLastVisit.push(`refocused on becoming a ${activeGoal.goalTitle}`);
    }
    const newReflections = reflections.filter((r) => r.createdAt.getTime() > since).length;
    if (newReflections > 0) {
      changedSinceLastVisit.push(`added ${newReflections} new reflection${newReflections > 1 ? "s" : ""}`);
    }
  }

  return {
    lastVisitAt,
    daysSinceLastVisit,
    recentReflections,
    changedSinceLastVisit,
    quizLabels: extractQuizLabels(quiz?.topIndustries ?? null),
  };
}
```

- [ ] **Step 5: Run to confirm pass**

Run: `npx vitest run src/lib/career-twin/__tests__/twin-memory.test.ts`
Expected: PASS (all suites).

- [ ] **Step 6: Commit**

```bash
git add src/lib/career-twin/types.ts src/lib/career-twin/memory.ts src/lib/career-twin/__tests__/twin-memory.test.ts
git commit -m "feat(career-twin): TwinMemory + cadence/quiz helpers (loadTwinMemory)"
```

---

### Task 4: Inject memory into the system prompt (`prompt.ts`)

**Files:**
- Modify: `src/lib/career-twin/prompt.ts`
- Append test: `src/lib/career-twin/__tests__/twin-memory.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/lib/career-twin/__tests__/twin-memory.test.ts`:

```ts
import { buildCareerTwinSystemPrompt } from "@/lib/career-twin/prompt";
import { buildPersona } from "@/lib/career-twin/persona";
import { getMode } from "@/lib/career-twin/modes";

describe("prompt memory injection", () => {
  const career = { id: "doctor", title: "Doctor", emoji: "🩺" };
  const persona = buildPersona({ userId: "u1", career, profile: null });
  const mode = getMode("ask_future_me");

  it("adds a remembered-context section when memory has signal", () => {
    const prompt = buildCareerTwinSystemPrompt({
      persona, mode, career, profile: null,
      memory: {
        lastVisitAt: "2026-05-01T00:00:00.000Z",
        daysSinceLastVisit: 32,
        recentReflections: ["I liked the biology module"],
        changedSinceLastVisit: ["added 1 new reflection"],
        quizLabels: ["Healthcare"],
      },
    });
    expect(prompt).toContain("WHAT YOU REMEMBER ABOUT THEM");
    expect(prompt).toContain("32 day");
    expect(prompt).toContain("never invent memories");
  });

  it("omits the section entirely when memory is null or empty", () => {
    const prompt = buildCareerTwinSystemPrompt({ persona, mode, career, profile: null, memory: null });
    expect(prompt).not.toContain("WHAT YOU REMEMBER ABOUT THEM");
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npx vitest run src/lib/career-twin/__tests__/twin-memory.test.ts`
Expected: FAIL — prompt has no "WHAT YOU REMEMBER ABOUT THEM" section.

- [ ] **Step 3: Implement the injection**

In `src/lib/career-twin/prompt.ts`, inside `buildCareerTwinSystemPrompt`, AFTER the existing `sections.push(`WHAT YOU KNOW ABOUT THE USER:\n- ${ctx.join("\n- ")}`);` line, add:

```ts
  // ── Memory of past conversations (the "knows my story" layer) ───────
  const memory = input.memory;
  if (memory) {
    const mem: string[] = [];
    if (memory.daysSinceLastVisit != null && memory.daysSinceLastVisit >= 1) {
      mem.push(
        `You last spoke about ${memory.daysSinceLastVisit} day(s) ago — greet them like someone you remember, warmly, not like a stranger.`,
      );
    }
    if (memory.changedSinceLastVisit.length > 0) {
      mem.push(`Since you last talked, they've: ${memory.changedSinceLastVisit.slice(0, 3).join("; ")}.`);
    }
    if (memory.recentReflections.length > 0) {
      mem.push(
        `They've recently reflected: ${memory.recentReflections.slice(0, 2).map((r) => `"${r}"`).join("; ")}.`,
      );
    }
    if (memory.quizLabels.length > 0) {
      mem.push(`Their interests/strengths lean toward: ${memory.quizLabels.slice(0, 4).join(", ")}.`);
    }
    if (mem.length > 0) {
      mem.push("Reference this naturally only if relevant — and never invent memories beyond what is listed here.");
      sections.push(`WHAT YOU REMEMBER ABOUT THEM:\n- ${mem.join("\n- ")}`);
    }
  }
```

Note: `memory` is already on `BuildPromptInput` (Task 3, Step 1). No signature change needed.

- [ ] **Step 4: Run to confirm pass**

Run: `npx vitest run src/lib/career-twin/__tests__/twin-memory.test.ts`
Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add src/lib/career-twin/prompt.ts src/lib/career-twin/__tests__/twin-memory.test.ts
git commit -m "feat(career-twin): inject remembered context into the system prompt"
```

---

### Task 5: Make the route server-authoritative (`route.ts`)

**Files:**
- Modify: `src/app/api/career-twin/route.ts`

- [ ] **Step 1: Update imports**

At the top of `src/app/api/career-twin/route.ts`, add to the existing imports:

```ts
import { loadTwinHistory, appendTwinTurns, toPromptHistory } from "@/lib/career-twin/history";
import { loadTwinMemory, isReturningAfterGap } from "@/lib/career-twin/memory";
```

- [ ] **Step 2: GET — return prior messages + check-in signal**

In the GET handler, after `const persona = buildPersona(...)`, replace the `return NextResponse.json({ ... })` with:

```ts
    const [history, memory] = await Promise.all([
      loadTwinHistory(session.user.id, career.id),
      loadTwinMemory(session.user.id, career.id),
    ]);

    return NextResponse.json({
      needsCareer: false,
      career: { id: career.id, title: career.title, emoji: career.emoji ?? null },
      persona,
      intro: persona.intro,
      disclaimer: persona.uncertaintyDisclaimer,
      modes: CAREER_TWIN_MODES.map((m) => ({
        id: m.id,
        label: m.label,
        description: m.description,
        starterQuestions: m.starterQuestions,
      })),
      // Rehydration + cadence:
      history: history
        .filter((r) => r.role === "user" || r.role === "assistant")
        .map((r) => ({ role: r.role, content: r.content })),
      checkIn: {
        returning: isReturningAfterGap(memory.daysSinceLastVisit),
        daysSinceLastVisit: memory.daysSinceLastVisit,
      },
    });
```

- [ ] **Step 3: POST — load history from DB, inject memory, persist turns**

In the POST handler: (a) delete the line that reads `body.conversationHistory` (the client is no longer the source of truth); (b) after `const persona = buildPersona(...)` add the memory load and pass it to the prompt; (c) build the model context from DB history; (d) persist both turns before returning.

Replace the block from `const persona = buildPersona(...)` down to the `return NextResponse.json({ message: assistantMessage, mode: mode.id });` with:

```ts
    const persona = buildPersona({ userId: session.user.id, career, profile });
    const mode = getMode(modeId);
    const memory = await loadTwinMemory(session.user.id, career.id);
    const replyLanguage = localeToLanguage(req.cookies.get("NEXT_LOCALE")?.value);
    const systemPrompt = buildCareerTwinSystemPrompt({ persona, mode, career, profile, language: replyLanguage, memory });

    const openai = getOpenAIClient();
    if (!openai) {
      // Still persist the user's message so the thread survives; reply is a fallback.
      await appendTwinTurns(session.user.id, career.id, [{ role: "user", content: message, mode: mode.id }]);
      return NextResponse.json({ message: twinFallback(career.title), fallback: true });
    }

    // Server-authoritative history (DB), not the client's claim.
    const dbHistory = await loadTwinHistory(session.user.id, career.id);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];
    toPromptHistory(dbHistory, 6).forEach((m) => messages.push({ role: m.role, content: m.content }));
    messages.push({ role: "user", content: message.slice(0, 2000) });

    const completion = await openai.chat.completions.create(
      { model: "gpt-4o-mini", messages, temperature: 0.8, max_tokens: 500 },
      { timeout: 25_000 },
    );

    let assistantMessage = completion.choices[0]?.message?.content?.trim() || "";

    const safety = isResponseSafe(assistantMessage);
    if (!assistantMessage || !safety.safe) {
      await appendTwinTurns(session.user.id, career.id, [{ role: "user", content: message, mode: mode.id }]);
      return NextResponse.json({ message: twinFallback(career.title), fallback: true });
    }
    if (replyLanguage === "English") {
      const lang = detectNonEnglishResponse(assistantMessage);
      if (lang.isNonEnglish) {
        assistantMessage = twinFallback(career.title);
      }
    }

    // Persist the completed turn (user + assistant) so the Twin remembers next time.
    await appendTwinTurns(session.user.id, career.id, [
      { role: "user", content: message, mode: mode.id },
      { role: "assistant", content: assistantMessage, mode: mode.id },
    ]);

    return NextResponse.json({ message: assistantMessage, mode: mode.id });
```

Also delete the now-unused `conversationHistory` parse near the top of POST:

```ts
    // DELETE these lines:
    const conversationHistory: { role: string; content: string }[] = Array.isArray(
      body.conversationHistory,
    )
      ? body.conversationHistory
      : [];
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -E "career-twin/route" || echo "no errors in route"`
Expected: `no errors in route`.

- [ ] **Step 5: Manual verification (DB round-trip)**

Run the app (`npm run dev`), open the Career Twin, send 2 messages, then reload the page.
Expected: the two messages (and replies) are still there after reload. Confirm rows exist:
`npx prisma studio` → `CareerTwinMessage` table shows 4 rows for your user, scoped to the career id.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/career-twin/route.ts
git commit -m "feat(career-twin): persist turns + server-authoritative history + memory in prompt"
```

---

### Task 6: Rehydrate the client + re-entry banner (`career-twin-view.tsx`)

**Files:**
- Modify: `src/components/career-twin/career-twin-view.tsx`

- [ ] **Step 1: Populate messages from the GET response**

In the mount `useEffect` that does `fetch(\`/api/career-twin${qs}\`)` (~line 102), where the response is handled and `setIntro`/`setCareer`/`setModes` are called, add — using the existing `TwinMessage` shape (give rehydrated rows stable ids):

```ts
        if (Array.isArray(data.history) && data.history.length > 0) {
          setMessages(
            data.history.map((m: { role: "user" | "assistant"; content: string }, i: number) => ({
              id: `hist-${i}`,
              role: m.role,
              content: m.content,
            })),
          );
        }
        if (data.checkIn?.returning) {
          setReturningDays(data.checkIn.daysSinceLastVisit ?? null);
        }
```

- [ ] **Step 2: Add the `returningDays` state**

Near the other `useState` declarations (~line 73-92), add:

```ts
  const [returningDays, setReturningDays] = useState<number | null>(null);
```

- [ ] **Step 3: Stop sending client history as authority (optional cleanup)**

In the send handler (~line 221-240), the POST body still includes `conversationHistory`. The server now ignores it, so remove it from the body to avoid confusion:

```ts
        const res = await fetch("/api/career-twin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            mode: modeId,
            careerId: career?.id ?? null,
          }),
        });
```

- [ ] **Step 4: Render the re-entry banner**

Where the intro/empty state renders (the `messages.length === 0 ? (...)` branch, ~line 441), add a returning-user line above the intro (only when `returningDays != null`):

```tsx
        {returningDays != null && (
          <div className="mb-4 rounded-card border border-border bg-primary/5 px-4 py-3 text-sm text-foreground/80">
            Welcome back — it&apos;s been about {Math.max(1, Math.round(returningDays / 7))} week
            {Math.round(returningDays / 7) === 1 ? "" : "s"}. Your future self has been waiting. Pick up where you left off.
          </div>
        )}
```

- [ ] **Step 5: Manual verification**

Run the app, send a message, reload → the thread is restored. To test the banner, in `prisma studio` set the user's latest `CareerTwinMessage.createdAt` to >21 days ago, reload the Twin → the "Welcome back" banner shows.

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit 2>&1 | grep -E "career-twin-view" || echo "clean"`
Expected: `clean`.

```bash
git add src/components/career-twin/career-twin-view.tsx
git commit -m "feat(career-twin): rehydrate conversation on load + returning-user re-entry banner"
```

---

### Task 7: Privacy — include Twin messages in account export

**Files:**
- Modify: `src/app/api/account/export/route.ts`

- [ ] **Step 1: Add Twin messages to the export query**

Twin messages cascade-delete with the user already (FK `onDelete: Cascade` from Task 1), so account deletion is covered. For GDPR data-access, include them in the export. In `src/app/api/account/export/route.ts`, after the existing `user` fetch, add a query and include it in the returned object:

```ts
    const twinMessages = await prisma.careerTwinMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { careerId: true, role: true, content: true, mode: true, createdAt: true },
    });
```

Then add to the JSON response object (alongside the other exported collections):

```ts
      careerTwinConversations: twinMessages,
```

- [ ] **Step 2: Typecheck + manual verify**

Run: `npx tsc --noEmit 2>&1 | grep -E "account/export" || echo "clean"`
Expected: `clean`. Then hit the export endpoint (or its UI button) as a user with Twin history and confirm `careerTwinConversations` is present in the downloaded JSON.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/account/export/route.ts
git commit -m "feat(career-twin): include Twin conversations in GDPR account export"
```

---

### Task 8: "Check in with Future You" dashboard nudge

**Files:**
- Modify: `src/components/career-twin/career-twin-cta.tsx`

**Context:** `CareerTwinCta` already renders the "Meet Future You" entry on the dashboard/journey (it's used at `(dashboard)/dashboard/page.tsx` and `my-journey/page.tsx`). We make its copy time-aware using the `checkIn` signal the GET now returns.

- [ ] **Step 1: Fetch the check-in signal in the CTA**

In `src/components/career-twin/career-twin-cta.tsx`, add a lightweight effect that calls the existing GET and reads `checkIn` (it returns fast; no new endpoint):

```ts
  const [returning, setReturning] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch("/api/career-twin")
      .then((r) => r.json())
      .then((d) => { if (alive && d?.checkIn?.returning) setReturning(true); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
```

- [ ] **Step 2: Swap the label when returning**

Where the CTA renders its primary label/sub-label, branch on `returning`:

```tsx
  {returning ? "Check in with Future You" : "Meet Future You"}
```

(and, if the component has a sub-label slot, use: `It's been a while — see how your future self responds now.`)

- [ ] **Step 3: Manual verify**

With a `CareerTwinMessage` row aged >21 days (as in Task 6 Step 5), load the dashboard → the CTA reads "Check in with Future You".

- [ ] **Step 4: Typecheck + run full suite + commit**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"` → expect baseline (34).
Run: `npx vitest run` → expect all green (the new `twin-memory.test.ts` included).

```bash
git add src/components/career-twin/career-twin-cta.tsx
git commit -m "feat(career-twin): time-aware 'Check in with Future You' CTA"
```

---

## Out of scope / explicit follow-ups (do NOT build here)

- **Monthly email digest** ("your exploration so far + one next step") — belongs to Priority #1's retention work, not this plan. The `checkIn` signal added here is the in-app half.
- **Saved-insight recall in memory** — Twin saved insights persist to `SavedItem` (`source = "Career Twin"`). Folding them into `TwinMemory` is a clean enhancement once the `SavedItem` keying (profileId) is confirmed; left out to avoid an unverified query.
- **Persona summarisation across very long histories** — `toPromptHistory` clamps to the last 6 turns; an LLM-generated rolling summary for power users is a later optimisation. YAGNI for now.
- **Cross-career memory** ("you also explored Nurse") — memory is intentionally per-career to keep threads coherent. Revisit only if users ask.

---

## Self-Review

**Spec coverage** (against Priority #3's recommended fix):
- "Persist Twin conversations" → Tasks 1, 2, 5 (model + helpers + route persists every turn). ✅
- "Let the persona evolve as the user's journey/skills/age change" → Tasks 3, 4, 5 (`loadTwinMemory` reads reflections/goal/quiz/age via existing profile load; injected into prompt). ✅
- "Add an explicit 'check in with Future You' cadence (monthly)" → Tasks 5, 6, 8 (`checkIn` signal at `TWIN_CHECKIN_DAYS = 21`; re-entry banner + time-aware CTA). In-app cadence done; email digest explicitly deferred. ✅
- "Pair with longitudinal data from Priority #1" → noted dependency; memory already reads server-side journey data and will strengthen automatically when #1 lands. ✅
- Privacy (youth data) → Task 7 + cascade delete in Task 1. ✅

**Placeholder scan:** no TBDs; every code step shows real code with confirmed field names (`JourneyReflection.response`/`profileId`, `CareerQuizResult.topIndustries`/`completedAt`, `JourneyGoalData.isActive`/`goalTitle`/`updatedAt`).

**Type consistency:** `TwinMemory` fields (`lastVisitAt`, `daysSinceLastVisit`, `recentReflections`, `changedSinceLastVisit`, `quizLabels`) are identical across `types.ts`, `memory.ts`, `prompt.ts`, and the tests. `toPromptHistory(rows, limit)` and `appendTwinTurns(userId, careerId, turns)` signatures match between `history.ts` and `route.ts`. `careerId` is consistently the resolved `career.id`.
