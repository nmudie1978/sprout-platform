"use client";

import { cn } from "@/lib/utils";

interface BackgroundGradientGlowProps {
  className?: string;
  children?: React.ReactNode;
  /**
   * - "aurora": lavender/yellow/pink/blue corner whispers on a cream base
   * - "dreamy-sunset": sunset cream → peach → purple gradient with radial blooms
   * - "sunny": soft centered yellow glow
   * - "sunny-strong": brighter yellow
   */
  variant?: "aurora" | "dreamy-sunset" | "sunny" | "sunny-strong";
  /** When true, the gradient is rendered fixed to the viewport (not scroll-bound). */
  fixed?: boolean;
}

const GRADIENTS: Record<NonNullable<BackgroundGradientGlowProps["variant"]>, string> = {
  aurora: `
    radial-gradient(ellipse 85% 65% at 8% 8%, rgba(175, 109, 255, 0.42), transparent 60%),
    radial-gradient(ellipse 75% 60% at 75% 35%, rgba(255, 235, 170, 0.55), transparent 62%),
    radial-gradient(ellipse 70% 60% at 15% 80%, rgba(255, 100, 180, 0.40), transparent 62%),
    radial-gradient(ellipse 70% 60% at 92% 92%, rgba(120, 190, 255, 0.45), transparent 62%),
    linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)
  `,
  "dreamy-sunset": `
    linear-gradient(180deg,
      rgba(245,245,220,1) 0%,
      rgba(255,223,186,0.8) 25%,
      rgba(255,182,193,0.6) 50%,
      rgba(147,112,219,0.7) 75%,
      rgba(72,61,139,0.9) 100%
    ),
    radial-gradient(circle at 30% 20%, rgba(255,255,224,0.4) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(72,61,139,0.6) 0%, transparent 70%),
    radial-gradient(circle at 50% 60%, rgba(147,112,219,0.3) 0%, transparent 60%)
  `,
  sunny: "radial-gradient(circle at center, #FFF991 0%, transparent 70%)",
  "sunny-strong": "radial-gradient(circle at center, #fde047, transparent)",
};

export function BackgroundGradientGlow({
  className,
  children,
  variant = "aurora",
  fixed = false,
}: BackgroundGradientGlowProps) {
  return (
    <div className={cn(!fixed && "min-h-screen w-full", !fixed && "relative", className)}>
      <div
        className={cn(
          "z-0 pointer-events-none",
          fixed ? "fixed inset-0" : "absolute inset-0"
        )}
        aria-hidden
        style={{
          background: GRADIENTS[variant],
          ...(variant === "sunny"
            ? { opacity: 0.6, mixBlendMode: "multiply" as const }
            : {}),
        }}
      />
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
