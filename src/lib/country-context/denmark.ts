import type { CountryContext } from "./index";

/**
 * Denmark — Nordic expansion. Condensed context for AI career guidance.
 * Figures are approximate ranges (label them as such in answers). Sources:
 * Børne- og Undervisningsministeriet (UVM), optagelse.dk/KOT, SU, Danmarks
 * Statistik, jobnet.dk. Keep this concise — it is injected into the system prompt.
 */
const DENMARK_AI_CONTEXT = `
EDUCATION SYSTEM (Denmark):
- Folkeskole: compulsory through 9th grade (an optional 10th grade is common before youth education).
- Ungdomsuddannelser (youth education) after folkeskole, two main routes:
  • Gymnasiale uddannelser (university-preparatory): STX, HHX (business), HTX (technical), HF.
  • Erhvervsuddannelse (EUD/EUX, vocational) — a "vekseluddannelse" alternating school with paid apprenticeship/practik in a company.
- Grading: the 7-trins-skala (7-point scale): 12, 10, 7, 4, 02 are passing; 00 and -3 are fail.
- Higher ed: universitet — bachelor (3 years) + kandidat/master (2 years), measured in ECTS; professionshøjskole gives professional bachelors (e.g. nurse, teacher, pedagogue); erhvervsakademi gives shorter "academy profession" (erhvervsakademiuddannelse) degrees.
- Admission via optagelse.dk (the coordinated application, KOT): kvote 1 (purely by grade-point average, "adgangskvotient") and kvote 2 (grades plus other criteria like relevant experience/tests).
- Student support: SU (Statens Uddannelsesstøtte) — a state grant for eligible students aged 18+, sometimes with a supplementary loan (SU-lån).

JOB MARKET (Denmark):
- jobnet.dk is the public job portal; other sites include Jobindex and LinkedIn.
- There is NO statutory minimum wage — pay and conditions are set by collective agreements ("overenskomst") negotiated per sector. The "flexicurity" model means flexible hiring/firing paired with strong unemployment support. Mention overenskomst when discussing pay/conditions.

PAY (Denmark, approximate — always say figures are ranges):
- Currency: DKK (written "kr"). Salaries are usually quoted as a MONTHLY figure ("månedsløn") and are typically stated BEFORE the ~8% labour-market contribution (AM-bidrag) and income tax.
- Entry-level pay varies by sector and region (Copenhagen higher). Use Danmarks Statistik for grounding and label figures as approximate.

TERMINOLOGY: folkeskole, ungdomsuddannelse, STX/HHX/HTX/HF, erhvervsuddannelse (EUD/EUX), vekseluddannelse, praktik, 7-trins-skala, professionshøjskole, erhvervsakademi, universitet (bachelor/kandidat, ECTS), optagelse.dk, kvote 1/kvote 2, adgangskvotient, SU, overenskomst, AM-bidrag. Use these local terms and explain them.
`.trim();

export const denmarkContext: CountryContext = {
  code: "DK",
  name: "Denmark",
  currency: "DKK",
  language: "Danish",
  crisisLine:
    "112 for emergencies, or Livslinien on 70 201 201 (Denmark)",
  condensedAiContext: () => DENMARK_AI_CONTEXT,
};
