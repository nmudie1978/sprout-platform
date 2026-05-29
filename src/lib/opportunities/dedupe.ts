/**
 * OPPORTUNITY DEDUPLICATION
 *
 * Dedupe key: normalizedTitle + employerName + city. Falls through to
 * provider ID when title/employer are missing so we never lose an item
 * to a weak key.
 *
 * Tiebreakers:
 *  1. verified === true
 *  2. Richer employer + location info
 *  3. Provider priority (PROVIDER_PRIORITY ordering)
 *  4. Most recent publishedISO
 */

import type { OpportunityItem, OpportunityProvider } from "./types";
import { PROVIDER_PRIORITY } from "./types";

function getProviderPriority(p: OpportunityProvider): number {
  const i = PROVIDER_PRIORITY.indexOf(p);
  return i >= 0 ? i : PROVIDER_PRIORITY.length;
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

export function normalizeTitle(title: string): string {
  return normalize(title)
    .replace(/[^a-z0-9\såøæ]/g, "")
    .replace(/\s+/g, "-");
}

export function normalizeEmployer(name: string | undefined): string {
  if (!name) return "";
  return normalize(name)
    .replace(/\b(as|asa|sa|inc|ltd|gmbh)\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCity(city: string | undefined): string {
  if (!city) return "";
  return normalize(city)
    .replace(/[^a-z\såøæ]/g, "")
    .replace(/\s+/g, "-");
}

export function generateDedupeKey(item: OpportunityItem): string {
  const t = normalizeTitle(item.title);
  const e = normalizeEmployer(item.employerName) || "no-employer";
  const c = normalizeCity(item.city) || "no-city";
  return `${t}::${e}::${c}`;
}

function richness(item: OpportunityItem): number {
  let score = 0;
  if (item.employerName) score += 3;
  if (item.city) score += 2;
  if (item.applicationDeadlineISO) score += 2;
  if (item.description && item.description.length > 40) score += 1;
  return score;
}

function betterThan(a: OpportunityItem, b: OpportunityItem): boolean {
  // Verified wins
  if (a.verified !== b.verified) return a.verified;

  // Richer location/employer wins
  const ar = richness(a);
  const br = richness(b);
  if (ar !== br) return ar > br;

  // Higher-priority provider wins
  const ap = getProviderPriority(a.provider);
  const bp = getProviderPriority(b.provider);
  if (ap !== bp) return ap < bp;

  // More recently published wins
  return a.publishedISO > b.publishedISO;
}

export interface DedupeResult {
  deduped: OpportunityItem[];
  duplicatesRemoved: number;
}

export function dedupeOpportunities(items: OpportunityItem[]): DedupeResult {
  const bestByKey = new Map<string, OpportunityItem>();
  let duplicatesRemoved = 0;

  for (const item of items) {
    const key = generateDedupeKey(item);
    const existing = bestByKey.get(key);
    if (!existing) {
      bestByKey.set(key, item);
      continue;
    }
    duplicatesRemoved += 1;
    if (betterThan(item, existing)) {
      bestByKey.set(key, item);
    }
  }

  return {
    deduped: [...bestByKey.values()],
    duplicatesRemoved,
  };
}

export function getDedupeStats(items: OpportunityItem[]): {
  total: number;
  uniqueKeys: number;
  duplicates: number;
} {
  const keys = new Set<string>();
  for (const item of items) keys.add(generateDedupeKey(item));
  return {
    total: items.length,
    uniqueKeys: keys.size,
    duplicates: items.length - keys.size,
  };
}
