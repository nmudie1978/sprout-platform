/**
 * The copy shown when a Free user meets a limit.
 *
 * Centralised so every surface says the same thing, and so the wording is
 * reviewable in one place rather than scattered through components. Each entry
 * states plainly what happened and what Pro changes — no urgency, no
 * flattery, nothing implying the user has failed at something.
 *
 * Brand voice forbids "unlock your potential" and its family. A young person
 * who has just been stopped mid-task is the last person who should be sold to.
 */

export type UpgradeReason =
  | "career_limit"
  | "career_twin_limit"
  | "events_opportunities"
  | "personal_roadmap"
  | "ai_guidance"
  | "career_comparison"
  | "progress_tracking"
  | "saved_careers";

export interface UpgradeCopy {
  /** What just happened. Factual, past tense, no blame. */
  headline: string;
  /** What Pro changes about it. One sentence. */
  body: string;
  /** Button label. Always the same, so the action is predictable. */
  cta: string;
}

export const UPGRADE_COPY: Record<UpgradeReason, UpgradeCopy> = {
  career_limit: {
    headline: "You've explored 10 careers.",
    body: "Pro removes the limit, so you can keep exploring as many as you want. The ten you've already opened stay yours either way.",
    cta: "See Pro",
  },
  career_twin_limit: {
    headline: "You've used your 5 free Career Twin questions.",
    body: "Pro gives you unlimited conversations with Future You.",
    cta: "See Pro",
  },
  events_opportunities: {
    headline: "Events and opportunities are part of Pro.",
    body: "Open days, apprenticeships, internships and graduate programmes, in one place.",
    cta: "See Pro",
  },
  personal_roadmap: {
    headline: "Your personal roadmap is part of Pro.",
    body: "Turn what you've explored into a plan with real next steps.",
    cta: "See Pro",
  },
  ai_guidance: {
    headline: "Next-step guidance is part of Pro.",
    body: "Personalised suggestions for what to actually do next, based on where you are.",
    cta: "See Pro",
  },
  career_comparison: {
    headline: "Comparing careers is part of Pro.",
    body: "Put careers side by side on pay, entry routes and what the work is really like.",
    cta: "See Pro",
  },
  progress_tracking: {
    headline: "Progress tracking is part of Pro.",
    body: "See how far you've come across your journey, not just where you are now.",
    cta: "See Pro",
  },
  saved_careers: {
    headline: "You've saved as many careers as Free allows.",
    body: "Pro removes the limit on saved careers.",
    cta: "See Pro",
  },
};

/**
 * Where the upgrade CTA goes.
 *
 * Carries the reason and the page the user was on, so the pricing page can
 * acknowledge what they were doing and send them back afterwards. The brief is
 * explicit that a limit must not dump someone on the homepage — being
 * interrupted is bad enough without also losing your place.
 */
export function upgradeHref(reason: UpgradeReason, returnTo?: string): string {
  const params = new URLSearchParams({ reason });
  if (returnTo) params.set("from", returnTo);
  return `/pricing?${params.toString()}`;
}
