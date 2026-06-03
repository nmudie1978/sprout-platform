# Career Real Voices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the existing moderated real-human content (`CareerStory` + `CareerPathContribution`) on the career detail sheet, with an empty-state-first design and an always-on "share your path" CTA.

**Architecture:** A pure tag-matcher + pure public-shape mappers (`src/lib/career-voices/`), a thin read-only API route (`/api/careers/[id]/voices`) that fetches published/approved rows and delegates to a pure `buildVoicesResponse`, and a client `<RealVoices>` component wired into `career-detail-sheet.tsx`. Plus a `?career=` pre-fill on `/contribute`. No DB migration — both models already exist.

**Tech Stack:** Next.js (App Router) + Prisma (`@/lib/prisma`), TypeScript strict, Vitest (jsdom), `@testing-library/react`.

---

## File Structure

- **Create** `src/lib/career-voices/match.ts` — `normalizeTag`, `careerTagVariants`, `matchesCareer` (pure).
- **Create** `src/lib/career-voices/public.ts` — public types + `toPublicStory`/`toPublicContribution` + `buildVoicesResponse` (pure; strips private fields, filters by match, sorts, caps).
- **Create** `src/lib/career-voices/__tests__/match.test.ts`
- **Create** `src/lib/career-voices/__tests__/public.test.ts`
- **Create** `src/app/api/careers/[id]/voices/route.ts` — thin Prisma glue.
- **Create** `src/components/career-voices/real-voices.tsx` — client component.
- **Create** `src/components/career-voices/__tests__/real-voices.test.tsx`
- **Modify** `src/components/career-detail-sheet.tsx` — render `<RealVoices career={career} />`.
- **Modify** `src/app/contribute/page.tsx` — pre-fill `careerTags` from `?career=`.
- **Create** `src/app/contribute/__tests__/career-param.test.ts` — pre-fill helper test.

---

### Task 1: Tag-matching helper

**Files:**
- Create: `src/lib/career-voices/match.ts`
- Test: `src/lib/career-voices/__tests__/match.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/career-voices/__tests__/match.test.ts
import { describe, it, expect } from "vitest";
import { normalizeTag, careerTagVariants, matchesCareer } from "../match";

describe("normalizeTag", () => {
  it("lowercases, hyphenates spaces, strips punctuation", () => {
    expect(normalizeTag("IT Project Manager")).toBe("it-project-manager");
    expect(normalizeTag("  Software   Developer ")).toBe("software-developer");
    expect(normalizeTag("Nurse (RN)")).toBe("nurse-rn");
    expect(normalizeTag("already-normalized")).toBe("already-normalized");
  });
});

describe("careerTagVariants", () => {
  it("includes the normalized id and title", () => {
    const v = careerTagVariants({ id: "software-developer", title: "Software Developer" });
    expect(v.has("software-developer")).toBe(true);
  });
});

describe("matchesCareer", () => {
  const career = { id: "software-developer", title: "Software Developer" };
  it("matches when a tag equals the id (any casing/spacing)", () => {
    expect(matchesCareer(["Software Developer"], career)).toBe(true);
    expect(matchesCareer(["software-developer"], career)).toBe(true);
  });
  it("matches when any of several tags matches", () => {
    expect(matchesCareer(["programme-manager", "software-developer"], career)).toBe(true);
  });
  it("does not match unrelated tags", () => {
    expect(matchesCareer(["nurse", "dentist"], career)).toBe(false);
  });
  it("is safe on empty tags", () => {
    expect(matchesCareer([], career)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/career-voices/__tests__/match.test.ts`
Expected: FAIL — cannot find module `../match`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/career-voices/match.ts
/** Normalise a free-text tag/title to the canonical tag form: lowercase,
 *  spaces→hyphens, punctuation stripped, hyphens collapsed. */
export function normalizeTag(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface CareerLike {
  id: string;
  title: string;
}

/** The set of normalized tag strings that identify a career. */
export function careerTagVariants(career: CareerLike): Set<string> {
  return new Set([normalizeTag(career.id), normalizeTag(career.title)]);
}

/** True if any of the item's careerTags identifies this career. */
export function matchesCareer(careerTags: string[], career: CareerLike): boolean {
  const variants = careerTagVariants(career);
  return careerTags.some((t) => variants.has(normalizeTag(t)));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/career-voices/__tests__/match.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/career-voices/match.ts src/lib/career-voices/__tests__/match.test.ts
git commit -m "feat(voices): tag-matching helper for career real-voices"
```

---

### Task 2: Public-shape mappers + buildVoicesResponse

**Files:**
- Create: `src/lib/career-voices/public.ts`
- Test: `src/lib/career-voices/__tests__/public.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/career-voices/__tests__/public.test.ts
import { describe, it, expect } from "vitest";
import {
  toPublicStory,
  toPublicContribution,
  buildVoicesResponse,
  type RawStory,
  type RawContribution,
} from "../public";

const career = { id: "software-developer", title: "Software Developer" };

const rawStory: RawStory = {
  id: "s1", videoUrl: "https://youtu.be/x", videoId: "x", duration: "3:45",
  name: "Nicky M.", jobTitle: "Programme Manager", company: "Telenor", location: "Oslo",
  yearsInRole: 15, careerTags: ["software-developer"], industry: "Tech",
  headline: "From junior dev to lead", takeaways: ["Started as a dev"],
  featured: true, published: true, uploadedBy: "admin-123", createdAt: new Date("2026-01-01"),
};

const rawContribution: RawContribution = {
  id: "c1", displayName: "Ada", currentTitle: "Senior Engineer", country: "Norway", city: "Bergen",
  howIGotHere: "...", whatIStudied: "...", firstSalary: "350k kr", hardestPart: "...",
  adviceToSeventeen: "...", realityOfJob: "...", careerTags: ["Software Developer"], videoUrl: null,
  status: "APPROVED", reviewedAt: new Date(), reviewedBy: "mod-1",
  submittedByEmail: "secret@example.com", createdAt: new Date("2026-02-01"),
};

describe("toPublicStory", () => {
  it("keeps display fields and drops private ones", () => {
    const p = toPublicStory(rawStory) as Record<string, unknown>;
    expect(p.name).toBe("Nicky M.");
    expect(p.headline).toBe("From junior dev to lead");
    expect(p.videoId).toBe("x");
    expect("uploadedBy" in p).toBe(false);
    expect("published" in p).toBe(false);
  });
});

describe("toPublicContribution", () => {
  it("keeps prose fields and drops private ones", () => {
    const p = toPublicContribution(rawContribution) as Record<string, unknown>;
    expect(p.displayName).toBe("Ada");
    expect(p.adviceToSeventeen).toBe("...");
    expect("submittedByEmail" in p).toBe(false);
    expect("reviewedBy" in p).toBe(false);
    expect("status" in p).toBe(false);
  });
});

describe("buildVoicesResponse", () => {
  it("includes matching content and excludes non-matching", () => {
    const other: RawStory = { ...rawStory, id: "s2", careerTags: ["nurse"] };
    const res = buildVoicesResponse(career, [rawStory, other], [rawContribution]);
    expect(res.stories).toHaveLength(1);
    expect(res.stories[0].id).toBe("s1");
    expect(res.contributions).toHaveLength(1);
    expect(res.contributions[0].displayName).toBe("Ada");
  });

  it("caps each list at 6", () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ ...rawStory, id: `s${i}` }));
    const res = buildVoicesResponse(career, many, []);
    expect(res.stories).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/career-voices/__tests__/public.test.ts`
Expected: FAIL — cannot find module `../public`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/career-voices/public.ts
import { matchesCareer, type CareerLike } from "./match";

const MAX_PER_LIST = 6;

// ── Raw rows (the subset of the Prisma models we read) ──────────────
export interface RawStory {
  id: string; videoUrl: string; videoId: string; duration: string | null;
  name: string; jobTitle: string; company: string | null; location: string | null;
  yearsInRole: number | null; careerTags: string[]; industry: string | null;
  headline: string; takeaways: string[]; featured: boolean; published: boolean;
  uploadedBy: string | null; createdAt: Date;
}
export interface RawContribution {
  id: string; displayName: string; currentTitle: string; country: string; city: string | null;
  howIGotHere: string; whatIStudied: string; firstSalary: string; hardestPart: string;
  adviceToSeventeen: string; realityOfJob: string; careerTags: string[]; videoUrl: string | null;
  status: string; reviewedAt: Date | null; reviewedBy: string | null;
  submittedByEmail: string | null; createdAt: Date;
}

// ── Public shapes (what the client receives — no private fields) ────
export interface PublicStory {
  id: string; videoUrl: string; videoId: string; duration: string | null;
  name: string; jobTitle: string; company: string | null; location: string | null;
  yearsInRole: number | null; industry: string | null; headline: string; takeaways: string[];
}
export interface PublicContribution {
  id: string; displayName: string; currentTitle: string; country: string; city: string | null;
  howIGotHere: string; whatIStudied: string; firstSalary: string; hardestPart: string;
  adviceToSeventeen: string; realityOfJob: string; videoUrl: string | null;
}

export interface VoicesResponse {
  stories: PublicStory[];
  contributions: PublicContribution[];
}

export function toPublicStory(s: RawStory): PublicStory {
  return {
    id: s.id, videoUrl: s.videoUrl, videoId: s.videoId, duration: s.duration,
    name: s.name, jobTitle: s.jobTitle, company: s.company, location: s.location,
    yearsInRole: s.yearsInRole, industry: s.industry, headline: s.headline, takeaways: s.takeaways,
  };
}

export function toPublicContribution(c: RawContribution): PublicContribution {
  return {
    id: c.id, displayName: c.displayName, currentTitle: c.currentTitle, country: c.country, city: c.city,
    howIGotHere: c.howIGotHere, whatIStudied: c.whatIStudied, firstSalary: c.firstSalary,
    hardestPart: c.hardestPart, adviceToSeventeen: c.adviceToSeventeen, realityOfJob: c.realityOfJob,
    videoUrl: c.videoUrl,
  };
}

/** Filter raw rows to those matching the career, newest/featured first, cap, and map to public shapes. */
export function buildVoicesResponse(
  career: CareerLike,
  stories: RawStory[],
  contributions: RawContribution[],
): VoicesResponse {
  const matchedStories = stories
    .filter((s) => matchesCareer(s.careerTags, career))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_PER_LIST)
    .map(toPublicStory);

  const matchedContributions = contributions
    .filter((c) => matchesCareer(c.careerTags, career))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_PER_LIST)
    .map(toPublicContribution);

  return { stories: matchedStories, contributions: matchedContributions };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/career-voices/__tests__/public.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/career-voices/public.ts src/lib/career-voices/__tests__/public.test.ts
git commit -m "feat(voices): public-shape mappers + buildVoicesResponse"
```

---

### Task 3: Voices API route

**Files:**
- Create: `src/app/api/careers/[id]/voices/route.ts`

This is thin glue over the tested pure logic; no new unit test (Tasks 1-2 cover the logic).

- [ ] **Step 1: Write the route**

```ts
// src/app/api/careers/[id]/voices/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCareerById } from "@/lib/career-pathways";
import { buildVoicesResponse } from "@/lib/career-voices/public";

/** GET /api/careers/[id]/voices — moderated real-human stories + contributions for a career. */
export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const career = getCareerById(id);
  if (!career) {
    return NextResponse.json({ stories: [], contributions: [] });
  }

  try {
    const [stories, contributions] = await Promise.all([
      prisma.careerStory.findMany({ where: { published: true } }),
      prisma.careerPathContribution.findMany({ where: { status: "APPROVED" } }),
    ]);
    const body = buildVoicesResponse(career, stories, contributions);
    return NextResponse.json(body, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (error) {
    console.error("[career-voices] error:", error);
    // Never 500 the detail sheet — degrade to empty.
    return NextResponse.json({ stories: [], contributions: [] }, { status: 200 });
  }
}

// ISR. Next requires a literal here.
export const revalidate = 300;
```

- [ ] **Step 2: Typecheck the route**

Run: `npx tsc --noEmit 2>&1 | grep "voices/route" || echo "route typechecks"`
Expected: `route typechecks` (no errors mentioning the new route). If Prisma complains that `status: "APPROVED"` is not assignable, import the generated enum and use it: `import { ContributionStatus } from "@prisma/client"` then `status: ContributionStatus.APPROVED` — verify the enum name first with `grep -n "enum.*Status" prisma/schema.prisma`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/careers/[id]/voices/route.ts"
git commit -m "feat(voices): GET /api/careers/[id]/voices read API"
```

---

### Task 4: RealVoices component

**Files:**
- Create: `src/components/career-voices/real-voices.tsx`
- Test: `src/components/career-voices/__tests__/real-voices.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/career-voices/__tests__/real-voices.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RealVoices } from "../real-voices";

const career = { id: "software-developer", title: "Software Developer" } as never;

afterEach(() => vi.unstubAllGlobals());

function mockVoices(body: unknown) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
}

describe("RealVoices", () => {
  it("shows the empty-state contribute CTA when there is no content", async () => {
    mockVoices({ stories: [], contributions: [] });
    render(<RealVoices career={career} />);
    await waitFor(() => expect(screen.getByText(/share/i)).toBeTruthy());
    const link = screen.getByRole("link", { name: /share/i }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toContain("/contribute?career=software-developer");
  });

  it("renders a story when content exists", async () => {
    mockVoices({
      stories: [{ id: "s1", videoUrl: "https://youtu.be/x", videoId: "x", duration: null,
        name: "Ada L.", jobTitle: "Engineer", company: null, location: "Oslo", yearsInRole: 5,
        industry: null, headline: "My path into engineering", takeaways: ["Started young"] }],
      contributions: [],
    });
    render(<RealVoices career={career} />);
    await waitFor(() => expect(screen.getByText("My path into engineering")).toBeTruthy());
    expect(screen.getByText(/Ada L\./)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/career-voices/__tests__/real-voices.test.tsx`
Expected: FAIL — cannot find module `../real-voices`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/career-voices/real-voices.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowRight, Quote } from "lucide-react";
import type { CareerLike } from "@/lib/career-voices/match";
import type { PublicStory, PublicContribution, VoicesResponse } from "@/lib/career-voices/public";

const EMPTY: VoicesResponse = { stories: [], contributions: [] };

export function RealVoices({ career }: { career: CareerLike }) {
  const [data, setData] = useState<VoicesResponse>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/careers/${career.id}/voices`)
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then((d: VoicesResponse) => active && (setData(d ?? EMPTY), setLoading(false)))
      .catch(() => active && (setData(EMPTY), setLoading(false)));
    return () => {
      active = false;
    };
  }, [career.id]);

  const total = data.stories.length + data.contributions.length;
  const contributeHref = `/contribute?career=${encodeURIComponent(career.id)}`;

  if (loading) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Users className="h-3 w-3 text-teal-500" />
        <span className="text-[10px] font-medium text-muted-foreground">Real voices</span>
      </div>

      {total === 0 ? (
        <Link
          href={contributeHref}
          className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-left hover:border-teal-500/40 transition-colors"
        >
          <span className="text-xs text-muted-foreground">
            No stories yet. Know someone in this field? Be the first to share what it&apos;s really like.
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-teal-500" />
        </Link>
      ) : (
        <div className="space-y-2.5">
          {data.stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
          {data.contributions.map((c) => (
            <ContributionCard key={c.id} contribution={c} />
          ))}
          <Link
            href={contributeHref}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Know someone in this field? Share their path
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function StoryCard({ story }: { story: PublicStory }) {
  return (
    <a
      href={story.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border bg-card/50 p-3 hover:border-teal-500/40 transition-colors"
    >
      <p className="text-xs font-semibold leading-snug">{story.headline}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {story.name} · {story.jobTitle}
        {story.company ? ` · ${story.company}` : ""}
        {story.location ? ` · ${story.location}` : ""}
      </p>
      {story.takeaways.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {story.takeaways.slice(0, 3).map((t, i) => (
            <li key={i} className="text-[10px] text-muted-foreground/80">• {t}</li>
          ))}
        </ul>
      )}
    </a>
  );
}

function ContributionCard({ contribution: c }: { contribution: PublicContribution }) {
  return (
    <div className="rounded-lg border bg-card/50 p-3">
      <div className="flex items-center gap-1.5">
        <Quote className="h-3 w-3 text-teal-500 shrink-0" />
        <p className="text-[10px] font-medium">
          {c.displayName} · {c.currentTitle}
          {c.city ? ` · ${c.city}, ${c.country}` : ` · ${c.country}`}
        </p>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/80">{c.realityOfJob}</p>
      <details className="mt-1.5">
        <summary className="cursor-pointer text-[10px] text-teal-600 dark:text-teal-400">Their full path</summary>
        <dl className="mt-1.5 space-y-1.5 text-[10px] text-muted-foreground">
          <Prompt label="How I got here" value={c.howIGotHere} />
          <Prompt label="What I studied" value={c.whatIStudied} />
          <Prompt label="First salary" value={c.firstSalary} />
          <Prompt label="Hardest part" value={c.hardestPart} />
          <Prompt label="Advice to my 17-year-old self" value={c.adviceToSeventeen} />
        </dl>
      </details>
    </div>
  );
}

function Prompt({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-foreground/70">{label}</dt>
      <dd className="leading-relaxed">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/career-voices/__tests__/real-voices.test.tsx`
Expected: PASS (empty-state CTA + story render). If `toBeTruthy` matchers fail to resolve, the repo's `src/test/setup.ts` already configures jest-dom; `getByText`/`getByRole` returning an element is sufficient for these assertions.

- [ ] **Step 5: Commit**

```bash
git add src/components/career-voices/real-voices.tsx src/components/career-voices/__tests__/real-voices.test.tsx
git commit -m "feat(voices): RealVoices component (stories + contributions + CTA)"
```

---

### Task 5: Wire RealVoices into the career detail sheet

**Files:**
- Modify: `src/components/career-detail-sheet.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/components/career-detail-sheet.tsx`, after the existing component imports, add:

```ts
import { RealVoices } from "@/components/career-voices/real-voices";
```

- [ ] **Step 2: Render the section**

In the scrollable content container `<div className="p-4 space-y-5">`, the "Actions" block ends with a `</div>` (the `space-y-2` actions wrapper) followed by the container's own closing `</div>`. Insert `<RealVoices>` as the last child of the `p-4 space-y-5` container — i.e. immediately AFTER the Actions `</div>` and BEFORE the `p-4 space-y-5` container's closing `</div>`:

```tsx
                {/* Actions */}
                <div className="space-y-2">
                  {/* …existing action buttons… */}
                </div>

                {/* Real voices — moderated real-human stories + contributions */}
                <RealVoices career={career} />
              </div>
```

(Replace only by adding the `<RealVoices career={career} />` line + comment; do not alter the existing Actions block.)

- [ ] **Step 3: Verify the build typechecks + tests still pass**

Run: `npx tsc --noEmit 2>&1 | grep "career-detail-sheet" || echo "sheet typechecks"`
Expected: `sheet typechecks`.
Run: `npx vitest run src/components/career-voices`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/career-detail-sheet.tsx
git commit -m "feat(voices): surface RealVoices in the career detail sheet"
```

---

### Task 6: Pre-fill /contribute from a ?career= param

**Files:**
- Modify: `src/app/contribute/page.tsx`
- Create: `src/app/contribute/career-param.ts` (pure helper)
- Test: `src/app/contribute/__tests__/career-param.test.ts`

- [ ] **Step 1: Write the failing test for the pure helper**

```ts
// src/app/contribute/__tests__/career-param.test.ts
import { describe, it, expect } from "vitest";
import { careerTagFromParam } from "../career-param";

describe("careerTagFromParam", () => {
  it("returns {id,title} for a known career id", () => {
    const tag = careerTagFromParam("software-developer");
    expect(tag?.id).toBe("software-developer");
    expect(typeof tag?.title).toBe("string");
  });
  it("returns null for missing or unknown ids", () => {
    expect(careerTagFromParam(null)).toBeNull();
    expect(careerTagFromParam("")).toBeNull();
    expect(careerTagFromParam("not-a-real-career-xyz")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/contribute/__tests__/career-param.test.ts`
Expected: FAIL — cannot find module `../career-param`.

- [ ] **Step 3: Write the helper**

```ts
// src/app/contribute/career-param.ts
import { getCareerById } from "@/lib/career-pathways";

/** Resolve a ?career=<id> param to the contribute form's tag shape, or null. */
export function careerTagFromParam(param: string | null): { id: string; title: string } | null {
  if (!param) return null;
  const career = getCareerById(param);
  return career ? { id: career.id, title: career.title } : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/contribute/__tests__/career-param.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire the helper into the contribute form**

In `src/app/contribute/page.tsx`:
1. Add imports near the top: `import { useEffect } from "react";` (merge into the existing `react` import) and `import { useSearchParams } from "next/navigation";` and `import { careerTagFromParam } from "./career-param";`.
2. In the component that owns `const [form, setForm] = useState<FormData>(INITIAL_FORM);` (line ~175), add below it:

```tsx
  const searchParams = useSearchParams();
  useEffect(() => {
    const preset = careerTagFromParam(searchParams.get("career"));
    if (!preset) return;
    setForm((prev) =>
      prev.careerTags.some((t) => t.id === preset.id)
        ? prev
        : { ...prev, careerTags: [...prev.careerTags, preset] },
    );
  }, [searchParams]);
```

3. `useSearchParams` requires a Suspense boundary. Check whether the page's default export already wraps the form in `<Suspense>`; if not, wrap the rendered form: `export default function ContributePage() { return (<Suspense fallback={null}><ContributeForm /></Suspense>); }` (import `Suspense` from `react`). Verify with `grep -n "Suspense" src/app/contribute/page.tsx`.

- [ ] **Step 6: Verify typecheck + the contribute test passes**

Run: `npx tsc --noEmit 2>&1 | grep "contribute" || echo "contribute typechecks"`
Expected: `contribute typechecks`.
Run: `npx vitest run src/app/contribute`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/contribute/page.tsx src/app/contribute/career-param.ts src/app/contribute/__tests__/career-param.test.ts
git commit -m "feat(voices): pre-fill /contribute career from ?career= param"
```

---

### Task 7: Full verification

- [ ] **Step 1: Run the full voices test set + lint**

Run:
```bash
npx vitest run src/lib/career-voices src/components/career-voices src/app/contribute
npx eslint src/lib/career-voices src/components/career-voices "src/app/api/careers/[id]/voices/route.ts" src/app/contribute/career-param.ts
```
Expected: all tests PASS; eslint clean (no output).

- [ ] **Step 2: Confirm no new typecheck errors in touched files**

Run: `npx tsc --noEmit 2>&1 | grep -E "career-voices|voices/route|real-voices|career-param|career-detail-sheet" | grep -v "__tests__" || echo "no new errors in touched source files"`
Expected: `no new errors in touched source files`.

---

## Self-Review

- **Spec coverage:** match helper (T1) ✓; public mappers w/ private-field stripping (T2) ✓; `/api/careers/[id]/voices` (T3) ✓; `RealVoices` empty-state-first + always-on CTA (T4) ✓; detail-sheet wire-in (T5) ✓; `/contribute?career=` pre-fill (T6) ✓; tests for matcher + mapper + component (T1/T2/T4/T6) ✓; no migration ✓; deferred items (report affordance, regional salary, factual backfill, top-100 ranking) intentionally absent ✓.
- **Placeholders:** none — every step has full code/commands.
- **Type consistency:** `CareerLike`, `RawStory`/`RawContribution`, `PublicStory`/`PublicContribution`, `VoicesResponse`, `buildVoicesResponse`, `matchesCareer`, `careerTagFromParam` are used identically across tasks.
- **Risk note:** the Prisma enum literal `status: "APPROVED"` (T3 Step 2) and the `Suspense` wrap (T6 Step 5) each carry a verification command + fallback if the assumption doesn't hold.
