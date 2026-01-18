import { describe, it, expect } from "vitest";

/**
 * Job Ranking Scoring Tests
 *
 * Tests the deterministic scoring logic used for smart job picks.
 * This mirrors the scoring algorithm in actions.ts getSmartJobPicksInternal()
 */

// Types mirroring the actual implementation
interface JobForRanking {
  id: string;
  title: string;
  category: string;
  payAmount: number;
  payType: string;
  location: string;
  createdAt: Date;
  employerVerified: boolean;
}

interface UserContext {
  userSkillSlugs: Set<string>;
  completedCategories: Set<string>;
}

// Skill mapping (simplified for testing)
const skillsPerJobCategory: Record<string, string[]> = {
  BABYSITTING: ["babysitting", "child-activities", "patience", "communication"],
  DOG_WALKING: ["dog-walking", "punctuality", "reliability"],
  CLEANING: ["house-cleaning", "attention-to-detail", "time-management"],
  TECH_HELP: ["tech-help-basic", "troubleshooting", "communication"],
};

/**
 * Calculate job score based on multiple factors
 * This is a deterministic scoring function
 */
function calculateJobScore(
  job: JobForRanking,
  userContext: UserContext
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Skill growth score (higher if job builds skills user lacks)
  const jobSkills = skillsPerJobCategory[job.category] || [];
  const newSkillsCount = jobSkills.filter(
    (s) => !userContext.userSkillSlugs.has(s)
  ).length;
  if (newSkillsCount > 0) {
    score += newSkillsCount * 10;
    reasons.push(`Builds ${newSkillsCount} new skills`);
  }

  // Earnings score (higher pay = higher score)
  if (job.payAmount >= 200) {
    score += 20;
    reasons.push("Good pay");
  } else if (job.payAmount >= 150) {
    score += 10;
  }

  // Safety score (verified employer)
  if (job.employerVerified) {
    score += 15;
    reasons.push("Verified employer");
  }

  // Category match (if user has done similar before)
  if (userContext.completedCategories.has(job.category)) {
    score += 5;
    reasons.push("Similar to past jobs");
  }

  // Recency bonus
  const daysOld = Math.floor(
    (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysOld < 3) {
    score += 10;
    reasons.push("Recently posted");
  }

  return { score, reasons };
}

describe("Job Ranking Scoring", () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  it("gives higher score to jobs that build new skills", () => {
    const job: JobForRanking = {
      id: "job1",
      title: "Babysitting",
      category: "BABYSITTING",
      payAmount: 100,
      payType: "FIXED",
      location: "Oslo",
      createdAt: lastWeek,
      employerVerified: false,
    };

    // User with no skills - should get high score for skill building
    const userWithNoSkills: UserContext = {
      userSkillSlugs: new Set(),
      completedCategories: new Set(),
    };

    // User with all skills - should get lower score
    const userWithAllSkills: UserContext = {
      userSkillSlugs: new Set(["babysitting", "child-activities", "patience", "communication"]),
      completedCategories: new Set(),
    };

    const scoreNoSkills = calculateJobScore(job, userWithNoSkills);
    const scoreAllSkills = calculateJobScore(job, userWithAllSkills);

    expect(scoreNoSkills.score).toBeGreaterThan(scoreAllSkills.score);
    expect(scoreNoSkills.reasons).toContain("Builds 4 new skills");
    expect(scoreAllSkills.reasons).not.toContainEqual(expect.stringMatching(/Builds \d+ new skills/));
  });

  it("gives higher score to jobs with higher pay", () => {
    const baseJob = {
      id: "job1",
      title: "Test Job",
      category: "CLEANING",
      payType: "FIXED",
      location: "Oslo",
      createdAt: lastWeek,
      employerVerified: false,
    };

    const userContext: UserContext = {
      userSkillSlugs: new Set(["house-cleaning", "attention-to-detail", "time-management"]),
      completedCategories: new Set(),
    };

    const highPayJob: JobForRanking = { ...baseJob, payAmount: 250 };
    const midPayJob: JobForRanking = { ...baseJob, payAmount: 175 };
    const lowPayJob: JobForRanking = { ...baseJob, payAmount: 100 };

    const highPayScore = calculateJobScore(highPayJob, userContext);
    const midPayScore = calculateJobScore(midPayJob, userContext);
    const lowPayScore = calculateJobScore(lowPayJob, userContext);

    expect(highPayScore.score).toBeGreaterThan(midPayScore.score);
    expect(midPayScore.score).toBeGreaterThan(lowPayScore.score);
    expect(highPayScore.reasons).toContain("Good pay");
  });

  it("gives bonus to verified employers", () => {
    const baseJob = {
      id: "job1",
      title: "Test Job",
      category: "CLEANING",
      payAmount: 100,
      payType: "FIXED",
      location: "Oslo",
      createdAt: lastWeek,
    };

    const userContext: UserContext = {
      userSkillSlugs: new Set(["house-cleaning", "attention-to-detail", "time-management"]),
      completedCategories: new Set(),
    };

    const verifiedJob: JobForRanking = { ...baseJob, employerVerified: true };
    const unverifiedJob: JobForRanking = { ...baseJob, employerVerified: false };

    const verifiedScore = calculateJobScore(verifiedJob, userContext);
    const unverifiedScore = calculateJobScore(unverifiedJob, userContext);

    expect(verifiedScore.score).toBeGreaterThan(unverifiedScore.score);
    expect(verifiedScore.score - unverifiedScore.score).toBe(15);
    expect(verifiedScore.reasons).toContain("Verified employer");
  });

  it("gives bonus to recently posted jobs", () => {
    const baseJob = {
      id: "job1",
      title: "Test Job",
      category: "CLEANING",
      payAmount: 100,
      payType: "FIXED",
      location: "Oslo",
      employerVerified: false,
    };

    const userContext: UserContext = {
      userSkillSlugs: new Set(["house-cleaning", "attention-to-detail", "time-management"]),
      completedCategories: new Set(),
    };

    const recentJob: JobForRanking = { ...baseJob, createdAt: yesterday };
    const oldJob: JobForRanking = { ...baseJob, createdAt: lastWeek };

    const recentScore = calculateJobScore(recentJob, userContext);
    const oldScore = calculateJobScore(oldJob, userContext);

    expect(recentScore.score).toBeGreaterThan(oldScore.score);
    expect(recentScore.reasons).toContain("Recently posted");
    expect(oldScore.reasons).not.toContain("Recently posted");
  });

  it("gives small bonus for jobs in previously completed categories", () => {
    const job: JobForRanking = {
      id: "job1",
      title: "Dog Walking",
      category: "DOG_WALKING",
      payAmount: 100,
      payType: "FIXED",
      location: "Oslo",
      createdAt: lastWeek,
      employerVerified: false,
    };

    const userWithExperience: UserContext = {
      userSkillSlugs: new Set(["dog-walking", "punctuality", "reliability"]),
      completedCategories: new Set(["DOG_WALKING"]),
    };

    const userWithoutExperience: UserContext = {
      userSkillSlugs: new Set(["dog-walking", "punctuality", "reliability"]),
      completedCategories: new Set(),
    };

    const experienceScore = calculateJobScore(job, userWithExperience);
    const noExperienceScore = calculateJobScore(job, userWithoutExperience);

    expect(experienceScore.score).toBeGreaterThan(noExperienceScore.score);
    expect(experienceScore.score - noExperienceScore.score).toBe(5);
    expect(experienceScore.reasons).toContain("Similar to past jobs");
  });

  it("produces deterministic scores for same inputs", () => {
    const job: JobForRanking = {
      id: "job1",
      title: "Test Job",
      category: "BABYSITTING",
      payAmount: 200,
      payType: "FIXED",
      location: "Oslo",
      createdAt: yesterday,
      employerVerified: true,
    };

    const userContext: UserContext = {
      userSkillSlugs: new Set(["communication"]),
      completedCategories: new Set(["BABYSITTING"]),
    };

    const score1 = calculateJobScore(job, userContext);
    const score2 = calculateJobScore(job, userContext);
    const score3 = calculateJobScore(job, userContext);

    expect(score1.score).toBe(score2.score);
    expect(score2.score).toBe(score3.score);
    expect(score1.reasons).toEqual(score2.reasons);
  });
});
