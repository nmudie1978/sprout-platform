"use client";

import { cn } from "@/lib/utils";

interface BackgroundGradientGlowProps {
  className?: string;
  children?: React.ReactNode;
  /** "sunny" uses a soft centered yellow glow. "sunny-strong" uses a brighter yellow. */
  variant?: "sunny" | "sunny-strong";
}

export function BackgroundGradientGlow({
  className,
  children,
  variant = "sunny",
}: BackgroundGradientGlowProps) {
  return (
    <div className={cn("min-h-screen w-full relative bg-white", className)}>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            variant === "sunny"
              ? "radial-gradient(circle at center, #FFF991 0%, transparent 70%)"
              : "radial-gradient(circle at center, #fde047, transparent)",
          ...(variant === "sunny"
            ? { opacity: 0.6, mixBlendMode: "multiply" as const }
            : {}),
        }}
      />
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
