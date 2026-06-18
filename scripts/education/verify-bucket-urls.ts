/**
 * URL-verification gate for discipline-buckets.json.
 *
 * Collects every `url` across local.* and europe for every bucket, GETs each
 * (follow redirects, 12s timeout), and treats a final HTTP status of 200-399
 * as OK. Prints a table of any non-OK url and exits 1 if any fail.
 *
 * Run: node_modules/.bin/tsx scripts/education/verify-bucket-urls.ts
 * (Uses only global fetch + node:fs, so it also runs via
 *  `node --experimental-strip-types scripts/education/verify-bucket-urls.ts`.)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(
  __dirname,
  "../../src/lib/education/data/discipline-buckets.json",
);

interface AltUniversity {
  name: string;
  country: string;
  city: string;
  url: string;
  note?: string;
}
interface DisciplineBucket {
  id: string;
  label: string;
  local: Record<string, AltUniversity[]>;
  europe: AltUniversity[];
}

const data = JSON.parse(readFileSync(DATA_PATH, "utf8")) as {
  buckets: DisciplineBucket[];
};

interface Entry {
  bucket: string;
  name: string;
  url: string;
}
const entries: Entry[] = [];
for (const b of data.buckets) {
  for (const list of Object.values(b.local ?? {})) {
    for (const u of list ?? []) entries.push({ bucket: b.id, name: u.name, url: u.url });
  }
  for (const u of b.europe ?? []) entries.push({ bucket: b.id, name: u.name, url: u.url });
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function once(url: string): Promise<{ ok: boolean; status: number | string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "text/html,*/*" },
    });
    const status = res.status;
    return { ok: status >= 200 && status < 400, status };
  } catch (e) {
    return { ok: false, status: (e as Error).name === "AbortError" ? "TIMEOUT" : (e as Error).message };
  } finally {
    clearTimeout(t);
  }
}

// Retry transient network errors (not real HTTP rejections like 403/404) once.
async function check(url: string): Promise<{ ok: boolean; status: number | string }> {
  const first = await once(url);
  if (first.ok || typeof first.status === "number") return first;
  await new Promise((r) => setTimeout(r, 1_000));
  return once(url);
}

async function main() {
  console.log(`Verifying ${entries.length} URLs across ${data.buckets.length} buckets...\n`);
  const failures: Array<Entry & { status: number | string }> = [];
  // Run with limited concurrency to be polite.
  const CONCURRENCY = 8;
  let i = 0;
  async function worker() {
    while (i < entries.length) {
      const idx = i++;
      const e = entries[idx];
      const r = await check(e.url);
      if (!r.ok) failures.push({ ...e, status: r.status });
      process.stdout.write(r.ok ? "." : "x");
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n\n");

  if (failures.length === 0) {
    console.log(`OK: all ${entries.length} URLs returned 2xx/3xx.`);
    process.exit(0);
  }
  console.log(`FAILURES (${failures.length}):`);
  console.log("bucket".padEnd(28), "status".padEnd(10), "name / url");
  for (const f of failures) {
    console.log(
      f.bucket.padEnd(28),
      String(f.status).padEnd(10),
      `${f.name}\n${" ".repeat(40)}${f.url}`,
    );
  }
  process.exit(1);
}

void main();
