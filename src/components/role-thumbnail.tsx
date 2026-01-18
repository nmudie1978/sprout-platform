"use client";

import Image from "next/image";
import { memo } from "react";
import { getRoleThumbnail, type RoleCategory } from "@/lib/role-thumbnails";

export type RoleThumbnailSize = "sm" | "md" | "lg";

interface RoleThumbnailProps {
  /** Job category (e.g., "TECH_HELP", "BABYSITTING") */
  category?: string | null;
  /** Job title for keyword inference when category is missing */
  title?: string;
  /** Size variant: sm (20-28px for tabs), md (32px default), lg (40-48px for cards) */
  size?: RoleThumbnailSize;
  /** Additional CSS classes */
  className?: string;
}

// Size configurations with responsive values
const sizeConfig: Record<RoleThumbnailSize, { width: number; height: number; className: string }> = {
  sm: {
    width: 24,
    height: 24,
    className: "w-5 h-5 sm:w-6 sm:h-6", // 20px mobile, 24px desktop
  },
  md: {
    width: 32,
    height: 32,
    className: "w-8 h-8", // 32px
  },
  lg: {
    width: 40,
    height: 40,
    className: "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12", // 32px mobile, 40px tablet, 48px desktop
  },
};

/**
 * RoleThumbnail - Displays a small role-based thumbnail image
 *
 * Use this component to show visual role indicators on job cards and tabs.
 * The component automatically maps job categories to appropriate thumbnails
 * and falls back to title-based inference if category is missing.
 *
 * @example
 * // On a job card
 * <RoleThumbnail category={job.category} title={job.title} size="lg" />
 *
 * // On a tab header
 * <RoleThumbnail category="TECH_HELP" size="sm" />
 */
export const RoleThumbnail = memo(function RoleThumbnail({
  category,
  title,
  size = "md",
  className = "",
}: RoleThumbnailProps) {
  const thumbnail = getRoleThumbnail({ category, title });
  const config = sizeConfig[size];

  return (
    <div
      className={`
        relative shrink-0 overflow-hidden rounded-full
        ring-1 ring-gray-200 dark:ring-gray-700
        bg-gray-50 dark:bg-gray-800
        ${config.className}
        ${className}
      `}
    >
      <Image
        src={thumbnail.src}
        alt={thumbnail.alt}
        width={config.width}
        height={config.height}
        className="object-cover w-full h-full"
        priority={false}
      />
    </div>
  );
});

/**
 * RoleThumbnailSquare - Square variant with rounded corners (for card headers)
 */
export const RoleThumbnailSquare = memo(function RoleThumbnailSquare({
  category,
  title,
  size = "md",
  className = "",
}: RoleThumbnailProps) {
  const thumbnail = getRoleThumbnail({ category, title });
  const config = sizeConfig[size];

  return (
    <div
      className={`
        relative shrink-0 overflow-hidden rounded-lg
        ring-1 ring-gray-200 dark:ring-gray-700
        bg-gray-50 dark:bg-gray-800
        ${config.className}
        ${className}
      `}
    >
      <Image
        src={thumbnail.src}
        alt={thumbnail.alt}
        width={config.width}
        height={config.height}
        className="object-cover w-full h-full"
        priority={false}
      />
    </div>
  );
});

export type { RoleCategory };
