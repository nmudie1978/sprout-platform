import { describe, it, expect } from "vitest";
import {
  dayKey,
  computeFunnel,
  completionRate,
  countDistinctTwinSessions,
  computeRetention,
  pickLaunchSignals,
} from "../launch-stats-math";

describe("dayKey", () => {
  it("formats a date as a UTC YYYY-MM-DD string", () => {
    expect(dayKey(new Date("2026-06-10T23:30:00Z"))).toBe("2026-06-10");
  });

  it("uses UTC, not local time, for the day boundary", () => {
    // 00:30 UTC is still the 10th in UTC regardless of host timezone.
    expect(dayKey(new Date("2026-06-10T00:30:00Z"))).toBe("2026-06-10");
  });
});

describe("computeFunnel", () => {
  it("applies the discover<-understand<-clarity cascade so stages are monotonic", () => {
    const stepsByUser = new Map<string, Set<string>>([
      // only confirmed understand — should still count toward discover
      ["u1", new Set(["understand"])],
      // reached clarity — counts toward discover, understand AND clarity
      ["u2", new Set(["clarity"])],
      // only discover
      ["u3", new Set(["discover"])],
      // a started-but-no-step user contributes nothing to step counts
      ["u4", new Set<string>()],
    ]);

    const result = computeFunnel({
      viewedUserIds: new Set(["u1", "u2", "u3", "u4", "u5"]),
      startedUserIds: new Set(["u1", "u2", "u3", "u4"]),
      stepsByUser,
    });

    expect(result).toEqual({
      viewed: 5,
      started: 4,
      discover: 3, // u1 (cascade), u2 (cascade), u3
      understand: 2, // u1, u2 (cascade)
      clarity: 1, // u2
    });
  });

  it("returns all-zero counts when there is no data", () => {
    expect(
      computeFunnel({
        viewedUserIds: new Set(),
        startedUserIds: new Set(),
        stepsByUser: new Map(),
      }),
    ).toEqual({ viewed: 0, started: 0, discover: 0, understand: 0, clarity: 0 });
  });
});

describe("completionRate", () => {
  it("returns a rounded percentage", () => {
    expect(completionRate(1, 3)).toBe(33);
    expect(completionRate(1, 2)).toBe(50);
  });

  it("returns 0 when nothing was started (no divide-by-zero)", () => {
    expect(completionRate(0, 0)).toBe(0);
  });
});

describe("countDistinctTwinSessions", () => {
  it("buckets messages by user, career and UTC day", () => {
    const messages = [
      { userId: "u1", careerId: "nurse", createdAt: new Date("2026-06-10T09:00:00Z") },
      // same user+career+day = same session
      { userId: "u1", careerId: "nurse", createdAt: new Date("2026-06-10T09:05:00Z") },
      // next day = new session
      { userId: "u1", careerId: "nurse", createdAt: new Date("2026-06-11T09:00:00Z") },
      // different career = new session
      { userId: "u1", careerId: "pilot", createdAt: new Date("2026-06-10T09:00:00Z") },
      // different user = new session
      { userId: "u2", careerId: "nurse", createdAt: new Date("2026-06-10T09:00:00Z") },
    ];
    expect(countDistinctTwinSessions(messages)).toBe(4);
  });

  it("returns 0 for no messages", () => {
    expect(countDistinctTwinSessions([])).toBe(0);
  });
});

describe("computeRetention", () => {
  it("counts active windows, returning users and average active days", () => {
    const users = [
      // active today, two distinct days => returning
      { userId: "u1", activeDays: new Set(["2026-06-10", "2026-06-04"]) },
      // active this week, single day => not returning
      { userId: "u2", activeDays: new Set(["2026-06-09"]) },
      // active 20 days ago => in 30d window only
      { userId: "u3", activeDays: new Set(["2026-05-21"]) },
      // active 40 days ago => outside both windows
      { userId: "u4", activeDays: new Set(["2026-05-01"]) },
    ];
    const result = computeRetention(users, {
      cutoff7: "2026-06-03",
      cutoff30: "2026-05-11",
    });
    expect(result.active7d).toBe(2); // u1, u2
    expect(result.active30d).toBe(3); // u1, u2, u3
    expect(result.returning).toBe(1); // u1
    // avg active days across the 4 users = (2+1+1+1)/4 = 1.25
    expect(result.avgActiveDaysPerUser).toBeCloseTo(1.25);
  });

  it("returns zeros when no users have activity", () => {
    const result = computeRetention([], { cutoff7: "2026-06-03", cutoff30: "2026-05-11" });
    expect(result).toEqual({
      active7d: 0,
      active30d: 0,
      returning: 0,
      avgActiveDaysPerUser: 0,
    });
  });
});

describe("pickLaunchSignals", () => {
  it("picks strongest and weakest by value-to-threshold ratio", () => {
    const { strongest, weakest } = pickLaunchSignals([
      { key: "signups", label: "Sign-ups", value: 50, threshold: 10 }, // ratio 5
      { key: "completion", label: "Journey completion", value: 5, threshold: 25 }, // ratio 0.2
      { key: "twin", label: "Career Twin", value: 20, threshold: 20 }, // ratio 1
    ]);
    expect(strongest?.key).toBe("signups");
    expect(weakest?.key).toBe("completion");
  });

  it("returns null signals when given an empty list", () => {
    expect(pickLaunchSignals([])).toEqual({ strongest: null, weakest: null });
  });
});
