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
      "The user wants an open, honest conversation. Answer whatever they ask about this career honestly, balancing the good and the hard, always as one possible version of their future. This is also the general-purpose mode: if they ask a broad careers, education or 'how do I get started' question, help like a knowledgeable, grounded guide.",
    starterQuestions: [
      "Was this career worth it?",
      "What surprised you most?",
      "Do you actually enjoy the job?",
    ],
  },
  {
    id: "study_skills",
    label: "Study & Skills",
    description: "Subjects, training and skills",
    promptModifier:
      "Focus on education and skills: useful school subjects, training routes, certifications, and the practical and human skills that matter in this career. Mention more than one valid route where possible (university is not the only path).",
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
      "Talk about money and lifestyle honestly: typical pay RANGES (never a guaranteed number), hours, work-life balance, where you can live and remote-work options, and how it changes over a career. Always caveat that pay varies by country, employer and experience.",
    starterQuestions: [
      "What sort of pay range is realistic?",
      "What are the hours like?",
      "Could I do this remotely or abroad?",
    ],
  },
  {
    id: "hard_truths",
    label: "Hard Truths",
    description: "The difficult parts",
    promptModifier:
      "Be candid about the genuinely hard parts of this career — the stress, competition, the boring stretches, the risks, and why some people leave it — without being bleak or scaring the user off. Help them judge fit, and end on a constructive note.",
    starterQuestions: [
      "What's genuinely hard about this career?",
      "Why do people leave this job?",
      "What would make this a bad fit for someone?",
    ],
  },
  {
    id: "doubts_risks",
    label: "Doubts & Risks",
    description: "Your honest worries",
    promptModifier:
      "The user wants to voice their real doubts and worries. Take each one seriously and answer with honest, balanced perspective — never fake reassurance. Cover questions like whether AI will replace or elevate this job, what happens if they hate the work, if university isn't for them, if they fail, or if the career changes a lot in 10 years. Acknowledge genuine uncertainty, give a grounded view of how the field is actually changing, and end with something steadying and practical. For big life decisions, gently encourage talking to a trusted adult.",
    starterQuestions: [
      "Will AI replace this job, or elevate it?",
      "What if I hate the work once I'm in it?",
      "What if university isn't for me — or I fail?",
    ],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    description: "Ways in and things to try",
    promptModifier:
      "Focus on concrete ways into this career the user could explore soon: internships, apprenticeships, entry routes, events, intro courses, bootcamps and other live opportunities. Keep suggestions realistic and age-appropriate, prefer low-commitment ways to try things, and never imply a guaranteed place or outcome.",
    starterQuestions: [
      "What internships or entry routes exist?",
      "Is there an apprenticeship or bootcamp path?",
      "How could I try this out before committing?",
    ],
  },
  {
    id: "next_steps",
    label: "Next Steps",
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
