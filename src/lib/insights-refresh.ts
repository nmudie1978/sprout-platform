/**
 * Industry Insights Verify & Refresh System
 *
 * 90-day quarterly verification system for Industry Insights content.
 * Modules are independently verified and only regenerated when material changes occur.
 *
 * LANGUAGE POLICY: All renderedSummary content must be English-only.
 */

import { prisma } from "./prisma";
import { InsightsModuleStatus, Prisma } from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ModuleData {
  dataJson: Record<string, unknown>;
  sourceMeta: {
    provider: string;
    fetchedAt: string;
    urls?: string[];
  };
}

export interface DeltaResult {
  hasSignificantChange: boolean;
  changeDetails: Record<string, unknown>;
}

export interface ModuleConfig {
  key: string;
  title: string;
  description?: string;
  refreshCadenceDays: number;
  changeThreshold: Record<string, number>;
}

// ============================================
// MODULE CONFIGURATIONS (Cadence Defaults)
// ============================================

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    key: "top_industries",
    title: "Growing Industries",
    description: "Top industries with job growth for young workers",
    refreshCadenceDays: 365, // Annual - industry trends change slowly
    changeThreshold: { rankShift: 2, growthPctChange: 5 },
  },
  {
    key: "hot_roles",
    title: "In-Demand Roles",
    description: "Hottest job roles across industries",
    refreshCadenceDays: 90, // Quarterly - roles shift faster
    changeThreshold: { listDiffPct: 25, rankShift: 3 },
  },
  {
    key: "skills_trends",
    title: "Skills in Demand",
    description: "Most sought-after skills by employers",
    refreshCadenceDays: 90, // Quarterly - skills evolve
    changeThreshold: { demandChange: 10, listDiffPct: 20 },
  },
  {
    key: "salary_bands",
    title: "Salary Ranges",
    description: "Typical salary ranges by industry and role",
    refreshCadenceDays: 180, // Bi-annual - salaries are stable
    changeThreshold: { salaryPct: 10 },
  },
  {
    key: "ai_impact",
    title: "AI & Automation Impact",
    description: "How AI is changing the job market",
    refreshCadenceDays: 90, // Quarterly - AI news moves fast
    changeThreshold: { statChange: 15, newInsights: 1 },
  },
  {
    key: "regional_insights",
    title: "Regional Job Market",
    description: "Local job market trends and opportunities",
    refreshCadenceDays: 180, // Bi-annual
    changeThreshold: { sectorChange: 2, payChange: 10 },
  },
  {
    key: "resources_links",
    title: "Learning Resources",
    description: "Free courses, certifications, and resources",
    refreshCadenceDays: 90, // Quarterly - links can break
    changeThreshold: { brokenLinks: 1, newResources: 2 },
  },
  {
    key: "whats_new",
    title: "What's New",
    description: "Latest news and updates in the job market",
    refreshCadenceDays: 90, // Quarterly
    changeThreshold: { newItems: 1 },
  },
];

// ============================================
// DATA PROVIDER INTERFACE
// ============================================

export interface IndustryDataProvider {
  name: string;
  getLatest(moduleKey: string): Promise<ModuleData | null>;
}

// ============================================
// MOCK PROVIDER (for MVP testing)
// ============================================

export class MockProvider implements IndustryDataProvider {
  name = "MockProvider";

  async getLatest(moduleKey: string): Promise<ModuleData | null> {
    const now = new Date().toISOString();

    switch (moduleKey) {
      case "top_industries":
        return {
          dataJson: {
            industries: [
              {
                id: "tech",
                name: "Technology & AI",
                growth: "+23%",
                rank: 1,
                jobs: ["Developer", "Data Analyst", "AI Specialist", "IT Support"],
                avgSalary: "$60-90k",
                remoteScore: 95,
              },
              {
                id: "green",
                name: "Green Energy & Maritime",
                growth: "+20%",
                rank: 2,
                jobs: ["Wind Turbine Technician", "Electrician", "Marine Mechanic"],
                avgSalary: "$55-75k",
                remoteScore: 20,
              },
              {
                id: "health",
                name: "Healthcare",
                growth: "+18%",
                rank: 3,
                jobs: ["Healthcare Worker", "Nurse", "Pharmacy Assistant"],
                avgSalary: "$45-70k",
                remoteScore: 15,
              },
              {
                id: "creative",
                name: "Creative Services",
                growth: "+14%",
                rank: 4,
                jobs: ["Content Creator", "Graphic Designer", "Video Editor"],
                avgSalary: "$40-65k",
                remoteScore: 85,
              },
            ],
            lastUpdated: "January 2026",
          },
          sourceMeta: {
            provider: this.name,
            fetchedAt: now,
            urls: ["https://www.bls.gov", "https://www.weforum.org"],
          },
        };

      case "hot_roles":
        return {
          dataJson: {
            roles: [
              { title: "Software Developer", industry: "tech", demand: 95, trend: "up" },
              { title: "Data Analyst", industry: "tech", demand: 88, trend: "up" },
              { title: "Wind Turbine Technician", industry: "green", demand: 85, trend: "up" },
              { title: "Registered Nurse", industry: "health", demand: 92, trend: "stable" },
              { title: "UX Designer", industry: "creative", demand: 78, trend: "up" },
              { title: "AI/ML Engineer", industry: "tech", demand: 90, trend: "up" },
              { title: "Healthcare Assistant", industry: "health", demand: 86, trend: "stable" },
              { title: "Content Creator", industry: "creative", demand: 72, trend: "up" },
            ],
          },
          sourceMeta: {
            provider: this.name,
            fetchedAt: now,
          },
        };

      case "skills_trends":
        return {
          dataJson: {
            skills: [
              { skill: "Digital Literacy", demand: 95, category: "Essential" },
              { skill: "Communication", demand: 92, category: "Essential" },
              { skill: "Problem Solving", demand: 88, category: "Essential" },
              { skill: "AI Tools (ChatGPT, etc)", demand: 85, category: "Emerging" },
              { skill: "Basic Coding", demand: 78, category: "Technical" },
              { skill: "Data Analysis", demand: 72, category: "Technical" },
              { skill: "Social Media Marketing", demand: 68, category: "Creative" },
              { skill: "Customer Service", demand: 90, category: "Essential" },
            ],
          },
          sourceMeta: {
            provider: this.name,
            fetchedAt: now,
            urls: ["https://www.nav.no", "https://www.nho.no"],
          },
        };

      case "salary_bands":
        return {
          dataJson: {
            bands: [
              { industry: "tech", entry: "$50-65k", mid: "$70-100k", senior: "$100-150k" },
              { industry: "green", entry: "$45-55k", mid: "$60-80k", senior: "$80-110k" },
              { industry: "health", entry: "$40-50k", mid: "$55-75k", senior: "$75-100k" },
              { industry: "creative", entry: "$35-45k", mid: "$50-70k", senior: "$70-100k" },
            ],
            youthHourlyRange: "$15-25/hour",
          },
          sourceMeta: {
            provider: this.name,
            fetchedAt: now,
          },
        };

      case "ai_impact":
        return {
          dataJson: {
            insights: [
              {
                title: "AI Creates New Jobs",
                description: "70% of companies are hiring for AI-related roles that didn't exist 3 years ago.",
                stat: "150,000+",
                statLabel: "new tech jobs annually",
              },
              {
                title: "Automation = More Human Roles",
                description: "As AI takes over routine tasks, demand increases for creative and social skills.",
                stat: "45%",
                statLabel: "increase in care professions",
              },
              {
                title: "Skills Over Degrees",
                description: "Employers increasingly value practical skills and certifications over traditional degrees.",
                stat: "3x",
                statLabel: "faster hiring with trade certs",
              },
            ],
          },
          sourceMeta: {
            provider: this.name,
            fetchedAt: now,
            urls: ["https://www.weforum.org", "https://www.bls.gov"],
          },
        };

      case "regional_insights":
        return {
          dataJson: {
            hotSectors: ["Tech Hubs", "Renewable Energy", "Healthcare", "Tourism & Hospitality"],
            avgYouthPay: "$15-25/hour",
            topEmployers: "Small & medium businesses employ 60% of young workers",
            marketTrend: "Stable with growth in tech and green sectors",
          },
          sourceMeta: {
            provider: this.name,
            fetchedAt: now,
          },
        };

      case "resources_links":
        return {
          dataJson: {
            resources: [
              { name: "freeCodeCamp", url: "https://www.freecodecamp.org", category: "tech", status: "active" },
              { name: "Codecademy", url: "https://www.codecademy.com", category: "tech", status: "active" },
              { name: "Khan Academy", url: "https://www.khanacademy.org", category: "general", status: "active" },
              { name: "Coursera", url: "https://www.coursera.org", category: "general", status: "active" },
              { name: "Skillshare", url: "https://www.skillshare.com", category: "creative", status: "active" },
            ],
            certifications: [
              { name: "Google IT Support", provider: "Google", industry: "tech" },
              { name: "AWS Cloud Practitioner", provider: "Amazon", industry: "tech" },
              { name: "Meta Frontend Developer", provider: "Meta", industry: "tech" },
              { name: "Google Digital Marketing", provider: "Google", industry: "creative" },
            ],
          },
          sourceMeta: {
            provider: this.name,
            fetchedAt: now,
          },
        };

      case "whats_new":
        return {
          dataJson: {
            items: [
              {
                title: "AI Tools Becoming Essential",
                summary: "More employers now expect basic AI tool proficiency from entry-level candidates.",
                date: "January 2026",
                category: "trends",
              },
              {
                title: "Green Jobs Growing Fast",
                summary: "Renewable energy sector sees 20% year-over-year job growth.",
                date: "January 2026",
                category: "industry",
              },
              {
                title: "Skills-First Hiring Expands",
                summary: "Major companies drop degree requirements for many technical roles.",
                date: "December 2025",
                category: "hiring",
              },
            ],
          },
          sourceMeta: {
            provider: this.name,
            fetchedAt: now,
          },
        };

      default:
        return null;
    }
  }
}

// ============================================
// DELTA CALCULATION LOGIC
// ============================================

/**
 * Calculate delta between current and new data for a specific module
 * Returns whether the change exceeds the module's threshold
 */
export function calculateDelta(
  moduleKey: string,
  currentData: Record<string, unknown>,
  newData: Record<string, unknown>,
  threshold: Record<string, number>
): DeltaResult {
  const changeDetails: Record<string, unknown> = {};
  let hasSignificantChange = false;

  switch (moduleKey) {
    case "top_industries": {
      // Check for rank shifts in industries
      const currentIndustries = (currentData.industries as Array<{ id: string; rank: number }>) || [];
      const newIndustries = (newData.industries as Array<{ id: string; rank: number }>) || [];

      let maxRankShift = 0;
      for (const newInd of newIndustries) {
        const current = currentIndustries.find((c) => c.id === newInd.id);
        if (current) {
          const shift = Math.abs(current.rank - newInd.rank);
          maxRankShift = Math.max(maxRankShift, shift);
        }
      }

      changeDetails.maxRankShift = maxRankShift;
      if (maxRankShift >= (threshold.rankShift || 2)) {
        hasSignificantChange = true;
      }

      // Check for new industries
      const currentIds = new Set(currentIndustries.map((i) => i.id));
      const newIds = newIndustries.filter((i) => !currentIds.has(i.id));
      if (newIds.length > 0) {
        changeDetails.newIndustries = newIds.length;
        hasSignificantChange = true;
      }
      break;
    }

    case "hot_roles": {
      // Check list difference percentage
      const currentRoles = (currentData.roles as Array<{ title: string }>) || [];
      const newRoles = (newData.roles as Array<{ title: string }>) || [];

      const currentTitles = new Set(currentRoles.map((r) => r.title));
      const newTitles = new Set(newRoles.map((r) => r.title));

      const addedCount = [...newTitles].filter((t) => !currentTitles.has(t)).length;
      const removedCount = [...currentTitles].filter((t) => !newTitles.has(t)).length;
      const totalChanges = addedCount + removedCount;
      const diffPct = currentRoles.length > 0 ? (totalChanges / currentRoles.length) * 100 : 100;

      changeDetails.listDiffPct = Math.round(diffPct);
      changeDetails.added = addedCount;
      changeDetails.removed = removedCount;

      if (diffPct >= (threshold.listDiffPct || 25)) {
        hasSignificantChange = true;
      }
      break;
    }

    case "skills_trends": {
      // Check demand score changes
      const currentSkills = (currentData.skills as Array<{ skill: string; demand: number }>) || [];
      const newSkills = (newData.skills as Array<{ skill: string; demand: number }>) || [];

      let maxDemandChange = 0;
      for (const newSkill of newSkills) {
        const current = currentSkills.find((s) => s.skill === newSkill.skill);
        if (current) {
          const change = Math.abs(current.demand - newSkill.demand);
          maxDemandChange = Math.max(maxDemandChange, change);
        }
      }

      changeDetails.maxDemandChange = maxDemandChange;
      if (maxDemandChange >= (threshold.demandChange || 10)) {
        hasSignificantChange = true;
      }

      // Check for new skills
      const currentSkillNames = new Set(currentSkills.map((s) => s.skill));
      const newSkillNames = newSkills.filter((s) => !currentSkillNames.has(s.skill));
      if (newSkillNames.length > 0) {
        changeDetails.newSkills = newSkillNames.length;
        hasSignificantChange = true;
      }
      break;
    }

    case "salary_bands": {
      // Check salary percentage changes
      const currentBands = (currentData.bands as Array<{ industry: string; entry: string }>) || [];
      const newBands = (newData.bands as Array<{ industry: string; entry: string }>) || [];

      // Simple comparison - if any band text changed significantly
      let bandsChanged = 0;
      for (const newBand of newBands) {
        const current = currentBands.find((b) => b.industry === newBand.industry);
        if (current && current.entry !== newBand.entry) {
          bandsChanged++;
        }
      }

      const changePct = currentBands.length > 0 ? (bandsChanged / currentBands.length) * 100 : 0;
      changeDetails.bandsChangedPct = Math.round(changePct);

      if (changePct >= (threshold.salaryPct || 10)) {
        hasSignificantChange = true;
      }
      break;
    }

    case "ai_impact": {
      // Check for new insights or stat changes
      const currentInsights = (currentData.insights as Array<{ title: string; stat: string }>) || [];
      const newInsights = (newData.insights as Array<{ title: string; stat: string }>) || [];

      let statsChanged = 0;
      for (const newInsight of newInsights) {
        const current = currentInsights.find((i) => i.title === newInsight.title);
        if (current && current.stat !== newInsight.stat) {
          statsChanged++;
        }
      }

      changeDetails.statsChanged = statsChanged;
      const newItems = newInsights.length - currentInsights.length;
      changeDetails.newItems = Math.max(0, newItems);

      if (statsChanged > 0 || newItems >= (threshold.newInsights || 1)) {
        hasSignificantChange = true;
      }
      break;
    }

    case "regional_insights": {
      // Check for sector changes
      const currentSectors = (currentData.hotSectors as string[]) || [];
      const newSectors = (newData.hotSectors as string[]) || [];

      const currentSet = new Set(currentSectors);
      const newSet = new Set(newSectors);
      const changes = [...newSet].filter((s) => !currentSet.has(s)).length +
        [...currentSet].filter((s) => !newSet.has(s)).length;

      changeDetails.sectorChanges = changes;
      if (changes >= (threshold.sectorChange || 2)) {
        hasSignificantChange = true;
      }

      // Check pay change
      if (currentData.avgYouthPay !== newData.avgYouthPay) {
        changeDetails.payChanged = true;
        hasSignificantChange = true;
      }
      break;
    }

    case "resources_links": {
      // Check for broken or new links
      const currentResources = (currentData.resources as Array<{ url: string; status: string }>) || [];
      const newResources = (newData.resources as Array<{ url: string; status: string }>) || [];

      const brokenLinks = currentResources.filter((r) => {
        const newR = newResources.find((n) => n.url === r.url);
        return newR && newR.status !== "active";
      }).length;

      const addedResources = newResources.length - currentResources.length;

      changeDetails.brokenLinks = brokenLinks;
      changeDetails.newResources = Math.max(0, addedResources);

      if (brokenLinks >= (threshold.brokenLinks || 1) || addedResources >= (threshold.newResources || 2)) {
        hasSignificantChange = true;
      }
      break;
    }

    case "whats_new": {
      // Always regenerate if there are new items
      const currentItems = (currentData.items as Array<{ title: string }>) || [];
      const newItems = (newData.items as Array<{ title: string }>) || [];

      const currentTitles = new Set(currentItems.map((i) => i.title));
      const newCount = newItems.filter((i) => !currentTitles.has(i.title)).length;

      changeDetails.newItems = newCount;
      if (newCount >= (threshold.newItems || 1)) {
        hasSignificantChange = true;
      }
      break;
    }

    default:
      // For unknown modules, always mark as changed to be safe
      hasSignificantChange = true;
  }

  return { hasSignificantChange, changeDetails };
}

// ============================================
// SUMMARY GENERATOR (English-only)
// ============================================

/**
 * Generate English-only summary text for a module
 */
export function generateModuleSummary(moduleKey: string, dataJson: Record<string, unknown>): string {
  switch (moduleKey) {
    case "top_industries": {
      const industries = (dataJson.industries as Array<{ name: string; growth: string }>) || [];
      const top = industries.slice(0, 2);
      return `Top growing industries: ${top.map((i) => `${i.name} (${i.growth})`).join(", ")}. These sectors offer the best opportunities for young workers entering the job market.`;
    }

    case "hot_roles": {
      const roles = (dataJson.roles as Array<{ title: string }>) || [];
      const topRoles = roles.slice(0, 4).map((r) => r.title);
      return `Most in-demand roles: ${topRoles.join(", ")}. These positions have the highest employer demand across industries.`;
    }

    case "skills_trends": {
      const skills = (dataJson.skills as Array<{ skill: string; demand: number }>) || [];
      const topSkills = skills.slice(0, 3).map((s) => s.skill);
      return `Top skills employers want: ${topSkills.join(", ")}. Building these skills will make you more competitive in the job market.`;
    }

    case "salary_bands": {
      const youthPay = dataJson.youthHourlyRange as string || "$15-25/hour";
      return `Typical youth pay ranges from ${youthPay} depending on role and experience. Entry-level positions offer competitive starting salaries across all industries.`;
    }

    case "ai_impact": {
      const insights = (dataJson.insights as Array<{ title: string }>) || [];
      return `Key AI trends: ${insights.slice(0, 2).map((i) => i.title).join("; ")}. Understanding AI's impact helps you prepare for the future job market.`;
    }

    case "regional_insights": {
      const sectors = (dataJson.hotSectors as string[]) || [];
      return `Hot sectors in your region: ${sectors.slice(0, 3).join(", ")}. Local job markets show strong demand in these areas.`;
    }

    case "resources_links": {
      const resources = (dataJson.resources as Array<{ name: string }>) || [];
      return `${resources.length} free learning resources available including ${resources.slice(0, 2).map((r) => r.name).join(" and ")}. Start building skills today.`;
    }

    case "whats_new": {
      const items = (dataJson.items as Array<{ title: string }>) || [];
      return `Latest updates: ${items.slice(0, 2).map((i) => i.title).join("; ")}. Stay informed about job market trends.`;
    }

    default:
      return "Updated content available. Check the details for the latest information.";
  }
}

// ============================================
// PROVIDER FACTORY
// ============================================

let cachedProvider: IndustryDataProvider | null = null;

export function getDataProvider(): IndustryDataProvider {
  if (cachedProvider) return cachedProvider;

  // Check for real provider configuration
  const providerType = process.env.INSIGHTS_DATA_PROVIDER || "mock";

  switch (providerType) {
    case "mock":
    default:
      cachedProvider = new MockProvider();
      break;
    // Future: Add real providers here
    // case "bls": cachedProvider = new BLSProvider(); break;
    // case "custom": cachedProvider = new CustomProvider(); break;
  }

  return cachedProvider;
}

// ============================================
// VERIFY & REFRESH MAIN FUNCTION
// ============================================

export interface RefreshResult {
  modulesChecked: number;
  modulesVerified: number;
  modulesRegenerated: number;
  errors: string[];
  details: Array<{
    key: string;
    action: "verified" | "regenerated" | "error" | "skipped";
    reason?: string;
  }>;
}

/**
 * Main verify and refresh function
 * Checks all modules due for verification and updates as needed
 */
export async function verifyAndRefreshIndustryInsights(): Promise<RefreshResult> {
  const result: RefreshResult = {
    modulesChecked: 0,
    modulesVerified: 0,
    modulesRegenerated: 0,
    errors: [],
    details: [],
  };

  const provider = getDataProvider();
  const now = new Date();

  try {
    // Find modules due for verification
    const modulesToCheck = await prisma.industryInsightsModule.findMany({
      where: {
        OR: [
          { status: "VERIFY_DUE" },
          {
            lastVerifiedAt: {
              lte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // Default 90 days
            },
          },
        ],
      },
    });

    // Also check modules based on their specific cadence
    const allModules = await prisma.industryInsightsModule.findMany();
    const dueModules = allModules.filter((m) => {
      const daysSinceVerified = (now.getTime() - m.lastVerifiedAt.getTime()) / (24 * 60 * 60 * 1000);
      return daysSinceVerified >= m.refreshCadenceDays;
    });

    // Combine and dedupe
    const moduleMap = new Map<string, typeof dueModules[0]>();
    [...modulesToCheck, ...dueModules].forEach((m) => moduleMap.set(m.id, m));
    const uniqueModules = Array.from(moduleMap.values());

    result.modulesChecked = uniqueModules.length;

    for (const module of uniqueModules) {
      try {
        // Mark as checking
        await prisma.industryInsightsModule.update({
          where: { id: module.id },
          data: { status: "REGENERATING" },
        });

        // Fetch latest data from provider
        const latestData = await provider.getLatest(module.key);

        if (!latestData) {
          // Provider returned no data - keep existing, mark verified
          await prisma.industryInsightsModule.update({
            where: { id: module.id },
            data: {
              status: "ACTIVE",
              lastVerifiedAt: now,
            },
          });
          result.modulesVerified++;
          result.details.push({
            key: module.key,
            action: "verified",
            reason: "Provider returned no new data",
          });
          continue;
        }

        // Calculate delta
        const currentData = module.contentJson as Record<string, unknown>;
        const threshold = module.changeThreshold as Record<string, number>;
        const delta = calculateDelta(module.key, currentData, latestData.dataJson, threshold);

        if (!delta.hasSignificantChange) {
          // No significant change - just update verification timestamp
          await prisma.industryInsightsModule.update({
            where: { id: module.id },
            data: {
              status: "ACTIVE",
              lastVerifiedAt: now,
            },
          });
          result.modulesVerified++;
          result.details.push({
            key: module.key,
            action: "verified",
            reason: `No significant changes: ${JSON.stringify(delta.changeDetails)}`,
          });
        } else {
          // Significant change - regenerate
          const newSummary = generateModuleSummary(module.key, latestData.dataJson);

          await prisma.industryInsightsModule.update({
            where: { id: module.id },
            data: {
              status: "ACTIVE",
              contentJson: latestData.dataJson as Prisma.InputJsonValue,
              renderedSummary: newSummary,
              sourceMeta: latestData.sourceMeta as Prisma.InputJsonValue,
              lastGeneratedAt: now,
              lastVerifiedAt: now,
              version: module.version + 1,
            },
          });
          result.modulesRegenerated++;
          result.details.push({
            key: module.key,
            action: "regenerated",
            reason: `Changes detected: ${JSON.stringify(delta.changeDetails)}`,
          });
        }
      } catch (moduleError) {
        // Module-level error - keep existing, log error
        const errorMessage = moduleError instanceof Error ? moduleError.message : "Unknown error";
        result.errors.push(`${module.key}: ${errorMessage}`);
        result.details.push({
          key: module.key,
          action: "error",
          reason: errorMessage,
        });

        // Restore to ACTIVE status (don't leave in REGENERATING)
        await prisma.industryInsightsModule.update({
          where: { id: module.id },
          data: { status: "ACTIVE" },
        }).catch(() => {});
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`System error: ${errorMessage}`);
  }

  return result;
}

// ============================================
// INITIALIZATION FUNCTION
// ============================================

/**
 * Initialize all modules with default data
 * Call this on first deployment or to reset modules
 */
export async function initializeInsightsModules(): Promise<void> {
  const provider = getDataProvider();
  const now = new Date();

  for (const config of MODULE_CONFIGS) {
    const existing = await prisma.industryInsightsModule.findUnique({
      where: { key: config.key },
    });

    if (!existing) {
      const data = await provider.getLatest(config.key);
      const contentJson = data?.dataJson || {};
      const summary = generateModuleSummary(config.key, contentJson);

      await prisma.industryInsightsModule.create({
        data: {
          key: config.key,
          title: config.title,
          description: config.description,
          contentJson: contentJson as Prisma.InputJsonValue,
          renderedSummary: summary,
          sourceMeta: (data?.sourceMeta || { provider: "manual", fetchedAt: now.toISOString() }) as Prisma.InputJsonValue,
          refreshCadenceDays: config.refreshCadenceDays,
          changeThreshold: config.changeThreshold as Prisma.InputJsonValue,
          status: "ACTIVE",
          lastGeneratedAt: now,
          lastVerifiedAt: now,
        },
      });
      console.log(`[Insights] Initialized module: ${config.key}`);
    }
  }
}

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Get all active modules for the Industry Insights page
 */
export async function getActiveInsightsModules() {
  return prisma.industryInsightsModule.findMany({
    where: { status: "ACTIVE" },
    orderBy: { key: "asc" },
  });
}

/**
 * Get a specific module by key
 */
export async function getInsightsModule(key: string) {
  return prisma.industryInsightsModule.findUnique({
    where: { key },
  });
}

/**
 * Check if any modules need verification
 */
export async function getModulesNeedingVerification() {
  const now = new Date();
  const modules = await prisma.industryInsightsModule.findMany();

  return modules.filter((m) => {
    const daysSinceVerified = (now.getTime() - m.lastVerifiedAt.getTime()) / (24 * 60 * 60 * 1000);
    return daysSinceVerified >= m.refreshCadenceDays;
  });
}
