import { describe, it, expect } from "vitest";

/**
 * PathSnapshot Generation Tests
 *
 * Tests the format and constraints of PathSnapshot generation.
 * Ensures direction has 1-3 roles and nextActions has 3-7 items.
 */

interface NextAction {
  type: "earn" | "learn" | "grow";
  action: string;
  link?: string;
}

interface PathSnapshotData {
  headline: string;
  direction: string[];
  nextActions: NextAction[];
  confidence: "low" | "medium" | "high";
  rationale: string;
}

interface UserData {
  completedJobsCount: number;
  reviewsCount: number;
  averageRating: number | null;
  desiredRoles: string[];
  completedCategories: string[];
  vaultCount: number;
  hasSkillSignals: boolean;
}

/**
 * Generate a PathSnapshot based on user data
 * This mirrors the logic in actions.ts generatePathSnapshot()
 */
function generateSnapshotData(userData: UserData): PathSnapshotData {
  // Determine confidence level
  let confidence: "low" | "medium" | "high" = "low";
  if (userData.completedJobsCount >= 5 && userData.reviewsCount >= 3) {
    confidence = "high";
  } else if (userData.completedJobsCount >= 2 || userData.reviewsCount >= 1) {
    confidence = "medium";
  }

  // Generate headline
  let headline = "Starting your journey";
  if (userData.completedJobsCount >= 5) {
    headline = "Building momentum";
  } else if (userData.completedJobsCount >= 2) {
    headline = "Growing your experience";
  } else if (userData.completedJobsCount >= 1) {
    headline = "Your first steps";
  }

  // Generate direction (1-3 roles)
  const direction: string[] = [];
  if (userData.desiredRoles.length > 0) {
    direction.push(...userData.desiredRoles.slice(0, 3));
  } else if (userData.completedCategories.length > 0) {
    direction.push(...userData.completedCategories.slice(0, 2));
  } else {
    direction.push("Explore different opportunities");
  }

  // Generate next actions (3-7)
  const nextActions: NextAction[] = [];

  // Always suggest completing more jobs if low count
  if (userData.completedJobsCount < 3) {
    nextActions.push({
      type: "earn",
      action: "Complete your first few jobs to build your profile",
      link: "/jobs",
    });
  }

  // Suggest skill building
  if (!userData.hasSkillSignals) {
    nextActions.push({
      type: "learn",
      action: "Take on a job that requires clear communication",
    });
  }

  // Suggest building vault
  if (userData.vaultCount < 3) {
    nextActions.push({
      type: "grow",
      action: "Add completed jobs to your Vault as proof",
      link: "/my-path/vault",
    });
  }

  // Always add a learn action
  nextActions.push({
    type: "learn",
    action: "Check out recommended courses",
    link: "/my-path/courses",
  });

  // Add explore action if no desired roles set
  if (userData.desiredRoles.length === 0) {
    nextActions.push({
      type: "grow",
      action: "Set your career interests in your profile",
      link: "/profile",
    });
  }

  // Add a job action
  nextActions.push({
    type: "earn",
    action: "Apply to a recommended job match",
    link: "/my-path/job-picks",
  });

  // Add extra actions to reach minimum
  while (nextActions.length < 3) {
    nextActions.push({
      type: "earn",
      action: "Browse available jobs in your area",
      link: "/jobs",
    });
  }

  // Cap at 7 actions
  const finalActions = nextActions.slice(0, 7);

  // Generate rationale
  let rationale = "";
  if (userData.completedJobsCount > 0) {
    rationale = `Based on ${userData.completedJobsCount} completed job${userData.completedJobsCount > 1 ? "s" : ""}`;
    if (userData.reviewsCount > 0 && userData.averageRating) {
      rationale += ` with ${userData.averageRating.toFixed(1)} average rating`;
    }
    rationale += ".";
  } else {
    rationale = "Get started by completing your first job.";
  }

  return {
    headline,
    direction,
    nextActions: finalActions,
    confidence,
    rationale,
  };
}

describe("PathSnapshot Generation Format", () => {
  it("direction has between 1 and 3 roles", () => {
    // Test with many desired roles - should cap at 3
    const manyRoles = generateSnapshotData({
      completedJobsCount: 0,
      reviewsCount: 0,
      averageRating: null,
      desiredRoles: ["Developer", "Designer", "Manager", "Analyst", "Engineer"],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });

    expect(manyRoles.direction.length).toBeLessThanOrEqual(3);
    expect(manyRoles.direction.length).toBeGreaterThanOrEqual(1);

    // Test with no roles - should have exactly 1 (fallback)
    const noRoles = generateSnapshotData({
      completedJobsCount: 0,
      reviewsCount: 0,
      averageRating: null,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });

    expect(noRoles.direction.length).toBe(1);
    expect(noRoles.direction[0]).toBe("Explore different opportunities");

    // Test with 2 roles - should have exactly 2
    const twoRoles = generateSnapshotData({
      completedJobsCount: 0,
      reviewsCount: 0,
      averageRating: null,
      desiredRoles: ["Developer", "Designer"],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });

    expect(twoRoles.direction.length).toBe(2);
  });

  it("nextActions has between 3 and 7 items", () => {
    // Test new user - should have multiple actions
    const newUser = generateSnapshotData({
      completedJobsCount: 0,
      reviewsCount: 0,
      averageRating: null,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });

    expect(newUser.nextActions.length).toBeGreaterThanOrEqual(3);
    expect(newUser.nextActions.length).toBeLessThanOrEqual(7);

    // Test experienced user with everything filled
    const experiencedUser = generateSnapshotData({
      completedJobsCount: 10,
      reviewsCount: 5,
      averageRating: 4.8,
      desiredRoles: ["Developer"],
      completedCategories: ["TECH_HELP"],
      vaultCount: 10,
      hasSkillSignals: true,
    });

    expect(experiencedUser.nextActions.length).toBeGreaterThanOrEqual(3);
    expect(experiencedUser.nextActions.length).toBeLessThanOrEqual(7);
  });

  it("confidence is low, medium, or high based on activity", () => {
    // Low: no completed jobs, no reviews
    const lowConfidence = generateSnapshotData({
      completedJobsCount: 0,
      reviewsCount: 0,
      averageRating: null,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });
    expect(lowConfidence.confidence).toBe("low");

    // Medium: some activity
    const mediumConfidence = generateSnapshotData({
      completedJobsCount: 2,
      reviewsCount: 0,
      averageRating: null,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });
    expect(mediumConfidence.confidence).toBe("medium");

    // High: significant activity
    const highConfidence = generateSnapshotData({
      completedJobsCount: 5,
      reviewsCount: 3,
      averageRating: 4.5,
      desiredRoles: ["Developer"],
      completedCategories: ["TECH_HELP"],
      vaultCount: 5,
      hasSkillSignals: true,
    });
    expect(highConfidence.confidence).toBe("high");
  });

  it("each nextAction has valid type (earn, learn, or grow)", () => {
    const snapshot = generateSnapshotData({
      completedJobsCount: 2,
      reviewsCount: 1,
      averageRating: 4.0,
      desiredRoles: ["Designer"],
      completedCategories: ["CLEANING"],
      vaultCount: 1,
      hasSkillSignals: true,
    });

    const validTypes = ["earn", "learn", "grow"];
    for (const action of snapshot.nextActions) {
      expect(validTypes).toContain(action.type);
      expect(action.action).toBeTruthy();
      expect(typeof action.action).toBe("string");
    }
  });

  it("headline varies based on job count", () => {
    const noJobs = generateSnapshotData({
      completedJobsCount: 0,
      reviewsCount: 0,
      averageRating: null,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });
    expect(noJobs.headline).toBe("Starting your journey");

    const oneJob = generateSnapshotData({
      completedJobsCount: 1,
      reviewsCount: 0,
      averageRating: null,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });
    expect(oneJob.headline).toBe("Your first steps");

    const threeJobs = generateSnapshotData({
      completedJobsCount: 3,
      reviewsCount: 1,
      averageRating: 4.0,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });
    expect(threeJobs.headline).toBe("Growing your experience");

    const manyJobs = generateSnapshotData({
      completedJobsCount: 10,
      reviewsCount: 5,
      averageRating: 4.5,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });
    expect(manyJobs.headline).toBe("Building momentum");
  });

  it("rationale is grounded in user activity", () => {
    const noActivity = generateSnapshotData({
      completedJobsCount: 0,
      reviewsCount: 0,
      averageRating: null,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });
    expect(noActivity.rationale).toContain("Get started");

    const withActivity = generateSnapshotData({
      completedJobsCount: 5,
      reviewsCount: 3,
      averageRating: 4.5,
      desiredRoles: [],
      completedCategories: [],
      vaultCount: 0,
      hasSkillSignals: false,
    });
    expect(withActivity.rationale).toContain("5 completed jobs");
    expect(withActivity.rationale).toContain("4.5 average rating");
  });
});
