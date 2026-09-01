import { describe, it, expect } from "vitest";
import {
  DAY_MS,
  dailyLimitMessage,
  evaluateRollingWindow,
  formatWhenAvailable,
  startOfMonthUtc,
} from "@/lib/ai-usage/limits";

const at = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3_600_000);

describe("evaluateRollingWindow", () => {
  it("allows a user who is under the limit and reports what is left", () => {
    const result = evaluateRollingWindow([at(1), at(2), at(3)], 15);
    expect(result).toMatchObject({ allowed: true, used: 3, remaining: 12 });
  });

  it("allows the very last question in the allowance", () => {
    const stamps = Array.from({ length: 14 }, (_, i) => at(i + 1));
    expect(evaluateRollingWindow(stamps, 15).allowed).toBe(true);
    expect(evaluateRollingWindow(stamps, 15).remaining).toBe(1);
  });

  it("blocks once the allowance is spent", () => {
    const stamps = Array.from({ length: 15 }, (_, i) => at(i + 1));
    const result = evaluateRollingWindow(stamps, 15);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("rolls: the next slot opens when the OLDEST counted request ages out", () => {
    // Newest first: 1h ago … 15h ago. The 15th-newest is the one that must
    // expire before a 16th question is allowed.
    const stamps = Array.from({ length: 15 }, (_, i) => at(i + 1));
    const oldest = stamps[14];
    const result = evaluateRollingWindow(stamps, 15);
    expect(result.retryAt?.getTime()).toBe(oldest.getTime() + DAY_MS);
  });

  it("never returns a retryAt in the past for a full window", () => {
    const stamps = Array.from({ length: 15 }, (_, i) => at(i * 0.5));
    const result = evaluateRollingWindow(stamps, 15);
    expect(result.retryAt!.getTime()).toBeGreaterThan(Date.now());
  });

  it("treats a limit of 0 as closed", () => {
    expect(evaluateRollingWindow([], 0).allowed).toBe(false);
  });
});

describe("formatWhenAvailable", () => {
  const now = new Date("2026-08-31T12:00:00Z");
  it("says 'in a moment' for a sub-minute wait", () => {
    expect(formatWhenAvailable(new Date("2026-08-31T12:00:30Z"), now)).toBe("in a moment");
  });
  it("uses minutes under an hour", () => {
    expect(formatWhenAvailable(new Date("2026-08-31T12:20:00Z"), now)).toBe("in about 20 minutes");
  });
  it("uses hours under a day", () => {
    expect(formatWhenAvailable(new Date("2026-08-31T15:00:00Z"), now)).toBe("in about 3 hours");
  });
  it("degrades gracefully with no timestamp", () => {
    expect(formatWhenAvailable(undefined, now)).toBe("shortly");
  });
});

describe("dailyLimitMessage", () => {
  const now = new Date("2026-08-31T12:00:00Z");

  it("names the limit and when the user can come back", () => {
    const msg = dailyLimitMessage(15, new Date("2026-08-31T15:00:00Z"), now);
    expect(msg).toContain("15");
    expect(msg).toContain("in about 3 hours");
  });

  it("stays calm and encouraging — no scolding, no upsell", () => {
    const msg = dailyLimitMessage(15, new Date("2026-08-31T15:00:00Z"), now).toLowerCase();
    for (const banned of ["upgrade", "premium", "pay", "abuse", "blocked", "denied", "error"]) {
      expect(msg).not.toContain(banned);
    }
  });
});

describe("startOfMonthUtc", () => {
  it("returns midnight on the 1st, UTC", () => {
    expect(startOfMonthUtc(new Date("2026-08-31T23:59:59Z")).toISOString()).toBe(
      "2026-08-01T00:00:00.000Z",
    );
  });
});
