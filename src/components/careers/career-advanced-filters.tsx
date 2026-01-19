"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  CareerFilterState,
  SalaryRange,
} from "@/lib/career-filters/types";

interface CareerAdvancedFiltersProps {
  filters: CareerFilterState;
  salaryBounds: SalaryRange;
  onEntryLevelChange: (enabled: boolean) => void;
  isOpen: boolean;
}

export function CareerAdvancedFilters({
  filters,
  onEntryLevelChange,
  isOpen,
}: CareerAdvancedFiltersProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="border rounded-lg p-4 mb-4 bg-muted/30">
            {/* Entry Level Only */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="entry-level"
                checked={filters.entryLevelOnly}
                onCheckedChange={(checked) =>
                  onEntryLevelChange(checked === true)
                }
              />
              <label
                htmlFor="entry-level"
                className="text-xs font-medium cursor-pointer"
              >
                Entry-level only
                <span className="text-muted-foreground ml-1">
                  (No higher education required)
                </span>
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
