/**
 * Source-level regression tests for Issue 2 (completion message
 * leakage) and Issue 4 (Study Path content contamination).
 *
 * These tests read component source files and assert on what content
 * is / isn't present. They catch regressions without requiring jsdom
 * or React Testing Library, and specifically guard against:
 *
 *   Issue 2 (positive): Dashboard uses a subtle completion indicator
 *   Issue 2 (negative): Dashboard does NOT render the Grow congrats
 *                       copy ("Congratulations — you fully understand
 *                       this path!") when all three lenses are done
 *
 *   Issue 4 (positive): EducationBrowser renders structured pathway
 *                       data (stat pills, institution cards,
 *                       alternative routes, help link)
 *   Issue 4 (negative): EducationBrowser does NOT render a narrative
 *                       prose summary that can read as "How to
 *                       become..." or "A typical day..." content
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

// Strip single-line (`//`) and multi-line (`/* */`) comments from a
// source file so assertions about "this string is not rendered" don't
// match strings that only appear inside explanatory comments. We
// deliberately keep JSX `{/* ... */}` comments stripped too — these
// are block comments inside JS expressions and would otherwise
// poison the same assertions.
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
}

const DASHBOARD_SOURCE_RAW = readFileSync(
  join(process.cwd(), 'src/app/(dashboard)/dashboard/page.tsx'),
  'utf-8',
);
const DASHBOARD_SOURCE = stripComments(DASHBOARD_SOURCE_RAW);

const EDUCATION_BROWSER_SOURCE_RAW = readFileSync(
  join(process.cwd(), 'src/components/education-browser/education-browser.tsx'),
  'utf-8',
);
const EDUCATION_BROWSER_SOURCE = stripComments(EDUCATION_BROWSER_SOURCE_RAW);

const MY_JOURNEY_SOURCE_RAW = readFileSync(
  join(process.cwd(), 'src/app/(dashboard)/my-journey/page.tsx'),
  'utf-8',
);
const MY_JOURNEY_SOURCE = stripComments(MY_JOURNEY_SOURCE_RAW);

// ── Issue 2 — Completion message leakage ─────────────────────────────

describe('Dashboard completion block removed (owner request)', () => {
  // The dashboard My Journey card's post-completion block (the
  // "You've explored this possible future" indicator + "Explore
  // another career" CTA) was removed at the owner's request. These
  // guard against it being reintroduced.
  it('no longer renders the "explored this possible future" completion indicator', () => {
    expect(DASHBOARD_SOURCE).not.toMatch(/journey\.completeIndicator/);
  });

  it('no longer renders the "Explore another career" completion CTA', () => {
    expect(DASHBOARD_SOURCE).not.toMatch(/journey\.exploreAnother/);
  });
});

describe('Dashboard completion indicator (Issue 2 — negative tests)', () => {
  it('does NOT render the old full-width congrats banner copy', () => {
    // The old banner said "Congratulations — you fully understand
    // this path!" inside the Dashboard. This exact string must no
    // longer appear in the Dashboard source.
    expect(DASHBOARD_SOURCE).not.toMatch(
      /Congratulations\s+—\s+you fully understand this path/,
    );
  });

  it('does NOT render the "explored, understood, and experienced" body copy', () => {
    // That phrase is the Grow congrats narrative. It belongs in
    // GrowCompleteCard (my-journey) only.
    expect(DASHBOARD_SOURCE).not.toMatch(
      /You've explored, understood, and experienced/,
    );
  });

  it('does NOT render a 🎉 emoji as a completion celebration', () => {
    // Heavy celebration emoji is reserved for the Grow context.
    // Match in any line outside comments — simplest check is that
    // the literal emoji doesn't appear anywhere on the Dashboard.
    expect(DASHBOARD_SOURCE).not.toMatch(/🎉/);
  });

  it('my-journey Clarity completion now renders the slim success row, not the old banner', () => {
    // The large "🎉 You've explored X from every angle" banner was
    // replaced with a compact SaaS-style success row — "Journey
    // complete" label + recommendations popover + PDF export icon.
    // Negative: the old celebration copy must not reappear.
    expect(MY_JOURNEY_SOURCE).not.toMatch(/explored.*from every angle/);
    expect(MY_JOURNEY_SOURCE).not.toMatch(/🎉/);
    // Positive: the new row is present inside the Clarity completion card.
    expect(MY_JOURNEY_SOURCE).toMatch(/Journey complete/);
    expect(MY_JOURNEY_SOURCE).toMatch(/Recommended next moves|Next moves/);
  });
});

// ── Issue 4 — Study Path content integrity ──────────────────────────

describe('EducationBrowser content (Issue 4 — positive tests)', () => {
  it('renders stat pills for programme metadata (pathway structure)', () => {
    expect(EDUCATION_BROWSER_SOURCE).toMatch(/<StatDetail[\s\S]+?\/>/);
  });

  it('renders the schools table in the fallback mode', () => {
    // The fallback mode builds a schools array from
    // universityPath.examples and renders them as a simple table
    // (Institution / Location / Duration columns, Explore-Careers style).
    expect(EDUCATION_BROWSER_SOURCE).toMatch(/schools\.map/);
    expect(EDUCATION_BROWSER_SOURCE).toMatch(/>Institution</);
  });

  it('renders filters for the main university-browser mode', () => {
    expect(EDUCATION_BROWSER_SOURCE).toMatch(/BrowserFilters/);
  });

  it('renders alternative routes in an info card when present', () => {
    expect(EDUCATION_BROWSER_SOURCE).toMatch(/Alternative routes/);
  });

  it('renders a utdanning.no help link', () => {
    expect(EDUCATION_BROWSER_SOURCE).toMatch(/utdanning\.no/);
  });
});

describe('EducationBrowser content (Issue 4 — negative tests)', () => {
  it('does NOT render "How to become a X" as a heading', () => {
    // The old hero title was "How to become a {careerTitle}". That
    // whole hero was removed from both render modes and replaced
    // with the parent SectionHeader's "Study Path" title.
    expect(EDUCATION_BROWSER_SOURCE).not.toMatch(/How to become a/);
  });

  it('does NOT render "A typical day" or "day in the life" content', () => {
    // Typical-day content belongs to the A Typical Day section,
    // not the Study Path section.
    expect(EDUCATION_BROWSER_SOURCE).not.toMatch(/[Tt]ypical day/);
    expect(EDUCATION_BROWSER_SOURCE).not.toMatch(/day in the life/i);
  });

  it('does NOT render the career-summary narrative paragraph', () => {
    // The `summary` paragraph (getCareerSummary → "In Norway,
    // becoming a doctor requires...") was removed because its
    // phrasing reads as "how to become" overview. Study Path is now
    // structured pathway data only.
    expect(EDUCATION_BROWSER_SOURCE).not.toMatch(
      /\{summary\s*&&[\s\S]{0,80}<p/,
    );
  });

  it('does NOT import getCareerSummary', () => {
    // Dead import removal — guards against the summary prose
    // sneaking back in via a stale import.
    expect(EDUCATION_BROWSER_SOURCE).not.toMatch(/getCareerSummary/);
  });

  it('does NOT render "How this career works" step list in the fallback', () => {
    // The step list was removed per product spec: vocational careers
    // must present only the alternative study path, nothing more.
    expect(EDUCATION_BROWSER_SOURCE).not.toMatch(
      /<p[\s\S]*?>[\s\S]*?How this career works[\s\S]*?<\/p>/,
    );
  });

  it('does NOT render "What you\'ll do" daily-tasks list in the fallback', () => {
    // Daily tasks belong in the "What You'll Actually Do" section,
    // not the Study Path fallback.
    expect(EDUCATION_BROWSER_SOURCE).not.toMatch(
      /<p[\s\S]*?>[\s\S]*?What you'll do[\s\S]*?<\/p>/,
    );
  });

  it('does NOT accept a "summary" prop on PathwayFallbackView', () => {
    // The fallback function signature should not list a summary
    // parameter — dead prop removal matches the content cleanup.
    const fallbackSig = EDUCATION_BROWSER_SOURCE.match(
      /function PathwayFallbackView\(\{[^}]+\}/,
    );
    expect(fallbackSig).not.toBeNull();
    expect(fallbackSig?.[0]).not.toMatch(/summary/);
  });
});

describe('Study Path section wiring (Issue 4 — sibling context)', () => {
  it('Study Path renders as a tab inside the "Education Pathway" SectionCard', () => {
    // School Readiness + Study Path were collapsed into a single
    // tabbed card titled "Education Pathway". Study Path is now
    // a TabsTrigger with value="study-path", not its own SectionCard.
    expect(MY_JOURNEY_SOURCE).toMatch(/title="Education Pathway"/);
    expect(MY_JOURNEY_SOURCE).toMatch(/value="study-path"/);
    expect(MY_JOURNEY_SOURCE).toMatch(/u-education-pathway/);
    // Guard: ensure the EducationBrowser component is still rendered
    // inside the study-path TabsContent (not accidentally unmounted).
    expect(MY_JOURNEY_SOURCE).toMatch(/<EducationBrowser\s/);
  });

  it('A Typical Day lives in the "Day & Workplace" card, a sibling above Education Pathway', () => {
    // #178 consolidated "A Typical Day" + "Where People Work" into one
    // "Day & Workplace" SectionCard, where A Typical Day is a tab. It is
    // still a sibling of Education Pathway (Readiness + Study Path), not
    // nested inside it, and renders above it in the Understand tab.
    expect(MY_JOURNEY_SOURCE).toMatch(/title="Day & Workplace"/);
    expect(MY_JOURNEY_SOURCE).toMatch(/A Typical Day/);
    const dayIndex = MY_JOURNEY_SOURCE.indexOf('title="Day & Workplace"');
    const educationPathwayIndex = MY_JOURNEY_SOURCE.indexOf('title="Education Pathway"');
    expect(dayIndex).toBeGreaterThan(0);
    expect(educationPathwayIndex).toBeGreaterThan(dayIndex);
  });
});
