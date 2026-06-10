import { z } from "zod";

/** Zod contract for the POST /api/feedback body (typed feedback model).
 *
 * A submission needs EITHER a star rating OR written feedback (a kind + a
 * non-empty message), or both — so a user can leave a quick 1-5 rating on its
 * own, or detailed feedback, without being forced into both. */
export const feedbackSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional().nullable(),
    kind: z.enum(["CONFUSED", "PROBLEM", "IDEA", "PRAISE"]).optional().nullable(),
    area: z
      .enum(["JOURNEY", "CAREER_RADAR", "EXPLORE_CAREERS", "LIBRARY", "CAREER_TWIN", "OTHER"])
      .optional()
      .nullable(),
    message: z.string().max(1000).optional().nullable(),
    role: z.enum(["TEEN_16_20", "PARENT_GUARDIAN", "ADULT_OTHER"]).optional().nullable(),
    source: z.string().max(50).optional().nullable(),
  })
  .refine(
    (d) =>
      d.rating != null ||
      (d.kind != null &&
        typeof d.message === "string" &&
        d.message.trim().length > 0),
    { message: "Add a rating or written feedback." },
  );

export type FeedbackInput = z.infer<typeof feedbackSchema>;

/** Detect likely personal contact info we don't want users to share. */
export function containsContactInfo(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();

  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailPattern.test(text)) return true;

  const phonePatterns = [
    /\b\d{8,}\b/,
    /\b\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}\b/,
    /\+\d{1,3}[-.\s]?\d/,
  ];
  for (const pattern of phonePatterns) {
    if (pattern.test(text)) return true;
  }

  const contactPhrases = [
    "email me",
    "call me",
    "text me",
    "reach me",
    "contact me",
    "my number",
    "my email",
    "my phone",
  ];
  for (const phrase of contactPhrases) {
    if (lower.includes(phrase)) return true;
  }

  return false;
}

/** Trim, collapse whitespace and cap the message at 1000 chars. */
export function sanitizeMessage(text: string): string {
  return text.trim().replace(/\s+/g, " ").slice(0, 1000);
}

/** Truncate the user-agent header for storage. */
export function truncateUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;
  return ua.slice(0, 200);
}
