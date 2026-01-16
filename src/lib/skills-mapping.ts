import { JobCategory } from "@prisma/client";

// Soft skills that youth can develop
export const SOFT_SKILLS = [
  "reliability",
  "communication",
  "problem-solving",
  "initiative",
  "responsibility",
  "time-management",
  "adaptability",
  "attention-to-detail",
  "customer-service",
  "teamwork",
] as const;

export type SoftSkill = typeof SOFT_SKILLS[number];

// Map job categories to the soft skills they develop
export const JOB_CATEGORY_SKILLS: Record<JobCategory, SoftSkill[]> = {
  BABYSITTING: [
    "responsibility",
    "communication",
    "problem-solving",
    "adaptability",
    "attention-to-detail",
  ],
  DOG_WALKING: [
    "reliability",
    "time-management",
    "responsibility",
    "initiative",
  ],
  SNOW_CLEARING: [
    "reliability",
    "initiative",
    "time-management",
    "responsibility",
  ],
  CLEANING: [
    "attention-to-detail",
    "reliability",
    "time-management",
    "responsibility",
  ],
  DIY_HELP: [
    "problem-solving",
    "initiative",
    "adaptability",
    "attention-to-detail",
  ],
  TECH_HELP: [
    "problem-solving",
    "communication",
    "adaptability",
    "customer-service",
  ],
  ERRANDS: [
    "reliability",
    "time-management",
    "initiative",
    "communication",
  ],
  OTHER: [
    "adaptability",
    "communication",
    "reliability",
  ],
};

// Calculate skill levels based on completed jobs
export function calculateSkillLevels(
  completedJobs: { category: JobCategory }[]
): Record<SoftSkill, number> {
  const skillCounts: Record<string, number> = {};

  // Count how many times each skill was practiced
  completedJobs.forEach((job) => {
    const skills = JOB_CATEGORY_SKILLS[job.category];
    skills.forEach((skill) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  // Convert counts to levels (0-100 scale)
  const skillLevels: Record<string, number> = {};
  SOFT_SKILLS.forEach((skill) => {
    const count = skillCounts[skill] || 0;
    // Each job contributes 10 points, capped at 100
    skillLevels[skill] = Math.min(count * 10, 100);
  });

  return skillLevels as Record<SoftSkill, number>;
}

// Get top skills for a user
export function getTopSkills(
  skillLevels: Record<SoftSkill, number>,
  limit: number = 5
): SoftSkill[] {
  return Object.entries(skillLevels)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([skill]) => skill as SoftSkill);
}

// Format skill name for display
export function formatSkillName(skill: SoftSkill): string {
  return skill
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Check if user has skills relevant to a career
export function hasRelevantSkills(
  userSkills: Record<SoftSkill, number>,
  careerRequiredSkills: string[],
  threshold: number = 20
): boolean {
  return careerRequiredSkills.some((skill) => {
    const normalizedSkill = skill.toLowerCase().replace(/\s+/g, "-") as SoftSkill;
    return userSkills[normalizedSkill] >= threshold;
  });
}
