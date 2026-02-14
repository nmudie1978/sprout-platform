import { describe, it, expect } from "vitest";
import { careerEvents } from "../../../../prisma/seed-career-events";
import {
  validateEventUrl,
  isValidEventbriteUrl,
} from "../trusted-domains";

/**
 * CI VALIDATION — Career Events Seed Data
 *
 * These tests run on every CI build and validate that the seed
 * data in prisma/seed-career-events.ts meets all integrity rules.
 * No network calls — pure structural validation.
 */

describe("Career Events Seed Data", () => {
  // ================================================
  // URL INTEGRITY
  // ================================================

  describe("URL integrity", () => {
    it("all registrationUrls use HTTPS", () => {
      for (const event of careerEvents) {
        const url = new URL(event.registrationUrl);
        expect(
          url.protocol,
          `${event.title}: registrationUrl must be HTTPS`
        ).toBe("https:");
      }
    });

    it("all registrationUrls are from trusted domains", () => {
      for (const event of careerEvents) {
        const result = validateEventUrl(event.registrationUrl);
        expect(
          result.valid,
          `${event.title}: ${result.errors.join("; ")}`
        ).toBe(true);
      }
    });

    it("Eventbrite URLs have numeric ticket IDs", () => {
      const eventbriteEvents = careerEvents.filter((e) =>
        e.registrationUrl.toLowerCase().includes("eventbrite")
      );

      expect(eventbriteEvents.length).toBeGreaterThan(0);

      for (const event of eventbriteEvents) {
        expect(
          isValidEventbriteUrl(event.registrationUrl),
          `${event.title}: Eventbrite URL missing ticket ID suffix (tickets-\\d+ or biljetter-\\d+). ` +
            `Got: ${event.registrationUrl}`
        ).toBe(true);
      }
    });

    it("no duplicate registrationUrls", () => {
      const urls = careerEvents.map((e) => e.registrationUrl);
      const uniqueUrls = new Set(urls);
      expect(
        uniqueUrls.size,
        `Found ${urls.length - uniqueUrls.size} duplicate registrationUrl(s)`
      ).toBe(urls.length);
    });
  });

  // ================================================
  // DATE INTEGRITY
  // ================================================

  describe("date integrity", () => {
    it("all startDates are within the past 30 days or in the future", () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const event of careerEvents) {
        expect(
          event.startDate >= thirtyDaysAgo,
          `${event.title}: startDate ${event.startDate.toISOString()} is more than 30 days in the past`
        ).toBe(true);
      }
    });

    it("endDate is after startDate when present", () => {
      const eventsWithEnd = careerEvents.filter((e) => e.endDate);
      for (const event of eventsWithEnd) {
        expect(
          event.endDate! > event.startDate,
          `${event.title}: endDate must be after startDate`
        ).toBe(true);
      }
    });
  });

  // ================================================
  // REQUIRED FIELDS
  // ================================================

  describe("required fields", () => {
    it("all events have non-empty title", () => {
      for (const event of careerEvents) {
        expect(
          event.title.trim().length,
          "Event has empty title"
        ).toBeGreaterThan(0);
      }
    });

    it("all events have non-empty description", () => {
      for (const event of careerEvents) {
        expect(
          event.description.trim().length,
          `${event.title}: empty description`
        ).toBeGreaterThan(0);
      }
    });

    it("all events have non-empty organizer", () => {
      for (const event of careerEvents) {
        expect(
          event.organizer.trim().length,
          `${event.title}: empty organizer`
        ).toBeGreaterThan(0);
      }
    });
  });

  // ================================================
  // LOCATION INTEGRITY
  // ================================================

  describe("location integrity", () => {
    it("in-person events have city and country", () => {
      const inPersonEvents = careerEvents.filter(
        (e) => e.locationMode === "IN_PERSON"
      );

      for (const event of inPersonEvents) {
        expect(
          event.city?.trim().length,
          `${event.title}: in-person event missing city`
        ).toBeGreaterThan(0);
        expect(
          event.country?.trim().length,
          `${event.title}: in-person event missing country`
        ).toBeGreaterThan(0);
      }
    });
  });

  // ================================================
  // VERIFICATION NOTES QUALITY
  // ================================================

  describe("verification notes", () => {
    it("verificationNotes are at least 20 characters", () => {
      for (const event of careerEvents) {
        expect(
          event.verificationNotes.length,
          `${event.title}: verificationNotes too short (${event.verificationNotes.length} chars, need >= 20)`
        ).toBeGreaterThanOrEqual(20);
      }
    });

    it("verificationNotes are not boilerplate", () => {
      const boilerplate = [
        "verified on eventbrite - tickets available, page accessible",
        "verified - page accessible",
        "verified - tickets available",
        "manually verified",
      ];

      for (const event of careerEvents) {
        const normalised = event.verificationNotes.toLowerCase().trim();
        for (const bp of boilerplate) {
          expect(
            normalised === bp,
            `${event.title}: verificationNotes is boilerplate ("${event.verificationNotes}"). ` +
              `Each event needs a specific note (e.g. event name, date, ID).`
          ).toBe(false);
        }
      }
    });
  });
});
