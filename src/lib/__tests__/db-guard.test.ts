import { describe, it, expect, vi } from "vitest";
import {
  parseDbHost,
  describeDbTarget,
  shouldBlock,
  assertSafeDatabase,
  OVERRIDE_VAR,
} from "@/lib/db-guard";

const PROD = "postgresql://postgres:pw@db.ehnqogsnxvwljbzsmxct.supabase.co:5432/postgres";
const POOLER = "postgresql://u:p@aws-1-eu-north-1.pooler.supabase.com:6543/postgres";
const LOCAL = "postgresql://postgres:postgres@localhost:5432/endeavrly_dev";

describe("parseDbHost", () => {
  it("extracts the host from a normal connection string", () => {
    expect(parseDbHost(PROD)).toBe("db.ehnqogsnxvwljbzsmxct.supabase.co");
    expect(parseDbHost(LOCAL)).toBe("localhost");
  });

  it("survives a password containing characters the URL parser rejects", () => {
    // Real passwords contain these, and a guard blinded by one is worse than
    // no guard: it would silently classify production as safe.
    const host = parseDbHost("postgresql://user:p@ss w#rd@db.abc.supabase.co:5432/postgres");
    expect(host).toContain("supabase.co");
  });

  it("returns null for junk rather than throwing", () => {
    expect(parseDbHost(undefined)).toBeNull();
    expect(parseDbHost("")).toBeNull();
    expect(parseDbHost("not-a-url")).toBeNull();
  });
});

describe("describeDbTarget", () => {
  it("recognises hosted databases", () => {
    for (const url of [PROD, POOLER]) {
      expect(describeDbTarget(url).isProductionLike).toBe(true);
    }
  });

  it("recognises a developer's own machine", () => {
    const t = describeDbTarget(LOCAL);
    expect(t.isLocal).toBe(true);
    expect(t.isProductionLike).toBe(false);
  });

  it("treats other managed providers as hosted too", () => {
    for (const h of [
      "postgresql://u:p@ep-cool-name.neon.tech/db",
      "postgresql://u:p@x.rds.amazonaws.com:5432/db",
      "postgresql://u:p@y.railway.app:5432/db",
    ]) {
      expect(describeDbTarget(h).isProductionLike).toBe(true);
    }
  });

  it("does not flag an unset URL", () => {
    expect(describeDbTarget(undefined).isProductionLike).toBe(false);
  });
});

describe("shouldBlock", () => {
  it("BLOCKS a test run against a hosted database", () => {
    // The case that matters: tests delete rows and expect nothing to survive.
    expect(shouldBlock({ url: PROD, isTest: true, override: undefined })).toBe(true);
  });

  it("allows tests against a local database", () => {
    expect(shouldBlock({ url: LOCAL, isTest: true, override: undefined })).toBe(false);
  });

  it("does NOT block the dev server — only warns", () => {
    // Hard-failing here would stop all local work, because the only database
    // that currently exists is the hosted one.
    expect(shouldBlock({ url: PROD, isTest: false, override: undefined })).toBe(false);
  });

  it("honours an explicit opt-in", () => {
    expect(shouldBlock({ url: PROD, isTest: true, override: "true" })).toBe(false);
  });

  it("ignores a non-'true' override, so a typo fails closed", () => {
    for (const v of ["1", "yes", "TRUE", ""]) {
      expect(shouldBlock({ url: PROD, isTest: true, override: v })).toBe(true);
    }
  });
});

describe("assertSafeDatabase", () => {
  it("throws for a test run against production, naming the host", () => {
    expect(() =>
      assertSafeDatabase({ url: PROD, isTest: true, override: undefined, log: () => {} }),
    ).toThrow(/db\.ehnqogsnxvwljbzsmxct\.supabase\.co/);
  });

  it("tells the reader how to override", () => {
    expect(() =>
      assertSafeDatabase({ url: PROD, isTest: true, override: undefined, log: () => {} }),
    ).toThrow(new RegExp(OVERRIDE_VAR));
  });

  it("warns but does not throw for a dev server on production", () => {
    const log = vi.fn();
    expect(() =>
      assertSafeDatabase({ url: PROD, isTest: false, override: undefined, log }),
    ).not.toThrow();
    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain("HOSTED database");
  });

  it("stays silent for a local database", () => {
    const log = vi.fn();
    assertSafeDatabase({ url: LOCAL, isTest: false, override: undefined, log });
    assertSafeDatabase({ url: LOCAL, isTest: true, override: undefined, log });
    expect(log).not.toHaveBeenCalled();
  });
});
