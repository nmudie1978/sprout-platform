/**
 * QA: validate every external URL surface in the app, not just programmes.
 * Run: `npx tsx scripts/qa-validate-all-links.ts`
 *
 * Scrapes literal URLs from tool-links, tier1-sources, real-world-provider,
 * norway-programmes, beyond-borders. Skips dynamic search templates (URLs
 * that contain a JS template-string interpolation `${enc(...)}`) — those
 * always produce a valid search-page hit on the host and yield false noise.
 *
 * Output: scripts/output/qa-link-validation.json
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import {
  validateProgrammeUrls,
  type ValidationResult,
} from "../src/lib/education/validate-programme-url";

const root = resolve(__dirname, "..");

const SOURCES = [
  "src/lib/education/tool-links.ts",
  "src/lib/learning/course-links.ts",
  "src/lib/industry-insights/tier1-sources.ts",
  "src/lib/industry-insights/beyond-borders-data.ts",
  "src/lib/journey/real-world-provider.ts",
  "src/lib/education/norway-programmes.ts",
];

interface Sourced {
  url: string;
  file: string;
  line: number;
}

function scrape(file: string): Sourced[] {
  const abs = resolve(root, file);
  const text = readFileSync(abs, "utf8");
  const out: Sourced[] = [];
  const lines = text.split("\n");
  // Match http(s) URL inside single/double/backtick quotes. Stop on
  // whitespace, quote, backtick, or template `${`. URLs that contain
  // ${ get filtered after — those are search/parameterised templates
  // and produce noise when validated.
  const urlRegex = /(['"`])(https?:\/\/[^'"`\s${}]+)\1/g;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m: RegExpExecArray | null;
    while ((m = urlRegex.exec(line)) !== null) {
      const url = m[2];
      // Strip trailing punctuation that isn't part of a real URL
      const clean = url.replace(/[),.;]+$/, "");
      out.push({ url: clean, file, line: i + 1 });
    }
  }
  return out;
}

const all: Sourced[] = [];
for (const src of SOURCES) {
  try {
    all.push(...scrape(src));
  } catch (e) {
    console.error(`[scrape] failed ${src}: ${(e as Error).message}`);
  }
}

// Dedupe by URL; keep the first occurrence's source.
const byUrl = new Map<string, Sourced>();
for (const s of all) if (!byUrl.has(s.url)) byUrl.set(s.url, s);

console.log(`[validate-all-links] Discovered ${all.length} URL occurrences across ${SOURCES.length} files → ${byUrl.size} unique`);

const urls = [...byUrl.keys()];
const startedAt = new Date().toISOString();

(async () => {
  const results: ValidationResult[] = await validateProgrammeUrls(urls, {
    concurrency: 8,
    timeoutMs: 12_000,
  });

  // Aggregate
  const counts: Record<string, number> = {};
  const broken: Array<Sourced & { status: string; httpCode: number | null }> = [];

  for (let i = 0; i < urls.length; i++) {
    const r = results[i];
    counts[r.status] = (counts[r.status] ?? 0) + 1;
    if (r.status === "CLIENT_ERROR" || r.status === "DNS") {
      const src = byUrl.get(r.url)!;
      broken.push({ ...src, status: r.status, httpCode: r.httpCode });
      console.log(`✗ ${r.status.padEnd(13)} ${r.httpCode ?? ""} ${r.url}  (${src.file}:${src.line})`);
    }
  }

  console.log(`\n── Summary ──`);
  for (const [s, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(15)} ${n}`);
  }

  const outPath = resolve(root, "scripts/output/qa-link-validation.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        meta: {
          startedAt,
          finishedAt: new Date().toISOString(),
          totalUrls: urls.length,
          counts,
        },
        broken,
        results: results.map((r, i) => ({
          ...r,
          source: byUrl.get(urls[i])!,
        })),
      },
      null,
      2,
    ),
  );
  console.log(`\n✓ Wrote ${outPath}`);
})();
