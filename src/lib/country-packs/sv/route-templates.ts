/**
 * Swedish education-route templates.
 *
 * These describe the SHAPE of a route through the Swedish system — gymnasium
 * to yrkesexamen, gymnasium to kandidatexamen, and so on. They are structural
 * facts about how Swedish education works, derived from a career's existing
 * `entryRoute` / `educationRoute`, which every career in the catalog resolves
 * to via `inferEducationRoute()`.
 *
 * WHY THIS IS SEPARATE FROM NAMED PROGRAMMES
 * ------------------------------------------
 * "How do I get into this career in Sweden?" has two answers, with very
 * different costs and risks:
 *
 *   1. The route     — "gymnasium (naturvetenskap) → kandidatexamen, 180 hp".
 *                      Derivable from data we already hold. Cannot be wrong
 *                      about a specific institution because it names none.
 *   2. The programme — "civilingenjör i datateknik at KTH".
 *                      Needs sourcing per career, and can be wrong.
 *
 * Splitting them means all 1,615 careers get an honest Swedish route, and only
 * the high-traffic ones need the expensive per-programme sourcing. A long-tail
 * career reads "Gymnasiet följt av högskoleutbildning" — true and useful —
 * rather than a guess about which university, or nothing at all.
 *
 * Every template is tier "estimated": structurally sound, not individually
 * verified for that career.
 */
import type { EducationRoute, EntryRoute } from "@/lib/career-pathways";

/** Where these route descriptions come from. */
export const SWEDISH_ROUTE_SOURCE = "https://www.studera.nu/";

/**
 * Local names for the shared entry-route vocabulary. The routes mean the same
 * thing across the Nordics — vocational upper-secondary certificate, short
 * tertiary vocational college, long professional degree — only the names
 * differ. This is what lets Sweden read "yrkesexamen" where Norway reads
 * "fagbrev" without forking the matching logic.
 */
export const SV_ROUTE_LABELS: Record<EntryRoute, string> = {
  apprenticeship: "lärlingsutbildning",
  fagbrev: "yrkesexamen",
  fagskole: "yrkeshögskola (YH)",
  bachelor: "kandidatexamen",
  master: "masterexamen",
  profesjonsstudium: "lång yrkesexamen",
  "direct-entry": "ingen formell examen",
  certification: "yrkescertifiering",
  "military-academy": "officersprogrammet",
};

/**
 * Fine-grained templates, used when a career carries an explicit `entryRoute`
 * (about 688 of 1,615 careers).
 */
const BY_ENTRY_ROUTE: Record<EntryRoute, string> = {
  apprenticeship:
    "Gymnasiets yrkesprogram med lärlingsutbildning — större delen av utbildningen sker på en arbetsplats (APL) och avslutas med yrkesexamen.",
  fagbrev:
    "Gymnasiets yrkesprogram (3 år) med arbetsplatsförlagt lärande (APL), som leder till yrkesexamen.",
  fagskole:
    "Gymnasiet följt av yrkeshögskola (YH) — en kortare eftergymnasial utbildning på 1–2 år som tas fram tillsammans med arbetsgivare.",
  bachelor:
    "Gymnasiets högskoleförberedande program följt av kandidatexamen (180 högskolepoäng, 3 år) vid högskola eller universitet.",
  master:
    "Gymnasiets högskoleförberedande program följt av kandidatexamen och därefter masterexamen (totalt omkring 5 år).",
  profesjonsstudium:
    "Gymnasiets högskoleförberedande program följt av ett långt yrkesexamensprogram vid universitet (omkring 5–6 år), med legitimation eller yrkesexamen som slutmål.",
  "direct-entry":
    "Ingen formell eftergymnasial utbildning krävs — de flesta börjar direkt och lär sig på arbetsplatsen.",
  certification:
    "Yrkescertifiering och dokumenterad erfarenhet snarare än akademisk examen; kraven sätts oftast av branschen.",
  "military-academy":
    "Ansökan till Försvarsmakten, grundutbildning med värnplikt och därefter officersprogrammet.",
};

/**
 * Coarser templates, used when only the four-value `educationRoute` is known.
 * `inferEducationRoute()` resolves this for every career in the catalog, so
 * there is always a fallback and no career is left without a Swedish route.
 */
const BY_EDUCATION_ROUTE: Record<EducationRoute, string> = {
  university:
    "Gymnasiets högskoleförberedande program följt av högskole- eller universitetsutbildning (kandidatexamen, 180 högskolepoäng, är den vanligaste ingången).",
  vocational:
    "Gymnasiets yrkesprogram (3 år) med arbetsplatsförlagt lärande (APL), som leder till yrkesexamen.",
  mixed:
    "Gymnasiet följt av antingen yrkeshögskola (YH) eller högskoleutbildning — båda vägarna förekommer.",
  "on-the-job":
    "Ingen formell eftergymnasial utbildning krävs — introduktion och upplärning sker på arbetsplatsen.",
  certification:
    "Yrkescertifiering och dokumenterad erfarenhet snarare än akademisk examen; kraven sätts oftast av branschen.",
};

/**
 * The Swedish route description for a career, preferring the finer-grained
 * `entryRoute` when the catalog has one. Total — always returns a string.
 */
export function swedishRouteText(
  entryRoute: EntryRoute | undefined,
  educationRoute: EducationRoute,
): string {
  return (entryRoute && BY_ENTRY_ROUTE[entryRoute]) ?? BY_EDUCATION_ROUTE[educationRoute];
}
