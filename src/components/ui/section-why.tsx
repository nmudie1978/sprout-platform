"use client";

import { HelpCircle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface SectionWhyProps {
  /** Short explanation of why this section matters to the user */
  why: string;
  /** Optional alignment */
  align?: "start" | "center" | "end";
}

export function SectionWhy({ why, align = "center" }: SectionWhyProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          // stopPropagation prevents the click bubbling up to a parent Link.
          // CRITICAL: do NOT call preventDefault here — Radix's Slot composes
          // event handlers and skips its own onClick if the child called
          // preventDefault, which would stop the popover from opening.
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            // Some parent navigations fire on mousedown — kill it here too
            e.stopPropagation();
          }}
          className="inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Why this matters"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side="top"
        onClick={(e) => e.stopPropagation()}
        className="w-64 p-3 text-xs leading-relaxed text-muted-foreground/80 border-border/60"
      >
        {why}
      </PopoverContent>
    </Popover>
  );
}
