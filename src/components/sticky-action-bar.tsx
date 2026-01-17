"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StickyActionBarProps {
  children: ReactNode;
  className?: string;
  /** Show only on mobile (hidden on md and up) */
  mobileOnly?: boolean;
  /** Add extra bottom padding for safe area (iOS) */
  withSafeArea?: boolean;
}

/**
 * A sticky action bar that appears at the bottom of the screen.
 * Useful for primary CTAs like Accept/Decline, Send, Submit, etc.
 *
 * By default, shows on all screen sizes. Use mobileOnly prop to hide on desktop.
 */
export function StickyActionBar({
  children,
  className,
  mobileOnly = true,
  withSafeArea = true,
}: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/95 backdrop-blur-md border-t",
        "px-4 py-3",
        withSafeArea && "pb-safe",
        mobileOnly && "md:hidden",
        className
      )}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {children}
      </div>
    </div>
  );
}

/**
 * Spacer component to add padding at the bottom of content
 * to prevent the sticky action bar from covering content.
 */
export function StickyActionBarSpacer({
  className,
  mobileOnly = true
}: {
  className?: string;
  mobileOnly?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-20", // Height to account for action bar + safe area
        mobileOnly && "md:hidden",
        className
      )}
    />
  );
}
