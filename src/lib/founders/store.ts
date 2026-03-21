/**
 * Founder Spotlights data store
 *
 * Uses JSON file storage with schema validation.
 * All spotlights require verified source URLs before being shown in production.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  FounderSpotlight,
  FounderSpotlightInput,
  FounderSpotlightTag,
  FounderStoreMetadata,
  MicroVentureIdea,
  ValidationError,
} from "./types";
import { verifySourceUrl, verifyMultipleUrls } from "./verifySourceUrl";

const DATA_DIR = path.join(process.cwd(), "data", "founders");
const SPOTLIGHTS_FILE = path.join(DATA_DIR, "spotlights.json");
const METADATA_FILE = path.join(DATA_DIR, "metadata.json");

/**
 * Ensure data directory and files exist
 */
function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(SPOTLIGHTS_FILE)) {
    fs.writeFileSync(SPOTLIGHTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  if (!fs.existsSync(METADATA_FILE)) {
    const initialMetadata: FounderStoreMetadata = {
      lastRefreshISO: new Date().toISOString(),
      totalSpotlights: 0,
      verifiedCount: 0,
      pendingCount: 0,
      failedCount: 0,
    };
    fs.writeFileSync(METADATA_FILE, JSON.stringify(initialMetadata, null, 2), "utf-8");
  }
}

/**
 * Load all spotlights from store
 */
export function loadSpotlights(): FounderSpotlight[] {
  ensureStore();
  try {
    const data = fs.readFileSync(SPOTLIGHTS_FILE, "utf-8");
    return JSON.parse(data) as FounderSpotlight[];
  } catch (error) {
    console.error("[founders] Failed to load spotlights:", error);
    return [];
  }
}

/**
 * Save spotlights to store
 */
function saveSpotlights(spotlights: FounderSpotlight[]): void {
  ensureStore();
  fs.writeFileSync(SPOTLIGHTS_FILE, JSON.stringify(spotlights, null, 2), "utf-8");
  updateMetadata(spotlights);
}

/**
 * Update metadata based on current spotlights
 */
function updateMetadata(spotlights: FounderSpotlight[]): void {
  const metadata: FounderStoreMetadata = {
    lastRefreshISO: new Date().toISOString(),
    totalSpotlights: spotlights.length,
    verifiedCount: spotlights.filter((s) => s.verified).length,
    pendingCount: spotlights.filter((s) => !s.verified && !s.checkFailReason).length,
    failedCount: spotlights.filter((s) => !s.verified && s.checkFailReason).length,
  };
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), "utf-8");
}

/**
 * Load store metadata
 */
export function loadMetadata(): FounderStoreMetadata {
  ensureStore();
  try {
    const data = fs.readFileSync(METADATA_FILE, "utf-8");
    return JSON.parse(data) as FounderStoreMetadata;
  } catch (error) {
    console.error("[founders] Failed to load metadata:", error);
    return {
      lastRefreshISO: new Date().toISOString(),
      totalSpotlights: 0,
      verifiedCount: 0,
      pendingCount: 0,
      failedCount: 0,
    };
  }
}

/**
 * Validate spotlight input
 */
export function validateSpotlightInput(input: FounderSpotlightInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.title || input.title.trim().length < 5) {
    errors.push({ field: "title", message: "Title must be at least 5 characters" });
  }

  if (!input.founderName || input.founderName.trim().length < 2) {
    errors.push({ field: "founderName", message: "Founder name is required" });
  }

  if (input.founderAgeAtStart !== undefined) {
    if (input.founderAgeAtStart < 10 || input.founderAgeAtStart > 100) {
      errors.push({
        field: "founderAgeAtStart",
        message: "Age must be between 10 and 100 if provided",
      });
    }
  }

  if (!input.whatTheyBuilt || input.whatTheyBuilt.trim().length < 10) {
    errors.push({
      field: "whatTheyBuilt",
      message: "What they built description must be at least 10 characters",
    });
  }

  if (!input.whyItMatters || input.whyItMatters.trim().length < 10) {
    errors.push({
      field: "whyItMatters",
      message: "Why it matters must be at least 10 characters",
    });
  }

  if (!input.keyLesson || input.keyLesson.trim().length < 10) {
    errors.push({
      field: "keyLesson",
      message: "Key lesson must be at least 10 characters",
    });
  }

  if (!input.sourceName || input.sourceName.trim().length < 2) {
    errors.push({ field: "sourceName", message: "Source name is required" });
  }

  if (!input.sourceUrl) {
    errors.push({ field: "sourceUrl", message: "Source URL is required" });
  } else if (!input.sourceUrl.startsWith("https://")) {
    errors.push({ field: "sourceUrl", message: "Source URL must use HTTPS" });
  }

  if (input.publishedDateISO) {
    const date = new Date(input.publishedDateISO);
    if (isNaN(date.getTime())) {
      errors.push({ field: "publishedDateISO", message: "Invalid date format" });
    }
  }

  return errors;
}

/**
 * Add a new spotlight (admin only)
 */
export async function addSpotlight(
  input: FounderSpotlightInput,
  addedBy?: string
): Promise<{ spotlight?: FounderSpotlight; errors?: ValidationError[] }> {
  // Validate input
  const errors = validateSpotlightInput(input);
  if (errors.length > 0) {
    return { errors };
  }

  // Verify source URL
  const verification = await verifySourceUrl(input.sourceUrl);

  const now = new Date().toISOString();

  const spotlight: FounderSpotlight = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    founderName: input.founderName.trim(),
    founderAgeAtStart: input.founderAgeAtStart,
    country: input.country?.trim(),
    whatTheyBuilt: input.whatTheyBuilt.trim(),
    whyItMatters: input.whyItMatters.trim(),
    keyLesson: input.keyLesson.trim(),
    sourceName: input.sourceName.trim(),
    sourceUrl: input.sourceUrl.trim(),
    publishedDateISO: input.publishedDateISO,
    tags: input.tags || [],
    verified: verification.ok,
    verifiedAtISO: verification.ok ? verification.checkedAtISO : undefined,
    addedAtISO: now,
    addedBy,
    lastCheckedAtISO: verification.checkedAtISO,
    checkFailReason: verification.ok ? undefined : verification.error,
  };

  const spotlights = loadSpotlights();
  spotlights.push(spotlight);
  saveSpotlights(spotlights);

  return { spotlight };
}

/**
 * Update an existing spotlight (admin only)
 */
export async function updateSpotlight(
  id: string,
  input: Partial<FounderSpotlightInput>
): Promise<{ spotlight?: FounderSpotlight; errors?: ValidationError[]; notFound?: boolean }> {
  const spotlights = loadSpotlights();
  const index = spotlights.findIndex((s) => s.id === id);

  if (index === -1) {
    return { notFound: true };
  }

  const existing = spotlights[index];

  // Merge with existing
  const merged: FounderSpotlightInput = {
    title: input.title ?? existing.title,
    founderName: input.founderName ?? existing.founderName,
    founderAgeAtStart: input.founderAgeAtStart ?? existing.founderAgeAtStart,
    country: input.country ?? existing.country,
    whatTheyBuilt: input.whatTheyBuilt ?? existing.whatTheyBuilt,
    whyItMatters: input.whyItMatters ?? existing.whyItMatters,
    keyLesson: input.keyLesson ?? existing.keyLesson,
    sourceName: input.sourceName ?? existing.sourceName,
    sourceUrl: input.sourceUrl ?? existing.sourceUrl,
    publishedDateISO: input.publishedDateISO ?? existing.publishedDateISO,
    tags: input.tags ?? existing.tags,
  };

  // Validate merged input
  const errors = validateSpotlightInput(merged);
  if (errors.length > 0) {
    return { errors };
  }

  // Re-verify URL if changed
  let verified = existing.verified;
  let verifiedAtISO = existing.verifiedAtISO;
  let lastCheckedAtISO = existing.lastCheckedAtISO;
  let checkFailReason = existing.checkFailReason;

  if (input.sourceUrl && input.sourceUrl !== existing.sourceUrl) {
    const verification = await verifySourceUrl(input.sourceUrl);
    verified = verification.ok;
    verifiedAtISO = verification.ok ? verification.checkedAtISO : undefined;
    lastCheckedAtISO = verification.checkedAtISO;
    checkFailReason = verification.ok ? undefined : verification.error;
  }

  const updated: FounderSpotlight = {
    ...existing,
    ...merged,
    verified,
    verifiedAtISO,
    lastCheckedAtISO,
    checkFailReason,
  };

  spotlights[index] = updated;
  saveSpotlights(spotlights);

  return { spotlight: updated };
}

/**
 * Delete a spotlight (admin only)
 */
export function deleteSpotlight(id: string): boolean {
  const spotlights = loadSpotlights();
  const index = spotlights.findIndex((s) => s.id === id);

  if (index === -1) {
    return false;
  }

  spotlights.splice(index, 1);
  saveSpotlights(spotlights);

  return true;
}

/**
 * Get verified spotlights only (for production display)
 */
export function getVerifiedSpotlights(options?: {
  tags?: FounderSpotlightTag[];
  country?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): {
  spotlights: FounderSpotlight[];
  total: number;
  availableTags: FounderSpotlightTag[];
  availableCountries: string[];
} {
  let spotlights = loadSpotlights().filter((s) => s.verified);

  // Collect available filters from verified spotlights
  const availableTags = [
    ...new Set(spotlights.flatMap((s) => s.tags || [])),
  ] as FounderSpotlightTag[];
  const availableCountries = [...new Set(spotlights.map((s) => s.country).filter(Boolean))] as string[];

  // Apply filters
  if (options?.tags && options.tags.length > 0) {
    spotlights = spotlights.filter((s) =>
      options.tags!.some((tag) => s.tags?.includes(tag))
    );
  }

  if (options?.country) {
    spotlights = spotlights.filter(
      (s) => s.country?.toLowerCase() === options.country!.toLowerCase()
    );
  }

  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    spotlights = spotlights.filter(
      (s) =>
        s.title.toLowerCase().includes(searchLower) ||
        s.founderName.toLowerCase().includes(searchLower) ||
        s.whatTheyBuilt.toLowerCase().includes(searchLower) ||
        s.keyLesson.toLowerCase().includes(searchLower)
    );
  }

  // Sort by added date (newest first)
  spotlights.sort(
    (a, b) => new Date(b.addedAtISO).getTime() - new Date(a.addedAtISO).getTime()
  );

  const total = spotlights.length;

  // Apply pagination
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 9;
  const startIndex = (page - 1) * pageSize;
  spotlights = spotlights.slice(startIndex, startIndex + pageSize);

  return { spotlights, total, availableTags, availableCountries };
}

/**
 * Re-verify all spotlight URLs
 */
export async function reverifyAllSpotlights(): Promise<{
  verified: number;
  failed: number;
  unchanged: number;
}> {
  const spotlights = loadSpotlights();
  const urls = spotlights.map((s) => s.sourceUrl);

  const results = await verifyMultipleUrls(urls);

  let verified = 0;
  let failed = 0;
  let unchanged = 0;

  for (const spotlight of spotlights) {
    const result = results.get(spotlight.sourceUrl);
    if (!result) continue;

    const wasVerified = spotlight.verified;
    spotlight.verified = result.ok;
    spotlight.lastCheckedAtISO = result.checkedAtISO;

    if (result.ok) {
      spotlight.verifiedAtISO = result.checkedAtISO;
      spotlight.checkFailReason = undefined;
      if (!wasVerified) verified++;
      else unchanged++;
    } else {
      spotlight.checkFailReason = result.error;
      if (wasVerified) failed++;
      else unchanged++;
    }
  }

  saveSpotlights(spotlights);

  return { verified, failed, unchanged };
}

/**
 * Micro-venture ideas (generic inspiration, NOT real stories)
 */
export const MICRO_VENTURE_IDEAS: MicroVentureIdea[] = [
  {
    id: "tutoring",
    title: "Tutoring Service",
    description: "Help younger students with subjects you excel in. Start with friends and family referrals.",
    skillsNeeded: ["Subject knowledge", "Communication", "Patience"],
    startupCost: "free",
    timeCommitment: "flexible",
    category: "service",
  },
  {
    id: "pet-care",
    title: "Pet Sitting & Dog Walking",
    description: "Care for pets in your neighborhood while owners are away or busy.",
    skillsNeeded: ["Animal handling", "Reliability", "Basic scheduling"],
    startupCost: "free",
    timeCommitment: "flexible",
    category: "service",
  },
  {
    id: "social-media-help",
    title: "Social Media Assistance",
    description: "Help local businesses manage their social media presence with basic posting and engagement.",
    skillsNeeded: ["Social media familiarity", "Basic design", "Writing"],
    startupCost: "free",
    timeCommitment: "part-time",
    category: "digital",
  },
  {
    id: "template-design",
    title: "Template Design",
    description: "Create templates for presentations, resumes, or social media that others can purchase and customize.",
    skillsNeeded: ["Design software", "Creativity", "Attention to detail"],
    startupCost: "low",
    timeCommitment: "flexible",
    category: "creative",
  },
  {
    id: "video-editing",
    title: "Video Editing Services",
    description: "Edit videos for content creators, small businesses, or events using free or affordable software.",
    skillsNeeded: ["Video editing", "Storytelling", "Technical skills"],
    startupCost: "low",
    timeCommitment: "part-time",
    category: "creative",
  },
  {
    id: "lawn-care",
    title: "Lawn & Garden Care",
    description: "Offer mowing, weeding, and basic landscaping services to neighbors.",
    skillsNeeded: ["Physical stamina", "Basic equipment use", "Time management"],
    startupCost: "medium",
    timeCommitment: "part-time",
    category: "local",
  },
  {
    id: "resale-flipping",
    title: "Reselling & Flipping",
    description: "Find undervalued items at thrift stores or sales and resell online for profit.",
    skillsNeeded: ["Market research", "Photography", "Negotiation"],
    startupCost: "low",
    timeCommitment: "flexible",
    category: "service",
  },
  {
    id: "simple-app",
    title: "Simple App or Tool",
    description: "Build a basic mobile app or web tool that solves a specific problem you or others face.",
    skillsNeeded: ["Programming basics", "Problem-solving", "User focus"],
    startupCost: "free",
    timeCommitment: "dedicated",
    category: "digital",
  },
  {
    id: "content-writing",
    title: "Content Writing",
    description: "Write blog posts, product descriptions, or newsletter content for businesses.",
    skillsNeeded: ["Writing", "Research", "SEO basics"],
    startupCost: "free",
    timeCommitment: "flexible",
    category: "digital",
  },
  {
    id: "event-assistance",
    title: "Event Assistance",
    description: "Help with setup, coordination, and cleanup for local events, parties, or weddings.",
    skillsNeeded: ["Organization", "Physical stamina", "Problem-solving"],
    startupCost: "free",
    timeCommitment: "flexible",
    category: "service",
  },
  {
    id: "handmade-crafts",
    title: "Handmade Crafts",
    description: "Create and sell handmade items like jewelry, candles, or artwork at markets or online.",
    skillsNeeded: ["Crafting skills", "Photography", "Marketing basics"],
    startupCost: "low",
    timeCommitment: "flexible",
    category: "creative",
  },
  {
    id: "car-detailing",
    title: "Mobile Car Detailing",
    description: "Wash and detail cars at customers' homes with basic supplies and dedication to quality.",
    skillsNeeded: ["Attention to detail", "Physical stamina", "Customer service"],
    startupCost: "medium",
    timeCommitment: "part-time",
    category: "local",
  },
];

/**
 * Reality check points for entrepreneurship
 */
export const ENTREPRENEURSHIP_REALITY_CHECKS = [
  {
    id: "income-variability",
    point: "Income can be unpredictable",
    detail: "Unlike a regular job, earnings may vary significantly month to month, especially when starting out.",
  },
  {
    id: "time-investment",
    point: "It takes real time and effort",
    detail: "Building something valuable requires consistent work. Quick results are rare.",
  },
  {
    id: "learning-curve",
    point: "You'll need to learn many things",
    detail: "Marketing, finances, customer service, and more. Be ready to develop new skills.",
  },
  {
    id: "mistakes-happen",
    point: "Mistakes are part of the process",
    detail: "Every entrepreneur makes errors. The key is learning from them and adapting.",
  },
  {
    id: "support-matters",
    point: "Support networks help",
    detail: "Having mentors, family support, or a community makes the journey easier.",
  },
  {
    id: "not-for-everyone",
    point: "It's one path among many",
    detail: "Entrepreneurship is valuable but not the only way to succeed. Employment offers its own benefits.",
  },
];
