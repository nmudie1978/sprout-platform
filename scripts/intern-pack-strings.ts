#!/usr/bin/env tsx
/**
 * Deduplicates repeated strings inside a country pack.
 *
 *   npx tsx scripts/intern-pack-strings.ts
 *
 * The Swedish pack reached 688KB and — because localizeCareer is used by
 * client components — was shipping to every browser, Norwegian users
 * included. Almost all of it was repetition: 1,603 careers share just 64
 * distinct education-path sentences (800 of them share ONE), most salaries
 * come from ~141 shared occupation codes, and the SCB source URL appeared
 * over 900 times.
 *
 * So the values move into a `strings` table and each field holds an index.
 * `getPack()` rehydrates once at module load, and the public CountryPack
 * shape is unchanged — no consumer knows this happened.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PACKS = ["sv", "es", "da"];

for (const code of PACKS) {
  const path = join(__dirname, "..", "src", "lib", "country-packs", code, "pack.generated.json");
  const pack = JSON.parse(readFileSync(path, "utf8"));
  if (pack.strings) {
    console.log(`${code}: already interned, skipping`);
    continue;
  }

  const strings: string[] = [];
  const index = new Map<string, number>();
  const ref = (v: string): number => {
    let i = index.get(v);
    if (i === undefined) {
      i = strings.length;
      strings.push(v);
      index.set(v, i);
    }
    return i;
  };

  const before = readFileSync(path, "utf8").length;

  for (const career of Object.values(pack.careers) as Record<string, unknown>[]) {
    for (const field of ["salary", "educationPath"] as const) {
      const f = career[field] as
        | { value: string; tier: string; source: string; verifiedAt?: string; note?: string }
        | undefined;
      if (!f) continue;
      career[field] = {
        v: ref(f.value),
        t: f.tier,
        s: ref(f.source),
        ...(f.verifiedAt ? { at: f.verifiedAt } : {}),
        ...(f.note ? { n: f.note } : {}),
      };
    }
    // Descriptions and task lists are per-career, so interning them saves
    // nothing — left as they are.
  }

  pack.strings = strings;
  writeFileSync(path, JSON.stringify(pack) + "\n", "utf8");
  const after = readFileSync(path, "utf8").length;
  console.log(
    `${code}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB ` +
      `(${strings.length} distinct strings, ${(100 - (after / before) * 100).toFixed(0)}% smaller)`,
  );
}
