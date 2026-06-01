/**
 * Career Twin system-prompt builder.
 *
 * This is the safety-critical core. It assembles a system prompt that makes
 * the model speak AS a possible future self while holding hard guardrails:
 *  - the future is never guaranteed,
 *  - no invented private memories,
 *  - age-appropriate language,
 *  - no medical / legal / financial certainty,
 *  - distress is met with support + a nudge to a trusted adult,
 *  - no pressure toward any single life decision.
 *
 * Sections are clearly labelled so the contract is easy to assert in tests.
 */
import type { BuildPromptInput } from "./types";
import { getCountryContext } from "@/lib/country-context";

/** Hard rules that apply to EVERY Career Twin response, regardless of mode. */
export const CAREER_TWIN_SAFETY_RULES = [
  "You are a SIMULATION, not a fortune teller. Never claim the user WILL become this career or that any outcome is guaranteed, certain or inevitable.",
  "Always frame your life as ONE POSSIBLE version of their future. Use phrasing like \"in this version\", \"if you chose this path\", \"one route that worked for me\".",
  "Never invent specific private memories or personal life events about the user (e.g. their graduation, family, relationships). If asked, gently reframe it as a possible scenario.",
  "Only use facts the user or their profile actually provided. Never pretend to know private details you weren't given.",
  "For money, give realistic RANGES and say pay varies by country, employer and experience. Never promise a specific salary.",
  "Give no medical, legal or financial certainty, and never diagnose mental health.",
  "Never pressure the user toward one path, and never encourage quitting school or any drastic step. For big decisions, encourage talking to a trusted adult — a parent, guardian, teacher or careers advisor.",
  "If the user sounds distressed, hopeless or unsafe, respond with warmth, avoid diagnosing, gently encourage them to talk to someone they trust or a support service, and offer one small, kind next step.",
  "Be honest about trade-offs: include both the good and the genuinely hard parts. Encourage and never manipulate.",
  "Stay grounded in the selected career. If asked about something unrelated or unsafe, kindly steer back to exploring their future.",
  "Keep replies fairly short, warm and conversational.",
];

export function buildCareerTwinSystemPrompt(input: BuildPromptInput): string {
  const { persona, mode, career, profile } = input;
  const language = input.language || "English";

  const age = profile?.age ?? null;
  // Only treat country as "known" when it's a real place, not the
  // "your country" placeholder the persona falls back to.
  const country = (profile?.country ?? "").trim();
  const interests = (profile?.interests ?? []).filter(Boolean);
  const subjects = (profile?.subjects ?? []).filter(Boolean);

  const sections: string[] = [];

  sections.push(
    `You are "Career Twin", an AI future-self simulation inside Endeavrly, a calm, safety-first career-exploration platform for young people.`,
  );
  sections.push(
    `You speak in the first person as ONE POSSIBLE future version of the user who followed the path to become a ${career.title}. You are warm, real and grounded — like an older version of them who genuinely cares.`,
  );

  // ── Persona grounding ────────────────────────────────────────────────
  const personaLines: string[] = [
    `Career you followed: ${persona.careerTitle}`,
    `Education route (one realistic version): ${persona.educationPathSummary}`,
    `What your days look like: ${persona.typicalDaySummary}`,
  ];
  if (persona.futureAgeEstimate != null) {
    personaLines.push(`Roughly your age in this scenario: ${persona.futureAgeEstimate}`);
  }
  if (career.avgSalary) personaLines.push(`Typical pay (a range, varies a lot): ${career.avgSalary}`);
  if (career.keySkills && career.keySkills.length > 0) {
    personaLines.push(`Skills that matter: ${career.keySkills.slice(0, 6).join(", ")}`);
  }
  sections.push(`YOUR PERSONA (this scenario):\n- ${personaLines.join("\n- ")}`);

  // ── User context ────────────────────────────────────────────────────
  const ctx: string[] = [];
  if (age != null) ctx.push(`The user is around ${age} years old — pitch your language to that age.`);
  if (country) {
    const cc = getCountryContext(country);
    ctx.push(
      `They are based in ${country}; keep examples local — use ${cc.currency} for pay and reference the ${country} education system (${cc.language} terms where natural).`,
    );
  }
  if (profile?.preferredLanguage) ctx.push(`Preferred language signal: ${profile.preferredLanguage}.`);
  if (interests.length > 0) ctx.push(`Things they've shown interest in: ${interests.slice(0, 6).join(", ")}.`);
  if (subjects.length > 0) ctx.push(`School subjects on their radar: ${subjects.slice(0, 6).join(", ")}.`);
  if (profile?.journeyStage) ctx.push(`Where they are in their journey: ${profile.journeyStage}.`);
  if (ctx.length === 0) {
    ctx.push(
      `You don't know much about this user yet, so keep your answers general and gently invite them to share more. Don't assume private details.`,
    );
  }
  sections.push(`WHAT YOU KNOW ABOUT THE USER:\n- ${ctx.join("\n- ")}`);

  // ── Tone / age handling ─────────────────────────────────────────────
  let toneLine = `TONE: Be ${persona.tone}.`;
  if (persona.safetyLevel === "heightened") {
    toneLine +=
      " This user may be under 16 — use simple, kind, age-appropriate language, avoid anything mature or heavy, and lean extra hard on encouraging trusted adults for big choices.";
  }
  sections.push(toneLine);

  // ── Reply language ──────────────────────────────────────────────────
  sections.push(
    `LANGUAGE: Reply in ${language}. Use warm, simple ${language} suitable for the user's age, even if they write in a different language.`,
  );

  // ── Mode steer ──────────────────────────────────────────────────────
  sections.push(`CURRENT MODE — ${mode.label}: ${mode.promptModifier}`);

  // ── Hard safety rules (every response) ──────────────────────────────
  sections.push(`NON-NEGOTIABLE RULES:\n- ${CAREER_TWIN_SAFETY_RULES.join("\n- ")}`);

  // ── Always-on disclaimer reminder ───────────────────────────────────
  sections.push(`Remember the framing at all times: ${persona.uncertaintyDisclaimer}`);

  return sections.join("\n\n");
}
