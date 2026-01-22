/**
 * Career Clips Types
 */

export type CareerClipPlatform = "TIKTOK" | "YOUTUBE_SHORTS";
export type CareerClipVerifiedStatus = "PENDING" | "VALID" | "INVALID";

export interface CareerClip {
  id: string;
  careerSlug: string;
  categorySlug: string;
  title: string;
  platform: CareerClipPlatform;
  url: string;
  thumbnailUrl: string | null;
  durationSecs: number | null;
  verifiedStatus: CareerClipVerifiedStatus;
  lastCheckedAt: Date | null;
  checkFailReason: string | null;
  sourceLabel: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerClipForDisplay {
  id: string;
  careerSlug: string;
  categorySlug: string;
  title: string;
  platform: CareerClipPlatform;
  url: string;
  thumbnailUrl: string | null;
  durationSecs: number | null;
  sourceLabel: string;
}

// Career categories with display info
export const CAREER_CATEGORIES = [
  { slug: "healthcare", label: "Healthcare", icon: "stethoscope" },
  { slug: "technology", label: "Technology", icon: "laptop" },
  { slug: "trades", label: "Skilled Trades", icon: "wrench" },
  { slug: "creative", label: "Creative Arts", icon: "palette" },
  { slug: "business", label: "Business", icon: "briefcase" },
  { slug: "education", label: "Education", icon: "graduation-cap" },
] as const;

export type CareerCategorySlug = (typeof CAREER_CATEGORIES)[number]["slug"];
