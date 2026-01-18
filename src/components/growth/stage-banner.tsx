"use client";

import { motion } from "framer-motion";
import { STAGES, getStageBanner, type StageId } from "@/lib/growth/stage-config";
import { cn } from "@/lib/utils";

interface StageBannerProps {
  stageId: StageId;
  className?: string;
}

export function StageBanner({ stageId, className }: StageBannerProps) {
  const stage = STAGES[stageId];
  const banner = getStageBanner(stageId);
  const Icon = stage.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl p-4 md:p-6",
        stageId === "explore" && "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100",
        stageId === "build" && "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100",
        stageId === "apply" && "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-xl shrink-0",
            stageId === "explore" && "bg-blue-100",
            stageId === "build" && "bg-amber-100",
            stageId === "apply" && "bg-emerald-100"
          )}
        >
          <Icon
            className={cn(
              "w-6 h-6",
              stageId === "explore" && "text-blue-600",
              stageId === "build" && "text-amber-600",
              stageId === "apply" && "text-emerald-600"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className={cn(
              "text-lg font-semibold mb-1",
              stageId === "explore" && "text-blue-900",
              stageId === "build" && "text-amber-900",
              stageId === "apply" && "text-emerald-900"
            )}
          >
            {banner.title}
          </h2>
          <p
            className={cn(
              "text-sm",
              stageId === "explore" && "text-blue-700",
              stageId === "build" && "text-amber-700",
              stageId === "apply" && "text-emerald-700"
            )}
          >
            {banner.description}
          </p>
          <p
            className={cn(
              "text-xs mt-2 italic",
              stageId === "explore" && "text-blue-600/70",
              stageId === "build" && "text-amber-600/70",
              stageId === "apply" && "text-emerald-600/70"
            )}
          >
            {banner.purpose}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
