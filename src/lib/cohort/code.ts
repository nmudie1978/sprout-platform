/**
 * Cohort join code generator.
 *
 * 6-character uppercase alphanumeric codes, with confusable characters
 * removed (0 / O, 1 / I / L). That leaves 32 unique symbols → 32^6 ≈
 * 1 billion codes. Collisions are vanishingly rare for any realistic
 * usage but callers must still loop + retry the DB insert on collision
 * because "vanishingly rare" is not "impossible".
 *
 * Codes are rendered uppercased and are compared case-insensitively at
 * join time (see /api/cohorts/join).
 */

import { randomInt } from "crypto";

// A–Z minus {I, L, O} plus 2–9 (no 0, no 1). 32 symbols.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function generateCohortCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    out += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return out;
}

export function isValidCohortCode(code: unknown): code is string {
  if (typeof code !== "string") return false;
  if (code.length !== CODE_LENGTH) return false;
  return [...code].every((c) => ALPHABET.includes(c));
}

export function normaliseCohortCode(raw: string): string {
  // Trim, uppercase, strip a single middle hyphen if present (some
  // teachers will write it as ABC-DEF on a whiteboard — accept both).
  return raw.trim().toUpperCase().replace(/-/g, "");
}
