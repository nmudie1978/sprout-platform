/**
 * Role Thumbnails - Centralized mapping for job category thumbnails
 *
 * This module provides thumbnail images for job categories/roles to make
 * the UI more visual and engaging for teens.
 *
 * Asset location: /public/images/roles/
 * To replace placeholders, drop real images with the same filenames.
 */

export type RoleCategory =
  | "tech"
  | "healthcare"
  | "trades"
  | "hospitality"
  | "retail"
  | "childcare"
  | "delivery"
  | "office"
  | "outdoor"
  | "general";

export interface RoleThumbnailData {
  src: string;
  alt: string;
  category: RoleCategory;
}

// Mapping from role categories to their thumbnail data
const roleThumbnails: Record<RoleCategory, Omit<RoleThumbnailData, "category">> = {
  tech: {
    src: "/images/roles/developer.svg",
    alt: "Developer role thumbnail",
  },
  healthcare: {
    src: "/images/roles/nurse.svg",
    alt: "Healthcare role thumbnail",
  },
  trades: {
    src: "/images/roles/mechanic.svg",
    alt: "Trades role thumbnail",
  },
  hospitality: {
    src: "/images/roles/barista.svg",
    alt: "Hospitality role thumbnail",
  },
  retail: {
    src: "/images/roles/retail.svg",
    alt: "Retail role thumbnail",
  },
  childcare: {
    src: "/images/roles/childcare.svg",
    alt: "Childcare role thumbnail",
  },
  delivery: {
    src: "/images/roles/delivery.svg",
    alt: "Delivery role thumbnail",
  },
  office: {
    src: "/images/roles/admin.svg",
    alt: "Office role thumbnail",
  },
  outdoor: {
    src: "/images/roles/gardener.svg",
    alt: "Outdoor role thumbnail",
  },
  general: {
    src: "/images/roles/general.svg",
    alt: "General role thumbnail",
  },
};

// Map existing app categories to role categories
const categoryMapping: Record<string, RoleCategory> = {
  // Existing app categories (from job-card.tsx categoryConfig)
  BABYSITTING: "childcare",
  DOG_WALKING: "outdoor",
  SNOW_CLEARING: "outdoor",
  CLEANING: "general",
  DIY_HELP: "trades",
  TECH_HELP: "tech",
  ERRANDS: "delivery",
  OTHER: "general",

  // Additional standard category mappings
  "software-tech": "tech",
  "software/tech": "tech",
  software: "tech",
  tech: "tech",
  technology: "tech",
  it: "tech",
  healthcare: "healthcare",
  medical: "healthcare",
  nursing: "healthcare",
  trades: "trades",
  construction: "trades",
  automotive: "trades",
  hospitality: "hospitality",
  food: "hospitality",
  restaurant: "hospitality",
  cafe: "hospitality",
  retail: "retail",
  sales: "retail",
  shop: "retail",
  store: "retail",
  childcare: "childcare",
  babysitting: "childcare",
  delivery: "delivery",
  courier: "delivery",
  logistics: "delivery",
  office: "office",
  admin: "office",
  administrative: "office",
  outdoor: "outdoor",
  gardening: "outdoor",
  landscaping: "outdoor",
};

// Keywords for inferring category from job title
const titleKeywords: { keywords: string[]; category: RoleCategory }[] = [
  {
    keywords: [
      "developer",
      "engineer",
      "coder",
      "software",
      "programmer",
      "coding",
      "web",
      "app",
      "tech",
      "it ",
      "computer",
    ],
    category: "tech",
  },
  {
    keywords: [
      "nurse",
      "clinic",
      "hospital",
      "care",
      "medical",
      "health",
      "doctor",
      "pharmacy",
      "dental",
    ],
    category: "healthcare",
  },
  {
    keywords: [
      "mechanic",
      "garage",
      "car",
      "auto",
      "electrician",
      "plumber",
      "carpenter",
      "welder",
      "construction",
      "builder",
      "hvac",
      "repair",
      "diy",
      "handyman",
    ],
    category: "trades",
  },
  {
    keywords: [
      "coffee",
      "barista",
      "cafe",
      "waiter",
      "waitress",
      "restaurant",
      "bar",
      "hotel",
      "kitchen",
      "chef",
      "cook",
      "hospitality",
      "food",
      "catering",
    ],
    category: "hospitality",
  },
  {
    keywords: [
      "shop",
      "retail",
      "store",
      "cashier",
      "sales",
      "customer service",
      "checkout",
      "merchandise",
    ],
    category: "retail",
  },
  {
    keywords: [
      "babysit",
      "child",
      "kids",
      "nanny",
      "daycare",
      "tutor",
      "childminder",
      "au pair",
    ],
    category: "childcare",
  },
  {
    keywords: [
      "delivery",
      "courier",
      "driver",
      "transport",
      "shipping",
      "errand",
      "pickup",
    ],
    category: "delivery",
  },
  {
    keywords: [
      "admin",
      "assistant",
      "office",
      "secretary",
      "receptionist",
      "data entry",
      "clerk",
      "filing",
    ],
    category: "office",
  },
  {
    keywords: [
      "garden",
      "yard",
      "lawn",
      "landscap",
      "outdoor",
      "snow",
      "leaf",
      "plant",
      "farm",
      "agriculture",
      "dog walk",
      "pet",
    ],
    category: "outdoor",
  },
];

/**
 * Infers the role category from a job title using keyword matching
 */
function inferCategoryFromTitle(title: string): RoleCategory {
  const lowerTitle = title.toLowerCase();

  for (const { keywords, category } of titleKeywords) {
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword)) {
        return category;
      }
    }
  }

  return "general";
}

/**
 * Gets the role category for a job based on its category field or title
 */
export function getRoleCategory(
  category?: string | null,
  title?: string
): RoleCategory {
  // First try to map from the category field
  if (category) {
    const normalizedCategory = category.toLowerCase().trim();

    // Check direct mapping
    const mapped = categoryMapping[category] || categoryMapping[normalizedCategory];
    if (mapped) {
      return mapped;
    }

    // Check if category itself is a valid role category
    if (normalizedCategory in roleThumbnails) {
      return normalizedCategory as RoleCategory;
    }
  }

  // Fall back to inferring from title
  if (title) {
    return inferCategoryFromTitle(title);
  }

  return "general";
}

/**
 * Gets the thumbnail data for a job
 *
 * @param job - Object containing category and/or title
 * @returns Thumbnail data with src, alt, and category
 *
 * @example
 * const thumbnail = getRoleThumbnail({ category: "TECH_HELP", title: "Web Developer" });
 * // Returns: { src: "/images/roles/developer.svg", alt: "Developer role thumbnail", category: "tech" }
 */
export function getRoleThumbnail(job: {
  category?: string | null;
  title?: string;
}): RoleThumbnailData {
  const roleCategory = getRoleCategory(job.category, job.title);
  const thumbnail = roleThumbnails[roleCategory];

  return {
    ...thumbnail,
    category: roleCategory,
  };
}

/**
 * Gets all available role thumbnails (useful for displaying category filters)
 */
export function getAllRoleThumbnails(): Record<RoleCategory, RoleThumbnailData> {
  const result: Record<RoleCategory, RoleThumbnailData> = {} as Record<
    RoleCategory,
    RoleThumbnailData
  >;

  for (const [category, data] of Object.entries(roleThumbnails)) {
    result[category as RoleCategory] = {
      ...data,
      category: category as RoleCategory,
    };
  }

  return result;
}

/**
 * Category display labels for UI
 */
export const roleCategoryLabels: Record<RoleCategory, string> = {
  tech: "Software / Tech",
  healthcare: "Healthcare",
  trades: "Trades",
  hospitality: "Hospitality",
  retail: "Retail",
  childcare: "Childcare",
  delivery: "Delivery",
  office: "Office",
  outdoor: "Outdoor",
  general: "General",
};
