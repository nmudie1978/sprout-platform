/**
 * Career Twin — PROACTIVE opener.
 *
 * Builds the warm, personalised first line the Twin says when it opens, so it
 * feels like a companion who's been paying attention rather than a blank
 * chatbot. The opener is DETERMINISTIC and template-based — built purely from
 * already-loaded context (recently explored/saved careers, the active goal,
 * journey stage, returning-after-a-gap). This means:
 *   - zero extra OpenAI cost (no AI call on Twin open),
 *   - instant, and
 *   - it can never hallucinate a career the user hasn't actually touched.
 *
 * It always references REAL data. When the user has no activity yet (a brand
 * new user), it returns null so the caller falls back to the existing generic
 * persona intro and nothing breaks.
 *
 * Kept free of Prisma/React so it stays pure and unit-testable.
 */
import type { TwinRecentActivity, CareerTwinCareerContext } from "./types";
import { isReturningAfterGap } from "./memory";

/** Format a list of titles as "A", "A and B", or "A, B and C". */
function joinTitles(titles: string[]): string {
  const t = titles.filter(Boolean);
  if (t.length === 0) return "";
  if (t.length === 1) return t[0];
  if (t.length === 2) return `${t[0]} and ${t[1]}`;
  return `${t.slice(0, -1).join(", ")} and ${t[t.length - 1]}`;
}

/** Friendly word for where the user is in their journey, or null. */
function stagePhrase(stage: string | null): string | null {
  if (!stage) return null;
  const s = stage.toLowerCase();
  if (s.includes("clarity")) return "you're getting closer to a decision";
  if (s.includes("understand")) return "you've been digging into how it really works";
  if (s.includes("discover")) return "you've been exploring what this path is like";
  return null;
}

export interface ProactiveOpener {
  /** The warm opening line in the Twin's "future self" voice. */
  text: string;
  /** Optional single gentle reflective question to offer alongside the opener. */
  question: string | null;
}

/**
 * Build the proactive opener from real recent activity.
 *
 * Priority (matches the route's intent):
 *   1. Returning after a long gap → lead with a warm "it's been a while".
 *   2. Recently explored/saved OTHER careers → reference them by name and
 *      offer to compare with this one.
 *   3. Active goal / journey stage with no other recent careers → acknowledge
 *      where they are.
 *   4. Nothing real to reference → return null (caller uses the generic intro).
 */
export function buildProactiveOpener(
  career: CareerTwinCareerContext,
  activity: TwinRecentActivity | null,
): ProactiveOpener | null {
  if (!activity) return null;

  const careerTitle = career.title;
  // Other careers the user touched recently (the active one is already excluded
  // upstream, but guard again so we never echo it back as "recent").
  const others = activity.recentCareers
    .filter((c) => c.careerId !== activity.activeCareerId && c.title && c.title !== careerTitle)
    .slice(0, 2);
  const returning = isReturningAfterGap(activity.daysSinceLastVisit);

  // 1) Returning after a gap — warmest re-entry, anchored to this career.
  if (returning) {
    return {
      text:
        `It's been a little while since we last talked — I've still been here, living the ${careerTitle} version of your future. ` +
        `Want to pick up where we left off?`,
      question: "What's been on your mind about this path lately?",
    };
  }

  // 2) Recently explored/saved OTHER careers — the "I've noticed you've been
  //    looking at X and Y" companion moment.
  if (others.length > 0) {
    const names = joinTitles(others.map((c) => c.title));
    if (others.length >= 2) {
      return {
        text:
          `I noticed you've been weighing up ${names} as well as ${careerTitle} lately. ` +
          `I'm the ${careerTitle} version of you — happy to talk through how this one really compares.`,
        question: `Want to start with how ${careerTitle} stacks up against ${others[0].title}?`,
      };
    }
    return {
      text:
        `I noticed you've also been exploring ${names} recently. ` +
        `I'm here as the ${careerTitle} version of your future — ask me how the two compare, or anything about this path.`,
      question: `Curious how ${careerTitle} and ${others[0].title} differ day to day?`,
    };
  }

  // 3) An active goal or a known journey stage to acknowledge.
  const stage = stagePhrase(activity.journeyStage);
  if (activity.activeGoalTitle && activity.activeGoalTitle === careerTitle) {
    return {
      text:
        `${careerTitle} is your focus right now — and I'm the version of you who's already living it. ` +
        (stage ? `Looks like ${stage}. ` : "") +
        `Ask me what it really takes, or what I'd do next if I were you again.`,
      question: "What's the one thing you most want to know before committing?",
    };
  }
  if (stage) {
    return {
      text:
        `I can tell ${stage} with ${careerTitle}. ` +
        `I'm the version of you a few years into it — ask me what the study and the work are really like.`,
      question: "Where would you like to start?",
    };
  }

  // 4) Nothing real to reference — let the caller use the generic intro.
  return null;
}
