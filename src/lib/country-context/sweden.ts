import type { CountryContext } from "./index";
import { getCondensedSwedishContext } from "@/lib/swedish-context";

/**
 * Sweden — country context for AI career guidance.
 *
 * The knowledge block lives in lib/swedish-context.ts, mirroring how Norway
 * uses lib/norwegian-context.ts. It was previously an inline 2.6KB string
 * against Norway's 8.4KB file, which was enough to name Swedish institutions
 * and not enough to answer "can I work evenings at 16".
 * Figures are approximate ranges (label them as such in answers). Sources:
 * Skolverket, UHR/antagning.se, CSN, SCB (Statistics Sweden), Arbetsförmedlingen.
 * Keep this concise — it is injected into the system prompt.
 */
export const swedenContext: CountryContext = {
  code: "SE",
  name: "Sweden",
  currency: "SEK",
  language: "Swedish",
  crisisLine:
    "112 for emergencies, or Mind Självmordslinjen on 90101 (Sweden)",
  condensedAiContext: getCondensedSwedishContext,
};
