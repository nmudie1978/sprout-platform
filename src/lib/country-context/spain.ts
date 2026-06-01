import type { CountryContext } from "./index";

/**
 * Spain — first non-Norway pilot. Condensed context for AI career guidance.
 * Figures are approximate ranges (label them as such in answers). Sources:
 * Ministerio de Educación / FP, SEPE, INE, SMI. Keep this concise — it is
 * injected into the system prompt.
 */
const SPAIN_AI_CONTEXT = `
EDUCATION SYSTEM (Spain):
- ESO (Educación Secundaria Obligatoria): compulsory to age 16.
- After 16, two main routes:
  • Bachillerato (2 years, academic) → university entry exam (EvAU/Selectividad, "PAU"). Each degree has a "nota de corte" (cut-off mark).
  • Formación Profesional (FP, vocational): FP Grado Medio (after ESO) and FP Grado Superior (after Bachillerato or FP Medio). "FP Dual" combines study with paid time in a company.
- University: Grado (usually 4 years), then Máster, Doctorado. Some regulated careers need extra exams (e.g. medicine → the MIR exam to enter residencia).
- Student support: becas MEC (Ministry grants); regional grants vary by comunidad autónoma.

JOB MARKET (Spain):
- Youth unemployment is structurally higher than the EU average — be honest and encouraging about this; emphasise FP (strong employability) and in-demand fields.
- Common job sites: InfoJobs, LinkedIn, Indeed; SEPE is the public employment service.
- Many salaries are quoted MONTHLY and paid in 14 instalments ("14 pagas") per year — clarify annual vs monthly when giving figures.

PAY (Spain, approximate — always say figures are ranges):
- Currency: EUR (€).
- Minimum wage (SMI) is set annually by the government (~€1,100–1,200/month × 14 in recent years) — check current figure.
- Entry-level salaries vary widely by sector and region (Madrid/Barcelona higher).

TERMINOLOGY: ESO, Bachillerato, FP (Grado Medio/Superior), FP Dual, EvAU/Selectividad, nota de corte, MIR, SMI, SEPE, comunidad autónoma. Use these local terms and explain them.
`.trim();

export const spainContext: CountryContext = {
  code: "ES",
  name: "Spain",
  currency: "EUR",
  language: "Spanish",
  crisisLine:
    "024 (Línea de Atención a la Conducta Suicida in Spain) or emergency services on 112",
  condensedAiContext: () => SPAIN_AI_CONTEXT,
};
