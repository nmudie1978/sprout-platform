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

// Stage-specific color configurations
const STAGE_COLORS: Record<
  StageId,
  {
    primary: string;
    bg: string;
    ring: string;
    text: string;
    gradient: string;
  }
> = {
  explore: {
    primary: "bg-blue-500",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
    text: "text-blue-600",
    gradient: "from-blue-500 to-indigo-500",
  },
  build: {
    primary: "bg-amber-500",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    text: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
  },
  apply: {
    primary: "bg-emerald-500",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    text: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
  },
};

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

  // Get the color for progress bar based on furthest completed stage
  const getProgressGradient = () => {
    if (currentStopNumber >= 3) return "from-blue-500 via-amber-500 to-emerald-500";
    if (currentStopNumber >= 2) return "from-blue-500 to-amber-500";
    return "from-blue-500 to-blue-400";
  };

  return (
    <div className={cn("bg-white rounded-xl border p-4 md:p-6", className)}>
      {/* Subway Line */}
      <div className="relative">
        {/* The Line (background) */}
        <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-100 rounded-full" />

        {/* Progress overlay with gradient */}
        <motion.div
          className={cn(
            "absolute top-6 left-0 h-1.5 rounded-full bg-gradient-to-r",
            getProgressGradient()
          )}
          initial={{ width: "0%" }}
          animate={{
            width:
              currentStopNumber === 1
                ? "0%"
                : currentStopNumber === 2
                ? "50%"
                : "100%",
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Shimmer effect on progress bar */}
        <motion.div
          className="absolute top-6 left-0 h-1.5 w-20 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "500%" }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 3,
          }}
          style={{
            width: currentStopNumber === 1 ? "0%" : currentStopNumber === 2 ? "50%" : "100%",
          }}
        />

        {/* Stations */}
        <div className="relative flex justify-between">
          {STAGE_ORDER.map((stageId, index) => {
            const stage = STAGES[stageId];
            const status = getStageStatus(stageId);
            const Icon = stage.icon;
            const colors = STAGE_COLORS[stageId];

            return (
              <button
                key={stageId}
                onClick={() => handleStationClick(stageId)}
                className="flex flex-col items-center group focus:outline-none"
              >
                {/* Station Dot with stage-specific colors */}
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 bg-white relative",
                    status === "completed" && cn("border-transparent", colors.primary),
                    status === "current" && cn(
                      "border-transparent bg-gradient-to-br",
                      colors.gradient,
                      "ring-4",
                      colors.ring
                    ),
                    status === "upcoming" && "border-gray-200 bg-gray-50"
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.3
                  }}
                  whileHover={{
                    scale: 1.15,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Pulse animation for current stage */}
                  {status === "current" && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-full bg-gradient-to-br opacity-40",
                        colors.gradient
                      )}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {status === "completed" ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Icon
                      className={cn(
                        "w-5 h-5 relative z-10",
                        status === "current" ? "text-white" : "text-gray-400"
                      )}
                    />
                  )}
                </motion.div>

                {/* Station Label with stage-specific colors */}
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={cn(
                    "mt-2 text-sm font-semibold transition-colors",
                    status === "current" && colors.text,
                    status === "completed" && colors.text,
                    status === "upcoming" && "text-gray-400"
                  )}
                >
                  {stage.label}
                </motion.span>

                {/* Microcopy */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className={cn(
                    "text-xs transition-colors",
                    status === "current" && "text-gray-600",
                    status === "completed" && "text-gray-500",
                    status === "upcoming" && "text-gray-400"
                  )}
                >
                  {stage.microcopy}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stop Counter and Continue Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500"
        >
          You&apos;re on stop{" "}
          <span className={cn(
            "font-semibold",
            currentStageId && STAGE_COLORS[currentStageId].text
          )}>
            {currentStopNumber}
          </span>{" "}
          of {TOTAL_STAGES}
        </motion.p>

        {currentStage?.nextStage ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleContinue}
              disabled={!canAdvance}
              className={cn(
                "gap-2 transition-all duration-300",
                canAdvance && currentStage.nextStage === "build" &&
                  "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg",
                canAdvance && currentStage.nextStage === "apply" &&
                  "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg",
                !canAdvance && "bg-gray-300 cursor-not-allowed"
              )}
            >
              Continue to {STAGES[currentStage.nextStage].label}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-sm text-emerald-600 font-medium"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <Check className="w-4 h-4" />
            </motion.div>
            Final stage reached
          </motion.div>
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
      {/* Mini progress dots with stage colors */}
      <div className="flex items-center gap-2">
        {STAGE_ORDER.map((stageId, index) => {
          const isCurrent = stageId === currentStageId;
          const isPast = currentStageId
            ? STAGE_ORDER.indexOf(stageId) < STAGE_ORDER.indexOf(currentStageId)
            : false;
          const colors = STAGE_COLORS[stageId];

          return (
            <div key={stageId} className="flex items-center">
              <motion.div
                className={cn(
                  "w-3 h-3 rounded-full",
                  isPast && colors.primary,
                  isCurrent && cn(colors.primary, "ring-2", colors.ring),
                  !isPast && !isCurrent && "bg-gray-300"
                )}
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {index < STAGE_ORDER.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5",
                    isPast ? STAGE_COLORS[STAGE_ORDER[index]].primary : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
        <span className={cn(
          "text-xs ml-2 font-medium",
          currentStageId ? STAGE_COLORS[currentStageId].text : "text-gray-500"
        )}>
          {currentStopNumber}/{TOTAL_STAGES}
        </span>
      </div>

      {/* Mini continue button with next stage color */}
      {currentStage?.nextStage && (
        <Button
          size="sm"
          onClick={handleContinue}
          disabled={!canAdvance}
          className={cn(
            "text-xs gap-1",
            canAdvance && currentStage.nextStage === "build" &&
              "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
            canAdvance && currentStage.nextStage === "apply" &&
              "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
            !canAdvance && "bg-gray-300"
          )}
        >
          Next
          <ArrowRight className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
