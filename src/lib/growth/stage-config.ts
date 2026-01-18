import { Compass, Hammer, Send, LucideIcon } from "lucide-react";

export type StageId = "explore" | "build" | "apply";

export interface StageConfig {
  id: StageId;
  label: string;
  description: string;
  route: string;
  nextStage: StageId | null;
  icon: LucideIcon;
  microcopy: string;
  stopNumber: number;
}

export interface ReadinessCheck {
  hasTargetCareer: boolean;
  hasSkillTags: boolean;
  hasLocationPreference: boolean;
  hasCV: boolean;
}

export const STAGES: Record<StageId, StageConfig> = {
  explore: {
    id: "explore",
    label: "Explore",
    description: "Discover careers that match your interests",
    route: "/growth/explore",
    nextStage: "build",
    icon: Compass,
    microcopy: "Find your direction",
    stopNumber: 1,
  },
  build: {
    id: "build",
    label: "Build",
    description: "Develop the skills and experience you need",
    route: "/growth/build",
    nextStage: "apply",
    icon: Hammer,
    microcopy: "Grow your skills",
    stopNumber: 2,
  },
  apply: {
    id: "apply",
    label: "Apply",
    description: "Start applying to real opportunities",
    route: "/growth/apply",
    nextStage: null,
    icon: Send,
    microcopy: "Take action",
    stopNumber: 3,
  },
};

export const STAGE_ORDER: StageId[] = ["explore", "build", "apply"];

export const TOTAL_STAGES = 3;

/**
 * Get stage config by route path
 */
export function getStageFromPath(pathname: string): StageConfig | null {
  for (const stage of Object.values(STAGES)) {
    if (pathname === stage.route || pathname.startsWith(`${stage.route}/`)) {
      return stage;
    }
  }
  return null;
}

/**
 * Get the current stage ID from a pathname
 */
export function getStageIdFromPath(pathname: string): StageId | null {
  const stage = getStageFromPath(pathname);
  return stage?.id || null;
}

/**
 * Determine readiness to advance from one stage to the next
 */
export function checkStageReadiness(
  currentStage: StageId,
  readiness: ReadinessCheck
): { canAdvance: boolean; blockers: string[] } {
  const blockers: string[] = [];

  if (currentStage === "explore") {
    // To advance from Explore to Build, need a target career
    if (!readiness.hasTargetCareer) {
      blockers.push("Choose a target career to focus on");
    }
  } else if (currentStage === "build") {
    // To advance from Build to Apply, need skills and location
    if (!readiness.hasSkillTags) {
      blockers.push("Add at least one skill to your profile");
    }
    if (!readiness.hasLocationPreference) {
      blockers.push("Set your location preference");
    }
  }
  // Apply stage: Can always "advance" (complete journey)

  return {
    canAdvance: blockers.length === 0,
    blockers,
  };
}

/**
 * Get the suggested next stage based on user's current readiness
 */
export function getSuggestedStage(readiness: ReadinessCheck): StageId {
  // If no career goal, start at Explore
  if (!readiness.hasTargetCareer) {
    return "explore";
  }

  // If has career but missing skills/location, go to Build
  if (!readiness.hasSkillTags || !readiness.hasLocationPreference) {
    return "build";
  }

  // Ready to apply
  return "apply";
}

/**
 * Get the previous stage in the journey
 */
export function getPreviousStage(stageId: StageId): StageId | null {
  const index = STAGE_ORDER.indexOf(stageId);
  if (index <= 0) return null;
  return STAGE_ORDER[index - 1];
}

/**
 * Get context banner content for a stage
 */
export function getStageBanner(stageId: StageId): {
  title: string;
  description: string;
  purpose: string;
} {
  switch (stageId) {
    case "explore":
      return {
        title: "Explore Careers",
        description:
          "Discover careers that match your interests and see what paths are available.",
        purpose:
          "This is where you figure out what you want to pursue. No pressure, just exploration.",
      };
    case "build":
      return {
        title: "Build Your Profile",
        description:
          "Develop the skills, experience, and credentials you need for your target career.",
        purpose:
          "This is where you prepare for your career by building real skills and proof.",
      };
    case "apply":
      return {
        title: "Apply to Opportunities",
        description:
          "Start applying to real jobs and opportunities in your target field.",
        purpose:
          "This is where you take action and start your career journey for real.",
      };
  }
}
