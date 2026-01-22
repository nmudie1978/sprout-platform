import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateClipUrl,
  needsRevalidation,
  getPlatformThumbnail,
  getSourceLabel,
} from "../validate-url";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Career Clips URL Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateClipUrl", () => {
    describe("URL Format Validation", () => {
      it("should reject non-HTTPS URLs", async () => {
        const result = await validateClipUrl(
          "http://www.youtube.com/shorts/abc123"
        );
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("HTTPS");
      });

      it("should reject URLs from non-allowed domains", async () => {
        const result = await validateClipUrl("https://www.example.com/video");
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("not in allowlist");
      });

      it("should reject invalid URL formats", async () => {
        const result = await validateClipUrl("not-a-valid-url");
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("Invalid URL");
      });

      it("should accept YouTube URLs", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: { get: (key: string) => key === "content-type" ? "text/html" : null },
        });

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc123"
        );
        expect(result.isValid).toBe(true);
      });

      it("should accept TikTok URLs", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: { get: (key: string) => key === "content-type" ? "text/html" : null },
        });

        const result = await validateClipUrl(
          "https://www.tiktok.com/@user/video/123"
        );
        expect(result.isValid).toBe(true);
      });

      it("should accept youtu.be short URLs", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: { get: (key: string) => key === "content-type" ? "text/html" : null },
        });

        const result = await validateClipUrl("https://youtu.be/abc123");
        expect(result.isValid).toBe(true);
      });

      it("should accept vm.tiktok.com URLs", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: { get: (key: string) => key === "content-type" ? "text/html" : null },
        });

        const result = await validateClipUrl("https://vm.tiktok.com/abc123");
        expect(result.isValid).toBe(true);
      });
    });

    describe("HTTP Status Handling", () => {
      it("should mark URL as valid for 200 response", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: { get: (key: string) => key === "content-type" ? "text/html" : null },
        });

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(true);
        expect(result.statusCode).toBe(200);
      });

      it("should mark URL as valid for 206 partial content response", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 206,
          headers: { get: (key: string) => key === "content-type" ? "video/mp4" : null },
        });

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(true);
      });

      it("should mark URL as invalid for 404 response", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 404,
          headers: { get: () => null },
        });

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("not found");
      });

      it("should mark URL as invalid for 410 Gone response", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 410,
          headers: { get: () => null },
        });

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("not found");
      });

      it("should mark URL as invalid for 500 server error", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 500,
          headers: { get: () => null },
        });

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("Server error");
      });
    });

    describe("Redirect Handling", () => {
      it("should follow redirects to allowed domains", async () => {
        // First call returns redirect
        mockFetch.mockResolvedValueOnce({
          status: 301,
          headers: { get: (key: string) => key === "location" ? "https://www.youtube.com/shorts/final" : null },
        });
        // Second call returns success
        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: { get: (key: string) => key === "content-type" ? "text/html" : null },
        });

        const result = await validateClipUrl(
          "https://youtu.be/abc"
        );
        expect(result.isValid).toBe(true);
      });

      it("should reject redirects to non-allowed domains", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 301,
          headers: { get: (key: string) => key === "location" ? "https://malicious.com/video" : null },
        });

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("non-allowed domain");
      });

      it("should reject redirect loops (max 5 redirects)", async () => {
        // Return 6 redirects
        for (let i = 0; i < 6; i++) {
          mockFetch.mockResolvedValueOnce({
            status: 301,
            headers: { get: (key: string) => key === "location" ? `https://www.youtube.com/redirect${i}` : null },
          });
        }

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("Too many redirects");
      });
    });

    describe("Error Handling", () => {
      it("should handle network errors gracefully", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("Network error");
      });

      it("should handle errors during fetch and return invalid", async () => {
        // Simulate connection refused or DNS failure
        mockFetch.mockRejectedValueOnce(new Error("Connection refused"));
        mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(false);
        // Any network failure should result in invalid status
        expect(result.reason).toBeDefined();
      });

      it("should fallback to GET if HEAD request fails", async () => {
        // HEAD fails
        mockFetch.mockRejectedValueOnce(new Error("HEAD not supported"));
        // GET succeeds
        mockFetch.mockResolvedValueOnce({
          status: 200,
          headers: { get: (key: string) => key === "content-type" ? "text/html" : null },
        });

        const result = await validateClipUrl(
          "https://www.youtube.com/shorts/abc"
        );
        expect(result.isValid).toBe(true);
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("needsRevalidation", () => {
    it("should return true for null lastCheckedAt", () => {
      expect(needsRevalidation(null)).toBe(true);
    });

    it("should return true for dates older than 7 days", () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
      expect(needsRevalidation(eightDaysAgo)).toBe(true);
    });

    it("should return false for dates within 7 days", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(needsRevalidation(threeDaysAgo)).toBe(false);
    });

    it("should return false for today", () => {
      expect(needsRevalidation(new Date())).toBe(false);
    });
  });

  describe("getPlatformThumbnail", () => {
    it("should generate thumbnail for YouTube shorts URL", () => {
      const thumbnail = getPlatformThumbnail(
        "YOUTUBE_SHORTS",
        "https://www.youtube.com/shorts/abc123"
      );
      expect(thumbnail).toBe("https://img.youtube.com/vi/abc123/mqdefault.jpg");
    });

    it("should generate thumbnail for youtu.be URL", () => {
      const thumbnail = getPlatformThumbnail(
        "YOUTUBE_SHORTS",
        "https://youtu.be/xyz789"
      );
      expect(thumbnail).toBe("https://img.youtube.com/vi/xyz789/mqdefault.jpg");
    });

    it("should generate thumbnail for YouTube watch URL", () => {
      const thumbnail = getPlatformThumbnail(
        "YOUTUBE_SHORTS",
        "https://www.youtube.com/watch?v=test123"
      );
      expect(thumbnail).toBe(
        "https://img.youtube.com/vi/test123/mqdefault.jpg"
      );
    });

    it("should return null for TikTok (no easy thumbnail)", () => {
      const thumbnail = getPlatformThumbnail(
        "TIKTOK",
        "https://www.tiktok.com/@user/video/123"
      );
      expect(thumbnail).toBeNull();
    });

    it("should return null for invalid URLs", () => {
      const thumbnail = getPlatformThumbnail("YOUTUBE_SHORTS", "invalid-url");
      expect(thumbnail).toBeNull();
    });
  });

  describe("getSourceLabel", () => {
    it("should return correct label for TikTok", () => {
      expect(getSourceLabel("TIKTOK")).toBe("TikTok (verified link)");
    });

    it("should return correct label for YouTube Shorts", () => {
      expect(getSourceLabel("YOUTUBE_SHORTS")).toBe(
        "YouTube Shorts (verified link)"
      );
    });
  });
});
