"use client";

import { Button } from "@/components/ui/button";

interface WorkplaceInsightPlaceholderProps {
  goalTitle: string;
}

/**
 * Workplace Insight Placeholder (Pilot)
 *
 * This is a DISABLED placeholder for a future feature where youth may be able
 * to request observational workplace visits related to their Primary Goal.
 *
 * TO ENABLE THIS FEATURE:
 * 1. Set FEATURE_ENABLED to true
 * 2. Implement the request handling logic
 * 3. Add backend API routes
 * 4. Add proper form/modal for requests
 *
 * NOTE: This feature is REQUEST-ONLY and observation-based.
 * Sprout does not arrange or supervise visits.
 */

// Feature toggle - set to true to enable the feature in the future
const FEATURE_ENABLED = false;

export function WorkplaceInsightPlaceholder({
  goalTitle,
}: WorkplaceInsightPlaceholderProps) {
  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Workplace Insight (Pilot)
        </h4>

        <p className="text-sm text-muted-foreground mb-3">
          In the future, you may be able to request a short, observational visit
          to see how people work in this role.
        </p>

        <p className="text-xs text-muted-foreground mb-4">
          Observation only. Unpaid. Always at the employer&apos;s discretion.
        </p>

        <Button
          variant="outline"
          size="sm"
          disabled={!FEATURE_ENABLED}
          className="w-full text-muted-foreground"
          onClick={
            FEATURE_ENABLED
              ? () => {
                  // Future: Open request modal/form
                  console.log("Request insight visit for:", goalTitle);
                }
              : undefined
          }
        >
          Request an insight visit
        </Button>

        {!FEATURE_ENABLED && (
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            This feature isn&apos;t active yet.
          </p>
        )}
      </div>
    </div>
  );
}
