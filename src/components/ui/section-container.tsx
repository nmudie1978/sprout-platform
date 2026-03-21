import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show a faint emerald accent line at the top of the container */
  accent?: boolean;
}

/**
 * Premium section container with subtle depth separation.
 * Soft border, gradient background elevation, and optional accent line.
 * Designed for dark + light mode.
 */
const SectionContainer = React.forwardRef<HTMLDivElement, SectionContainerProps>(
  ({ className, accent = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Border — barely visible
          "border border-neutral-200/60 dark:border-white/[0.06]",
          // Background elevation layer
          "bg-gradient-to-br from-white/70 to-neutral-50/50 dark:from-neutral-900/60 dark:to-neutral-950/40",
          // Radius & spacing
          "rounded-2xl p-4 sm:p-6",
          // Subtle inner glow (top edge sheen)
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
          className,
        )}
        {...props}
      >
        {accent && (
          <div className="h-px w-full bg-gradient-to-r from-emerald-500/30 via-transparent to-transparent mb-5" />
        )}
        {children}
      </div>
    );
  }
);
SectionContainer.displayName = "SectionContainer";

export { SectionContainer };
