/**
 * scripts/validate-provider-urls.ts
 *
 * Quarterly health check for the deterministic URL templates used in
 * `src/lib/journey/real-world-provider.ts` (utdanning.no search,
 * Samordna opptak, Coursera, LinkedIn Learning / Jobs, NAV, etc.).
 *
 * The audit (Apr 2026) flagged these as the lowest-trust source in the
 * app — silent 404s if any provider changes its URL scheme, with no
 * observability. This script walks every template with a sample career
 * query, classifies the response (LIVE/REDIRECT/CLIENT_ERROR/SERVER_ERROR/
 * DNS/TIMEOUT/BLOCKED/UNKNOWN) using the same `validateProgrammeUrl`
 * helper that powers the Study Path validator, and writes the result to
 * `data/provider-url-validation.json`.
 *
 * Runtime can read that JSON via `src/lib/journey/provider-health.ts`
 * to decide whether to surface a provider link or substitute a Google
 * search fallback (separate decision — not wired automatically here).
 *
 * Run:
 *   npx tsx scripts/validate-provider-urls.ts
 *   npx tsx scripts/validate-provider-urls.ts --verbose
 *
 * Suggested CI cadence: weekly Sunday cron (see
 * `.github/workflows/validate-provider-urls.yml` if added).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  validateProgrammeUrl,
  type ValidationResult,
} from "../src/lib/education/validate-programme-url";

const enc = (s: string) => encodeURIComponent(s);
const SAMPLE_CAREER = "carpenter";

interface ProviderTemplate {
  /** Stable id used by runtime callers. */
  host: string;
  /** Human-readable label for logs / dashboards. */
  label: string;
  /** Real URL we'd hand to a user — built with the same template the
   *  generator uses, then exercised against the live host. */
  sampleUrl: string;
}

const PROVIDERS: ProviderTemplate[] = [
  {
    host: "utdanning.no",
    label: "utdanning.no — programme search",
    sampleUrl: `https://utdanning.no/sok?q=${enc(SAMPLE_CAREER)}`,
  },
  {
    host: "samordnaopptak.no",
    label: "Samordna opptak — application portal",
    sampleUrl: "https://www.samordnaopptak.no/info/utdanning/",
  },
  {
    host: "coursera.org/search",
    label: "Coursera — course search",
    sampleUrl: `https://www.coursera.org/search?query=${enc(SAMPLE_CAREER)}`,
  },
  {
    host: "coursera.org/professional-certificates",
    label: "Coursera — professional certificates",
    sampleUrl: `https://www.coursera.org/professional-certificates?query=${enc(SAMPLE_CAREER)}`,
  },
  {
    host: "linkedin.com/learning",
    label: "LinkedIn Learning — search",
    sampleUrl: `https://www.linkedin.com/learning/search?keywords=${enc(SAMPLE_CAREER)}`,
  },
  {
    host: "linkedin.com/jobs",
    label: "LinkedIn Jobs — entry-level search",
    sampleUrl: `https://www.linkedin.com/jobs/search/?keywords=${enc(SAMPLE_CAREER)}&f_E=2`,
  },
  {
    host: "linkedin.com/jobs/internship",
    label: "LinkedIn Jobs — internships",
    sampleUrl: `https://www.linkedin.com/jobs/search/?keywords=${enc(SAMPLE_CAREER)}%20internship&f_JT=I`,
  },
];

interface ProviderValidation extends ValidationResult {
  host: string;
  label: string;
}

interface ReportFile {
  generatedAt: string;
  sampleCareer: string;
  results: ProviderValidation[];
}

async function main() {
  const verbose = process.argv.includes("--verbose");
  const results: ProviderValidation[] = [];

  for (const p of PROVIDERS) {
    if (verbose) console.log(`Checking ${p.label} → ${p.sampleUrl}`);
    const r = await validateProgrammeUrl(p.sampleUrl);
    const enriched: ProviderValidation = { host: p.host, label: p.label, ...r };
    results.push(enriched);
    const flag =
      r.status === "LIVE" || r.status === "REDIRECT" ? "✓" : "✗";
    console.log(
      `  ${flag} ${p.host.padEnd(40)} ${r.status.padEnd(14)} ${r.httpCode ?? "—"}`,
    );
  }

  const out: ReportFile = {
    generatedAt: new Date().toISOString(),
    sampleCareer: SAMPLE_CAREER,
    results,
  };

  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  const outPath = path.join(dataDir, "provider-url-validation.json");
  await fs.writeFile(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

  const broken = results.filter(
    (r) => r.status !== "LIVE" && r.status !== "REDIRECT",
  );
  console.log("");
  console.log(
    `Wrote ${results.length} provider checks to ${path.relative(process.cwd(), outPath)}`,
  );
  console.log(
    `Healthy: ${results.length - broken.length} · Broken: ${broken.length}`,
  );
  if (broken.length > 0) {
    console.log("\nBroken providers:");
    for (const b of broken) {
      console.log(`  - ${b.host} → ${b.status} (${b.httpCode ?? "—"})`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
