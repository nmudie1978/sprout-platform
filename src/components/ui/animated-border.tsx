import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBorder({ children, className }: AnimatedBorderProps) {
  return (
    <div className={cn("relative group/border", className)}>
      {/* Outer glow layer */}
      <div
        className="absolute -inset-[1px] z-0 overflow-hidden rounded-2xl blur-[3px]
          before:absolute before:content-[''] before:z-[-1] before:w-[800px] before:h-[800px]
          before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
          before:bg-[conic-gradient(#000,#402fb5_5%,#000_38%,#000_50%,#cf30aa_60%,#000_87%)]
          before:animate-[border-spin_8s_linear_infinite]"
      />
      {/* Inner highlight layer */}
      <div
        className="absolute -inset-[1px] z-0 overflow-hidden rounded-2xl blur-[2px]
          before:absolute before:content-[''] before:z-[-1] before:w-[600px] before:h-[600px]
          before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
          before:bg-[conic-gradient(rgba(0,0,0,0)_0%,#a099d8,rgba(0,0,0,0)_8%,rgba(0,0,0,0)_50%,#dfa2da,rgba(0,0,0,0)_58%)]
          before:animate-[border-spin_8s_linear_infinite] before:brightness-150"
      />
      {/* Inner fill layer */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-2xl blur-[0.5px]
          before:absolute before:content-[''] before:z-[-1] before:w-[600px] before:h-[600px]
          before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
          before:bg-[conic-gradient(#1c191c,#402fb5_5%,#1c191c_14%,#1c191c_50%,#cf30aa_60%,#1c191c_64%)]
          before:animate-[border-spin_8s_linear_infinite] before:brightness-125"
      />
      {/* Content */}
      <div className="relative z-10 rounded-2xl bg-background">
        {children}
      </div>
    </div>
  );
}
