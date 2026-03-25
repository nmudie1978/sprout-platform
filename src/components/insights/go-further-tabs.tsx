"use client";

/**
 * GO FURTHER
 *
 * "Beyond Borders" global perspectives carousel.
 * Career Events has moved to its own page at /career-events.
 */

import { AnimatedBorder } from "@/components/ui/animated-border";
import { BeyondBordersCarousel } from "@/components/insights/beyond-borders-carousel";

export function GoFurtherTabs() {
  return (
    <AnimatedBorder>
      <div className="p-5">
        <BeyondBordersCarousel />
      </div>
    </AnimatedBorder>
  );
}

export default GoFurtherTabs;
