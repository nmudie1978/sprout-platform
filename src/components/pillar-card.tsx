"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon, Wallet, Compass, BookOpen, TrendingUp } from "lucide-react";

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
}

// Canonical pillar definitions - edit copy here
export const PILLARS: Pillar[] = [
  {
    key: "earn",
    title: "EARN",
    tagline: "Real pay. Real safety. Real experience.",
    description:
      "Find safe, local micro-jobs designed for teens 16-20. Every adult is verified, every interaction is structured, and you get paid for real work that builds your future.",
    icon: Wallet,
    gradient: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    key: "explore",
    title: "EXPLORE",
    tagline: "Careers without the hype.",
    description:
      "Discover what jobs actually look like day-to-day. Browse real career paths, understand required skills, and get honest 'reality checks' - not glossy brochures.",
    icon: Compass,
    gradient: "from-blue-500 to-cyan-600",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    key: "learn",
    title: "LEARN",
    tagline: "Life skills, right when you need them.",
    description:
      "Get micro-guidance at the moments that matter - before your first job, when handling conflict, or managing your first paycheck. No boring courses, just timely tips.",
    icon: BookOpen,
    gradient: "from-purple-500 to-pink-600",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
  },
  {
    key: "grow",
    title: "GROW",
    tagline: "Build proof of who you're becoming.",
    description:
      "Every job completed adds to your private skill graph. Build trust signals that compound over time and unlock better opportunities. Get guidance when you need it — from understanding what a job really involves to choosing a smart next step.",
    subtext: "Ask questions about roles, skills, or courses — and get clear, practical answers.",
    icon: TrendingUp,
    gradient: "from-orange-500 to-red-600",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
  },
];

interface PillarCardProps {
  pillar: Pillar;
  index: number;
}

export function PillarCard({ pillar, index }: PillarCardProps) {
  const Icon = pillar.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full border-2 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-5 sm:p-6">
          {/* Icon */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}
          >
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>

          {/* Title */}
          <h3
            className={`font-bold text-xl sm:text-2xl mb-1 bg-gradient-to-r ${pillar.gradient} bg-clip-text text-transparent`}
          >
            {pillar.title}
          </h3>

          {/* Tagline */}
          <p className="text-sm sm:text-base font-medium text-foreground/80 mb-3">
            {pillar.tagline}
          </p>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {pillar.description}
          </p>

          {/* Subtext (micro-copy) */}
          {pillar.subtext && (
            <p className="text-xs text-muted-foreground/70 mt-3 italic">
              {pillar.subtext}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
