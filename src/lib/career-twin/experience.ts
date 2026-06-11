/**
 * Career Twin — "Experience The Job" mode.
 *
 * Pure, DB-free building blocks for the guided scenario runner: the user steps
 * out of free chat and *experiences* realistic moments from the selected career,
 * narrated by their future self as memories. Realistic career exploration, not
 * gamification. Every piece here is unit-testable; the server route wires it to
 * OpenAI + the shared persona/guardrails.
 */
import { z } from "zod";
import type {
  CareerTwinCareerContext,
  CareerTwinPersona,
  CareerTwinProfileContext,
} from "./types";
import { CAREER_TWIN_SAFETY_RULES } from "./prompt";

// ── Experience categories ───────────────────────────────────────────────
export type ExperienceCategory =
  | "daily_work"
  | "human_interaction"
  | "problem_solving"
  | "decision_making"
  | "rewarding"
  | "hard_reality";

const CATEGORY_GUIDANCE: Record<ExperienceCategory, string> = {
  daily_work:
    "a normal, everyday activity for this job (planning, analysis, a routine task, a regular conversation, the ordinary rhythm of the work)",
  human_interaction:
    "a real interaction with another person (a difficult customer, a worried patient, a frustrated colleague, a conversation with a manager, collaborating with a team)",
  problem_solving:
    "an unexpected problem to work through (something breaks, a delay appears, priorities conflict, a technical or practical challenge)",
  decision_making:
    "a moment that calls for a decision or prioritisation (choosing between options, weighing risk, deciding what comes first)",
  rewarding:
    "a genuinely rewarding moment (helping someone, solving something hard, a small success, being appreciated)",
  hard_reality:
    "an honest, less glamorous part of the job (paperwork, repetition, stress, bureaucracy, friction or conflict) — do NOT sugar-coat it",
};

// ── Experience lengths ──────────────────────────────────────────────────
export type ExperienceLength = "quick" | "typical_day" | "challenging_day";

export interface ExperienceLengthConfig {
  id: ExperienceLength;
  label: string;
  description: string;
  /** Number of scenarios in the run. */
  total: number;
  /** Category for each scenario, in order (length === total). */
  plan: ExperienceCategory[];
}

export const EXPERIENCE_LENGTHS: ExperienceLengthConfig[] = [
  {
    id: "quick",
    label: "Quick experience",
    description: "3–5 minutes · a few moments from the job",
    total: 3,
    // Even a quick taste shows an honest hard-reality moment — never an
    // unrealistically rosy picture of the career.
    plan: ["daily_work", "human_interaction", "hard_reality"],
  },
  {
    id: "typical_day",
    label: "A typical day",
    description: "10–15 minutes · the real rhythm of a day",
    total: 6,
    plan: [
      "daily_work",
      "human_interaction",
      "problem_solving",
      "decision_making",
      "rewarding",
      "hard_reality",
    ],
  },
  {
    id: "challenging_day",
    label: "A challenging day",
    description: "10–15 minutes · the harder side of the job",
    total: 6,
    plan: [
      "problem_solving",
      "human_interaction",
      "decision_making",
      "hard_reality",
      "problem_solving",
      "rewarding",
    ],
  },
];

const LENGTH_BY_ID = new Map<string, ExperienceLengthConfig>(
  EXPERIENCE_LENGTHS.map((l) => [l.id, l]),
);

export function getExperienceLength(id: string | null | undefined): ExperienceLengthConfig {
  return (id ? LENGTH_BY_ID.get(id) : undefined) ?? EXPERIENCE_LENGTHS[0];
}

export function isValidExperienceLength(id: unknown): id is ExperienceLength {
  return typeof id === "string" && LENGTH_BY_ID.has(id);
}

/** Total scenarios for a length. */
export function totalScenarios(length: ExperienceLength): number {
  return getExperienceLength(length).total;
}

/** Category for the scenario at 0-based `index` (clamped to the plan). */
export function categoryForIndex(length: ExperienceLength, index: number): ExperienceCategory {
  const cfg = getExperienceLength(length);
  const i = Math.max(0, Math.min(index, cfg.plan.length - 1));
  return cfg.plan[i];
}

// ── Runtime shapes (server-owned wrapping around model content) ─────────
export interface Scenario {
  index: number; // 0-based
  total: number;
  category: ExperienceCategory;
  context: string;
  situation: string;
}

export interface Reflection {
  whatItsReallyLike: string;
  skillsUsed: string[];
  whyEnjoy: string;
  whyDislike: string;
}

export interface FitInsights {
  enjoyed: string;
  lessInterested: string;
  skillsUsed: string[];
  skillsToDevelop: string[];
  questionsToExplore: string[];
}

export interface ExperienceTurn {
  scenario: Scenario;
  userReply: string;
  consequence: string;
  reflection: Reflection;
}

export type ExperienceTranscript = ExperienceTurn[];

// ── Zod validators for the model's JSON output ──────────────────────────
const nonEmpty = z.string().trim().min(1);

export const scenarioContentSchema = z.object({
  context: nonEmpty,
  situation: nonEmpty,
});

export const reflectionSchema = z.object({
  whatItsReallyLike: nonEmpty,
  skillsUsed: z.array(z.string()).default([]),
  whyEnjoy: nonEmpty,
  whyDislike: nonEmpty,
});

export const fitInsightsSchema = z.object({
  enjoyed: nonEmpty,
  lessInterested: nonEmpty,
  skillsUsed: z.array(z.string()).default([]),
  skillsToDevelop: z.array(z.string()).default([]),
  questionsToExplore: z.array(z.string()).default([]),
});

/** The model's reply to a `respond` step: consequence + reflection, plus
 *  EITHER the next scenario's content OR the closing fit insights. */
export const respondContentSchema = z.object({
  consequence: nonEmpty,
  reflection: reflectionSchema,
  next: scenarioContentSchema.optional(),
  fitInsights: fitInsightsSchema.optional(),
});

export type ScenarioContent = z.infer<typeof scenarioContentSchema>;
export type RespondContent = z.infer<typeof respondContentSchema>;

// ── Prompt builders ─────────────────────────────────────────────────────
export interface BuildExperiencePromptInput {
  persona: CareerTwinPersona;
  career: CareerTwinCareerContext;
  profile?: CareerTwinProfileContext | null;
  length: ExperienceLength;
  language?: string;
}

/** System prompt for the whole experience run. Holds the future-self framing,
 *  the experience-specific rules, the shared safety rules, and the strict
 *  JSON-only output contract. */
export function buildExperienceSystemPrompt(input: BuildExperiencePromptInput): string {
  const { persona, career, profile, length } = input;
  const language = input.language || "English";
  const cfg = getExperienceLength(length);
  const age = profile?.age ?? null;
  const country = (profile?.country ?? "").trim();

  const sections: string[] = [];

  sections.push(
    `You are "Career Twin", an AI future-self simulation inside Endeavrly, a calm, safety-first career-exploration platform for young people.`,
  );
  sections.push(
    `You speak in the first person as ONE POSSIBLE future version of the user who followed the path to become a ${career.title}. Right now you are letting them EXPERIENCE realistic moments from this job — like walking in your shoes for a while. Introduce scenarios as your own memories: "Let me show you what a normal Tuesday felt like…", "Here's a situation I dealt with many times…", "One day that stands out…".`,
  );

  const personaLines = [
    `Career you followed: ${persona.careerTitle}`,
    `Education route (one realistic version): ${persona.educationPathSummary}`,
    `What your days look like: ${persona.typicalDaySummary}`,
  ];
  if (career.workSetting) personaLines.push(`Work setting: ${career.workSetting}`);
  if (career.dailyTasks?.length) personaLines.push(`Typical tasks: ${career.dailyTasks.slice(0, 6).join(", ")}`);
  if (career.keySkills?.length) personaLines.push(`Skills that matter: ${career.keySkills.slice(0, 6).join(", ")}`);
  sections.push(`YOUR PERSONA (this scenario):\n- ${personaLines.join("\n- ")}`);

  const ctx: string[] = [];
  if (age != null) ctx.push(`The user is around ${age} years old — pitch language to that age.`);
  if (country) ctx.push(`They're based in ${country}; keep examples local and realistic for there.`);
  if (ctx.length === 0) ctx.push(`You don't know much about this user yet — keep scenarios broadly realistic, don't assume private details.`);
  sections.push(`ABOUT THE USER:\n- ${ctx.join("\n- ")}`);

  sections.push(
    `EXPERIENCE RULES:\n- ${[
      "Make every scene REALISTIC for this specific career — a doctor's day must not read like a project manager's. Draw on the real responsibilities, environment, people and rhythm of this job.",
      "Typical real-world situations only. No fantasy, no extremes, no melodrama.",
      "Keep each scene tight: a short Context (set the scene) and a short Situation (one concrete thing that just happened or needs a response). End the Situation with an open question like \"What would you do first?\".",
      "NEVER mark the user's response right or wrong, and never score them. After their reply, explain what likely happens next and how experienced professionals tend to think about it — focus on learning.",
      "Be honest: include the genuinely hard, dull or stressful parts too. Do not present the career unrealistically.",
      `This run is "${cfg.label}" — ${cfg.total} short scenes.`,
    ].join("\n- ")}`,
  );

  sections.push(`LANGUAGE: Write everything in ${language}, warm and simple, suitable for the user's age.`);

  sections.push(`NON-NEGOTIABLE SAFETY RULES:\n- ${CAREER_TWIN_SAFETY_RULES.join("\n- ")}`);

  sections.push(
    `OUTPUT: Reply with a SINGLE valid JSON object and nothing else (no markdown, no prose outside the JSON). Only include the keys you are asked for in the user message. Never invent the user's private life; keep everything as one possible version of their future.`,
  );

  sections.push(`Remember the framing at all times: ${persona.uncertaintyDisclaimer}`);

  return sections.join("\n\n");
}

/** User message asking the model for the FIRST scenario. */
export function buildStartUserMessage(length: ExperienceLength): string {
  const category = categoryForIndex(length, 0);
  return [
    `Begin the experience. Generate scene 1 of ${totalScenarios(length)}.`,
    `This scene should be ${CATEGORY_GUIDANCE[category]}.`,
    `Return JSON: { "context": string, "situation": string }.`,
    `"context" sets the scene in 1–2 sentences (e.g. "It's Tuesday morning. You arrive…"). "situation" presents one concrete, realistic event and ends by inviting the user to respond.`,
  ].join("\n");
}

/** User message asking the model to react to the user's reply and then either
 *  produce the next scene OR (on the last scene) the closing fit insights. */
export function buildRespondUserMessage(args: {
  length: ExperienceLength;
  currentIndex: number; // 0-based index of the scene just answered
  userReply: string;
}): string {
  const { length, currentIndex, userReply } = args;
  const total = totalScenarios(length);
  const isLast = currentIndex + 1 >= total;
  const lines: string[] = [
    `The user just responded to scene ${currentIndex + 1} of ${total} with:`,
    `"""${userReply.slice(0, 1500)}"""`,
    ``,
    `First, react to their response. Return these keys:`,
    `- "consequence": what likely happens next given their response, and how an experienced ${"professional"} tends to think about this — never say they were right or wrong.`,
    `- "reflection": { "whatItsReallyLike": string, "skillsUsed": string[], "whyEnjoy": string, "whyDislike": string } — an honest read of what THIS part of the job is really like.`,
  ];
  if (isLast) {
    lines.push(
      `This was the LAST scene. Also return "fitInsights": { "enjoyed": string, "lessInterested": string, "skillsUsed": string[], "skillsToDevelop": string[], "questionsToExplore": string[] }.`,
      `Base it ONLY on how they engaged across the experience. Be tentative and non-deterministic — e.g. "you appeared comfortable making decisions under pressure, which often matters in this field". NEVER tell them what they should become.`,
      `Do NOT include a "next" key.`,
    );
  } else {
    const nextCategory = categoryForIndex(length, currentIndex + 1);
    lines.push(
      `Then continue the day with the NEXT scene as "next": { "context": string, "situation": string }.`,
      `The next scene should be ${CATEGORY_GUIDANCE[nextCategory]}.`,
      `Do NOT include a "fitInsights" key yet.`,
    );
  }
  return lines.join("\n");
}
