"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  gradientText?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function PageHeader({
  title,
  gradientText,
  description,
  icon: Icon,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("mb-8", className)}
    >
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <motion.div
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="h-6 w-6 text-primary" />
          </motion.div>
        )}
        <h1 className="text-4xl font-bold tracking-tight">
          {title}
          {gradientText && (
            <>
              {" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {gradientText}
              </span>
            </>
          )}
        </h1>
      </div>
      {description && (
        <p className="text-lg text-muted-foreground max-w-3xl">
          {description}
        </p>
      )}
    </motion.div>
  );
}
