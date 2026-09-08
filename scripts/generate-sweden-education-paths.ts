#!/usr/bin/env tsx
/**
 * Fills the Swedish pack's education paths with structural route descriptions.
 *
 *   npx tsx scripts/generate-sweden-education-paths.ts --dry-run
 *   npx tsx scripts/generate-sweden-education-paths.ts
 *
 * Writes the ROUTE ("gymnasium → kandidatexamen, 180 hp"), never a named
 * institution. Route shape is derivable from data we already hold and cannot
 * be wrong about a university it does not name; named programmes are sourced
 * separately for high-traffic careers. See sv/route-templates.ts.
 *
 * Never overwrites a hand-curated path — those name real programmes and are
 * strictly better than a template.
 */
import { CAREER_PATHWAYS, inferEducationRoute } from "../src/lib/career-pathways";
import { getDisciplineForCareer } from "../src/lib/education/alternatives";
import {
  swedishRouteText,
  SV_ROUTE_LABELS,
  SWEDISH_ROUTE_SOURCE,
} from "../src/lib/country-packs/sv/route-templates";
import { readPack, writePack } from "./lib/pack-io";

const dryRun = process.argv.includes("--dry-run");
const pack = readPack("sv");
const today = new Date().toISOString().slice(0, 10);

let added = 0;
let keptCurated = 0;

for (const career of Object.values(CAREER_PATHWAYS).flat()) {
  const existing = pack.careers[career.id];
  if (existing?.educationPath && existing.educationPath.source !== SWEDISH_ROUTE_SOURCE) {
    keptCurated += 1;
    continue;
  }

  // The discipline map already knows what field each career sits in; the
  // Swedish text simply never used it, so every university career read the
  // same. Resolving it here is what turns "followed by a bachelor's degree"
  // into "...typically in nursing and care".
  const discipline = getDisciplineForCareer(career.id);
  const text = swedishRouteText(career.entryRoute, inferEducationRoute(career), discipline);
  pack.careers[career.id] = {
    ...(existing ?? { careerId: career.id }),
    careerId: career.id,
    educationPath: {
      value: text,
      // Structurally sound, not individually verified for this career.
      tier: "estimated",
      source: SWEDISH_ROUTE_SOURCE,
      verifiedAt: today,
    },
  };
  added += 1;
}

pack.routeLabels = { ...SV_ROUTE_LABELS };

const all = Object.values(pack.careers);
pack.meta.generatedAt = new Date().toISOString();
pack.meta.coverage = {
  careers: all.length,
  verified: all.filter(
    (c) => c.salary?.tier === "verified" || c.educationPath?.tier === "verified",
  ).length,
  estimated: all.filter(
    (c) => c.salary?.tier === "estimated" || c.educationPath?.tier === "estimated",
  ).length,
};
if (!pack.meta.sources.includes(SWEDISH_ROUTE_SOURCE)) {
  pack.meta.sources.push(SWEDISH_ROUTE_SOURCE);
}

console.log(`added ${added} route descriptions, kept ${keptCurated} curated paths`);
console.log(`pack now ${pack.meta.coverage.careers} careers`, pack.meta.coverage);

if (dryRun) { console.log("\ndry run — nothing written"); process.exit(0); }
const written = writePack("sv", pack);
console.log(`wrote ${(written.bytes / 1024).toFixed(0)}KB (${written.strings} interned strings)`);
