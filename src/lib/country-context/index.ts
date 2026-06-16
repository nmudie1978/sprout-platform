/**
 * Country context registry for AI surfaces (Career Advisor, Career Twin).
 *
 * The platform's default is Norway, but a user's `YouthProfile.country`
 * (captured at signup) selects the country whose education system, currency,
 * pay norms, and — critically — crisis helpline the AI should default to.
 *
 * This controls the AI's KNOWLEDGE/CONTEXT only. It does NOT change the
 * reply language: chat output stays English per the documented English-only
 * policy (see docs/english-only.md + ai-guardrails ENGLISH_ONLY_RULE).
 * Switching AI output language is a separate decision.
 */
import { norwayContext } from "./norway";
import { spainContext } from "./spain";
import { swedenContext } from "./sweden";
import { denmarkContext } from "./denmark";
import { internationalContext } from "./international";

export interface CountryContext {
  /** ISO 3166-1 alpha-2 */
  code: string;
  /** Display name as used in YouthProfile.country and prompts */
  name: string;
  /** Currency code used for salary figures, e.g. "NOK" | "EUR" */
  currency: string;
  /** The country's main language (for "local terminology" hints) */
  language: string;
  /**
   * Crisis-helpline phrase inserted into the AI's canned safety response.
   * MUST be country-correct — a wrong emergency number is a safety failure.
   */
  crisisLine: string;
  /** Condensed education + job-market + salary knowledge block for the system prompt. */
  condensedAiContext: () => string;
}

/** Keyed by `YouthProfile.country` display name. */
const REGISTRY: Record<string, CountryContext> = {
  Norway: norwayContext,
  Spain: spainContext,
  Sweden: swedenContext,
  Denmark: denmarkContext,
};

/**
 * Resolve a country's AI context. Falls back to a NEUTRAL international
 * context (never silently Norway) for unknown/missing/unlocalised countries
 * — so we never serve a wrong-country crisis number or NOK pay. Never throws.
 */
export function getCountryContext(country?: string | null): CountryContext {
  return (country && REGISTRY[country]) || internationalContext;
}
