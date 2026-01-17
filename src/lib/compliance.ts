/**
 * Norwegian Youth Labor Law Compliance
 *
 * Enforces Arbeidsmiljøloven (Working Environment Act) regulations
 * for workers aged 15-20 in Norway.
 *
 * Key regulations:
 * - Chapter 11: Working hours for young workers
 * - Forskrift om arbeid av barn og ungdom (Regulations on work by children and young people)
 */

import { JobCategory } from "@prisma/client";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ComplianceResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  suggestions: ComplianceSuggestion[];
  ageGroup: "15-17" | "18-20";
  summary: string;
}

export interface ComplianceViolation {
  code: string;
  severity: "critical" | "high" | "medium";
  message: string;
  rule: string;
  legalReference?: string;
}

export interface ComplianceWarning {
  code: string;
  message: string;
  recommendation: string;
}

export interface ComplianceSuggestion {
  field: string;
  currentValue: string | number | null;
  suggestedValue: string | number;
  reason: string;
}

export interface JobInput {
  title: string;
  category: JobCategory;
  description: string;
  payAmount: number;
  payType: "FIXED" | "HOURLY";
  duration?: number; // in minutes
  startTime?: Date | string;
  endTime?: Date | string;
  location?: string;
  isSchoolDay?: boolean; // If known
  isSchoolHoliday?: boolean; // If known
  requiresWorkingAlone?: boolean;
  involvesPrivateHome?: boolean;
}

export interface WorkerAge {
  age: number;
  isMinor: boolean; // Under 18
  ageGroup: "15-17" | "18-20";
}

// =============================================================================
// CONSTANTS - Norwegian Labor Law
// =============================================================================

// Minimum wage (approximate - Norway doesn't have statutory minimum wage,
// but we use collective agreement rates as reference)
export const MINIMUM_HOURLY_WAGE_YOUTH = 130; // NOK per hour (approximate)
export const MINIMUM_HOURLY_WAGE_ADULT = 175; // NOK per hour (approximate)

// Working hour limits for minors (15-17)
export const MINOR_LIMITS = {
  // During school term
  schoolTerm: {
    maxWeeklyHours: 12,
    maxDailyHoursSchoolDay: 2,
    maxDailyHoursNonSchoolDay: 7,
  },
  // During school holidays
  schoolHoliday: {
    maxWeeklyHours: 35,
    maxDailyHours: 7,
  },
  // Time restrictions
  earliestStartTime: 6, // 6:00 AM
  latestEndTime: 20, // 8:00 PM (age 15-17)
  latestEndTimeAge15: 20, // 8:00 PM
  latestEndTimeAge16_17: 21, // 9:00 PM (can extend to 21:00 for certain jobs)
  // Rest requirements
  minRestBetweenShifts: 14, // hours
  maxConsecutiveWorkDays: 5,
};

// Working hour limits for young adults (18-20)
export const YOUNG_ADULT_LIMITS = {
  maxWeeklyHours: 40,
  maxDailyHours: 9,
  earliestStartTime: 0, // No restriction
  latestEndTime: 24, // No restriction
  minRestBetweenShifts: 11, // hours
};

// =============================================================================
// PROHIBITED CATEGORIES FOR MINORS
// =============================================================================

/**
 * Job categories completely prohibited for workers under 18
 */
export const PROHIBITED_CATEGORIES_MINORS: Partial<Record<JobCategory, string>> = {
  // Note: These map to our existing categories where applicable
  // DIY_HELP could involve construction - needs additional checks
};

/**
 * Keywords in job descriptions that indicate prohibited work for minors
 */
export const PROHIBITED_KEYWORDS_MINORS = [
  // Heavy machinery
  "forklift", "truck", "gaffeltruck", "traktor", "crane", "kran",
  "excavator", "gravemaskin", "bulldozer",
  // Construction/demolition
  "construction", "bygg", "demolition", "riving", "scaffolding", "stillas",
  "roofing", "tak", "høydearbeid", "height work",
  // Hazardous materials
  "chemicals", "kjemikalier", "hazardous", "farlig", "toxic", "giftig",
  "asbestos", "asbest", "radiation", "stråling",
  // Alcohol/adult venues
  "alcohol", "alkohol", "bar", "nightclub", "nattklubb", "pub",
  "casino", "gambling", "strip", "adult",
  // Heavy goods
  "heavy lifting", "tungt", "warehouse heavy", "lager tungt",
  // Financial liability
  "cash handling", "kontanthåndtering", "financial", "finansiell",
  "bank", "transactions", "transaksjoner",
  // Transport of people
  "taxi", "transport people", "transport personer", "driver", "sjåfør",
  "chauffeur", "passenger", "passasjer",
];

/**
 * Categories that require additional scrutiny for minors
 */
export const RESTRICTED_CATEGORIES_MINORS: Record<JobCategory, {
  allowed: boolean;
  conditions?: string[];
  prohibitedKeywords?: string[];
}> = {
  BABYSITTING: {
    allowed: true,
    conditions: [
      "Must not work alone in private homes late at night (after 8 PM)",
      "Adult must be reachable by phone",
    ],
    prohibitedKeywords: ["overnight", "over natten", "night shift", "nattskift"],
  },
  DOG_WALKING: {
    allowed: true,
    conditions: ["Suitable for minors"],
  },
  SNOW_CLEARING: {
    allowed: true,
    conditions: [
      "No heavy machinery operation",
      "Manual snow removal only",
    ],
    prohibitedKeywords: ["plow", "plog", "snowblower large", "snøfreser stor", "tractor", "traktor"],
  },
  CLEANING: {
    allowed: true,
    conditions: [
      "No industrial cleaning chemicals",
      "No work at heights",
    ],
    prohibitedKeywords: ["industrial", "industriell", "chemical", "kjemisk", "heights", "høyde"],
  },
  DIY_HELP: {
    allowed: true,
    conditions: [
      "Light DIY tasks only",
      "No power tools requiring certification",
      "No electrical or plumbing work",
    ],
    prohibitedKeywords: [
      "electrical", "elektrisk", "plumbing", "rørlegger",
      "roof", "tak", "chainsaw", "motorsag", "construction", "bygg",
    ],
  },
  TECH_HELP: {
    allowed: true,
    conditions: ["Suitable for minors"],
  },
  ERRANDS: {
    allowed: true,
    conditions: [
      "No alcohol purchases",
      "No heavy items (over 12kg)",
      "No driving required",
    ],
    prohibitedKeywords: ["alcohol", "alkohol", "drive", "kjøre", "heavy", "tungt"],
  },
  OTHER: {
    allowed: true,
    conditions: ["Must be reviewed for compliance"],
  },
};

// =============================================================================
// COMPLIANCE VALIDATION FUNCTIONS
// =============================================================================

/**
 * Main compliance check function
 * Validates a job listing against Norwegian youth labor laws
 */
export function validateJobCompliance(
  job: JobInput,
  workerAge: WorkerAge
): ComplianceResult {
  const violations: ComplianceViolation[] = [];
  const warnings: ComplianceWarning[] = [];
  const suggestions: ComplianceSuggestion[] = [];

  // 1. Check prohibited categories and keywords
  validateJobCategory(job, workerAge, violations, warnings, suggestions);

  // 2. Check working hours
  validateWorkingHours(job, workerAge, violations, warnings, suggestions);

  // 3. Check payment
  validatePayment(job, workerAge, violations, warnings, suggestions);

  // 4. Check additional safety restrictions
  validateSafetyRestrictions(job, workerAge, violations, warnings, suggestions);

  // 5. Check time of day restrictions
  validateTimeRestrictions(job, workerAge, violations, warnings, suggestions);

  // Generate summary
  const compliant = violations.length === 0;
  let summary = "";

  if (compliant && warnings.length === 0) {
    summary = `Job is compliant with Norwegian labor laws for ${workerAge.ageGroup} year olds.`;
  } else if (compliant) {
    summary = `Job is compliant but has ${warnings.length} warning(s) to review.`;
  } else {
    summary = `Job has ${violations.length} violation(s) that must be fixed before posting.`;
  }

  return {
    compliant,
    violations,
    warnings,
    suggestions,
    ageGroup: workerAge.ageGroup,
    summary,
  };
}

/**
 * Validate job category against age restrictions
 */
function validateJobCategory(
  job: JobInput,
  workerAge: WorkerAge,
  violations: ComplianceViolation[],
  warnings: ComplianceWarning[],
  suggestions: ComplianceSuggestion[]
): void {
  // Only apply strict category rules to minors
  if (!workerAge.isMinor) return;

  const categoryRules = RESTRICTED_CATEGORIES_MINORS[job.category];

  // Check if category is allowed
  if (!categoryRules.allowed) {
    violations.push({
      code: "PROHIBITED_CATEGORY",
      severity: "critical",
      message: `The category "${job.category}" is not allowed for workers under 18.`,
      rule: "Norwegian Working Environment Act - Chapter 11",
      legalReference: "Arbeidsmiljøloven § 11-1",
    });
    return;
  }

  // Check for prohibited keywords in title and description
  const textToCheck = `${job.title} ${job.description}`.toLowerCase();

  // Check global prohibited keywords
  for (const keyword of PROHIBITED_KEYWORDS_MINORS) {
    if (textToCheck.includes(keyword.toLowerCase())) {
      violations.push({
        code: "PROHIBITED_CONTENT",
        severity: "high",
        message: `Job contains prohibited content for minors: "${keyword}"`,
        rule: "Work involving hazardous activities is prohibited for workers under 18",
        legalReference: "Forskrift om arbeid av barn og ungdom",
      });
    }
  }

  // Check category-specific prohibited keywords
  if (categoryRules.prohibitedKeywords) {
    for (const keyword of categoryRules.prohibitedKeywords) {
      if (textToCheck.includes(keyword.toLowerCase())) {
        violations.push({
          code: "CATEGORY_RESTRICTION",
          severity: "high",
          message: `This ${job.category} job contains restricted content: "${keyword}"`,
          rule: `${job.category} jobs for minors have restrictions`,
        });
      }
    }
  }

  // Add conditions as warnings
  if (categoryRules.conditions) {
    for (const condition of categoryRules.conditions) {
      warnings.push({
        code: "CATEGORY_CONDITION",
        message: `Condition for ${job.category}: ${condition}`,
        recommendation: "Ensure this job meets the stated condition",
      });
    }
  }
}

/**
 * Validate working hours against age-based limits
 */
function validateWorkingHours(
  job: JobInput,
  workerAge: WorkerAge,
  violations: ComplianceViolation[],
  warnings: ComplianceWarning[],
  suggestions: ComplianceSuggestion[]
): void {
  if (!job.duration) return;

  const durationHours = job.duration / 60;

  if (workerAge.isMinor) {
    const limits = MINOR_LIMITS;

    // Check daily limits
    if (job.isSchoolDay && durationHours > limits.schoolTerm.maxDailyHoursSchoolDay) {
      violations.push({
        code: "EXCESSIVE_DAILY_HOURS_SCHOOL",
        severity: "high",
        message: `Job duration (${durationHours}h) exceeds the ${limits.schoolTerm.maxDailyHoursSchoolDay}h daily limit for school days`,
        rule: "Minors can work max 2 hours on school days",
        legalReference: "Arbeidsmiljøloven § 11-2",
      });
      suggestions.push({
        field: "duration",
        currentValue: job.duration,
        suggestedValue: limits.schoolTerm.maxDailyHoursSchoolDay * 60,
        reason: "Reduce duration to comply with school day limits",
      });
    } else if (!job.isSchoolDay && durationHours > limits.schoolTerm.maxDailyHoursNonSchoolDay) {
      violations.push({
        code: "EXCESSIVE_DAILY_HOURS",
        severity: "high",
        message: `Job duration (${durationHours}h) exceeds the ${limits.schoolTerm.maxDailyHoursNonSchoolDay}h daily limit for non-school days`,
        rule: "Minors can work max 7 hours on non-school days",
        legalReference: "Arbeidsmiljøloven § 11-2",
      });
      suggestions.push({
        field: "duration",
        currentValue: job.duration,
        suggestedValue: limits.schoolTerm.maxDailyHoursNonSchoolDay * 60,
        reason: "Reduce duration to comply with daily limits",
      });
    }

    // Check holiday limits
    if (job.isSchoolHoliday && durationHours > limits.schoolHoliday.maxDailyHours) {
      violations.push({
        code: "EXCESSIVE_HOLIDAY_HOURS",
        severity: "medium",
        message: `Job duration (${durationHours}h) exceeds the ${limits.schoolHoliday.maxDailyHours}h daily limit even during holidays`,
        rule: "Minors can work max 7 hours per day during school holidays",
        legalReference: "Arbeidsmiljøloven § 11-2",
      });
    }

    // Add weekly hours warning
    if (durationHours > 2 && !job.isSchoolHoliday) {
      warnings.push({
        code: "WEEKLY_HOURS_REMINDER",
        message: `Remember: Minors can only work ${limits.schoolTerm.maxWeeklyHours} hours/week during school term`,
        recommendation: "Ensure total weekly hours don't exceed the limit",
      });
    }
  } else {
    // Young adult limits (18-20)
    const limits = YOUNG_ADULT_LIMITS;

    if (durationHours > limits.maxDailyHours) {
      violations.push({
        code: "EXCESSIVE_DAILY_HOURS",
        severity: "medium",
        message: `Job duration (${durationHours}h) exceeds the ${limits.maxDailyHours}h daily limit`,
        rule: "Daily work should not exceed 9 hours",
        legalReference: "Arbeidsmiljøloven § 10-4",
      });
    }
  }
}

/**
 * Validate payment against minimum wage guidelines
 */
function validatePayment(
  job: JobInput,
  workerAge: WorkerAge,
  violations: ComplianceViolation[],
  warnings: ComplianceWarning[],
  suggestions: ComplianceSuggestion[]
): void {
  const minWage = workerAge.isMinor ? MINIMUM_HOURLY_WAGE_YOUTH : MINIMUM_HOURLY_WAGE_ADULT;

  if (job.payType === "HOURLY") {
    if (job.payAmount < minWage) {
      violations.push({
        code: "BELOW_MINIMUM_WAGE",
        severity: "critical",
        message: `Hourly rate (${job.payAmount} NOK) is below the recommended minimum (${minWage} NOK/hour)`,
        rule: "Pay must meet minimum wage standards",
      });
      suggestions.push({
        field: "payAmount",
        currentValue: job.payAmount,
        suggestedValue: minWage,
        reason: "Increase hourly rate to meet minimum wage",
      });
    } else if (job.payAmount < minWage * 1.1) {
      warnings.push({
        code: "LOW_WAGE",
        message: `Hourly rate (${job.payAmount} NOK) is close to minimum wage`,
        recommendation: "Consider offering competitive wages to attract qualified workers",
      });
    }
  } else if (job.payType === "FIXED" && job.duration) {
    const effectiveHourlyRate = job.payAmount / (job.duration / 60);
    if (effectiveHourlyRate < minWage) {
      violations.push({
        code: "EFFECTIVE_WAGE_TOO_LOW",
        severity: "critical",
        message: `Effective hourly rate (${Math.round(effectiveHourlyRate)} NOK/h) is below minimum (${minWage} NOK/h)`,
        rule: "Pay must meet minimum wage standards when calculated hourly",
      });
      const suggestedTotal = Math.ceil((job.duration / 60) * minWage);
      suggestions.push({
        field: "payAmount",
        currentValue: job.payAmount,
        suggestedValue: suggestedTotal,
        reason: "Increase fixed payment to meet minimum wage equivalent",
      });
    }
  }

  // Check for unpaid work
  if (job.payAmount === 0) {
    violations.push({
      code: "UNPAID_WORK",
      severity: "critical",
      message: "Unpaid work or trial work is not allowed",
      rule: "All work must be compensated",
      legalReference: "Arbeidsmiljøloven § 14-1",
    });
  }
}

/**
 * Validate additional safety restrictions
 */
function validateSafetyRestrictions(
  job: JobInput,
  workerAge: WorkerAge,
  violations: ComplianceViolation[],
  warnings: ComplianceWarning[],
  suggestions: ComplianceSuggestion[]
): void {
  if (!workerAge.isMinor) return;

  const textToCheck = `${job.title} ${job.description}`.toLowerCase();

  // Check for working alone in private homes
  if (job.involvesPrivateHome || textToCheck.includes("private home") || textToCheck.includes("privat hjem")) {
    if (job.requiresWorkingAlone || textToCheck.includes("alone") || textToCheck.includes("alene")) {
      warnings.push({
        code: "PRIVATE_HOME_ALONE",
        message: "Working alone in a private home requires extra caution for minors",
        recommendation: "Ensure adult supervision is available and contact numbers are provided",
      });
    }
  }

  // Check for transport of people
  if (
    textToCheck.includes("transport") ||
    textToCheck.includes("drive") ||
    textToCheck.includes("kjøre")
  ) {
    violations.push({
      code: "TRANSPORT_PROHIBITED",
      severity: "high",
      message: "Jobs involving transporting people are not allowed for minors",
      rule: "Minors cannot be employed for passenger transport",
    });
  }

  // Check for legal liability work
  if (
    textToCheck.includes("contract") ||
    textToCheck.includes("kontrakt") ||
    textToCheck.includes("legal") ||
    textToCheck.includes("juridisk")
  ) {
    violations.push({
      code: "LEGAL_LIABILITY",
      severity: "high",
      message: "Jobs with legal liability are not suitable for minors",
      rule: "Minors should not handle contracts or legal responsibilities",
    });
  }
}

/**
 * Validate time of day restrictions
 */
function validateTimeRestrictions(
  job: JobInput,
  workerAge: WorkerAge,
  violations: ComplianceViolation[],
  warnings: ComplianceWarning[],
  suggestions: ComplianceSuggestion[]
): void {
  if (!workerAge.isMinor) return;

  const limits = MINOR_LIMITS;

  if (job.startTime) {
    const startDate = new Date(job.startTime);
    const startHour = startDate.getHours();

    if (startHour < limits.earliestStartTime) {
      violations.push({
        code: "TOO_EARLY_START",
        severity: "high",
        message: `Job starts at ${startHour}:00, before the allowed time (${limits.earliestStartTime}:00)`,
        rule: "Minors cannot work before 6:00 AM",
        legalReference: "Arbeidsmiljøloven § 11-3",
      });
    }
  }

  if (job.endTime) {
    const endDate = new Date(job.endTime);
    const endHour = endDate.getHours();
    const latestAllowed = workerAge.age <= 15 ? limits.latestEndTimeAge15 : limits.latestEndTimeAge16_17;

    if (endHour > latestAllowed || (endHour === 0 && latestAllowed !== 24)) {
      violations.push({
        code: "TOO_LATE_END",
        severity: "high",
        message: `Job ends at ${endHour}:00, after the allowed time (${latestAllowed}:00)`,
        rule: `Workers aged ${workerAge.age} cannot work after ${latestAllowed}:00`,
        legalReference: "Arbeidsmiljøloven § 11-3",
      });
      suggestions.push({
        field: "endTime",
        currentValue: job.endTime?.toString() || null,
        suggestedValue: `${latestAllowed}:00`,
        reason: "Adjust end time to comply with time restrictions",
      });
    }
  }

  // Late night babysitting warning
  if (job.category === "BABYSITTING" && job.endTime) {
    const endDate = new Date(job.endTime);
    const endHour = endDate.getHours();
    if (endHour >= 20) {
      warnings.push({
        code: "LATE_BABYSITTING",
        message: "Babysitting ending after 8 PM - ensure adult is reachable",
        recommendation: "Parent/guardian should be available by phone during late evening",
      });
    }
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get worker age group from age
 */
export function getWorkerAgeInfo(age: number): WorkerAge {
  return {
    age,
    isMinor: age < 18,
    ageGroup: age < 18 ? "15-17" : "18-20",
  };
}

/**
 * Check if a job category is allowed for a specific age
 */
export function isCategoryAllowedForAge(category: JobCategory, age: number): boolean {
  if (age >= 18) return true;
  const rules = RESTRICTED_CATEGORIES_MINORS[category];
  return rules?.allowed ?? false;
}

/**
 * Get allowed job categories for an age
 */
export function getAllowedCategoriesForAge(age: number): JobCategory[] {
  if (age >= 18) {
    return Object.values(JobCategory) as JobCategory[];
  }

  return (Object.entries(RESTRICTED_CATEGORIES_MINORS) as [JobCategory, { allowed: boolean }][])
    .filter(([_, rules]) => rules.allowed)
    .map(([category]) => category);
}

/**
 * Get maximum allowed hours for a worker on a given day
 */
export function getMaxDailyHours(
  age: number,
  isSchoolDay: boolean,
  isSchoolHoliday: boolean
): number {
  if (age >= 18) {
    return YOUNG_ADULT_LIMITS.maxDailyHours;
  }

  if (isSchoolHoliday) {
    return MINOR_LIMITS.schoolHoliday.maxDailyHours;
  }

  return isSchoolDay
    ? MINOR_LIMITS.schoolTerm.maxDailyHoursSchoolDay
    : MINOR_LIMITS.schoolTerm.maxDailyHoursNonSchoolDay;
}

/**
 * Get maximum weekly hours for a worker
 */
export function getMaxWeeklyHours(age: number, isSchoolHoliday: boolean): number {
  if (age >= 18) {
    return YOUNG_ADULT_LIMITS.maxWeeklyHours;
  }

  return isSchoolHoliday
    ? MINOR_LIMITS.schoolHoliday.maxWeeklyHours
    : MINOR_LIMITS.schoolTerm.maxWeeklyHours;
}

/**
 * Get allowed working time range for a worker
 */
export function getAllowedTimeRange(age: number): { start: number; end: number } {
  if (age >= 18) {
    return { start: 0, end: 24 };
  }

  return {
    start: MINOR_LIMITS.earliestStartTime,
    end: age <= 15 ? MINOR_LIMITS.latestEndTimeAge15 : MINOR_LIMITS.latestEndTimeAge16_17,
  };
}

/**
 * Generate a compliance summary for display
 */
export function generateComplianceSummary(result: ComplianceResult): string {
  const lines: string[] = [];

  if (result.compliant) {
    lines.push("✅ This job is compliant with Norwegian labor laws.");
  } else {
    lines.push("❌ This job has compliance issues that must be addressed:");
    result.violations.forEach((v, i) => {
      lines.push(`  ${i + 1}. ${v.message}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push("\n⚠️ Warnings:");
    result.warnings.forEach((w, i) => {
      lines.push(`  ${i + 1}. ${w.message}`);
    });
  }

  if (result.suggestions.length > 0) {
    lines.push("\n💡 Suggestions:");
    result.suggestions.forEach((s, i) => {
      lines.push(`  ${i + 1}. ${s.field}: Change from ${s.currentValue} to ${s.suggestedValue}`);
      lines.push(`     Reason: ${s.reason}`);
    });
  }

  return lines.join("\n");
}
