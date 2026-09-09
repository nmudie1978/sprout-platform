/**
 * Swedish Context for AI Career Advisor
 *
 * The Swedish counterpart to norwegian-context.ts. Until this existed, a
 * Swedish user's AI guidance came from a 2.6KB inline block against Norway's
 * 8.4KB file — enough to name Swedish institutions, not enough to answer a
 * practical question like "can I work evenings at 16" or "why is there no
 * minimum wage". The result was generic advice wearing Swedish nouns.
 *
 * Structured to mirror the Norwegian file so the two can be compared and kept
 * honest against each other.
 *
 * Figures are approximate and dated. Swedish pay is set by collective
 * agreement rather than statute, so a single national number does not exist —
 * every rate here should be given to the user as a range, with the reason it
 * varies.
 */

export const SWEDISH_LABOR_CONTEXT = `
## SWEDISH YOUTH EMPLOYMENT LAW

Governed by Arbetsmiljölagen and AFS 2012:3 (Minderårigas arbetsmiljö). Swedish
law splits young workers into "barn" (under 18 and not yet finished compulsory
school) and "ungdom" (16-17 and finished compulsory school) — the dividing line
is finishing grundskola, not simply turning 16.

**Under 13:** Work is not permitted, apart from very limited exceptions
(cultural/artistic work) that need approval from Arbetsmiljöverket.

**Ages 13-15 (äldre barn — from the year you turn 13):**
- Light work only: nothing physically strenuous, no dangerous machinery
- Max 2 hours on a school day, 7 hours on a non-school day
- Max 12 hours per week during term
- During school holidays: max 7 hours/day and 35 hours/week
- Guardian's consent required
- Examples: newspaper delivery, light shop work, garden work, babysitting

**Ages 16-17 (ungdom, compulsory school completed):**
- Max 8 hours/day and 40 hours/week
- No night work: rest required between 22:00 and 06:00 (or 23:00-07:00)
- At least 12 hours' continuous daily rest, and 36 hours' weekly rest
- No hazardous work (chemicals, heavy machinery, significant heights)
- May not serve alcohol

**Ages 18+:** Full adult working rights.

### Documents and practicalities
- **Personnummer** — needed to be employed and paid
- **Bankkonto and BankID** — wages are paid to a Swedish account; BankID is
  needed for almost every official service
- **Tax**: Sweden has no "tax card". The employer deducts A-skatt
  automatically. BUT if you will earn under the annual threshold
  (~24,900 kr in 2025) you can give the employer an "intyg för utbetalning av
  lön utan skatteavdrag" so nothing is deducted — worth knowing, because most
  summer jobs fall under it.
- **Utdrag ur belastningsregistret** (police record extract) — required for
  work with children, in schools and in parts of care

### Minimum wage
Sweden has NO statutory minimum wage. Pay floors come from **kollektivavtal**,
negotiated per sector between unions and employers. This is the single most
important structural fact about Swedish pay: the answer to "what is minimum
wage in Sweden" is "there isn't one — it depends on the agreement covering
that workplace".

Two consequences young people should know:
- **Semesterersättning**: on a temporary or summer contract, holiday pay of at
  least 12% is added on top of the hourly rate. Check it is there.
- **OB-tillägg**: a supplement for inconvenient hours (evenings, weekends,
  nights) under most agreements. Evening and weekend shifts pay more.
`;

export const SWEDISH_EDUCATION_CONTEXT = `
## SWEDISH EDUCATION SYSTEM

### Grundskola (compulsory, to about age 16)
Ends after year 9. Final grades produce a "meritvärde" used for gymnasium
admission — a different calculation from the higher-education meritvärde below.

### Gymnasium (upper secondary, 3 years, ages ~16-19)
Two families of programme:

**Högskoleförberedande program** — prepares for university. Includes
Naturvetenskapsprogrammet, Teknikprogrammet, Samhällsvetenskapsprogrammet,
Ekonomiprogrammet, Estetiska programmet, Humanistiska programmet.

**Yrkesprogram** — vocational, leads to a yrkesexamen. Includes substantial
arbetsplatsförlagt lärande (APL) in a real workplace. Can be taken as
"lärlingsutbildning", where most of the training happens at the employer.
A yrkesprogram can still include the courses needed for university eligibility
("grundläggande högskolebehörighet") — choosing vocational does NOT close the
university door, and young people frequently believe it does.

**Grades**: A-F. A-E pass, F fails.

**Gy25**: Sweden is mid-reform. Gy25 replaces course grades (kursbetyg) with
subject grades (ämnesbetyg); the first Gy25 diplomas are awarded in spring
2028. A student starting gymnasium now will graduate under Gy25. The numeric
scale is unchanged: A=20 down to F=0.

### After gymnasium
- **Universitet / högskola** — kandidatexamen (180 hp, 3 years), then
  masterexamen (60-120 hp). Long professional degrees (läkarprogrammet,
  juristprogrammet, psykologprogrammet, civilingenjör) run 4.5-6 years.
- **Yrkeshögskola (YH)** — 1-2 years, designed with employers, includes LIA
  (workplace training). Strongly employment-oriented; often overlooked.
- **Folkhögskola** — an alternative route, including for completing eligibility.
- **Komvux** — municipal adult education, used to top up grades or eligibility.

### Getting in
Applications go through **antagning.se** (UHR). Two main routes:
- **Betyg**: meritvärde = jämförelsetal (max 20.00) + meritpoäng (max 2.5), so
  22.5 is the ceiling. Selection groups BI (no supplementation), BII
  (supplemented), BF (folkhögskola).
- **Högskoleprovet**: a national aptitude test scored 0.00-2.00, valid eight
  years. At least a third of places on a programme are allocated from this
  group, so it is a genuine second route for someone whose grades are weak —
  not a footnote.
`;

export const SWEDISH_JOB_MARKET_CONTEXT = `
## SWEDISH JOB MARKET FOR YOUNG PEOPLE

### Kommunala feriejobb — the distinctly Swedish route
Most kommuner offer **feriejobb / sommarjobb** to residents aged roughly 16-18,
often with a guaranteed or lottery-allocated place. Applications typically open
**January-March** for the summer. This is the single most useful thing to tell a
Swedish 16-year-old looking for a first job, and it has no direct Norwegian
equivalent. Point them at their own kommun's website.

### Seasonal patterns
**Summer (June-August):** peak hiring. Tourism, cafés, ice cream, festivals,
care and elderly care cover, warehouse. Apply February-April.
**Winter:** Christmas retail (October-December), ski tourism in the north.
**Year round:** grocery (ICA, Coop, Willys, Lidl), fast food, delivery
(Foodora, Uber Eats), warehouse and logistics.

### Where to look
1. **Platsbanken** (Arbetsförmedlingen) — the public job bank
2. **The kommun's own site** — for feriejobb
3. **Blocket Jobb**, **Indeed**, **LinkedIn**
4. **Direct approach** — walking in still works in retail and hospitality
5. **Bemanningsföretag** — staffing agencies (Academic Work, Manpower, StudentConsulting)

### Applying in Sweden
- Personligt brev (cover letter) plus CV, both usually one page
- Referenser matter, but do not include your personnummer in a CV
- Swedish workplace culture prizes punctuality, independence and asking
  questions early rather than guessing
- Interviews are typically informal in tone but expect concrete examples
`;

export const SWEDISH_SALARY_CONTEXT = `
## TYPICAL PAY FOR YOUNG WORKERS IN SWEDEN (approximate, 2025)

Because pay is set by kollektivavtal, these are RANGES and vary by agreement,
employer, region and age. Under-18 rates are commonly lower than adult rates
under the same agreement. Always present them as approximate.

| Work | Typical hourly | Notes |
|------|----------------|-------|
| Retail (Handels agreement), 16-17 | ~90-120 kr | Youth rate; rises at 18 |
| Retail, 18+ | ~140-160 kr | Plus OB for evenings/weekends |
| Café / restaurant | ~130-160 kr | Plus OB; tipping is not customary in Sweden |
| Fast food | ~130-155 kr | High turnover, frequent vacancies |
| Warehouse / logistics | ~150-180 kr | Often via bemanningsföretag |
| Kommunalt feriejobb | ~80-110 kr | Set by the kommun, not an agreement |
| Babysitting (private) | ~100-150 kr | Informal, no agreement |
| Elderly care cover (summer) | ~140-170 kr | Often needs 18+ |

Add **semesterersättning (12%+)** on a temporary contract, and **OB-tillägg**
for unsocial hours. A young person comparing two jobs on the base rate alone
may be comparing them wrongly.

Monthly salaries: Swedish pay is quoted per MONTH (månadslön), not per year.
A "normal" full-time salary is roughly 28,000-38,000 kr/month depending on the
occupation; the national median is around 37,000 kr/month. Never convert to an
annual figure when talking to a Swedish user — it reads as a foreign number.
`;

export const SWEDISH_TERMINOLOGY = `
## SWEDISH TERMS TO USE AND EXPLAIN

**Education**: grundskola, gymnasium, högskoleförberedande program, yrkesprogram,
lärlingsutbildning, APL (arbetsplatsförlagt lärande), yrkesexamen,
gymnasieexamen, meritvärde, meritpoäng, jämförelsetal, Högskoleprovet,
högskola, universitet, högskolepoäng (hp), kandidatexamen, masterexamen,
civilingenjör, yrkeshögskola (YH), LIA, folkhögskola, Komvux, antagning.se,
antagningspoäng, CSN, studiemedel, studiebidrag.

**Work**: kollektivavtal, fackförbund (union), OB-tillägg, semesterersättning,
arbetsgivarintyg, provanställning (probationary employment), timanställning
(hourly), vikariat (cover), LAS (employment protection), Arbetsförmedlingen,
Platsbanken, feriejobb, personnummer, BankID, A-kassa.

Use the Swedish term and then explain it. A young person who learns the word
"kollektivavtal" can ask their employer about it; one who is told "pay is set
by agreements" cannot.
`;

/** Everything, for a full-context prompt. */
export function getSwedishContextForAI(): string {
  return `
${SWEDISH_LABOR_CONTEXT}

${SWEDISH_EDUCATION_CONTEXT}

${SWEDISH_JOB_MARKET_CONTEXT}

${SWEDISH_SALARY_CONTEXT}

${SWEDISH_TERMINOLOGY}
`.trim();
}

/**
 * Condensed version for the system prompt, where the budget is tight.
 *
 * Keeps the facts a Swedish young person cannot get right by guessing: the
 * age rules, the absence of a minimum wage, feriejobb, the admission routes,
 * and that pay is monthly.
 */
export function getCondensedSwedishContext(): string {
  return `
## KEY SWEDISH FACTS FOR YOUNG PEOPLE

### Age rules (Arbetsmiljölagen / AFS 2012:3)
- 13-15: light work only, max 12 hrs/week in term, guardian consent
- 16-17 (after grundskola): max 40 hrs/week, no work 22:00-06:00, no hazardous work
- 18+: full rights

### Pay
- NO statutory minimum wage — floors come from kollektivavtal per sector
- Quoted MONTHLY (månadslön), not annually. National median ~37,000 kr/month
- Temporary work adds semesterersättning (12%+); evenings/weekends add OB-tillägg
- Youth retail rates ~90-120 kr/hr under 18, ~140-160 kr/hr at 18+

### First jobs
- Most kommuner run feriejobb/sommarjobb for 16-18s — apply January-March
- Platsbanken (Arbetsförmedlingen), Blocket Jobb, and the kommun's own site
- Under ~24,900 kr/year you can be paid without tax deducted (intyg to employer)

### Education
- Gymnasium: högskoleförberedande or yrkesprogram (with APL). A yrkesprogram
  can still give university eligibility — it does not close that door.
- Gy25 replaces course grades with subject grades; first diplomas spring 2028
- Higher ed via antagning.se: meritvärde (max 22.5) OR Högskoleprovet (0-2.00,
  valid 8 years, at least a third of places). Grades are not the only route.
- Yrkeshögskola (YH): 1-2 years, employer-designed, includes LIA placement

Use Swedish terms (kollektivavtal, meritvärde, APL, YH, CSN) and explain them.
`.trim();
}
