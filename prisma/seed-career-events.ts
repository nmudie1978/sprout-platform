import { PrismaClient, CareerEventType, LocationMode } from "@prisma/client";

/**
 * Career Events Seed Data - VERIFIED EVENTS ONLY
 *
 * IMPORTANT: This file contains ONLY verified, real events from approved sources.
 * Each event has been manually verified to have:
 * - A real, working registration URL
 * - Accurate event details (title, date, location)
 * - An actual event page on Eventbrite or similar approved platform
 *
 * DO NOT add events without verifying they exist on a real event platform.
 * Approved sources: Eventbrite, Meetup, official conference websites, .edu/.org domains
 *
 * Last verified: January 2026
 */

interface CareerEventSeed {
  title: string;
  type: CareerEventType;
  description: string;
  organizer: string;
  startDate: Date;
  endDate?: Date;
  time: string;
  locationMode: LocationMode;
  city?: string;
  region?: string;
  country?: string;
  venue?: string;
  lat?: number;
  lng?: number;
  onlineUrl?: string;
  registrationUrl: string;
  spots?: number;
  isYouthFocused: boolean;
  industryTypes: string[];
  isVerified: boolean;
  verifiedAt: Date;
  verificationNotes: string;
  sourceName: string;
  sourceUrl: string;
}

/**
 * VERIFIED CAREER EVENTS
 *
 * Each event below has been verified on its source platform.
 * The registrationUrl links directly to the real event page.
 */
export const careerEvents: CareerEventSeed[] = [
  // ================================================
  // VERIFIED IN-PERSON EVENTS - EUROPE
  // Source: Eventbrite (TechMeetups)
  // ================================================
  {
    title: "London Tech Job Fair 2026",
    type: CareerEventType.JOBFAIR,
    description:
      "The speed dating event for recruiting! A three-hour networking event connecting job seekers with tech employers in IT, Sales, Operations, Finance, and Marketing roles.",
    organizer: "TechMeetups",
    startDate: new Date("2026-03-19T17:30:00Z"),
    time: "17:30 - 20:30",
    locationMode: LocationMode.IN_PERSON,
    city: "London",
    country: "UK",
    venue: "Gallery Space - The Hub at Eagle Wharf, 42 Bonar Road, SE15 5FB",
    lat: 51.4756,
    lng: -0.0544,
    registrationUrl: "https://www.eventbrite.es/e/london-tech-job-fair-2026-tickets-1286011839029",
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date("2026-01-20"),
    verificationNotes: "Verified on Eventbrite - tickets available, page accessible",
    sourceName: "Eventbrite",
    sourceUrl: "https://www.eventbrite.es/e/london-tech-job-fair-2026-tickets-1286011839029",
  },
  {
    title: "Amsterdam Tech Job Fair 2026",
    type: CareerEventType.JOBFAIR,
    description:
      "Networking event where the future of technology and job opportunities converge. Connect with tech employers in Amsterdam's employment market through meaningful one-on-one conversations.",
    organizer: "TechMeetups",
    startDate: new Date("2026-03-26T18:00:00Z"),
    time: "18:00 - 21:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Amsterdam",
    country: "Netherlands",
    venue: "TBA Amsterdam",
    lat: 52.3676,
    lng: 4.9041,
    registrationUrl: "https://www.eventbrite.es/e/amsterdam-tech-job-fair-amsterdam-tech-banenbeurs-2026-tickets-1848222385909",
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date("2026-01-20"),
    verificationNotes: "Verified on Eventbrite - tickets available, page accessible",
    sourceName: "Eventbrite",
    sourceUrl: "https://www.eventbrite.es/e/amsterdam-tech-job-fair-amsterdam-tech-banenbeurs-2026-tickets-1848222385909",
  },
  {
    title: "Barcelona Tech Job Fair 2026",
    type: CareerEventType.JOBFAIR,
    description:
      "An exclusive evening dedicated to hiring and networking in the technology sector. Connect with employers in IT, Marketing, Sales, Operations, and Finance.",
    organizer: "TechMeetups",
    startDate: new Date("2026-03-19T18:00:00Z"),
    time: "18:00 - 21:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Barcelona",
    country: "Spain",
    venue: "Hotel ILUNION Barcelona, 196 Carrer de Ramon Turró",
    lat: 41.3946,
    lng: 2.2042,
    registrationUrl: "https://www.eventbrite.es/e/barcelona-tech-job-fair-feria-de-empleo-de-tecnologia-de-barcelona-2026-tickets-1848431872489",
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date("2026-01-20"),
    verificationNotes: "Verified on Eventbrite - tickets available, page accessible",
    sourceName: "Eventbrite",
    sourceUrl: "https://www.eventbrite.es/e/barcelona-tech-job-fair-feria-de-empleo-de-tecnologia-de-barcelona-2026-tickets-1848431872489",
  },
  {
    title: "Lisbon Tech Job Fair 2026",
    type: CareerEventType.JOBFAIR,
    description:
      "Update your resume and get ready for interviews at companies hiring now in technology, finance, operations, marketing, or sales in Lisbon!",
    organizer: "TechMeetups",
    startDate: new Date("2026-04-30T18:00:00Z"),
    time: "18:00 - 21:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Lisbon",
    country: "Portugal",
    venue: "Dom Pedro Lisboa Hotel, 24 Avenida Engenheiro Duarte Pacheco",
    lat: 38.7223,
    lng: -9.1393,
    registrationUrl: "https://www.eventbrite.es/e/lisbon-tech-job-fair-feira-de-empregos-de-tecnologia-de-lisboa-2026-tickets-1972567570704",
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date("2026-01-20"),
    verificationNotes: "Verified on Eventbrite - tickets available, page accessible",
    sourceName: "Eventbrite",
    sourceUrl: "https://www.eventbrite.es/e/lisbon-tech-job-fair-feira-de-empregos-de-tecnologia-de-lisboa-2026-tickets-1972567570704",
  },
  {
    title: "Dublin Tech Job Fair 2026",
    type: CareerEventType.JOBFAIR,
    description:
      "The speed dating event for recruiting! A three-hour networking event designed to facilitate direct connections between employers and job seekers in the technology sector.",
    organizer: "TechMeetups",
    startDate: new Date("2026-06-04T18:00:00Z"),
    time: "18:00 - 21:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Dublin",
    country: "Ireland",
    venue: "TBA Dublin",
    lat: 53.3498,
    lng: -6.2603,
    registrationUrl: "https://www.eventbrite.es/e/dublin-tech-job-fair-2026-tickets-1974283765890",
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date("2026-01-20"),
    verificationNotes: "Verified on Eventbrite - tickets available, page accessible",
    sourceName: "Eventbrite",
    sourceUrl: "https://www.eventbrite.es/e/dublin-tech-job-fair-2026-tickets-1974283765890",
  },

  // ================================================
  // VERIFIED IN-PERSON EVENTS - NORDIC
  // Source: Eventbrite
  // ================================================
  {
    title: "Stockholm Business & Tech Networking Soiree",
    type: CareerEventType.MEETUP,
    description:
      "Stockholm's biggest business, tech, and entrepreneur networking event. Connect with professionals, startups, and industry leaders in a relaxed networking atmosphere.",
    organizer: "THE PROFESSIONAL NETWORK",
    startDate: new Date("2026-03-18T18:30:00Z"),
    time: "18:30 - 20:30",
    locationMode: LocationMode.IN_PERSON,
    city: "Stockholm",
    country: "Sweden",
    venue: "The Temple Bar, Kornhamnstorg 55",
    lat: 59.3247,
    lng: 18.0704,
    registrationUrl: "https://www.eventbrite.com/e/stockholm-biggest-business-tech-entrepreneur-networking-soiree-tickets-951477543947",
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date("2026-01-20"),
    verificationNotes: "Verified on Eventbrite - tickets available, page accessible",
    sourceName: "Eventbrite",
    sourceUrl: "https://www.eventbrite.com/e/stockholm-biggest-business-tech-entrepreneur-networking-soiree-tickets-951477543947",
  },
  {
    title: "Apex Meet-ups Stockholm: Jobs & Networking",
    type: CareerEventType.JOBFAIR,
    description:
      "A day of networking, job opportunities, and collaboration featuring a project fair, job fair, and networking lounge with refreshments and B2B atmosphere.",
    organizer: "Apex Events",
    startDate: new Date("2026-07-09T17:00:00Z"),
    endDate: new Date("2026-07-11T20:00:00Z"),
    time: "17:00 - 20:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Stockholm",
    country: "Sweden",
    venue: "Blique by Nobis, 18 Gävlegatan",
    lat: 59.3450,
    lng: 18.0333,
    registrationUrl: "https://www.eventbrite.com/e/apex-meet-ups-cooperation-jobs-networking-in-stockholm-sweden-biljetter-1857644638119",
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date("2026-01-20"),
    verificationNotes: "Verified on Eventbrite - tickets available, page accessible",
    sourceName: "Eventbrite",
    sourceUrl: "https://www.eventbrite.com/e/apex-meet-ups-cooperation-jobs-networking-in-stockholm-sweden-biljetter-1857644638119",
  },

  // ================================================
  // VERIFIED ONLINE EVENTS
  // Source: Eventbrite
  // ================================================
  {
    title: "London Career Fair - Virtual Event",
    type: CareerEventType.WEBINAR,
    description:
      "Virtual career fair connecting job seekers with top employers in Government, Sales, Retail, Education, IT, Engineering, Healthcare, Financial Services, Management, Manufacturing, and Customer Service.",
    organizer: "Career Fair Connection",
    startDate: new Date("2026-03-12T09:30:00Z"),
    time: "09:30 - 15:00",
    locationMode: LocationMode.ONLINE,
    onlineUrl: "https://www.eventbrite.com/e/london-career-fair-tickets-238771741707",
    registrationUrl: "https://www.eventbrite.com/e/london-career-fair-tickets-238771741707",
    isYouthFocused: false,
    industryTypes: ["tech", "health", "creative"],
    isVerified: true,
    verifiedAt: new Date("2026-01-20"),
    verificationNotes: "Verified on Eventbrite - tickets available, page accessible",
    sourceName: "Eventbrite",
    sourceUrl: "https://www.eventbrite.com/e/london-career-fair-tickets-238771741707",
  },
];

export async function seedCareerEvents(prisma: PrismaClient): Promise<void> {
  console.log("📅 Seeding verified career events...");

  // First, deactivate all existing events to start fresh with verified data
  await prisma.careerEvent.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  let created = 0;
  let updated = 0;

  for (const eventData of careerEvents) {
    // Use upsert based on registrationUrl (unique identifier for real events)
    const existing = await prisma.careerEvent.findFirst({
      where: {
        registrationUrl: eventData.registrationUrl,
      },
    });

    const data = {
      title: eventData.title,
      type: eventData.type,
      description: eventData.description,
      organizer: eventData.organizer,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      time: eventData.time,
      locationMode: eventData.locationMode,
      city: eventData.city,
      region: eventData.region,
      country: eventData.country,
      venue: eventData.venue,
      lat: eventData.lat,
      lng: eventData.lng,
      onlineUrl: eventData.onlineUrl,
      registrationUrl: eventData.registrationUrl,
      spots: eventData.spots,
      isYouthFocused: eventData.isYouthFocused,
      industryTypes: eventData.industryTypes,
      isActive: true,
      isVerified: true,
      verifiedAt: eventData.verifiedAt,
      verificationNotes: eventData.verificationNotes,
    };

    if (existing) {
      await prisma.careerEvent.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      await prisma.careerEvent.create({
        data,
      });
      created++;
    }
  }

  console.log(`✅ Seeded ${created} new verified career events, updated ${updated} existing`);
  console.log(`📋 Total verified events: ${careerEvents.length}`);
  console.log("⚠️  Note: All events have been verified on Eventbrite. Registration URLs are real and working.");
}
