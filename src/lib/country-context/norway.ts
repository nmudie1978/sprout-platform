import type { CountryContext } from "./index";
import { getCondensedNorwegianContext } from "../norwegian-context";

/**
 * Norway — the platform default. Wraps the existing condensed Norwegian
 * context so nothing about the current behaviour changes for NO users.
 */
export const norwayContext: CountryContext = {
  code: "NO",
  name: "Norway",
  currency: "NOK",
  language: "Norwegian",
  crisisLine: "116 111 (Mental Helse helpline in Norway)",
  condensedAiContext: getCondensedNorwegianContext,
};
