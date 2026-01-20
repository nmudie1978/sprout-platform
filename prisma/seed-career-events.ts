import { PrismaClient, CareerEventType, LocationMode } from "@prisma/client";

// Career Events Seed Data
// Focus: Norway-based events + Nordic + European cities
// All dates are set relative to the current date within a 12-month window
//
// For DEMO/DEV: Events are seeded as VERIFIED so they appear immediately.
// For PRODUCTION: Events should be added through an admin interface and
// require manual verification before display.
//
// Cities covered:
// - Norway: Oslo, Bergen, Trondheim, Stavanger, Tromsø, Kristiansand
// - Nordic: Stockholm, Copenhagen, Helsinki
// - Europe: London, Berlin, Amsterdam, Paris, Dublin, Brussels, Barcelona,
//           Zurich, Vienna, Lisbon, Prague, Warsaw, Milan

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

// Career events for testing and demonstration
// In production, events should be added through an admin interface with verification
// For demo/dev, these are marked as verified=true so they appear immediately
export const careerEvents: CareerEventSeed[] = [
  // ================================================
  // NORWEGIAN EVENTS
  // ================================================
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
    isVerified: true, // Verified for demo
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Tromsø Arctic Careers Fair",
    type: CareerEventType.JOBFAIR,
    description:
      "Explore unique career opportunities in the Arctic region. Maritime, research, tourism, and energy sectors represented.",
    organizer: "UiT Arctic University",
    startDate: daysFromNow(55),
    time: "10:00 - 16:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Tromsø",
    region: "Troms og Finnmark",
    country: "Norway",
    venue: "UiT Campus",
    lat: 69.6496,
    lng: 18.9560,
    registrationUrl: "https://uit.no/karriere",
    spots: 200,
    isYouthFocused: true,
    industryTypes: ["tech", "green"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Kristiansand Digital Innovation Day",
    type: CareerEventType.CONFERENCE,
    description:
      "Southern Norway's premier tech event. Startups, established companies, and career opportunities in digital innovation.",
    organizer: "Kristiansand Business Region",
    startDate: daysFromNow(70),
    time: "09:00 - 17:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Kristiansand",
    region: "Agder",
    country: "Norway",
    venue: "Kilden Performing Arts Centre",
    lat: 58.1599,
    lng: 8.0182,
    registrationUrl: "https://kristiansandtech.no",
    spots: 400,
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },

  // ================================================
  // ONLINE EVENTS
  // ================================================
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
    isVerified: true,
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
  },

  // ================================================
  // NORDIC EVENTS (Sweden, Denmark, Finland)
  // ================================================
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
    isVerified: true,
    verifiedAt: new Date(),
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
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Helsinki Startup Career Night",
    type: CareerEventType.MEETUP,
    description:
      "Network with Finland's hottest startups. Discover opportunities in gaming, fintech, and healthtech sectors.",
    organizer: "Slush",
    startDate: daysFromNow(50),
    time: "17:00 - 21:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Helsinki",
    country: "Finland",
    venue: "Maria 01",
    lat: 60.1699,
    lng: 24.9384,
    registrationUrl: "https://slush.org/careers",
    spots: 300,
    isYouthFocused: true,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },

  // ================================================
  // MAJOR EUROPEAN EVENTS
  // ================================================
  {
    title: "European Youth Employment Summit",
    type: CareerEventType.CONFERENCE,
    description:
      "Major European conference on youth employment. Workshops, networking, and job opportunities across industries.",
    organizer: "European Commission",
    startDate: daysFromNow(90),
    endDate: daysFromNow(92),
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
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "London Tech Week - Graduate Fair",
    type: CareerEventType.JOBFAIR,
    description:
      "UK's largest tech careers event. Meet Google, Meta, Amazon, and hundreds of startups.",
    organizer: "London Tech Week",
    startDate: daysFromNow(120),
    time: "10:00 - 18:00",
    locationMode: LocationMode.IN_PERSON,
    city: "London",
    country: "UK",
    venue: "ExCeL London",
    lat: 51.5074,
    lng: -0.1278,
    registrationUrl: "https://londontechweek.com/graduates",
    spots: 5000,
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Berlin Startup Jobs Fair",
    type: CareerEventType.JOBFAIR,
    description:
      "Germany's vibrant startup scene in one place. Entry-level roles in tech, marketing, and operations.",
    organizer: "Berlin Startup Jobs",
    startDate: daysFromNow(75),
    time: "10:00 - 17:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Berlin",
    country: "Germany",
    venue: "Station Berlin",
    lat: 52.5200,
    lng: 13.4050,
    registrationUrl: "https://berlinstartupjobs.com/fair",
    spots: 800,
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Amsterdam Tech Talent Day",
    type: CareerEventType.JOBFAIR,
    description:
      "Connect with Dutch tech companies. Booking.com, Adyen, and more looking for junior talent.",
    organizer: "Amsterdam Tech",
    startDate: daysFromNow(65),
    time: "10:00 - 17:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Amsterdam",
    country: "Netherlands",
    venue: "RAI Amsterdam",
    lat: 52.3676,
    lng: 4.9041,
    registrationUrl: "https://amsterdamtech.com/talent",
    spots: 600,
    isYouthFocused: true,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Paris Green Jobs Summit",
    type: CareerEventType.CONFERENCE,
    description:
      "France's leading event for careers in sustainability. Clean energy, circular economy, and ESG roles.",
    organizer: "ChangeNOW",
    startDate: daysFromNow(100),
    endDate: daysFromNow(101),
    time: "09:00 - 18:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Paris",
    country: "France",
    venue: "Grand Palais",
    lat: 48.8566,
    lng: 2.3522,
    registrationUrl: "https://changenow.world/careers",
    spots: 1500,
    isYouthFocused: false,
    industryTypes: ["green"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Dublin Tech Connect",
    type: CareerEventType.JOBFAIR,
    description:
      "Ireland's tech hub career fair. Meet LinkedIn, Stripe, Intercom and Irish startups.",
    organizer: "Tech Ireland",
    startDate: daysFromNow(85),
    time: "10:00 - 17:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Dublin",
    country: "Ireland",
    venue: "RDS Dublin",
    lat: 53.3498,
    lng: -6.2603,
    registrationUrl: "https://techireland.org/connect",
    spots: 700,
    isYouthFocused: true,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Barcelona Mobile Careers",
    type: CareerEventType.JOBFAIR,
    description:
      "During Mobile World Congress week. App development, UX design, and mobile tech careers.",
    organizer: "Mobile World Congress",
    startDate: daysFromNow(150),
    time: "10:00 - 18:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Barcelona",
    country: "Spain",
    venue: "Fira Barcelona",
    lat: 41.3851,
    lng: 2.1734,
    registrationUrl: "https://mwcbarcelona.com/careers",
    spots: 2000,
    isYouthFocused: false,
    industryTypes: ["tech", "creative"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Zurich Finance & Tech Careers",
    type: CareerEventType.JOBFAIR,
    description:
      "Switzerland's financial center meets tech. Fintech, banking, and insurance career opportunities.",
    organizer: "Swiss Finance Council",
    startDate: daysFromNow(110),
    time: "09:00 - 17:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Zurich",
    country: "Switzerland",
    venue: "Kongresshaus Zürich",
    lat: 47.3769,
    lng: 8.5417,
    registrationUrl: "https://swissfinancetech.com/careers",
    spots: 500,
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Vienna Creative Industries Fair",
    type: CareerEventType.JOBFAIR,
    description:
      "Austria's hub for creative careers. Design, media, gaming, and advertising opportunities.",
    organizer: "Creative Industries Austria",
    startDate: daysFromNow(95),
    time: "10:00 - 18:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Vienna",
    country: "Austria",
    venue: "MuseumsQuartier",
    lat: 48.2082,
    lng: 16.3738,
    registrationUrl: "https://creativeindustries.at/fair",
    spots: 400,
    isYouthFocused: true,
    industryTypes: ["creative"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Lisbon Web Summit Careers",
    type: CareerEventType.CONFERENCE,
    description:
      "During Web Summit week. Network with thousands of startups and tech companies from around the world.",
    organizer: "Web Summit",
    startDate: daysFromNow(300),
    endDate: daysFromNow(303),
    time: "09:00 - 21:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Lisbon",
    country: "Portugal",
    venue: "Altice Arena",
    lat: 38.7223,
    lng: -9.1393,
    registrationUrl: "https://websummit.com/careers",
    spots: 3000,
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Prague Developer Days",
    type: CareerEventType.CONFERENCE,
    description:
      "Central Europe's developer conference. Learn from experts and meet hiring tech companies.",
    organizer: "Czech Tech",
    startDate: daysFromNow(130),
    endDate: daysFromNow(131),
    time: "09:00 - 18:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Prague",
    country: "Czech Republic",
    venue: "O2 Universum",
    lat: 50.0755,
    lng: 14.4378,
    registrationUrl: "https://developerdays.cz",
    spots: 1000,
    isYouthFocused: false,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Warsaw Tech Talent Summit",
    type: CareerEventType.JOBFAIR,
    description:
      "Poland's tech job market in one event. International companies and local unicorns hiring.",
    organizer: "Startup Poland",
    startDate: daysFromNow(80),
    time: "10:00 - 17:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Warsaw",
    country: "Poland",
    venue: "PGE Narodowy",
    lat: 52.2297,
    lng: 21.0122,
    registrationUrl: "https://startuppoland.org/talent",
    spots: 800,
    isYouthFocused: true,
    industryTypes: ["tech"],
    isVerified: true,
    verifiedAt: new Date(),
  },
  {
    title: "Milan Fashion Tech Careers",
    type: CareerEventType.JOBFAIR,
    description:
      "Where fashion meets technology. Digital fashion, e-commerce, and creative tech careers.",
    organizer: "Milano Fashion Tech",
    startDate: daysFromNow(140),
    time: "10:00 - 18:00",
    locationMode: LocationMode.IN_PERSON,
    city: "Milan",
    country: "Italy",
    venue: "Fiera Milano",
    lat: 45.4642,
    lng: 9.1900,
    registrationUrl: "https://milanofashiontech.com/careers",
    spots: 600,
    isYouthFocused: false,
    industryTypes: ["tech", "creative"],
    isVerified: true,
    verifiedAt: new Date(),
  },
];

export async function seedCareerEvents(prisma: PrismaClient): Promise<void> {
  console.log("📅 Seeding career events (verified for demo/dev)...");

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
          // For demo/dev: Always set verified from seed data
          isVerified: eventData.isVerified ?? true,
          verifiedAt: eventData.verifiedAt ?? new Date(),
        },
      });
      updated++;
    } else {
      await prisma.careerEvent.create({
        data: {
          ...eventData,
          isActive: true,
          isVerified: eventData.isVerified ?? true,
          verifiedAt: eventData.verifiedAt ?? new Date(),
        },
      });
      created++;
    }
  }

  console.log(`✅ Seeded ${created} new career events, updated ${updated} existing`);
  console.log("✅ All seeded events are verified and will appear in the events calendar.");
}
