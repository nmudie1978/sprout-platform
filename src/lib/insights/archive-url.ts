/**
 * Build a Wayback Machine fallback URL for a source link.
 *
 * Used as a graceful fallback so a rotted source URL never strands the
 * user on a raw 404 — they can always reach an archived copy (and it's
 * handy for citations).
 *
 * The `/web/2/<url>` form asks Wayback for the snapshot nearest to the
 * minimal timestamp, which it resolves to the latest available capture;
 * if a page was never archived, Wayback shows a "save this page" prompt
 * rather than a 404.
 */
export function archiveUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return `https://web.archive.org/web/2/${trimmed}`;
}
