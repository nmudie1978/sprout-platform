/**
 * Semantic-QA agent — pure core (no side effects, no LLM client).
 *
 * Holds the prompt builders, the verdict parser, and an injectable review
 * runner so the agent's deterministic logic can be unit-tested without calling
 * an LLM. `scripts/semantic-qa-static-content.ts` wires these to OpenAI + CLI.
 */

import type { CareerMyth } from "./career-myths";
import type { CareerDetails } from "./career-typical-days";

export type Verdict = "current" | "review" | "outdated";

export interface VerdictResult {
  verdict: Verdict;
  reasoning: string;
  suggestedUpdate?: string;
}

export interface ReviewEntry {
  target: string;
  careerId: string;
  index: number;
  content: unknown;
  verdict: Verdict;
  reasoning: string;
  suggestedUpdate?: string;
}

/** One unit of work for the reviewer: the content + the prompt to judge it. */
export interface ReviewItem {
  target: string;
  careerId: string;
  index: number;
  content: unknown;
  prompt: string;
}

/** A reviewer turns a prompt into a verdict (OpenAI in prod, a stub in tests). */
export type ReviewFn = (prompt: string) => Promise<VerdictResult>;

// ── Prompts ─────────────────────────────────────────────────────────

export const SYSTEM_PROMPT = `
You are a fact-checker for a youth career-guidance platform serving
15-23 year olds in Norway and the wider Nordics. You are reviewing a
single piece of editorial content for accuracy.

Your job: classify the content as exactly one of:
  - "current"  — the claim is still accurate as of today.
  - "review"   — the claim was accurate but specific facts (numbers,
                 organisation names, salary figures, percentages, dates)
                 may have drifted and a human should re-check the source.
  - "outdated" — the claim is materially wrong today and should not be
                 shown to students.

Rules:
  1. Be honest. If the claim is fine, return "current". Don't invent
     problems to look thorough.
  2. Numbers and percentages drift the fastest; flag any specific
     figure as "review" by default unless you're sure it's stable.
  3. Organisation names that may have been acquired / merged / wound
     up in 2024-2026 are "review".
  4. Universal claims about a profession (e.g. "developers spend time
     in meetings") are usually "current" unless they're specifically
     time-bound.
  5. Always include a one-sentence reasoning. If you flag, optionally
     include a "suggestedUpdate" with what to change.

Respond with ONLY a JSON object: { "verdict": "current"|"review"|"outdated",
"reasoning": "...", "suggestedUpdate": "..." (optional) }.
`.trim();

export function userPromptForMyth(careerId: string, myth: CareerMyth): string {
  return `Career: ${careerId}

CLAIM: "${myth.claim}"
REALITY: "${myth.reality}"

Is this still accurate today? Classify as current / review / outdated.`;
}

export function userPromptForTypicalDay(careerId: string, details: CareerDetails): string {
  const skills = details.topSkills.join(", ");
  const doing = details.whatYouActuallyDo.join("; ");
  return `Career: ${careerId}

This is "day in the life" content shown to students. Review it for any
claims that may have drifted — especially specific numbers, named
organisations, salary/job-security statements, or anything time-bound.

REALITY CHECK: "${details.realityCheck ?? "(none)"}"
TOP SKILLS: ${skills}
WHAT YOU ACTUALLY DO: ${doing}

Is this still accurate today? Classify as current / review / outdated.`;
}

// ── Verdict parsing ─────────────────────────────────────────────────

/** Parse a model JSON response into a normalised verdict; defaults to review. */
export function parseVerdict(raw: string): VerdictResult {
  try {
    const parsed = JSON.parse(raw);
    const verdict: Verdict =
      parsed.verdict === "outdated"
        ? "outdated"
        : parsed.verdict === "review"
          ? "review"
          : "current";
    return {
      verdict,
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
      suggestedUpdate:
        typeof parsed.suggestedUpdate === "string" ? parsed.suggestedUpdate : undefined,
    };
  } catch {
    return {
      verdict: "review",
      reasoning: "Model response could not be parsed; default to review.",
    };
  }
}

// ── Review runner ───────────────────────────────────────────────────

/**
 * Run each item through the reviewer, up to `limit`. Pure orchestration —
 * the reviewer is injected, so tests use a stub and prod uses OpenAI.
 */
export async function runReview(
  items: ReviewItem[],
  reviewFn: ReviewFn,
  limit = Infinity,
  onProgress?: (item: ReviewItem) => void,
): Promise<ReviewEntry[]> {
  const entries: ReviewEntry[] = [];
  for (const item of items) {
    if (entries.length >= limit) break;
    onProgress?.(item);
    const result = await reviewFn(item.prompt);
    entries.push({
      target: item.target,
      careerId: item.careerId,
      index: item.index,
      content: item.content,
      verdict: result.verdict,
      reasoning: result.reasoning,
      suggestedUpdate: result.suggestedUpdate,
    });
  }
  return entries;
}

export function summarise(entries: ReviewEntry[]) {
  return {
    current: entries.filter((e) => e.verdict === "current").length,
    review: entries.filter((e) => e.verdict === "review").length,
    outdated: entries.filter((e) => e.verdict === "outdated").length,
    total: entries.length,
  };
}
