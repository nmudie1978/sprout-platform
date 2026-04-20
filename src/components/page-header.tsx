"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Info, LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PageHeaderProps {
  title: string;
  gradientText?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  centered?: boolean;
  infoTooltip?: string;
}

export function PageHeader({
  title,
  gradientText,
  description,
  icon: Icon,
  className,
  centered,
  infoTooltip,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("mb-5 sm:mb-8 relative", className)}
    >
      {infoTooltip && (
        <div className="absolute top-0 right-0">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="h-8 w-8 rounded-full border border-border/50 bg-card/80 flex items-center justify-center hover:bg-card transition-colors cursor-help">
                  <Info className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end" className="max-w-[280px] text-[11px] leading-snug">
                {infoTooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <div className={cn("flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3", centered && "justify-center")}>
        {Icon && (
          <motion.div
            className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="h-4.5 w-4.5 sm:h-6 sm:w-6 text-primary" />
          </motion.div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-foreground">
          {title}
          {gradientText && (
            <>
              {" "}
              <span className="bg-gradient-to-r from-primary via-teal-500 to-pink-500 bg-clip-text text-transparent">
                {gradientText}
              </span>
            </>
          )}
        </h1>
      </div>
      {description && (
        <p className={cn("text-xs sm:text-sm text-white/80 dark:text-muted-foreground/70", centered && "text-center")}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
