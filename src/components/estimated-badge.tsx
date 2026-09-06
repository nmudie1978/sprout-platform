import { Badge } from "@/components/ui/badge";
import { estimateNote } from "@/lib/career-localization/display";
import type { Career } from "@/lib/career-pathways";
import type { LocalizedCareerView } from "@/lib/career-localization/types";

/**
 * Marks a figure the platform has NOT individually verified.
 *
 * A country pack can supply an education route derived from the shape of that
 * country's system rather than from a sourced, per-career programme. That is
 * useful and honest, but only while it is visibly an estimate — an unlabelled
 * estimate reads as a verified fact, and this platform is read by 15-year-olds
 * deciding what to study.
 *
 * Shared so every surface says the same thing the same way. It was previously
 * defined inside career-card-v2, which is why three other surfaces silently
 * lacked it.
 */
export function EstimatedBadge({
  note,
  compact,
}: {
  note: string | null;
  compact?: boolean;
}) {
  if (!note) return null;
  return (
    <Badge
      variant="outline"
      className={`${compact ? "text-[9px] px-1" : "text-[9px] px-1.5"} py-0 shrink-0 align-middle text-muted-foreground border-dashed border-border`}
      title={note}
    >
      Est.
    </Badge>
  );
}

/** Cards accept a raw Career or a localised view; only the latter has tiers. */
export function tierOf(
  career: Career | LocalizedCareerView,
  field: "salaryTier" | "educationPathTier",
): "verified" | "estimated" | undefined {
  return field in career ? (career as LocalizedCareerView)[field] : undefined;
}

/** The estimate note for a career, preferring the education path's tier. */
export function estimateNoteFor(career: Career | LocalizedCareerView): string | null {
  return (
    estimateNote(tierOf(career, "educationPathTier")) ??
    estimateNote(tierOf(career, "salaryTier"))
  );
}
