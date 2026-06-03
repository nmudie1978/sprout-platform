#!/usr/bin/env node
/**
 * Build orchestrator (replaces the inline `prisma generate && prisma migrate
 * deploy && tsx seed && next build` chain).
 *
 * Why this exists: Vercel **Preview** (and local) builds have no DATABASE_URL,
 * so `prisma generate` fails schema validation with P1012 ("Environment
 * variable not found: DATABASE_URL") before `next build` even runs — turning
 * every preview check red.
 *
 * Two facts make a clean fix possible:
 *   1. `next build` does NOT touch the database — the Prisma client is lazy
 *      (Proxy), there are no generateStaticParams, and /dashboard/* is
 *      force-dynamic. So a *valid-format* DATABASE_URL that never connects is
 *      enough for the whole build.
 *   2. `prisma migrate deploy` + the events seed DO need a real, reachable DB,
 *      and should only ever run against production anyway.
 *
 * So: provide a dummy DATABASE_URL only when one isn't already set (lets
 * `prisma generate` + `next build` pass), and gate migrate/seed on
 * VERCEL_ENV === "production". Production behavior is unchanged — there the
 * real DATABASE_URL is present and the DB steps run exactly as before.
 */

import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Ensure the project's local binaries (prisma, next, tsx) resolve no matter
// how this script is launched — execSync spawns /bin/sh, which doesn't
// otherwise inherit node_modules/.bin on PATH.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const binDir = path.join(projectRoot, "node_modules", ".bin");
const PATH = `${binDir}${path.delimiter}${process.env.PATH ?? ""}`;

const isProduction = process.env.VERCEL_ENV === "production";

// Supply a dummy connection string ONLY if the real one is absent. In
// production Vercel sets DATABASE_URL, so this never overrides it.
if (!process.env.DATABASE_URL) {
  const dummy = "postgresql://dummy:dummy@localhost:5432/dummy";
  process.env.DATABASE_URL = dummy;
  if (!process.env.DIRECT_URL) process.env.DIRECT_URL = dummy;
  console.log(
    "[build] No DATABASE_URL found — using a dummy URL for `prisma generate` " +
      "and `next build` (no DB connection is made at build time).",
  );
}

function run(cmd) {
  console.log(`[build] $ ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: { ...process.env, PATH } });
}

run("prisma generate");

if (isProduction) {
  // Real database present — apply migrations and seed events, as before.
  run("prisma migrate deploy");
  run("tsx prisma/seed-events-only.ts");
} else {
  console.log(
    `[build] VERCEL_ENV=${process.env.VERCEL_ENV ?? "(unset)"} — skipping ` +
      "`prisma migrate deploy` and the events seed (no real DB in this env).",
  );
}

run("next build");
