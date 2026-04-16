import { generateScenarios } from "@/lib/simulation/scenario-engine";
import type {
  CareerFactSheet,
  CareerInsights,
  CertificationPathView,
  ClaritySummary,
  CoverMeta,
  DiscoverSummary,
  EducationContext,
  ExecutiveSummaryData,
  JourneyReportViewModel,
  MomentumAction,
  NextStep,
  ProgrammeRow,
  RadarPreferences,
  RequirementsSummary,
  RoadmapSection,
  RoadmapStep,
  RouteVariant,
  SchoolStageItem,
  Stage,
  UnderstandSummary,
} from "./types";

/**
 * Flat, pre-fetched inputs for the mapper. Everything here is raw data
 * from DB / catalog / helpers. The mapper itself is pure — no IO, no
 * side-effects — so it's cheap to unit-test with realistic fixtures.
 */
export interface MapperInput {
  /** Deliberately no `displayName` / user name here — the report never
   *  uses the user's name on any page. Cover metadata is the date only. */
  primaryGoalTitle: string | null;
  journeySummary: Record<string, unknown> | null;
  generatedTimeline: Record<string, unknown> | null;
  activeGoalJourneySummary: Record<string, unknown> | null;
  discoverPreferences: Record<string, unknown> | null;
  /** Resolved career catalog entry, if `primaryGoalTitle` matched a known
   *  career. Pre-fetched by the API route so the mapper stays pure. */
  career: {
    id: string;
    title: string;
    description?: string;
    avgSalary?: string;
    educationPath?: string;
    keySkills?: string[];
    dailyTasks?: string[];
    growthOutlook?: "high" | "medium" | "stable";
    sector?: "public" | "private" | "mixed";
  } | null;
  careerDetails: {
    whatYouActuallyDo?: string[];
    whoThisIsGoodFor?: string[];
    topSkills?: string[];
    entryPaths?: string[];
    realityCheck?: string;
    typicalDay?: {
      morning?: string[];
      midday?: string[];
      afternoon?: string[];
      tools?: string[];
      environment?: string;
    };
  } | null;
  careerRequirements: {
    schoolSubjects: { required: string[]; recommended: string[]; minimumGrade: string };
    universityPath: {
      programme: string;
      duration: string;
      type: string;
      examples: string[];
      applicationRoute: string;
      competitiveness: string;
    };
    entryLevelRequirements: { title: string; description: string; whatYouNeed: string };
    qualifiesFor: { immediate: string; withExperience: string; seniorPath: string };
    specialisationNote: string | null;
  } | null;
  certificationPath: {
    summary: string;
    certifications: {
      name: string;
      provider: string;
      duration: string;
      cost: string;
      url: string;
      recognised: string;
    }[];
    recommendedDegrees?: string[];
  } | null;
  programmes: {
    institution: string;
    city: string;
    country: string;
    programme: string;
    englishName: string;
    url: string;
    type: string;
    duration: string;
    languageOfInstruction?: string;
    tuitionFee?: string;
  }[];
  pensionNote: string | null;
  generatedIso?: string;
  /** Current user age — used for the fallback roadmap. Defaults to 17
   *  when unknown (the target audience sits 15–23). */
  userAge?: number | null;
}

// ── Small pure helpers ─────────────────────────────────────────────

const trim = (s: unknown): string => (typeof s === "string" ? s.trim() : "");
const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(trim).filter(Boolean) : [];

const dedupe = (arr: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
};

const take = <T>(arr: T[], n: number): T[] => arr.slice(0, Math.max(0, n));

const titleCase = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const isStage = (v: unknown): v is Stage =>
  v === "foundation" || v === "education" || v === "certification" || v === "experience" || v === "career";
const safeStage = (v: unknown): Stage => (isStage(v) ? v : "foundation");

const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const countryName = (code: string): string => {
  const map: Record<string, string> = {
    NO: "Norway",
    SE: "Sweden",
    DK: "Denmark",
    FI: "Finland",
    IS: "Iceland",
  };
  return map[code] ?? code;
};

const educationStageLabel = (stage: string | null): string | null => {
  if (!stage) return null;
  const map: Record<string, string> = {
    secondary: "Secondary school",
    school: "Secondary school",
    college: "College",
    university: "University",
    other: "Other",
  };
  return map[stage.toLowerCase()] ?? titleCase(stage);
};

// Discover Radar option-id → human label maps (kept inline so the mapper
// stays framework-agnostic; the option sets are small and stable).
const INTEREST_LABELS: Record<string, string> = {
  "helping-people": "Helping people",
  "solving-problems": "Solving problems",
  "building-things": "Building things",
  technology: "Technology",
  "being-creative": "Being creative",
  "working-outdoors": "Working outdoors",
  organising: "Organising",
  "leading-others": "Leading others",
  "caring-for-people": "Caring for people",
  "working-with-numbers": "Working with numbers",
  communicating: "Communicating",
  researching: "Researching",
};

const STRENGTH_LABELS: Record<string, string> = {
  "explain-well": "Explaining things clearly",
  "calm-pressure": "Calm under pressure",
  "problem-solver": "Problem-solver",
  reliable: "Reliable",
  "people-person": "People-person",
  "detail-oriented": "Detail-oriented",
  "quick-learner": "Quick learner",
  practical: "Practical",
  "creative-ideas": "Creative ideas",
  persistent: "Persistent",
  curious: "Curious",
  structured: "Structured",
};

const MOTIVATION_LABELS: Record<string, string> = {
  "make-difference": "Making a difference",
  "financial-stability": "Financial stability",
  flexibility: "Flexibility",
  "keep-learning": "Lifelong learning",
  "be-respected": "Being respected",
  "work-with-people": "Working with people",
  "meaningful-work": "Meaningful work",
  independence: "Independence",
};

const WORK_TYPE_LABELS: Record<string, string> = {
  practical: "Practical",
  academic: "Academic",
  creative: "Creative",
  technical: "Technical",
};

const PEOPLE_PREF_LABELS: Record<string, string> = {
  "with-people": "Prefers working with people",
  independently: "Prefers working independently",
  "mix-people": "A mix of both",
};
const PACE_LABELS: Record<string, string> = {
  "fast-paced": "Fast-paced",
  steady: "Steady",
  varied: "Varied",
};
const ENV_LABELS: Record<string, string> = {
  indoor: "Indoors",
  outdoor: "Outdoors",
  "mix-environment": "Mixed indoor / outdoor",
};
const CLARITY_LEVEL_LABELS: Record<string, string> = {
  clear: "I know what I want to do",
  "few-ideas": "I have a few ideas",
  unsure: "Still unsure",
  "explore-broadly": "Exploring broadly",
};

const GROWTH_LABELS: Record<string, string> = {
  high: "Strong growth",
  medium: "Moderate growth",
  stable: "Stable demand",
};

/** Adjective form used inside sentences (e.g. "The outlook is strong.")
 *  so we don't get redundant phrasing like "the demand outlook is stable demand". */
const GROWTH_ADJECTIVES: Record<string, string> = {
  high: "strong",
  medium: "moderate",
  stable: "stable",
};

function labelsFromIds(ids: string[], map: Record<string, string>): string[] {
  return ids.map((id) => map[id] ?? titleCase(id.replace(/-/g, " "))).filter(Boolean);
}

// Norwegian institution shortnames — used to infer "Norway" for fallback
// scenarios where the scenario engine has lost the country code.
const NORWEGIAN_INSTITUTION_SHORTS = new Set([
  "UiO",
  "UiB",
  "NTNU",
  "UiT",
  "UiS",
  "HVL",
  "OsloMet",
  "UiA",
  "USN",
  "NMBU",
  "NHH",
  "BI",
  "Nord",
]);

// ── Section mappers ─────────────────────────────────────────────────

function mapCover(input: MapperInput): CoverMeta {
  const iso = input.generatedIso ?? new Date().toISOString();
  const career = trim(input.primaryGoalTitle) || null;
  const subtitle = career
    ? `A considered summary of exploring ${career} — what you've learned about the role, the path, and where you are on it.`
    : "A considered summary of your career exploration — explored, understood, and mapped into a personal path.";
  return {
    careerTitle: career,
    subtitle,
    generatedDate: fmtDate(iso),
    generatedIso: iso,
  };
}

function mapRadar(prefs: Record<string, unknown> | null): RadarPreferences | null {
  if (!prefs) return null;
  const wp = (prefs.workPreferences as Record<string, unknown>) ?? {};
  const people = typeof wp.peoplePreference === "string" ? wp.peoplePreference : null;
  const pace = typeof wp.pace === "string" ? wp.pace : null;
  const env = typeof wp.environment === "string" ? wp.environment : null;
  const workType = asStringArray(wp.workType);
  const clarityLevel =
    typeof prefs.clarityLevel === "string" ? prefs.clarityLevel : null;

  const summaryLines: string[] = [];
  if (people && PEOPLE_PREF_LABELS[people]) summaryLines.push(PEOPLE_PREF_LABELS[people]);
  if (workType.length > 0) {
    summaryLines.push(
      `Work style: ${workType.map((w) => WORK_TYPE_LABELS[w] ?? titleCase(w)).join(", ")}`,
    );
  }
  if (pace && PACE_LABELS[pace]) summaryLines.push(`Pace: ${PACE_LABELS[pace]}`);
  if (env && ENV_LABELS[env]) summaryLines.push(`Environment: ${ENV_LABELS[env]}`);
  if (clarityLevel && CLARITY_LEVEL_LABELS[clarityLevel]) {
    summaryLines.push(`Sense of direction: ${CLARITY_LEVEL_LABELS[clarityLevel]}`);
  }

  // Return null when we have no meaningful content at all.
  if (summaryLines.length === 0 && workType.length === 0 && !people && !pace) {
    return null;
  }
  return { peoplePreference: people, workType, pace, environment: env, clarityLevel, summaryLines };
}

function mapDiscover(
  summary: Record<string, unknown>,
  prefs: Record<string, unknown> | null,
): DiscoverSummary {
  const reflections = (summary.discoverReflections as Record<string, unknown>) ?? {};

  // Free-text / tag content
  const strengthsFromNotes = dedupe(asStringArray(summary.strengths));
  const interestsFromNotes = dedupe(asStringArray(summary.careerInterests));

  // Pull from Radar (discoverPreferences) — these are the structured
  // choices the user made on the Career Radar. Convert IDs → labels so
  // the report reads naturally.
  const discover = (prefs as Record<string, unknown> | null) ?? null;
  const radarInterests = labelsFromIds(
    asStringArray(discover?.interests),
    INTEREST_LABELS,
  );
  const radarStrengths = labelsFromIds(
    asStringArray(discover?.strengths),
    STRENGTH_LABELS,
  );
  const radarMotivations = labelsFromIds(
    asStringArray(discover?.motivations),
    MOTIVATION_LABELS,
  );

  return {
    strengths: dedupe([...strengthsFromNotes, ...radarStrengths]),
    motivations: dedupe([
      ...asStringArray(reflections.motivations),
      ...radarMotivations,
    ]),
    workStyle: dedupe(asStringArray(reflections.workStyle)),
    growthAreas: dedupe(asStringArray(reflections.growthAreas)),
    careerInterests: dedupe([...interestsFromNotes, ...radarInterests]),
    roleModels: trim(reflections.roleModels),
    experiences: trim(reflections.experiences),
    radar: mapRadar(discover),
  };
}

function mapCareerFacts(input: MapperInput): CareerFactSheet | null {
  const c = input.career;
  if (!c) return null;
  return {
    description: c.description ?? null,
    avgSalary: c.avgSalary ?? null,
    growthOutlook: c.growthOutlook ?? null,
    growthOutlookLabel: c.growthOutlook ? GROWTH_LABELS[c.growthOutlook] : null,
    educationPath: c.educationPath ?? null,
    sector: c.sector ?? null,
    pensionNote: input.pensionNote,
  };
}

function mapCareerInsights(input: MapperInput): CareerInsights | null {
  const d = input.careerDetails;
  const c = input.career;
  if (!d && !c) return null;
  const typicalDay = d?.typicalDay
    ? {
        morning: dedupe(asStringArray(d.typicalDay.morning)),
        midday: dedupe(asStringArray(d.typicalDay.midday)),
        afternoon: dedupe(asStringArray(d.typicalDay.afternoon)),
        tools: dedupe(asStringArray(d.typicalDay.tools)),
        environment: trim(d.typicalDay.environment) || null,
      }
    : null;
  return {
    whatYouActuallyDo: dedupe(asStringArray(d?.whatYouActuallyDo ?? c?.dailyTasks)),
    whoThisIsGoodFor: dedupe(asStringArray(d?.whoThisIsGoodFor)),
    topSkills: dedupe(asStringArray(d?.topSkills ?? c?.keySkills)),
    entryPaths: dedupe(asStringArray(d?.entryPaths)),
    realityCheck: trim(d?.realityCheck) || null,
    typicalDay,
  };
}

function mapRequirements(input: MapperInput): RequirementsSummary | null {
  const r = input.careerRequirements;
  if (!r) return null;
  return {
    subjects: {
      required: dedupe(asStringArray(r.schoolSubjects?.required)),
      recommended: dedupe(asStringArray(r.schoolSubjects?.recommended)),
      minimumGrade: trim(r.schoolSubjects?.minimumGrade) || null,
    },
    universityPath: {
      programme: trim(r.universityPath?.programme) || null,
      duration: trim(r.universityPath?.duration) || null,
      type: trim(r.universityPath?.type) || null,
      examples: dedupe(asStringArray(r.universityPath?.examples)),
      applicationRoute: trim(r.universityPath?.applicationRoute) || null,
      competitiveness: trim(r.universityPath?.competitiveness) || null,
    },
    entryLevel: {
      title: trim(r.entryLevelRequirements?.title) || null,
      description: trim(r.entryLevelRequirements?.description) || null,
      whatYouNeed: trim(r.entryLevelRequirements?.whatYouNeed) || null,
    },
    qualifiesFor: {
      immediate: trim(r.qualifiesFor?.immediate) || null,
      withExperience: trim(r.qualifiesFor?.withExperience) || null,
      seniorPath: trim(r.qualifiesFor?.seniorPath) || null,
    },
    specialisationNote: trim(r.specialisationNote) || null,
  };
}

function mapProgrammes(input: MapperInput): ProgrammeRow[] {
  return input.programmes.slice(0, 8).map((p) => ({
    institution: trim(p.institution),
    programme: trim(p.englishName) || trim(p.programme),
    city: trim(p.city),
    country: countryName(trim(p.country)),
    duration: trim(p.duration),
    language: trim(p.languageOfInstruction) || null,
    tuition: trim(p.tuitionFee) || null,
    url: trim(p.url) || null,
  }));
}

function mapCertifications(input: MapperInput): CertificationPathView | null {
  const cp = input.certificationPath;
  if (!cp) return null;
  return {
    summary: trim(cp.summary),
    certifications: (cp.certifications ?? [])
      .map((c) => ({
        name: trim(c.name),
        provider: trim(c.provider),
        duration: trim(c.duration),
        cost: trim(c.cost),
        recognised: trim(c.recognised),
        url: trim(c.url),
      }))
      .filter((c) => c.name)
      .slice(0, 6),
    recommendedDegrees: dedupe(asStringArray(cp.recommendedDegrees)),
  };
}

function mapUnderstand(
  summary: Record<string, unknown>,
  input: MapperInput,
): UnderstandSummary {
  const rolePlans = (summary.rolePlans as unknown[]) ?? [];
  const plan = (rolePlans[0] as Record<string, unknown>) ?? null;
  return {
    roleReality: dedupe(asStringArray(summary.roleRealityNotes)),
    industryInsights: dedupe(asStringArray(summary.industryInsightNotes)),
    qualifications: dedupe(asStringArray(summary.pathQualifications)),
    keySkills: dedupe(asStringArray(summary.pathSkills)),
    courses: dedupe(asStringArray(summary.pathCourses)),
    actionPlan: plan
      ? {
          roleTitle: trim(plan.roleTitle) || undefined,
          shortTermActions: dedupe(asStringArray(plan.shortTermActions)),
          midTermMilestone: trim(plan.midTermMilestone) || undefined,
          skillToBuild: trim(plan.skillToBuild) || undefined,
        }
      : null,
    facts: mapCareerFacts(input),
    insights: mapCareerInsights(input),
    requirements: mapRequirements(input),
    programmes: mapProgrammes(input),
    certifications: mapCertifications(input),
  };
}

function mapClarity(
  profileSummary: Record<string, unknown>,
  goalSummary: Record<string, unknown>,
): ClaritySummary {
  const rawMomentum = (goalSummary.momentumActions as unknown[]) ?? [];
  const momentum: MomentumAction[] = rawMomentum
    .map((a): MomentumAction | null => {
      const obj = (a ?? {}) as Record<string, unknown>;
      const text = trim(obj.text);
      if (!text) return null;
      const status = typeof obj.status === "string" ? obj.status : undefined;
      const type = typeof obj.type === "string" ? obj.type : undefined;
      const base: MomentumAction = { text, done: Boolean(obj.done) };
      if (status) base.status = status;
      if (type) base.type = type;
      return base;
    })
    .filter((x): x is MomentumAction => x !== null);

  const alignedRaw = (profileSummary.alignedActions as unknown[]) ?? [];
  const alignedActions = alignedRaw
    .map((a) => {
      const obj = (a ?? {}) as Record<string, unknown>;
      const title = trim(obj.title);
      const type = trim(obj.type) || "action";
      if (!title) return null;
      return { type, title };
    })
    .filter((x): x is { type: string; title: string } => x !== null);

  const reflectionsRaw = (profileSummary.alignedActionReflections as unknown[]) ?? [];
  const reflections = reflectionsRaw
    .map((r) => trim((r as Record<string, unknown>)?.response))
    .filter(Boolean);

  const eduCtx = (profileSummary.educationContext as Record<string, unknown>) ?? {};
  const foundationSet = Boolean(trim(eduCtx.stage));
  const hasMomentum = momentum.length > 0;

  return { momentum, alignedActions, reflections, foundationSet, hasMomentum };
}

function mapEducation(summary: Record<string, unknown>): EducationContext {
  const ctx = (summary.educationContext as Record<string, unknown>) ?? {};
  const rawStage = trim(ctx.stage) || null;
  return {
    stage: rawStage,
    stageLabel: educationStageLabel(rawStage),
    schoolName: trim(ctx.schoolName) || null,
    studyProgram: trim(ctx.studyProgram) || null,
    subjects: dedupe(asStringArray(ctx.currentSubjects)),
    expectedCompletion: trim(ctx.expectedCompletion) || null,
  };
}

// ── Roadmap: read saved timeline or generate a deterministic fallback

function mapRoadmap(
  timeline: Record<string, unknown> | null,
  input: MapperInput,
  education: EducationContext,
): RoadmapSection {
  // Derive birth year from the report-generation date and the user's
  // current age. Null when age is unknown — the PDF will fall back to
  // age-only labels.
  const reportYear = input.generatedIso
    ? new Date(input.generatedIso).getUTCFullYear()
    : new Date().getUTCFullYear();
  const birthYear =
    typeof input.userAge === "number" && input.userAge > 0
      ? reportYear - input.userAge
      : null;

  const savedItems = readSavedRoadmap(timeline);
  if (savedItems && savedItems.items.length > 0) {
    return { ...savedItems, isFallback: false, birthYear };
  }
  const fallback = buildFallbackRoadmap(input, education);
  return { ...fallback, isFallback: true, birthYear };
}

function readSavedRoadmap(
  timeline: Record<string, unknown> | null,
): Omit<RoadmapSection, "isFallback" | "birthYear"> | null {
  if (!timeline) return null;
  const rawItems = (timeline.items as unknown[]) ?? [];
  const items: RoadmapStep[] = rawItems.map((raw) => {
    const it = (raw ?? {}) as Record<string, unknown>;
    return {
      stage: safeStage(it.stage),
      title: trim(it.title),
      subtitle: trim(it.subtitle) || undefined,
      startAge: typeof it.startAge === "number" ? it.startAge : 16,
      endAge: typeof it.endAge === "number" ? it.endAge : undefined,
      isMilestone: Boolean(it.isMilestone),
      description: trim(it.description) || undefined,
      microActions: dedupe(asStringArray(it.microActions)),
    };
  });

  const rawSchool = (timeline.schoolTrack as unknown[]) ?? [];
  const schoolTrack: SchoolStageItem[] = rawSchool.map((raw) => {
    const it = (raw ?? {}) as Record<string, unknown>;
    return {
      stage: safeStage(it.stage),
      title: trim(it.title),
      subjects: dedupe(asStringArray(it.subjects)),
      personalLearning: trim(it.personalLearning) || undefined,
      startAge: typeof it.startAge === "number" ? it.startAge : 16,
      endAge: typeof it.endAge === "number" ? it.endAge : undefined,
    };
  });

  return {
    career: trim(timeline.career) || null,
    items,
    schoolTrack,
  };
}

/**
 * Deterministic roadmap generated from career requirements + user's age.
 * Designed to produce a sensible draft any time the user has picked a
 * career. If requirements data isn't available, returns a tiny generic
 * ladder rather than nothing.
 */
function buildFallbackRoadmap(
  input: MapperInput,
  education: EducationContext,
): Omit<RoadmapSection, "isFallback" | "birthYear"> {
  const career = input.career;
  const reqs = input.careerRequirements;
  const title = career?.title ?? input.primaryGoalTitle ?? "your career";

  const age = input.userAge ?? 17;
  const items: RoadmapStep[] = [];

  // Step 1 — finish secondary, anchor subjects (if age ≤ 18)
  if (age <= 18 && (education.stage === "secondary" || education.stage === "school" || !education.stage)) {
    const subjectNote = reqs
      ? `Focus on ${[...(reqs.schoolSubjects.required ?? [])].slice(0, 4).join(", ") || "your strongest subjects"}.`
      : undefined;
    items.push({
      stage: "foundation",
      title: "Finish secondary school strong",
      startAge: age,
      endAge: 18,
      isMilestone: false,
      description: subjectNote,
      microActions: reqs?.schoolSubjects.recommended?.slice(0, 3).map((s) => `Keep ${s} in your subject mix`),
    });
  }

  // Step 2 — apply to programme
  if (reqs?.universityPath?.programme) {
    const applyAge = Math.max(age + 1, 19);
    items.push({
      stage: "education",
      title: `Apply to ${reqs.universityPath.programme}`,
      subtitle: reqs.universityPath.examples.slice(0, 3).join(", ") || undefined,
      startAge: applyAge,
      endAge: applyAge,
      isMilestone: true,
      description: reqs.universityPath.applicationRoute
        ? `Apply via ${reqs.universityPath.applicationRoute}.`
        : undefined,
      microActions: reqs.universityPath.competitiveness
        ? [reqs.universityPath.competitiveness]
        : undefined,
    });
  }

  // Step 3 — complete programme
  if (reqs?.universityPath?.programme) {
    const startUni = Math.max(age + 1, 19);
    const duration = parseInt(String(reqs.universityPath.duration || "").match(/\d+/)?.[0] ?? "3", 10);
    items.push({
      stage: "education",
      title: `Complete ${reqs.universityPath.programme}`,
      subtitle: reqs.universityPath.duration || undefined,
      startAge: startUni,
      endAge: startUni + duration,
      isMilestone: false,
    });
  }

  // Step 4 — entry-level
  if (reqs?.entryLevelRequirements?.title) {
    const startUni = Math.max(age + 1, 19);
    const duration = parseInt(String(reqs?.universityPath?.duration || "").match(/\d+/)?.[0] ?? "3", 10);
    const afterUni = startUni + duration;
    items.push({
      stage: "experience",
      title: reqs.entryLevelRequirements.title,
      startAge: afterUni,
      endAge: afterUni + 2,
      isMilestone: true,
      description: reqs.entryLevelRequirements.description || undefined,
      microActions: reqs.entryLevelRequirements.whatYouNeed
        ? [reqs.entryLevelRequirements.whatYouNeed]
        : undefined,
    });
  }

  // Step 5 — qualifies for
  if (reqs?.qualifiesFor?.immediate) {
    const startUni = Math.max(age + 1, 19);
    const duration = parseInt(String(reqs?.universityPath?.duration || "").match(/\d+/)?.[0] ?? "3", 10);
    const afterEntry = startUni + duration + 2;
    items.push({
      stage: "career",
      title: `Qualified ${reqs.qualifiesFor.immediate}`,
      startAge: afterEntry,
      isMilestone: false,
    });
  }
  if (reqs?.qualifiesFor?.seniorPath) {
    const startUni = Math.max(age + 1, 19);
    const duration = parseInt(String(reqs?.universityPath?.duration || "").match(/\d+/)?.[0] ?? "3", 10);
    const seniorAge = startUni + duration + 8;
    items.push({
      stage: "career",
      title: reqs.qualifiesFor.seniorPath,
      startAge: seniorAge,
      isMilestone: true,
    });
  }

  // If reqs was null, produce a minimal 3-step scaffold so the roadmap
  // page still has content.
  if (items.length === 0) {
    items.push(
      {
        stage: "foundation",
        title: "Explore the role more deeply",
        startAge: age,
        endAge: age + 1,
        isMilestone: false,
        description: `Build your picture of ${title}: watch a day-in-the-life video, talk to one person in the field, and note what surprises you.`,
      },
      {
        stage: "education",
        title: "Choose and enter your learning path",
        startAge: Math.max(age + 1, 19),
        isMilestone: true,
      },
      {
        stage: "career",
        title: `Step into ${title}`,
        startAge: Math.max(age + 5, 23),
        isMilestone: true,
      },
    );
  }

  // School track: mirror the user's current subjects into a single
  // learning-track row so the roadmap page isn't an island.
  const schoolTrack: SchoolStageItem[] = education.subjects.length
    ? [
        {
          stage: "foundation",
          title: "Your current subjects",
          subjects: education.subjects,
          startAge: age,
          endAge: age + 1,
        },
      ]
    : [];

  return { career: title, items, schoolTrack };
}

// ── Routes: pull scenarios and tidy up employer + country for the career

function mapRoutes(input: MapperInput): RouteVariant[] {
  const career = input.career;
  const title = career?.title ?? input.primaryGoalTitle;
  if (!title) return [];
  let scenarios;
  try {
    scenarios = generateScenarios(title, title);
  } catch {
    return [];
  }

  return scenarios.map((s, idx) => {
    // Infer country for fallback scenarios where scenario-engine left
    // country blank (happens when programmes data is missing for the
    // career). We match institution short-names against a Norwegian
    // whitelist to avoid labelling Swedish unis as Norwegian.
    const uniName = trim(s.university.name);
    const fallbackCountry = NORWEGIAN_INSTITUTION_SHORTS.has(uniName) ? "Norway" : "";
    const country = trim(s.university.country) || fallbackCountry;

    // Derive a more useful label than "Route A / Route B" when the
    // scenario engine fell back to the generic namespace.
    let label = trim(s.label);
    if (!label || /^route\s+[ab]$/i.test(label)) {
      label = idx === 0 ? "Primary route" : "Alternative route";
    }

    // Align the employer role with the actual career, not the sector
    // bucket. The scenario engine uses "Junior Doctor" for all healthcare
    // — misleading for pharmacist, nurse, physio, etc.
    const role = alignRoleToCareer(s.employer.role, title);

    return {
      label,
      university: {
        name: uniName,
        programme: trim(s.university.programme),
        city: trim(s.university.city),
        country,
      },
      employer: {
        name: trim(s.employer.name),
        role,
        city: trim(s.employer.city),
      },
    };
  });
}

function alignRoleToCareer(role: string, careerTitle: string): string {
  const r = role.toLowerCase();
  const t = careerTitle.toLowerCase();
  // Only override when the scenario engine's default is clearly mismatched.
  const defaultHealthcareRoles = ["junior doctor", "resident", "medical officer", "clinical trainee"];
  if (defaultHealthcareRoles.includes(r) && !/doctor|surgeon|physician/.test(t)) {
    return `Junior ${titleCase(careerTitle)}`;
  }
  return role || `Junior ${titleCase(careerTitle)}`;
}

// ── Executive summary synthesis ─────────────────────────────────────

function buildExecutiveSummary(
  cover: CoverMeta,
  discover: DiscoverSummary,
  understand: UnderstandSummary,
  clarity: ClaritySummary,
  roadmap: RoadmapSection,
  routes: RouteVariant[],
  education: EducationContext,
): ExecutiveSummaryData {
  const career = cover.careerTitle;
  const headline = career
    ? `A future in ${career}.`
    : "A career direction still in the making.";

  const paragraphs: string[] = [];

  // Paragraph 1 — the role (always something to say when career is known)
  if (career && understand.facts?.description) {
    const salary = understand.facts.avgSalary
      ? ` Entry-level pay in Norway sits around ${understand.facts.avgSalary}.`
      : "";
    const outlookAdj = understand.facts.growthOutlook
      ? GROWTH_ADJECTIVES[understand.facts.growthOutlook]
      : null;
    const growth = outlookAdj ? ` The outlook for ${career} is ${outlookAdj}.` : "";
    paragraphs.push(`${understand.facts.description}${salary}${growth}`);
  } else if (career) {
    paragraphs.push(
      `This report captures what the exploration of ${career} has produced so far — what's been learned about the role, what's required to get there, and what comes next.`,
    );
  }

  // Paragraph 2 — the user (their Radar / strengths / motivations)
  const personBits: string[] = [];
  if (discover.motivations.length) {
    personBits.push(
      `Driven by ${joinPhrase(take(discover.motivations, 3))}`,
    );
  }
  if (discover.strengths.length) {
    personBits.push(
      `leaning on strengths in ${joinPhrase(take(discover.strengths, 3))}`,
    );
  }
  if (personBits.length) {
    paragraphs.push(`${personBits.join(", ")}.`);
  } else if (discover.radar?.summaryLines.length) {
    paragraphs.push(
      `Radar so far says: ${joinPhrase(take(discover.radar.summaryLines, 3)).toLowerCase()}.`,
    );
  }

  // Paragraph 3 — clarity + momentum + routes (the action story)
  const closingBits: string[] = [];
  if (clarity.foundationSet && education.stageLabel) {
    closingBits.push(
      `With a starting point set at ${education.schoolName || education.stageLabel.toLowerCase()}, a personal roadmap has been mapped.`,
    );
  } else if (roadmap.items.length) {
    closingBits.push(
      `A personal roadmap of ${roadmap.items.length} milestones has been drafted.`,
    );
  }
  if (clarity.hasMomentum) {
    const doneCount = clarity.momentum.filter((m) => m.done).length;
    closingBits.push(
      `Momentum is underway: ${clarity.momentum.length} concrete ${clarity.momentum.length === 1 ? "action" : "actions"} committed${doneCount > 0 ? `, ${doneCount} already done` : ""}.`,
    );
  }
  const routeCountries = dedupe(
    routes.map((r) => r.university.country).filter((c): c is string => Boolean(c && c.trim())),
  );
  if (routes.length >= 2 && routeCountries.length > 0) {
    closingBits.push(
      `Alternative routes through ${joinPhrase(take(routeCountries, 3))} are also on the table.`,
    );
  } else if (routes.length >= 2) {
    closingBits.push(
      `Several alternative routes to the same career are also on the table.`,
    );
  }
  if (closingBits.length) {
    paragraphs.push(closingBits.join(" "));
  }

  const highlights: { label: string; value: string }[] = [];
  if (career) highlights.push({ label: "Career Direction", value: career });
  if (understand.facts?.avgSalary)
    highlights.push({ label: "Entry Salary (NO)", value: understand.facts.avgSalary });
  if (understand.facts?.growthOutlookLabel)
    highlights.push({ label: "Demand Outlook", value: understand.facts.growthOutlookLabel });
  if (roadmap.items.length && highlights.length < 3)
    highlights.push({ label: "Roadmap Milestones", value: String(roadmap.items.length) });
  if (clarity.momentum.length && highlights.length < 3)
    highlights.push({
      label: "Momentum Actions",
      value: `${clarity.momentum.filter((m) => m.done).length} of ${clarity.momentum.length} done`,
    });
  if (routes.length && highlights.length < 3)
    highlights.push({ label: "Alternative Routes", value: `${routes.length} viable paths` });

  return { headline, paragraphs, highlights: take(highlights, 3) };
}

// ── Next steps ──────────────────────────────────────────────────────

function buildNextSteps(
  career: string | null,
  discover: DiscoverSummary,
  understand: UnderstandSummary,
  clarity: ClaritySummary,
  roadmap: RoadmapSection,
  education: EducationContext,
): NextStep[] {
  const steps: NextStep[] = [];

  if (!clarity.foundationSet) {
    steps.push({
      priority: "foundational",
      headline: "Anchor your starting point",
      body: "Fill in your current school, subjects, and expected finish year in the Clarity tab. Everything else on your roadmap becomes sharper once this is set.",
    });
  }
  if (!career) {
    steps.push({
      priority: "foundational",
      headline: "Pick a career direction to explore",
      body: "You don't have to commit — just choose one to explore deeply. You can always pick up another afterwards.",
    });
  }
  if (discover.strengths.length === 0 && !discover.radar) {
    steps.push({
      priority: "foundational",
      headline: "Commit to one first action this fortnight",
      body: "Choose a single concrete move — message one person in the field, sit in on an open day, or sign up for a trial course. Momentum is earned, not granted; the smallest committed action beats the best intention.",
    });
  }
  if (career && understand.roleReality.length === 0) {
    steps.push({
      priority: "next",
      headline: `Try one real-world test of ${career}`,
      body: `Sit in on a real workplace, take a short intro course, or volunteer somewhere adjacent. One day of direct exposure to ${career} sharpens your picture more than hours of further reading.`,
    });
  }

  // If we have a top skill from the career catalog, make the next move concrete.
  const firstSkill = understand.insights?.topSkills[0] ?? understand.keySkills[0];
  if (firstSkill && !clarity.hasMomentum) {
    steps.push({
      priority: "next",
      headline: `Start building ${firstSkill.toLowerCase()}`,
      body: "Add one concrete action in Clarity's Momentum panel — a course to take, a project to attempt, a person to reach out to. One small move this month.",
    });
  }

  if (clarity.hasMomentum) {
    const notDone = clarity.momentum.filter((m) => !m.done);
    if (notDone.length > 0) {
      steps.push({
        priority: "next",
        headline: "Close one open action",
        body: `You have ${notDone.length} ${notDone.length === 1 ? "move" : "moves"} still open. Pick the smallest and finish it this week — done beats perfect.`,
      });
    }
  }

  if (roadmap.isFallback && career) {
    steps.push({
      priority: "next",
      headline: "Generate your personal roadmap in-app",
      body: `The roadmap in this report is a draft built from the requirements of ${career}. Open the Clarity tab to generate the age-anchored version personalised to your stage and finish year.`,
    });
  }

  if (understand.requirements?.subjects.required.length) {
    const req = understand.requirements.subjects.required.slice(0, 3);
    steps.push({
      priority: "stretch",
      headline: "Align next term's effort",
      body: `Required subjects for this path include ${req.join(", ")}. Lift the effort on those two or three first — compound gains beat sprints.`,
    });
  }

  if (clarity.foundationSet && clarity.hasMomentum && career) {
    steps.push({
      priority: "stretch",
      headline: "Talk to one real person in the field",
      body: `Reach out to someone doing ${career} today — even a one-message LinkedIn note counts. Real voices change how you weigh everything else.`,
    });
  }

  if (discover.careerInterests.length > 1) {
    steps.push({
      priority: "stretch",
      headline: "Explore a second route",
      body: `You showed interest in more than one direction (${joinPhrase(take(discover.careerInterests, 3))}). Running a second career through the Journey sharpens both — and often reveals the real preference.`,
    });
  }

  if (steps.length === 0) {
    steps.push({
      priority: "next",
      headline: "Keep going at your own pace",
      body: "You've done the hardest part: starting. Return to My Journey, pick one section, and move it one step forward. Clarity comes from iteration, not from one perfect sitting.",
    });
  }

  return take(steps, 6);
}

// ── Language helpers ────────────────────────────────────────────────

function joinPhrase(items: string[]): string {
  const clean = items.filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

// ── Public entry point ──────────────────────────────────────────────

export function buildViewModel(input: MapperInput): JourneyReportViewModel {
  const profileSummary = input.journeySummary ?? {};
  const goalSummary = input.activeGoalJourneySummary ?? {};

  const cover = mapCover(input);
  const discover = mapDiscover(profileSummary, input.discoverPreferences);
  const understand = mapUnderstand(profileSummary, input);
  const clarity = mapClarity(profileSummary, goalSummary);
  const education = mapEducation(profileSummary);
  const roadmap = mapRoadmap(input.generatedTimeline, input, education);
  const routes = mapRoutes(input);

  const executive = buildExecutiveSummary(
    cover,
    discover,
    understand,
    clarity,
    roadmap,
    routes,
    education,
  );
  const nextSteps = buildNextSteps(
    cover.careerTitle,
    discover,
    understand,
    clarity,
    roadmap,
    education,
  );

  const closingReflections: string[] = dedupe(
    [
      ...clarity.reflections,
      discover.roleModels && `On who inspires me: ${discover.roleModels}`,
      discover.experiences && `On what I've tried so far: ${discover.experiences}`,
    ].filter((v): v is string => typeof v === "string" && v.length > 0),
  );

  return {
    cover,
    executive,
    discover,
    understand,
    roadmap,
    routes,
    clarity,
    education,
    nextSteps,
    closingReflections,
  };
}
