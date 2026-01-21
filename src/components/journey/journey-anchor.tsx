"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Journey state types for determining context
export interface JourneyState {
  hasCompletedJobs: boolean;
  completedJobsCount: number;
  hasActiveApplications: boolean;
  pendingApplicationsCount: number;
  hasReflections: boolean;
  reflectionsCount: number;
  hasShadowExperiences: boolean;
  shadowsCount: number;
  hasExploredCareers: boolean;
  lastActivityType?: "job" | "reflection" | "shadow" | "career" | null;
  daysSinceLastActivity?: number;
}

interface JourneyAnchorProps {
  state: JourneyState;
  displayName?: string;
}

// Dynamic context statements based on journey state
function getContextStatement(state: JourneyState): string {
  const { hasCompletedJobs, completedJobsCount, hasReflections, hasShadowExperiences, hasActiveApplications } = state;

  // Early journey - no completed work yet
  if (!hasCompletedJobs && !hasShadowExperiences) {
    if (hasActiveApplications) {
      return "You're taking your first steps — and that takes courage.";
    }
    return "You're early in your journey, and that's exactly right.";
  }

  // Has some experience
  if (completedJobsCount >= 1 && completedJobsCount < 3) {
    if (hasReflections) {
      return "You're learning what fits you — step by step.";
    }
    return "You're building independence through real experience.";
  }

  // Growing experience
  if (completedJobsCount >= 3 && completedJobsCount < 6) {
    if (hasShadowExperiences) {
      return "You're connecting experience to possibility.";
    }
    return "You're discovering what you're capable of.";
  }

  // Established experience
  if (completedJobsCount >= 6) {
    return "You're turning experience into direction.";
  }

  return "You're moving forward, one experience at a time.";
}

// Dynamic current focus based on journey state
function getCurrentFocus(state: JourneyState): string {
  const { hasCompletedJobs, completedJobsCount, hasReflections, hasShadowExperiences, hasActiveApplications, lastActivityType } = state;

  // Brand new user
  if (!hasCompletedJobs && !hasActiveApplications) {
    return "Earning confidence through small jobs";
  }

  // Has pending applications but no completed work
  if (!hasCompletedJobs && hasActiveApplications) {
    return "Taking your first step into the working world";
  }

  // Has some completed work
  if (completedJobsCount >= 1 && completedJobsCount < 3) {
    if (!hasReflections) {
      return "Reflecting on what you've learned";
    }
    return "Building on early experiences";
  }

  // Growing - suggest shadows
  if (completedJobsCount >= 3 && !hasShadowExperiences) {
    return "Exploring real careers through shadowing";
  }

  // Has shadows
  if (hasShadowExperiences) {
    return "Connecting experience to future direction";
  }

  // Default for experienced users
  if (completedJobsCount >= 5) {
    return "Turning experience into direction";
  }

  return "Growing through real experience";
}

// Dynamic CTA based on journey state
function getNextAction(state: JourneyState): { label: string; href: string; description: string } {
  const { hasCompletedJobs, completedJobsCount, hasReflections, hasShadowExperiences, hasActiveApplications, lastActivityType, daysSinceLastActivity } = state;

  // Brand new - apply for first job
  if (!hasCompletedJobs && !hasActiveApplications) {
    return {
      label: "Find your first small job",
      href: "/jobs",
      description: "Start with something simple",
    };
  }

  // Has pending - encourage patience
  if (!hasCompletedJobs && hasActiveApplications) {
    return {
      label: "Explore while you wait",
      href: "/careers",
      description: "Discover careers that interest you",
    };
  }

  // Just completed a job - suggest reflection
  if (hasCompletedJobs && !hasReflections && lastActivityType === "job") {
    return {
      label: "Reflect on your experience",
      href: "/my-journey",
      description: "Capture what you learned",
    };
  }

  // Has experience, suggest shadow
  if (completedJobsCount >= 2 && !hasShadowExperiences) {
    return {
      label: "Request a career shadow",
      href: "/shadows/new",
      description: "See a real workplace up close",
    };
  }

  // Has shadows, suggest more jobs or careers
  if (hasShadowExperiences && completedJobsCount < 5) {
    return {
      label: "Apply for one small job",
      href: "/jobs",
      description: "Keep building experience",
    };
  }

  // Experienced user - explore careers
  if (completedJobsCount >= 5) {
    return {
      label: "Explore a related career",
      href: "/careers",
      description: "Connect your experience to your future",
    };
  }

  // Default
  return {
    label: "Continue your journey",
    href: "/my-journey",
    description: "See where you are",
  };
}

export function JourneyAnchor({ state, displayName }: JourneyAnchorProps) {
  const contextStatement = getContextStatement(state);
  const currentFocus = getCurrentFocus(state);
  const nextAction = getNextAction(state);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      {/* Abstract Flowing Visual Background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          viewBox="0 0 800 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Gradient definitions for flowing shapes */}
            <linearGradient id="flow1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#DDD6FE" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="flow2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#A7F3D0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="flow3" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="glow1" cx="30%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow2" cx="70%" cy="60%" r="40%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>

            {/* Filter for soft blur */}
            <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
            </filter>
          </defs>

          {/* Base layer - subtle gradient */}
          <rect width="800" height="400" fill="#FAFBFF" />

          {/* Soft glowing orbs */}
          <ellipse cx="240" cy="160" rx="200" ry="180" fill="url(#glow1)" />
          <ellipse cx="560" cy="240" rx="180" ry="160" fill="url(#glow2)" />

          {/* Flowing organic shapes */}
          <motion.path
            d="M-100 300 Q100 200 300 250 Q500 300 600 200 Q700 100 900 150"
            fill="none"
            stroke="url(#flow1)"
            strokeWidth="120"
            strokeLinecap="round"
            filter="url(#softBlur)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          <motion.path
            d="M-50 100 Q150 250 350 180 Q550 110 700 200 Q850 290 950 220"
            fill="none"
            stroke="url(#flow2)"
            strokeWidth="100"
            strokeLinecap="round"
            filter="url(#softBlur)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, delay: 0.3, ease: "easeOut" }}
          />

          <motion.path
            d="M100 350 Q300 280 450 320 Q600 360 750 300"
            fill="none"
            stroke="url(#flow3)"
            strokeWidth="80"
            strokeLinecap="round"
            filter="url(#softBlur)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.6, ease: "easeOut" }}
          />

          {/* Subtle floating circles for depth */}
          <motion.circle
            cx="150"
            cy="100"
            r="40"
            fill="#E0E7FF"
            opacity="0.3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1, 0.8], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx="650"
            cy="80"
            r="30"
            fill="#D1FAE5"
            opacity="0.25"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.circle
            cx="400"
            cy="320"
            r="25"
            fill="#FEF3C7"
            opacity="0.3"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.35, 0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </svg>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 px-6 py-10 sm:px-8 sm:py-14">
        <div className="max-w-xl">
          {/* Journey Context Statement */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-4"
          >
            {contextStatement}
          </motion.p>

          {/* Current Focus - Single Line */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">Current focus:</span>{" "}
              {currentFocus}
            </p>
          </motion.div>

          {/* Single CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-lg shadow-slate-900/10"
            >
              <Link href={nextAction.href}>
                {nextAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-slate-400 mt-2 ml-1">
              {nextAction.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}

export default JourneyAnchor;
