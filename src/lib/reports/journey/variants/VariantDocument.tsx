import React from "react";
import { Document, Font } from "@react-pdf/renderer";
import path from "path";
import type { JourneyReportViewModel } from "../types";
import type { Variant } from "./variants";
import {
  ClosingPage,
  NextStepsPage,
  RoadmapPages,
  RoutesPage,
  TocPage,
  UnderstandPage,
  UnderstandPathPage,
  type TocEntry,
} from "../pages";
import { palette as basePalette } from "../theme";
import { VariantCover } from "./VariantCover";

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

/**
 * Apply variant palette to the mutable base palette at render time.
 * @react-pdf freezes styles when the document is created, so we mutate
 * the shared palette object before rendering each variant, then restore
 * it in a finally block. This is cheap and scoped — no module-level
 * state leaks between renders because we always snapshot + restore.
 */
function withVariantPalette<T>(variant: Variant, fn: () => T): T {
  // Snapshot fields we'll override.
  const snapshot: Record<string, string> = {};
  const overrides: Record<string, string> = {
    ink: variant.palette.ink,
    body: variant.palette.body,
    muted: variant.palette.muted,
    subtle: variant.palette.subtle,
    faint: variant.palette.faint,
    hairline: variant.palette.hairline,
    hairlineSoft: variant.palette.hairlineSoft,
    divider: variant.palette.divider,
    bg: variant.palette.pageBg,
    surface: variant.palette.surface,
    surfaceAlt: variant.palette.surfaceAlt,
    surfaceDeep: variant.palette.surfaceDeep,
    accent: variant.palette.accent,
    accentSoft: variant.palette.accentSoft,
  };

  const mut = basePalette as unknown as Record<string, string>;
  for (const key of Object.keys(overrides)) {
    snapshot[key] = mut[key];
    mut[key] = overrides[key];
  }
  // Cover sub-object
  const coverMut = (basePalette.cover as unknown) as Record<string, string>;
  const coverSnapshot = { ...coverMut };
  coverMut.bg = variant.palette.coverBg;
  coverMut.accent = variant.palette.coverAccent;
  coverMut.text = variant.palette.coverText;
  coverMut.muted = variant.palette.coverMuted;
  coverMut.rule = variant.palette.coverRule;

  try {
    return fn();
  } finally {
    for (const key of Object.keys(snapshot)) mut[key] = snapshot[key];
    for (const key of Object.keys(coverSnapshot)) coverMut[key] = coverSnapshot[key];
  }
}

const ROADMAP_SINGLE_PAGE_CAP = 9999;

function hasPathContent(vm: JourneyReportViewModel): boolean {
  const req = vm.understand.requirements;
  const hasRequirements = Boolean(
    req &&
      (req.subjects.required.length > 0 ||
        req.subjects.recommended.length > 0 ||
        req.universityPath?.programme ||
        req.entryLevel?.title ||
        req.qualifiesFor?.immediate ||
        req.qualifiesFor?.seniorPath),
  );
  const hasProgrammes = vm.understand.programmes.length > 0;
  const hasCertifications = Boolean(
    vm.understand.certifications &&
      vm.understand.certifications.certifications.length > 0,
  );
  return (
    hasRequirements ||
    hasProgrammes ||
    hasCertifications ||
    Boolean(vm.understand.facts?.pensionNote) ||
    Boolean(vm.understand.actionPlan)
  );
}

function planLayout(vm: JourneyReportViewModel) {
  const tocPage = 1;
  const understandRole = 2;
  const understandPathShown = hasPathContent(vm);
  const understandPath = understandPathShown ? 3 : null;
  const roadmapStart = understandPathShown ? 4 : 3;
  const roadmapPageCount = 1;

  let cursor = roadmapStart + roadmapPageCount;
  const routes: number | null = vm.routes.length > 0 ? cursor : null;
  if (routes !== null) cursor += 1;
  const nextSteps = cursor++;
  const closing = cursor++;
  const total = closing;

  const career = vm.cover.careerTitle;
  const toc: TocEntry[] = [];
  let n = 1;
  toc.push({
    n: n++,
    title: career ? `Career Summary for: ${career}` : "Career Summary",
    pageNumber: understandRole,
  });
  if (understandPath !== null) {
    toc.push({
      n: n++,
      title: career ? `How you qualify for ${career}` : "How you qualify for the role",
      pageNumber: understandPath,
    });
  }
  toc.push({
    n: n++,
    title: career ? `Your personal roadmap to ${career}` : "Your personal roadmap",
    pageNumber: roadmapStart,
  });
  if (routes !== null) {
    toc.push({ n: n++, title: "More than one way in", pageNumber: routes });
  }
  toc.push({ n: n++, title: "Your next six moves", pageNumber: nextSteps });
  toc.push({ n: n++, title: "A journey, not a verdict", pageNumber: closing });

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

export function VariantDocument({
  vm,
  variant,
}: {
  vm: JourneyReportViewModel;
  variant: Variant;
}) {
  registerFontsOnce();
  return withVariantPalette(variant, () => {
    const { toc, pages, total } = planLayout(vm);
    return (
      <Document
        title={`My Journey Report — ${variant.name}`}
        author="Endeavrly"
        subject="A personal career exploration summary"
        creator="Endeavrly"
        producer="Endeavrly"
      >
        <VariantCover variant={variant} vm={vm} />
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
  });
}
