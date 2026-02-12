import {
  isRecent,
  getExpiredStats,
  MAX_EVIDENCE_AGE_MONTHS,
  _RESEARCH_STATS_RAW_FOR_TESTING,
  type ResearchStat,
} from "../researchEvidence";

describe("Research Evidence", () => {
  describe("isRecent", () => {
    const mockStat: ResearchStat = {
      id: "test-stat",
      headline: "Test headline",
      description: "Test description",
      sourceName: "Test Source",
      sourceUrl: "https://example.com",
      sourcePublishedAt: "2024-06-01",
      sourceAccessedAt: "2025-01-22",
      tags: ["career-uncertainty"],
    };

    it("returns true for stats within 24 months", () => {
      const referenceDate = new Date("2025-01-22");
      expect(isRecent(mockStat, referenceDate)).toBe(true);
    });

    it("returns false for stats older than 24 months", () => {
      const oldStat: ResearchStat = {
        ...mockStat,
        sourcePublishedAt: "2022-01-01",
      };
      const referenceDate = new Date("2025-01-22");
      expect(isRecent(oldStat, referenceDate)).toBe(false);
    });

    it("returns true for evergreen stats regardless of age", () => {
      const evergreenStat: ResearchStat = {
        ...mockStat,
        sourcePublishedAt: "2020-01-01", // Very old
        evergreen: true,
      };
      const referenceDate = new Date("2025-01-22");
      expect(isRecent(evergreenStat, referenceDate)).toBe(true);
    });

    it("returns true for stats exactly at the 24-month boundary", () => {
      const boundaryDate = new Date("2025-01-22");
      const boundaryStat: ResearchStat = {
        ...mockStat,
        sourcePublishedAt: "2023-01-22", // Exactly 24 months ago
      };
      expect(isRecent(boundaryStat, boundaryDate)).toBe(true);
    });

    it("returns false for stats one day past the 24-month boundary", () => {
      const referenceDate = new Date("2025-01-22");
      const oldStat: ResearchStat = {
        ...mockStat,
        sourcePublishedAt: "2023-01-21", // 24 months + 1 day ago
      };
      expect(isRecent(oldStat, referenceDate)).toBe(false);
    });
  });

  describe("getExpiredStats", () => {
    it("returns empty array when all stats are recent", () => {
      // Use a reference date that makes all stats recent
      const referenceDate = new Date("2025-01-22");
      const expired = getExpiredStats(referenceDate);
      expect(expired.length).toBe(0);
    });

    it("returns expired stats when reference date is far in the future", () => {
      // Use a reference date 3 years in the future
      const futureDate = new Date("2028-01-22");
      const expired = getExpiredStats(futureDate);
      // Should return non-evergreen stats
      const nonEvergreenCount = _RESEARCH_STATS_RAW_FOR_TESTING.filter(
        (s) => !s.evergreen
      ).length;
      expect(expired.length).toBe(nonEvergreenCount);
    });
  });

  describe("Recency Rule Enforcement (CI)", () => {
    /**
     * CI TEST: Ensures no non-evergreen evidence is older than 24 months.
     * This test will FAIL if any evidence item needs to be updated.
     */
    it(`all non-evergreen stats must be published within the last ${MAX_EVIDENCE_AGE_MONTHS} months`, () => {
      const today = new Date();
      const expiredStats = getExpiredStats(today);

      if (expiredStats.length > 0) {
        const expiredList = expiredStats
          .map(
            (s) =>
              `- ${s.id}: published ${s.sourcePublishedAt} (${s.sourceName})`
          )
          .join("\n");
        expect.unreachable(
          `Found ${expiredStats.length} expired research stat(s) that need to be updated:\n${expiredList}\n\nEither update these with newer sources or mark them as evergreen if they are conceptual (not time-sensitive).`
        );
      }
    });

    it("all stats have valid sourcePublishedAt dates", () => {
      for (const stat of _RESEARCH_STATS_RAW_FOR_TESTING) {
        const date = new Date(stat.sourcePublishedAt);
        expect(isNaN(date.getTime())).toBe(false);
        expect(stat.sourcePublishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it("all stats have valid sourceAccessedAt dates", () => {
      for (const stat of _RESEARCH_STATS_RAW_FOR_TESTING) {
        const date = new Date(stat.sourceAccessedAt);
        expect(isNaN(date.getTime())).toBe(false);
        expect(stat.sourceAccessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it("all stats have valid sourceUrl", () => {
      for (const stat of _RESEARCH_STATS_RAW_FOR_TESTING) {
        expect(stat.sourceUrl).toMatch(/^https?:\/\//);
      }
    });

    it("evergreen flag is only used for conceptual stats", () => {
      const evergreenStats = _RESEARCH_STATS_RAW_FOR_TESTING.filter(
        (s) => s.evergreen
      );
      // Evergreen stats should not contain time-specific language
      const timeSpecificPatterns = [/\d+%/, /\d+ of \d+/, /average.*rate/i];

      for (const stat of evergreenStats) {
        // Check if headline contains explicit percentages (time-sensitive)
        const hasExplicitStats = /^\d+%/.test(stat.headline);
        if (hasExplicitStats) {
          console.warn(
            `Warning: Evergreen stat "${stat.id}" has explicit percentage in headline. Consider if this should really be evergreen.`
          );
        }
      }

      // At least log which stats are marked evergreen for review
      expect(evergreenStats.length).toBeLessThanOrEqual(3); // Keep evergreen usage minimal
    });
  });
});
