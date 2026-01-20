"use client";

import { useState } from "react";

// ============================================================================
// LENS DATA
// ============================================================================

export interface Lens {
  id: "jobs" | "explore" | "insight";
  label: string;
  title: string;
  description: string;
  bullets: string[];
  color: string;
  hoverColor: string;
  textColor: string;
}

export const LENSES: Lens[] = [
  {
    id: "jobs",
    label: "Jobs",
    title: "The Job Lens",
    description: "Learn by doing real, small jobs in your community.",
    bullets: [
      "What work actually feels like",
      "What you're naturally good at",
      "What you enjoy (or don't)",
    ],
    color: "rgba(16, 185, 129, 0.25)",
    hoverColor: "rgba(16, 185, 129, 0.4)",
    textColor: "#059669",
  },
  {
    id: "explore",
    label: "Explore",
    title: "The Exploration Lens",
    description: "Explore roles, paths, and what it really takes to get there.",
    bullets: [
      "What roles and paths exist",
      "What they require",
      "Where they can lead",
    ],
    color: "rgba(59, 130, 246, 0.25)",
    hoverColor: "rgba(59, 130, 246, 0.4)",
    textColor: "#2563eb",
  },
  {
    id: "insight",
    label: "Insight",
    title: "The Insight Lens",
    description: "Understand trends, skills, and the future of work.",
    bullets: [
      "Where industries are heading",
      "What skills are growing",
      "What's changing in the world of work",
    ],
    color: "rgba(139, 92, 246, 0.25)",
    hoverColor: "rgba(139, 92, 246, 0.4)",
    textColor: "#7c3aed",
  },
];

// ============================================================================
// VENN DIAGRAM COMPONENT
// ============================================================================

interface VennDiagramProps {
  activeLens: string | null;
  onLensHover: (id: string | null) => void;
  onLensClick: (id: string) => void;
}

function VennDiagram({ activeLens, onLensHover, onLensClick }: VennDiagramProps) {
  // Circle positions for Venn diagram (equilateral triangle arrangement)
  const circles = [
    { id: "jobs", cx: 140, cy: 180, label: "Jobs", labelY: 160 },
    { id: "explore", cx: 260, cy: 180, label: "Explore", labelY: 160 },
    { id: "insight", cx: 200, cy: 100, label: "Insight", labelY: 80 },
  ];

  return (
    <svg
      viewBox="0 0 400 280"
      className="w-full max-w-md mx-auto"
      role="img"
      aria-label="Three Lenses Venn Diagram showing Jobs, Explore, and Insight overlapping to create clarity"
    >
      <defs>
        {/* Gradients for each circle */}
        <radialGradient id="jobsGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0.15)" />
        </radialGradient>
        <radialGradient id="exploreGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.35)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.15)" />
        </radialGradient>
        <radialGradient id="insightGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.35)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0.15)" />
        </radialGradient>

        {/* Hover state gradients */}
        <radialGradient id="jobsGradientHover" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.5)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0.25)" />
        </radialGradient>
        <radialGradient id="exploreGradientHover" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.25)" />
        </radialGradient>
        <radialGradient id="insightGradientHover" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.5)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0.25)" />
        </radialGradient>

        {/* Center glow */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
          <stop offset="70%" stopColor="rgba(255, 255, 255, 0.4)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </radialGradient>
      </defs>

      {/* Background circles - rendered first for proper layering */}
      {circles.map((circle) => {
        const lens = LENSES.find((l) => l.id === circle.id)!;
        const isActive = activeLens === circle.id;
        const gradientId = isActive
          ? `${circle.id}GradientHover`
          : `${circle.id}Gradient`;

        return (
          <g key={circle.id}>
            <circle
              cx={circle.cx}
              cy={circle.cy}
              r={90}
              fill={`url(#${gradientId})`}
              stroke={isActive ? lens.textColor : "transparent"}
              strokeWidth={isActive ? 2 : 0}
              className="transition-all duration-300 cursor-pointer"
              style={{
                filter: isActive ? `drop-shadow(0 0 12px ${lens.color})` : "none",
              }}
              onMouseEnter={() => onLensHover(circle.id)}
              onMouseLeave={() => onLensHover(null)}
              onClick={() => onLensClick(circle.id)}
              role="button"
              tabIndex={0}
              aria-label={`${circle.label} lens - click or hover for details`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onLensClick(circle.id);
                }
              }}
            />
          </g>
        );
      })}

      {/* Center overlap highlight */}
      <circle
        cx={200}
        cy={150}
        r={28}
        fill="url(#centerGlow)"
        className="pointer-events-none"
      />

      {/* Circle labels */}
      {circles.map((circle) => {
        const lens = LENSES.find((l) => l.id === circle.id)!;
        const isActive = activeLens === circle.id;

        return (
          <text
            key={`label-${circle.id}`}
            x={circle.cx}
            y={circle.labelY}
            textAnchor="middle"
            className={`text-sm font-semibold pointer-events-none transition-all duration-300 ${
              isActive ? "opacity-100" : "opacity-70"
            }`}
            fill={lens.textColor}
          >
            {circle.label}
          </text>
        );
      })}

      {/* Center label */}
      <g className="pointer-events-none">
        <text
          x={200}
          y={146}
          textAnchor="middle"
          className="text-[10px] font-bold uppercase tracking-wider"
          fill="#374151"
        >
          Clear
        </text>
        <text
          x={200}
          y={160}
          textAnchor="middle"
          className="text-[10px] font-bold uppercase tracking-wider"
          fill="#374151"
        >
          View
        </text>
      </g>
    </svg>
  );
}

// ============================================================================
// LENS DETAIL PANEL
// ============================================================================

interface LensDetailProps {
  lens: Lens | null;
}

function LensDetail({ lens }: LensDetailProps) {
  if (!lens) {
    return (
      <div className="text-center py-6 px-4">
        <p className="text-sm text-muted-foreground">
          Hover or tap a lens to learn more
        </p>
      </div>
    );
  }

  return (
    <div
      className="py-4 px-5 rounded-xl transition-all duration-300 animate-fade-in"
      style={{
        backgroundColor: `${lens.color}`,
        borderLeft: `3px solid ${lens.textColor}`,
      }}
    >
      <h4
        className="font-semibold text-base mb-1"
        style={{ color: lens.textColor }}
      >
        {lens.title}
      </h4>
      <p className="text-sm text-foreground/80 mb-3">{lens.description}</p>
      <ul className="space-y-1.5">
        {lens.bullets.map((bullet, i) => (
          <li
            key={i}
            className="text-xs text-muted-foreground flex items-start gap-2"
          >
            <span
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: lens.textColor }}
            />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// MOBILE LENS CARDS
// ============================================================================

interface MobileLensCardProps {
  lens: Lens;
  isActive: boolean;
  onToggle: () => void;
}

function MobileLensCard({ lens, isActive, onToggle }: MobileLensCardProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${
        isActive
          ? "border-transparent shadow-md"
          : "border-border/50 hover:border-border"
      }`}
      style={{
        backgroundColor: isActive ? lens.color : "transparent",
        borderColor: isActive ? lens.textColor : undefined,
      }}
      aria-expanded={isActive}
    >
      <div className="flex items-center justify-between mb-2">
        <h4
          className="font-semibold text-sm"
          style={{ color: isActive ? lens.textColor : undefined }}
        >
          {lens.title}
        </h4>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: lens.textColor }}
        />
      </div>

      <p className="text-xs text-muted-foreground mb-2">{lens.description}</p>

      {isActive && (
        <ul className="space-y-1.5 mt-3 pt-3 border-t border-current/10">
          {lens.bullets.map((bullet, i) => (
            <li
              key={i}
              className="text-xs text-muted-foreground flex items-start gap-2"
            >
              <span
                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: lens.textColor }}
              />
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}

// ============================================================================
// MAIN SECTION COMPONENT
// ============================================================================

export function PillarsSection() {
  const [activeLens, setActiveLens] = useState<string | null>(null);
  const [mobileLens, setMobileLens] = useState<string | null>(null);

  const activeLensData = LENSES.find((l) => l.id === activeLens) || null;

  const handleLensClick = (id: string) => {
    setActiveLens(activeLens === id ? null : id);
  };

  const handleMobileToggle = (id: string) => {
    setMobileLens(mobileLens === id ? null : id);
  };

  return (
    <section
      id="pillars"
      className="py-12 sm:py-16 md:py-20 scroll-mt-20 relative"
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/3 w-56 h-56 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="container px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
            See your future more clearly
          </h2>

          <div className="max-w-xl mx-auto space-y-1">
            <p className="text-sm sm:text-base text-muted-foreground">
              Real work gives you one lens.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground">
              Career exploration gives you another.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground">
              Industry insight gives you a third.
            </p>
            <p className="text-sm sm:text-base font-medium text-foreground mt-2">
              Together, they bring clarity.
            </p>
          </div>
        </div>

        {/* Desktop/Tablet: Venn Diagram with Detail Panel */}
        <div className="hidden sm:block max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Diagram */}
            <div className="order-1">
              <VennDiagram
                activeLens={activeLens}
                onLensHover={setActiveLens}
                onLensClick={handleLensClick}
              />
            </div>

            {/* Detail Panel */}
            <div className="order-2 min-h-[180px]">
              <LensDetail lens={activeLensData} />
            </div>
          </div>

          {/* Legend hint */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Hover or click each lens to explore
          </p>
        </div>

        {/* Mobile: Stacked Cards */}
        <div className="sm:hidden space-y-3">
          {/* Compact diagram for mobile */}
          <div className="mb-6">
            <svg
              viewBox="0 0 200 140"
              className="w-full max-w-[200px] mx-auto"
              aria-hidden="true"
            >
              <circle cx="70" cy="90" r="45" fill="rgba(16, 185, 129, 0.2)" />
              <circle cx="130" cy="90" r="45" fill="rgba(59, 130, 246, 0.2)" />
              <circle cx="100" cy="50" r="45" fill="rgba(139, 92, 246, 0.2)" />
              <circle cx="100" cy="75" r="14" fill="rgba(255,255,255,0.8)" />
              <text
                x="100"
                y="73"
                textAnchor="middle"
                className="text-[6px] font-bold uppercase"
                fill="#374151"
              >
                Clear
              </text>
              <text
                x="100"
                y="81"
                textAnchor="middle"
                className="text-[6px] font-bold uppercase"
                fill="#374151"
              >
                View
              </text>
            </svg>
          </div>

          {/* Lens Cards */}
          {LENSES.map((lens) => (
            <MobileLensCard
              key={lens.id}
              lens={lens}
              isActive={mobileLens === lens.id}
              onToggle={() => handleMobileToggle(lens.id)}
            />
          ))}
        </div>

        {/* Guiding message */}
        <div className="text-center mt-10 sm:mt-12">
          <p className="text-xs sm:text-sm text-muted-foreground italic max-w-md mx-auto">
            You don't need to figure everything out at once.
            <br />
            You just need better focus.
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.animate-fade-in) {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </section>
  );
}

// Legacy exports for compatibility (can be removed if not used elsewhere)
export const PILLARS = LENSES;
export function PillarCard() {
  return null;
}
