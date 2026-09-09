import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubscriptionTier } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  profileFind: vi.fn(),
  explorationCount: vi.fn(),
  explorationFind: vi.fn(),
  explorationCreate: vi.fn(),
  savedCount: vi.fn(),
  aiCount: vi.fn(),
  entitlements: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    youthProfile: { findUnique: mocks.profileFind },
    careerExploration: {
      count: mocks.explorationCount,
      findUnique: mocks.explorationFind,
      create: mocks.explorationCreate,
    },
    savedCareer: { count: mocks.savedCount },
    aiUsageEvent: { count: mocks.aiCount },
  },
}));
vi.mock("../service", () => ({ getUserEntitlements: mocks.entitlements }));

const { getUsage, recordCareerExploration, checkCareerTwinQuestion, getAllowances } =
  await import("../usage");

const FREE = {
  limits: { careerExplorations: 10, careerTwinQuestions: 5, savedCareers: 20 },
  subscriptionTier: SubscriptionTier.FREE,
};
const PRO = {
  limits: { careerExplorations: null, careerTwinQuestions: null, savedCareers: null },
  subscriptionTier: SubscriptionTier.PRO,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.profileFind.mockResolvedValue({ id: "p1" });
  mocks.explorationFind.mockResolvedValue(null);
  mocks.explorationCreate.mockResolvedValue({});
  mocks.explorationCount.mockResolvedValue(0);
  mocks.savedCount.mockResolvedValue(0);
  mocks.aiCount.mockResolvedValue(0);
  mocks.entitlements.mockResolvedValue(FREE);
});

describe("Career Twin question counting", () => {
  // Brief §7: a question is a SUCCESSFULLY submitted user question. Failures,
  // refusals and background summarisation must all cost the user nothing.
  it("counts only successful questions on the conversation surface", async () => {
    await getUsage("u1");
    expect(mocks.aiCount).toHaveBeenCalledWith({
      where: { userId: "u1", feature: "career_twin", status: "successful" },
    });
  });

  it("does not count career_twin_summary, which the user never asked for", async () => {
    await getUsage("u1");
    const where = mocks.aiCount.mock.calls[0][0].where;
    expect(where.feature).not.toBe("career_twin_summary");
  });

  it("allows the fifth question and refuses the sixth", async () => {
    mocks.aiCount.mockResolvedValue(4);
    expect((await checkCareerTwinQuestion("u1")).allowed).toBe(true);

    mocks.aiCount.mockResolvedValue(5);
    const sixth = await checkCareerTwinQuestion("u1");
    expect(sixth.allowed).toBe(false);
    expect(sixth).toMatchObject({ reason: "limit_reached", used: 5, limit: 5 });
  });

  it("never limits Pro", async () => {
    mocks.entitlements.mockResolvedValue(PRO);
    mocks.aiCount.mockResolvedValue(9999);
    expect((await checkCareerTwinQuestion("u1")).allowed).toBe(true);
  });
});

describe("career exploration", () => {
  it("allows the tenth new career and refuses the eleventh", async () => {
    mocks.explorationCount.mockResolvedValue(9);
    expect((await recordCareerExploration("u1", "nurse")).allowed).toBe(true);

    mocks.explorationCount.mockResolvedValue(10);
    const eleventh = await recordCareerExploration("u1", "pilot");
    expect(eleventh.allowed).toBe(false);
    expect(eleventh).toMatchObject({ reason: "limit_reached", used: 10, limit: 10 });
  });

  // The allowance buys access to a career, not to a page view. Someone at
  // their limit must still be able to return to all ten.
  it("lets a user at their limit revisit a career they already explored", async () => {
    mocks.explorationCount.mockResolvedValue(10);
    mocks.explorationFind.mockResolvedValue({ id: "e1" });

    const revisit = await recordCareerExploration("u1", "nurse");
    expect(revisit.allowed).toBe(true);
    expect(revisit).toMatchObject({ alreadyExplored: true });
    expect(mocks.explorationCreate).not.toHaveBeenCalled();
  });

  it("does not consume a second allowance on revisit", async () => {
    mocks.explorationCount.mockResolvedValue(3);
    mocks.explorationFind.mockResolvedValue({ id: "e1" });
    const r = await recordCareerExploration("u1", "nurse");
    expect(r).toMatchObject({ used: 3, alreadyExplored: true });
  });

  // Two tabs, one career. Both pass the limit check, both insert; the unique
  // index rejects the loser. That must read as a revisit, not an error and
  // not a second allowance.
  it("absorbs a lost insert race as a revisit rather than failing", async () => {
    mocks.explorationCount.mockResolvedValue(9);
    mocks.explorationCreate.mockRejectedValue(
      Object.assign(new Error("unique constraint"), { code: "P2002" }),
    );
    const r = await recordCareerExploration("u1", "nurse");
    expect(r.allowed).toBe(true);
    expect(r).toMatchObject({ alreadyExplored: true });
  });

  it("never limits Pro", async () => {
    mocks.entitlements.mockResolvedValue(PRO);
    mocks.explorationCount.mockResolvedValue(500);
    expect((await recordCareerExploration("u1", "pilot")).allowed).toBe(true);
  });

  // A brand-new account with no profile row must not be gated out of the
  // product on a technicality.
  it("allows exploration when the user has no profile yet", async () => {
    mocks.profileFind.mockResolvedValue(null);
    expect((await recordCareerExploration("u1", "nurse")).allowed).toBe(true);
  });
});

describe("allowances view", () => {
  it("reports used, limit and remaining for the profile page", async () => {
    mocks.explorationCount.mockResolvedValue(7);
    mocks.aiCount.mockResolvedValue(4);
    mocks.savedCount.mockResolvedValue(2);

    const a = await getAllowances("u1");
    expect(a.careerExplorations).toMatchObject({ used: 7, limit: 10, remaining: 3, allowed: true });
    expect(a.careerTwinQuestions).toMatchObject({ used: 4, limit: 5, remaining: 1, allowed: true });
    expect(a.savedCareers).toMatchObject({ used: 2, limit: 20, remaining: 18 });
  });

  it("reports unlimited as null rather than a large number", async () => {
    mocks.entitlements.mockResolvedValue(PRO);
    const a = await getAllowances("u1");
    expect(a.careerExplorations.limit).toBeNull();
    expect(a.careerExplorations.remaining).toBeNull();
    expect(a.careerTwinQuestions.allowed).toBe(true);
  });

  // The two allowances are independent: spending Twin questions must not eat
  // career explorations.
  it("keeps the two counters separate", async () => {
    mocks.explorationCount.mockResolvedValue(9);
    mocks.aiCount.mockResolvedValue(1);
    const a = await getAllowances("u1");
    expect(a.careerExplorations.used).toBe(9);
    expect(a.careerTwinQuestions.used).toBe(1);
  });
});
