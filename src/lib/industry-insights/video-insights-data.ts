/**
 * VIDEO INSIGHTS — CURATED DATA
 *
 * Structured video content tied to specific youth career statistics.
 * All videos are from verified TED/TEDx channels on YouTube.
 *
 * Videos must be manually curated by admin.
 * Future: CMS-based moderation system.
 * No user-submitted videos at MVP stage.
 *
 * Last verified: February 2026
 */

import type { IndustryStatInsight } from "./video-insights-types";

// ============================================
// CURATED STAT → VIDEO MAPPINGS
// ============================================

const STAT_VIDEO_INSIGHTS: IndustryStatInsight[] = [
  {
    id: "oecd-career-uncertainty",
    headline: "39% of teenagers cannot name a career they expect to pursue",
    percentage: "39%",
    summary:
      "Nearly two in five 15-year-olds can't name a job they expect to hold by age 30.",
    explanation:
      "When everyone asks 'what do you want to be?' — it's completely normal not to know. This stat shows you're not alone. The key isn't having an answer right now — it's starting to explore what's out there.",
    videos: [
      {
        id: "vi-career-clarity-01",
        title: "It's okay not knowing what's after graduation",
        description:
          "Daisy Osberg normalises the pressure teenagers face to have their futures figured out.",
        duration: "5:27",
        type: "explainer",
        source: "ted",
        embedUrl: "https://www.youtube.com/embed/uRHWR_aYb4w",
        thumbnailUrl:
          "https://img.youtube.com/vi/uRHWR_aYb4w/mqdefault.jpg",
      },
      {
        id: "vi-career-explore-02",
        title: "Why some of us don't have one true calling",
        description:
          "Emilie Wapnick explains why having many interests is a strength, not a weakness.",
        duration: "12:16",
        type: "explainer",
        source: "ted",
        embedUrl: "https://www.youtube.com/embed/4sZdcB6bjI8",
        thumbnailUrl:
          "https://img.youtube.com/vi/4sZdcB6bjI8/mqdefault.jpg",
      },
      {
        id: "vi-career-story-03",
        title: "The best career path isn't always a straight line",
        description:
          "Sarah Ellis and Helen Tupper on why 'squiggly careers' are the new normal.",
        duration: "9:17",
        type: "story",
        source: "ted",
        embedUrl: "https://www.youtube.com/embed/1ALfKWG2nmw",
        thumbnailUrl:
          "https://img.youtube.com/vi/1ALfKWG2nmw/mqdefault.jpg",
      },
    ],
  },
  {
    id: "gallup-preparedness",
    headline: "43% of students don't feel prepared for their future",
    percentage: "43%",
    summary:
      "Nearly half of young people feel unprepared for what lies ahead.",
    explanation:
      "Feeling unprepared doesn't mean you're behind — it means the system hasn't caught up. Small steps like shadowing someone at work, building one practical skill, or talking to a mentor can make a huge difference.",
    videos: [
      {
        id: "vi-skills-gap-04",
        title: "3 Skills to thrive in the workplace",
        description:
          "Taj Pabari on the skills everyone needs to thrive — and why the classroom doesn't teach them.",
        duration: "13:45",
        type: "explainer",
        source: "ted",
        embedUrl: "https://www.youtube.com/embed/gk_H8bEOuFo",
        thumbnailUrl:
          "https://img.youtube.com/vi/gk_H8bEOuFo/mqdefault.jpg",
      },
      {
        id: "vi-confidence-05",
        title: "Six behaviors to increase your confidence",
        description:
          "Emily Jaenson shares actionable behaviours anyone can adopt to build real confidence.",
        duration: "10:13",
        type: "story",
        source: "ted",
        embedUrl: "https://www.youtube.com/embed/IitIl2C3Iy8",
        thumbnailUrl:
          "https://img.youtube.com/vi/IitIl2C3Iy8/mqdefault.jpg",
      },
    ],
  },
];

// ============================================
// LOOKUP HELPERS
// ============================================

/**
 * Get video insight data for a specific research stat ID.
 * Returns null if no videos are mapped to that stat.
 */
export function getStatVideoInsight(
  statId: string,
): IndustryStatInsight | null {
  return STAT_VIDEO_INSIGHTS.find((s) => s.id === statId) ?? null;
}

/**
 * Get all stat video insights.
 */
export function getAllStatVideoInsights(): IndustryStatInsight[] {
  return STAT_VIDEO_INSIGHTS;
}
