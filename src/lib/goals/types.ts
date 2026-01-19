// Goal status options
export type GoalStatus = "exploring" | "committed" | "paused";

// Confidence levels
export type GoalConfidence = "low" | "medium" | "high";

// Timeframe options
export type GoalTimeframe = "this-year" | "1-2-years" | "3-plus-years";

// Next step item
export interface NextStep {
  id: string;
  text: string;
  completed: boolean;
}

// Structured career goal
export interface CareerGoal {
  title: string;
  status: GoalStatus;
  confidence: GoalConfidence;
  timeframe: GoalTimeframe;
  why: string;
  nextSteps: NextStep[];
  skills: string[];
  updatedAt: string;
}

// API response for goals
export interface GoalsResponse {
  primaryGoal: CareerGoal | null;
  secondaryGoal: CareerGoal | null;
}

// Goal slot type
export type GoalSlot = "primary" | "secondary";

// Suggested actions based on goal
export interface SuggestedAction {
  id: string;
  text: string;
  icon?: string;
  href?: string;
}

// Status display config
export const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string }> = {
  exploring: { label: "Exploring", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
  committed: { label: "Committed", color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
  paused: { label: "Paused", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
};

export const CONFIDENCE_CONFIG: Record<GoalConfidence, { label: string; color: string }> = {
  low: { label: "Low", color: "text-amber-600" },
  medium: { label: "Medium", color: "text-blue-600" },
  high: { label: "High", color: "text-green-600" },
};

export const TIMEFRAME_CONFIG: Record<GoalTimeframe, { label: string }> = {
  "this-year": { label: "This year" },
  "1-2-years": { label: "1-2 years" },
  "3-plus-years": { label: "3+ years" },
};

// Helper to create empty goal
export function createEmptyGoal(title: string): CareerGoal {
  return {
    title,
    status: "exploring",
    confidence: "medium",
    timeframe: "1-2-years",
    why: "",
    nextSteps: [],
    skills: [],
    updatedAt: new Date().toISOString(),
  };
}

// Suggested actions mapping by career category
export const SUGGESTED_ACTIONS_BY_CAREER: Record<string, SuggestedAction[]> = {
  default: [
    { id: "1", text: "Research day-to-day responsibilities", icon: "search" },
    { id: "2", text: "Find someone in this field to talk to", icon: "users" },
    { id: "3", text: "Look up required qualifications", icon: "graduation-cap" },
    { id: "4", text: "Explore entry-level positions", icon: "briefcase" },
    { id: "5", text: "Identify key skills to develop", icon: "star" },
    { id: "6", text: "Check salary expectations in Norway", icon: "banknote" },
  ],
  technology: [
    { id: "1", text: "Start a coding project or tutorial", icon: "code" },
    { id: "2", text: "Join a tech community or Discord", icon: "users" },
    { id: "3", text: "Build a simple portfolio website", icon: "globe" },
    { id: "4", text: "Explore free courses on YouTube/Coursera", icon: "play" },
    { id: "5", text: "Learn about agile development practices", icon: "refresh" },
    { id: "6", text: "Research tech companies in Oslo/Bergen", icon: "building" },
  ],
  healthcare: [
    { id: "1", text: "Research educational paths in Norway", icon: "graduation-cap" },
    { id: "2", text: "Shadow a healthcare professional", icon: "users" },
    { id: "3", text: "Learn basic first aid or CPR", icon: "heart" },
    { id: "4", text: "Explore volunteer opportunities", icon: "hand-heart" },
    { id: "5", text: "Understand certification requirements", icon: "award" },
    { id: "6", text: "Research healthcare facilities nearby", icon: "building" },
  ],
  creative: [
    { id: "1", text: "Build a portfolio of your work", icon: "folder" },
    { id: "2", text: "Practice daily with small projects", icon: "pencil" },
    { id: "3", text: "Follow industry professionals online", icon: "users" },
    { id: "4", text: "Enter a competition or contest", icon: "trophy" },
    { id: "5", text: "Learn industry-standard tools", icon: "tool" },
    { id: "6", text: "Network with local creative communities", icon: "network" },
  ],
};

// Onboarding suggestions when no primary goal
export const ONBOARDING_SUGGESTIONS: SuggestedAction[] = [
  { id: "1", text: "Complete your profile", icon: "user", href: "/profile" },
  { id: "2", text: "Explore different careers", icon: "compass", href: "/careers" },
  { id: "3", text: "Take the career quiz", icon: "clipboard", href: "/growth/explore" },
  { id: "4", text: "Browse available jobs", icon: "briefcase", href: "/jobs" },
  { id: "5", text: "Set your first career goal", icon: "target", href: "/careers" },
];
