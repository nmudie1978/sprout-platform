#!/usr/bin/env tsx
/**
 * Caches the SSYK 2012 occupation codes SCB actually publishes salaries for.
 *
 * Committed to the repo so the crosswalk and its tests are offline and
 * deterministic. Re-run only when SCB revises the occupation list (rare —
 * SSYK 2012 is a stable classification).
 *
 *   npx tsx scripts/fetch-scb-occupations.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const TABLE =
  "https://api.scb.se/OV0104/v1/doris/en/ssd/AM/AM0110/AM0110A/LoneSpridSektYrk4AN";

interface PxVariable {
  code: string;
  text: string;
  values: string[];
  valueTexts: string[];
}

async function main() {
  const res = await fetch(TABLE);
  if (!res.ok) throw new Error(`SCB metadata ${res.status}`);
  const meta = (await res.json()) as { variables: PxVariable[] };

  const occ = meta.variables.find((v) => v.code === "Yrke2012");
  if (!occ) throw new Error("Yrke2012 dimension missing — SCB changed the table");

  // "0000" is the all-occupations aggregate, not an occupation.
  const occupations = occ.values
    .map((code, i) => ({ code, label: occ.valueTexts[i].trim() }))
    .filter((o) => o.code !== "0000");

  const years = meta.variables.find((v) => v.code === "Tid");

  const out = {
    source: TABLE,
    fetchedAt: new Date().toISOString().slice(0, 10),
    latestYear: years?.values.at(-1) ?? null,
    occupations,
  };

  writeFileSync(
    join(__dirname, "..", "src", "lib", "career-data", "scb-occupations.generated.json"),
    JSON.stringify(out, null, 2) + "\n",
    "utf8",
  );
  console.log(`${occupations.length} SSYK 2012 occupations, latest year ${out.latestYear}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
