#!/usr/bin/env tsx
/**
 * Fetches Swedish salaries from SCB and merges them into the Swedish pack.
 *
 *   npx tsx scripts/refresh-sweden-salaries.ts            # write
 *   npx tsx scripts/refresh-sweden-salaries.ts --dry-run  # report only
 *
 * Only fills salary fields. Education paths, descriptions and every
 * hand-curated field are left untouched — and a curated salary is NEVER
 * overwritten by a generated one, because a human checked it against a
 * specific source and this script has not.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SCB_SALARY_MAPPING } from "../src/lib/career-data/scb-salary-mapping";
import { formatSekMonthlyRange } from "../src/lib/career-data/format-sek-salary";
import occupations from "../src/lib/career-data/scb-occupations.generated.json";
import type { CountryPack } from "../src/lib/country-packs/types";

const TABLE =
  "https://api.scb.se/OV0104/v1/doris/en/ssd/AM/AM0110/AM0110A/LoneSpridSektYrk4AN";
const MEDIAN = "000007CE";
const P10 = "000007CF";
const P90 = "000007CI";
const BATCH = 60;

const dryRun = process.argv.includes("--dry-run");
const year = occupations.latestYear!;
const packPath = join(__dirname, "..", "src", "lib", "country-packs", "sv", "pack.generated.json");

interface Row { key: string[]; values: string[] }

async function fetchBatch(codes: string[]): Promise<Map<string, number[]>> {
  const res = await fetch(TABLE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: [
        { code: "Sektor", selection: { filter: "item", values: ["0"] } },
        { code: "Yrke2012", selection: { filter: "item", values: codes } },
        { code: "Kon", selection: { filter: "item", values: ["1+2"] } },
        { code: "ContentsCode", selection: { filter: "item", values: [MEDIAN, P10, P90] } },
        { code: "Tid", selection: { filter: "item", values: [year] } },
      ],
      response: { format: "json" },
    }),
  });
  if (!res.ok) throw new Error(`SCB ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as { data: Row[] };

  const out = new Map<string, number[]>();
  for (const row of body.data) {
    const ssyk = row.key[1]; // key order: sector, occupation, sex, year
    const nums = row.values.map((v) => Number(v));
    if (nums.every((n) => Number.isFinite(n) && n > 0)) out.set(ssyk, nums);
  }
  return out;
}

async function main() {
  const codes = [...new Set(SCB_SALARY_MAPPING.map((m) => m.ssykCode))];
  const figures = new Map<string, number[]>();

  for (let i = 0; i < codes.length; i += BATCH) {
    const got = await fetchBatch(codes.slice(i, i + BATCH));
    for (const [k, v] of got) figures.set(k, v);
    console.log(`  ${Math.min(i + BATCH, codes.length)}/${codes.length} occupations`);
  }
  console.log(`SCB returned figures for ${figures.size}/${codes.length} occupations\n`);

  const pack = JSON.parse(readFileSync(packPath, "utf8")) as CountryPack;
  const today = new Date().toISOString().slice(0, 10);
  let added = 0;
  let keptCurated = 0;
  let skipped = 0;

  for (const m of SCB_SALARY_MAPPING) {
    const nums = figures.get(m.ssykCode);
    if (!nums) { skipped += 1; continue; }
    const [median, p10, p90] = nums; // order follows the ContentsCode request

    const existing = pack.careers[m.careerId];
    // Protect HAND-CURATED salaries only — a human checked those against a
    // specific source and this script has not. A salary this script wrote
    // previously (source === the SCB table) must be replaceable, or a
    // corrected crosswalk could never fix a wrong figure already shipped.
    if (existing?.salary && existing.salary.source !== TABLE) {
      keptCurated += 1;
      continue;
    }

    let text: string;
    try {
      text = formatSekMonthlyRange({ p10, p90, median });
    } catch (e) {
      console.warn(`  skipping ${m.careerId}: ${(e as Error).message}`);
      skipped += 1;
      continue;
    }

    pack.careers[m.careerId] = {
      ...(existing ?? { careerId: m.careerId }),
      careerId: m.careerId,
      salary: { value: text, tier: "verified", source: TABLE, verifiedAt: today },
    };
    added += 1;
  }

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
  if (!pack.meta.sources.includes(TABLE)) pack.meta.sources.push(TABLE);

  console.log(
    `added ${added} salaries, kept ${keptCurated} curated, skipped ${skipped}\n` +
      `pack now ${pack.meta.coverage.careers} careers`,
  );

  if (dryRun) { console.log("\ndry run — nothing written"); return; }
  writeFileSync(packPath, JSON.stringify(pack, null, 2) + "\n", "utf8");
console.log(
  "\nNOTE: the pack is now written in its plain, un-interned form. Run\n" +
  "  npx tsx scripts/intern-pack-strings.ts\n" +
  "before committing, or the file re-inflates from ~279KB to ~830KB and\n" +
  "ships that to every browser.",
);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
