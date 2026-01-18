"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  STAGES,
  STAGE_ORDER,
  TOTAL_STAGES,
  getStageIdFromPath,
  type StageId,
  type ReadinessCheck,
  checkStageReadiness,
} from "@/lib/growth/stage-config";
import { cn } from "@/lib/utils";

interface JourneyMapProps {
  readiness: ReadinessCheck;
  className?: string;
}

export function JourneyMap({ readiness, className }: JourneyMapProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentStageId = getStageIdFromPath(pathname);

  // Determine which stages are "completed" based on current stage
  const getStageStatus = (stageId: StageId): "completed" | "current" | "upcoming" => {
    if (!currentStageId) return "upcoming";

    const currentIndex = STAGE_ORDER.indexOf(currentStageId);
    const stageIndex = STAGE_ORDER.indexOf(stageId);

    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "current";
    return "upcoming";
  };

  // Get current stop number
  const currentStopNumber = currentStageId
    ? STAGES[currentStageId].stopNumber
    : 1;

  // Check if user can advance to next stage
  const currentStage = currentStageId ? STAGES[currentStageId] : null;
  const { canAdvance } = currentStageId
    ? checkStageReadiness(currentStageId, readiness)
    : { canAdvance: false };

  const handleContinue = () => {
    if (currentStage?.nextStage) {
      router.push(STAGES[currentStage.nextStage].route);
    }
  };

  const handleStationClick = (stageId: StageId) => {
    router.push(STAGES[stageId].route);
  };

  return (
    <div className={cn("bg-white rounded-xl border p-4 md:p-6", className)}>
      {/* Subway Line */}
      <div className="relative">
        {/* The Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full" />

        {/* Progress overlay */}
        <motion.div
          className="absolute top-6 left-0 h-1 bg-emerald-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width:
              currentStopNumber === 1
                ? "0%"
                : currentStopNumber === 2
                ? "50%"
                : "100%",
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Stations */}
        <div className="relative flex justify-between">
          {STAGE_ORDER.map((stageId) => {
            const stage = STAGES[stageId];
            const status = getStageStatus(stageId);
            const Icon = stage.icon;

            return (
              <button
                key={stageId}
                onClick={() => handleStationClick(stageId)}
                className="flex flex-col items-center group focus:outline-none"
              >
                {/* Station Dot */}
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors z-10 bg-white",
                    status === "completed" &&
                      "border-emerald-500 bg-emerald-500",
                    status === "current" &&
                      "border-emerald-500 bg-white ring-4 ring-emerald-100",
                    status === "upcoming" && "border-gray-300 bg-white"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status === "completed" ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        status === "current"
                          ? "text-emerald-600"
                          : "text-gray-400"
                      )}
                    />
                  )}
                </motion.div>

                {/* Station Label */}
                <span
                  className={cn(
                    "mt-2 text-sm font-medium transition-colors",
                    status === "current" && "text-emerald-600",
                    status === "completed" && "text-emerald-600",
                    status === "upcoming" && "text-gray-400"
                  )}
                >
                  {stage.label}
                </span>

                {/* Microcopy */}
                <span
                  className={cn(
                    "text-xs transition-colors",
                    status === "current" && "text-gray-600",
                    status === "completed" && "text-gray-500",
                    status === "upcoming" && "text-gray-400"
                  )}
                >
                  {stage.microcopy}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stop Counter and Continue Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
        <p className="text-sm text-gray-500">
          You&apos;re on stop{" "}
          <span className="font-semibold text-gray-700">
            {currentStopNumber}
          </span>{" "}
          of {TOTAL_STAGES}
        </p>

        {currentStage?.nextStage ? (
          <Button
            onClick={handleContinue}
            disabled={!canAdvance}
            className={cn(
              "gap-2",
              canAdvance
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            Continue to {STAGES[currentStage.nextStage].label}
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
            <Check className="w-4 h-4" />
            Final stage reached
          </div>
        )}
      </div>

      {/* Blocker Message */}
      {currentStageId && !canAdvance && currentStage?.nextStage && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-xs text-amber-600 text-center"
        >
          Complete the requirements above to unlock the next stage
        </motion.p>
      )}
    </div>
  );
}

/**
 * Compact version of JourneyMap for mobile/smaller spaces
 */
export function JourneyMapCompact({
  readiness,
  className,
}: JourneyMapProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentStageId = getStageIdFromPath(pathname);

  const currentStopNumber = currentStageId
    ? STAGES[currentStageId].stopNumber
    : 1;

  const currentStage = currentStageId ? STAGES[currentStageId] : null;
  const { canAdvance } = currentStageId
    ? checkStageReadiness(currentStageId, readiness)
    : { canAdvance: false };

  const handleContinue = () => {
    if (currentStage?.nextStage) {
      router.push(STAGES[currentStage.nextStage].route);
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg border p-3 flex items-center justify-between gap-4",
        className
      )}
    >
      {/* Mini progress dots */}
      <div className="flex items-center gap-2">
        {STAGE_ORDER.map((stageId, index) => {
          const isCurrent = stageId === currentStageId;
          const isPast = currentStageId
            ? STAGE_ORDER.indexOf(stageId) < STAGE_ORDER.indexOf(currentStageId)
            : false;

          return (
            <div key={stageId} className="flex items-center">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  isPast && "bg-emerald-500",
                  isCurrent && "bg-emerald-500 ring-2 ring-emerald-200",
                  !isPast && !isCurrent && "bg-gray-300"
                )}
              />
              {index < STAGE_ORDER.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5",
                    isPast ? "bg-emerald-500" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
        <span className="text-xs text-gray-500 ml-2">
          {currentStopNumber}/{TOTAL_STAGES}
        </span>
      </div>

      {/* Mini continue button */}
      {currentStage?.nextStage && (
        <Button
          size="sm"
          onClick={handleContinue}
          disabled={!canAdvance}
          className={cn(
            "text-xs gap-1",
            canAdvance ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-300"
          )}
        >
          Next
          <ArrowRight className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
