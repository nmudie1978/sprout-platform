import type { GrowthGraph } from "@/lib/growth";
import type { SingleCareerJourney, MultipleCareerJourneys } from "@/lib/my-path/actions";

// Types for honest progress framework
export interface FoundationalProgressData {
  jobsCompleted: number;
  reliabilityScore: number; // 0-100 based on completion rate, punctuality
  communicationScore: number; // 0-100 based on response rate, quality
  rehireRate: number; // percentage of employers who would rehire
  avgRating: number; // 0-5 average rating
}

export interface CareerProgressData {
  learningStarted: boolean;
  coursesInProgress: number;
  coursesCompleted: number;
  certificationsEarned: number;
  projectsCompleted: number;
}

export interface RunwayData {
  totalEarnings: number;
  availabilityLevel: string | null;
  savedLearningPaths: number;
  hasCareerGoal: boolean;
}

/**
 * Compute foundational progress from growth data
 * This represents what small jobs actually contribute - work skills, not career skills
 */
export function computeFoundationalProgress(
  growthData: { hasData: boolean; growth?: GrowthGraph } | null
): FoundationalProgressData {
  if (!growthData?.hasData || !growthData.growth) {
    return {
      jobsCompleted: 0,
      reliabilityScore: 0,
      communicationScore: 0,
      rehireRate: 0,
      avgRating: 0,
    };
  }

  const growth = growthData.growth;

  // Calculate reliability score from punctuality across all months
  let totalPunctuality = 0;
  let punctualityCount = 0;
  for (const month of growth.monthlyProgress) {
    if (month.avgPunctuality > 0) {
      totalPunctuality += month.avgPunctuality;
      punctualityCount++;
    }
  }
  const avgPunctuality = punctualityCount > 0 ? totalPunctuality / punctualityCount : 0;
  // Convert 1-5 scale to percentage
  const reliabilityScore = Math.round((avgPunctuality / 5) * 100);

  // Calculate communication score from communication ratings
  let totalComm = 0;
  let commCount = 0;
  for (const month of growth.monthlyProgress) {
    if (month.avgCommunication > 0) {
      totalComm += month.avgCommunication;
      commCount++;
    }
  }
  const avgComm = commCount > 0 ? totalComm / commCount : 0;
  const communicationScore = Math.round((avgComm / 5) * 100);

  // Calculate rehire rate
  const rehireRate = growth.totalJobsCompleted > 0
    ? Math.round((growth.totalWouldRehire / growth.totalJobsCompleted) * 100)
    : 0;

  // Calculate average rating from quality scores
  let totalQuality = 0;
  let qualityCount = 0;
  for (const month of growth.monthlyProgress) {
    if (month.avgQuality > 0) {
      totalQuality += month.avgQuality;
      qualityCount++;
    }
  }
  const avgRating = qualityCount > 0 ? totalQuality / qualityCount : 0;

  return {
    jobsCompleted: growth.totalJobsCompleted,
    reliabilityScore,
    communicationScore,
    rehireRate,
    avgRating,
  };
}

/**
 * Compute career-specific progress
 * Currently returns empty/default values since we don't have learning platform integration
 * In the future, this would pull from course completions, certifications, etc.
 */
export function computeCareerProgress(
  _careerName: string,
  _userSkills: string[]
): CareerProgressData {
  // TODO: When learning platform integration is added, fetch real data here
  // For now, return default values to show the honest "not started" state
  return {
    learningStarted: false,
    coursesInProgress: 0,
    coursesCompleted: 0,
    certificationsEarned: 0,
    projectsCompleted: 0,
  };
}

/**
 * Compute runway & readiness data
 * Shows enabling factors that make career pursuit possible
 */
export function computeRunwayData(
  multiJourneys: MultipleCareerJourneys | null,
  availabilityLevel: string | null,
  savedLearningPaths: number = 0
): RunwayData {
  return {
    totalEarnings: multiJourneys?.totalEarnings || 0,
    availabilityLevel,
    savedLearningPaths,
    hasCareerGoal: (multiJourneys?.journeys.length || 0) > 0,
  };
}

/**
 * Get a text summary of progress for AI context
 */
export function getProgressSummaryForAI(
  careerName: string,
  foundational: FoundationalProgressData,
  careerProgress: CareerProgressData,
  runway: RunwayData
): string {
  const parts: string[] = [];

  // Foundational summary
  if (foundational.jobsCompleted === 0) {
    parts.push(`The user has not completed any small jobs yet.`);
  } else {
    parts.push(`The user has completed ${foundational.jobsCompleted} small jobs.`);
    if (foundational.reliabilityScore > 0) {
      parts.push(`Reliability score: ${foundational.reliabilityScore}%.`);
    }
    if (foundational.rehireRate > 0) {
      parts.push(`${foundational.rehireRate}% of employers would rehire them.`);
    }
  }

  // Career progress summary
  if (!careerProgress.learningStarted) {
    parts.push(`The user has NOT started any formal learning toward ${careerName}.`);
  } else {
    parts.push(`The user has started learning for ${careerName}.`);
    if (careerProgress.coursesCompleted > 0) {
      parts.push(`Completed ${careerProgress.coursesCompleted} courses.`);
    }
    if (careerProgress.certificationsEarned > 0) {
      parts.push(`Earned ${careerProgress.certificationsEarned} certifications.`);
    }
  }

  // Runway summary
  if (runway.totalEarnings > 0) {
    parts.push(`Total earnings from jobs: kr ${runway.totalEarnings}.`);
  }
  if (runway.availabilityLevel) {
    const availabilityLabels: Record<string, string> = {
      busy: "very limited",
      some: "some",
      plenty: "plenty of",
    };
    parts.push(`Time availability: ${availabilityLabels[runway.availabilityLevel] || runway.availabilityLevel}.`);
  }

  // Key insight
  parts.push(`IMPORTANT: Small jobs do NOT teach ${careerName} skills directly. They build foundational work skills (reliability, communication) and provide resources (money, experience) that enable career pursuit.`);

  return parts.join(" ");
}

/**
 * Determine what the user should focus on next
 */
export function getNextFocusArea(
  foundational: FoundationalProgressData,
  careerProgress: CareerProgressData
): "foundational" | "career" | "balanced" {
  // If no jobs completed, focus on foundational first
  if (foundational.jobsCompleted < 3) {
    return "foundational";
  }

  // If good foundation but no career progress, suggest career learning
  if (foundational.reliabilityScore >= 60 && !careerProgress.learningStarted) {
    return "career";
  }

  // Otherwise, balanced approach
  return "balanced";
}
