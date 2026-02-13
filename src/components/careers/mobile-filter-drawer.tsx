"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CareerFilterState,
  CareerNature,
  SalaryRange,
} from "@/lib/career-filters/types";
import { WorkStylePills } from "@/components/careers/work-style-pills";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CareerFilterState;
  salaryBounds: SalaryRange;
  resultCount: number;
  onReset: () => void;
  onNatureToggle: (nature: CareerNature) => void;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  resultCount,
  onReset,
  onNatureToggle,
}: MobileFilterDrawerProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] bg-background border-t rounded-t-xl shadow-lg",
            "max-h-[85vh] flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
          )}
        >
          {/* Handle bar */}
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 border-b">
            <DialogPrimitive.Title className="text-sm font-semibold">
              Filters
            </DialogPrimitive.Title>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-7 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <X className="h-4 w-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">
                What kind of work interests you?
              </p>
              <WorkStylePills
                selected={filters.careerNatures}
                onToggle={onNatureToggle}
                wrap
              />
            </div>
          </div>

          {/* Footer with results count */}
          <div className="border-t p-4 bg-background">
            <Button onClick={onClose} className="w-full" size="sm">
              Show {resultCount} career{resultCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
