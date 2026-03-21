/**
 * YOUTH LENS — STAT INSIGHTS DATA
 *
 * Each StatInsight maps to a research stat shown in the
 * "Why This Matters" section. Tags are ordered by importance
 * (first 1–2 are "primary tags" that get a boost in matching).
 *
 * IDs must match the research stat IDs from researchEvidence.ts.
 */

import type { StatInsight } from "./types";

// ============================================
// STAT INSIGHTS
// ============================================

export const STAT_INSIGHTS: StatInsight[] = [
  {
    id: "oecd-career-uncertainty",
    headline: "39% of teenagers cannot name a career they expect to pursue",
    explanation:
      "When everyone asks 'what do you want to be?' — it's completely normal not to know. This stat shows you're not alone. The key isn't having an answer right now — it's starting to explore what's out there.",
    sourceLabel: "OECD · 2025",
    tags: [
      "career_uncertainty",
      "identity",
      "decision_making",
      "overwhelm",
      "career_pathways",
    ],
  },
  {
    id: "oecd-job-shadowing",
    headline: "Only 45% of students have experienced real workplaces",
    explanation:
      "Most career decisions are made without ever seeing how a job actually works. Job shadowing and workplace visits give you real information — not just guesswork from a brochure.",
    sourceLabel: "OECD PISA · 2024",
    tags: [
      "workplace_exposure",
      "job_shadowing",
      "first_job",
      "internship",
      "career_pathways",
    ],
  },
  {
    id: "gallup-path-uncertainty",
    headline: "41% of young people are unsure how to choose their path",
    explanation:
      "Feeling stuck between options — or having none that feel right — is incredibly common. The gap between aspiration and action is real, but small steps like talking to people in different roles can close it.",
    sourceLabel: "Gallup · 2024",
    tags: [
      "career_uncertainty",
      "decision_making",
      "career_pathways",
      "overwhelm",
      "guidance",
    ],
  },
  {
    id: "gallup-preparedness",
    headline: "43% of students don't feel prepared for their future",
    explanation:
      "Feeling unprepared doesn't mean you're behind — it means the system hasn't caught up. Small steps like shadowing someone at work, building one practical skill, or talking to a mentor can make a huge difference.",
    sourceLabel: "Gallup · 2025",
    tags: [
      "skills_gap",
      "confidence",
      "employability",
      "soft_skills",
      "adaptability",
    ],
  },
  {
    id: "oecd-career-outcomes",
    headline: "Career exploration leads to better employment outcomes",
    explanation:
      "Students who explore careers early — through job shadowing, conversations, or mentoring — end up with better jobs, higher earnings, and more satisfaction by age 25. Exploration works.",
    sourceLabel: "OECD · 2024",
    tags: [
      "career_pathways",
      "mentorship",
      "workplace_exposure",
      "employability",
      "guidance",
    ],
  },
];

// ============================================
// LOOKUP HELPERS
// ============================================

/**
 * Get a stat insight by its research stat ID.
 */
export function getStatInsight(statId: string): StatInsight | null {
  return STAT_INSIGHTS.find((s) => s.id === statId) ?? null;
}

/**
 * Get all stat insights.
 */
export function getAllStatInsights(): StatInsight[] {
  return STAT_INSIGHTS;
}
