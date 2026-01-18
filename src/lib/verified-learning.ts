/**
 * Verified Learning Recommendations System
 *
 * ACCURACY-FIRST APPROACH: Only surfaces courses and certifications that have been
 * verified as real, current, and appropriate for youth (16-20).
 *
 * HARD RULES:
 * - Never hallucinate courses, providers, or URLs
 * - If verification confidence is not HIGH, exclude the resource
 * - Prefer fewer, accurate items over many
 * - Return explicit "no results" when nothing meets quality bar
 *
 * LANGUAGE: English only.
 */

import { prisma } from "./prisma";
import {
  LearningProviderType,
  LearningDeliveryMode,
  LearningRegionScope,
  LearningCertificationType,
  LearningPrerequisiteLevel,
  LearningResourceStatus,
  Prisma,
} from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface VerifiedLearningResource {
  id: string;
  title: string;
  provider: string;
  providerType: LearningProviderType;
  deliveryMode: LearningDeliveryMode;
  regionScope: LearningRegionScope;
  regionDetails: string | null;
  language: string;
  duration: string;
  timeCommitmentHours: number | null;
  cost: string;
  costAmount: number | null;
  costCurrency: string | null;
  financialAidAvailable: boolean;
  certificationType: LearningCertificationType;
  recognisedBy: string[];
  industryValue: string | null;
  minimumAge: number | null;
  ageSuitability: string;
  prerequisiteLevel: LearningPrerequisiteLevel;
  prerequisiteDetails: string | null;
  relevantCareers: string[];
  relevantSkills: string[];
  officialUrl: string;
  status: LearningResourceStatus;
  lastVerifiedAt: Date | null;
  description: string | null;
  highlights: string[];
}

export interface LearningRecommendationResult {
  success: boolean;
  message: string;
  localRegional: VerifiedLearningResource[];
  international: VerifiedLearningResource[];
  totalCount: number;
  verificationNote: string;
}

export interface RecommendationFilters {
  careerGoals?: string[];
  userAge?: number;
  preferredLanguage?: string;
  includeInternational?: boolean;
  maxResults?: number;
}

// ============================================
// VERIFIED PROVIDER REGISTRY
// ============================================
// STRICT: Only providers we are confident exist and are trustworthy

export const VERIFIED_PROVIDERS: Record<
  string,
  {
    name: string;
    type: LearningProviderType;
    websiteBase: string;
    trustLevel: "HIGH" | "MEDIUM";
    notes: string;
  }
> = {
  // Major Online Platforms
  coursera: {
    name: "Coursera",
    type: "ONLINE_PLATFORM",
    websiteBase: "https://www.coursera.org",
    trustLevel: "HIGH",
    notes: "Major MOOC platform with university partnerships",
  },
  edx: {
    name: "edX",
    type: "ONLINE_PLATFORM",
    websiteBase: "https://www.edx.org",
    trustLevel: "HIGH",
    notes: "Major MOOC platform with university partnerships",
  },
  linkedin_learning: {
    name: "LinkedIn Learning",
    type: "ONLINE_PLATFORM",
    websiteBase: "https://www.linkedin.com/learning",
    trustLevel: "HIGH",
    notes: "Professional learning platform, good for workplace skills",
  },
  udemy: {
    name: "Udemy",
    type: "ONLINE_PLATFORM",
    websiteBase: "https://www.udemy.com",
    trustLevel: "MEDIUM",
    notes: "Only include courses with high enrollment and good ratings",
  },
  futurelearn: {
    name: "FutureLearn",
    type: "ONLINE_PLATFORM",
    websiteBase: "https://www.futurelearn.com",
    trustLevel: "HIGH",
    notes: "UK-based platform with university partnerships",
  },
  khan_academy: {
    name: "Khan Academy",
    type: "ONLINE_PLATFORM",
    websiteBase: "https://www.khanacademy.org",
    trustLevel: "HIGH",
    notes: "Free educational platform, excellent for foundational skills",
  },
  freecodecamp: {
    name: "freeCodeCamp",
    type: "ONLINE_PLATFORM",
    websiteBase: "https://www.freecodecamp.org",
    trustLevel: "HIGH",
    notes: "Free coding education, well-established",
  },
  codecademy: {
    name: "Codecademy",
    type: "ONLINE_PLATFORM",
    websiteBase: "https://www.codecademy.com",
    trustLevel: "HIGH",
    notes: "Interactive coding platform",
  },

  // Industry Certification Bodies
  google: {
    name: "Google Career Certificates",
    type: "INDUSTRY_CERT",
    websiteBase: "https://grow.google/certificates",
    trustLevel: "HIGH",
    notes: "Google-backed professional certificates",
  },
  microsoft_learn: {
    name: "Microsoft Learn",
    type: "INDUSTRY_CERT",
    websiteBase: "https://learn.microsoft.com",
    trustLevel: "HIGH",
    notes: "Official Microsoft training and certifications",
  },
  aws_training: {
    name: "AWS Training and Certification",
    type: "INDUSTRY_CERT",
    websiteBase: "https://aws.amazon.com/training",
    trustLevel: "HIGH",
    notes: "Official AWS cloud certifications",
  },
  comptia: {
    name: "CompTIA",
    type: "INDUSTRY_CERT",
    websiteBase: "https://www.comptia.org",
    trustLevel: "HIGH",
    notes: "Industry-standard IT certifications",
  },
  cisco: {
    name: "Cisco Networking Academy",
    type: "INDUSTRY_CERT",
    websiteBase: "https://www.netacad.com",
    trustLevel: "HIGH",
    notes: "Networking certifications and training",
  },
  hubspot: {
    name: "HubSpot Academy",
    type: "INDUSTRY_CERT",
    websiteBase: "https://academy.hubspot.com",
    trustLevel: "HIGH",
    notes: "Free marketing and sales certifications",
  },
  meta_blueprint: {
    name: "Meta Blueprint",
    type: "INDUSTRY_CERT",
    websiteBase: "https://www.facebookblueprint.com",
    trustLevel: "HIGH",
    notes: "Social media marketing certifications",
  },

  // Norwegian Public Bodies
  nav: {
    name: "NAV",
    type: "PUBLIC_BODY",
    websiteBase: "https://www.nav.no",
    trustLevel: "HIGH",
    notes: "Norwegian Labour and Welfare Administration",
  },
  utdanning_no: {
    name: "Utdanning.no",
    type: "PUBLIC_BODY",
    websiteBase: "https://utdanning.no",
    trustLevel: "HIGH",
    notes: "Norwegian education portal",
  },
  kompetanse_norge: {
    name: "Kompetanse Norge / HK-dir",
    type: "PUBLIC_BODY",
    websiteBase: "https://www.kompetansenorge.no",
    trustLevel: "HIGH",
    notes: "Norwegian skills development agency",
  },
};

// ============================================
// URL VALIDATION
// ============================================

/**
 * Validates that a URL is from a known, trusted provider
 * This is a critical guardrail against hallucinated URLs
 */
export function isValidProviderUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check against known provider domains
    const trustedDomains = [
      "coursera.org",
      "edx.org",
      "linkedin.com",
      "udemy.com",
      "futurelearn.com",
      "khanacademy.org",
      "freecodecamp.org",
      "codecademy.com",
      "grow.google",
      "google.com",
      "learn.microsoft.com",
      "microsoft.com",
      "aws.amazon.com",
      "amazon.com",
      "comptia.org",
      "netacad.com",
      "cisco.com",
      "academy.hubspot.com",
      "hubspot.com",
      "facebookblueprint.com",
      "meta.com",
      "nav.no",
      "utdanning.no",
      "kompetansenorge.no",
      "hkdir.no",
      // Universities (selective list of major ones)
      "ntnu.no",
      "uio.no",
      "uib.no",
      "harvard.edu",
      "mit.edu",
      "stanford.edu",
      "ox.ac.uk",
      "cam.ac.uk",
    ];

    return trustedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validates a provider name against our registry
 */
export function isVerifiedProvider(providerName: string): boolean {
  const normalizedName = providerName.toLowerCase().replace(/\s+/g, "_");
  return (
    normalizedName in VERIFIED_PROVIDERS ||
    Object.values(VERIFIED_PROVIDERS).some(
      (p) => p.name.toLowerCase() === providerName.toLowerCase()
    )
  );
}

// ============================================
// AGE SUITABILITY CHECK
// ============================================

/**
 * Checks if a resource is suitable for a given age
 * Returns { suitable: boolean, reason?: string }
 */
export function checkAgeSuitability(
  resource: {
    minimumAge: number | null;
    ageSuitability: string;
    prerequisiteLevel: LearningPrerequisiteLevel;
  },
  userAge: number
): { suitable: boolean; reason?: string } {
  // Check explicit minimum age
  if (resource.minimumAge && userAge < resource.minimumAge) {
    return {
      suitable: false,
      reason: `Requires minimum age of ${resource.minimumAge}`,
    };
  }

  // Parse age suitability string
  const ageSuitability = resource.ageSuitability.toLowerCase();
  if (ageSuitability.includes("18+") && userAge < 18) {
    return { suitable: false, reason: "Requires age 18 or older" };
  }
  if (ageSuitability.includes("21+") && userAge < 21) {
    return { suitable: false, reason: "Requires age 21 or older" };
  }

  // Advanced prerequisites might not be suitable for youth
  if (
    resource.prerequisiteLevel === "ADVANCED" &&
    userAge < 18
  ) {
    return {
      suitable: true,
      reason: "Advanced level - may require significant prior knowledge",
    };
  }

  return { suitable: true };
}

// ============================================
// RECOMMENDATION GENERATION
// ============================================

/**
 * Get verified learning recommendations for a user
 *
 * ACCURACY RULES:
 * - Only returns resources with status = VERIFIED
 * - Filters by age suitability
 * - Prefers local/regional options first
 * - Returns empty result with clear message if nothing matches
 */
export async function getVerifiedLearningRecommendations(
  filters: RecommendationFilters
): Promise<LearningRecommendationResult> {
  const {
    careerGoals = [],
    userAge = 18,
    preferredLanguage = "en",
    includeInternational = true,
    maxResults = 7,
  } = filters;

  // CRITICAL: Only query VERIFIED resources
  const baseWhere: Prisma.VerifiedLearningResourceWhereInput = {
    status: "VERIFIED",
    // Verification must be recent (within 90 days)
    lastVerifiedAt: {
      gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
  };

  // Build career relevance filter
  if (careerGoals.length > 0) {
    baseWhere.relevantCareers = {
      hasSome: careerGoals,
    };
  }

  // Query local/regional resources first
  const localResources = await prisma.verifiedLearningResource.findMany({
    where: {
      ...baseWhere,
      regionScope: { in: ["LOCAL", "REGIONAL"] },
    },
    orderBy: [{ lastVerifiedAt: "desc" }, { title: "asc" }],
    take: maxResults,
  });

  // Query international resources
  let internationalResources: typeof localResources = [];
  if (includeInternational) {
    internationalResources = await prisma.verifiedLearningResource.findMany({
      where: {
        ...baseWhere,
        regionScope: "INTERNATIONAL",
      },
      orderBy: [{ lastVerifiedAt: "desc" }, { title: "asc" }],
      take: maxResults,
    });
  }

  // Filter by age suitability
  const filteredLocal = localResources.filter((r) => {
    const check = checkAgeSuitability(
      {
        minimumAge: r.minimumAge,
        ageSuitability: r.ageSuitability,
        prerequisiteLevel: r.prerequisiteLevel,
      },
      userAge
    );
    return check.suitable;
  });

  const filteredInternational = internationalResources.filter((r) => {
    const check = checkAgeSuitability(
      {
        minimumAge: r.minimumAge,
        ageSuitability: r.ageSuitability,
        prerequisiteLevel: r.prerequisiteLevel,
      },
      userAge
    );
    return check.suitable;
  });

  // Transform to output format
  const mapResource = (r: typeof localResources[0]): VerifiedLearningResource => ({
    id: r.id,
    title: r.title,
    provider: r.provider,
    providerType: r.providerType,
    deliveryMode: r.deliveryMode,
    regionScope: r.regionScope,
    regionDetails: r.regionDetails,
    language: r.language,
    duration: r.duration,
    timeCommitmentHours: r.timeCommitmentHours,
    cost: r.cost,
    costAmount: r.costAmount ? Number(r.costAmount) : null,
    costCurrency: r.costCurrency,
    financialAidAvailable: r.financialAidAvailable,
    certificationType: r.certificationType,
    recognisedBy: r.recognisedBy,
    industryValue: r.industryValue,
    minimumAge: r.minimumAge,
    ageSuitability: r.ageSuitability,
    prerequisiteLevel: r.prerequisiteLevel,
    prerequisiteDetails: r.prerequisiteDetails,
    relevantCareers: r.relevantCareers,
    relevantSkills: r.relevantSkills,
    officialUrl: r.officialUrl,
    status: r.status,
    lastVerifiedAt: r.lastVerifiedAt,
    description: r.description,
    highlights: r.highlights,
  });

  const localMapped = filteredLocal.map(mapResource);
  const internationalMapped = filteredInternational.map(mapResource);
  const totalCount = localMapped.length + internationalMapped.length;

  // Build result with appropriate messaging
  if (totalCount === 0) {
    return {
      success: false,
      message:
        "No verified courses were found that meet accuracy, age, and relevance requirements at this time.",
      localRegional: [],
      international: [],
      totalCount: 0,
      verificationNote:
        "We only show courses that have been independently verified as real and currently available. Check back later or explore foundational skills.",
    };
  }

  let message = "These recommendations are based on verified providers and current offerings.";
  if (localMapped.length === 0 && internationalMapped.length > 0) {
    message +=
      " Local options are limited for this career path, so we've included international online courses.";
  }

  return {
    success: true,
    message,
    localRegional: localMapped.slice(0, maxResults),
    international: internationalMapped.slice(0, maxResults),
    totalCount,
    verificationNote: "All resources verified within the last 90 days.",
  };
}

// ============================================
// VERIFICATION FUNCTIONS
// ============================================

/**
 * Mark resources as needing re-verification after 90 days
 * Should be run as a scheduled job
 */
export async function markStaleResourcesForVerification(): Promise<number> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const result = await prisma.verifiedLearningResource.updateMany({
    where: {
      status: "VERIFIED",
      lastVerifiedAt: {
        lt: ninetyDaysAgo,
      },
    },
    data: {
      status: "PENDING_VERIFICATION",
    },
  });

  return result.count;
}

/**
 * Get resources that need verification
 */
export async function getResourcesNeedingVerification(): Promise<
  { id: string; title: string; provider: string; officialUrl: string }[]
> {
  return prisma.verifiedLearningResource.findMany({
    where: {
      status: "PENDING_VERIFICATION",
    },
    select: {
      id: true,
      title: true,
      provider: true,
      officialUrl: true,
    },
    orderBy: { lastVerifiedAt: "asc" },
    take: 50,
  });
}

/**
 * Update verification status for a resource
 * Called after manual or automated verification
 */
export async function updateResourceVerification(
  resourceId: string,
  verified: boolean,
  notes?: string
): Promise<void> {
  await prisma.verifiedLearningResource.update({
    where: { id: resourceId },
    data: {
      status: verified ? "VERIFIED" : "VERIFICATION_FAILED",
      lastVerifiedAt: verified ? new Date() : undefined,
      verificationNotes: notes,
      verificationSource: "manual",
    },
  });
}

// ============================================
// SEED DATA HELPER
// ============================================

/**
 * Validates a learning resource before insertion
 * Returns { valid: boolean, errors: string[] }
 */
export function validateLearningResource(resource: {
  title: string;
  provider: string;
  officialUrl: string;
  ageSuitability: string;
  minimumAge?: number | null;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check provider
  if (!isVerifiedProvider(resource.provider)) {
    errors.push(`Provider "${resource.provider}" is not in the verified registry`);
  }

  // Check URL
  if (!isValidProviderUrl(resource.officialUrl)) {
    errors.push(`URL "${resource.officialUrl}" is not from a trusted domain`);
  }

  // Check for empty fields
  if (!resource.title || resource.title.trim().length < 3) {
    errors.push("Title is required and must be at least 3 characters");
  }

  // Check age suitability format
  const validAgeSuitabilities = [
    "All ages",
    "13+",
    "16+",
    "18+",
    "21+",
    "Beginner-friendly",
  ];
  if (
    !validAgeSuitabilities.some((s) =>
      resource.ageSuitability.toLowerCase().includes(s.toLowerCase())
    )
  ) {
    errors.push(
      `Age suitability "${resource.ageSuitability}" is not in expected format`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// CONSTANTS
// ============================================

export const LEARNING_VERIFICATION_CADENCE_DAYS = 90;

export const NO_RESULTS_MESSAGE =
  "No verified courses were found that meet accuracy, age, and relevance requirements at this time.";

export const NO_RESULTS_NEXT_STEPS = [
  "Check back later as we regularly verify new courses",
  "Explore foundational skills on Khan Academy or freeCodeCamp",
  "Search Utdanning.no for Norwegian education options",
];
