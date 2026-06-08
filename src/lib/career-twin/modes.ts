/**
 * Career Twin conversation modes.
 *
 * Each mode steers WHAT the future self talks about. Safety, age-tone and
 * the non-determinism framing live in the prompt builder and apply to
 * EVERY mode — a mode can never loosen them.
 *
 * starterQuestions are deliberately framed as questions to your FUTURE self
 * ("you" = the version of you a few years ahead who already lived this) —
 * retrospective and experiential ("Are you happy with…", "Looking back…",
 * "What surprised you…") rather than generic present-tense career queries.
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
      "Knowing what you know now, would you choose it again?",
      "What do you wish you'd known at my age?",
    ],
  },
  {
    id: "study_skills",
    label: "Study & Skills",
    description: "Subjects, training and skills",
    promptModifier:
      "Focus on education and skills: useful school subjects, training routes, certifications, and the practical and human skills that matter in this career. Mention more than one valid route where possible (university is not the only path).",
    starterQuestions: [
      "Which subjects actually mattered in the end?",
      "What skills do you use every day now?",
      "Did you need university, or did another route get you here?",
      "Looking back, what should I start learning now?",
      "Was anything you studied a waste of time?",
    ],
  },
  {
    id: "money_lifestyle",
    label: "Money & Lifestyle",
    description: "Pay, hours and balance",
    promptModifier:
      "Talk about money and lifestyle honestly: typical pay RANGES (never a guaranteed number), hours, work-life balance, where you can live and remote-work options, and how it changes over a career. Always caveat that pay varies by country, employer and experience.",
    starterQuestions: [
      "Are you happy with the money?",
      "Does the pay let you live the way you wanted?",
      "What are your days and hours actually like now?",
      "Did you end up working remotely or abroad?",
      "Looking back, was the money worth the effort?",
    ],
  },
  {
    id: "hard_truths",
    label: "Hard Truths",
    description: "The difficult parts",
    promptModifier:
      "Be candid about the genuinely hard parts of this career — the stress, competition, the boring stretches, the risks, and why some people leave it — without being bleak or scaring the user off. Help them judge fit, and end on a constructive note.",
    starterQuestions: [
      "What's the hardest part you didn't see coming?",
      "Was there a moment you nearly quit?",
      "What do you wish someone had warned you about?",
      "Looking back, what nearly put you off?",
      "What should I think hard about before committing?",
    ],
  },
  {
    id: "doubts_risks",
    label: "Doubts & Risks",
    description: "Your honest worries",
    promptModifier:
      "The user wants to voice their real doubts and worries. Take each one seriously and answer with honest, balanced perspective — never fake reassurance. Cover questions like whether AI will replace or elevate this job, what happens if they hate the work, if university isn't for them, if they fail, or if the career changes a lot in 10 years. Acknowledge genuine uncertainty, give a grounded view of how the field is actually changing, and end with something steadying and practical. For big life decisions, gently encourage talking to a trusted adult.",
    starterQuestions: [
      "Did AI change the job — replace it, or elevate it?",
      "There were times you hated the work — how did you get through them?",
      "If university wasn't for me, how did you find your way in?",
      "What risk worried you most — and did it actually happen?",
      "How much has the field changed since you were my age?",
    ],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    description: "Ways in and things to try",
    promptModifier:
      "Focus on concrete ways into this career the user could explore soon: internships, apprenticeships, entry routes, events, intro courses, bootcamps and other live opportunities. Keep suggestions realistic and age-appropriate, prefer low-commitment ways to try things, and never imply a guaranteed place or outcome.",
    starterQuestions: [
      "How did you actually get your first foot in the door?",
      "What's the smartest thing I could try right now?",
      "Did an internship or apprenticeship help you?",
      "Looking back, which opportunity mattered most?",
      "What low-risk way could I test this before committing?",
    ],
  },
  {
    id: "next_steps",
    label: "Next Steps",
    description: "One small thing you can do now",
    promptModifier:
      "Act as a gentle coach. Help the user find ONE small, safe, concrete next step they could take this week to explore this career. Never pressure a big life decision; suggest small experiments.",
    starterQuestions: [
      "If you were me again, what would you do first?",
      "What's one small thing I could do this week?",
      "What early move paid off most for you?",
      "How would you explore this without committing?",
      "Where should I start, honestly?",
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
