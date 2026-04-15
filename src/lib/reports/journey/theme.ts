import { StyleSheet } from "@react-pdf/renderer";

/**
 * Design tokens for the Journey Report PDF.
 *
 * The palette favours soft neutrals + a single teal accent so the document
 * reads as an editorial report rather than a dashboard. Deep ink + body +
 * muted + subtle give us four type weights of emphasis before we need
 * colour. Stage accents are only used inside the roadmap section.
 */

export const palette = {
  ink: "#0B1220",
  body: "#1F2937",
  muted: "#475569",
  subtle: "#64748B",
  faint: "#94A3B8",
  hairline: "#E2E8F0",
  hairlineSoft: "#EEF2F7",

  // Warm off-white page base — barely perceptible tint, still reads as
  // "white" when printed but gives a premium editorial feel on screen.
  bg: "#FBFAF6",
  // Insight cards stay pure white so they pop against the warm bg —
  // the small contrast delta is what makes the layout feel layered.
  surface: "#FFFFFF",
  surfaceAlt: "#F4F2ED",
  surfaceDeep: "#0B1220",

  accent: "#0F766E",
  accentSoft: "#CCFBF1",
  accentInk: "#0B5E58",

  emerald: "#047857",
  emeraldSoft: "#D1FAE5",
  amber: "#B45309",
  amberSoft: "#FEF3C7",
  violet: "#6D28D9",
  violetSoft: "#EDE9FE",
  blue: "#1D4ED8",
  blueSoft: "#DBEAFE",
  rose: "#BE123C",
  roseSoft: "#FFE4E6",

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
  foundation: { bg: "#ECFDF5", ink: "#047857", accent: "#10B981" },
  education: { bg: "#DBEAFE", ink: "#1D4ED8", accent: "#3B82F6" },
  experience: { bg: "#FFF7ED", ink: "#C2410C", accent: "#F97316" },
  career: { bg: "#FEF3C7", ink: "#B45309", accent: "#F59E0B" },
} as const;

/** A4 page geometry. 44pt horizontal + 48pt vertical margins give a calm
 *  editorial feel without looking overly spacious on A4. */
export const page = {
  paddingTop: 48,
  paddingBottom: 56,
  paddingHorizontal: 44,
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

/** Shared, flat stylesheet. Keep page-specific styles inline — this holds
 *  only the primitives that are reused across every page. */
export const styles = StyleSheet.create({
  page: {
    backgroundColor: palette.bg,
    paddingTop: page.paddingTop,
    paddingBottom: page.paddingBottom,
    paddingHorizontal: page.paddingHorizontal,
    fontFamily: type.body.family,
    fontSize: 9.5,
    lineHeight: 1.55,
    color: palette.body,
  },

  // Type scale
  displayXL: {
    fontFamily: type.display.family,
    fontWeight: type.display.weight,
    fontSize: 34,
    lineHeight: 1.1,
    color: palette.ink,
    letterSpacing: -0.4,
  },
  displayL: {
    fontFamily: type.display.family,
    fontWeight: type.display.weight,
    fontSize: 24,
    lineHeight: 1.15,
    color: palette.ink,
    letterSpacing: -0.2,
  },
  h1: {
    fontFamily: type.heading.family,
    fontWeight: type.heading.weight,
    fontSize: 18,
    lineHeight: 1.2,
    color: palette.ink,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  h2: {
    fontFamily: type.heading.family,
    fontWeight: type.heading.weight,
    fontSize: 13,
    lineHeight: 1.25,
    color: palette.ink,
    marginBottom: 4,
  },
  h3: {
    fontFamily: type.subheading.family,
    fontWeight: type.subheading.weight,
    fontSize: 10.5,
    lineHeight: 1.3,
    color: palette.ink,
    marginBottom: 4,
  },
  lead: {
    fontSize: 10.5,
    color: palette.muted,
    lineHeight: 1.6,
    marginBottom: 18,
  },
  body: {
    fontSize: 9.5,
    color: palette.body,
    lineHeight: 1.6,
  },
  bodyMuted: {
    fontSize: 9,
    color: palette.muted,
    lineHeight: 1.55,
  },
  caption: {
    fontSize: 8,
    color: palette.subtle,
    lineHeight: 1.5,
  },
  eyebrow: {
    fontSize: 7.5,
    fontFamily: type.bodyStrong.family,
    fontWeight: type.bodyStrong.weight,
    color: palette.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  label: {
    fontSize: 7,
    fontFamily: type.bodyStrong.family,
    fontWeight: type.bodyStrong.weight,
    color: palette.subtle,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  // Layout
  row: { flexDirection: "row", gap: 14 },
  col: { flex: 1 },

  // Footer / page number bar
  pageFooter: {
    position: "absolute",
    bottom: 26,
    left: page.paddingHorizontal,
    right: page.paddingHorizontal,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageFooterText: {
    fontSize: 7.5,
    color: palette.faint,
    letterSpacing: 0.6,
    fontFamily: type.body.family,
  },

  // Section divider — ultra-thin rule with breathing room.
  rule: {
    height: 0.75,
    backgroundColor: palette.divider,
    marginVertical: 18,
  },
  ruleSoft: {
    height: 0.5,
    backgroundColor: palette.hairlineSoft,
    marginVertical: 10,
  },

  // Spacers
  sp4: { height: 4 },
  sp8: { height: 8 },
  sp12: { height: 12 },
  sp16: { height: 16 },
  sp24: { height: 24 },
  sp32: { height: 32 },
});
