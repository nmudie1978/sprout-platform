import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { CountryPack, ProvenanceTier } from "../../src/lib/country-packs/types";

/**
 * Read and write a country pack, handling string interning transparently.
 *
 * WHY THIS EXISTS
 * ---------------
 * Packs are stored with repeated strings interned (the Swedish pack is 828KB
 * inflated, 280KB interned, and it ships to the browser). The generators used
 * to JSON.parse the file directly, which worked until interning landed and
 * then failed SILENTLY: `educationPath.source` became undefined, so the
 * "don't overwrite hand-curated data" guard treated every generated row as
 * curated and refused to update any of them. The script reported success and
 * changed nothing.
 *
 * A comment reminding the next person to re-intern was not enough, because
 * the failure was on the READ side. Both directions belong in one place.
 */

interface InternedField {
  v: number;
  t: ProvenanceTier;
  s: number;
  at?: string;
  n?: string;
}

/** The pack as stored: careers hold either plain or interned fields. */
type StoredPack = Omit<CountryPack, "careers"> & {
  strings?: string[];
  careers: Record<string, Record<string, unknown>>;
};

export function packPath(code: string): string {
  return join(__dirname, "..", "..", "src", "lib", "country-packs", code, "pack.generated.json");
}

/** Read a pack in its plain, usable shape regardless of how it is stored. */
export function readPack(code: string): CountryPack {
  const raw = JSON.parse(readFileSync(packPath(code), "utf8")) as StoredPack;
  const strings = raw.strings;
  if (!strings) return raw as unknown as CountryPack;

  for (const career of Object.values(raw.careers)) {
    for (const field of ["salary", "educationPath"] as const) {
      const f = career[field] as InternedField | undefined;
      if (!f || typeof f.v !== "number") continue;
      career[field] = {
        value: strings[f.v],
        tier: f.t,
        source: strings[f.s],
        ...(f.at ? { verifiedAt: f.at } : {}),
        ...(f.n ? { note: f.n } : {}),
      };
    }
  }
  delete raw.strings;
  return raw as unknown as CountryPack;
}

/**
 * Write a pack, interning as it goes.
 *
 * Always interns. A script cannot forget, and the file cannot silently
 * re-inflate to 828KB and start shipping that to every browser again.
 */
export function writePack(code: string, pack: CountryPack): { bytes: number; strings: number } {
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

  const out = JSON.parse(JSON.stringify(pack)) as StoredPack;

  for (const career of Object.values(out.careers)) {
    for (const field of ["salary", "educationPath"] as const) {
      const f = career[field] as
        | { value: string; tier: string; source: string; verifiedAt?: string; note?: string }
        | undefined;
      if (!f?.value) continue;
      career[field] = {
        v: ref(f.value),
        t: f.tier,
        s: ref(f.source),
        ...(f.verifiedAt ? { at: f.verifiedAt } : {}),
        ...(f.note ? { n: f.note } : {}),
      };
    }
  }
  out.strings = strings;

  const json = JSON.stringify(out) + "\n";
  writeFileSync(packPath(code), json, "utf8");
  return { bytes: json.length, strings: strings.length };
}
