"use client";

/**
 * DEV PAGE: Compare modal preview (for the "Where you'd work" employers
 * section). Loads three real careers from the catalog and opens the modal.
 * Visit /dev/compare.
 */

import { CompareModal } from "@/components/compare/compare-modal";
import { useCareerCatalog } from "@/hooks/use-career-catalog";
import type { Career } from "@/lib/career-pathways";

const IDS = ["software-developer", "data-scientist", "lawyer"];

export default function CompareDevPage() {
  const { getCareerById, isLoading } = useCareerCatalog();
  const careers = IDS.map((id) => getCareerById(id)).filter(
    (c): c is Career => Boolean(c),
  );

  if (isLoading) return <p className="p-6 text-sm">Loading catalog…</p>;
  if (careers.length === 0) return <p className="p-6 text-sm">No careers found.</p>;

  return (
    <CompareModal
      open
      careers={careers}
      preferences={null}
      onClose={() => {}}
      onRemove={() => {}}
    />
  );
}
