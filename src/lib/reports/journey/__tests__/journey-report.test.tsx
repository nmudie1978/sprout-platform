import { describe, it, expect } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildViewModel, type MapperInput } from "../mapper";
import { JourneyReportDocument } from "../Document";

/**
 * These tests verify that the Journey Report pipeline renders cleanly
 * for the full range of realistic user states — including the empty and
 * hostile edge cases. We are not asserting visual fidelity here; we're
 * asserting that the mapper + document compose into a non-trivial PDF
 * buffer without throwing, for every scenario the product can produce.
 */

const baseInput = (): MapperInput => ({
  primaryGoalTitle: null,
  journeySummary: null,
  generatedTimeline: null,
  activeGoalJourneySummary: null,
  discoverPreferences: null,
  career: null,
  careerDetails: null,
  careerRequirements: null,
  certificationPath: null,
  programmes: [],
  pensionNote: null,
  userAge: null,
  generatedIso: "2026-04-15T10:00:00.000Z",
});

async function renderOk(input: MapperInput) {
  const vm = buildViewModel(input);
  const buf = await renderToBuffer(<JourneyReportDocument vm={vm} />);
  // A PDF starts with "%PDF-" — sanity check the buffer is a real PDF.
  expect(buf.slice(0, 5).toString()).toBe("%PDF-");
  expect(buf.length).toBeGreaterThan(2000);
  return { vm, buf };
}

describe("JourneyReportDocument — scenarios", () => {
  it("renders cleanly for a completely empty journey", async () => {
    const { vm } = await renderOk(baseInput());
    // Still generates an executive summary, a roadmap empty state, and
    // at least one next-step recommendation.
    expect(vm.executive.paragraphs.length).toBeGreaterThan(0);
    expect(vm.nextSteps.length).toBeGreaterThan(0);
  });

  it("renders a fully-completed journey (long content, all sections)", async () => {
    const longText = "This is a deliberately long reflection. ".repeat(30);
    const input: MapperInput = {
      ...baseInput(),
      primaryGoalTitle: "Doctor",
      userAge: 17,
      generatedIso: "2026-04-15T10:00:00.000Z",
      journeySummary: {
        strengths: ["empathy", "problem-solving", "resilience", "curiosity", "communication"],
        careerInterests: ["Doctor", "Nurse", "Researcher"],
        discoverReflections: {
          motivations: ["helping people", "lifelong learning", "solving hard problems"],
          workStyle: ["collaborative", "detail-oriented", "calm under pressure"],
          growthAreas: ["public speaking", "time management"],
          roleModels: "My aunt, who is a surgeon in Oslo, has been the biggest influence on me.",
          experiences: longText,
        },
        roleRealityNotes: [
          "Long training pipeline — 6 years medicine, 1.5 years internship, 3–6 years specialty.",
          "Shift work and on-call duty are a real part of the lifestyle.",
          "Emotional labour is underrated — support systems matter.",
        ],
        industryInsightNotes: [
          "Norway has robust public healthcare and high demand for specialists.",
          "Interdisciplinary work is becoming more common.",
        ],
        pathQualifications: [
          "Realfag with strong grades in Biology, Chemistry, and Mathematics R2.",
          "Competitive admission at UiO, UiB, NTNU, or abroad.",
        ],
        pathSkills: ["communication", "empathy", "diagnostic reasoning", "resilience", "teamwork"],
        pathCourses: [
          "Anatomy and physiology",
          "Pharmacology",
          "Medical ethics",
          "Clinical skills practicum",
        ],
        rolePlans: [
          {
            roleTitle: "Medical intern at Oslo University Hospital",
            shortTermActions: [
              "Shadow a family doctor for a day.",
              "Volunteer at a care home this term.",
              "Watch three Day-in-the-Life videos and take notes.",
            ],
            midTermMilestone: "Admission to UiO Medisin",
            skillToBuild: "Clinical communication under pressure",
          },
        ],
        alignedActions: [
          { type: "research", title: "Completed the role reality quiz" },
          { type: "reach_out", title: "Messaged a junior doctor on LinkedIn" },
        ],
        alignedActionReflections: [
          { response: "The day-in-the-life was longer than I expected, but it confirmed my interest." },
          { response: "Hearing a real doctor say 'the first two years are hard' actually calmed me down — it's normal." },
        ],
        educationContext: {
          stage: "secondary",
          schoolName: "Wellington College",
          studyProgram: "A-Levels",
          expectedCompletion: "2027",
          currentSubjects: ["Biology", "Chemistry", "Mathematics", "English"],
        },
      },
      generatedTimeline: {
        career: "Doctor",
        items: [
          {
            stage: "foundation",
            title: "Finish secondary school strong",
            startAge: 17,
            endAge: 18,
            isMilestone: false,
            description: "Aim for top grades in Biology, Chemistry, and Mathematics — these anchor your medicine application.",
            microActions: ["Join a biology olympiad", "Start a chemistry study group"],
          },
          {
            stage: "education",
            title: "Apply to medicine at UiO",
            startAge: 18,
            endAge: 19,
            isMilestone: true,
            description: "Submit via Samordna opptak by 15 April.",
          },
          {
            stage: "education",
            title: "Complete Medisin (6-year integrated)",
            startAge: 19,
            endAge: 25,
            isMilestone: false,
          },
          {
            stage: "experience",
            title: "LIS1 internship (18 months)",
            startAge: 25,
            endAge: 27,
            isMilestone: true,
          },
          {
            stage: "experience",
            title: "Choose a specialty track",
            startAge: 27,
            endAge: 28,
            isMilestone: false,
          },
          {
            stage: "career",
            title: "Qualified specialist",
            startAge: 33,
            isMilestone: true,
          },
        ],
        schoolTrack: [
          {
            stage: "foundation",
            title: "A-Level years",
            subjects: ["Biology", "Chemistry", "Mathematics", "English"],
            personalLearning: "Read one medical memoir per term.",
            startAge: 17,
            endAge: 18,
          },
        ],
      },
      activeGoalJourneySummary: {
        momentumActions: [
          { text: "Shadow a family doctor for a day", done: true, status: "done", type: "reach" },
          { text: "Read Being Mortal by Atul Gawande", done: false, status: "in_progress", type: "learn" },
          { text: "Message a junior doctor on LinkedIn", done: true, status: "done", type: "reach" },
          { text: "Volunteer at the local care home", done: false, status: "not_started", type: "do" },
        ],
      },
    };
    await renderOk(input);
  });

  it("renders a partial journey (some sections filled)", async () => {
    const input: MapperInput = {
      ...baseInput(),
      primaryGoalTitle: "Software Engineer",
      journeySummary: {
        strengths: ["logical thinking"],
        educationContext: {
          stage: "university",
          schoolName: null,
          currentSubjects: ["Computer Science"],
        },
      },
      activeGoalJourneySummary: {
        momentumActions: [
          { text: "Build a small portfolio project", done: false, status: "in_progress" },
        ],
      },
    };
    await renderOk(input);
  });

  it("handles sparse content and weird input (special chars, nulls, whitespace)", async () => {
    const input: MapperInput = {
      ...baseInput(),
      primaryGoalTitle: "",
      journeySummary: {
        strengths: ["  ", "", "valid-strength", null],
        discoverReflections: {
          motivations: "not-an-array",
          roleModels: "Someone who said: \"Don't give up.\" — ≤100 chars — émojis 👩‍⚕️ allowed",
        },
        alignedActions: [{ type: null, title: "" }, { title: "Valid action" }],
        educationContext: {},
      } as unknown as Record<string, unknown>,
      activeGoalJourneySummary: {
        momentumActions: [null, { text: "" }, { text: "Real action" }, "not-an-object"],
      } as unknown as Record<string, unknown>,
    };
    const { vm } = await renderOk(input);
    // Whitespace + nulls filtered out; only the "valid" items survive.
    expect(vm.discover.strengths).toEqual(["valid-strength"]);
    expect(vm.clarity.momentum.map((m) => m.text)).toEqual(["Real action"]);
    expect(vm.clarity.alignedActions).toEqual([{ type: "action", title: "Valid action" }]);
  });

  it("populates Understand + Roadmap from career catalog when user notes are sparse (Pharmacist)", async () => {
    // This is the scenario that produced the thin report: the user has
    // picked a career and a momentum action but hasn't written any
    // Discover / Understand notes and has no generatedTimeline.
    // The report must still be substantive — everything below should
    // surface because we fetched the catalog server-side.
    const input: MapperInput = {
      ...baseInput(),
      primaryGoalTitle: "Pharmacist",
      userAge: 16,
      journeySummary: {
        educationContext: {
          stage: "school",
          expectedCompletion: "2032",
        },
      },
      activeGoalJourneySummary: {
        momentumActions: [{ text: "Talk to a local pharmacist", done: false, status: "not_started", type: "reach" }],
      },
      discoverPreferences: {
        interests: ["caring-for-people", "working-with-numbers"],
        strengths: ["detail-oriented", "reliable"],
        motivations: ["financial-stability", "make-difference"],
        workPreferences: {
          peoplePreference: "with-people",
          workType: ["practical", "technical"],
          pace: "steady",
          environment: "indoor",
        },
        clarityLevel: "few-ideas",
      },
      career: {
        id: "pharmacist",
        title: "Pharmacist",
        description: "Dispense medications, advise patients on drug use, and ensure medication safety.",
        avgSalary: "670,000 - 915,000 kr/year",
        educationPath: "Master's in Pharmacy (5 years)",
        keySkills: ["pharmaceutical knowledge", "attention to detail", "communication"],
        dailyTasks: ["Dispense prescriptions", "Advise patients", "Check drug interactions"],
        growthOutlook: "stable",
        sector: "private",
      },
      careerDetails: {
        whatYouActuallyDo: [
          "Dispense prescription medications accurately",
          "Advise patients on medication use and side effects",
        ],
        whoThisIsGoodFor: [
          "Detail-oriented, careful individuals",
          "People who enjoy helping and advising others",
        ],
        topSkills: ["Pharmaceutical knowledge", "Attention to detail", "Communication"],
        entryPaths: ["Master's in Pharmacy (5 years)"],
        realityCheck:
          "The work is largely routine dispensing, not research. You'll spend a lot of time on customer service and admin.",
        typicalDay: {
          morning: ["Open pharmacy", "Process overnight prescriptions"],
          midday: ["Dispense", "Check drug interactions"],
          afternoon: ["Patient medication reviews", "Coordinate with doctors"],
          tools: ["Pharmacy dispensing systems"],
          environment: "Pharmacy, regular business hours",
        },
      },
      careerRequirements: {
        schoolSubjects: {
          required: ["Chemistry", "Biology", "Mathematics", "Norwegian", "English"],
          recommended: ["Physics", "Health Studies"],
          minimumGrade: "Top grades in science subjects",
        },
        universityPath: {
          programme: "Master in Pharmacy",
          duration: "5 years",
          type: "master",
          examples: ["UiO", "UiT", "Uppsala University"],
          applicationRoute: "Samordna opptak (Norway), antagning.se (Sweden)",
          competitiveness: "Moderately competitive.",
        },
        entryLevelRequirements: {
          title: "Pharmacist Intern",
          description: "Practical training in a pharmacy under supervision.",
          whatYouNeed: "Completed Master's in Pharmacy.",
        },
        qualifiesFor: {
          immediate: "Pharmacist",
          withExperience: "Clinical pharmacist or pharmacy manager",
          seniorPath: "Director of pharmacy or pharmaceutical consultant",
        },
        specialisationNote: null,
      },
      certificationPath: {
        summary: "Professional certifications",
        certifications: [
          {
            name: "Authorisation from Helsedirektoratet",
            provider: "Helsedirektoratet",
            duration: "—",
            cost: "Free",
            url: "https://helsedirektoratet.no",
            recognised: "Norway",
          },
        ],
      },
      programmes: [
        {
          institution: "University of Oslo",
          city: "Oslo",
          country: "NO",
          programme: "Farmasi (master)",
          englishName: "Master in Pharmacy",
          url: "https://uio.no/pharmacy",
          type: "master",
          duration: "5 years",
          languageOfInstruction: "Norwegian",
          tuitionFee: "free",
        },
        {
          institution: "UiT Arctic University of Norway",
          city: "Tromsø",
          country: "NO",
          programme: "Master i farmasi",
          englishName: "Master in Pharmacy",
          url: "https://uit.no/pharmacy",
          type: "master",
          duration: "5 years",
          languageOfInstruction: "Norwegian",
          tuitionFee: "free",
        },
      ],
      pensionNote: "Private-sector pension (mandatory 2%+ employer contribution, varies by company)",
    };

    const { vm } = await renderOk(input);

    // Discover is populated entirely from the Radar — no free-text notes.
    expect(vm.discover.radar?.summaryLines.length).toBeGreaterThan(0);
    expect(vm.discover.motivations.length).toBeGreaterThan(0);
    expect(vm.discover.strengths.length).toBeGreaterThan(0);

    // Understand pulls the catalog facts.
    expect(vm.understand.facts?.avgSalary).toContain("670,000");
    expect(vm.understand.insights?.topSkills.length).toBeGreaterThan(0);
    expect(vm.understand.requirements?.universityPath.programme).toBe("Master in Pharmacy");
    expect(vm.understand.programmes.length).toBe(2);
    expect(vm.understand.certifications?.certifications.length).toBe(1);

    // Roadmap is generated as a fallback from requirements + user age.
    expect(vm.roadmap.isFallback).toBe(true);
    expect(vm.roadmap.items.length).toBeGreaterThanOrEqual(4);

    // Executive summary narrates the role (not a generic filler).
    expect(vm.executive.headline).toContain("Pharmacist");
    const execText = vm.executive.paragraphs.join(" ");
    expect(execText).toContain("670,000");
    expect(execText).toContain("Dispense medications");
    // "stable demand" should not appear twice — the adjective form
    // avoids the duplicated phrasing.
    expect(execText.toLowerCase()).not.toContain("stable demand");

    // Routes: pharmacist isn't in programmes data, so we fall back.
    // The employer role must have been corrected away from "Junior Doctor".
    for (const r of vm.routes) {
      expect(r.employer.role.toLowerCase()).not.toContain("doctor");
      // Labels should NOT be generic "Route A / Route B".
      expect(/^Route [AB]$/.test(r.label)).toBe(false);
    }
  });

  it("produces a sensible view model without a primary goal", async () => {
    const { vm } = await renderOk({
      ...baseInput(),
      primaryGoalTitle: null,
    });
    expect(vm.cover.careerTitle).toBeNull();
    expect(vm.routes).toEqual([]);
    expect(vm.executive.paragraphs.length).toBeGreaterThan(0);
    expect(vm.nextSteps.some((s) => s.priority === "foundational")).toBe(true);
  });
});
