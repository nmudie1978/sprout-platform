"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media-query";

interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Show close button (default: true) */
  showClose?: boolean;
  /** Max height on desktop as percentage (default: 85) */
  maxHeightPercent?: number;
  /** Force bottom sheet style even on desktop */
  forceSheet?: boolean;
}

/**
 * MobileSheet - A responsive bottom sheet component
 *
 * - On mobile: slides up from bottom with handle bar
 * - On desktop: centered dialog with rounded corners
 *
 * Based on the life-skill-tip-modal.tsx pattern.
 */
export function MobileSheet({
  open,
  onClose,
  title,
  description,
  children,
  showClose = true,
  maxHeightPercent = 85,
  forceSheet = false,
}: MobileSheetProps) {
  const isMobile = useIsMobile();
  const showAsSheet = isMobile || forceSheet;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Sheet/Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            aria-describedby={description ? "sheet-description" : undefined}
            initial={showAsSheet
              ? { opacity: 0, y: "100%" }
              : { opacity: 0, scale: 0.95 }
            }
            animate={showAsSheet
              ? { opacity: 1, y: 0 }
              : { opacity: 1, scale: 1 }
            }
            exit={showAsSheet
              ? { opacity: 0, y: "100%" }
              : { opacity: 0, scale: 0.95 }
            }
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 bg-background shadow-xl",
              showAsSheet ? [
                "bottom-0 left-0 right-0",
                "rounded-t-3xl border-t",
                "max-h-[90vh]"
              ] : [
                "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "rounded-2xl border",
                "w-full max-w-md mx-4",
                `max-h-[${maxHeightPercent}vh]`
              ]
            )}
            style={!showAsSheet ? { maxHeight: `${maxHeightPercent}vh` } : undefined}
          >
            {/* Handle bar for mobile */}
            {showAsSheet && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>
            )}

            {/* Close button */}
            {showClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}

            {/* Header */}
            <div className={cn(
              "px-4 pb-3",
              showAsSheet ? "pt-2" : "pt-5",
              showClose && "pr-14"
            )}>
              <h2
                id="sheet-title"
                className="text-lg font-semibold leading-tight"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="sheet-description"
                  className="text-sm text-muted-foreground mt-1"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Content - scrollable */}
            <div
              className={cn(
                "overflow-y-auto overscroll-contain px-4 pb-4",
                showAsSheet ? "max-h-[calc(90vh-80px)]" : "max-h-[calc(85vh-100px)]"
              )}
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * MobileSheetFooter - Footer section for MobileSheet with action buttons
 */
export function MobileSheetFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex gap-3 pt-4 mt-2 border-t",
      className
    )}>
      {children}
    </div>
  );
}
