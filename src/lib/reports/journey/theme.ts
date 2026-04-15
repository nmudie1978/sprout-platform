import { StyleSheet } from "@react-pdf/renderer";

/**
 * Design tokens for the Journey Report PDF — editorial edition.
 *
 * Priorities:
 *   - Calm, ivory ground with ink + charcoal body; accent used sparingly.
 *   - Typographic hierarchy carries the design, not filled cards.
 *   - Labels use light tracking (not aggressive all-caps blocks).
 *   - Spacing scale is rhythmic: 4 → 8 → 12 → 18 → 24 → 32 → 48.
 *
 * If you find yourself reaching for `InsightCard` + tinted background to
 * separate content, reach for an `EditorialBlock` (title rule + body)
 * first. Cards are for moments that truly need emphasis.
 */

export const palette = {
  ink: "#0B1220",
  body: "#1F2937",
  muted: "#4B5563",
  subtle: "#64748B",
  faint: "#94A3B8",
  hairline: "#E2E8F0",
  hairlineSoft: "#EEF2F7",

  // Warm off-white page base — reads as white in print, adds subtle
  // warmth on screen. Matches the editorial-paper feel we want.
  bg: "#FBFAF6",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F2ED",
  surfaceDeep: "#0B1220",

  accent: "#0F766E",
  accentSoft: "#E6F4F1",
  accentInk: "#0B5E58",

  emerald: "#047857",
  emeraldSoft: "#E8F5EE",
  amber: "#B45309",
  amberSoft: "#FBF3E2",
  violet: "#6D28D9",
  violetSoft: "#EFEAFB",
  blue: "#1D4ED8",
  blueSoft: "#E6EEFB",
  rose: "#BE123C",
  roseSoft: "#FBEAEE",

  divider: "#E2E8F0",
  dividerSoft: "#F1F5F9",

  cover: {
    bg: "#0B1220",
    accent: "#14B8A6",
    text: "#F8FAFC",
    muted: "#94A3B8",
    rule: "#1E293B",
  },
} as const;

export const stageColors = {
  foundation: { bg: "#F0FAF5", ink: "#047857", accent: "#10B981" },
  education: { bg: "#EEF3FC", ink: "#1D4ED8", accent: "#3B82F6" },
  experience: { bg: "#FDF4EA", ink: "#C2410C", accent: "#F97316" },
  career: { bg: "#FBF3DD", ink: "#B45309", accent: "#F59E0B" },
} as const;

/** A4 geometry — 52pt horizontal / 54pt vertical margins. A touch more
 *  breathing room than before; content width ≈ 491pt (~69 characters
 *  at 10.5pt body), which is inside the comfortable reading band. */
export const page = {
  paddingTop: 56,
  paddingBottom: 62,
  paddingHorizontal: 52,
  width: 595.28,
  height: 841.89,
} as const;

export const type = {
  display: { family: "Poppins", weight: 600 as const },
  heading: { family: "Poppins", weight: 600 as const },
  subheading: { family: "Poppins", weight: 500 as const },
  body: { family: "Inter", weight: 400 as const },
  bodyStrong: { family: "Inter", weight: 500 as const },
} as const;

/** Shared stylesheet. Page-specific styling stays inline. */
export const styles = StyleSheet.create({
  page: {
    backgroundColor: palette.bg,
    paddingTop: page.paddingTop,
    paddingBottom: page.paddingBottom,
    paddingHorizontal: page.paddingHorizontal,
    fontFamily: type.body.family,
    fontSize: 10,
    lineHeight: 1.6,
    color: palette.body,
  },

  // ── Type scale ─────────────────────────────────────────────────────
  // Display sizes are used sparingly — cover + major section titles.
  // Body sizes pin text at 10pt with 1.6 leading for print readability.

  displayXL: {
    fontFamily: type.display.family,
    fontWeight: type.display.weight,
    fontSize: 42,
    lineHeight: 1.06,
    color: palette.ink,
    letterSpacing: -0.8,
  },
  displayL: {
    fontFamily: type.display.family,
    fontWeight: type.display.weight,
    fontSize: 26,
    lineHeight: 1.14,
    color: palette.ink,
    letterSpacing: -0.35,
  },
  h1: {
    fontFamily: type.heading.family,
    fontWeight: type.heading.weight,
    fontSize: 16,
    lineHeight: 1.22,
    color: palette.ink,
    letterSpacing: -0.1,
  },
  h2: {
    fontFamily: type.heading.family,
    fontWeight: type.heading.weight,
    fontSize: 12,
    lineHeight: 1.28,
    color: palette.ink,
  },
  h3: {
    fontFamily: type.subheading.family,
    fontWeight: type.subheading.weight,
    fontSize: 10.5,
    lineHeight: 1.32,
    color: palette.ink,
  },

  lead: {
    fontSize: 11,
    color: palette.muted,
    lineHeight: 1.62,
  },
  body: {
    fontSize: 10,
    color: palette.body,
    lineHeight: 1.6,
  },
  bodyLg: {
    fontSize: 10.5,
    color: palette.body,
    lineHeight: 1.62,
  },
  bodyMuted: {
    fontSize: 9.5,
    color: palette.muted,
    lineHeight: 1.55,
  },
  caption: {
    fontSize: 8.5,
    color: palette.subtle,
    lineHeight: 1.5,
  },

  // Overline — used sparingly as a small category marker above titles.
  // Kept at modest tracking (0.8) rather than the old heavy 1.5 so it
  // reads editorial, not web-app.
  overline: {
    fontSize: 7.5,
    fontFamily: type.bodyStrong.family,
    fontWeight: type.bodyStrong.weight,
    color: palette.accent,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  label: {
    fontSize: 7.5,
    fontFamily: type.bodyStrong.family,
    fontWeight: type.bodyStrong.weight,
    color: palette.subtle,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },

  // Display-number — used inside the stat strip so figures feel like
  // headline data, not body copy.
  displayNum: {
    fontFamily: type.display.family,
    fontWeight: type.display.weight,
    fontSize: 16,
    lineHeight: 1.1,
    color: palette.ink,
    letterSpacing: -0.2,
  },

  // ── Layout ─────────────────────────────────────────────────────────

  row: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },

  // Running head (top of page, under the margin) — brand on the left,
  // section label on the right. Appears on every content page via the
  // PageFrame primitive.
  pageHeader: {
    position: "absolute",
    top: 24,
    left: page.paddingHorizontal,
    right: page.paddingHorizontal,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageHeaderText: {
    fontSize: 7.5,
    fontFamily: type.bodyStrong.family,
    fontWeight: type.bodyStrong.weight,
    color: palette.faint,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  // Footer — brand / page number. Keep under 8pt; it should disappear
  // into the paper unless the reader looks for it.
  pageFooter: {
    position: "absolute",
    bottom: 28,
    left: page.paddingHorizontal,
    right: page.paddingHorizontal,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageFooterText: {
    fontSize: 7.5,
    color: palette.faint,
    letterSpacing: 0.5,
    fontFamily: type.body.family,
  },

  // Rule system — three weights for three levels of separation.
  rule: {
    height: 0.75,
    backgroundColor: palette.divider,
  },
  ruleSoft: {
    height: 0.5,
    backgroundColor: palette.hairlineSoft,
  },
  ruleStrong: {
    height: 1.25,
    backgroundColor: palette.ink,
  },

  // Spacers — rhythmic scale. Prefer using these over ad-hoc marginTop.
  sp4: { height: 4 },
  sp8: { height: 8 },
  sp12: { height: 12 },
  sp16: { height: 16 },
  sp20: { height: 20 },
  sp24: { height: 24 },
  sp32: { height: 32 },
  sp40: { height: 40 },
  sp48: { height: 48 },
});
