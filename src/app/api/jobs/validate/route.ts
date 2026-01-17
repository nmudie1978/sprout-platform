/**
 * Job Compliance Validation API
 *
 * Validates job listings against Norwegian youth labor laws
 * before allowing them to be posted.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  validateJobCompliance,
  getWorkerAgeInfo,
  getAllowedCategoriesForAge,
  getMaxDailyHours,
  getMaxWeeklyHours,
  getAllowedTimeRange,
  MINIMUM_HOURLY_WAGE_YOUTH,
  MINIMUM_HOURLY_WAGE_ADULT,
  type JobInput,
  type ComplianceResult,
} from "@/lib/compliance";
import { JobCategory } from "@prisma/client";

/**
 * POST /api/jobs/validate
 * Validates a job listing for compliance with youth labor laws
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Extract job data
    const jobInput: JobInput = {
      title: body.title || "",
      category: body.category as JobCategory,
      description: body.description || "",
      payAmount: body.payAmount || 0,
      payType: body.payType || "FIXED",
      duration: body.duration,
      startTime: body.startDate || body.dateTime,
      endTime: body.endDate,
      location: body.location,
      isSchoolDay: body.isSchoolDay,
      isSchoolHoliday: body.isSchoolHoliday,
      requiresWorkingAlone: body.requiresWorkingAlone,
      involvesPrivateHome: body.involvesPrivateHome,
    };

    // Validate for both age groups
    const resultsForMinors = validateJobCompliance(jobInput, getWorkerAgeInfo(16));
    const resultsForYoungAdults = validateJobCompliance(jobInput, getWorkerAgeInfo(19));

    // Determine overall compliance
    const isCompliantForMinors = resultsForMinors.compliant;
    const isCompliantForYoungAdults = resultsForYoungAdults.compliant;

    // Calculate which age groups can see this job
    const eligibleAgeGroups: string[] = [];
    if (isCompliantForMinors) eligibleAgeGroups.push("15-17");
    if (isCompliantForYoungAdults) eligibleAgeGroups.push("18-20");

    return NextResponse.json({
      valid: isCompliantForMinors || isCompliantForYoungAdults,
      eligibleAgeGroups,
      resultsForMinors: {
        compliant: resultsForMinors.compliant,
        violations: resultsForMinors.violations,
        warnings: resultsForMinors.warnings,
        suggestions: resultsForMinors.suggestions,
      },
      resultsForYoungAdults: {
        compliant: resultsForYoungAdults.compliant,
        violations: resultsForYoungAdults.violations,
        warnings: resultsForYoungAdults.warnings,
        suggestions: resultsForYoungAdults.suggestions,
      },
      summary: {
        canBePosted: eligibleAgeGroups.length > 0,
        visibleTo: eligibleAgeGroups.join(", ") || "No age groups (fix violations)",
        totalViolations: resultsForMinors.violations.length + resultsForYoungAdults.violations.length,
        totalWarnings: resultsForMinors.warnings.length + resultsForYoungAdults.warnings.length,
      },
    });
  } catch (error) {
    console.error("Job validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate job" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jobs/validate
 * Get compliance rules and limits for job posting
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const age = parseInt(searchParams.get("age") || "16", 10);
    const isSchoolDay = searchParams.get("schoolDay") === "true";
    const isSchoolHoliday = searchParams.get("holiday") === "true";

    // Validate age range
    if (age < 15 || age > 20) {
      return NextResponse.json(
        { error: "Age must be between 15 and 20" },
        { status: 400 }
      );
    }

    const workerInfo = getWorkerAgeInfo(age);
    const allowedCategories = getAllowedCategoriesForAge(age);
    const maxDailyHours = getMaxDailyHours(age, isSchoolDay, isSchoolHoliday);
    const maxWeeklyHours = getMaxWeeklyHours(age, isSchoolHoliday);
    const timeRange = getAllowedTimeRange(age);
    const minHourlyWage = workerInfo.isMinor ? MINIMUM_HOURLY_WAGE_YOUTH : MINIMUM_HOURLY_WAGE_ADULT;

    return NextResponse.json({
      age,
      ageGroup: workerInfo.ageGroup,
      isMinor: workerInfo.isMinor,
      rules: {
        allowedCategories,
        maxDailyHours,
        maxWeeklyHours,
        workingHours: {
          earliest: `${String(timeRange.start).padStart(2, "0")}:00`,
          latest: `${String(timeRange.end).padStart(2, "0")}:00`,
        },
        minHourlyWage,
        restBetweenShifts: workerInfo.isMinor ? 14 : 11, // hours
      },
      restrictions: workerInfo.isMinor
        ? [
            "No heavy machinery operation",
            "No construction or demolition work",
            "No work with hazardous chemicals",
            "No alcohol-related venues",
            "No transporting people",
            "No work involving legal liability",
            "No work alone in private homes at night",
          ]
        : [],
      schoolTermLimits: workerInfo.isMinor
        ? {
            maxWeeklyHours: 12,
            maxDailyHoursSchoolDay: 2,
            maxDailyHoursNonSchoolDay: 7,
          }
        : null,
      schoolHolidayLimits: workerInfo.isMinor
        ? {
            maxWeeklyHours: 35,
            maxDailyHours: 7,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to get compliance rules:", error);
    return NextResponse.json(
      { error: "Failed to get compliance rules" },
      { status: 500 }
    );
  }
}
