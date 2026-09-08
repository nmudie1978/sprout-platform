#!/usr/bin/env tsx
/**
 * COUNTRY PACK SOURCE VALIDATION
 *
 * Usage:
 *   npx tsx scripts/validate-country-packs.ts
 *   npx tsx scripts/validate-country-packs.ts --country=Sweden
 *   npx tsx scripts/validate-country-packs.ts --verbose
 *
 * Checks that every `verified` figure in every country pack still points at a
 * source URL that resolves. A verified figure whose source has rotted is no
 * longer verified — it is an unattributed claim about a teenager's future
 * earnings, which is precisely what the two-tier provenance model exists to
 * prevent.
 *
 * Deliberately NOT part of `npm run build`. Following the same reasoning as
 * scripts/validate-programmes.ts: build-time network calls make builds flaky
 * and fail closed on transient outages. Structural integrity (ids resolve, no
 * duplicates, coverage counts honest, sources are https) is asserted offline
 * by src/lib/country-packs/__tests__/pack-integrity.test.ts, which DOES run in
 * CI on every commit. This script runs on a schedule.
 *
 * Safety: if more than half the sources in a pack come back broken, abort
 * rather than report — that is a network problem, not data rot.
 */
import { getPack, PACK_COUNTRIES } from "../src/lib/country-packs";
import type { PackCareer, Provenanced } from "../src/lib/country-packs/types";
import { looksLikeSoftNotFound } from "../src/lib/validation/soft-404";

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const onlyCountry = args.find((a) => a.startsWith("--country="))?.split("=")[1];

const CONCURRENCY = 8;
const TIMEOUT_MS = 15_000;
const ABORT_THRESHOLD = 0.5;

interface Check {
  country: string;
  careerId: string;
  field: "salary" | "educationPath";
  url: string;
  ok: boolean;
  status: number | string;
}

async function head(
  url: string,
): Promise<{
  ok: boolean;
  status: number | string;
  blocked?: boolean;
  unreachable?: boolean;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // HEAD alone cannot see a soft 404 — a page that returns 200 while
    // saying it does not exist. antagning.se does exactly that, so any
    // 2xx has to be confirmed by reading the start of the body.
    let res = await fetch(url, { method: "HEAD", signal: controller.signal, redirect: "follow" });
    if (res.status === 405 || res.status === 501 || res.status < 300) {
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
      });
      if (res.status < 300) {
        const body = await res.text();
        if (looksLikeSoftNotFound(body)) {
          return { ok: false, status: "soft-404" };
        }
      }
    }
    // Only 404/410 prove a source is gone. Everything else that produced an
    // HTTP response means the server answered: 403 is usually bot-blocking,
    // and 400 is what a POST-only API endpoint returns to a bare GET — the
    // SCB salary table does exactly that. Treating those as dead would have
    // condemned 854 perfectly good citations.
    const gone = res.status === 404 || res.status === 410;
    return { ok: !gone, status: res.status, blocked: res.status >= 400 };
  } catch (err) {
    // A timeout, DNS failure or refused connection is INCONCLUSIVE, not proof
    // of death. Reporting it as dead would push someone to demote a perfectly
    // good citation because a university server was slow, which is exactly
    // the wrong direction: it converts a verified figure into an estimated
    // one on no evidence.
    return {
      ok: true,
      unreachable: true,
      status: err instanceof Error ? err.name : "error",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

function verifiedFields(careerId: string, c: PackCareer) {
  const fields: { field: "salary" | "educationPath"; f: Provenanced<string> }[] = [];
  if (c.salary?.tier === "verified") fields.push({ field: "salary", f: c.salary });
  if (c.educationPath?.tier === "verified") {
    fields.push({ field: "educationPath", f: c.educationPath });
  }
  return fields.map(({ field, f }) => ({ careerId, field, url: f.source }));
}

async function main() {
  const countries = onlyCountry ? [onlyCountry] : PACK_COUNTRIES;
  let totalBroken = 0;

  for (const country of countries) {
    const pack = getPack(country);
    if (!pack) {
      console.error(`No pack for "${country}". Known: ${PACK_COUNTRIES.join(", ")}`);
      process.exitCode = 1;
      continue;
    }

    const targets = Object.entries(pack.careers).flatMap(([id, c]) =>
      verifiedFields(id, c),
    );
    // One URL is often cited by many careers — check each URL once.
    const uniqueUrls = [...new Set(targets.map((t) => t.url))];

    console.log(
      `\n${country} (${pack.code}): ${targets.length} verified fields across ${uniqueUrls.length} unique sources`,
    );

    const results = new Map<
      string,
      { ok: boolean; status: number | string; blocked?: boolean; unreachable?: boolean }
    >();
    const checked = await pool(uniqueUrls, CONCURRENCY, async (url) => {
      const r = await head(url);
      results.set(url, r);
      if (verbose) console.log(`  ${r.ok ? "ok " : "BAD"} ${r.status}\t${url}`);
      return r;
    });

    const brokenUrls = checked.filter((r) => !r.ok).length;
    const ratio = uniqueUrls.length ? brokenUrls / uniqueUrls.length : 0;

    if (ratio > ABORT_THRESHOLD) {
      console.error(
        `\nABORT: ${brokenUrls}/${uniqueUrls.length} sources unreachable for ${country}. ` +
          `That is almost certainly a network problem, not data rot. No verdict issued.`,
      );
      process.exitCode = 1;
      return;
    }

    const broken: Check[] = targets
      .filter((t) => !results.get(t.url)?.ok)
      .map((t) => ({
        country,
        ...t,
        ok: false,
        status: results.get(t.url)?.status ?? "unknown",
      }));

    const unreachableUrls = checked.filter((r) => r.unreachable).length;
    if (unreachableUrls) {
      console.log(
        `  ${unreachableUrls} source(s) could not be reached (timeout or refused ` +
          `connection). Inconclusive, not counted as dead — re-run before acting.`,
      );
    }

    const blockedUrls = checked.filter((r) => r.ok && r.blocked && !r.unreachable).length;
    if (blockedUrls) {
      console.log(
        `  ${blockedUrls} source(s) answered with a 4xx that is not 404/410 — ` +
          `bot-blocking or a POST-only API. Reachable, not dead.`,
      );
    }

    if (broken.length === 0) {
      console.log(`  no dead sources`);
    } else {
      totalBroken += broken.length;
      console.log(`  ${broken.length} field(s) cite a dead source:`);
      for (const b of broken) {
        console.log(`    ${b.careerId}.${b.field} → ${b.status} ${b.url}`);
      }
    }
  }

  if (totalBroken > 0) {
    console.error(
      `\n${totalBroken} verified field(s) cite a source that no longer resolves. ` +
        `Re-source them or demote them to tier "estimated" — a verified figure ` +
        `without a working citation is an unattributed claim.`,
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
