/**
 * Career Twin persona builder.
 *
 * Generates a structured "one possible future self" deterministically from
 * career + (optional) profile context. No AI call needed — this keeps
 * persona generation fast, free, testable, and predictable. The persona is
 * always framed as a SCENARIO, never a prediction.
 */
import type {
  BuildPersonaInput,
  CareerTwinCareerContext,
  CareerTwinPersona,
  CareerTwinProfileContext,
} from "./types";

export const UNCERTAINTY_DISCLAIMER =
  "This is one possible version of your future — a simulation to help you explore, not a prediction. Your real path is yours to shape.";

/**
 * Estimate how old "future you" might be in this scenario. We add a span
 * long enough to have finished training and settled into the role. Returns
 * null when we don't know the user's age (the Twin then stays general).
 */
function estimateFutureAge(
  age: number | null | undefined,
  career: CareerTwinCareerContext,
): number | null {
  if (age == null || Number.isNaN(age)) return null;
  const universityish =
    /bachelor|master|degree|university|universit|høyskole|college/i.test(
      career.educationPath ?? "",
    );
  const span = universityish ? 9 : 6;
  return Math.min(Math.max(age, 13) + span, 35);
}

function summariseEducation(career: CareerTwinCareerContext): string {
  if (career.educationPath && career.educationPath.trim().length > 0) {
    return career.educationPath.trim();
  }
  return `the typical study and training routes into ${career.title}`;
}

function summariseTypicalDay(career: CareerTwinCareerContext): string {
  const tasks = (career.dailyTasks ?? []).filter(Boolean).slice(0, 3);
  if (tasks.length > 0) {
    return `A normal day often involves ${tasks.join(", ")}.`;
  }
  return `My days are a mix of the everyday tasks that make up life as a ${career.title}.`;
}

/**
 * Pull a short list of "assumed strengths" from whatever profile signals we
 * have. Phrased as assumptions ("based on what you've explored"), never as
 * facts we claim to know about the user's private life.
 */
function deriveAssumedStrengths(
  profile: CareerTwinProfileContext | null | undefined,
): string[] {
  if (!profile) return [];
  const out: string[] = [];
  for (const s of [...(profile.interests ?? []), ...(profile.subjects ?? [])]) {
    const t = (s ?? "").trim();
    if (t && !out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= 5) break;
  }
  return out;
}

function pickTone(age: number | null | undefined): {
  tone: string;
  safetyLevel: "standard" | "heightened";
} {
  if (age != null && age < 16) {
    return {
      tone: "warm, simple and gently encouraging, in plain language a younger teen can follow",
      safetyLevel: "heightened",
    };
  }
  return {
    tone: "warm, honest and peer-like — like an older version of you who genuinely cares",
    safetyLevel: "standard",
  };
}

function buildIntro(
  career: CareerTwinCareerContext,
  countryContext: string,
  strengths: string[],
): string {
  const place = countryContext && countryContext !== "your country" ? ` in ${countryContext}` : "";
  const strengthsLine =
    strengths.length > 0
      ? ` I leaned into things you already seem drawn to — like ${strengths.slice(0, 2).join(" and ")}.`
      : "";
  return (
    `Hey — I'm you, a few years from now. In this version of the story I followed the path to become a ${career.title}${place}.` +
    `${strengthsLine}` +
    ` I can tell you what the study journey felt like, what the work is really like, what I struggled with, and what I'd focus on next if I were you today.` +
    ` Just remember: this is one possible future, not a promise.`
  );
}

export function buildPersona(input: BuildPersonaInput): CareerTwinPersona {
  const { career, profile } = input;
  const age = profile?.age ?? null;
  const countryContext = (profile?.country ?? "").trim() || "your country";
  const strengths = deriveAssumedStrengths(profile);
  const { tone, safetyLevel } = pickTone(age);
  const now = new Date().toISOString();

  return {
    userId: input.userId ?? null,
    careerId: career.id,
    careerTitle: career.title,
    futureAgeEstimate: estimateFutureAge(age, career),
    countryContext,
    educationPathSummary: summariseEducation(career),
    currentRoleSummary: `a working ${career.title}`,
    typicalDaySummary: summariseTypicalDay(career),
    strengthsAssumedFromProfile: strengths,
    uncertaintyDisclaimer: UNCERTAINTY_DISCLAIMER,
    tone,
    safetyLevel,
    intro: buildIntro(career, countryContext, strengths),
    createdAt: now,
    updatedAt: now,
  };
}
