/**
 * Swedish names for the 50 discipline buckets.
 *
 * WHY THIS EXISTS
 * ---------------
 * The generated Swedish education routes described the SHAPE of the route
 * ("Gymnasiets högskoleförberedande program följt av kandidatexamen") without
 * ever saying what the degree would be IN. Norway's equivalents, though also
 * generic, at least name the field: "University degree in biology, ecology or
 * environmental science". That single missing noun is most of why Swedish
 * content read as thinner.
 *
 * `career-discipline-map.json` already assigns a discipline to 1,615 careers,
 * so the field is known — it was simply never used in the Swedish text. This
 * file supplies the Swedish wording for it.
 *
 * Phrased to sit after "inom" ("in"), lower-case, as a field of study is
 * written in Swedish: "en kandidatexamen inom medicin". Not capitalised the
 * way the English labels are — Swedish does not capitalise disciplines.
 */

/** discipline bucket id → Swedish field-of-study name. */
export const SV_DISCIPLINE_NAMES: Record<string, string> = {
  medicine: "medicin",
  "nursing-allied-health": "omvårdnad och vård",
  dentistry: "odontologi",
  pharmacy: "farmaci",
  veterinary: "veterinärmedicin",
  psychology: "psykologi",
  "public-health": "folkhälsovetenskap",
  "biology-life-sciences": "biologi och livsvetenskap",
  "environmental-earth-science": "miljö- och geovetenskap",
  "mathematics-physics": "matematik och fysik",
  chemistry: "kemi",
  "mechanical-engineering": "maskinteknik",
  "electrical-engineering": "elektroteknik",
  "civil-engineering": "samhällsbyggnad och väg- och vattenbyggnad",
  "chemical-process-engineering": "kemiteknik och processteknik",
  "computer-science-software": "datavetenskap och programvaruteknik",
  "data-science-ai": "datavetenskap och AI",
  cybersecurity: "cybersäkerhet",
  "telecom-network": "telekommunikation och nätverk",
  architecture: "arkitektur",
  "urban-planning": "samhällsplanering",
  law: "juridik",
  "criminology-policing": "kriminologi och polisiärt arbete",
  "business-management": "företagsekonomi och ledarskap",
  "economics-finance": "nationalekonomi och finans",
  accounting: "redovisning och revision",
  "marketing-communications": "marknadsföring och kommunikation",
  "human-resources": "personalvetenskap",
  "education-teaching": "pedagogik och lärande",
  "social-work": "socialt arbete",
  "humanities-languages": "humaniora och språk",
  "history-philosophy": "historia och filosofi",
  "political-science-ir": "statsvetenskap och internationella relationer",
  "journalism-media": "journalistik och medier",
  "creative-arts-design": "konst och design",
  "music-performing-arts": "musik och scenkonst",
  "film-animation": "film och animation",
  "sport-science": "idrottsvetenskap",
  "tourism-hospitality": "turism och hotell",
  culinary: "kulinarisk konst",
  "agriculture-food": "lantbruk och livsmedelsvetenskap",
  maritime: "sjöfart",
  aviation: "flyg",
  "logistics-supplychain": "logistik och supply chain",
  "geosciences-energy": "geovetenskap och energi",
  "public-administration": "offentlig förvaltning",
  "military-defence": "militärt försvar",
  "real-estate": "fastighetsvetenskap",
  "vocational-trades": "hantverk och yrkesteknik",
  "beauty-wellness": "skönhet och välbefinnande",
};

/** The Swedish field name for a discipline id, or null if unmapped. */
export function svDisciplineName(disciplineId: string | null): string | null {
  return disciplineId ? SV_DISCIPLINE_NAMES[disciplineId] ?? null : null;
}
