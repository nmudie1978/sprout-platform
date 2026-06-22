/**
 * Link health check for the Events & Opportunities directory.
 *
 * Run: `npm run test:links`
 *
 * - Validates every configured URL is a syntactically valid absolute http(s) URL
 *   (this part is strict — a malformed URL exits non-zero).
 * - Then does a best-effort network check (HEAD, falling back to GET). 2xx/3xx =
 *   healthy. A 403/429 from major platforms (LinkedIn, Glassdoor, etc.) is an
 *   expected bot-block, reported as a warning, never a failure. Network errors
 *   are warnings too — CI should not break because a third party is briefly down.
 *
 * Run with: tsx scripts/check-event-links.ts  (or: npm run test:links)
 */
import { EXTERNAL_SOURCES } from "../src/lib/data/events-opportunities";

const BOT_BLOCK_OK = [/linkedin\.com/i, /glassdoor\./i, /finn\.no/i, /graduateland\.com/i];

async function check(url: string): Promise<{ ok: boolean; status: number | string; warn: boolean }> {
  const tryFetch = async (method: "HEAD" | "GET") => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12_000);
    try {
      const res = await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 EndeavrlyLinkCheck" } });
      return res.status;
    } finally {
      clearTimeout(t);
    }
  };
  try {
    let status = await tryFetch("HEAD");
    if (status >= 400) status = await tryFetch("GET"); // some hosts reject HEAD
    if (status >= 200 && status < 400) return { ok: true, status, warn: false };
    if ((status === 403 || status === 429) && BOT_BLOCK_OK.some((re) => re.test(url))) {
      return { ok: true, status, warn: true };
    }
    return { ok: false, status, warn: true };
  } catch (e) {
    return { ok: false, status: e instanceof Error ? e.name : "error", warn: true };
  }
}

async function main() {
  // 1) Strict syntactic validation.
  let invalid = 0;
  for (const s of EXTERNAL_SOURCES) {
    try {
      const u = new URL(s.url);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("not http(s)");
    } catch {
      console.error(`✖ INVALID URL: ${s.id} → ${s.url}`);
      invalid++;
    }
  }
  if (invalid > 0) {
    console.error(`\n${invalid} invalid URL(s). Failing.`);
    process.exit(1);
  }
  console.log(`✓ All ${EXTERNAL_SOURCES.length} URLs are syntactically valid.\n`);

  // 2) Best-effort network health (warnings only).
  const offline = process.argv.includes("--no-network");
  if (offline) {
    console.log("(skipping network checks — --no-network)");
    return;
  }
  let warnings = 0;
  await Promise.all(
    EXTERNAL_SOURCES.map(async (s) => {
      const r = await check(s.url);
      if (r.ok && !r.warn) console.log(`✓ ${r.status}  ${s.name}`);
      else if (r.ok && r.warn) { console.warn(`⚠ ${r.status}  ${s.name} (bot-block expected — OK)`); warnings++; }
      else { console.warn(`⚠ ${r.status}  ${s.name} — could not confirm (non-blocking)`); warnings++; }
    }),
  );
  console.log(`\nDone. ${warnings} warning(s); no hard failures.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
