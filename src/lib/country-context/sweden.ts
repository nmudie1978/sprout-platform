import type { CountryContext } from "./index";

/**
 * Sweden — Nordic expansion. Condensed context for AI career guidance.
 * Figures are approximate ranges (label them as such in answers). Sources:
 * Skolverket, UHR/antagning.se, CSN, SCB (Statistics Sweden), Arbetsförmedlingen.
 * Keep this concise — it is injected into the system prompt.
 */
const SWEDEN_AI_CONTEXT = `
EDUCATION SYSTEM (Sweden):
- Grundskola: compulsory through year 9 (to ~age 16). Final-year grades give a "meritvärde" (merit points) used for gymnasium admission.
- Gymnasium (upper secondary, 3 years), two main tracks:
  • Högskoleförberedande program (university-preparatory).
  • Yrkesprogram (vocational) — can include "lärlingsutbildning" (apprenticeship) with workplace time (APL).
- Grading scale A–F: A–E are passing, F is fail.
- University/higher ed: högskola/universitet — kandidatexamen (bachelor, ~180 högskolepoäng/hp, 3 years), then magister/masterexamen, then forskarutbildning (PhD). Yrkeshögskola (YH) offers shorter, employer-aligned vocational higher education. Folkhögskola and Komvux are adult-education routes.
- Admission to higher ed via antagning.se (UHR), using gymnasium grades (jämförelsetal/betygspoäng) OR Högskoleprovet (the national aptitude test) as an alternative route. Many programmes have a "antagningspoäng" (entry score).
- Student support: CSN — studiemedel = bidrag (grant) + lån (loan).

JOB MARKET (Sweden):
- Arbetsförmedlingen is the public employment service; job sites include Platsbanken, LinkedIn, Indeed, Blocket Jobb.
- There is NO statutory minimum wage — pay floors are set by collective agreements ("kollektivavtal") negotiated per sector by unions and employers. Mention kollektivavtal when discussing pay/conditions.

PAY (Sweden, approximate — always say figures are ranges):
- Currency: SEK (written "kr"). Salaries are usually quoted as a MONTHLY figure ("månadslön").
- Entry-level pay varies widely by sector and region (Stockholm higher). Use SCB lönestatistik for grounding and label figures as approximate.

TERMINOLOGY: grundskola, gymnasium, högskoleförberedande/yrkesprogram, lärlingsutbildning, meritvärde, Högskoleprovet, högskola/universitet, högskolepoäng (hp), yrkeshögskola (YH), Komvux, folkhögskola, CSN (studiemedel/bidrag/lån), antagning.se, kollektivavtal, Arbetsförmedlingen. Use these local terms and explain them.
`.trim();

export const swedenContext: CountryContext = {
  code: "SE",
  name: "Sweden",
  currency: "SEK",
  language: "Swedish",
  crisisLine:
    "112 for emergencies, or Mind Självmordslinjen on 90101 (Sweden)",
  condensedAiContext: () => SWEDEN_AI_CONTEXT,
};
