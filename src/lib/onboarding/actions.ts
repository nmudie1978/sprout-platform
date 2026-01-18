"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSmartJobPicks, type SmartJobPick } from "@/lib/my-path/actions";

// Types for onboarding
export interface OnboardingStatus {
  needsOnboarding: boolean;
  completedAt: Date | null;
  careerAspiration: string | null;
  currentPriorities: string[];
  availabilityLevel: string | null;
}

export interface OnboardingData {
  careerAspiration?: string;
  currentPriorities: string[];
  availabilityLevel?: string;
}

export interface NextStepSuggestion {
  suggestion: string;
  reason: string;
  action: { label: string; href: string };
  priority: "earn" | "skills" | "explore" | "prepare";
}

export interface NextStepData {
  suggestion: NextStepSuggestion;
  topJob: SmartJobPick | null;
  careerAspiration: string | null;
}

// Priority mappings for suggestions
const PRIORITY_SUGGESTIONS: Record<string, NextStepSuggestion[]> = {
  earn: [
    {
      suggestion: "Find a quick job to start earning",
      reason: "Get paid for your time while building experience",
      action: { label: "Browse jobs", href: "/jobs" },
      priority: "earn",
    },
    {
      suggestion: "Apply to jobs near you",
      reason: "Local jobs are easier to fit into your schedule",
      action: { label: "Find nearby jobs", href: "/jobs" },
      priority: "earn",
    },
  ],
  skills: [
    {
      suggestion: "Take a job that builds new skills",
      reason: "Every job teaches you something valuable for your future",
      action: { label: "View skill-building jobs", href: "/my-path/job-picks" },
      priority: "skills",
    },
    {
      suggestion: "Explore recommended courses",
      reason: "Free courses can boost your employability",
      action: { label: "Browse courses", href: "/my-path/courses" },
      priority: "skills",
    },
  ],
  explore: [
    {
      suggestion: "Discover careers that match your interests",
      reason: "Understanding your options helps you plan ahead",
      action: { label: "Explore careers", href: "/careers" },
      priority: "explore",
    },
    {
      suggestion: "Chat with the AI Career Advisor",
      reason: "Get personalised guidance based on your goals",
      action: { label: "Ask Sprout AI", href: "/career-advisor" },
      priority: "explore",
    },
  ],
  prepare: [
    {
      suggestion: "Start building your work history",
      reason: "Even small jobs count towards your future CV",
      action: { label: "Find starter jobs", href: "/jobs" },
      priority: "prepare",
    },
    {
      suggestion: "Set up your growth path",
      reason: "Track your progress towards your career goals",
      action: { label: "View My Growth", href: "/growth" },
      priority: "prepare",
    },
  ],
};

/**
 * Check if user needs onboarding
 */
export async function checkOnboardingStatus(): Promise<OnboardingStatus | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  const youthProfile = await prisma.youthProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      onboardingCompletedAt: true,
      careerAspiration: true,
      currentPriorities: true,
      availabilityLevel: true,
    },
  });

  if (!youthProfile) return null;

  return {
    needsOnboarding: !youthProfile.onboardingCompletedAt,
    completedAt: youthProfile.onboardingCompletedAt,
    careerAspiration: youthProfile.careerAspiration,
    currentPriorities: youthProfile.currentPriorities,
    availabilityLevel: youthProfile.availabilityLevel,
  };
}

/**
 * Complete onboarding - save user preferences
 */
export async function completeOnboarding(
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        careerAspiration: data.careerAspiration || undefined,
        currentPriorities: data.currentPriorities,
        availabilityLevel: data.availabilityLevel || undefined,
        onboardingCompletedAt: new Date(),
        pathUpdatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return { success: false, error: "Failed to save onboarding data" };
  }
}

/**
 * Skip onboarding - mark as completed with defaults
 */
export async function skipOnboarding(): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        currentPriorities: ["explore"], // Default to exploration
        onboardingCompletedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to skip onboarding:", error);
    return { success: false, error: "Failed to skip onboarding" };
  }
}

/**
 * Generate next step suggestion based on user's priorities
 * Rule-based, no AI calls required
 */
export async function getNextStepSuggestion(): Promise<NextStepData | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") return null;

  // Get user profile and priorities
  const youthProfile = await prisma.youthProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      currentPriorities: true,
      careerAspiration: true,
      completedJobsCount: true,
    },
  });

  if (!youthProfile) return null;

  // Get smart job picks (top 1)
  const jobPicks = await getSmartJobPicks(1);
  const topJob = jobPicks.length > 0 ? jobPicks[0] : null;

  // Determine primary priority
  const priorities = youthProfile.currentPriorities;
  const primaryPriority = priorities.length > 0 ? priorities[0] : "explore";

  // Select suggestion based on priority and context
  let suggestion: NextStepSuggestion;

  // If user has completed few jobs, bias towards earning
  if (youthProfile.completedJobsCount < 2 && primaryPriority !== "explore") {
    const earnSuggestions = PRIORITY_SUGGESTIONS["earn"];
    suggestion = earnSuggestions[0];
  } else {
    // Get suggestions for the primary priority
    const suggestions = PRIORITY_SUGGESTIONS[primaryPriority] || PRIORITY_SUGGESTIONS["explore"];
    // Randomly pick one for variety
    suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  return {
    suggestion,
    topJob,
    careerAspiration: youthProfile.careerAspiration,
  };
}

/**
 * Reset onboarding (for testing or re-onboarding)
 */
export async function resetOnboarding(): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "YOUTH") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.youthProfile.update({
      where: { userId: session.user.id },
      data: {
        onboardingCompletedAt: null,
        currentPriorities: [],
        availabilityLevel: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to reset onboarding:", error);
    return { success: false, error: "Failed to reset onboarding" };
  }
}
