import { describe, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { writeFileSync, mkdirSync } from "fs";
import { buildViewModel, type MapperInput } from "../mapper";
import { VariantDocument } from "../variants/VariantDocument";
import { VARIANTS } from "../variants/variants";

/**
 * Renders all 10 style variants to /tmp/pdf-preview/variants as PDFs.
 * Skipped unless DUMP_VARIANTS=1 so it stays zero-cost in CI.
 *
 * Uses a rich, fully-populated view model so every section gets to
 * exercise each variant's design language.
 */

const shouldDump = process.env.DUMP_VARIANTS === "1";

const richInput = (): MapperInput => ({
  primaryGoalTitle: "Telecom Transformation Lead",
  userAge: 17,
  generatedIso: "2026-04-15T10:00:00.000Z",
  discoverPreferences: {
    subjects: ["Mathematics", "Physics", "Information Technology"],
    workStyle: ["at-desk", "mix"],
    peoplePreference: "with-people",
    interests: ["technology", "problem-solving", "leadership"],
    updatedAt: "2026-03-20T09:00:00.000Z",
  },
  journeySummary: {
    strengths: ["analytical", "calm-under-pressure", "communication", "curiosity"],
    careerInterests: ["Telecom Transformation Lead", "Network Architect"],
    discoverReflections: {
      motivations: ["solving hard problems", "building things that scale"],
      workStyle: ["collaborative", "detail-oriented"],
      growthAreas: ["public speaking"],
      roleModels: "A family friend who led a national broadband rollout.",
      experiences: "Built a small home network, ran cable, set up a family NAS.",
    },
    roleRealityNotes: [
      "Deep breadth required — OSS/BSS, architecture, change management.",
      "Senior track is typically 10+ years with transformation-programme experience.",
      "You lead outcomes, not just technology.",
    ],
    industryInsightNotes: [
      "Norwegian telcos are active on 5G and fixed-wireless access.",
      "TM Forum certifications carry serious weight in this field.",
    ],
    pathQualifications: [
      "Bachelor's in IT or engineering as the baseline.",
      "Master's or TM Forum credentials for senior tracks.",
    ],
    pathSkills: ["architecture", "stakeholder management", "OSS/BSS", "vendor negotiation"],
    pathCourses: ["TM Forum Fundamentals", "TOGAF", "ITIL 4"],
  },
  generatedTimeline: null,
  activeGoalJourneySummary: null,
  career: {
    id: "telecom-transformation-lead",
    title: "Telecom Transformation Lead",
    description:
      "Senior role accountable for rewiring how a telco operates — from OSS/BSS systems through network architecture to customer-facing products. You sit between technology, operations, and the business.",
    sector: "private",
    entryLevel: false,
    educationPath: "Bachelor's / Master's + TM Forum knowledge + Telco transformation experience",
    avgSalary: "900,000 – 1,500,000 kr/year",
    growthOutlook: "high",
  } as unknown as MapperInput["career"],
  careerDetails: {
    whatYouActuallyDo: [
      "Run transformation programmes from board-room framing down to technical delivery.",
      "Design target-state architectures across OSS, BSS, and network layers.",
      "Negotiate with vendors, unblock teams, and communicate with executives.",
    ],
    topSkills: ["architecture", "programme leadership", "OSS/BSS", "stakeholder management", "vendor strategy"],
    whoThisIsGoodFor: [
      "People who enjoy sitting between technology and business.",
      "Long-time thinkers — this is 3–5 year programme work.",
    ],
    realityCheck:
      "This is not a role you enter straight from university. Expect a 10+ year build of architecture, delivery, and leadership credibility first.",
    typicalDay: {
      morning: ["Review programme status", "1:1 with architecture lead"],
      midday: ["Executive steering committee", "Vendor strategy session"],
      afternoon: ["Technical working group", "Weekly programme write-up"],
      tools: ["TOGAF", "TM Forum Frameworx", "Miro", "Confluence"],
      environment: "Head office, with quarterly vendor/partner travel.",
    },
  } as unknown as MapperInput["careerDetails"],
  careerRequirements: {
    schoolSubjects: {
      required: ["Mathematics", "Physics", "Information Technology"],
      recommended: ["English", "Economics"],
      minimumGrade: "Competitive grades, typically 4+ in Norwegian scale",
    },
    universityPath: {
      programme: "Bachelor in Information Technology or Engineering",
      duration: "3–5 years",
      type: "bachelor",
      examples: ["NTNU", "UiO", "OsloMet", "BI Norwegian Business School"],
      applicationRoute: "Samordna opptak",
      competitiveness: "Moderately competitive",
    },
    entryLevelRequirements: {
      title: "Junior Network Engineer",
      description: "Entry role in a telco operations team — you'll learn the stack from the inside.",
      whatYouNeed: "Completed bachelor's + internship / apprenticeship experience.",
    },
    qualifiesFor: {
      immediate: "Junior Network Engineer",
      withExperience: "Senior Architect / Programme Lead",
      seniorPath: "Transformation Director",
    },
    specialisationNote:
      "Telco transformation is a senior track — build architecture, delivery, and stakeholder credibility first.",
  } as unknown as MapperInput["careerRequirements"],
  certificationPath: {
    summary:
      "Telecom transformation is increasingly certification-signalled. TM Forum, TOGAF, and ITIL are the triad most programmes expect.",
    certifications: [
      {
        name: "TM Forum Fundamentals",
        provider: "TM Forum",
        duration: "Self-paced + exam",
        cost: "~5,000 NOK",
        recognised: "Industry standard for telco frameworks",
        url: "https://www.tmforum.org/",
      },
      {
        name: "TOGAF 10 Foundation & Practitioner",
        provider: "The Open Group",
        duration: "5 days + exams",
        cost: "~20,000 NOK",
        recognised: "Gold-standard enterprise architecture credential",
        url: "https://www.opengroup.org/togaf",
      },
      {
        name: "ITIL 4 Foundation",
        provider: "AXELOS / PeopleCert",
        duration: "3 days + exam",
        cost: "~10,000 NOK",
        recognised: "IT service management standard",
        url: "https://www.axelos.com/certifications/propath/itil-4",
      },
    ],
    recommendedDegrees: [
      "Bachelor's in Information Technology or Engineering",
      "Master's in Telecommunications or Management",
    ],
  } as unknown as MapperInput["certificationPath"],
  programmes: [],
  pensionNote:
    "Senior telco roles in Norway typically include extended private pension top-ups on top of folketrygd (state pension).",
});

describe.skipIf(!shouldDump)("PDF variant dump", () => {
  it("renders all 10 style variants", async () => {
    mkdirSync("/tmp/pdf-preview/variants", { recursive: true });
    const vm = buildViewModel(richInput());
    const index: Array<{ key: string; name: string; path: string; size: number }> = [];
    for (const variant of VARIANTS) {
      const buf = await renderToBuffer(<VariantDocument vm={vm} variant={variant} />);
      const filePath = `/tmp/pdf-preview/variants/${variant.key}.pdf`;
      writeFileSync(filePath, buf);
      index.push({ key: variant.key, name: variant.name, path: filePath, size: buf.length });
      console.log(`  ${variant.key}  ${variant.name}  —  ${filePath}  (${buf.length} bytes)`);
    }
    writeFileSync(
      "/tmp/pdf-preview/variants/index.json",
      JSON.stringify(index, null, 2),
    );
  }, 180_000);
});
