import React from "react";
import { Document, Font, renderToBuffer } from "@react-pdf/renderer";
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
import { motifState, palette as basePalette, styles as baseStyles } from "../theme";
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
 * Style slots in `baseStyles` whose colour came from the base palette
 * at module-load time. When we swap palettes at render time, we have
 * to mutate these properties directly — `StyleSheet.create` resolves
 * references into primitives, so updating `palette.ink` alone does not
 * retroactively update `styles.displayL.color`.
 *
 * Keep this list in sync with any new style slot in theme.ts that
 * pulls a color from `palette.*`.
 */
type StyleColorPatch = {
  backgroundColor?: keyof typeof basePalette;
  color?: keyof typeof basePalette;
  borderBottomColor?: keyof typeof basePalette;
  borderTopColor?: keyof typeof basePalette;
};
const STYLE_COLOR_MAP: Record<string, StyleColorPatch> = {
  page: { backgroundColor: "bg", color: "body" },
  displayXL: { color: "ink" },
  displayL: { color: "ink" },
  h1: { color: "ink" },
  h2: { color: "ink" },
  h3: { color: "ink" },
  lead: { color: "muted" },
  body: { color: "body" },
  bodyLg: { color: "body" },
  bodyMuted: { color: "muted" },
  caption: { color: "subtle" },
  overline: { color: "accent" },
  label: { color: "subtle" },
  displayNum: { color: "ink" },
  pageHeaderText: { color: "faint" },
  pageFooterText: { color: "faint" },
  rule: { backgroundColor: "divider" },
  ruleSoft: { backgroundColor: "hairlineSoft" },
  ruleStrong: { backgroundColor: "ink" },
};

/**
 * Apply variant palette (and matching StyleSheet colour patches) to the
 * shared theme objects. Returns a restore closure that undoes every
 * mutation — callers MUST hold onto it and run it in a `finally` block
 * after the async render completes, not synchronously after building
 * the JSX.
 *
 * Previous iteration used a synchronous try/finally around `fn()` that
 * returned the JSX tree, but @react-pdf doesn't traverse the tree
 * until `renderToBuffer` actually runs — so the restore fired before
 * any page was drawn, leaving interior pages with the base palette.
 */
function applyVariantPalette(variant: Variant): () => void {
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

  const coverMut = (basePalette.cover as unknown) as Record<string, string>;
  const coverSnapshot = { ...coverMut };
  coverMut.bg = variant.palette.coverBg;
  coverMut.accent = variant.palette.coverAccent;
  coverMut.text = variant.palette.coverText;
  coverMut.muted = variant.palette.coverMuted;
  coverMut.rule = variant.palette.coverRule;

  // Motif state
  const motifSnapshot = { ...motifState };
  motifState.pageMotif =
    variant.pageMotif === "constellation" ? "constellation" : "none";
  motifState.footerBrand = variant.footerBrand ?? "My Journey Report";

  // StyleSheet colour patches — these are the slots that were
  // resolved at module-load and need to be re-pointed at the new
  // palette values.
  const styleSnapshot: Array<{ slot: string; props: StyleColorPatch }> = [];
  const stylesAny = baseStyles as unknown as Record<string, Record<string, unknown>>;
  for (const [slot, patch] of Object.entries(STYLE_COLOR_MAP)) {
    const target = stylesAny[slot];
    if (!target) continue;
    const prior: StyleColorPatch = {};
    for (const prop of Object.keys(patch) as Array<keyof StyleColorPatch>) {
      prior[prop] = target[prop] as typeof prior[typeof prop];
      const paletteKey = patch[prop];
      if (paletteKey) {
        target[prop] = (basePalette as unknown as Record<string, string>)[paletteKey];
      }
    }
    styleSnapshot.push({ slot, props: prior });
  }

  return () => {
    for (const key of Object.keys(snapshot)) mut[key] = snapshot[key];
    for (const key of Object.keys(coverSnapshot)) coverMut[key] = coverSnapshot[key];
    motifState.pageMotif = motifSnapshot.pageMotif;
    motifState.footerBrand = motifSnapshot.footerBrand;
    motifState.sectionAccentBar = motifSnapshot.sectionAccentBar;
    for (const entry of styleSnapshot) {
      const target = stylesAny[entry.slot];
      if (!target) continue;
      for (const prop of Object.keys(entry.props)) {
        target[prop] = entry.props[prop as keyof StyleColorPatch];
      }
    }
  };
}

/**
 * Render a variant-styled report to a PDF buffer. Wrap the async
 * renderToBuffer call so the palette mutation stays live through the
 * entire traversal. Callers must use this — rendering
 * `<VariantDocument>` directly with `renderToBuffer` will lose the
 * variant styling on interior pages.
 */
export async function renderVariantBuffer(
  vm: JourneyReportViewModel,
  variant: Variant,
): Promise<Buffer> {
  const restore = applyVariantPalette(variant);
  try {
    const buf = await renderToBuffer(<VariantDocument vm={vm} variant={variant} />);
    return buf as Buffer;
  } finally {
    restore();
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
}
