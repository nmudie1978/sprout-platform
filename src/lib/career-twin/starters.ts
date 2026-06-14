/**
 * Career Twin — CONTEXT-AWARE starter chips.
 *
 * Turns the generic per-mode starter questions into a few prompts that react to
 * the user's REAL context — the career this Twin is grounded in, the other
 * careers they've recently explored/saved, and where they are in their journey.
 * This makes the very first turn feel personal ("How do I get from school to
 * {career}?", "Compare {career} with {otherExplored}?") instead of generic.
 *
 * It is DETERMINISTIC and template-based — built purely from already-loaded
 * context (the same `TwinRecentActivity` the proactive opener uses). So:
 *   - zero extra OpenAI cost (no AI call),
 *   - it can never reference a career the user hasn't actually touched, and
 *   - brand-new users gracefully fall back to the mode's generic chips.
 *
 * Kept free of Prisma/React so it stays pure and unit-testable.
 */
import type { TwinRecentActivity } from "./types";

/**
 * Build up to `max` context-aware starter chips for the chat's opening state.
 *
 * Returns an empty array when there's nothing real to personalise from (a
 * brand-new user with no activity) — the caller then shows the generic
 * mode starters as before.
 */
export function buildContextStarters(
  careerTitle: string,
  activity: TwinRecentActivity | null,
  max = 3,
): string[] {
  const title = (careerTitle || "this career").trim();

  // Real, personal context to react to: a named OTHER career they've explored,
  // or a known journey stage. With neither, there's nothing to personalise from
  // (a brand-new user) → return empty so the caller shows generic mode chips.
  const other = activity?.recentCareers?.find(
    (c) => c.title && c.title.trim() && c.title.trim() !== title,
  );
  const stage = (activity?.journeyStage ?? "").toLowerCase();
  const hasStage = stage.includes("clarity") || stage.includes("understand") || stage.includes("discover");
  if (!other && !hasStage) return [];

  const chips: string[] = [];
  const seen = new Set<string>();
  const add = (q: string) => {
    const v = q.trim();
    if (v && !seen.has(v)) {
      seen.add(v);
      chips.push(v);
    }
  };

  // 1) Compare with the most-recent OTHER career they explored — only when we
  //    have a real, named alternative (never invents one).
  if (other) {
    add(`How does ${title} compare with ${other.title}?`);
  }

  // 2) A journey-stage-aware route question — calm, forward-looking.
  if (stage.includes("clarity")) {
    add(`What's one small step toward ${title} I could take this week?`);
  } else if (stage.includes("understand")) {
    add(`What's the hardest part of actually being a ${title}?`);
  } else if (stage.includes("discover")) {
    add(`How do I get from school to ${title}?`);
  }

  // 3) A grounded "ways in" prompt — only added to round out a list that's
  //    already personally anchored (never the sole chip for a new user).
  add(`What's the most realistic way into ${title} from where I am?`);

  return chips.slice(0, Math.max(0, max));
}
