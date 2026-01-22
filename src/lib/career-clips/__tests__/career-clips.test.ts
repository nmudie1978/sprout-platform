import { describe, it, expect, vi, beforeEach } from "vitest";
import { getValidClips, getClipsByCategory } from "../index";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    careerClip: {
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

// Import the mocked prisma
import { prisma } from "@/lib/prisma";
const mockPrisma = prisma as unknown as {
  careerClip: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
  };
};

describe("Career Clips Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getValidClips", () => {
    it("should only return clips with VALID status", async () => {
      const mockClips = [
        {
          id: "1",
          careerSlug: "doctor",
          categorySlug: "healthcare",
          title: "Day in the life of a doctor",
          platform: "YOUTUBE_SHORTS",
          url: "https://youtube.com/shorts/valid",
          thumbnailUrl: null,
          durationSecs: 60,
          sourceLabel: "YouTube Shorts (verified link)",
          lastCheckedAt: new Date(),
        },
      ];

      mockPrisma.careerClip.findMany.mockResolvedValue(mockClips);

      const clips = await getValidClips();

      // Verify the query filter
      expect(mockPrisma.careerClip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            verifiedStatus: "VALID",
          }),
        })
      );

      // Verify all returned clips have valid data
      expect(clips).toHaveLength(1);
      expect(clips[0].url).toBe("https://youtube.com/shorts/valid");
    });

    it("should never return clips with INVALID status", async () => {
      // Even if the mock returns invalid clips (shouldn't happen),
      // the query filter should prevent it
      mockPrisma.careerClip.findMany.mockResolvedValue([]);

      const clips = await getValidClips();

      // The query should filter by verifiedStatus: VALID
      expect(mockPrisma.careerClip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            verifiedStatus: "VALID",
          },
        })
      );

      expect(clips).toHaveLength(0);
    });

    it("should never return clips with PENDING status", async () => {
      mockPrisma.careerClip.findMany.mockResolvedValue([]);

      const clips = await getValidClips();

      // Verify filter excludes PENDING
      const callArgs = mockPrisma.careerClip.findMany.mock.calls[0][0];
      expect(callArgs.where.verifiedStatus).toBe("VALID");

      expect(clips).toHaveLength(0);
    });

    it("should filter by careerSlug when provided", async () => {
      mockPrisma.careerClip.findMany.mockResolvedValue([]);

      await getValidClips({ careerSlug: "doctor" });

      expect(mockPrisma.careerClip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            verifiedStatus: "VALID",
            careerSlug: "doctor",
          }),
        })
      );
    });

    it("should filter by categorySlug when provided", async () => {
      mockPrisma.careerClip.findMany.mockResolvedValue([]);

      await getValidClips({ categorySlug: "healthcare" });

      expect(mockPrisma.careerClip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            verifiedStatus: "VALID",
            categorySlug: "healthcare",
          }),
        })
      );
    });

    it("should respect limit parameter", async () => {
      mockPrisma.careerClip.findMany.mockResolvedValue([]);

      await getValidClips({ limit: 3 });

      expect(mockPrisma.careerClip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
        })
      );
    });

    it("should ensure all returned clips have valid URLs", async () => {
      const mockClips = [
        {
          id: "1",
          careerSlug: "nurse",
          categorySlug: "healthcare",
          title: "Nursing career",
          platform: "YOUTUBE_SHORTS",
          url: "https://www.youtube.com/shorts/abc123",
          thumbnailUrl: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
          durationSecs: 45,
          sourceLabel: "YouTube Shorts (verified link)",
          lastCheckedAt: new Date(),
        },
        {
          id: "2",
          careerSlug: "electrician",
          categorySlug: "trades",
          title: "Electrician day",
          platform: "TIKTOK",
          url: "https://www.tiktok.com/@user/video/456",
          thumbnailUrl: null,
          durationSecs: 30,
          sourceLabel: "TikTok (verified link)",
          lastCheckedAt: new Date(),
        },
      ];

      mockPrisma.careerClip.findMany.mockResolvedValue(mockClips);

      const clips = await getValidClips();

      // Verify all clips have URLs
      clips.forEach((clip) => {
        expect(clip.url).toBeTruthy();
        expect(clip.url).toMatch(/^https:\/\//);
      });
    });
  });

  describe("getClipsByCategory", () => {
    it("should only include valid clips in categories", async () => {
      const mockClips = [
        {
          id: "1",
          careerSlug: "doctor",
          categorySlug: "healthcare",
          title: "Doctor life",
          platform: "YOUTUBE_SHORTS",
          url: "https://youtube.com/shorts/1",
          thumbnailUrl: null,
          durationSecs: 60,
          sourceLabel: "YouTube Shorts (verified link)",
        },
        {
          id: "2",
          careerSlug: "nurse",
          categorySlug: "healthcare",
          title: "Nurse life",
          platform: "YOUTUBE_SHORTS",
          url: "https://youtube.com/shorts/2",
          thumbnailUrl: null,
          durationSecs: 45,
          sourceLabel: "YouTube Shorts (verified link)",
        },
      ];

      mockPrisma.careerClip.findMany.mockResolvedValue(mockClips);

      const categories = await getClipsByCategory(2);

      // Verify the query filter
      expect(mockPrisma.careerClip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { verifiedStatus: "VALID" },
        })
      );

      // Verify categories are properly grouped
      expect(categories.length).toBeGreaterThan(0);
      categories.forEach((cat) => {
        cat.clips.forEach((clip) => {
          expect(clip.url).toBeTruthy();
        });
      });
    });

    it("should limit clips per category", async () => {
      // 3 clips in same category
      const mockClips = [
        {
          id: "1",
          careerSlug: "doctor",
          categorySlug: "healthcare",
          title: "Clip 1",
          platform: "YOUTUBE_SHORTS",
          url: "https://youtube.com/shorts/1",
          thumbnailUrl: null,
          durationSecs: 60,
          sourceLabel: "",
        },
        {
          id: "2",
          careerSlug: "nurse",
          categorySlug: "healthcare",
          title: "Clip 2",
          platform: "YOUTUBE_SHORTS",
          url: "https://youtube.com/shorts/2",
          thumbnailUrl: null,
          durationSecs: 60,
          sourceLabel: "",
        },
        {
          id: "3",
          careerSlug: "surgeon",
          categorySlug: "healthcare",
          title: "Clip 3",
          platform: "YOUTUBE_SHORTS",
          url: "https://youtube.com/shorts/3",
          thumbnailUrl: null,
          durationSecs: 60,
          sourceLabel: "",
        },
      ];

      mockPrisma.careerClip.findMany.mockResolvedValue(mockClips);

      const categories = await getClipsByCategory(2);

      // Should only have 2 clips per category
      const healthcareCategory = categories.find(
        (c) => c.category === "healthcare"
      );
      expect(healthcareCategory?.clips.length).toBeLessThanOrEqual(2);
    });
  });

  describe("UI Rendering Safety", () => {
    it("should never include empty URLs in returned clips", async () => {
      const mockClips = [
        {
          id: "1",
          careerSlug: "doctor",
          categorySlug: "healthcare",
          title: "Valid clip",
          platform: "YOUTUBE_SHORTS",
          url: "https://youtube.com/shorts/valid",
          thumbnailUrl: null,
          durationSecs: 60,
          sourceLabel: "YouTube Shorts (verified link)",
          lastCheckedAt: new Date(),
        },
      ];

      mockPrisma.careerClip.findMany.mockResolvedValue(mockClips);

      const clips = await getValidClips();

      // Every clip must have a non-empty URL
      clips.forEach((clip) => {
        expect(clip.url).not.toBe("");
        expect(clip.url).not.toBe(null);
        expect(clip.url).not.toBe(undefined);
      });
    });

    it("should include all required display fields", async () => {
      const mockClips = [
        {
          id: "1",
          careerSlug: "doctor",
          categorySlug: "healthcare",
          title: "Valid clip",
          platform: "YOUTUBE_SHORTS",
          url: "https://youtube.com/shorts/valid",
          thumbnailUrl: "https://img.youtube.com/vi/valid/mqdefault.jpg",
          durationSecs: 60,
          sourceLabel: "YouTube Shorts (verified link)",
          lastCheckedAt: new Date(),
        },
      ];

      mockPrisma.careerClip.findMany.mockResolvedValue(mockClips);

      const clips = await getValidClips();

      clips.forEach((clip) => {
        // Required fields for display
        expect(clip).toHaveProperty("id");
        expect(clip).toHaveProperty("title");
        expect(clip).toHaveProperty("url");
        expect(clip).toHaveProperty("platform");
        expect(clip).toHaveProperty("sourceLabel");

        // URL must be valid format
        expect(clip.url).toMatch(/^https:\/\//);
      });
    });
  });
});
