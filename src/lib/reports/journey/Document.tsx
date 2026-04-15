import React from "react";
import { Document, Font } from "@react-pdf/renderer";
import path from "path";
import type { JourneyReportViewModel } from "./types";
import {
  ClarityPage,
  ClosingPage,
  CoverPage,
  DiscoverPage,
  ExecutivePage,
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

const ITEMS_PER_ROADMAP_PAGE = 5;

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
 *   2  Executive summary
 *   3  Discover
 *   4  Understand — role
 *   5  Understand — path (conditional)
 *   6..  Roadmap (one or more)
 *   N  Alternative routes (conditional)
 *   N+1 Clarity
 *   N+2 Next steps
 *   N+3 Closing
 */
function planLayout(vm: JourneyReportViewModel) {
  const tocPage = 1;
  const executive = 2;
  const discover = 3;
  const understandRole = 4;
  const understandPathShown = hasPathContent(vm);
  const understandPath = understandPathShown ? 5 : null;
  const roadmapStart = understandPathShown ? 6 : 5;
  const roadmapPageCount = Math.max(
    1,
    Math.ceil(vm.roadmap.items.length / ITEMS_PER_ROADMAP_PAGE),
  );

  let cursor = roadmapStart + roadmapPageCount;
  const routes: number | null = vm.routes.length > 0 ? cursor : null;
  if (routes !== null) cursor += 1;
  const clarity = cursor++;
  const nextSteps = cursor++;
  const closing = cursor++;
  const total = closing;

  const toc: TocEntry[] = [];
  let n = 1;
  toc.push({ n: n++, title: "Executive Summary", pageNumber: executive });
  toc.push({ n: n++, title: "Discover — Who you are", pageNumber: discover });
  toc.push({
    n: n++,
    title: "Understand — Inside the role",
    pageNumber: understandRole,
  });
  if (understandPath !== null) {
    toc.push({ n: n++, title: "Understand — The path", pageNumber: understandPath });
  }
  toc.push({ n: n++, title: "Clarity — Your personal roadmap", pageNumber: roadmapStart });
  if (routes !== null) {
    toc.push({ n: n++, title: "Alternative routes", pageNumber: routes });
  }
  toc.push({ n: n++, title: "Momentum & reflections", pageNumber: clarity });
  toc.push({ n: n++, title: "Recommended next steps", pageNumber: nextSteps });
  toc.push({ n: n++, title: "Closing", pageNumber: closing });

  return {
    toc,
    pages: {
      tocPage,
      executive,
      discover,
      understandRole,
      understandPath,
      roadmapStart,
      roadmapPageCount,
      routes,
      clarity,
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
      <ExecutivePage
        data={vm.executive}
        pageNumber={pages.executive}
        totalPages={total}
      />
      <DiscoverPage
        data={vm.discover}
        pageNumber={pages.discover}
        totalPages={total}
      />
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
      })}
      {pages.routes !== null && (
        <RoutesPage
          routes={vm.routes}
          career={vm.cover.careerTitle}
          pageNumber={pages.routes}
          totalPages={total}
        />
      )}
      <ClarityPage
        data={vm.clarity}
        pageNumber={pages.clarity}
        totalPages={total}
      />
      <NextStepsPage
        steps={vm.nextSteps}
        pageNumber={pages.nextSteps}
        totalPages={total}
      />
      <ClosingPage vm={vm} pageNumber={pages.closing} totalPages={total} />
    </Document>
  );
}
