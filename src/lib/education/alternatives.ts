import bucketsData from "./data/discipline-buckets.json";
import mapData from "./data/career-discipline-map.json";
import { resolveCareer } from "./index";

export type EuropeCountry =
  | "NO" | "SE" | "DK" | "FI" | "IS"
  | "NL" | "BE" | "CH" | "DE" | "FR" | "IT" | "ES" | "IE" | "AT" | "GB";

export interface AltUniversity {
  name: string;
  country: EuropeCountry;
  city: string;
  url: string;
  note?: string;
}

export interface DisciplineBucket {
  id: string;
  label: string;
  local: Partial<Record<"NO" | "SE" | "DK" | "FI" | "IS", AltUniversity[]>>;
  europe: AltUniversity[];
}

const buckets: DisciplineBucket[] = (bucketsData as { buckets: DisciplineBucket[] }).buckets;
const bucketById = new Map(buckets.map((b) => [b.id, b]));
const careerMap: Record<string, string> = (mapData as { map: Record<string, string> }).map;

/** careerId (or specialised id, resolved to its base) -> bucket id, or null. */
export function getDisciplineForCareer(careerIdOrTitle: string): string | null {
  const direct = careerMap[careerIdOrTitle];
  if (direct) return direct;
  const base = resolveCareer(careerIdOrTitle);
  return (base && careerMap[base]) ?? null;
}

function bucketFor(careerIdOrTitle: string): DisciplineBucket | null {
  const id = getDisciplineForCareer(careerIdOrTitle);
  return id ? bucketById.get(id) ?? null : null;
}

/** 1-2 named universities in `country` for this career's discipline. */
export function getLocalAlternatives(
  careerIdOrTitle: string,
  country: "NO" | "SE" | "DK" | "FI" | "IS",
): AltUniversity[] {
  return bucketFor(careerIdOrTitle)?.local[country] ?? [];
}

/** 1-2 named broad-Europe universities for this career's discipline. */
export function getEuropeanAlternatives(careerIdOrTitle: string): AltUniversity[] {
  return bucketFor(careerIdOrTitle)?.europe ?? [];
}
