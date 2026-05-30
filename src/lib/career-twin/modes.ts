/**
 * Career Twin conversation modes.
 *
 * Each mode steers WHAT the future self talks about. Safety, age-tone and
 * the non-determinism framing live in the prompt builder and apply to
 * EVERY mode — a mode can never loosen them.
 */
import type { CareerTwinMode, CareerTwinModeId } from "./types";

export const CAREER_TWIN_MODES: CareerTwinMode[] = [
  {
    id: "ask_future_me",
    label: "Ask Future Me",
    description: "Anything you're curious about",
    promptModifier:
      "The user wants an open, honest conversation. Answer whatever they ask about this career honestly, balancing the good and the hard, always as one possible version of their future.",
    starterQuestions: [
      "Was this career worth it?",
      "What surprised you most?",
      "Do you actually enjoy the job?",
    ],
  },
  {
    id: "day_in_life",
    label: "A Day in My Life",
    description: "What the work really feels like",
    promptModifier:
      "Focus on the concrete texture of a normal working day in this career: rhythm, environment, who you work with, what's energising and what's draining. Be specific and grounded, not glossy.",
    starterQuestions: [
      "Walk me through a normal day.",
      "What part of the day is most stressful?",
      "How much do you work with other people?",
    ],
  },
  {
    id: "how_i_got_here",
    label: "How I Got Here",
    description: "The path from where you are now",
    promptModifier:
      "Describe a realistic journey from roughly the user's current age into this career — study choices, early steps, turning points. Frame it as 'one route that worked', not the only route.",
    starterQuestions: [
      "What did I study to get here?",
      "What did I do at 16, 18 and 21?",
      "What actually helped me get started?",
    ],
  },
  {
    id: "what_i_wish_i_knew",
    label: "What I Wish I Knew",
    description: "Honest hindsight",
    promptModifier:
      "Share the things this future self wishes they'd understood earlier — gentle, practical hindsight. Avoid regret-heavy or discouraging framing; keep it useful.",
    starterQuestions: [
      "What do you wish you'd known at my age?",
      "What would you do differently?",
      "What's something nobody told you?",
    ],
  },
  {
    id: "study_skills",
    label: "Study & Skills",
    description: "Subjects, training and skills",
    promptModifier:
      "Focus on education and skills: useful school subjects, training routes, and the practical and human skills that matter in this career. Mention more than one valid route where possible.",
    starterQuestions: [
      "Which subjects should I focus on?",
      "What skills matter most in this job?",
      "Do I need university, or are there other routes?",
    ],
  },
  {
    id: "money_lifestyle",
    label: "Money & Lifestyle",
    description: "Pay, hours and balance",
    promptModifier:
      "Talk about money and lifestyle honestly: typical pay RANGES (never a guaranteed number), hours, work-life balance and how it changes over a career. Always caveat that pay varies by country, employer and experience.",
    starterQuestions: [
      "What sort of pay range is realistic?",
      "What are the hours like?",
      "How is the work-life balance?",
    ],
  },
  {
    id: "hard_truths",
    label: "Hard Truths",
    description: "The difficult parts",
    promptModifier:
      "Be candid about the genuinely hard parts of this career and why some people leave it — without being bleak or scaring the user off. Help them judge fit, and end on a constructive note.",
    starterQuestions: [
      "What's genuinely hard about this career?",
      "Why do people leave this job?",
      "What would make this a bad fit for someone?",
    ],
  },
  {
    id: "next_step_coach",
    label: "Next Step Coach",
    description: "One small thing you can do now",
    promptModifier:
      "Act as a gentle coach. Help the user find ONE small, safe, concrete next step they could take this week to explore this career. Never pressure a big life decision; suggest small experiments.",
    starterQuestions: [
      "What should I do this month?",
      "What's one small action I can take this week?",
      "How do I explore this without committing to it?",
    ],
  },
];

export const DEFAULT_MODE_ID: CareerTwinModeId = "ask_future_me";

const MODE_BY_ID = new Map<string, CareerTwinMode>(
  CAREER_TWIN_MODES.map((m) => [m.id, m]),
);

/** Look up a mode by id, falling back to the default mode for unknown ids. */
export function getMode(id: string | null | undefined): CareerTwinMode {
  if (id && MODE_BY_ID.has(id)) return MODE_BY_ID.get(id)!;
  return MODE_BY_ID.get(DEFAULT_MODE_ID)!;
}

export function isValidModeId(id: string | null | undefined): id is CareerTwinModeId {
  return !!id && MODE_BY_ID.has(id);
}
