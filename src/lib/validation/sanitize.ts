/**
 * Server-side input sanitization utilities.
 *
 * Strips HTML tags and dangerous patterns from user-supplied text
 * before storage. This is a defense-in-depth measure — React already
 * auto-escapes on render, but sanitizing at write time prevents
 * stored XSS if data is consumed by non-React clients.
 */

/**
 * Strips HTML tags from a string. Preserves the text content.
 * Example: '<script>alert("xss")</script>' -> 'alert("xss")'
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes a user-supplied text string:
 * - Strips HTML tags
 * - Removes null bytes
 * - Trims whitespace
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  return stripHtmlTags(input)
    .replace(/\0/g, '') // Remove null bytes
    .trim();
}

/**
 * Sanitizes an array of strings.
 */
export function sanitizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is string => typeof item === 'string')
    .map(sanitizeText)
    .filter(Boolean);
}

/**
 * Validates that a URL uses http or https protocol.
 * Returns the original URL if valid, '#' otherwise.
 */
export function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch { /* invalid URL */ }
  return '#';
}
