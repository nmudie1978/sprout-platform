import { describe, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { writeFileSync, mkdirSync } from "fs";
import { buildViewModel, type MapperInput } from "../mapper";
import { JourneyReportDocument } from "../Document";

/**
 * Physical PDF dump — only runs when DUMP_PDF_PREVIEWS=1.
 * Writes sample PDFs to /tmp/pdf-preview for visual inspection of
 * the editorial redesign against multiple content shapes.
 */
const shouldDump = process.env.DUMP_PDF_PREVIEWS === "1";

const base = (): MapperInput => ({
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

describe.skipIf(!shouldDump)("PDF preview dump", () => {
  it("dumps scenarios to /tmp/pdf-preview", async () => {
    mkdirSync("/tmp/pdf-preview", { recursive: true });

    const scenarios: Array<[string, MapperInput]> = [
      ["01-empty", base()],
      [
        "02-doctor-full",
        {
          ...base(),
          primaryGoalTitle: "Doctor",
          userAge: 17,
          journeySummary: {
            strengths: ["empathy", "problem-solving", "resilience"],
            roleRealityNotes: [
              "Long training pipeline — 6 years medicine, 1.5 years internship, then 3–6 years in specialty.",
              "Shift work and on-call duty are a real part of the lifestyle; the first few years especially.",
              "Emotional labour is underrated — the support systems you build matter.",
            ],
            industryInsightNotes: [
              "Norway has robust public healthcare and high demand for specialists.",
              "Interdisciplinary work is becoming more common year by year.",
            ],
            closingReflections: [
              "I started this journey uncertain. I still feel uncertain — but the shape of the uncertainty has changed.",
              "The timeline doesn't feel as impossible as it did six weeks ago.",
            ],
          },
        },
      ],
      [
        "03-teacher-short",
        {
          ...base(),
          primaryGoalTitle: "Secondary School Teacher",
          userAge: 16,
        },
      ],
    ];

    for (const [name, input] of scenarios) {
      const vm = buildViewModel(input);
      const buf = await renderToBuffer(<JourneyReportDocument vm={vm} />);
      writeFileSync(`/tmp/pdf-preview/${name}.pdf`, buf);
      console.log(`Wrote /tmp/pdf-preview/${name}.pdf — ${buf.length} bytes`);
    }
  }, 30_000);
});
