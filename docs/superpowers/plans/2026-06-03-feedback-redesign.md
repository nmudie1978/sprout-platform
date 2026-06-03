# Feedback Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stale Likert pilot survey at `/feedback` with a calm "typed feedback" experience (pick a kind + optional area + message), and re-implement the admin reporting to match — removing all references to small jobs, secondary goals, and the old Likert questions.

**Architecture:** Additive, non-destructive Prisma migration adds `kind`/`area`/`message` columns + two enums and relaxes the legacy Likert/`role` columns to nullable. A new `feedback-validation` module holds the testable API contract; `feedback-stats` is re-implemented around the new shape; the user form and admin page are rewritten; the recharts Likert report component is deleted in favour of calm inline CSS-bar summaries.

**Tech Stack:** Next.js 14 (App Router), TypeScript strict, Prisma + Postgres (Supabase), Zod, vitest + @testing-library/react.

**Design spec:** `docs/superpowers/specs/2026-06-03-feedback-redesign-design.md`

**Isolation note:** This plan MUST be executed in a git worktree off `origin/main` (the main checkout carries an unrelated parallel-agent "secondary-goal removal" WIP). Commit only the feedback files listed per task. Final integration is a PR → squash-merge → Vercel prod deploy, same as PRs #117/#118.

---

## Reference: new vocabulary (use these EXACT identifiers everywhere)

Enums (Prisma + TS):
- `FeedbackKind = CONFUSED | PROBLEM | IDEA | PRAISE`
- `FeedbackArea = JOURNEY | CAREER_RADAR | EXPLORE_CAREERS | LIBRARY | CAREER_TWIN | OTHER`
- `FeedbackRole = TEEN_16_20 | PARENT_GUARDIAN | ADULT_OTHER` (unchanged; `TEEN_16_20` re-labelled "Teen (15–23)" in UI only)

Label maps (in `feedback-stats.ts`):
- `KIND_LABEL`: CONFUSED→"Something confused me", PROBLEM→"Found a problem", IDEA→"I have an idea", PRAISE→"Something I liked"
- `AREA_LABEL`: JOURNEY→"My Journey", CAREER_RADAR→"Career Radar", EXPLORE_CAREERS→"Explore Careers", LIBRARY→"My Library", CAREER_TWIN→"Career Twin", OTHER→"Something else"
- `ROLE_LABEL`: TEEN_16_20→"Teen (15–23)", PARENT_GUARDIAN→"Parent / Guardian", ADULT_OTHER→"Adult (teacher / mentor / other)"

---

## Task 1: Schema + migration (additive, non-destructive)

**Files:**
- Modify: `prisma/schema.prisma` (Feedback model ~1817; FeedbackRole enum ~1805)
- Create: `prisma/migrations/20260603160000_feedback_typed/migration.sql`

- [ ] **Step 1: Add the two new enums above the Feedback model**

In `prisma/schema.prisma`, immediately before `enum FeedbackRole {`, add:

```prisma
enum FeedbackKind {
  CONFUSED
  PROBLEM
  IDEA
  PRAISE
}

enum FeedbackArea {
  JOURNEY
  CAREER_RADAR
  EXPLORE_CAREERS
  LIBRARY
  CAREER_TWIN
  OTHER
}
```

- [ ] **Step 2: Edit the Feedback model — add new fields, relax legacy ones**

Replace the `role` line and the Likert block. The model fields become:

```prisma
model Feedback {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())

  // Optional link to user (null if submitted anonymously)
  createdByUserId String?
  createdByUser   User?   @relation(fields: [createdByUserId], references: [id], onDelete: SetNull)

  // Typed feedback (current model)
  kind    FeedbackKind?
  area    FeedbackArea?
  message String?       @db.VarChar(1000)

  // Who is giving feedback (optional)
  role FeedbackRole?

  // Legacy Likert pilot fields (no longer collected; kept for old rows)
  q1 Int?
  q2 Int?
  q3 Int?
  q4 Int?
  q5 Int?

  // Legacy free-text + clarity topics (kept for old rows)
  confusingText String?  @db.VarChar(500)
  clarityTopics String[]

  // Optional metadata
  source     String? @db.VarChar(50)
  userAgent  String? @db.VarChar(200)
  appVersion String? @db.VarChar(20)

  @@index([createdAt])
  @@index([role])
  @@index([kind])
  @@index([area])
}
```

(Only `kind`/`area`/`message` are new; `role` and `q1`–`q5` gained a `?`; the two new `@@index` lines were added. Everything else is unchanged.)

- [ ] **Step 3: Hand-author the migration SQL** (additive only — no `prisma migrate dev`, which needs a shadow DB)

Create `prisma/migrations/20260603160000_feedback_typed/migration.sql`:

```sql
-- CreateEnum
CREATE TYPE "FeedbackKind" AS ENUM ('CONFUSED', 'PROBLEM', 'IDEA', 'PRAISE');

-- CreateEnum
CREATE TYPE "FeedbackArea" AS ENUM ('JOURNEY', 'CAREER_RADAR', 'EXPLORE_CAREERS', 'LIBRARY', 'CAREER_TWIN', 'OTHER');

-- AlterTable: add new typed-feedback columns, relax legacy NOT NULLs
ALTER TABLE "Feedback"
  ADD COLUMN "kind" "FeedbackKind",
  ADD COLUMN "area" "FeedbackArea",
  ADD COLUMN "message" VARCHAR(1000),
  ALTER COLUMN "role" DROP NOT NULL,
  ALTER COLUMN "q1" DROP NOT NULL,
  ALTER COLUMN "q2" DROP NOT NULL,
  ALTER COLUMN "q3" DROP NOT NULL,
  ALTER COLUMN "q4" DROP NOT NULL,
  ALTER COLUMN "q5" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_kind_idx" ON "Feedback"("kind");

-- CreateIndex
CREATE INDEX "Feedback_area_idx" ON "Feedback"("area");
```

- [ ] **Step 4: Confirm the migration is non-destructive**

Run: `grep -iE "DROP TABLE|DROP COLUMN|DROP TYPE" prisma/migrations/20260603160000_feedback_typed/migration.sql`
Expected: no output (only `DROP NOT NULL`, which is safe).

- [ ] **Step 5: Regenerate the Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client" with no errors. (Does not touch the DB.)

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260603160000_feedback_typed/
git commit -m "feat(feedback): additive schema for typed feedback (kind/area/message)"
```

---

## Task 2: Re-implement `feedback-stats.ts` (TDD)

**Files:**
- Modify: `src/lib/feedback-stats.ts` (full rewrite)
- Test: `src/lib/__tests__/feedback-stats.test.ts` (full rewrite)

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `src/lib/__tests__/feedback-stats.test.ts` with:

```ts
import { describe, it, expect } from "vitest";
import type { Feedback } from "@prisma/client";
import {
  aggregateFeedback,
  csvCell,
  feedbackToCsv,
  KIND_LABEL,
  AREA_LABEL,
  ROLE_LABEL,
} from "../feedback-stats";

function row(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: "r1",
    createdAt: new Date("2026-04-10T12:00:00Z"),
    createdByUserId: null,
    kind: "CONFUSED",
    area: "JOURNEY",
    message: null,
    role: "TEEN_16_20",
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    confusingText: null,
    clarityTopics: [],
    source: null,
    userAgent: null,
    appVersion: null,
    ...overrides,
  } as Feedback;
}

describe("label maps", () => {
  it("cover every enum value with no stale concepts", () => {
    expect(KIND_LABEL.PRAISE).toBe("Something I liked");
    expect(AREA_LABEL.CAREER_TWIN).toBe("Career Twin");
    expect(ROLE_LABEL.TEEN_16_20).toBe("Teen (15–23)");
    const all = JSON.stringify({ KIND_LABEL, AREA_LABEL, ROLE_LABEL });
    expect(all).not.toMatch(/secondary|small job/i);
  });
});

describe("aggregateFeedback", () => {
  it("counts new-model rows by kind, area and role, and isolates legacy rows", () => {
    const rows: Feedback[] = [
      row({ id: "1", kind: "CONFUSED", area: "JOURNEY", role: "TEEN_16_20", message: "lost on step 2" }),
      row({ id: "2", kind: "IDEA", area: "CAREER_RADAR", role: "PARENT_GUARDIAN", message: "add a filter" }),
      row({ id: "3", kind: "CONFUSED", area: null, role: null, message: "  " }),
      // legacy Likert row — no kind
      row({ id: "4", kind: null, area: null, role: "PARENT_GUARDIAN", q1: 4, message: null }),
    ];
    const agg = aggregateFeedback(rows);

    expect(agg.total).toBe(3);          // rows with a kind
    expect(agg.legacyCount).toBe(1);    // rows without a kind
    expect(agg.byKind.CONFUSED).toBe(2);
    expect(agg.byKind.IDEA).toBe(1);
    expect(agg.byKind.PROBLEM).toBe(0);
    expect(agg.byArea.JOURNEY).toBe(1);
    expect(agg.byArea.CAREER_RADAR).toBe(1);
    expect(agg.byRole.TEEN_16_20).toBe(1);
    expect(agg.byRole.PARENT_GUARDIAN).toBe(1); // legacy row's role is NOT counted

    // messages: new-model rows with non-empty message, newest first
    expect(agg.messages.map((m) => m.id)).toEqual(["1", "2"]);
    expect(agg.messages[0].kind).toBe("CONFUSED");
  });
});

describe("csvCell", () => {
  it("wraps strings with commas, quotes or newlines", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('he said "hi"')).toBe('"he said ""hi"""');
    expect(csvCell(null)).toBe("");
    expect(csvCell(new Date("2026-04-10T12:00:00Z"))).toBe("2026-04-10T12:00:00.000Z");
  });
});

describe("feedbackToCsv", () => {
  it("has the new typed columns and one line per row", () => {
    const rows = [row({ id: "a", kind: "PROBLEM", area: "LIBRARY", message: "bug, here" })];
    const csv = feedbackToCsv(rows);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "id,createdAt,kind,area,role,message,legacyText,source,userAgent,appVersion,createdByUserId",
    );
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("PROBLEM");
    expect(lines[1]).toContain('"bug, here"');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/feedback-stats.test.ts`
Expected: FAIL — `KIND_LABEL`/`AREA_LABEL` not exported, `aggregateFeedback` returns the old shape.

- [ ] **Step 3: Rewrite `src/lib/feedback-stats.ts`**

Replace the entire file with:

```ts
/**
 * Pure aggregation helpers for the typed-feedback admin dashboard.
 * Kept out of the page component so it can be unit-tested and reused by
 * the CSV export route.
 */

import type { FeedbackRole, FeedbackKind, FeedbackArea, Feedback } from "@prisma/client";

export const KIND_LABEL: Record<FeedbackKind, string> = {
  CONFUSED: "Something confused me",
  PROBLEM: "Found a problem",
  IDEA: "I have an idea",
  PRAISE: "Something I liked",
};

export const AREA_LABEL: Record<FeedbackArea, string> = {
  JOURNEY: "My Journey",
  CAREER_RADAR: "Career Radar",
  EXPLORE_CAREERS: "Explore Careers",
  LIBRARY: "My Library",
  CAREER_TWIN: "Career Twin",
  OTHER: "Something else",
};

export const ROLE_LABEL: Record<FeedbackRole, string> = {
  TEEN_16_20: "Teen (15–23)",
  PARENT_GUARDIAN: "Parent / Guardian",
  ADULT_OTHER: "Adult (teacher / mentor / other)",
};

export const KIND_VALUES: FeedbackKind[] = ["CONFUSED", "PROBLEM", "IDEA", "PRAISE"];
export const AREA_VALUES: FeedbackArea[] = [
  "JOURNEY",
  "CAREER_RADAR",
  "EXPLORE_CAREERS",
  "LIBRARY",
  "CAREER_TWIN",
  "OTHER",
];
export const ROLE_VALUES: FeedbackRole[] = ["TEEN_16_20", "PARENT_GUARDIAN", "ADULT_OTHER"];

export interface FeedbackMessage {
  id: string;
  createdAt: Date;
  kind: FeedbackKind;
  area: FeedbackArea | null;
  role: FeedbackRole | null;
  text: string;
}

export interface FeedbackAggregate {
  /** Count of new-model rows (those with a `kind`). */
  total: number;
  /** Count of legacy Likert rows (no `kind`). */
  legacyCount: number;
  byKind: Record<FeedbackKind, number>;
  byArea: Record<FeedbackArea, number>;
  byRole: Record<FeedbackRole, number>;
  /** New-model rows with a non-empty message, newest first. */
  messages: FeedbackMessage[];
}

/**
 * Roll a set of feedback rows up into everything the admin page needs.
 * Pre-filter rows by kind/area/date at the call site; this just rolls up
 * whatever it receives. Legacy Likert rows (no `kind`) are counted only
 * in `legacyCount` and excluded from every other breakdown.
 */
export function aggregateFeedback(rows: Feedback[]): FeedbackAggregate {
  const byKind: Record<FeedbackKind, number> = { CONFUSED: 0, PROBLEM: 0, IDEA: 0, PRAISE: 0 };
  const byArea: Record<FeedbackArea, number> = {
    JOURNEY: 0,
    CAREER_RADAR: 0,
    EXPLORE_CAREERS: 0,
    LIBRARY: 0,
    CAREER_TWIN: 0,
    OTHER: 0,
  };
  const byRole: Record<FeedbackRole, number> = {
    TEEN_16_20: 0,
    PARENT_GUARDIAN: 0,
    ADULT_OTHER: 0,
  };

  let total = 0;
  let legacyCount = 0;
  const messages: FeedbackMessage[] = [];

  for (const r of rows) {
    if (!r.kind) {
      legacyCount += 1;
      continue;
    }
    total += 1;
    byKind[r.kind] += 1;
    if (r.area) byArea[r.area] += 1;
    if (r.role) byRole[r.role] += 1;
    if (r.message && r.message.trim().length > 0) {
      messages.push({
        id: r.id,
        createdAt: r.createdAt,
        kind: r.kind,
        area: r.area ?? null,
        role: r.role ?? null,
        text: r.message,
      });
    }
  }

  messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { total, legacyCount, byKind, byArea, byRole, messages };
}

/** CSV-encode a single value — wraps in quotes and escapes internal quotes. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Format a full CSV from raw feedback rows. One row per submission. */
export function feedbackToCsv(rows: Feedback[]): string {
  const header = [
    "id",
    "createdAt",
    "kind",
    "area",
    "role",
    "message",
    "legacyText",
    "source",
    "userAgent",
    "appVersion",
    "createdByUserId",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.createdAt,
        r.kind ?? "",
        r.area ?? "",
        r.role ?? "",
        r.message ?? "",
        r.confusingText ?? "", // legacy free text, preserved on export
        r.source ?? "",
        r.userAgent ?? "",
        r.appVersion ?? "",
        r.createdByUserId ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\n");
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/feedback-stats.test.ts`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/feedback-stats.ts src/lib/__tests__/feedback-stats.test.ts
git commit -m "feat(feedback): re-implement stats around typed feedback model"
```

---

## Task 3: New `feedback-validation` module (TDD)

Extract the API contract (Zod schema + contact-info detection + sanitisation) into a testable module.

**Files:**
- Create: `src/lib/feedback-validation.ts`
- Test: `src/lib/__tests__/feedback-validation.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/feedback-validation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  feedbackSchema,
  containsContactInfo,
  sanitizeMessage,
} from "../feedback-validation";

describe("feedbackSchema", () => {
  it("accepts a minimal valid payload (kind + message only)", () => {
    const parsed = feedbackSchema.parse({ kind: "IDEA", message: "add dark mode toggle" });
    expect(parsed.kind).toBe("IDEA");
    expect(parsed.area).toBeUndefined();
  });

  it("accepts a full payload", () => {
    const parsed = feedbackSchema.parse({
      kind: "CONFUSED",
      area: "JOURNEY",
      message: "lost on the understand tab",
      role: "TEEN_16_20",
      source: "profile",
    });
    expect(parsed.area).toBe("JOURNEY");
    expect(parsed.role).toBe("TEEN_16_20");
  });

  it("rejects a missing kind", () => {
    expect(() => feedbackSchema.parse({ message: "hi" })).toThrow();
  });

  it("rejects an empty message", () => {
    expect(() => feedbackSchema.parse({ kind: "PRAISE", message: "" })).toThrow();
  });

  it("rejects an unknown area", () => {
    expect(() => feedbackSchema.parse({ kind: "IDEA", message: "x", area: "JOBS" })).toThrow();
  });
});

describe("containsContactInfo", () => {
  it("flags emails, phones and contact phrases", () => {
    expect(containsContactInfo("reach me at a@b.com")).toBe(true);
    expect(containsContactInfo("call 0049 1234 5678")).toBe(true);
    expect(containsContactInfo("email me please")).toBe(true);
  });
  it("passes ordinary feedback", () => {
    expect(containsContactInfo("the radar was confusing at first")).toBe(false);
  });
});

describe("sanitizeMessage", () => {
  it("trims, collapses whitespace and caps at 1000 chars", () => {
    expect(sanitizeMessage("  a   b  ")).toBe("a b");
    expect(sanitizeMessage("x".repeat(1200)).length).toBe(1000);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/feedback-validation.test.ts`
Expected: FAIL — module `../feedback-validation` not found.

- [ ] **Step 3: Create `src/lib/feedback-validation.ts`**

```ts
import { z } from "zod";

/** Zod contract for the POST /api/feedback body (typed feedback model). */
export const feedbackSchema = z.object({
  kind: z.enum(["CONFUSED", "PROBLEM", "IDEA", "PRAISE"]),
  area: z
    .enum(["JOURNEY", "CAREER_RADAR", "EXPLORE_CAREERS", "LIBRARY", "CAREER_TWIN", "OTHER"])
    .optional()
    .nullable(),
  message: z.string().min(1).max(1000),
  role: z.enum(["TEEN_16_20", "PARENT_GUARDIAN", "ADULT_OTHER"]).optional().nullable(),
  source: z.string().max(50).optional().nullable(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

/** Detect likely personal contact info we don't want users to share. */
export function containsContactInfo(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();

  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailPattern.test(text)) return true;

  const phonePatterns = [
    /\b\d{8,}\b/,
    /\b\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}\b/,
    /\+\d{1,3}[-.\s]?\d/,
  ];
  for (const pattern of phonePatterns) {
    if (pattern.test(text)) return true;
  }

  const contactPhrases = [
    "email me",
    "call me",
    "text me",
    "reach me",
    "contact me",
    "my number",
    "my email",
    "my phone",
  ];
  for (const phrase of contactPhrases) {
    if (lower.includes(phrase)) return true;
  }

  return false;
}

/** Trim, collapse whitespace and cap the message at 1000 chars. */
export function sanitizeMessage(text: string): string {
  return text.trim().replace(/\s+/g, " ").slice(0, 1000);
}

/** Truncate the user-agent header for storage. */
export function truncateUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;
  return ua.slice(0, 200);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/feedback-validation.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/feedback-validation.ts src/lib/__tests__/feedback-validation.test.ts
git commit -m "feat(feedback): extract testable validation module"
```

---

## Task 4: Rewrite the API route

**Files:**
- Modify: `src/app/api/feedback/route.ts` (full rewrite)

- [ ] **Step 1: Replace the route file**

Replace the entire contents of `src/app/api/feedback/route.ts` with:

```ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  feedbackSchema,
  containsContactInfo,
  sanitizeMessage,
  truncateUserAgent,
} from "@/lib/feedback-validation";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const data = feedbackSchema.parse(body);

    const message = sanitizeMessage(data.message);
    if (containsContactInfo(message)) {
      return NextResponse.json(
        {
          error: "Please don't include contact details. Share only general feedback.",
          field: "message",
        },
        { status: 400 },
      );
    }

    const userAgent = truncateUserAgent(request.headers.get("user-agent"));

    await prisma.feedback.create({
      data: {
        createdByUserId: session?.user?.id || null,
        kind: data.kind,
        area: data.area || null,
        message,
        role: data.role || null,
        source: data.source || null,
        userAgent,
        appVersion: process.env.npm_package_version || null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Thank you for your feedback!" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid feedback data", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Error submitting feedback:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Feedback API. Use POST to submit feedback.",
  });
}
```

- [ ] **Step 2: Typecheck the route**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "api/feedback/route" ; echo done`
Expected: only `done` printed (no errors for this file).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/feedback/route.ts
git commit -m "feat(feedback): rewrite API around typed feedback payload"
```

---

## Task 5: Rewrite the user feedback form (+ render test)

**Files:**
- Modify: `src/app/(dashboard)/feedback/page.tsx` (full rewrite)
- Test: `src/app/(dashboard)/feedback/__tests__/feedback-page.test.tsx` (new)

- [ ] **Step 1: Write the failing render test**

Create `src/app/(dashboard)/feedback/__tests__/feedback-page.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FeedbackPage from "../page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("FeedbackPage", () => {
  it("renders the four feedback kinds and no stale concepts", () => {
    render(<FeedbackPage />);
    expect(screen.getByText("Something confused me")).toBeInTheDocument();
    expect(screen.getByText("Found a problem")).toBeInTheDocument();
    expect(screen.getByText("I have an idea")).toBeInTheDocument();
    expect(screen.getByText("Something I liked")).toBeInTheDocument();
    expect(screen.queryByText(/small job/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/secondary goal/i)).not.toBeInTheDocument();
  });

  it("keeps submit disabled until a kind and a message are provided", () => {
    render(<FeedbackPage />);
    const submit = screen.getByRole("button", { name: /send feedback/i });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByText("I have an idea"));
    expect(submit).toBeDisabled(); // still no message

    fireEvent.change(screen.getByPlaceholderText(/tell us/i), {
      target: { value: "add a dark-mode toggle" },
    });
    expect(submit).not.toBeDisabled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run "src/app/(dashboard)/feedback/__tests__/feedback-page.test.tsx"`
Expected: FAIL — the page still renders the old Likert form.

- [ ] **Step 3: Rewrite the page**

Replace the entire contents of `src/app/(dashboard)/feedback/page.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Bug,
  Lightbulb,
  Heart,
} from "lucide-react";

type Kind = "CONFUSED" | "PROBLEM" | "IDEA" | "PRAISE";
type Area = "JOURNEY" | "CAREER_RADAR" | "EXPLORE_CAREERS" | "LIBRARY" | "CAREER_TWIN" | "OTHER";
type Role = "TEEN_16_20" | "PARENT_GUARDIAN" | "ADULT_OTHER";

const KIND_OPTIONS: { value: Kind; label: string; icon: typeof HelpCircle; placeholder: string }[] = [
  { value: "CONFUSED", label: "Something confused me", icon: HelpCircle, placeholder: "What were you trying to do, and where did it get unclear?" },
  { value: "PROBLEM", label: "Found a problem", icon: Bug, placeholder: "What happened? What did you expect instead?" },
  { value: "IDEA", label: "I have an idea", icon: Lightbulb, placeholder: "Tell us what you'd love to see." },
  { value: "PRAISE", label: "Something I liked", icon: Heart, placeholder: "What worked well for you?" },
];

const AREA_OPTIONS: { value: Area; label: string }[] = [
  { value: "JOURNEY", label: "My Journey" },
  { value: "CAREER_RADAR", label: "Career Radar" },
  { value: "EXPLORE_CAREERS", label: "Explore Careers" },
  { value: "LIBRARY", label: "My Library" },
  { value: "CAREER_TWIN", label: "Career Twin" },
  { value: "OTHER", label: "Something else" },
];

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "TEEN_16_20", label: "Teen (15–23)" },
  { value: "PARENT_GUARDIAN", label: "Parent / Guardian" },
  { value: "ADULT_OTHER", label: "Adult (teacher / mentor / other)" },
];

const MAX = 1000;

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || undefined;

  const [kind, setKind] = useState<Kind | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = kind !== null && message.trim().length > 0;
  const placeholder =
    KIND_OPTIONS.find((k) => k.value === kind)?.placeholder ?? "Tell us what's on your mind.";

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, area, message: message.trim(), role, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit feedback");
        return;
      }
      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="rounded-card border border-border bg-card text-center px-6 pt-12 pb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Thank you</h1>
          <p className="text-muted-foreground">
            This genuinely helps us make Endeavrly clearer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-control bg-primary">
            <MessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Share feedback</h1>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
            Beta
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Tell us what's working and what isn't. It takes less than a minute and helps us improve Endeavrly.
        </p>
      </div>

      <div className="space-y-6">
        {/* Kind (required) */}
        <section>
          <h2 className="text-sm font-semibold mb-3">What kind of feedback is this?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {KIND_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = kind === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setKind(opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-2.5 rounded-control border px-3.5 py-3 text-left text-sm transition-colors",
                    active
                      ? "border-primary bg-primary/[0.06] text-foreground"
                      : "border-border bg-card/40 text-foreground/80 hover:border-border hover:bg-muted/40",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground/60")} />
                  <span className="font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Area (optional) */}
        <section>
          <h2 className="text-sm font-semibold mb-1">
            Which part is it about?
            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {AREA_OPTIONS.map((opt) => {
              const active = area === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setArea(active ? null : opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/40 bg-primary/[0.08] text-primary"
                      : "border-border text-muted-foreground/80 hover:text-foreground hover:border-border",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Message (required) */}
        <section>
          <h2 className="text-sm font-semibold mb-2">Your feedback</h2>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            maxLength={MAX}
            rows={5}
            className="resize-none"
          />
          <div className="flex justify-between mt-2">
            <p className="text-[11px] text-muted-foreground">
              Please avoid sharing personal contact details.
            </p>
            <span className="text-[11px] text-muted-foreground">
              {message.length}/{MAX}
            </span>
          </div>
        </section>

        {/* Role (optional) */}
        <section>
          <h2 className="text-sm font-semibold mb-1">
            You are…
            <span className="text-muted-foreground font-normal ml-2">(optional)</span>
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {ROLE_OPTIONS.map((opt) => {
              const active = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(active ? null : opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/40 bg-primary/[0.08] text-primary"
                      : "border-border text-muted-foreground/80 hover:text-foreground hover:border-border",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {error && (
          <div className="rounded-control border border-destructive/30 bg-destructive/[0.06] p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Sending…
            </>
          ) : (
            "Send feedback"
          )}
        </Button>
        <p className="sr-only" aria-hidden="true">
          <Label>feedback form</Label>
        </p>
      </div>
    </div>
  );
}
```

(The `Label` import is retained only if used; if the linter flags it as unused, remove both the `sr-only` block and the `Label` import.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run "src/app/(dashboard)/feedback/__tests__/feedback-page.test.tsx"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/feedback/page.tsx" "src/app/(dashboard)/feedback/__tests__/feedback-page.test.tsx"
git commit -m "feat(feedback): typed feedback form (kind/area/message)"
```

---

## Task 6: Re-implement the admin page + delete the recharts report

**Files:**
- Modify: `src/app/(dashboard)/admin/feedback/page.tsx` (full rewrite)
- Delete: `src/components/admin/feedback-report.tsx`

- [ ] **Step 1: Delete the Likert recharts report component**

Run: `git rm src/components/admin/feedback-report.tsx`
Expected: file staged for deletion.

- [ ] **Step 2: Rewrite the admin page**

Replace the entire contents of `src/app/(dashboard)/admin/feedback/page.tsx` with:

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Download, MessageSquare } from "lucide-react";
import {
  aggregateFeedback,
  KIND_LABEL,
  AREA_LABEL,
  ROLE_LABEL,
  KIND_VALUES,
  AREA_VALUES,
  ROLE_VALUES,
} from "@/lib/feedback-stats";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const rows = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });
  const agg = aggregateFeedback(rows);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Typed feedback from <code className="text-xs">/feedback</code>.
            {agg.legacyCount > 0 && (
              <> {agg.total} new · {agg.legacyCount} legacy (old pilot survey) responses.</>
            )}
          </p>
        </div>
        <a
          href="/api/admin/feedback/export"
          className="inline-flex items-center gap-2 rounded-control border border-border bg-card/50 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {/* Headline counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {KIND_VALUES.map((k) => (
          <Counter key={k} label={KIND_LABEL[k]} value={agg.byKind[k]} />
        ))}
      </div>

      {agg.total === 0 ? (
        <div className="rounded-card border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No typed feedback yet.
        </div>
      ) : (
        <>
          {/* By area + by role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <BarPanel
              title="By area"
              data={AREA_VALUES.map((a) => ({ label: AREA_LABEL[a], count: agg.byArea[a] }))}
            />
            <BarPanel
              title="Who's giving feedback"
              data={ROLE_VALUES.map((r) => ({ label: ROLE_LABEL[r], count: agg.byRole[r] }))}
            />
          </div>

          {/* Message feed */}
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Responses ({agg.messages.length})
          </h2>
          <div className="space-y-2">
            {agg.messages.map((m) => (
              <div key={m.id} className="rounded-control border border-border/60 p-3 bg-card/30">
                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-1.5">
                  <span className="inline-flex items-center gap-2">
                    <span className="font-semibold text-foreground/80">{KIND_LABEL[m.kind]}</span>
                    {m.area && <span className="rounded-full bg-muted px-2 py-0.5">{AREA_LABEL[m.area]}</span>}
                    {m.role && <span>{ROLE_LABEL[m.role]}</span>}
                  </span>
                  <time dateTime={m.createdAt.toISOString()}>
                    {m.createdAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{m.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-border/60 bg-card/50 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
    </div>
  );
}

function BarPanel({ title, data }: { title: string; data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-card border border-border/60 bg-card/50 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div>
              <div className="text-sm mb-1">{d.label}</div>
              <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full bg-primary/60"
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-xs font-mono text-muted-foreground shrink-0">{d.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck the admin surface**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "admin/feedback|feedback-report" ; echo done`
Expected: only `done` (no references to the deleted component remain).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/admin/feedback/page.tsx"
git commit -m "feat(feedback): re-implement admin view for typed feedback; drop Likert report"
```

---

## Task 7: Rewrite the pilot seed script

**Files:**
- Modify: `scripts/seed-pilot-feedback.ts` (full rewrite)

- [ ] **Step 1: Replace the seed script**

Replace the entire contents of `scripts/seed-pilot-feedback.ts` with:

```ts
/**
 * scripts/seed-pilot-feedback.ts
 *
 * Generate ~40 simulated typed-feedback rows so /admin/feedback has
 * realistic data to demonstrate. Every row is tagged source = "PILOT_SIM"
 * so it's trivial to delete:
 *
 *   npx tsx scripts/seed-pilot-feedback.ts --reset
 *
 * Run:
 *   npx tsx scripts/seed-pilot-feedback.ts
 */

import { PrismaClient, type FeedbackKind, type FeedbackArea, type FeedbackRole } from "@prisma/client";

const prisma = new PrismaClient();

const N_ROWS = 40;
const SOURCE_TAG = "PILOT_SIM";

const KINDS: FeedbackKind[] = ["CONFUSED", "PROBLEM", "IDEA", "PRAISE"];
const AREAS: (FeedbackArea | null)[] = [
  "JOURNEY",
  "CAREER_RADAR",
  "EXPLORE_CAREERS",
  "LIBRARY",
  "CAREER_TWIN",
  "OTHER",
  null,
];
const ROLES: (FeedbackRole | null)[] = ["TEEN_16_20", "PARENT_GUARDIAN", "ADULT_OTHER", null];

const MESSAGES: Record<FeedbackKind, string[]> = {
  CONFUSED: [
    "I wasn't sure what to do after choosing my main goal.",
    "The Understand tab had a lot on it — I didn't know where to look first.",
    "It took me a while to realise I could tap a dot on the radar.",
  ],
  PROBLEM: [
    "A video on the Discover tab wouldn't play on my phone.",
    "The Study Path table looked cramped on a small screen.",
    "My saved careers didn't show up straight away.",
  ],
  IDEA: [
    "It'd be great to compare two careers side by side more easily.",
    "Could the Career Twin remember what we talked about last time?",
    "A short intro the first time you open My Journey would help.",
  ],
  PRAISE: [
    "The Career Radar is brilliant — really easy to read.",
    "Calm and clear, no clutter. Loved it.",
    "The roadmap in Clarity finally made the next steps feel doable.",
  ],
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function recentTimestamp(daysBack: number): Date {
  const now = Date.now();
  const offsetMs = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - offsetMs);
}

async function main() {
  if (process.argv.includes("--reset")) {
    const removed = await prisma.feedback.deleteMany({ where: { source: SOURCE_TAG } });
    console.log(`Removed ${removed.count} previous PILOT_SIM rows.`);
  }

  const rows = Array.from({ length: N_ROWS }, () => {
    const kind = pick(KINDS);
    return {
      kind,
      area: pick(AREAS),
      role: pick(ROLES),
      message: pick(MESSAGES[kind]),
      source: SOURCE_TAG,
      userAgent: "Pilot simulation",
      appVersion: "1.0.0-pilot",
      createdAt: recentTimestamp(14),
    };
  });

  await prisma.feedback.createMany({ data: rows });
  console.log(`Inserted ${rows.length} simulated typed-feedback rows (source="${SOURCE_TAG}").`);
  console.log(`To remove: npx tsx scripts/seed-pilot-feedback.ts --reset`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Typecheck the seed script**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "seed-pilot-feedback" ; echo done`
Expected: only `done`. (Do NOT run the script — it writes to the DB; running is a manual, post-deploy choice.)

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-pilot-feedback.ts
git commit -m "chore(feedback): seed script generates typed feedback"
```

---

## Task 8: Full verification + PR

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -vE "__tests__/research-evidence" | grep -E "\\.tsx?\\(" ; echo done`
Expected: only `done` (the pre-existing `research-evidence` jest-type noise is filtered; nothing else).

- [ ] **Step 2: Run the full feedback test suite**

Run: `npx vitest run src/lib/__tests__/feedback-stats.test.ts src/lib/__tests__/feedback-validation.test.ts "src/app/(dashboard)/feedback/__tests__/feedback-page.test.tsx"`
Expected: all PASS.

- [ ] **Step 3: Grep for any remaining stale references in the feedback surface**

Run: `grep -rniE "small_jobs|small jobs|secondary goal|primary_vs_secondary|PRIMARY_VS_SECONDARY|clarityTopics|likert" src/app/api/feedback src/app/\(dashboard\)/feedback src/app/\(dashboard\)/admin/feedback src/lib/feedback-stats.ts src/lib/feedback-validation.ts scripts/seed-pilot-feedback.ts ; echo done`
Expected: only `done`. (No stale tokens. `clarityTopics`/`q1–q5` survive only in the Prisma schema for legacy rows — that's intentional and not matched here.)

- [ ] **Step 4: Manual smoke (local dev server)**

Run: `npm run dev`, then:
- Visit `/feedback`: pick each kind (placeholder changes), pick/clear an area chip, type a message, submit → thank-you screen. Submit stays disabled until kind + message.
- Visit `/admin/feedback` as an admin: counters by kind, the area/role bars, and the message feed render; CSV export downloads with the new header row.

- [ ] **Step 5: Open the PR**

```bash
git push -u origin feat/feedback-redesign
gh pr create --base main --title "feat(feedback): typed feedback redesign" \
  --body "Replaces the stale Likert pilot survey with typed feedback (kind/area/message). Removes all small-jobs / secondary-goal references. Additive non-destructive migration; re-implemented admin view + stats + seed. Spec: docs/superpowers/specs/2026-06-03-feedback-redesign-design.md"
```

- [ ] **Step 6: Migration note for deploy**

The migration `20260603160000_feedback_typed` is additive (new columns/enums + relaxing NOT NULL). Confirm the platform's build step applies migrations to prod, and that the generated SQL contains no `DROP TABLE/COLUMN/TYPE` (verified in Task 1 Step 4). Legacy pilot rows remain intact and surface only as the "legacy" count in admin.

---

## Self-Review

**Spec coverage:**
- Data model (§1 spec) → Task 1. ✓ (enums, new columns, relaxed NOT NULL, indexes, `TEEN_16_20` retained)
- User form (§2) → Task 5. ✓ (kind required, area optional, message required ≤1000 with adaptive placeholder, optional role, thank-you, anonymous + `?source=`)
- API (§3) → Tasks 3 + 4. ✓ (kind required, area/role optional, message required, contact-info reject, sanitise)
- Stats + Admin (§4) → Tasks 2 + 6. ✓ (counts by kind/area/role, message feed, legacy count, CSV; recharts report deleted)
- Tests + seed (§5) → Tasks 2, 3, 5, 7. ✓
- Export route "no change" (spec addendum) → confirmed in Task 8; `feedbackToCsv` updated in Task 2. ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code; every run step has an expected result.

**Type consistency:** `FeedbackKind`/`FeedbackArea`/`FeedbackRole` values, `KIND_LABEL`/`AREA_LABEL`/`ROLE_LABEL`, `KIND_VALUES`/`AREA_VALUES`/`ROLE_VALUES`, `FeedbackAggregate` (`total`/`legacyCount`/`byKind`/`byArea`/`byRole`/`messages`), `feedbackSchema`, `sanitizeMessage`, `containsContactInfo`, `truncateUserAgent` are defined in Tasks 2–3 and used consistently in Tasks 4–7.
