import React from "react";
import { describe, it, expect } from "vitest";
import path from "path";
import { Document, Font, renderToBuffer } from "@react-pdf/renderer";
import { RoadmapPages } from "../pages";
import type { RoadmapSection } from "../types";

// Register fonts exactly as Document.tsx does, so the roadmap page renders
// through the real font path.
function registerFonts() {
  const fontsDir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "Poppins",
    fonts: [
      { src: path.join(fontsDir, "Poppins-Medium.ttf"), fontWeight: 500 },
      { src: path.join(fontsDir, "Poppins-SemiBold.ttf"), fontWeight: 600 },
    ],
  });
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(fontsDir, "Inter-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontsDir, "Inter-Medium.ttf"), fontWeight: 500 },
    ],
  });
  Font.registerHyphenationCallback((w) => [w]);
}

function section(n: number): RoadmapSection {
  const all = [
    { stage: "foundation", title: "Build a portfolio of small coding projects", startAge: 16, isMilestone: false },
    { stage: "education", title: "Complete a bachelor's in computer science", startAge: 18, endAge: 21, isMilestone: false },
    { stage: "certification", title: "Earn a recognised cloud certification", startAge: 21, isMilestone: true },
    { stage: "experience", title: "Land a junior software developer role", startAge: 22, isMilestone: true },
    { stage: "experience", title: "Grow into a mid-level engineer", startAge: 24, endAge: 27, isMilestone: false },
    { stage: "career", title: "Reach senior software engineer", startAge: 28, isMilestone: true },
    { stage: "experience", title: "Lead a small delivery team", startAge: 30, endAge: 32, isMilestone: false },
    { stage: "career", title: "Move into a principal engineer role", startAge: 33, isMilestone: true },
  ] as const;
  return {
    career: "Software Engineer",
    items: all.slice(0, n).map((s) => ({ ...s })),
    schoolTrack: [],
    isFallback: false,
    birthYear: 2008,
  };
}

describe("roadmap winding-road render", () => {
  it("renders the roadmap as a single page across step counts", async () => {
    registerFonts();
    for (const n of [1, 3, 6, 8]) {
      const doc = (
        <Document>
          {RoadmapPages({
            data: section(n),
            education: {} as never,
            startingPageNumber: 1,
            totalPages: 1,
            itemsPerPage: 9999,
          })}
        </Document>
      );
      const buf = await renderToBuffer(doc);
      expect(buf.length).toBeGreaterThan(2000);
      // One PageFrame → exactly one <Page> object in the PDF.
      const pageObjects = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
      expect(pageObjects).toBe(1);
    }
  });
});
