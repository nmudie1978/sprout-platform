/**
 * Adds curated `advancedCareerMap` entries to programmes.json, giving careers
 * that currently resolve to no study path a real, named route.
 *
 * Every entry below is hand-checked against the career's own `educationPath`
 * text. Nothing here was auto-generated: a wrong mapping tells a young person
 * to study the wrong subject, which is worse than telling them nothing.
 *
 * Three kinds of entry:
 *
 *   1. SPECIALISATION — the career is a named specialisation on top of one of
 *      the 37 base degrees. The note names the actual Norwegian route.
 *      (Gynaecologist → doctor; Police Dog Handler → police-officer.)
 *
 *   2. FOUNDATION — the base degree is a genuine, if broader, starting point.
 *      The note says so honestly rather than implying an exact match.
 *      (Plant Geneticist → biologist.)
 *
 *   3. PROGRESSION — a senior role nobody studies for directly. The base is
 *      the usual foundation, and the note LEADS with "no direct route", so the
 *      UI never implies a degree gets you the job.
 *      (Chief AI Officer → data-analyst.)
 *
 * Idempotent: re-running overwrites only the ids listed here and never touches
 * an entry that already existed.
 *
 * Run: npx tsx scripts/apply-career-base-mappings.ts [--dry]
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface Entry {
  baseCareerId: string;
  specialisationNote: string;
}

const PROGRAMMES_PATH = join(process.cwd(), "src/lib/education/data/programmes.json");

/** Shorthand for the many medical specialisations that share one route. */
function med(specialisation: string, norsk?: string): Entry {
  return {
    baseCareerId: "doctor",
    specialisationNote: `${specialisation} is a medical specialisation. Complete the 6-year medical degree (profesjonsstudium i medisin) + LIS1, then specialist training${norsk ? ` in ${norsk}` : ""}.`,
  };
}

/** Shorthand for the Politihøgskolen routes. */
function politi(training: string): Entry {
  return {
    baseCareerId: "police-officer",
    specialisationNote: `Reached from the police service. Complete the 3-year bachelor at Politihøgskolen, serve as a police officer, then ${training}.`,
  };
}

const MAPPINGS: Record<string, Entry> = {
  // ══ Medicine — specialisation on top of the medical degree ══════════
  gynaecologist: med("Gynaecology", "fødselshjelp og kvinnesykdommer (obstetrics & gynaecology), about 6 years"),
  "reproductive-endocrinologist": med("Reproductive endocrinology", "obstetrics & gynaecology, then a reproductive-medicine subspecialty"),
  "maternal-fetal-medicine-specialist": med("Maternal-fetal medicine", "obstetrics & gynaecology, then a maternal-fetal subspecialty"),
  urogynaecologist: med("Urogynaecology", "obstetrics & gynaecology, then a urogynaecology subspecialty"),
  "gynaecological-oncologist": med("Gynaecological oncology", "obstetrics & gynaecology, then a gynaecological-oncology subspecialty"),
  "menopause-specialist": med("Menopause medicine", "obstetrics & gynaecology or endocrinology, plus menopause-care training"),
  "sexual-health-physician": med("Sexual health medicine", "genitourinary / sexual and reproductive health medicine"),
  "family-planning-specialist": med("Family planning", "obstetrics & gynaecology or community sexual and reproductive health"),
  "womens-health-physician": med("Women's health medicine", "general practice or community medicine, with a women's-health focus"),
  "adolescent-medicine-specialist": med("Adolescent medicine", "paediatrics or general practice, plus adolescent-medicine training"),
  "preventive-medicine-physician": med("Preventive medicine", "samfunnsmedisin (public health / community medicine)"),
  andrologist: med("Andrology", "urology or endocrinology, plus andrology training"),
  "internal-medicine-physician": med("Internal medicine", "indremedisin, about 5–6 years"),
  oncologist: med("Oncology", "onkologi, about 5–6 years"),
  endocrinologist: med("Endocrinology", "endokrinologi, about 5–6 years"),
  rheumatologist: med("Rheumatology", "revmatologi, about 5–6 years"),
  "infectious-disease-specialist": med("Infectious diseases", "infeksjonsmedisin, about 5–6 years"),
  "intensive-care-physician": med("Intensive care medicine", "anestesiologi (anaesthesiology and intensive care)"),
  "occupational-health-physician": med("Occupational medicine", "arbeidsmedisin"),
  "sports-medicine-physician": med("Sports medicine", "a sports-medicine specialisation, usually after general practice or orthopaedics"),
  "clinical-geneticist": med("Clinical genetics", "medisinsk genetikk"),
  "medical-geneticist": med("Medical genetics", "medisinsk genetikk"),

  // Medicine OR a biomedical master's — the note has to carry both.
  "genomic-medicine-specialist": {
    baseCareerId: "doctor",
    specialisationNote:
      "Two routes: the 6-year medical degree + LIS1 and a medical-genetics specialisation, or a biomedical master's/PhD followed by genomic-medicine training.",
  },
  "reproductive-genetic-specialist": {
    baseCareerId: "doctor",
    specialisationNote:
      "Two routes: the medical degree plus specialisation, or a biomedical master's followed by reproductive-genetics training.",
  },
  "precision-medicine-specialist": {
    baseCareerId: "doctor",
    specialisationNote:
      "Two routes: the medical degree plus specialisation, or a biomedical master's followed by precision-medicine training.",
  },

  // ══ Police — Politihøgskolen plus in-service specialisation ═════════
  "roads-policing-officer": politi("take roads-policing training"),
  "police-dog-handler": politi("apply for K9 handler training"),
  "armed-response-officer": politi("qualify through firearms and tactical training (UEH)"),
  "public-order-officer": politi("take public-order (UEH) training"),
  "organized-crime-investigator": politi("specialise in organised crime"),
  "drug-enforcement-investigator": politi("specialise in narcotics"),
  "human-trafficking-investigator": politi("take specialist trafficking training"),
  "surveillance-officer": politi("take covert-surveillance training"),
  "undercover-officer": politi("take covert-operations training"),
  "hostage-negotiator": politi("train in crisis negotiation"),
  "counter-terrorism-officer": politi("move into the security service (PST) with specialist training"),
  "crime-scene-investigator": {
    baseCareerId: "police-officer",
    specialisationNote:
      "Two routes: Politihøgskolen followed by kriminalteknikk (crime-scene) training, or a forensic-science degree into a police forensic unit.",
  },
  "close-protection-officer": {
    baseCareerId: "police-officer",
    specialisationNote:
      "Usually Politihøgskolen or a military background, then livvakt (close-protection) selection and training.",
  },
  "border-force-officer": {
    baseCareerId: "police-officer",
    specialisationNote:
      "Customs and border training, or the Politihøgskolen route. A relevant bachelor's helps but is not required.",
  },

  // ══ Life sciences — a biology degree is the genuine foundation ══════
  geneticist: {
    baseCareerId: "biologist",
    specialisationNote:
      "Start with a bachelor's in biology or biovitenskap, then a master's/PhD in genetics or molecular biology.",
  },
  "genomics-research-scientist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology or biovitenskap bachelor's, then a master's/PhD in genomics, genetics or bioinformatics.",
  },
  "human-genetics-researcher": {
    baseCareerId: "biologist",
    specialisationNote: "Biology bachelor's, then a master's/PhD in human genetics.",
  },
  "population-geneticist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology bachelor's, then a master's/PhD in population genetics or evolutionary biology.",
  },
  "epigenetics-researcher": {
    baseCareerId: "biologist",
    specialisationNote: "Biology bachelor's, then a master's/PhD in epigenetics or molecular biology.",
  },
  "crispr-research-scientist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology bachelor's, then a master's/PhD in molecular biology, genetics or bioengineering.",
  },
  "gene-editing-scientist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology bachelor's, then a master's/PhD in molecular biology, genetics or bioengineering.",
  },
  "plant-geneticist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology or plant-science bachelor's, then a master's/PhD in plant genetics or botany. NMBU is the main Norwegian route.",
  },
  "animal-geneticist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology or animal-science bachelor's, then a master's/PhD in animal genetics. NMBU is the main Norwegian route.",
  },
  "agricultural-geneticist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology or agricultural-science bachelor's, then a master's/PhD in agricultural science or genetics (NMBU).",
  },
  "conservation-geneticist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology bachelor's, then a master's/PhD in conservation genetics or ecology.",
  },
  "longevity-research-scientist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology bachelor's, then a master's/PhD in biology, genetics or biomedical science.",
  },
  "clinical-laboratory-geneticist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology or biomedical bachelor's, then a master's/PhD plus clinical laboratory genetics training.",
  },
  "crime-laboratory-geneticist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology bachelor's, then a master's/PhD in genetics or forensic science, into a forensic laboratory.",
  },
  zoologist: {
    baseCareerId: "biologist",
    specialisationNote:
      "Start with a bachelor's in biology or biovitenskap, then a master's in zoology (UiO / NTNU / NMBU).",
  },
  botanist: {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology or biovitenskap bachelor's, then a master's in botany or plant science (NMBU / UiO / UiB).",
  },
  ecologist: {
    baseCareerId: "biologist",
    specialisationNote: "Biology bachelor's, then a master's in ecology or environmental biology.",
  },
  oceanographer: {
    baseCareerId: "biologist",
    specialisationNote:
      "A biology or geoscience bachelor's, then a master's/PhD in oceanography or marine science (UiB / UiT / NTNU).",
  },
  "conservation-scientist": {
    baseCareerId: "biologist",
    specialisationNote:
      "Biology or environmental-science bachelor's, then a master's in conservation or environmental science (NMBU / UiB / UiT).",
  },

  // ══ Chemistry ══════════════════════════════════════════════════════
  geochemist: {
    baseCareerId: "chemist",
    specialisationNote:
      "A chemistry (kjemi) or geoscience bachelor's, then a master's/PhD in geochemistry (UiO / UiB / NTNU).",
  },
  "forensic-toxicologist": {
    baseCareerId: "chemist",
    specialisationNote:
      "A chemistry or pharmacy bachelor's, then a master's in toxicology or forensic science, into a forensic laboratory.",
  },

  // ══ Law — rettsvitenskap is the single gate ════════════════════════
  solicitor: {
    baseCareerId: "lawyer",
    specialisationNote:
      "The 5-year master i rettsvitenskap, then supervised practice and admission (advokatbevilling).",
  },
  barrister: {
    baseCareerId: "lawyer",
    specialisationNote:
      "The 5-year master i rettsvitenskap, then advocacy training and admission. Norway has no split profession — advokat covers both roles.",
  },
  magistrate: {
    baseCareerId: "lawyer",
    specialisationNote:
      "The 5-year master i rettsvitenskap, then several years in practice before judicial appointment.",
  },
  "tribunal-judge": {
    baseCareerId: "lawyer",
    specialisationNote:
      "The 5-year master i rettsvitenskap, then specialist legal experience before appointment to a tribunal.",
  },
  "esg-counsel": {
    baseCareerId: "lawyer",
    specialisationNote: "The 5-year master i rettsvitenskap, specialising in ESG and sustainability law.",
  },
  "ai-regulation-specialist": {
    baseCareerId: "lawyer",
    specialisationNote:
      "Usually a master i rettsvitenskap or a technology-policy master's, then AI-regulation specialisation (EU AI Act, standards work).",
  },
  "ai-compliance-officer": {
    baseCareerId: "lawyer",
    specialisationNote:
      "A law, compliance or informatics degree, then compliance experience with an AI-governance focus.",
  },
  "trademark-attorney": {
    baseCareerId: "lawyer",
    specialisationNote:
      "A law or relevant technical degree, then the trademark attorney qualification.",
  },
  "patent-attorney": {
    baseCareerId: "lawyer",
    specialisationNote:
      "Unusually, this starts with a science or engineering degree, then the European Qualifying Examination for patent attorneys — not a law degree.",
  },

  // ══ Finance — NHH / BI plus CFA is the recognised route ════════════
  "portfolio-manager": {
    baseCareerId: "economist",
    specialisationNote:
      "A master's in finance or economics (NHH, BI), then CFA and several years as an analyst before managing a portfolio.",
  },
  "fund-manager": {
    baseCareerId: "economist",
    specialisationNote:
      "A master's in finance or economics (NHH, BI), then CFA and several years as an analyst.",
  },
  "asset-manager": {
    baseCareerId: "economist",
    specialisationNote:
      "A master's in finance or economics (NHH, BI), then CFA and about 7 years in investment management.",
  },
  "pension-fund-manager": {
    baseCareerId: "economist",
    specialisationNote:
      "A master's in finance, economics or actuarial science (NHH, BI, UiO), then CFA and long-horizon investment experience.",
  },
  "private-banker": {
    baseCareerId: "economist",
    specialisationNote:
      "A bachelor's or master's in finance, economics or business (NHH, BI), plus the authorised financial adviser qualification.",
  },
  "capital-markets-adviser": {
    baseCareerId: "economist",
    specialisationNote:
      "A master's in finance or economics (NHH, BI), then CFA and investment-banking or markets experience.",
  },
  "structured-finance-specialist": {
    baseCareerId: "economist",
    specialisationNote:
      "A master's in finance, economics or a quantitative field (NHH, BI, NTNU), then CFA and structured-finance experience.",
  },
  "health-economist": {
    baseCareerId: "economist",
    specialisationNote:
      "An economics bachelor's, then a master's in health economics or public health.",
  },
  "tax-adviser": {
    baseCareerId: "economist",
    specialisationNote:
      "A master's in economics, accounting or law (NHH, BI, UiO) specialising in tax, plus professional certification.",
  },

  // ══ Engineering — a real engineering degree is the route ═══════════
  "building-services-engineer": {
    baseCareerId: "engineer",
    specialisationNote:
      "A master's in energy and environmental / building services engineering (NTNU), or an engineering bachelor's plus specialisation.",
  },
  "fire-engineer": {
    baseCareerId: "engineer",
    specialisationNote:
      "A master's in fire safety engineering — Høgskulen på Vestlandet (HVL) runs the main Norwegian programme.",
  },
  "solar-energy-engineer": {
    baseCareerId: "engineer",
    specialisationNote:
      "A bachelor's or master's in electrical, energy or renewable engineering, then solar specialisation.",
  },
  "battery-storage-engineer": {
    baseCareerId: "engineer",
    specialisationNote:
      "A bachelor's or master's in electrochemistry, materials or electrical engineering.",
  },
  "ev-infrastructure-engineer": {
    baseCareerId: "engineer",
    specialisationNote: "A bachelor's or master's in electrical or energy engineering.",
  },
  "environmental-engineer": {
    baseCareerId: "engineer",
    specialisationNote:
      "A master's in environmental, civil or chemical engineering (sivilingeniør at NTNU, or an engineering bachelor's plus master's).",
  },
  "architectural-technologist": {
    baseCareerId: "engineer",
    specialisationNote:
      "A bachelor's in architectural technology or building engineering (OsloMet) — an engineering route, not the architect's professional degree.",
  },
  "bim-coordinator": {
    baseCareerId: "civil-engineer",
    specialisationNote:
      "A bachelor's in civil or building engineering (OsloMet), plus BIM tooling experience.",
  },

  // ══ Computing ═════════════════════════════════════════════════════
  "llm-engineer": {
    baseCareerId: "software-developer",
    specialisationNote:
      "A bachelor's/master's in computer science, machine learning or data science, then hands-on work with large language models.",
  },
  "feature-engineering-specialist": {
    baseCareerId: "data-analyst",
    specialisationNote:
      "A bachelor's/master's in computer science, data science or statistics (datavitenskap).",
  },
  "analytics-engineer": {
    baseCareerId: "data-analyst",
    specialisationNote:
      "A bachelor's in data science, statistics or computer science, then analytics-engineering experience.",
  },
  "gpu-infrastructure-engineer": {
    baseCareerId: "software-developer",
    specialisationNote:
      "A bachelor's/master's in computer science or computer engineering, then systems and GPU-infrastructure experience.",
  },
  "security-intelligence-researcher": {
    baseCareerId: "software-developer",
    specialisationNote:
      "A computer science or cybersecurity degree, then deep reverse-engineering and threat-research experience.",
  },
  "autonomous-workflow-designer": {
    baseCareerId: "software-developer",
    specialisationNote:
      "A bachelor's/master's in informatics or computer science, then process-automation experience.",
  },
  "ai-governance-specialist": {
    baseCareerId: "software-developer",
    specialisationNote:
      "Several routes: a law, informatics, computer science or public-policy degree, then AI-governance experience.",
  },

  // ══ Design ════════════════════════════════════════════════════════
  "product-designer": {
    baseCareerId: "designer",
    specialisationNote:
      "A design bachelor's or master's (AHO, Konstfack, KADK), specialising in product or digital design.",
  },
  "game-designer": {
    baseCareerId: "designer",
    specialisationNote:
      "A design or interactive-media degree, or a games-specific programme, plus a portfolio of playable work.",
  },
  "exhibit-designer": {
    baseCareerId: "designer",
    specialisationNote: "A design bachelor's or master's, specialising in spatial or exhibition design.",
  },

  // ══ Progression roles — no direct route, and the note says so ═════
  "chief-ai-officer": {
    baseCareerId: "data-analyst",
    specialisationNote:
      "No direct route — this is an executive role reached after 12+ years. The usual foundation is a master's or PhD in computer science or data science, then progression through AI/data leadership.",
  },
  "director-of-ai": {
    baseCareerId: "data-analyst",
    specialisationNote:
      "No direct route — reached after 10+ years. Foundation is a master's in computer science, data science or engineering, then AI team leadership.",
  },
  "chief-executive-officer": {
    baseCareerId: "economist",
    specialisationNote:
      "No direct route — reached after extensive leadership experience. A business or economics degree is the most common foundation, but far from the only one.",
  },
  "chief-operating-officer": {
    baseCareerId: "economist",
    specialisationNote:
      "No direct route — reached after senior operational leadership. A business, operations or engineering degree is the usual foundation.",
  },
  "chief-commercial-officer": {
    baseCareerId: "economist",
    specialisationNote:
      "No direct route — reached after 15+ years in commercial leadership. A master's in business or economics is the usual foundation.",
  },
  "chief-risk-officer": {
    baseCareerId: "economist",
    specialisationNote:
      "No direct route — reached after 15+ years in risk. Foundation is a master's in finance, economics or a quantitative field (NHH, BI, UiO).",
  },
  "chief-investment-officer": {
    baseCareerId: "economist",
    specialisationNote:
      "No direct route — reached after 15+ years managing portfolios. Foundation is a master's in finance or economics (NHH, BI) plus CFA.",
  },
  "chief-compliance-officer": {
    baseCareerId: "lawyer",
    specialisationNote:
      "No direct route — reached after 12+ years in compliance or regulation. Foundation is a master's in law, finance or business (UiO, NHH, BI).",
  },
  "private-equity-partner": {
    baseCareerId: "economist",
    specialisationNote:
      "No direct route — reached after 12+ years in investing or banking. Foundation is a master's in finance or economics.",
  },
  "law-firm-partner": {
    baseCareerId: "lawyer",
    specialisationNote:
      "No direct route — partnership follows 10+ years of practice. The gate is the 5-year master i rettsvitenskap plus admission.",
  },
  "distinguished-engineer": {
    baseCareerId: "software-developer",
    specialisationNote:
      "No direct route — this is a technical seniority grade reached after 15+ years. Foundation is a computer science degree.",
  },
  "genomics-director": {
    baseCareerId: "biologist",
    specialisationNote:
      "No direct route — reached after senior research leadership. Foundation is a PhD in genomics or a medical degree.",
  },
  "pharmaceutical-research-director": {
    baseCareerId: "biologist",
    specialisationNote:
      "No direct route — reached after senior pharma R&D experience. Foundation is a PhD in a life science or a medical degree.",
  },
};

function main() {
  const dry = process.argv.includes("--dry");
  const raw = readFileSync(PROGRAMMES_PATH, "utf8");
  const data = JSON.parse(raw) as {
    advancedCareerMap: Record<string, Entry>;
    [k: string]: unknown;
  };

  const before = Object.keys(data.advancedCareerMap).length;
  let added = 0;
  let overwritten = 0;
  const collisions: string[] = [];

  for (const [id, entry] of Object.entries(MAPPINGS)) {
    if (data.advancedCareerMap[id]) {
      // Never silently change an existing curated mapping.
      collisions.push(id);
      overwritten += 1;
      continue;
    }
    data.advancedCareerMap[id] = entry;
    added += 1;
  }

  console.log(`advancedCareerMap: ${before} → ${before + added} (+${added})`);
  if (collisions.length) {
    console.log(`skipped ${overwritten} ids that already had a mapping: ${collisions.join(", ")}`);
  }

  const byBase = new Map<string, number>();
  for (const e of Object.values(MAPPINGS)) {
    byBase.set(e.baseCareerId, (byBase.get(e.baseCareerId) ?? 0) + 1);
  }
  console.log("\nby base:");
  for (const [b, n] of [...byBase.entries()].sort((a, b2) => b2[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}  ${b}`);
  }

  if (dry) {
    console.log("\n--dry: nothing written.");
    return;
  }

  // Preserve the file's 2-space formatting and trailing newline.
  writeFileSync(PROGRAMMES_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`\nwrote ${PROGRAMMES_PATH}`);
}

main();
