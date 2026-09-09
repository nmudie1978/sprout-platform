#!/usr/bin/env tsx
/**
 * Adds the Swedish entries to discipline-buckets.json.
 *
 *   npx tsx scripts/add-sweden-universities.ts
 *
 * The buckets carry `local` universities per Nordic country, but only NO was
 * ever populated — so a Swedish user asking "where would I study this?" got
 * the broad-Europe list and nothing from their own country.
 *
 * These are institution-level associations: which Swedish institutions are
 * known for a field, not a claim about a specific programme or its entry
 * requirements. URLs are institutional homepages, which do not rot the way
 * deep programme links do.
 *
 * Where a university is the wrong answer — trades, beauty, parts of culinary
 * and aviation — the entry names the actual route (yrkeshögskola, gymnasium
 * programmes), mirroring how Norway handles the same buckets with Fagskolen
 * and videregående rather than pretending a university teaches hairdressing.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Uni = { name: string; country: "SE"; city: string; url: string };
const u = (name: string, city: string, url: string): Uni => ({ name, country: "SE", city, url });

const KI = u("Karolinska Institutet", "Stockholm", "https://ki.se");
const UU = u("Uppsala universitet", "Uppsala", "https://www.uu.se");
const LU = u("Lunds universitet", "Lund", "https://www.lu.se");
const KTH = u("Kungliga Tekniska högskolan (KTH)", "Stockholm", "https://www.kth.se");
const CTH = u("Chalmers tekniska högskola", "Göteborg", "https://www.chalmers.se");
const GU = u("Göteborgs universitet", "Göteborg", "https://www.gu.se");
const SU = u("Stockholms universitet", "Stockholm", "https://www.su.se");
const UMU = u("Umeå universitet", "Umeå", "https://www.umu.se");
const LIU = u("Linköpings universitet", "Linköping", "https://liu.se");
const SLU = u("Sveriges lantbruksuniversitet (SLU)", "Uppsala", "https://www.slu.se");
const HHS = u("Handelshögskolan i Stockholm", "Stockholm", "https://www.hhs.se");
const LTU = u("Luleå tekniska universitet", "Luleå", "https://www.ltu.se");
const MAU = u("Malmö universitet", "Malmö", "https://mau.se");
const ORU = u("Örebro universitet", "Örebro", "https://www.oru.se");
const LNU = u("Linnéuniversitetet", "Kalmar/Växjö", "https://lnu.se");
const MIUN = u("Mittuniversitetet", "Östersund/Sundsvall", "https://www.miun.se");
const SH = u("Södertörns högskola", "Stockholm", "https://www.sh.se");
const JU = u("Jönköping University", "Jönköping", "https://ju.se");
const HB = u("Högskolan i Borås", "Borås", "https://www.hb.se");
const BTH = u("Blekinge Tekniska Högskola", "Karlskrona", "https://www.bth.se");
const KONSTFACK = u("Konstfack", "Stockholm", "https://www.konstfack.se");
const KMH = u("Kungliga Musikhögskolan", "Stockholm", "https://www.kmh.se");
const UNIARTS = u("Stockholms konstnärliga högskola", "Stockholm", "https://www.uniarts.se");
const GIH = u("Gymnastik- och idrottshögskolan (GIH)", "Stockholm", "https://www.gih.se");
const FHS = u("Försvarshögskolan", "Stockholm", "https://www.fhs.se");
const MDU = u("Mälardalens universitet", "Västerås/Eskilstuna", "https://www.mdu.se");
const YH = u("Yrkeshögskolan (YH-utbildningar i hela Sverige)", "Hela Sverige", "https://www.yrkeshogskolan.se");
const GYM = u("Gymnasiets yrkesprogram (hela Sverige)", "Hela Sverige", "https://utbildningsguiden.skolverket.se");

const SE_BY_BUCKET: Record<string, Uni[]> = {
  medicine: [KI, UU],
  "nursing-allied-health": [KI, GU],
  dentistry: [KI, MAU],
  pharmacy: [UU, GU],
  // Sweden has a single veterinary faculty, so one entry is the honest answer.
  veterinary: [SLU],
  psychology: [SU, LU],
  "public-health": [KI, UMU],
  "biology-life-sciences": [UU, LU],
  "environmental-earth-science": [SLU, SU],
  "mathematics-physics": [KTH, LU],
  chemistry: [CTH, UU],
  "mechanical-engineering": [CTH, KTH],
  "electrical-engineering": [KTH, CTH],
  "civil-engineering": [KTH, LU],
  "chemical-process-engineering": [CTH, KTH],
  "computer-science-software": [KTH, CTH],
  "data-science-ai": [KTH, LIU],
  cybersecurity: [KTH, BTH],
  "telecom-network": [KTH, BTH],
  architecture: [KTH, CTH],
  "urban-planning": [KTH, BTH],
  law: [UU, LU],
  "criminology-policing": [SU, SH],
  "business-management": [HHS, LU],
  "economics-finance": [HHS, SU],
  accounting: [HHS, GU],
  "marketing-communications": [SU, LU],
  "human-resources": [UU, GU],
  "education-teaching": [GU, UMU],
  "social-work": [GU, LU],
  "humanities-languages": [UU, LU],
  "history-philosophy": [UU, SU],
  "political-science-ir": [UU, LU],
  "journalism-media": [GU, MIUN],
  "creative-arts-design": [KONSTFACK, HB],
  "music-performing-arts": [KMH, UNIARTS],
  "film-animation": [UNIARTS, LTU],
  "sport-science": [GIH, MIUN],
  "tourism-hospitality": [MIUN, GU],
  culinary: [ORU, YH],
  "agriculture-food": [SLU, LU],
  maritime: [CTH, LNU],
  aviation: [LU, MDU],
  "logistics-supplychain": [CTH, JU],
  "geosciences-energy": [LTU, UU],
  "public-administration": [GU, UU],
  "military-defence": [FHS],
  "real-estate": [KTH, MAU],
  // A university is the wrong answer here, exactly as it is in Norway.
  "vocational-trades": [YH, GYM],
  "beauty-wellness": [YH, GYM],
};

const path = join(__dirname, "..", "src", "lib", "education", "data", "discipline-buckets.json");
const file = JSON.parse(readFileSync(path, "utf8")) as {
  buckets: { id: string; label: string; local: Record<string, Uni[]>; europe: unknown[] }[];
};

let added = 0;
const missing: string[] = [];
for (const bucket of file.buckets) {
  const se = SE_BY_BUCKET[bucket.id];
  if (!se) {
    missing.push(bucket.id);
    continue;
  }
  bucket.local = { ...bucket.local, SE: se };
  added += se.length;
}

if (missing.length) {
  console.error(`No Swedish institutions for: ${missing.join(", ")}`);
  process.exitCode = 1;
}

writeFileSync(path, JSON.stringify(file, null, 2) + "\n", "utf8");
console.log(`added ${added} Swedish entries across ${file.buckets.length - missing.length} buckets`);
