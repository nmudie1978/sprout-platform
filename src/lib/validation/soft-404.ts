/**
 * Soft-404 detection.
 *
 * Some sites answer a missing page with HTTP 200 and a body that says the
 * page is gone — antagning.se serves "Sidan kan inte hittas (404)" with a 200.
 * A status-code check alone therefore cannot tell a live citation from a dead
 * one, and a "verified" figure whose source has quietly rotted is an
 * unattributed claim.
 *
 * Deliberately conservative: it inspects only the title and the opening of
 * the document, so a page that merely discusses error handling is not
 * mistaken for one. Better to miss a soft 404 than to condemn a good source.
 */
const NOT_FOUND_PHRASES = [
  // Swedish
  "sidan kan inte hittas",
  "sidan kunde inte hittas",
  "sidan finns inte",
  // Norwegian / Danish
  "siden finnes ikke",
  "siden blev ikke fundet",
  // English
  "page not found",
  "page cannot be found",
  "page doesn't exist",
  "page does not exist",
];

/** How much of the document to inspect. A real 404 says so immediately. */
const INSPECT_CHARS = 2000;

export function looksLikeSoftNotFound(html: string): boolean {
  if (!html) return false;
  const head = html.slice(0, INSPECT_CHARS).toLowerCase();
  return NOT_FOUND_PHRASES.some((p) => head.includes(p));
}
