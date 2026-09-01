/**
 * Is this process about to write to the production database?
 *
 * Endeavrly has no staging environment. `.env` on a developer's machine points
 * at the live Supabase project, so "running the app locally" and "running the
 * test suite" both operate on real young people's data. Over one session that
 * produced real signups, real deletions, and orphaned personal data — all from
 * routine testing.
 *
 * Until a separate database exists, the least this can do is refuse to be
 * quiet about it. The guard is deliberately split by severity:
 *
 *   • `next dev` against production  -> a loud warning. Sometimes genuinely
 *     intended (reproducing a live bug), and hard-failing would simply stop
 *     anyone working today, since the only database that exists IS production.
 *   • the TEST SUITE against production -> a hard failure. Tests create,
 *     mutate and delete rows with no expectation that anything survives; one
 *     `deleteMany` with a loose filter is all it takes. There is no legitimate
 *     reason to run them against live data, so this one is not negotiable
 *     without an explicit opt-in.
 */

/**
 * Resolve the URL Prisma will ACTUALLY use.
 *
 * Prisma auto-loads `.env` when DATABASE_URL is absent from process.env, which
 * is exactly the situation under Vitest — so a guard that only reads
 * process.env sees `undefined`, concludes "nothing to protect", and waves a
 * test run straight through to production. It has to look where Prisma looks.
 */
export function resolveEffectiveDbUrl(
  env: NodeJS.ProcessEnv = process.env,
  readEnvFile: () => string | null = defaultReadEnvFile,
): string | undefined {
  const explicit = env.DATABASE_URL?.trim() || env.DIRECT_URL?.trim();
  if (explicit) return explicit;
  const fromFile = readEnvFile();
  return fromFile ?? undefined;
}

/** Read DATABASE_URL out of a .env file, the way Prisma would. */
function defaultReadEnvFile(): string | null {
  try {
    // Node-only and lazy: this module is imported by client bundles too.
    const { readFileSync } = require("fs") as typeof import("fs");
    const { join } = require("path") as typeof import("path");
    const raw = readFileSync(join(process.cwd(), ".env"), "utf8");
    const m = /^\s*DATABASE_URL\s*=\s*"?([^"\n]+)"?/m.exec(raw);
    return m?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

/** Set to "true" to acknowledge the risk and proceed anyway. */
export const OVERRIDE_VAR = "ALLOW_PRODUCTION_DB";

export interface DbTarget {
  /** Host portion of the connection string, or null if unparseable. */
  host: string | null;
  /** Whether this looks like a managed/hosted production database. */
  isProductionLike: boolean;
  /** Whether it points at a developer's own machine. */
  isLocal: boolean;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "host.docker.internal"]);

/**
 * Managed-database hostnames. Deliberately broad: the failure mode we care
 * about is a developer machine pointed at ANY hosted database, and a false
 * positive costs a warning while a false negative costs real data.
 */
const HOSTED_PATTERNS = [
  /\.supabase\.(co|com|net)$/i,
  /\.neon\.tech$/i,
  /\.railway\.app$/i,
  /\.rds\.amazonaws\.com$/i,
  /\.render\.com$/i,
  /\.planetscale\.com$/i,
  /\.vercel-storage\.com$/i,
  /\.pooler\.supabase\.com$/i,
];

/** Pull the host out of a Postgres URL without throwing on junk. */
export function parseDbHost(url: string | undefined): string | null {
  if (!url) return null;
  try {
    // The URL parser handles credentials and query strings for us.
    return new URL(url).hostname || null;
  } catch {
    // Fall back to a regex for values the URL parser rejects (unescaped
    // characters in a password are common and shouldn't blind the guard).
    const m = /@([^/:?]+)/.exec(url);
    return m?.[1] ?? null;
  }
}

/** Classify what a connection string points at. */
export function describeDbTarget(url: string | undefined): DbTarget {
  const host = parseDbHost(url);
  if (!host) return { host: null, isProductionLike: false, isLocal: false };
  const isLocal = LOCAL_HOSTS.has(host);
  return {
    host,
    isLocal,
    isProductionLike: !isLocal && HOSTED_PATTERNS.some((re) => re.test(host)),
  };
}

/**
 * Should this process be stopped outright?
 *
 * Only for tests, and only when nobody has explicitly opted in.
 */
export function shouldBlock({
  url,
  isTest,
  override,
}: {
  url: string | undefined;
  isTest: boolean;
  override: string | undefined;
}): boolean {
  if (!isTest) return false;
  if (override === "true") return false;
  return describeDbTarget(url).isProductionLike;
}

/** The message shown when a test run is stopped. */
export function blockedMessage(host: string | null): string {
  return [
    "",
    "  ✋ Refusing to run the test suite against a hosted database.",
    "",
    `     DATABASE_URL points at: ${host ?? "an unparseable host"}`,
    "",
    "     Tests create, mutate and delete rows. Run them against a local or",
    "     branch database instead — see docs/local-database.md.",
    "",
    `     To override for a single run (you are on your own):`,
    `       ${OVERRIDE_VAR}=true npm test`,
    "",
  ].join("\n");
}

/** The banner shown when the dev server is pointed at a hosted database. */
export function warningBanner(host: string): string {
  return [
    "",
    "  ⚠  This dev server is connected to a HOSTED database.",
    `     ${host}`,
    "",
    "     Signups, deletions and migrations here affect real data.",
    "     See docs/local-database.md to set up a separate one.",
    "",
  ].join("\n");
}

/**
 * Run the guard. Throws when a test run targets a hosted database; otherwise
 * warns. `log` is injectable so this is testable without capturing stdout.
 */
export function assertSafeDatabase({
  url = process.env.DATABASE_URL,
  isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true",
  override = process.env[OVERRIDE_VAR],
  log = console.warn,
}: {
  url?: string;
  isTest?: boolean;
  override?: string;
  log?: (msg: string) => void;
} = {}): void {
  const target = describeDbTarget(url);

  if (shouldBlock({ url, isTest, override })) {
    throw new Error(blockedMessage(target.host));
  }

  if (target.isProductionLike && !isTest) {
    log(warningBanner(target.host!));
  }
}
