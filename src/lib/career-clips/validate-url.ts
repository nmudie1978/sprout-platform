/**
 * Career Clips URL Validation
 *
 * Validates that clip URLs are accessible and from trusted platforms.
 * This ensures broken links are NEVER displayed to users.
 */

// Allowed domains for career clips
const ALLOWED_DOMAINS = [
  "vm.tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "tiktok.com",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
];

// Maximum redirects to follow
const MAX_REDIRECTS = 5;

// Validation timeout in milliseconds
const VALIDATION_TIMEOUT_MS = 10000;

export type ValidationResult = {
  isValid: boolean;
  reason?: string;
  finalUrl?: string;
  statusCode?: number;
};

/**
 * Check if a domain is in the allowlist
 */
function isDomainAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validates a URL format (must be HTTPS and allowed domain)
 */
function validateUrlFormat(url: string): ValidationResult {
  try {
    const parsed = new URL(url);

    // Must be HTTPS
    if (parsed.protocol !== "https:") {
      return {
        isValid: false,
        reason: "URL must use HTTPS protocol",
      };
    }

    // Must be from allowed domain
    if (!isDomainAllowed(url)) {
      return {
        isValid: false,
        reason: `Domain not in allowlist: ${parsed.hostname}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      reason: `Invalid URL format: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Makes a HEAD request with fallback to GET, following redirects
 */
async function checkUrlAccessibility(
  url: string,
  redirectCount = 0
): Promise<ValidationResult> {
  if (redirectCount >= MAX_REDIRECTS) {
    return {
      isValid: false,
      reason: `Too many redirects (max ${MAX_REDIRECTS})`,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    VALIDATION_TIMEOUT_MS
  );

  try {
    // Try HEAD request first (lighter)
    let response: Response;
    try {
      response = await fetch(url, {
        method: "HEAD",
        redirect: "manual", // Handle redirects manually to track them
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; YouthPlatform/1.0; +https://youth-platform.com)",
        },
      });
    } catch {
      // Fall back to GET with Range header if HEAD is blocked
      response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; YouthPlatform/1.0; +https://youth-platform.com)",
          Range: "bytes=0-0", // Request minimal data
        },
      });
    }

    clearTimeout(timeoutId);

    // Handle redirects
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        return {
          isValid: false,
          reason: `Redirect without location header (${response.status})`,
          statusCode: response.status,
        };
      }

      // Resolve relative URLs
      const redirectUrl = new URL(location, url).toString();

      // Check if redirect goes to allowed domain
      if (!isDomainAllowed(redirectUrl)) {
        return {
          isValid: false,
          reason: `Redirect to non-allowed domain: ${new URL(redirectUrl).hostname}`,
          statusCode: response.status,
        };
      }

      // Follow the redirect
      return checkUrlAccessibility(redirectUrl, redirectCount + 1);
    }

    // Check for success status codes
    if (
      (response.status >= 200 && response.status < 300) ||
      response.status === 304
    ) {
      // Additional check: ensure content type is appropriate
      const contentType = response.headers.get("content-type") || "";
      const validContentTypes = [
        "text/html",
        "video/",
        "application/json",
      ];

      const isValidContentType = validContentTypes.some((type) =>
        contentType.toLowerCase().includes(type)
      );

      if (!isValidContentType && contentType) {
        // Some platforms don't return content-type for HEAD, so only fail if it's set and invalid
        return {
          isValid: false,
          reason: `Unexpected content type: ${contentType}`,
          statusCode: response.status,
        };
      }

      return {
        isValid: true,
        finalUrl: url,
        statusCode: response.status,
      };
    }

    // Handle error status codes
    if (response.status === 404 || response.status === 410) {
      return {
        isValid: false,
        reason: `Content not found (${response.status})`,
        statusCode: response.status,
      };
    }

    if (response.status >= 500) {
      return {
        isValid: false,
        reason: `Server error (${response.status})`,
        statusCode: response.status,
      };
    }

    // For other 4xx errors, consider them failures
    return {
      isValid: false,
      reason: `HTTP error (${response.status})`,
      statusCode: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          isValid: false,
          reason: "Request timed out",
        };
      }

      // DNS failures, connection refused, etc.
      return {
        isValid: false,
        reason: `Network error: ${error.message}`,
      };
    }

    return {
      isValid: false,
      reason: "Unknown error during validation",
    };
  }
}

/**
 * Main validation function - validates a clip URL
 *
 * @param url - The URL to validate
 * @returns ValidationResult with isValid boolean and reason for failure
 */
export async function validateClipUrl(url: string): Promise<ValidationResult> {
  // Step 1: Validate URL format
  const formatResult = validateUrlFormat(url);
  if (!formatResult.isValid) {
    return formatResult;
  }

  // Step 2: Check URL accessibility
  return checkUrlAccessibility(url);
}

/**
 * Check if a clip needs re-validation (older than 7 days)
 */
export function needsRevalidation(lastCheckedAt: Date | null): boolean {
  if (!lastCheckedAt) return true;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return lastCheckedAt < sevenDaysAgo;
}

/**
 * Get the platform-specific thumbnail URL
 */
export function getPlatformThumbnail(
  platform: "TIKTOK" | "YOUTUBE_SHORTS",
  url: string
): string | null {
  try {
    const parsed = new URL(url);

    if (platform === "YOUTUBE_SHORTS") {
      // Extract video ID from various YouTube URL formats
      let videoId: string | null = null;

      if (parsed.hostname === "youtu.be") {
        videoId = parsed.pathname.slice(1);
      } else if (parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0];
      } else if (parsed.searchParams.has("v")) {
        videoId = parsed.searchParams.get("v");
      }

      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    }

    // TikTok doesn't provide easy thumbnail access, return null
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate source label for display
 */
export function getSourceLabel(platform: "TIKTOK" | "YOUTUBE_SHORTS"): string {
  switch (platform) {
    case "TIKTOK":
      return "TikTok (verified link)";
    case "YOUTUBE_SHORTS":
      return "YouTube Shorts (verified link)";
    default:
      return "Verified link";
  }
}
