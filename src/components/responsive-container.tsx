"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  /** Maximum width variant */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "7xl" | "full";
  /** Add vertical padding */
  withPadding?: boolean;
  /** Use as main content area (accounts for bottom nav) */
  asMain?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

/**
 * A responsive container component that provides consistent
 * padding and max-width across the app.
 *
 * - Full width on mobile with horizontal padding
 * - Centered with max-width on desktop
 * - Accounts for bottom navigation on mobile when asMain is true
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = "7xl",
  withPadding = true,
  asMain = false,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        maxWidthClasses[maxWidth],
        withPadding && "px-4 sm:px-6 lg:px-8",
        asMain && "pb-20 md:pb-6", // Extra bottom padding for mobile nav
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A responsive page wrapper that provides consistent layout structure.
 * Includes proper padding for mobile bottom navigation.
 */
export function ResponsivePage({
  children,
  className,
  maxWidth = "7xl",
}: {
  children: ReactNode;
  className?: string;
  maxWidth?: ResponsiveContainerProps["maxWidth"];
}) {
  return (
    <main className={cn("min-h-screen", className)}>
      <ResponsiveContainer maxWidth={maxWidth} withPadding asMain>
        {children}
      </ResponsiveContainer>
    </main>
  );
}
