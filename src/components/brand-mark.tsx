import Link from "next/link";
import { Navigation2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The single source of truth for the Endeavrly brand mark: a solid
 * emerald/teal upward arrowhead (lucide Navigation2) next to the
 * "Endeavrly" wordmark. Replaces the ~20 hand-rolled Star marks that had
 * drifted apart across surfaces (gradient boxes, green-600, amber, etc.).
 *
 * - `size` scales icon + wordmark together.
 * - `showWordmark={false}` renders the arrow alone (e.g. auth card headers,
 *   the favicon).
 * - `href` wraps it in a Link (defaults the accessible label to home).
 * - `iconClassName` / `wordmarkClassName` let a surface recolor for its
 *   background (e.g. white wordmark on the dark landing nav) without
 *   forking the markup.
 */

type BrandSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<BrandSize, { icon: string; text: string; gap: string }> = {
  sm: { icon: "h-4 w-4", text: "text-sm", gap: "gap-1.5" },
  md: { icon: "h-5 w-5", text: "text-base", gap: "gap-2" },
  lg: { icon: "h-6 w-6", text: "text-lg", gap: "gap-2" },
  xl: { icon: "h-9 w-9", text: "text-2xl", gap: "gap-2.5" },
};

export interface BrandMarkProps {
  size?: BrandSize;
  href?: string;
  showWordmark?: boolean;
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  "aria-label"?: string;
}

export function BrandMark({
  size = "md",
  href,
  showWordmark = true,
  className,
  iconClassName,
  wordmarkClassName,
  "aria-label": ariaLabel,
}: BrandMarkProps) {
  const s = SIZES[size];

  const inner = (
    <>
      <Navigation2
        className={cn(
          s.icon,
          "shrink-0 text-emerald-500 fill-emerald-500",
          iconClassName,
        )}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {showWordmark && (
        <span className={cn("font-semibold tracking-tight", s.text, wordmarkClassName)}>
          Endeavrly
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel ?? "Endeavrly home"}
        className={cn("inline-flex items-center", s.gap, className)}
      >
        {inner}
      </Link>
    );
  }

  return (
    <span
      aria-label={showWordmark ? undefined : ariaLabel ?? "Endeavrly"}
      className={cn("inline-flex items-center", s.gap, className)}
    >
      {inner}
    </span>
  );
}
