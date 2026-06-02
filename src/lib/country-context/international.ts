import type { CountryContext } from "./index";

/**
 * Neutral, country-agnostic context. Used for any country we have NOT
 * localised, so we never silently serve Norwegian salaries or — critically —
 * a wrong-country crisis number. Safety-first: a generic emergency message,
 * no NOK, no Norway-specific education system.
 *
 * With the signup picker gated to LAUNCHED_COUNTRIES (Norway, Spain), this
 * is reached by legacy profiles whose stored country is no longer offered.
 */
export const internationalContext: CountryContext = {
  code: "INT",
  name: "International",
  currency: "",
  language: "English",
  crisisLine:
    "If you are in danger or need urgent help, call your local emergency number (112 across the EU) or a local helpline.",
  condensedAiContext: () =>
    "The user's country is not yet localised. Do NOT assume a specific country's education system, salaries, or services. Keep guidance general and, where a specific number or service matters, tell them to check their own country's official sources.",
};
