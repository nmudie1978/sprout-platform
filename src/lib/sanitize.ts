/**
 * Input Sanitization Utilities
 * Protects against XSS, SQL injection, and other attacks
 */

/**
 * Sanitize HTML to prevent XSS
 * Removes potentially dangerous HTML tags and attributes
 */
export function sanitizeHtml(input: string): string {
  // Remove script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove object tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

  // Remove embed tags
  sanitized = sanitized.replace(/<embed\b[^<]*>/gi, '');

  return sanitized.trim();
}

/**
 * Escape HTML special characters
 * Converts characters to HTML entities
 */
export function escapeHtml(input: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Sanitize user input for display
 * Allows basic formatting but removes dangerous content
 */
export function sanitizeUserInput(input: string): string {
  // First escape HTML
  let sanitized = escapeHtml(input);

  // Allow line breaks (convert \n to <br>)
  sanitized = sanitized.replace(/\n/g, '<br>');

  return sanitized;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();

  if (!emailRegex.test(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string | null {
  const cleaned = url.trim();

  // Block dangerous protocols
  if (
    cleaned.match(/^(javascript|data|vbscript):/i) ||
    cleaned.includes('<script')
  ) {
    return null;
  }

  // Only allow http, https, and mailto
  if (!cleaned.match(/^(https?:\/\/|mailto:)/i) && !cleaned.startsWith('/')) {
    return null;
  }

  return cleaned;
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators
  let sanitized = filename.replace(/[/\\]/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove leading dots
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized;
}

/**
 * Sanitize slug for URLs
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number,
  options?: { min?: number; max?: number; integer?: boolean }
): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (options?.integer && !Number.isInteger(num)) {
    return null;
  }

  if (options?.min !== undefined && num < options.min) {
    return null;
  }

  if (options?.max !== undefined && num > options.max) {
    return null;
  }

  return num;
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Remove null bytes and control characters
 */
export function removeControlCharacters(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Sanitize search query
 * Prevents SQL injection attempts in search
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove SQL keywords and special characters
  let sanitized = query.trim();

  // Remove multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Remove potentially dangerous characters for SQL
  sanitized = sanitized.replace(/[';--]/g, '');

  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }

  return sanitized;
}
