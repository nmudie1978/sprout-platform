"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Wallet, Compass, BookOpen, TrendingUp } from "lucide-react";
import { useState } from "react";

// Pillar type definition
export interface Pillar {
  key: "earn" | "explore" | "learn" | "grow";
  title: string;
  tagline: string;
  description: string;
  subtext?: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  glowColor: string;
  accentColor: string;
}

// Canonical pillar definitions - edit copy here
export const PILLARS: Pillar[] = [
  {
    key: "earn",
    title: "EARN",
    tagline: "Trust and responsibility, not hustle.",
    description:
      "Take on real responsibilities with real pay, in a safe and structured way. Every employer is verified, every interaction has clear boundaries. Show up, do something meaningful, and be trusted.",
    icon: Wallet,
    gradient: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    glowColor: "rgba(16, 185, 129, 0.4)",
    accentColor: "#10b981",
  },
  {
    key: "explore",
    title: "EXPLORE",
    tagline: "Clarity before commitment.",
    description:
      "See what work is actually like before you commit to anything. Honest, day-to-day realities — not polished versions. No pressure to pick a direction or make decisions early.",
    icon: Compass,
    gradient: "from-blue-500 to-cyan-600",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    glowColor: "rgba(59, 130, 246, 0.4)",
    accentColor: "#3b82f6",
  },
  {
    key: "learn",
    title: "LEARN",
    tagline: "Guidance when it matters.",
    description:
      "Get practical support for real moments — preparing for your first work experience, handling a difficult situation, or understanding what just happened. Short, optional, and nothing like school.",
    icon: BookOpen,
    gradient: "from-purple-500 to-pink-600",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    glowColor: "rgba(168, 85, 247, 0.4)",
    accentColor: "#a855f7",
  },
  {
    key: "grow",
    title: "GROW",
    tagline: "Proof through actions, not claims.",
    description:
      "Build a quiet record of who you're becoming. Reliability, skills, responsibilities — tracked privately, without leaderboards or follower counts. Your actions speak for themselves over time.",
    icon: TrendingUp,
    gradient: "from-orange-500 to-red-600",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
    glowColor: "rgba(249, 115, 22, 0.4)",
    accentColor: "#f97316",
  },
];


interface PillarCardProps {
  pillar: Pillar;
  index: number;
}

export function PillarCard({ pillar, index }: PillarCardProps) {
  const Icon = pillar.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className="h-full border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden relative group transition-shadow duration-300"
        style={{
          boxShadow: isHovered
            ? `0 20px 40px -12px ${pillar.glowColor}`
            : "0 4px 20px -8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Corner accent */}
        <div
          className={`absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br ${pillar.gradient} opacity-15 blur-2xl transition-opacity duration-300 ${isHovered ? 'opacity-25' : 'opacity-15'}`}
        />

        <CardContent className="p-4 sm:p-5 relative z-10">
          {/* Icon */}
          <div className="mb-3">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center shadow-md transition-transform duration-200 ${isHovered ? 'scale-105' : ''}`}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>

          {/* Title with gradient */}
          <h3 className={`font-bold text-lg sm:text-xl mb-1.5 bg-gradient-to-r ${pillar.gradient} bg-clip-text text-transparent`}>
            {pillar.title}
          </h3>

          {/* Tagline */}
          <div className="relative mb-3">
            <p className="text-xs sm:text-sm font-medium text-foreground/90">
              {pillar.tagline}
            </p>
            <div className={`h-0.5 w-12 bg-gradient-to-r ${pillar.gradient} mt-1.5 rounded-full`} />
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {pillar.description}
          </p>

          {/* Subtext */}
          {pillar.subtext && (
            <p className="text-[11px] text-muted-foreground/80 mt-3 flex items-start gap-2 italic">
              <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${pillar.gradient} mt-1 flex-shrink-0`} />
              {pillar.subtext}
            </p>
          )}

          {/* Bottom accent line */}
          <div
            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${pillar.gradient} rounded-b-xl transition-all duration-300 ${isHovered ? 'w-full' : 'w-1/4'}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Section wrapper - uses CSS animations instead of framer-motion
export function PillarsSection() {
  return (
    <section id="pillars" className="py-12 sm:py-14 md:py-18 scroll-mt-20 relative">
      {/* Decorative elements - static */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 right-10 w-28 h-28 rounded-full bg-purple-500/10 blur-3xl opacity-30" />
      </div>

      <div className="container px-4 relative">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 mb-4">
            <span>✨</span>
            How Sprout Helps You Grow
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            The 4 Pillars of{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Sprout
            </span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Everything you need to go from first job to first career — safely, practically, and at your own pace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-6xl mx-auto">
          {PILLARS.map((pillar, index) => (
            <PillarCard key={pillar.key} pillar={pillar} index={index} />
          ))}
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.animate-fade-in-up) {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
