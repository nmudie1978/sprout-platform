/**
 * Ten visual-language variants for the Journey Report.
 *
 * Each variant is a palette + cover-treatment bundle. The internal
 * page structure stays identical across variants so the comparison
 * isolates design language, not content.
 *
 * Keep each variant self-contained: a full palette override (with the
 * same keys as the base theme), plus a small descriptor used by the
 * cover renderer to pick its treatment.
 */

export type CoverTreatment =
  | "dark-minimal" // solid dark panel, accent brand mark
  | "ivory-editorial" // light cream, big serif-weight title, thin rule
  | "gradient-dawn" // warm amber→rose gradient
  | "gradient-dusk" // indigo→rose dusk gradient
  | "mosaic-soft" // four soft tinted blocks in upper third
  | "grid-swiss" // architectural grid lines, modernist
  | "kraft-catalogue" // kraft-brown bg with cross-hatch
  | "navy-gold" // deep navy + warm gold accent
  | "sage-stone" // muted sage green, warm grey
  | "blob-watercolour" // soft watercolour blob shapes
  | "whitepaper" // navy→magenta radial gradient + constellation motif
  | "gradient-horizontal"; // left→right linear gradient, colors from palette

export interface VariantPalette {
  // Surface
  pageBg: string;
  surface: string;
  surfaceAlt: string;
  surfaceDeep: string;

  // Ink
  ink: string;
  body: string;
  muted: string;
  subtle: string;
  faint: string;
  hairline: string;
  hairlineSoft: string;
  divider: string;

  // Accent
  accent: string;
  accentSoft: string;

  // Cover
  coverBg: string;
  coverAccent: string;
  coverText: string;
  coverMuted: string;
  coverRule: string;

  // Optional — only used by the `gradient-horizontal` cover treatment.
  // Left-edge colour and right-edge colour of the cover gradient.
  coverGradientFrom?: string;
  coverGradientTo?: string;
}

export interface Variant {
  key: string;
  name: string;
  description: string;
  cover: CoverTreatment;
  palette: VariantPalette;
  /** Font-weight preference for display titles on the cover.
   *  Poppins 500 reads quieter and more editorial; 600 reads bolder. */
  coverTitleWeight: 500 | 600;
  /** If true, pages other than the cover get a faint decorative motif
   *  (grid, hairlines, dots). Most variants keep pages clean. */
  pageMotif?: "none" | "grid" | "dots" | "hairline-band" | "constellation";
  /** Label used in the footer of every page (replaces "My Journey Report").
   *  Set this when the variant reads as a formal document format — e.g.
   *  white paper, dossier. */
  footerBrand?: string;
}

export const VARIANTS: Variant[] = [
  // 1. Nordic Minimal — baseline calm editorial (what we ship today)
  {
    key: "01-nordic-minimal",
    name: "Nordic Minimal",
    description:
      "Ivory ground, deep ink, single teal accent. The shipping style — calm, restrained, editorial.",
    cover: "dark-minimal",
    coverTitleWeight: 600,
    palette: {
      pageBg: "#FBFAF6",
      surface: "#FFFFFF",
      surfaceAlt: "#F4F2ED",
      surfaceDeep: "#0B1220",
      ink: "#0B1220",
      body: "#1F2937",
      muted: "#4B5563",
      subtle: "#64748B",
      faint: "#94A3B8",
      hairline: "#E2E8F0",
      hairlineSoft: "#EEF2F7",
      divider: "#E2E8F0",
      accent: "#0F766E",
      accentSoft: "#E6F4F1",
      coverBg: "#0B1220",
      coverAccent: "#14B8A6",
      coverText: "#F8FAFC",
      coverMuted: "#94A3B8",
      coverRule: "#1E293B",
    },
  },

  // 2. Editorial Cream — warm paper, deep chocolate ink, thick rules
  {
    key: "02-editorial-cream",
    name: "Editorial Cream",
    description:
      "Cream paper with deep warm-brown ink. Thicker rules, heavier display type. Old-world editorial.",
    cover: "ivory-editorial",
    coverTitleWeight: 600,
    palette: {
      pageBg: "#F7F1E6",
      surface: "#FFFFFF",
      surfaceAlt: "#EEE7D5",
      surfaceDeep: "#2A1F15",
      ink: "#2A1F15",
      body: "#3B2F22",
      muted: "#6B5B48",
      subtle: "#8A7762",
      faint: "#B5A48C",
      hairline: "#D9CCB2",
      hairlineSoft: "#E8DEC7",
      divider: "#C9B998",
      accent: "#9A3412",
      accentSoft: "#F1E2D3",
      coverBg: "#F7F1E6",
      coverAccent: "#9A3412",
      coverText: "#2A1F15",
      coverMuted: "#8A7762",
      coverRule: "#C9B998",
    },
  },

  // 3. Midnight Premium — dark-cover, soft pastel internals
  {
    key: "03-midnight-premium",
    name: "Midnight Premium",
    description:
      "Deep midnight cover with a cool lavender accent. Bright airy internals with soft violet rules.",
    cover: "dark-minimal",
    coverTitleWeight: 500,
    palette: {
      pageBg: "#FAF9FC",
      surface: "#FFFFFF",
      surfaceAlt: "#F1EFF7",
      surfaceDeep: "#1A1033",
      ink: "#1A1033",
      body: "#2E2447",
      muted: "#55486F",
      subtle: "#7A6D96",
      faint: "#ADA3C4",
      hairline: "#E4DFEF",
      hairlineSoft: "#EEEAF5",
      divider: "#DDD4EC",
      accent: "#6D28D9",
      accentSoft: "#ECE6F9",
      coverBg: "#1A1033",
      coverAccent: "#A78BFA",
      coverText: "#F5F3FA",
      coverMuted: "#9F94C1",
      coverRule: "#2D1F50",
    },
  },

  // 4. Dawn Gradient — warm amber→rose cover, clean internals
  {
    key: "04-dawn-gradient",
    name: "Dawn Gradient",
    description:
      "A warm amber-to-rose sunrise gradient on the cover. Quiet neutral internals with a terracotta accent.",
    cover: "gradient-dawn",
    coverTitleWeight: 600,
    palette: {
      pageBg: "#FDFAF5",
      surface: "#FFFFFF",
      surfaceAlt: "#F7EEE3",
      surfaceDeep: "#3A1F0D",
      ink: "#1F1711",
      body: "#362A20",
      muted: "#65513F",
      subtle: "#8B7459",
      faint: "#BCA58A",
      hairline: "#E8D9C2",
      hairlineSoft: "#F1E7D4",
      divider: "#D9C5A4",
      accent: "#C2410C",
      accentSoft: "#FBE7D7",
      coverBg: "#F59E0B",
      coverAccent: "#FFFFFF",
      coverText: "#FFFFFF",
      coverMuted: "#FBE7D7",
      coverRule: "#B8571B",
    },
  },

  // 5. Dusk Gradient — indigo→rose evening gradient
  {
    key: "05-dusk-gradient",
    name: "Dusk Gradient",
    description:
      "A deep indigo-to-rose evening gradient on the cover. Cool neutral internals with a plum accent.",
    cover: "gradient-dusk",
    coverTitleWeight: 600,
    palette: {
      pageBg: "#FAF9FB",
      surface: "#FFFFFF",
      surfaceAlt: "#EFECF3",
      surfaceDeep: "#1E1535",
      ink: "#1E1535",
      body: "#322746",
      muted: "#5A4E6D",
      subtle: "#7F7291",
      faint: "#B0A4BE",
      hairline: "#E3DDEC",
      hairlineSoft: "#EEE8F3",
      divider: "#D6CCE0",
      accent: "#A21CAF",
      accentSoft: "#F5E0F7",
      coverBg: "#312E81",
      coverAccent: "#F472B6",
      coverText: "#FFFFFF",
      coverMuted: "#C4B5FD",
      coverRule: "#3B2D78",
    },
  },

  // 6. Soft Mosaic — four gentle tinted rectangles across upper third
  {
    key: "06-soft-mosaic",
    name: "Soft Mosaic",
    description:
      "The original four-block mosaic treatment, resurrected: tinted teal/violet/amber/blue shapes in the upper third of each page.",
    cover: "mosaic-soft",
    coverTitleWeight: 600,
    pageMotif: "hairline-band",
    palette: {
      pageBg: "#FBFAF6",
      surface: "#FFFFFF",
      surfaceAlt: "#F4F2ED",
      surfaceDeep: "#0F172A",
      ink: "#0F172A",
      body: "#1E293B",
      muted: "#475569",
      subtle: "#64748B",
      faint: "#94A3B8",
      hairline: "#DFE5EE",
      hairlineSoft: "#EDF1F7",
      divider: "#DFE5EE",
      accent: "#0E7490",
      accentSoft: "#DDF1F5",
      coverBg: "#0F172A",
      coverAccent: "#22D3EE",
      coverText: "#F8FAFC",
      coverMuted: "#94A3B8",
      coverRule: "#1E293B",
    },
  },

  // 7. Swiss Grid — modernist architectural grid + strong hierarchy
  {
    key: "07-swiss-grid",
    name: "Swiss Grid",
    description:
      "A subtle 12-column grid visible on every page — modernist, Swiss-design feel. Stark type hierarchy.",
    cover: "grid-swiss",
    coverTitleWeight: 600,
    pageMotif: "grid",
    palette: {
      pageBg: "#FFFFFF",
      surface: "#FFFFFF",
      surfaceAlt: "#F4F4F5",
      surfaceDeep: "#18181B",
      ink: "#09090B",
      body: "#27272A",
      muted: "#52525B",
      subtle: "#71717A",
      faint: "#A1A1AA",
      hairline: "#E4E4E7",
      hairlineSoft: "#F4F4F5",
      divider: "#D4D4D8",
      accent: "#DC2626",
      accentSoft: "#FEE2E2",
      coverBg: "#FFFFFF",
      coverAccent: "#DC2626",
      coverText: "#09090B",
      coverMuted: "#71717A",
      coverRule: "#D4D4D8",
    },
  },

  // 8. Kraft Catalogue — kraft-paper brown with cross-hatch, gallery feel
  {
    key: "08-kraft-catalogue",
    name: "Kraft Catalogue",
    description:
      "Kraft-paper brown ground with a soft cross-hatch cover motif. Gallery-catalogue / exhibition-brochure feel.",
    cover: "kraft-catalogue",
    coverTitleWeight: 500,
    palette: {
      pageBg: "#EFE4D2",
      surface: "#F8F1E0",
      surfaceAlt: "#E5D8C1",
      surfaceDeep: "#2D1D0F",
      ink: "#2D1D0F",
      body: "#3E2C1C",
      muted: "#6B5436",
      subtle: "#8A7454",
      faint: "#B5A078",
      hairline: "#D3BFA0",
      hairlineSoft: "#E0CEAF",
      divider: "#C7AF8A",
      accent: "#7C2D12",
      accentSoft: "#E9D6B9",
      coverBg: "#8C6239",
      coverAccent: "#FBF7E9",
      coverText: "#FBF7E9",
      coverMuted: "#DAC3A3",
      coverRule: "#6B4A2B",
    },
  },

  // 9. Navy & Gold — classic academic / premium consultancy
  {
    key: "09-navy-gold",
    name: "Navy & Gold",
    description:
      "Deep navy cover with a warm gold accent. Classic academic/premium-consultancy feel. Cool neutral internals.",
    cover: "navy-gold",
    coverTitleWeight: 600,
    palette: {
      pageBg: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceAlt: "#EEF2F7",
      surfaceDeep: "#0C1E3E",
      ink: "#0C1E3E",
      body: "#1E293B",
      muted: "#475569",
      subtle: "#64748B",
      faint: "#94A3B8",
      hairline: "#DBE2EC",
      hairlineSoft: "#E9EEF5",
      divider: "#C5D0DF",
      accent: "#B45309",
      accentSoft: "#FBF2DB",
      coverBg: "#0C1E3E",
      coverAccent: "#D4A017",
      coverText: "#F8FAFC",
      coverMuted: "#94A3B8",
      coverRule: "#1E3A5F",
    },
  },

  // 10. Sage & Stone — muted natural palette
  {
    key: "10-sage-stone",
    name: "Sage & Stone",
    description:
      "Muted sage green with warm grey stone neutrals. Calm, natural, botanical-monograph feel.",
    cover: "sage-stone",
    coverTitleWeight: 500,
    pageMotif: "dots",
    palette: {
      pageBg: "#F5F4EE",
      surface: "#FFFFFF",
      surfaceAlt: "#E8E8DF",
      surfaceDeep: "#1F2A1D",
      ink: "#1F2A1D",
      body: "#334033",
      muted: "#5E6B5C",
      subtle: "#7E8A7E",
      faint: "#AEB7AE",
      hairline: "#DAE0D6",
      hairlineSoft: "#E6ECE2",
      divider: "#C5CDC0",
      accent: "#4D7C5B",
      accentSoft: "#DEEAE1",
      coverBg: "#3D5A42",
      coverAccent: "#E6C560",
      coverText: "#F5F4EE",
      coverMuted: "#B4C0B0",
      coverRule: "#2E4634",
    },
  },

  // 11. Whitepaper — Visme-inspired navy→magenta cover, constellation motif,
  //     burgundy section titles on clean white interior pages. Reads like a
  //     formal executive brief.
  {
    key: "11-whitepaper",
    name: "Whitepaper",
    description:
      "Navy→magenta radial-gradient cover with a thin geometric title and a constellation motif. White interior pages with burgundy section titles and a 'WHITE PAPER' footer.",
    cover: "whitepaper",
    coverTitleWeight: 500,
    pageMotif: "constellation",
    footerBrand: "WHITE PAPER",
    palette: {
      pageBg: "#FFFFFF",
      surface: "#FFFFFF",
      surfaceAlt: "#FAF3F6",
      surfaceDeep: "#1B0F3A",
      // Burgundy ink — reads as a styled magenta without becoming a
      // scream. Section titles + sub-heads pick this up automatically.
      ink: "#A51A58",
      body: "#2A2433",
      muted: "#5B4E66",
      subtle: "#7C6E88",
      faint: "#B2A7BD",
      hairline: "#E6DDE6",
      hairlineSoft: "#F1EBF2",
      divider: "#D4C7D4",
      accent: "#B91B5A",
      accentSoft: "#FBE7EF",
      coverBg: "#1B0F3A",
      coverAccent: "#E11D74",
      coverText: "#F8FAFC",
      coverMuted: "#C4B5D6",
      coverRule: "#3A2765",
    },
  },

  // 12. Fresh Turboscent — pale yellow-green → deep teal horizontal
  //     gradient. Interior pages are cream with teal ink + subtle
  //     yellow-green tinted surfaces.
  {
    key: "12-fresh-turboscent",
    name: "Fresh Turboscent",
    description:
      "Pale yellow-green to deep teal horizontal gradient cover. Cream interior pages with deep teal ink and soft yellow-green surfaces.",
    cover: "gradient-horizontal",
    coverTitleWeight: 500,
    palette: {
      pageBg: "#FBFAF0",
      surface: "#FFFFFF",
      surfaceAlt: "#F1F4E3",
      surfaceDeep: "#0E3F45",
      ink: "#135058",
      body: "#1F2A30",
      muted: "#4B5B63",
      subtle: "#6E7D83",
      faint: "#A0ADAF",
      hairline: "#D8E2DE",
      hairlineSoft: "#E8EEEA",
      divider: "#BECCC5",
      accent: "#135058",
      accentSoft: "#E3EAE2",
      coverBg: "#F1F2B5",
      coverAccent: "#135058",
      coverText: "#0E3F45",
      coverMuted: "#3A6B73",
      coverRule: "#BFC790",
      coverGradientFrom: "#F1F2B5",
      coverGradientTo: "#135058",
    },
  },

  // 13. Vine — emerald → near-black horizontal gradient. Interior pages
  //     are crisp white with deep-emerald ink and a vibrant accent pop.
  {
    key: "13-vine",
    name: "Vine",
    description:
      "Emerald green to near-black horizontal gradient cover. Crisp white interior pages with deep-emerald ink and a vibrant accent.",
    cover: "gradient-horizontal",
    coverTitleWeight: 500,
    palette: {
      pageBg: "#FDFEFC",
      surface: "#FFFFFF",
      surfaceAlt: "#ECF7F1",
      surfaceDeep: "#001510",
      ink: "#034E3F",
      body: "#1B2925",
      muted: "#4E5F58",
      subtle: "#6F807A",
      faint: "#A5B2AD",
      hairline: "#DCE8E2",
      hairlineSoft: "#ECF2EE",
      divider: "#C2CFC8",
      accent: "#00BF8F",
      accentSoft: "#DBF0E6",
      coverBg: "#00BF8F",
      coverAccent: "#001510",
      coverText: "#001510",
      coverMuted: "#0A2520",
      coverRule: "#007858",
      coverGradientFrom: "#00BF8F",
      coverGradientTo: "#001510",
    },
  },

  // 14. Vasily — yellow-olive → charcoal horizontal gradient. Warm
  //     cream interior pages with charcoal ink and burnt-gold accent.
  {
    key: "14-vasily",
    name: "Vasily",
    description:
      "Yellow-olive to charcoal horizontal gradient cover. Warm cream interior pages with charcoal ink and a burnt-gold accent.",
    cover: "gradient-horizontal",
    coverTitleWeight: 500,
    palette: {
      pageBg: "#FAF8F2",
      surface: "#FFFFFF",
      surfaceAlt: "#F3EECF",
      surfaceDeep: "#1F1C14",
      ink: "#333333",
      body: "#2A2620",
      muted: "#58544C",
      subtle: "#7A746B",
      faint: "#AEA99C",
      hairline: "#E3DCC2",
      hairlineSoft: "#EFEAD3",
      divider: "#D4CDB0",
      accent: "#A68C18",
      accentSoft: "#F6ECBD",
      coverBg: "#E9D362",
      coverAccent: "#333333",
      coverText: "#1F1C14",
      coverMuted: "#4E4A42",
      coverRule: "#C2AE42",
      coverGradientFrom: "#E9D362",
      coverGradientTo: "#333333",
    },
  },
];
