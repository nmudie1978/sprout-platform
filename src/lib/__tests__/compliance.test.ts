import { describe, it, expect } from "vitest";
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
} from "../compliance";
import { JobCategory } from "@prisma/client";

describe("Compliance Module", () => {
  describe("getWorkerAgeInfo", () => {
    it("should correctly identify minors (15-17)", () => {
      const info15 = getWorkerAgeInfo(15);
      const info16 = getWorkerAgeInfo(16);
      const info17 = getWorkerAgeInfo(17);

      expect(info15.isMinor).toBe(true);
      expect(info15.ageGroup).toBe("15-17");
      expect(info16.isMinor).toBe(true);
      expect(info16.ageGroup).toBe("15-17");
      expect(info17.isMinor).toBe(true);
      expect(info17.ageGroup).toBe("15-17");
    });

    it("should correctly identify young adults (18-20)", () => {
      const info18 = getWorkerAgeInfo(18);
      const info19 = getWorkerAgeInfo(19);
      const info20 = getWorkerAgeInfo(20);

      expect(info18.isMinor).toBe(false);
      expect(info18.ageGroup).toBe("18-20");
      expect(info19.isMinor).toBe(false);
      expect(info19.ageGroup).toBe("18-20");
      expect(info20.isMinor).toBe(false);
      expect(info20.ageGroup).toBe("18-20");
    });
  });

  describe("getAllowedCategoriesForAge", () => {
    it("should return allowed categories for minors", () => {
      const allowedFor16 = getAllowedCategoriesForAge(16);

      // All our categories are allowed for minors (with conditions)
      expect(allowedFor16.length).toBeGreaterThan(0);
      expect(allowedFor16).toContain("DOG_WALKING");
      expect(allowedFor16).toContain("BABYSITTING");
    });

    it("should allow all categories for young adults", () => {
      const allowedFor19 = getAllowedCategoriesForAge(19);
      const allowedFor16 = getAllowedCategoriesForAge(16);

      // Young adults get all categories
      expect(allowedFor19.length).toBeGreaterThanOrEqual(allowedFor16.length);
    });
  });

  describe("getMaxDailyHours", () => {
    it("should return 2 hours for minors on school days", () => {
      const hours = getMaxDailyHours(16, true, false);
      expect(hours).toBe(2);
    });

    it("should return 7 hours for minors on non-school days during term", () => {
      const hours = getMaxDailyHours(16, false, false);
      expect(hours).toBe(7);
    });

    it("should return 7 hours for minors during school holidays", () => {
      const hours = getMaxDailyHours(16, false, true);
      expect(hours).toBe(7);
    });

    it("should return 9 hours for young adults", () => {
      const hours = getMaxDailyHours(19, true, false);
      expect(hours).toBe(9);
    });
  });

  describe("getMaxWeeklyHours", () => {
    it("should return 12 hours for minors during school term", () => {
      const hours = getMaxWeeklyHours(16, false);
      expect(hours).toBe(12);
    });

    it("should return 35 hours for minors during school holidays", () => {
      const hours = getMaxWeeklyHours(16, true);
      expect(hours).toBe(35);
    });

    it("should return 40 hours for young adults", () => {
      const hours = getMaxWeeklyHours(19, false);
      expect(hours).toBe(40);
    });
  });

  describe("getAllowedTimeRange", () => {
    it("should restrict work hours for minors 16-17 (6:00-21:00)", () => {
      const range = getAllowedTimeRange(16);
      expect(range.start).toBe(6);
      expect(range.end).toBe(21);
    });

    it("should have no time restrictions for young adults (18+)", () => {
      const range = getAllowedTimeRange(19);
      expect(range.start).toBe(0);
      expect(range.end).toBe(24);
    });
  });

  describe("validateJobCompliance", () => {
    const validJob: JobInput = {
      title: "Dog Walking",
      category: "DOG_WALKING" as JobCategory,
      description: "Walk dogs in the neighborhood",
      payAmount: 150,
      payType: "HOURLY",
      duration: 120, // 2 hours
    };

    it("should accept valid job for minors", () => {
      const result = validateJobCompliance(validJob, getWorkerAgeInfo(16));
      expect(result.compliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should accept valid job for young adults", () => {
      // Young adults have higher minimum wage (175 NOK), so use that rate
      const adultJob: JobInput = {
        ...validJob,
        payAmount: 180, // Above adult minimum wage
      };
      const result = validateJobCompliance(adultJob, getWorkerAgeInfo(19));
      expect(result.compliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should accept allowed categories for minors", () => {
      const cleaningJob: JobInput = {
        ...validJob,
        category: "CLEANING" as JobCategory,
      };

      // This should be allowed
      const result1 = validateJobCompliance(cleaningJob, getWorkerAgeInfo(16));
      expect(result1.compliant).toBe(true);
    });

    it("should reject jobs with pay below minimum wage for hourly work", () => {
      const lowPayJob: JobInput = {
        ...validJob,
        payAmount: 50, // Below minimum
        payType: "HOURLY",
      };

      const result = validateJobCompliance(lowPayJob, getWorkerAgeInfo(16));
      expect(result.compliant).toBe(false);
      expect(result.violations.some((v) => v.code === "BELOW_MINIMUM_WAGE")).toBe(
        true
      );
    });

    it("should warn about working alone in private homes for minors", () => {
      const privateHomeJob: JobInput = {
        ...validJob,
        requiresWorkingAlone: true,
        involvesPrivateHome: true,
      };

      const result = validateJobCompliance(privateHomeJob, getWorkerAgeInfo(16));
      expect(
        result.warnings.some((w) => w.code === "PRIVATE_HOME_ALONE")
      ).toBe(true);
    });

    it("should flag excessive hours on school days for minors", () => {
      const longSchoolDayJob: JobInput = {
        ...validJob,
        duration: 240, // 4 hours
        isSchoolDay: true,
        isSchoolHoliday: false,
      };

      const result = validateJobCompliance(longSchoolDayJob, getWorkerAgeInfo(16));
      expect(result.compliant).toBe(false);
      expect(
        result.violations.some((v) => v.code === "EXCESSIVE_DAILY_HOURS_SCHOOL")
      ).toBe(true);
    });

    it("should allow longer hours during school holidays for minors", () => {
      const holidayJob: JobInput = {
        ...validJob,
        duration: 420, // 7 hours
        isSchoolHoliday: true,
      };

      const result = validateJobCompliance(holidayJob, getWorkerAgeInfo(16));
      expect(result.compliant).toBe(true);
    });

    it("should validate work start time for minors (not before 6:00)", () => {
      const earlyJob: JobInput = {
        ...validJob,
        startTime: new Date("2024-01-15T05:00:00"), // 5 AM
      };

      const result = validateJobCompliance(earlyJob, getWorkerAgeInfo(16));
      expect(result.compliant).toBe(false);
      expect(
        result.violations.some((v) => v.code === "TOO_EARLY_START")
      ).toBe(true);
    });

    it("should validate work end time for minors (not after 21:00 for ages 16-17)", () => {
      const lateJob: JobInput = {
        ...validJob,
        startTime: new Date("2024-01-15T18:00:00"), // 6 PM
        endTime: new Date("2024-01-15T22:00:00"), // 10 PM - after 21:00 limit
      };

      const result = validateJobCompliance(lateJob, getWorkerAgeInfo(16));
      expect(result.compliant).toBe(false);
      expect(
        result.violations.some((v) => v.code === "TOO_LATE_END")
      ).toBe(true);
    });

    it("should allow any end time for young adults (no time restrictions)", () => {
      const lateJob: JobInput = {
        ...validJob,
        payAmount: 180, // Above adult minimum wage
        startTime: new Date("2024-01-15T18:00:00"), // 6 PM
        endTime: new Date("2024-01-15T23:00:00"), // 11 PM
      };

      const result = validateJobCompliance(lateJob, getWorkerAgeInfo(19));
      expect(result.compliant).toBe(true);
    });
  });

  describe("Wage Constants", () => {
    it("should have appropriate minimum wage values", () => {
      expect(MINIMUM_HOURLY_WAGE_YOUTH).toBe(130);
      expect(MINIMUM_HOURLY_WAGE_ADULT).toBe(175);
      expect(MINIMUM_HOURLY_WAGE_YOUTH).toBeLessThan(MINIMUM_HOURLY_WAGE_ADULT);
    });
  });
});

describe("Compliance - Business Logic", () => {
  describe("Age Group Visibility", () => {
    it("should correctly determine job visibility based on category", () => {
      // A job in ERRANDS should be visible to all ages
      const minorErrandsJob: JobInput = {
        title: "Run Errands",
        category: "ERRANDS" as JobCategory,
        description: "Help with grocery shopping",
        payAmount: 150, // Above youth minimum
        payType: "HOURLY",
      };

      const adultErrandsJob: JobInput = {
        ...minorErrandsJob,
        payAmount: 180, // Above adult minimum
      };

      const minorResult = validateJobCompliance(minorErrandsJob, getWorkerAgeInfo(16));
      const adultResult = validateJobCompliance(adultErrandsJob, getWorkerAgeInfo(19));

      expect(minorResult.compliant).toBe(true);
      expect(adultResult.compliant).toBe(true);
    });
  });

  describe("Working Hours Scenarios", () => {
    it("should handle weekend work correctly for minors", () => {
      const weekendJob: JobInput = {
        title: "Weekend Babysitting",
        category: "BABYSITTING" as JobCategory,
        description: "Watch kids on Saturday",
        payAmount: 150,
        payType: "HOURLY",
        duration: 360, // 6 hours
        isSchoolDay: false,
        isSchoolHoliday: false,
      };

      const result = validateJobCompliance(weekendJob, getWorkerAgeInfo(16));
      expect(result.compliant).toBe(true);
    });

    it("should reject excessive hours even during holidays", () => {
      const tooLongHolidayJob: JobInput = {
        title: "Long Shift",
        category: "CLEANING" as JobCategory,
        description: "Full day shift",
        payAmount: 150,
        payType: "HOURLY",
        duration: 540, // 9 hours - exceeds 7 hour limit for minors
        isSchoolHoliday: true,
      };

      const result = validateJobCompliance(tooLongHolidayJob, getWorkerAgeInfo(16));
      expect(result.compliant).toBe(false);
    });
  });
});
