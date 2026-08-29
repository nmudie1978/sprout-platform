/**
 * Propose advancedCareerMap entries for careers that currently resolve to no
 * study path.
 *
 * A career's `educationPath` string is the signal — it is populated for every
 * career in the catalogue and usually names the degree and the Norwegian
 * institutions outright ("Master's in Geology (UiO / UiB / NTNU)"). This
 * matches that text against the 37 base careers that actually hold programme
 * rows.
 *
 * This script PROPOSES; it does not write. Every proposal is reviewed before
 * anything lands in programmes.json, because a wrong mapping tells a young
 * person to study the wrong subject — worse than telling them nothing.
 *
 * Run: npx tsx scripts/propose-career-base-mappings.ts [--unmatched]
 */

import { getAllCareers, getCategoryForCareer } from "../src/lib/career-pathways";
import { getCareerRequirements, getProgrammesForCareer } from "../src/lib/education";
import { hasDetailedContent } from "../src/lib/career-typical-days";

/**
 * Ordered rules — FIRST match wins, so the list runs most-specific first.
 * `test` is matched against "<title> ||| <educationPath>", lowercased.
 */
interface Rule {
  base: string;
  test: RegExp;
  /** Guards against a broader earlier concept stealing the match. */
  not?: RegExp;
}

const RULES: Rule[] = [
  // ── Medicine: a named specialisation on top of the medical degree ────
  { base: "doctor", test: /\b(medical degree|medicine|medisin|läkar|cand\.?med)\b/, not: /veterinar|dental|dentis/ },
  { base: "doctor", test: /\b(physician|surgeon|-ologist)\b.*\bspecialis/ },

  // ── Dentistry / veterinary — distinct professional degrees ───────────
  { base: "dentist", test: /\bdent(al|istry)\b/, not: /assistant|hygienist|technician/ },
  { base: "dental-assistant", test: /\bdental\b.*\b(assistant|hygienist|technician|secretary)\b/ },
  { base: "veterinarian", test: /\bveterinar/ },

  // ── Allied health ────────────────────────────────────────────────────
  { base: "nurse", test: /\bnursing|sykepleie|sjukskötersk/ },
  { base: "physiotherapist", test: /\bphysiotherap|fysioterapi/ },
  { base: "speech-therapist", test: /\bspeech (and language )?(therap|patholog)|logopedi/ },
  { base: "optometrist", test: /\boptometr|optiker/ },
  { base: "radiologic-technologist", test: /\bradiograph|radiologic|stråleterapi/ },
  { base: "medical-laboratory-technician", test: /\bbiomedical laborator|bioingeniør|medical laborator/ },
  { base: "care-assistant", test: /\bhelsefagarbeider|care (assistant|worker)|healthcare assistant/ },

  // ── Psychology / social ──────────────────────────────────────────────
  { base: "psychologist", test: /\bpsycholog|psykolog/, not: /psychiatr/ },
  { base: "social-worker", test: /\bsocial work|sosionom|barnevernspedagog/ },

  // ── Law ──────────────────────────────────────────────────────────────
  { base: "lawyer", test: /\b(law degree|master'?s? in law|rettsvitenskap|jurist|juridicum|llm|llb)\b/ },
  { base: "lawyer", test: /\blaw\b/, not: /law enforcement|by-?law/ },

  // ── Policing / security services ─────────────────────────────────────
  { base: "police-officer", test: /\bpolice (academy|college|university|training)|politihøgskolen|politiutdanning/ },

  // ── Engineering — specific disciplines before the generic base ───────
  { base: "civil-engineer", test: /\bcivil engineer|structural engineer|byggingeniør|construction engineer/ },
  { base: "mechanical-engineer", test: /\bmechanical engineer|maskiningeniør/ },
  { base: "architect", test: /\barchitect(ure)?\b/, not: /software architect|solution architect|data architect|enterprise architect|cloud architect|network architect|security architect|systems architect/ },
  { base: "engineer", test: /\b(engineering|sivilingeniør|ingeniør)\b/, not: /software engineer|data engineer|ml engineer|machine learning engineer|devops|platform engineer|security engineer|prompt engineer|reverse engineer/ },

  // ── Computing ────────────────────────────────────────────────────────
  { base: "data-analyst", test: /\b(data science|data scientist|statistics|statistik|machine learning|ml\b|artificial intelligence|analytics|datavitenskap)\b/ },
  { base: "software-developer", test: /\b(computer science|informatikk|software (engineering|development)|datateknologi|programming|cybersecurity|information security)\b/ },
  { base: "it-engineer", test: /\b(information technology|informasjonsteknologi|it engineering|network engineering|systems administration)\b/ },

  // ── Natural sciences ─────────────────────────────────────────────────
  { base: "biologist", test: /\b(biolog|zoolog|botan|ecolog|marine science|genetics|genomic|microbiolog|biovitenskap|life science)\b/ },
  { base: "chemist", test: /\b(chemistr|kjemi|geochem|biochemistr)\b/ },

  // ── Economics, finance, business ─────────────────────────────────────
  { base: "accountant", test: /\b(accounting|revisor|regnskap|auditing)\b/ },
  { base: "economist", test: /\b(economics|economic|finance|financial|business administration|mba|siviløkonom|økonomi|handelshøyskole|management)\b/ },

  // ── Education ────────────────────────────────────────────────────────
  { base: "preschool-teacher", test: /\b(preschool|kindergarten|barnehagelærer|early years)\b/ },
  { base: "teacher", test: /\b(teacher (training|education)|lærerutdanning|lektor|pedagog|teaching qualification|pgce)\b/ },

  // ── Language ─────────────────────────────────────────────────────────
  { base: "interpreter", test: /\binterpret(er|ing)|tolk\b/ },
  { base: "linguist", test: /\b(linguistic|translation|philolog|språk)\b/ },

  // ── Creative ─────────────────────────────────────────────────────────
  { base: "designer", test: /\b(design|industridesign)\b/, not: /design pattern/ },

  // ── Aviation / maritime ──────────────────────────────────────────────
  { base: "airline-pilot", test: /\b(pilot|flight (school|training)|atpl)\b/, not: /helicopter/ },
  { base: "helicopter-pilot", test: /\bhelicopter\b/ },

  // ── Trades ───────────────────────────────────────────────────────────
  { base: "electrician", test: /\belectric(al|ian)\b.*\b(apprentice|fagbrev|vocational|trade)\b/ },
  { base: "welder", test: /\bwelding|sveis/ },
  { base: "carpenter", test: /\bcarpentr|tømrer/ },
  { base: "chef", test: /\b(culinary|chef|kokk)\b/ },
  { base: "hairdresser", test: /\bhairdress|frisør|barber/ },
];

interface Proposal {
  id: string;
  title: string;
  base: string | null;
  edu: string;
  cat: string;
}

function classify(title: string, edu: string): string | null {
  const hay = `${title} ||| ${edu}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.test.test(hay) && !(rule.not && rule.not.test(hay))) return rule.base;
  }
  return null;
}

function main() {
  const hollow = getAllCareers().filter(
    (c) =>
      getProgrammesForCareer(c.id).length === 0 &&
      !getCareerRequirements(c.id) &&
      !hasDetailedContent(c.id)
  );

  const proposals: Proposal[] = hollow.map((c) => ({
    id: c.id,
    title: c.title,
    edu: c.educationPath ?? "",
    cat: getCategoryForCareer(c.id) ?? "?",
    base: classify(c.title, c.educationPath ?? ""),
  }));

  if (process.argv.includes("--unmatched")) {
    const un = proposals.filter((p) => !p.base);
    console.log(`${un.length} unmatched of ${proposals.length}\n`);
    for (const p of un) console.log(`  ${p.title.padEnd(44)} | ${p.edu.slice(0, 94)}`);
    return;
  }

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(proposals, null, 1));
    return;
  }

  const byBase = new Map<string, Proposal[]>();
  for (const p of proposals) {
    if (!p.base) continue;
    const list = byBase.get(p.base) ?? [];
    list.push(p);
    byBase.set(p.base, list);
  }

  const matched = proposals.filter((p) => p.base).length;
  console.log(`${matched} of ${proposals.length} hollow careers matched a base (${proposals.length - matched} unmatched)\n`);

  for (const [base, list] of [...byBase.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n═══ ${base} — ${list.length} careers ═══`);
    for (const p of list) {
      console.log(`  ${p.title.slice(0, 42).padEnd(44)} | ${p.edu.slice(0, 88)}`);
    }
  }
}

main();
