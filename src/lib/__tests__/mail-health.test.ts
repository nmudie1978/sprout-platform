import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkMailHealth,
  classifyResendStatus,
  looksLikeResendKey,
  mailStateIsFailing,
  resetMailHealthCache,
  PROBE_TTL_MS,
} from "@/lib/mail-health";

/**
 * The property under test is "would this have caught 2026-06-19?" — a present
 * but revoked Resend key, with every layer above it reporting success.
 */

const KEY = "re_abcdef1234567890";
const FROM = "Endeavrly <noreply@endeavrly.com>";

/** A fetch stub returning a fixed status, counting calls. */
function stubFetch(status: number) {
  return vi.fn(async () => ({ status }) as Response);
}

beforeEach(() => resetMailHealthCache());

describe("classifyResendStatus", () => {
  it("treats 401/403 as a bad key — the June failure", () => {
    expect(classifyResendStatus(401)).toBe("invalid-key");
    expect(classifyResendStatus(403)).toBe("invalid-key");
  });

  it("treats 2xx as healthy", () => {
    expect(classifyResendStatus(200)).toBe("up");
    expect(classifyResendStatus(204)).toBe("up");
  });

  it("does not condemn a key over an upstream problem", () => {
    // A 500 or a rate-limit says nothing about the key's validity. Reporting
    // "invalid-key" here would page someone over Resend having a bad minute.
    for (const s of [429, 500, 502, 503]) {
      expect(classifyResendStatus(s)).toBe("unreachable");
    }
  });
});

describe("looksLikeResendKey", () => {
  it("accepts a real-shaped key", () => {
    expect(looksLikeResendKey(KEY)).toBe(true);
  });

  it("rejects placeholders, empties and wrong prefixes", () => {
    for (const v of ["", "re_", "sk-abcdef123456", "your-key-here", undefined]) {
      expect(looksLikeResendKey(v as string | undefined)).toBe(false);
    }
  });
});

describe("checkMailHealth", () => {
  it("reports not-configured with no key, without calling out", async () => {
    const f = stubFetch(200);
    const r = await checkMailHealth({ fetchImpl: f, apiKey: undefined, mailFrom: FROM });
    expect(r).toBe("not-configured");
    expect(f).not.toHaveBeenCalled();
  });

  it("reports not-configured when the sender address is missing", async () => {
    // A valid key with no verified sender still cannot send, so reporting
    // "up" here would be a lie of exactly the reassuring kind we're removing.
    const r = await checkMailHealth({ fetchImpl: stubFetch(200), apiKey: KEY, mailFrom: undefined });
    expect(r).toBe("not-configured");
  });

  it("reports up when Resend accepts the key", async () => {
    expect(await checkMailHealth({ fetchImpl: stubFetch(200), apiKey: KEY, mailFrom: FROM })).toBe("up");
  });

  it("CATCHES A REVOKED KEY — the 2026-06-19 failure", async () => {
    expect(await checkMailHealth({ fetchImpl: stubFetch(401), apiKey: KEY, mailFrom: FROM })).toBe(
      "invalid-key",
    );
  });

  it("reports unreachable rather than failing on a network error", async () => {
    const f = vi.fn(async () => {
      throw new Error("ENOTFOUND api.resend.com");
    });
    expect(await checkMailHealth({ fetchImpl: f as never, apiKey: KEY, mailFrom: FROM })).toBe(
      "unreachable",
    );
  });

  it("never sends an email — it only reads /domains", async () => {
    const f = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe("https://api.resend.com/domains");
      expect((init.method ?? "GET").toUpperCase()).toBe("GET");
      return { status: 200 } as Response;
    });
    await checkMailHealth({ fetchImpl: f as never, apiKey: KEY, mailFrom: FROM });
    expect(f).toHaveBeenCalledOnce();
  });

  it("caches, so a public probe can't be turned into traffic against Resend", async () => {
    const f = stubFetch(200);
    const t = 1_000_000;
    await checkMailHealth({ fetchImpl: f, apiKey: KEY, mailFrom: FROM, now: t });
    await checkMailHealth({ fetchImpl: f, apiKey: KEY, mailFrom: FROM, now: t + 1000 });
    await checkMailHealth({ fetchImpl: f, apiKey: KEY, mailFrom: FROM, now: t + 60_000 });
    expect(f).toHaveBeenCalledOnce();
  });

  it("re-probes once the cache expires, so a key going bad is noticed", async () => {
    const f = stubFetch(200);
    const t = 1_000_000;
    await checkMailHealth({ fetchImpl: f, apiKey: KEY, mailFrom: FROM, now: t });
    await checkMailHealth({ fetchImpl: f, apiKey: KEY, mailFrom: FROM, now: t + PROBE_TTL_MS + 1 });
    expect(f).toHaveBeenCalledTimes(2);
  });
});

describe("mailStateIsFailing", () => {
  it("fails the probe in production for states that are definitely broken", () => {
    expect(mailStateIsFailing("not-configured", true)).toBe(true);
    expect(mailStateIsFailing("invalid-key", true)).toBe(true);
  });

  it("does not fail on healthy or merely unknown states", () => {
    expect(mailStateIsFailing("up", true)).toBe(false);
    // "unreachable" is an unknown, not a failure. A probe that cries wolf on
    // transient network blips gets muted — which is how the June outage
    // stayed invisible in the first place.
    expect(mailStateIsFailing("unreachable", true)).toBe(false);
  });

  it("never fails outside production, where running without mail is normal", () => {
    for (const s of ["not-configured", "invalid-key", "unreachable", "up"] as const) {
      expect(mailStateIsFailing(s, false)).toBe(false);
    }
  });
});
