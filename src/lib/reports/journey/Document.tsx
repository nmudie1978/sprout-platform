import React from "react";
import { Document, Font } from "@react-pdf/renderer";
import path from "path";
import type { JourneyReportViewModel } from "./types";
import {
  ClosingPage,
  CoverPage,
  NextStepsPage,
  RoadmapPages,
  RoutesPage,
  TocPage,
  UnderstandPage,
  UnderstandPathPage,
  type TocEntry,
} from "./pages";

let fontsRegistered = false;

function registerFontsOnce() {
  if (fontsRegistered) return;
  fontsRegistered = true;
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
  Font.registerHyphenationCallback((word) => [word]);
}

// Roadmap is rendered as a single page — react-pdf auto-breaks if the
// content overflows. The user-facing goal is "Your path" on one page.
const ROADMAP_SINGLE_PAGE_CAP = 9999;

function hasPathContent(vm: JourneyReportViewModel): boolean {
  return Boolean(
    vm.understand.requirements ||
      vm.understand.programmes.length > 0 ||
      (vm.understand.certifications && vm.understand.certifications.certifications.length > 0) ||
      vm.understand.facts?.pensionNote ||
      vm.understand.actionPlan,
  );
}

/**
 * Plan the full page layout up-front so the TOC numbers are accurate and
 * every page knows its /total. The order is:
 *
 *   Cover (unnumbered)
 *   1  Contents
 *   2  Career Summary (role detail)
 *   3  Career Summary — path (conditional)
 *   4..  Roadmap (one page — auto-breaks on overflow)
 *   N  Alternative routes (conditional)
 *   N+1 Recommended next steps
 *   N+2 Closing
 *
 * The Executive Summary, Discover ("Who you are"), and Clarity
 * ("Momentum & reflections") sections were dropped. The cover
 * communicates "what this is"; Career Summary + roadmap + next steps
 * carry the actionable content.
 */
function planLayout(vm: JourneyReportViewModel) {
  const tocPage = 1;
  const understandRole = 2;
  const understandPathShown = hasPathContent(vm);
  const understandPath = understandPathShown ? 3 : null;
  const roadmapStart = understandPathShown ? 4 : 3;
  // Single-page roadmap — react-pdf handles natural overflow if the
  // content is longer than one page.
  const roadmapPageCount = 1;

  let cursor = roadmapStart + roadmapPageCount;
  const routes: number | null = vm.routes.length > 0 ? cursor : null;
  if (routes !== null) cursor += 1;
  const nextSteps = cursor++;
  const closing = cursor++;
  const total = closing;

  const toc: TocEntry[] = [];
  let n = 1;
  toc.push({
    n: n++,
    title: vm.cover.careerTitle
      ? `Career Summary — ${vm.cover.careerTitle}`
      : "Career Summary",
    pageNumber: understandRole,
  });
  if (understandPath !== null) {
    toc.push({ n: n++, title: "The path", pageNumber: understandPath });
  }
  toc.push({ n: n++, title: "Your path", pageNumber: roadmapStart });
  if (routes !== null) {
    toc.push({ n: n++, title: "Alternative routes", pageNumber: routes });
  }
  toc.push({ n: n++, title: "Recommended next steps", pageNumber: nextSteps });
  toc.push({ n: n++, title: "Closing", pageNumber: closing });

  return {
    toc,
    pages: {
      tocPage,
      understandRole,
      understandPath,
      roadmapStart,
      roadmapPageCount,
      routes,
      nextSteps,
      closing,
    },
    total,
  };
}

export function JourneyReportDocument({ vm }: { vm: JourneyReportViewModel }) {
  registerFontsOnce();
  const { toc, pages, total } = planLayout(vm);

  return (
    <Document
      title={`My Journey Report${vm.cover.careerTitle ? ` — ${vm.cover.careerTitle}` : ""}`}
      author="Endeavrly"
      subject="A personal career exploration summary"
      creator="Endeavrly"
      producer="Endeavrly"
    >
      <CoverPage vm={vm} />
      <TocPage entries={toc} pageNumber={pages.tocPage} totalPages={total} />
      <UnderstandPage
        data={vm.understand}
        career={vm.cover.careerTitle}
        pageNumber={pages.understandRole}
        totalPages={total}
      />
      {pages.understandPath !== null && (
        <UnderstandPathPage
          data={vm.understand}
          career={vm.cover.careerTitle}
          pageNumber={pages.understandPath}
          totalPages={total}
        />
      )}
      {RoadmapPages({
        data: vm.roadmap,
        education: vm.education,
        startingPageNumber: pages.roadmapStart,
        totalPages: total,
        itemsPerPage: ROADMAP_SINGLE_PAGE_CAP,
      })}
      {pages.routes !== null && (
        <RoutesPage
          routes={vm.routes}
          career={vm.cover.careerTitle}
          pageNumber={pages.routes}
          totalPages={total}
        />
      )}
      <NextStepsPage
        steps={vm.nextSteps}
        pageNumber={pages.nextSteps}
        totalPages={total}
      />
      <ClosingPage vm={vm} pageNumber={pages.closing} totalPages={total} />
    </Document>
  );
}
