import { PrismaClient, CareerEventType, LocationMode } from "@prisma/client";

// Career Events Seed Data
// Focus: Norway-based events + online/Europe-wide events
// All dates are set relative to the current date to stay within the 120-day window
//
// IMPORTANT: Events are seeded as UNVERIFIED by default.
// Events must be manually verified by an admin before they appear to users.
// Verification requires confirming:
// 1. The event actually exists
// 2. The registration URL is valid and working
// 3. The event details (date, location, organizer) are accurate
//
// To verify events, update isVerified=true and verifiedAt=now in the database.

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
  // Verification fields
  isVerified?: boolean;
  verifiedAt?: Date;
  verificationNotes?: string;
}

// Helper to create dates relative to now
const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date;
};

// Example/placeholder events - these need manual verification before display
// In production, events should only be added after URL and details are confirmed
export const careerEvents: CareerEventSeed[] = [
  // Norwegian Local Events (Oslo area)
  {
    title: "Oslo Tech Careers Fair 2026",
    type: CareerEventType.JOBFAIR,
    description:
      "Meet top tech employers in Oslo. Featuring internships and entry-level positions for young people interested in software, IT, and digital careers.",
    organizer: "NAV Oslo",
    startDate: daysFromNow(21),
    time: "10:00 - 16:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Oslo",
    region: "Oslo",
    country: "Norway",
    venue: "Oslo Spektrum",
    lat: 59.9127,
    lng: 10.7507,
    registrationUrl: "https://nav.no/careers",
    spots: 500,
    isYouthFocused: true,
    industryTypes: ["tech"],
    isVerified: false, // Requires manual verification
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Youth in Green Energy Workshop",
    type: CareerEventType.WORKSHOP,
    description:
      "Hands-on workshop exploring careers in renewable energy. Learn about solar, wind, and sustainable tech from industry professionals.",
    organizer: "Equinor Youth Program",
    startDate: daysFromNow(35),
    time: "13:00 - 17:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Stavanger",
    region: "Rogaland",
    country: "Norway",
    venue: "Equinor Innovation Center",
    lat: 58.9701,
    lng: 5.7333,
    registrationUrl: "https://equinor.com/youth",
    spots: 50,
    isYouthFocused: true,
    industryTypes: ["green"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Bergen Healthcare Career Day",
    type: CareerEventType.JOBFAIR,
    description:
      "Explore nursing, medical technology, and health support careers. Meet recruiters from Haukeland University Hospital and local clinics.",
    organizer: "Helse Bergen",
    startDate: daysFromNow(28),
    time: "09:00 - 15:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Bergen",
    region: "Vestland",
    country: "Norway",
    venue: "Haukeland Universitetssykehus",
    lat: 60.3913,
    lng: 5.3221,
    registrationUrl: "https://helse-bergen.no/karriere",
    spots: 300,
    isYouthFocused: true,
    industryTypes: ["health"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Creative Industries Night - Oslo",
    type: CareerEventType.MEETUP,
    description:
      "Network with professionals in design, media, and content creation. Portfolio reviews and career advice for aspiring creatives.",
    organizer: "Westerdals Oslo ACT",
    startDate: daysFromNow(14),
    time: "18:00 - 21:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Oslo",
    region: "Oslo",
    country: "Norway",
    venue: "Westerdals Campus",
    lat: 59.9139,
    lng: 10.7522,
    registrationUrl: "https://westerdals.no/events",
    spots: 100,
    isYouthFocused: true,
    industryTypes: ["creative"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Trondheim Tech Meetup for Students",
    type: CareerEventType.MEETUP,
    description:
      "Monthly meetup for students and young professionals interested in tech. Presentations from NTNU startups and tech companies.",
    organizer: "NTNU Career Center",
    startDate: daysFromNow(10),
    time: "17:00 - 20:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Trondheim",
    region: "Trøndelag",
    country: "Norway",
    venue: "NTNU Gløshaugen",
    lat: 63.4189,
    lng: 10.4019,
    registrationUrl: "https://ntnu.no/karriere",
    spots: 150,
    isYouthFocused: true,
    industryTypes: ["tech"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },

  // Online Events
  {
    title: "Getting Started in Tech - Free Webinar",
    type: CareerEventType.WEBINAR,
    description:
      "Learn how to start a career in tech without a university degree. Discover bootcamps, self-learning paths, and certification options.",
    organizer: "FreeCodeCamp Norway",
    startDate: daysFromNow(7),
    time: "18:00 - 19:30",
    locationMode: LocationMode.ONLINE,
    onlineUrl: "https://zoom.us/webinar",
    registrationUrl: "https://freecodecamp.org/norway",
    isYouthFocused: true,
    industryTypes: ["tech"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "AI & The Future of Work - Youth Edition",
    type: CareerEventType.WEBINAR,
    description:
      "Understand how AI is changing careers and what skills you need for the future. Interactive Q&A with AI professionals.",
    organizer: "Microsoft Norge",
    startDate: daysFromNow(18),
    time: "16:00 - 17:30",
    locationMode: LocationMode.ONLINE,
    onlineUrl: "https://teams.microsoft.com",
    registrationUrl: "https://microsoft.com/norge/events",
    isYouthFocused: true,
    industryTypes: ["tech"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Green Careers: Your Path to Sustainability",
    type: CareerEventType.WEBINAR,
    description:
      "Explore career opportunities in the green economy. From solar technicians to sustainability consultants - find your role.",
    organizer: "WWF Norway",
    startDate: daysFromNow(25),
    time: "17:00 - 18:30",
    locationMode: LocationMode.ONLINE,
    onlineUrl: "https://webinar.wwf.no",
    registrationUrl: "https://wwf.no/karriere",
    isYouthFocused: true,
    industryTypes: ["green"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Healthcare Careers for Young People",
    type: CareerEventType.WEBINAR,
    description:
      "Learn about pathways into nursing, medical technology, and health support roles. No prior experience needed.",
    organizer: "Norsk Sykepleierforbund",
    startDate: daysFromNow(12),
    time: "18:00 - 19:00",
    locationMode: LocationMode.ONLINE,
    onlineUrl: "https://zoom.us/nsf",
    registrationUrl: "https://nsf.no/ung",
    isYouthFocused: true,
    industryTypes: ["health"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },

  // Europe-wide Events
  {
    title: "European Youth Employment Summit",
    type: CareerEventType.CONFERENCE,
    description:
      "Major European conference on youth employment. Workshops, networking, and job opportunities across industries.",
    organizer: "European Commission",
    startDate: daysFromNow(60),
    endDate: daysFromNow(62),
    time: "09:00 - 18:00",
    locationMode: LocationMode.HYBRID,
    city: "Brussels",
    country: "Belgium",
    venue: "European Parliament",
    lat: 50.8468,
    lng: 4.3517,
    onlineUrl: "https://europa.eu/youth-summit",
    registrationUrl: "https://europa.eu/youth-summit/register",
    spots: 2000,
    isYouthFocused: true,
    industryTypes: ["tech", "green", "health", "creative"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Nordic Game Jam - Career Track",
    type: CareerEventType.WORKSHOP,
    description:
      "48-hour game development event with career workshops. Meet game studios from Scandinavia and showcase your skills.",
    organizer: "Nordic Game",
    startDate: daysFromNow(45),
    endDate: daysFromNow(47),
    time: "12:00 - 20:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Copenhagen",
    country: "Denmark",
    venue: "Copenhagen IT University",
    lat: 55.6596,
    lng: 12.5912,
    registrationUrl: "https://nordicgame.com/jam",
    spots: 500,
    isYouthFocused: true,
    industryTypes: ["tech", "creative"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Stockholm Tech Jobs Fair",
    type: CareerEventType.JOBFAIR,
    description:
      "Meet employers like Spotify, Klarna, and King. Entry-level positions and internships available.",
    organizer: "Stockholm Tech",
    startDate: daysFromNow(40),
    time: "10:00 - 17:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Stockholm",
    country: "Sweden",
    venue: "Stockholmsmässan",
    lat: 59.2638,
    lng: 18.0005,
    registrationUrl: "https://stockholmtech.com/jobs",
    spots: 1000,
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Portfolio Building Workshop",
    type: CareerEventType.WORKSHOP,
    description:
      "Learn how to create a standout portfolio for creative careers. Hands-on session with industry mentors.",
    organizer: "Behance",
    startDate: daysFromNow(22),
    time: "14:00 - 18:00",
    locationMode: LocationMode.ONLINE,
    onlineUrl: "https://behance.net/workshop",
    registrationUrl: "https://behance.net/events",
    spots: 200,
    isYouthFocused: true,
    industryTypes: ["creative"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
  {
    title: "Wind Energy Careers - Nordic Edition",
    type: CareerEventType.WEBINAR,
    description:
      "Discover career opportunities in wind energy across the Nordics. From technicians to engineers.",
    organizer: "WindEurope",
    startDate: daysFromNow(33),
    time: "15:00 - 16:30",
    locationMode: LocationMode.ONLINE,
    onlineUrl: "https://windeurope.org/webinar",
    registrationUrl: "https://windeurope.org/careers",
    isYouthFocused: false,
    industryTypes: ["green"],
    isVerified: false,
    verificationNotes: "Placeholder - needs URL verification",
  },
];

export async function seedCareerEvents(prisma: PrismaClient): Promise<void> {
  console.log("📅 Seeding career events (unverified - requires manual verification)...");

  let created = 0;
  let updated = 0;

  for (const eventData of careerEvents) {
    // Use upsert based on title + startDate to avoid duplicates
    const existing = await prisma.careerEvent.findFirst({
      where: {
        title: eventData.title,
        startDate: eventData.startDate,
      },
    });

    if (existing) {
      await prisma.careerEvent.update({
        where: { id: existing.id },
        data: {
          ...eventData,
          isActive: true,
          // Preserve existing verification status if already verified
          isVerified: existing.isVerified || eventData.isVerified || false,
          verifiedAt: existing.verifiedAt || eventData.verifiedAt,
        },
      });
      updated++;
    } else {
      await prisma.careerEvent.create({
        data: {
          ...eventData,
          isActive: true,
          isVerified: eventData.isVerified || false,
          verifiedAt: eventData.verifiedAt,
        },
      });
      created++;
    }
  }

  console.log(`✅ Seeded ${created} new career events, updated ${updated} existing`);
  console.log("⚠️  Note: Events are unverified and will not appear until manually verified.");
  console.log("   To verify an event, set isVerified=true and verifiedAt=NOW() in the database.");
}
