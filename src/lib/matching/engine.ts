/**
 * Matching Engine — Core
 *
 * Hybrid career matching: structured career profiles + weighted
 * multi-dimensional scoring + diversity layer + explainability.
 *
 * Design principles:
 *   - Affinity-based, not penalty-based. Non-matching = low score, not negative.
 *   - Every dimension is continuous (0-1), not binary (match/contradict).
 *   - Multi-select work styles mean "open to both", not "contradict everything".
 *   - Results are diverse, explainable, and configurable.
 */

import type {
  CareerMatchProfile,
  UserMatchProfile,
  MatchResult,
  DimensionScore,
} from "./types";
import {
  MATCHING_CONFIG,
  WORK_SETTING_TO_DIMENSIONS,
  PEOPLE_INTENSITY_TO_SCORE,
  PEOPLE_PREF_TO_SCORE,
  ACADEMIC_DEMAND_TO_SCORE,
  SUBJECT_LABELS,
  WORK_STYLE_LABELS,
  ANALYTICAL_KEYWORDS,
  POPULAR_CAREERS,
} from "./config";
import {
  type Career,
  type CareerCategory,
  type DiscoveryPreferences,
  getAllCareers,
  findCareerCategory,
  getCareerWorkSetting,
  getCareerPeopleIntensity,
  getSectorForCareer,
  measureSignalStrength,
} from "@/lib/career-pathways";
import { getFitDimensions } from "@/lib/compare/fit-dimensions";
import { getAcademicProfile } from "@/lib/education/academic-readiness";

// ── Subject data (imported indirectly via lookup functions) ────────
// These mirror the maps in career-pathways.ts. We build subject
// relevance per-career using category membership + boost lists.
// We import the raw data by re-declaring the maps here so the
// matching engine is self-contained and testable.

import {
  getSubjectCategoryWeights,
  getSubjectCareerBoosts,
  getInterestCareerBoosts,
} from "@/lib/career-pathways";
import {
  matchCareerToGradeRange,
  shouldExcludeByRoute,
  gradeMatchScoreAdjustment,
} from "@/lib/career-pathways/grade-match";

// ══════════════════════════════════════════════════════════════════
// 1. BUILD CAREER PROFILE
// ══════════════════════════════════════════════════════════════════

// Cache to avoid re-computing profiles for the same career
const profileCache = new Map<string, CareerMatchProfile>();

/** Clear the profile cache (call when career data changes). */
export function clearProfileCache(): void {
  profileCache.clear();
}

/**
 * Build a CareerMatchProfile from existing career data.
 * Combines: workSetting, peopleIntensity, fit-dimensions,
 * academic-readiness, subject-category weights, and boost lists.
 */
export function buildCareerProfile(career: Career): CareerMatchProfile {
  const cached = profileCache.get(career.id);
  if (cached) return cached;

  const category = findCareerCategory(career.id) || "UNKNOWN";
  const workSetting = getCareerWorkSetting(career);
  const peopleIntensity = getCareerPeopleIntensity(career);

  // Work environment dimensions from setting
  const envDims = WORK_SETTING_TO_DIMENSIONS[workSetting] ||
    WORK_SETTING_TO_DIMENSIONS.mixed;

  // Fit dimensions (creativity, people, hands-on, variety, academic, outdoor)
  const fitDims = getFitDimensions(career);
  const fitMap = Object.fromEntries(fitDims.map((d) => [d.id, d.score / 5]));

  // Blend work setting dimensions with fit-dimension scores for richer signal
  const desk = Math.max(envDims.desk, workSetting === "desk" ? 0.9 : 0);
  const handsOn = blend(envDims.handsOn, fitMap.handsOn ?? 0);
  const outdoors = blend(envDims.outdoors, fitMap.outdoor ?? 0);
  const creative = blend(envDims.creative, fitMap.creativity ?? 0);

  // People orientation
  const peopleOrientation = PEOPLE_INTENSITY_TO_SCORE[peopleIntensity] ?? 0.5;

  // Analytical dimension: keyword scan + academic correlation
  const text = `${career.description} ${career.keySkills.join(" ")} ${career.dailyTasks.join(" ")}`.toLowerCase();
  let analyticalHits = 0;
  for (const kw of ANALYTICAL_KEYWORDS) {
    if (text.includes(kw)) analyticalHits++;
  }
  const analytical = Math.min(1, analyticalHits / 6);

  // Variety from fit dimensions
  const variety = fitMap.variety ?? 0.4;

  // Academic from fit dimensions
  const academic = fitMap.academic ?? 0.3;

  // Academic demand from readiness framework
  let academicDemand = 0.4; // default moderate
  let pathwayType = "mixed";
  try {
    const readiness = getAcademicProfile(career);
    academicDemand = ACADEMIC_DEMAND_TO_SCORE[readiness.demand] ?? 0.4;
    pathwayType = readiness.pathwayType;
  } catch {
    // Readiness data not available for this career — use defaults
  }

  // Subject relevance: which school subjects relate to this career
  const subjectRelevance = buildSubjectRelevance(career.id, category as CareerCategory);

  const profile: CareerMatchProfile = {
    careerId: career.id,
    subjectRelevance,
    desk,
    handsOn,
    outdoors,
    creative,
    peopleOrientation,
    analytical,
    variety,
    academic,
    academicDemand,
    pathwayType,
    category,
    sector: getSectorForCareer(career.id),
    growthOutlook: career.growthOutlook,
    entryLevel: career.entryLevel ?? false,
  };

  profileCache.set(career.id, profile);
  return profile;
}

/** Blend two 0-1 signals, biasing toward the higher one. */
function blend(a: number, b: number): number {
  return Math.min(1, a * 0.6 + b * 0.4);
}

/**
 * Build per-subject relevance scores for a career.
 * Uses category weights + explicit boost lists.
 */
function buildSubjectRelevance(
  careerId: string,
  category: CareerCategory,
): Record<string, number> {
  const relevance: Record<string, number> = {};
  const weights = getSubjectCategoryWeights();
  const boosts = getSubjectCareerBoosts();

  for (const [subject, categoryWeights] of Object.entries(weights)) {
    const weight = categoryWeights[category] ?? 0;
    // Normalize: max weight is 4, so /4 gives 0-1
    relevance[subject] = Math.min(1, weight / 4);
  }

  // Boost list: ensure careers on a subject's boost list have meaningful relevance
  for (const [subject, careerIds] of Object.entries(boosts)) {
    if (careerIds.includes(careerId)) {
      relevance[subject] = Math.max(
        relevance[subject] || 0,
        MATCHING_CONFIG.explicitBoostFloor,
      );
    }
  }

  return relevance;
}

// ══════════════════════════════════════════════════════════════════
// 2. BUILD USER PROFILE
// ══════════════════════════════════════════════════════════════════

/**
 * Normalize DiscoveryPreferences into a UserMatchProfile.
 * Maps quiz inputs to the same dimensional space as career profiles.
 */
export function buildUserProfile(prefs: DiscoveryPreferences): UserMatchProfile {
  const starredSet = new Set(
    (prefs.starredSubjects || []).map((s) => s.toLowerCase()),
  );

  // Subject weights: starred = 1.0, normal = 0.7
  const subjects: Record<string, number> = {};
  for (const subj of prefs.subjects || []) {
    const key = subj.toLowerCase();
    subjects[key] = starredSet.has(key) ? 1.0 : 0.7;
  }

  // Work style dimensions
  const chosenStyles = prefs.workStyles || [];
  const hasWorkStylePreference = chosenStyles.length > 0 && !chosenStyles.includes("mixed");

  let desk = 0.5;
  let handsOn = 0.5;
  let outdoors = 0.5;
  let creative = 0.5;

  if (hasWorkStylePreference) {
    // Start from zero, then set chosen dimensions to 1.0
    desk = 0;
    handsOn = 0;
    outdoors = 0;
    creative = 0;

    for (const style of chosenStyles) {
      if (style === "desk") desk = 1.0;
      if (style === "hands-on") handsOn = 1.0;
      if (style === "outdoors") outdoors = 1.0;
      if (style === "creative") creative = 1.0;
    }
  }
  // If "mixed" or nothing selected, all stay 0.5 (neutral)

  // People preference
  const hasPeoplePreference = !!prefs.peoplePref && prefs.peoplePref !== "mixed";
  const peopleOrientation = PEOPLE_PREF_TO_SCORE[prefs.peoplePref || "mixed"] ?? 0.5;

  return {
    subjects,
    desk,
    handsOn,
    outdoors,
    creative,
    peopleOrientation,
    hasWorkStylePreference,
    hasPeoplePreference,
    interests: (prefs.interests || []).map((i) => i.toLowerCase()),
  };
}

// ══════════════════════════════════════════════════════════════════
// 3. SCORING ENGINE
// ══════════════════════════════════════════════════════════════════

/**
 * Score a single career against a user profile.
 * Returns 0-100 match percentage with per-dimension breakdown.
 */
export function scoreCareer(
  user: UserMatchProfile,
  career: CareerMatchProfile,
): MatchResult {
  const W = MATCHING_CONFIG.weights;
  const dimensions: DimensionScore[] = [];

  // ── A. Subject match ────────────────────────────────────────────
  const subjectSim = computeSubjectSimilarity(user.subjects, career.subjectRelevance);
  dimensions.push({
    dimension: "subject",
    label: "Subject alignment",
    weight: W.subjectMatch,
    similarity: subjectSim,
    contribution: W.subjectMatch * subjectSim,
  });

  // ── B. Work style match ─────────────────────────────────────────
  const workSim = user.hasWorkStylePreference
    ? computeWorkStyleFit(user, career)
    : 0.5; // Neutral — no preference expressed
  dimensions.push({
    dimension: "workStyle",
    label: "Work style fit",
    weight: W.workStyleMatch,
    similarity: workSim,
    contribution: W.workStyleMatch * workSim,
  });

  // ── C. People match ─────────────────────────────────────────────
  const peopleSim = user.hasPeoplePreference
    ? 1 - Math.abs(user.peopleOrientation - career.peopleOrientation)
    : 0.5; // Neutral
  dimensions.push({
    dimension: "people",
    label: "People interaction fit",
    weight: W.peopleMatch,
    similarity: peopleSim,
    contribution: W.peopleMatch * peopleSim,
  });

  // ── D. Creative / analytical alignment ──────────────────────────
  const caSim = computeCreativeAnalyticalFit(user, career);
  dimensions.push({
    dimension: "creativeAnalytical",
    label: "Creative & analytical fit",
    weight: W.creativeAnalytical,
    similarity: caSim,
    contribution: W.creativeAnalytical * caSim,
  });

  // ── E. Variety fit ──────────────────────────────────────────────
  // Slight bias: we assume youth are more interested in varied careers
  // unless they explicitly signal otherwise (which the quiz doesn't yet)
  const varietySim = 0.3 + career.variety * 0.7; // baseline 0.3, up to 1.0
  dimensions.push({
    dimension: "variety",
    label: "Work variety",
    weight: W.varietyFit,
    similarity: varietySim,
    contribution: W.varietyFit * varietySim,
  });

  // ── F. Academic fit ─────────────────────────────────────────────
  // Soft modifier: accessible careers get a gentle boost.
  // This is NOT a gate — demanding careers still appear, just
  // ranked slightly lower when no readiness signal is present.
  const academicSim = computeAcademicFit(career);
  dimensions.push({
    dimension: "academic",
    label: "Pathway accessibility",
    weight: W.academicFit,
    similarity: academicSim,
    contribution: W.academicFit * academicSim,
  });

  // ── Aggregate ───────────────────────────────────────────────────
  let rawScore = 0;
  for (const d of dimensions) rawScore += d.contribution;

  // Interest boost — check if this career appears on any selected
  // interest's boost list. Each hit adds a bonus. This is much more
  // accurate than the old keyword-in-ID approach.
  let interestHits = 0;
  if (user.interests.length > 0) {
    const boosts = getInterestCareerBoosts();
    for (const interest of user.interests) {
      const boostedCareers = boosts[interest];
      if (boostedCareers && boostedCareers.includes(career.careerId)) {
        interestHits++;
      }
    }
  }

  // Convert to 0-100 scale
  let matchPercent = Math.round(rawScore * 100);
  matchPercent += interestHits * MATCHING_CONFIG.interestBonus;

  // Popularity bonus — well-known careers nudged ahead of niche roles
  if (POPULAR_CAREERS.has(career.careerId)) {
    matchPercent += MATCHING_CONFIG.popularityBonus;
  }

  matchPercent = Math.max(0, Math.min(100, matchPercent));

  // Generate explanation
  const reasons = generateReasons(user, career, dimensions);

  return {
    career,
    matchPercent,
    baseMatchPercent: matchPercent,
    dimensions,
    reasons,
    tier: matchPercent >= 65 ? "strong" : matchPercent >= 45 ? "good" : "discovery",
    interestHits,
    isStretchMatch: false,
  };
}

// ── Dimension-specific similarity functions ───────────────────────

/**
 * Subject similarity: weighted overlap between user subjects and career relevance.
 * Returns 0-1 where 1 = perfect alignment.
 */
function computeSubjectSimilarity(
  userSubjects: Record<string, number>,
  careerRelevance: Record<string, number>,
): number {
  const subjectKeys = Object.keys(userSubjects);
  if (subjectKeys.length === 0) return 0.3; // No subjects → baseline

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [subject, userWeight] of Object.entries(userSubjects)) {
    const careerScore = careerRelevance[subject] ?? 0;
    weightedSum += userWeight * careerScore;
    totalWeight += userWeight;
  }

  if (totalWeight === 0) return 0.3;

  // Normalize by total weight so 5 subjects isn't automatically better than 2
  const normalized = weightedSum / totalWeight;

  // Apply a gentle curve: boost strong matches, compress weak ones
  // sqrt makes mid-range values more visible on the radar
  return Math.min(1, Math.sqrt(normalized));
}

/**
 * Work style fit: BEST-OF across all work dimensions.
 * User picks "desk + outdoors" → a career needs to match EITHER desk OR
 * outdoors well, not both. Previously used weighted average which
 * unfairly penalised hands-on careers (vet, nurse, marine biologist)
 * even for users who picked outdoors.
 */
function computeWorkStyleFit(
  user: UserMatchProfile,
  career: CareerMatchProfile,
): number {
  // For each dimension the user cares about (value > 0),
  // compute how well the career matches — then take the BEST fit.
  const dimPairs: [number, number][] = [
    [user.desk, career.desk],
    [user.handsOn, career.handsOn],
    [user.outdoors, career.outdoors],
    [user.creative, career.creative],
  ];

  let bestSim = 0;
  let anyPref = false;

  for (const [userVal, careerVal] of dimPairs) {
    if (userVal <= 0) continue; // User didn't select this style
    anyPref = true;
    // Similarity = how close the career's score on this dim is to the user's
    // Since both are 0-1, this gives 0 (worst) to 1 (best)
    const sim = 1 - Math.abs(userVal - careerVal);
    if (sim > bestSim) bestSim = sim;
  }

  if (!anyPref) return 0.5; // No preference expressed

  // Mixed careers (good fit for multiple styles) get a floor
  if (career.desk > 0.3 && career.handsOn > 0.3) {
    return Math.max(bestSim, 0.6); // Mixed careers never score below 0.6
  }

  return bestSim;
}

/**
 * Creative/analytical fit: inferred from subject choices.
 * STEM subjects → analytical lean. Arts/Drama → creative lean.
 * The career's creative and analytical scores are compared.
 */
function computeCreativeAnalyticalFit(
  user: UserMatchProfile,
  career: CareerMatchProfile,
): number {
  // Infer user's creative vs analytical lean from subjects
  const creativeSubjects = new Set([
    "art", "music", "drama", "media-studies", "design-tech",
  ]);
  const analyticalSubjects = new Set([
    "math", "physics", "chemistry", "computing", "biology",
  ]);

  let creativeSignal = 0;
  let analyticalSignal = 0;

  for (const [subject, weight] of Object.entries(user.subjects)) {
    if (creativeSubjects.has(subject)) creativeSignal += weight;
    if (analyticalSubjects.has(subject)) analyticalSignal += weight;
  }

  // Normalize to 0-1 spectrum (0 = pure analytical, 1 = pure creative)
  const totalSignal = creativeSignal + analyticalSignal;
  if (totalSignal === 0) return 0.5; // No signal → neutral

  const userLean = creativeSignal / totalSignal; // 0 = analytical, 1 = creative
  const careerLean = career.creative / (career.creative + career.analytical + 0.01);

  // Similarity: how close are they on the creative-analytical spectrum
  return 1 - Math.abs(userLean - careerLean);
}

/**
 * Academic fit: gentle bias toward accessible careers.
 * Not a gate — just a soft ranking signal.
 * Entry-level and moderate careers score higher.
 * Very demanding careers still appear but rank slightly lower.
 */
function computeAcademicFit(career: CareerMatchProfile): number {
  // Inverted demand: lower academic barrier = higher accessibility score.
  // This is a GENTLE nudge, not a barrier. The old curve bottomed out at
  // 0.29 for very-demanding careers, which quietly buried the exact
  // aspirational roles a STEM youth gets excited about — doctor, surgeon,
  // vet, lawyer all fell off the radar entirely behind less-demanding
  // peers. The floor is now high (0.6) and the slope shallow (0.4) so
  // accessible careers still get a small lift without exiling demanding
  // ones. (Verified: doctor/surgeon now recover ~4pts and re-enter view.)
  if (career.entryLevel) return 0.9;

  // low → 0.94, moderate → 0.84, strong → 0.72, very-strong → 0.62
  return Math.max(0.6, 1 - career.academicDemand * 0.4);
}

// ══════════════════════════════════════════════════════════════════
// 4. EXPLAINABILITY
// ══════════════════════════════════════════════════════════════════

/**
 * Generate 1-3 human-readable reason strings.
 * Based on actual scoring dimensions, not hallucinated.
 */
function generateReasons(
  user: UserMatchProfile,
  career: CareerMatchProfile,
  dimensions: DimensionScore[],
): string[] {
  const reasons: string[] = [];

  // Sort dimensions by contribution (highest first)
  const sorted = [...dimensions].sort((a, b) => b.contribution - a.contribution);

  for (const dim of sorted) {
    if (reasons.length >= 3) break;
    if (dim.similarity < 0.3) continue; // Skip weak dimensions

    const reason = dimensionToReason(dim, user, career);
    if (reason) reasons.push(reason);
  }

  // Fallback
  if (reasons.length === 0) {
    reasons.push("Broad career that could suit many interests");
  }

  return reasons;
}

function dimensionToReason(
  dim: DimensionScore,
  user: UserMatchProfile,
  career: CareerMatchProfile,
): string | null {
  switch (dim.dimension) {
    case "subject": {
      // Find the best-matching subjects
      const matchedSubjects: string[] = [];
      for (const [subj, weight] of Object.entries(user.subjects)) {
        if ((career.subjectRelevance[subj] ?? 0) >= 0.3) {
          matchedSubjects.push(SUBJECT_LABELS[subj] || subj);
        }
      }
      if (matchedSubjects.length === 0) return null;
      if (matchedSubjects.length <= 2) {
        return `Matches your interest in ${matchedSubjects.join(" and ")}`;
      }
      return `Matches ${matchedSubjects.length} of your subject choices`;
    }

    case "workStyle": {
      if (!user.hasWorkStylePreference) return null;
      // Find which style matched best
      const styles: [string, number, number][] = [
        ["desk", user.desk, career.desk],
        ["hands-on", user.handsOn, career.handsOn],
        ["outdoors", user.outdoors, career.outdoors],
        ["creative", user.creative, career.creative],
      ];
      const bestStyle = styles
        .filter(([, uv]) => uv > 0)
        .sort((a, b) => {
          const simA = 1 - Math.abs(a[1] - a[2]);
          const simB = 1 - Math.abs(b[1] - b[2]);
          return simB - simA;
        })[0];
      if (!bestStyle) return null;
      const label = WORK_STYLE_LABELS[bestStyle[0]] || bestStyle[0];
      return `${label} work, which you said you enjoy`;
    }

    case "people": {
      if (!user.hasPeoplePreference) return null;
      if (career.peopleOrientation >= 0.7) {
        return "Lots of people interaction — what you prefer";
      }
      if (career.peopleOrientation <= 0.3) {
        return "Mostly independent work — matches your preference";
      }
      return "A mix of teamwork and solo work";
    }

    case "creativeAnalytical": {
      if (career.creative > 0.6) return "Creative role that fits your style";
      if (career.analytical > 0.6) return "Analytical work that suits your subjects";
      return null;
    }

    case "variety":
      if (career.variety > 0.6) return "Varied work — no two days the same";
      return null;

    case "academic":
      if (career.entryLevel) return "Accessible pathway — no degree required";
      return null;

    default:
      return null;
  }
}

// ══════════════════════════════════════════════════════════════════
// 5. DIVERSITY LAYER
// ══════════════════════════════════════════════════════════════════

// Role-noun and broad-domain tokens that don't identify a distinct career
// family. Used by familyTokens() so "offshore-electrician" and
// "rig-electrician" are recognised as near-duplicates, while broad words
// like "health" don't falsely cluster unrelated healthcare roles.
const GENERIC_FAMILY_TOKENS = new Set([
  "engineer", "technician", "specialist", "manager", "developer", "analyst",
  "assistant", "contractor", "officer", "worker", "operator", "coordinator",
  "consultant", "advisor", "adviser", "administrator", "supervisor", "lead",
  "senior", "junior", "associate", "professional", "general", "services",
  "service", "health", "care", "medical", "clinical", "social", "and", "the",
]);

/** Significant tokens of a career id, used to detect near-duplicates. */
function familyTokens(careerId: string): string[] {
  return careerId
    .split("-")
    .filter((t) => t.length > 2 && !GENERIC_FAMILY_TOKENS.has(t));
}

/**
 * Diversity via honest score penalties.
 *
 * The previous version built a diverse selection and then re-sorted the
 * whole thing by RAW score at the very end — silently undoing its own
 * diversification. The result: the visible top band collapsed to one
 * category (e.g. 10/10 healthcare for an aspiring-doctor persona) and
 * stacked near-identical roles (six "offshore-*" jobs in a row for a
 * trades persona). The category cap also never bound the visible list,
 * because maxPerCat (13) exceeded the radar's display size (~10).
 *
 * Instead we walk the list in score order and DEMOTE redundancy directly
 * on the displayed match %:
 *   - category saturation: the 4th+ career from the same category is
 *     gently pushed down so adjacent categories can interleave
 *   - near-duplicate: a career sharing a significant token with a
 *     higher-ranked same-category career takes a larger hit
 *
 * Because we adjust the same number we display and then sort by it, the
 * list stays both monotonic (no "78% above 80%" artefacts) and diverse.
 */
function applyDiversity(
  results: MatchResult[],
  limit: number,
): MatchResult[] {
  const sorted = [...results].sort((a, b) => b.matchPercent - a.matchPercent);

  const catCount = new Map<string, number>();
  const catTokens = new Map<string, Set<string>>();

  for (const r of sorted) {
    const cat = r.career.category;
    const seen = catCount.get(cat) ?? 0;
    let penalty = 0;

    // Category saturation — only after a category already leads with a
    // healthy plurality (3), so a single-subject user keeps their primary
    // category on top without it claiming every visible slot.
    if (seen >= 3) penalty += Math.min(14, (seen - 2) * 2);

    // Near-duplicate suppression within the same category.
    const tokens = familyTokens(r.career.careerId);
    const tokenSet = catTokens.get(cat) ?? new Set<string>();
    if (tokens.some((t) => tokenSet.has(t))) penalty += 8;

    if (penalty > 0) {
      r.matchPercent = Math.max(0, r.matchPercent - penalty);
    }

    catCount.set(cat, seen + 1);
    for (const t of tokens) tokenSet.add(t);
    catTokens.set(cat, tokenSet);
  }

  // Re-rank by the adjusted (and displayed) score, then trim.
  const ranked = sorted.sort((a, b) => b.matchPercent - a.matchPercent);

  // Tag one exploratory pick just outside the strong band: a career that
  // scores high on a single dimension but didn't lead overall.
  const stretch = ranked
    .slice(8, limit)
    .find((r) => !r.isStretchMatch && r.dimensions.some((d) => d.similarity > 0.7));
  if (stretch) {
    stretch.isStretchMatch = true;
    stretch.tier = "discovery";
  }

  return ranked.slice(0, limit);
}

// ══════════════════════════════════════════════════════════════════
// 6. PUBLIC API — rankCareers
// ══════════════════════════════════════════════════════════════════

/**
 * Full matching pipeline: build profiles → score → diversity → sort.
 *
 * Returns Career[] in ranked order (same contract as old
 * getCareersFromDiscovery). The MatchResult details are available
 * via getMatchResultForCareer() after this call.
 */

// Store the last ranking's MatchResult data for tooltip/explanation access
let lastMatchResults = new Map<string, MatchResult>();

export function rankCareers(
  prefs: DiscoveryPreferences,
  limit = 80,
): Career[] {
  const C = MATCHING_CONFIG;
  const allCareers = getAllCareers();
  if (!allCareers.length) return [];

  const hasInput =
    (prefs.subjects && prefs.subjects.length > 0) ||
    (prefs.interests && prefs.interests.length > 0) ||
    (prefs.workStyles && prefs.workStyles.length > 0) ||
    !!prefs.peoplePref;

  if (!hasInput) return [];

  // Build user profile once
  const userProfile = buildUserProfile(prefs);

  // Hard filter: the user has explicitly opted out of university
  // routes. Applied before scoring so we don't waste compute on
  // rows we'll drop. Un-annotated careers (no entryRoute) pass
  // through — we don't hide anything we don't have data for.
  const candidates = prefs.excludeUniversity
    ? allCareers.filter((c) => !shouldExcludeByRoute(c, prefs))
    : allCareers;

  // Score every candidate
  const results: MatchResult[] = [];
  for (const career of candidates) {
    const careerProfile = buildCareerProfile(career);
    const result = scoreCareer(userProfile, careerProfile);

    // Grade-range adjustment. Applied as a sort-order nudge only:
    // the `baseMatchPercent` stays unchanged so the scoreFloor
    // filter below still respects how well the career matched on
    // subjects/interests/style — a reach career with a strong
    // base match stays visible, it just sinks below aligned peers.
    if (prefs.gradeRange) {
      const careerForBand = candidates.find((c) => c.id === career.id);
      if (careerForBand) {
        const match = matchCareerToGradeRange(careerForBand, prefs.gradeRange);
        if (match.status !== "unknown") {
          result.gradeStatus = match.status;
          result.gradeHint = match.coachingHint;
          const adj = gradeMatchScoreAdjustment(match.status);
          // Clamp to [0, 100] on the displayed percentage.
          result.matchPercent = Math.max(0, Math.min(100, result.matchPercent + adj));
        }
      }
    }

    results.push(result);
  }

  // Filter by floor using the BASE score (pre-grade-adjustment) so a
  // grade-penalised career with strong signal still surfaces.
  const passing = results.filter((r) => r.baseMatchPercent >= C.scoreFloor);

  if (passing.length === 0) return [];

  // When the user has given us very little to go on, gently bias toward
  // more accessible careers — but as a SCORE NUDGE applied before the
  // final sort, not a post-sort reshuffle. The old version re-sorted the
  // finished list purely by academic demand, which scrambled the
  // displayed percentages into a non-monotonic mess ("77%, 78%, 76%,
  // 75%, 74%…"). Folding it into the score keeps order == percentage.
  const signalStrength = measureSignalStrength(prefs);
  if (signalStrength <= 1) {
    for (const r of passing) {
      r.matchPercent = Math.min(
        100,
        r.matchPercent + Math.round((1 - r.career.academicDemand) * 4),
      );
    }
  }

  // Apply diversity (also performs the final score-ordered sort).
  const diverse = applyDiversity(passing, limit);

  // Store results for tooltip access
  lastMatchResults = new Map(diverse.map((r) => [r.career.careerId, r]));

  // Return Career objects (need to look up from allCareers).
  // Dedupe by career ID — every career must appear at most once.
  const careerMap = new Map(allCareers.map((c) => [c.id, c]));
  const seen = new Set<string>();
  const result: Career[] = [];
  for (const r of diverse) {
    const id = r.career.careerId;
    if (seen.has(id)) continue;
    const career = careerMap.get(id);
    if (!career) continue;
    seen.add(id);
    result.push(career);
  }
  return result;
}

/**
 * Get the MatchResult for a career from the last ranking.
 * Used by tooltips and explanation UI.
 */
export function getMatchResultForCareer(careerId: string): MatchResult | undefined {
  return lastMatchResults.get(careerId);
}

/**
 * Get match reasons for a career (same contract as old getMatchReasons).
 * Returns string[] of human-readable reasons.
 */
export function getMatchReasonsFromEngine(
  career: Career,
  prefs: DiscoveryPreferences | null | undefined,
): string[] {
  if (!prefs) return [];

  // Check cache first
  const cached = lastMatchResults.get(career.id);
  if (cached) return cached.reasons;

  // Compute fresh
  const userProfile = buildUserProfile(prefs);
  const careerProfile = buildCareerProfile(career);
  const result = scoreCareer(userProfile, careerProfile);
  return result.reasons;
}

/**
 * Debug helper: get full score breakdown for a career.
 * Same contract as old debugScoreCareer.
 */
export function debugScoreCareerV2(
  career: Career,
  prefs: DiscoveryPreferences,
): MatchResult {
  const userProfile = buildUserProfile(prefs);
  const careerProfile = buildCareerProfile(career);
  return scoreCareer(userProfile, careerProfile);
}
