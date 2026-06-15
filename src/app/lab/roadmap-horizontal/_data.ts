/**
 * Roadmap Lab (Horizontal) — shared sample data.
 *
 * A second roadmap gallery, distinct from /lab/roadmap. The brief here:
 *   • LEFT → RIGHT reading direction (infographic, not a vertical list)
 *   • AGGREGATED to at most 5–6 steps (here: exactly 5 stages)
 *   • TEXT-LIGHT — short labels + one supporting line, never paragraphs
 *   • elegant, modern, with calm colour
 *   • shows a *hypothetical but concrete* scenario (real Norwegian employers)
 *
 * Every variant under /lab/roadmap-horizontal/<n> renders the SAME scenario
 * data, so only the layout / infographic style differs. The owner can flip
 * between four scenarios via the shared ScenarioBar (see _scenario.tsx); all
 * variants react to the choice.
 *
 * The five stages mirror the real journey arc, compressed:
 *   foundation → choose → study → entry → advance
 * i.e. "finish school" → "pick a path / apply" → "commit to study" →
 * "first real role at a named employer" → "advance after a few years".
 */

export type RoadStage = "foundation" | "choose" | "study" | "entry" | "advance";

export interface RoadStep {
  id: string;
  stage: RoadStage;
  /** Short headline — 1–3 words ideally. */
  label: string;
  /** One supporting line — text-light (subjects, course, employer, etc.). */
  detail: string;
  /** lucide-react icon name. */
  icon: string;
  /** Age range label, e.g. "16–19" or "22". */
  ageLabel: string;
  /** Year label, e.g. "now–2028" or "2031". */
  yearLabel: string;
  /** Employer / place chip, only on the entry + advance steps. */
  place?: string;
  /** The learner's current position ("you are here"). */
  isNow?: boolean;
}

export interface Scenario {
  id: string;
  /** Short tab label, e.g. "Database Admin". */
  tab: string;
  /** Final role title, e.g. "Database Administrator". */
  role: string;
  /** Named employer, e.g. "Oracle". */
  employer: string;
  city: string;
  /** Scenario accent colour (hex). */
  accent: string;
  /** "Your situation today" capture line. */
  current: {
    age: number;
    finishYear: number;
    stage: string;
    subjects: string[];
  };
  /** Exactly five aggregated steps. */
  steps: RoadStep[];
}

/**
 * Calm, premium five-stage palette — colourful but never harsh neon.
 * Variants may restyle but this is the reference accent per stage.
 */
export const STAGE_META: Record<
  RoadStage,
  { label: string; accent: string; soft: string; ring: string; icon: string }
> = {
  foundation: { label: "School", accent: "#0ea5b7", soft: "#0ea5b71f", ring: "#0ea5b766", icon: "GraduationCap" },
  choose: { label: "Choose", accent: "#7c6cf0", soft: "#7c6cf01f", ring: "#7c6cf066", icon: "Compass" },
  study: { label: "Study", accent: "#d99a2b", soft: "#d99a2b1f", ring: "#d99a2b66", icon: "BookOpen" },
  entry: { label: "First role", accent: "#2fa36b", soft: "#2fa36b1f", ring: "#2fa36b66", icon: "Briefcase" },
  advance: { label: "Advance", accent: "#e2598b", soft: "#e2598b1f", ring: "#e2598b66", icon: "TrendingUp" },
};

export const STAGE_ORDER: RoadStage[] = ["foundation", "choose", "study", "entry", "advance"];

export const SCENARIOS: Scenario[] = [
  {
    id: "oracle",
    tab: "Database Admin",
    role: "Database Administrator",
    employer: "Oracle",
    city: "Oslo",
    accent: "#c74634",
    current: { age: 16, finishYear: 2028, stage: "Upper secondary", subjects: ["Maths", "IT", "Physics"] },
    steps: [
      { id: "o1", stage: "foundation", label: "Finish school", detail: "Maths · IT · Physics", icon: "GraduationCap", ageLabel: "16–19", yearLabel: "now → 2028", isNow: true },
      { id: "o2", stage: "choose", label: "Pick a path", detail: "Apply: informatics degree", icon: "Compass", ageLabel: "19", yearLabel: "2028" },
      { id: "o3", stage: "study", label: "Study computing", detail: "BSc Informatics · 3 yrs", icon: "BookOpen", ageLabel: "19–22", yearLabel: "2028–31" },
      { id: "o4", stage: "entry", label: "First role", detail: "Junior DBA", icon: "Briefcase", ageLabel: "22", yearLabel: "2031", place: "Oracle · Oslo" },
      { id: "o5", stage: "advance", label: "Advance", detail: "Database Administrator", icon: "TrendingUp", ageLabel: "26", yearLabel: "2035", place: "after 4 yrs" },
    ],
  },
  {
    id: "telia",
    tab: "Network Engineer",
    role: "Network Engineer",
    employer: "Telia",
    city: "Oslo",
    accent: "#990ae3",
    current: { age: 16, finishYear: 2028, stage: "Upper secondary", subjects: ["Maths", "IT", "Electronics"] },
    steps: [
      { id: "t1", stage: "foundation", label: "Finish school", detail: "Maths · IT · Electronics", icon: "GraduationCap", ageLabel: "16–19", yearLabel: "now → 2028", isNow: true },
      { id: "t2", stage: "choose", label: "Pick a path", detail: "Apply: ICT vocational or degree", icon: "Compass", ageLabel: "19", yearLabel: "2028" },
      { id: "t3", stage: "study", label: "Study networks", detail: "ICT diploma + CCNA · 2 yrs", icon: "BookOpen", ageLabel: "19–21", yearLabel: "2028–30" },
      { id: "t4", stage: "entry", label: "First role", detail: "Network Technician", icon: "Briefcase", ageLabel: "21", yearLabel: "2030", place: "Telia · Oslo" },
      { id: "t5", stage: "advance", label: "Advance", detail: "Network Engineer", icon: "TrendingUp", ageLabel: "25", yearLabel: "2034", place: "after 4 yrs" },
    ],
  },
  {
    id: "analysys",
    tab: "Consultant",
    role: "Consultant",
    employer: "Analysys Mason",
    city: "Oslo",
    accent: "#0b6bcb",
    current: { age: 16, finishYear: 2028, stage: "Upper secondary", subjects: ["Maths", "Economics", "English"] },
    steps: [
      { id: "a1", stage: "foundation", label: "Finish school", detail: "Maths · Economics · English", icon: "GraduationCap", ageLabel: "16–19", yearLabel: "now → 2028", isNow: true },
      { id: "a2", stage: "choose", label: "Pick a path", detail: "Apply: economics / tech mgmt", icon: "Compass", ageLabel: "19", yearLabel: "2028" },
      { id: "a3", stage: "study", label: "Study", detail: "BSc + MSc · 5 yrs", icon: "BookOpen", ageLabel: "19–24", yearLabel: "2028–33" },
      { id: "a4", stage: "entry", label: "First role", detail: "Analyst", icon: "Briefcase", ageLabel: "24", yearLabel: "2033", place: "Analysys Mason · Oslo" },
      { id: "a5", stage: "advance", label: "Advance", detail: "Consultant", icon: "TrendingUp", ageLabel: "28", yearLabel: "2037", place: "after 4 yrs" },
    ],
  },
  {
    id: "doctor",
    tab: "Junior Doctor",
    role: "Junior Doctor",
    employer: "Ahus",
    city: "Oslo",
    accent: "#2fa36b",
    current: { age: 16, finishYear: 2028, stage: "Upper secondary", subjects: ["Biology", "Chemistry", "Maths"] },
    steps: [
      { id: "d1", stage: "foundation", label: "Finish school", detail: "Biology · Chemistry · Maths", icon: "GraduationCap", ageLabel: "16–19", yearLabel: "now → 2028", isNow: true },
      { id: "d2", stage: "choose", label: "Apply to medicine", detail: "UiO / NTNU medicine", icon: "Compass", ageLabel: "19", yearLabel: "2028" },
      { id: "d3", stage: "study", label: "Study medicine", detail: "Profesjonsstudium · 6 yrs", icon: "BookOpen", ageLabel: "19–25", yearLabel: "2028–34" },
      { id: "d4", stage: "entry", label: "First role", detail: "Junior Doctor (LIS1)", icon: "Briefcase", ageLabel: "25", yearLabel: "2034", place: "Ahus · Oslo" },
      { id: "d5", stage: "advance", label: "Advance", detail: "Resident → Specialist", icon: "TrendingUp", ageLabel: "30", yearLabel: "2039", place: "after 5 yrs" },
    ],
  },
];

export const DEFAULT_SCENARIO_ID = "oracle";

export interface VariantMeta {
  n: number;
  name: string;
  idea: string;
  family: "road" | "timeline" | "steps" | "spatial" | "editorial";
}

/** The 20 horizontal infographic directions. Order = index listing order. */
export const VARIANTS: VariantMeta[] = [
  { n: 1, name: "Winding Road", idea: "Classic S-curve road with milestone flags planted on the bends", family: "road" },
  { n: 2, name: "Pin Markers", idea: "Teardrop map-pins over a wavy road, each lifting a mini card", family: "road" },
  { n: 3, name: "Chevron Flow", idea: "Bold left-to-right chevron blocks that lock together like an arrow", family: "steps" },
  { n: 4, name: "Milestone Flags", idea: "Straight progress line with colour-coded flags at each milestone", family: "timeline" },
  { n: 5, name: "Gradient Ribbon", idea: "A soft gradient ribbon flowing past five glowing nodes", family: "road" },
  { n: 6, name: "Stepping Stones", idea: "Five connected circles on a hairline — quiet premium whitespace", family: "steps" },
  { n: 7, name: "Ascending Arrow", idea: "Steps climbing up-and-right toward an arrowhead goal", family: "steps" },
  { n: 8, name: "Metro Line", idea: "Subway line with stage-coloured stations and a terminus", family: "timeline" },
  { n: 9, name: "Numbered Track", idea: "Five big numerals on a connector rail — clean classic infographic", family: "steps" },
  { n: 10, name: "Signposts", idea: "Roadside signposts / mile-markers along a calm horizon", family: "road" },
  { n: 11, name: "Summit Climb", idea: "A mountain ridge rising left-to-right to the goal at the peak", family: "spatial" },
  { n: 12, name: "Year Axis", idea: "A real year axis (2025→2039) with stage bars sitting on it", family: "timeline" },
  { n: 13, name: "Boarding Pass", idea: "Stages as a travel ticket / boarding-pass strip", family: "editorial" },
  { n: 14, name: "Hexagon Chain", idea: "Five hexagons linked in a gentle horizontal comb", family: "steps" },
  { n: 15, name: "Progress Bar", idea: "One elegant horizontal progress bar with five labelled stops", family: "timeline" },
  { n: 16, name: "Folded Banner", idea: "A zig-zag folded-ribbon banner with a tab per stage", family: "editorial" },
  { n: 17, name: "Flight Path", idea: "Dotted flight path with a plane at 'you are here', goal as destination", family: "spatial" },
  { n: 18, name: "Arrow Cards", idea: "Arrow-shaped cards interlocking left-to-right", family: "steps" },
  { n: 19, name: "Train Journey", idea: "A track with carriages — each carriage one stage, engine at the goal", family: "spatial" },
  { n: 20, name: "Compass Trail", idea: "A dotted trail with a compass, sweeping toward the destination", family: "spatial" },
];
