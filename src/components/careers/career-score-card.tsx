"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { Career } from "@/lib/career-pathways";

interface CareerScoreCardProps {
  career: Career;
  matchScore: number; // 0–100
  onLearnMore: () => void;
}

type Strength = "weak" | "moderate" | "strong";

const STRENGTH_COLORS: Record<Strength, [string, string, string]> = {
  weak: ["hsl(0, 84%, 78%)", "hsl(0, 84%, 60%)", "hsl(0, 84%, 42%)"],
  moderate: ["hsl(38, 92%, 78%)", "hsl(38, 92%, 60%)", "hsl(38, 92%, 42%)"],
  strong: ["hsl(160, 71%, 78%)", "hsl(160, 71%, 50%)", "hsl(160, 71%, 35%)"],
};

const STRENGTH_LABEL: Record<Strength, string> = {
  weak: "Possible fit",
  moderate: "Good fit",
  strong: "Strong match",
};

const STRENGTH_BADGE: Record<Strength, string> = {
  weak: "bg-red-500/10 text-red-400 border-red-500/20",
  moderate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  strong: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function getStrength(score: number): Strength {
  if (score >= 80) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}

function HalfCircleGauge({ value, gradId }: { value: number; gradId: string }) {
  const strokeRef = useRef<SVGCircleElement>(null);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const strokeDasharray = `${halfCircumference} ${halfCircumference}`;
  // The visible top half corresponds to a dashoffset of -halfCircumference;
  // 0 fills nothing, -halfCircumference fills the entire arc.
  const targetOffset = -Math.min(value / 100, 1) * halfCircumference;
  const strength = getStrength(value);
  const stops = STRENGTH_COLORS[strength];

  useEffect(() => {
    const node = strokeRef.current;
    if (!node) return;
    node.animate(
      [
        { strokeDashoffset: "0", offset: 0 },
        { strokeDashoffset: "0", offset: 0.25 },
        { strokeDashoffset: targetOffset.toString() },
      ],
      {
        duration: 1200,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "forwards",
      },
    );
  }, [targetOffset]);

  return (
    <svg
      className="block mx-auto w-auto max-w-full h-24"
      viewBox="0 0 100 50"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          {stops.map((stop, i) => (
            <stop
              key={i}
              offset={`${(100 / (stops.length - 1)) * i}%`}
              stopColor={stop}
            />
          ))}
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth="9" strokeLinecap="round" transform="translate(50, 50.5)">
        <circle
          className="stroke-muted/25"
          r={radius}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={-halfCircumference}
        />
        <circle
          ref={strokeRef}
          stroke={`url(#${gradId})`}
          r={radius}
          strokeDasharray={strokeDasharray}
        />
      </g>
    </svg>
  );
}

export function CareerScoreCard({ career, matchScore, onLearnMore }: CareerScoreCardProps) {
  const strength = getStrength(matchScore);
  const gradId = `career-grad-${career.id}`;

  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/80 hover:border-pink-500/40 transition-colors h-full flex flex-col">
      <CardContent className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0">{career.emoji}</span>
            <h3 className="text-sm font-semibold truncate">{career.title}</h3>
          </div>
          <Badge variant="outline" className={`shrink-0 text-[9px] uppercase tracking-wider ${STRENGTH_BADGE[strength]}`}>
            {STRENGTH_LABEL[strength]}
          </Badge>
        </div>

        {/* Gauge */}
        <div className="relative -mb-6 mt-1">
          <HalfCircleGauge value={matchScore} gradId={gradId} />
          <div className="absolute inset-x-0 bottom-0 text-center">
            <div className="text-3xl font-semibold tabular-nums leading-none">
              {Math.round(matchScore)}
              <span className="text-base text-muted-foreground/60 font-normal">%</span>
            </div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50 mt-0.5">
              match
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground/75 leading-relaxed line-clamp-2 mt-6 min-h-[2.4rem]">
          {career.description}
        </p>

        {/* Salary chip */}
        {career.avgSalary && (
          <p className="text-[10px] text-muted-foreground/50 tabular-nums">
            {career.avgSalary.split(" ")[0]} kr/year
          </p>
        )}

        {/* CTA */}
        <Button
          onClick={onLearnMore}
          variant="outline"
          size="sm"
          className="w-full mt-auto border-pink-500/30 hover:border-pink-500/60 hover:bg-pink-500/5 text-pink-400 hover:text-pink-300"
        >
          Learn more
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
