/**
 * Shared contract between saving a Skills That Matter card (the gallery) and
 * listing saved Insights content (the My Library "My Content" tab). Both sides
 * MUST use SKILLS_CONTENT_TAG so the tab can filter to insights-origin items
 * without a schema change.
 */

/** Tag applied to SavedItems created from the Skills That Matter gallery. */
export const SKILLS_CONTENT_TAG = "skills-that-matter";

/**
 * Tag applied to SavedItems created by bookmarking a career VIDEO — the
 * "Watch: careers in AI" carousel in Industry Insights, the "A Day in the
 * Life" clip in Discover, and the "Real voices" reality clips in Understand.
 * The "My Content" tab lists items carrying EITHER this tag or
 * SKILLS_CONTENT_TAG (the saved-items API filters tags with OR/hasSome), so
 * saved videos and any legacy skills cards share one place.
 */
export const CAREER_VIDEO_TAG = "career-video";

/** Tags whose SavedItems surface in the My Library "My Content" tab. */
export const MY_CONTENT_TAGS = [SKILLS_CONTENT_TAG, CAREER_VIDEO_TAG];

/** SavedItem types the gallery can produce (mirrors the Prisma SavedItemType). */
export type SaveableType = "ARTICLE" | "VIDEO" | "PODCAST" | "SHORT";

/**
 * Map a gallery card's display badge ("Article" | "Podcast" | "Video") to a
 * SavedItemType. Unknown/missing badges default to ARTICLE (the safest, most
 * common type) rather than throwing.
 */
export function badgeToSavedItemType(badge: string | undefined): SaveableType {
  switch ((badge ?? "").toLowerCase()) {
    case "video":
      return "VIDEO";
    case "podcast":
      return "PODCAST";
    case "article":
      return "ARTICLE";
    default:
      return "ARTICLE";
  }
}
