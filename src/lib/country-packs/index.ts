/**
 * Country pack registry.
 *
 * Keyed by `YouthProfile.country` display name, exactly like
 * `country-context`. Adding a country is a new directory plus one line here
 * — never a new code path.
 *
 * Packs are imported statically so they are bundled and type-checked; they
 * are small (tens of KB) and read on nearly every career render, so lazy
 * loading would buy nothing but a race.
 */
import esPack from "./es/pack.generated.json";
import svPack from "./sv/pack.generated.json";
import daPack from "./da/pack.generated.json";
import type { CountryPack, PackCareer, ProvenanceTier } from "./types";

export type { CountryPack, PackCareer, Provenanced, ProvenanceTier } from "./types";

/**
 * Packs are stored with their repeated strings interned — see
 * scripts/intern-pack-strings.ts. 1,603 Swedish careers share just 64
 * education-path sentences and one SCB source URL appears 900+ times, so
 * storing values inline cost 688KB, all of which reached the browser because
 * localizeCareer runs in client components.
 *
 * Rehydration happens ONCE per pack at module load and restores the public
 * CountryPack shape exactly, so no consumer knows the file is compressed.
 */
interface InternedField {
  v: number;
  t: ProvenanceTier;
  s: number;
  at?: string;
  n?: string;
}

function rehydrate(raw: unknown): CountryPack {
  const pack = raw as CountryPack & {
    strings?: string[];
    careers: Record<string, Record<string, unknown>>;
  };
  const strings = pack.strings;
  if (!strings) return pack as CountryPack;

  for (const career of Object.values(pack.careers)) {
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
  delete pack.strings;
  return pack as CountryPack;
}

const REGISTRY: Record<string, CountryPack> = {
  Spain: rehydrate(esPack),
  Sweden: rehydrate(svPack),
  Denmark: rehydrate(daPack),
};

/** Every country that has a pack. Norway is deliberately absent — its data is
 *  still native in `career-pathways.ts` until the database follow-on. */
export const PACK_COUNTRIES = Object.keys(REGISTRY);

/**
 * Resolve a country's pack, or null when the country has none (Norway, no
 * country, or an unlaunched country). Never throws.
 */
export function getPack(country?: string | null): CountryPack | null {
  return (country && REGISTRY[country]) || null;
}

/**
 * Resolve one career's overrides for a country.
 *
 * Returns null both when the country has no pack AND when the pack has no
 * entry for that career — callers must distinguish those cases via
 * `getPack()` if it matters, because they mean different things: no pack
 * means "this country is not localised", no entry means "this country is
 * localised but we don't know this career yet", and only the second should
 * suppress the Norwegian fallback.
 */
export function getPackCareer(
  country: string | null | undefined,
  careerId: string,
): PackCareer | null {
  return getPack(country)?.careers[careerId] ?? null;
}

/**
 * The local name for a shared entry-route key — "fagbrev" in Norway,
 * "yrkesexamen" in Sweden. Falls back to the Norwegian key, which is what
 * the copy uses today.
 */
export function getRouteLabel(
  country: string | null | undefined,
  route: string,
): string {
  return getPack(country)?.routeLabels?.[route] ?? route;
}

