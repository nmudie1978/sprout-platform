"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Star,
  TrendingUp,
  Award,
  GraduationCap,
  Building2,
  Sparkles,
  ArrowRight,
  CircleDot,
  Rocket,
  Target,
  Heart,
  Coins,
  Brain,
  Users,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerJourneyProps {
  className?: string;
  variant?: "horizontal" | "vertical";
  showDetails?: boolean;
}

const journeySteps = [
  {
    id: "start",
    title: "Start Small",
    subtitle: "Your First Micro-Jobs",
    description: "Begin with simple local jobs like babysitting, dog walking, or helping neighbors",
    icon: Sparkles,
    color: "from-green-400 to-emerald-500",
    borderColor: "border-green-400",
    bgLight: "bg-green-50",
    benefits: ["Earn your first NOK", "Build confidence", "Learn responsibility"],
    emoji: "🌱",
  },
  {
    id: "build",
    title: "Build Experience",
    subtitle: "Grow Your Skills",
    description: "Complete more jobs, earn reviews, and develop real-world skills",
    icon: Briefcase,
    color: "from-blue-400 to-cyan-500",
    borderColor: "border-blue-400",
    bgLight: "bg-blue-50",
    benefits: ["Collect positive reviews", "Unlock new job types", "Build your profile"],
    emoji: "💪",
  },
  {
    id: "reputation",
    title: "Earn Recognition",
    subtitle: "Bronze → Silver → Gold",
    description: "Your hard work pays off with tier badges and a stellar reputation",
    icon: Award,
    color: "from-yellow-400 to-amber-500",
    borderColor: "border-yellow-400",
    bgLight: "bg-yellow-50",
    benefits: ["Tier badges", "Higher paying jobs", "Employer trust"],
    emoji: "🏆",
  },
  {
    id: "discover",
    title: "Explore Careers",
    subtitle: "Find Your Passion",
    description: "Use your experience to discover career paths that match your skills and interests",
    icon: Target,
    color: "from-purple-400 to-pink-500",
    borderColor: "border-purple-400",
    bgLight: "bg-purple-50",
    benefits: ["Career matching", "Industry insights", "Ask professionals"],
    emoji: "🎯",
  },
  {
    id: "launch",
    title: "Launch Your Career",
    subtitle: "Ready for the Future",
    description: "Your portfolio of work and skills becomes the foundation of your professional journey",
    icon: Rocket,
    color: "from-orange-400 to-red-500",
    borderColor: "border-orange-400",
    bgLight: "bg-orange-50",
    benefits: ["Strong CV foundation", "Proven work ethic", "Real references"],
    emoji: "🚀",
  },
];

const shortTermBenefits = [
  { icon: Coins, label: "Pocket Money", description: "Earn while you learn" },
  { icon: Brain, label: "New Skills", description: "Real-world experience" },
  { icon: Heart, label: "Confidence", description: "Grow self-esteem" },
  { icon: Users, label: "Network", description: "Meet job posters" },
];

const longTermBenefits = [
  { icon: GraduationCap, label: "Career Clarity", description: "Know what you want" },
  { icon: Building2, label: "Job Ready", description: "Stand out to job posters" },
  { icon: Star, label: "References", description: "Proven track record" },
  { icon: TrendingUp, label: "Head Start", description: "Ahead of peers" },
];

export function CareerJourney({ className, variant = "horizontal", showDetails = true }: CareerJourneyProps) {
  return (
    <div className={cn("", className)}>
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
        >
          <Sparkles className="h-4 w-4" />
          Your Growth Journey
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          From <span className="gradient-text">Small Jobs</span> to{" "}
          <span className="gradient-text">Big Dreams</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Every job you complete today plants a seed for tomorrow's success.
          Watch your experience grow into a powerful career foundation.
        </motion.p>
      </div>

      {/* Journey Steps - Horizontal Timeline */}
      <div className="relative mb-16">
        {/* Connecting Line */}
        <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-400 via-yellow-400 via-purple-400 to-orange-400 hidden lg:block" />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Step Card */}
                <div className={cn(
                  "relative rounded-2xl p-5 border-2 transition-all duration-300 hover:shadow-xl group",
                  step.borderColor,
                  step.bgLight,
                  "dark:bg-card dark:border-opacity-50"
                )}>
                  {/* Step Number */}
                  <div className={cn(
                    "absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg bg-gradient-to-br",
                    step.color
                  )}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform",
                    step.color
                  )}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Emoji */}
                  <div className="absolute top-4 right-4 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                    {step.emoji}
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-sm font-medium text-primary mb-2">{step.subtitle}</p>
                  <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

                  {/* Benefits */}
                  {showDetails && (
                    <ul className="space-y-1.5">
                      {step.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Arrow connector (hidden on last item) */}
                {index < journeySteps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Benefits Comparison */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Short-term Benefits */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 dark:border-blue-800 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Short-term Wins</h3>
              <p className="text-sm text-muted-foreground">What you gain today</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {shortTermBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.label}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-black/20"
                >
                  <Icon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{benefit.label}</p>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Long-term Benefits */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 dark:border-purple-800 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Long-term Vision</h3>
              <p className="text-sm text-muted-foreground">Building your future</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {longTermBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.label}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-black/20"
                >
                  <Icon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{benefit.label}</p>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg">
          <Sparkles className="h-5 w-5" />
          Start Your Journey Today
          <ArrowRight className="h-5 w-5" />
        </div>
      </motion.div>
    </div>
  );
}

// Compact version for dashboard
export function CareerJourneyCompact({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border-2 p-6 bg-gradient-to-br from-primary/5 to-purple-500/5", className)}>
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Your Growth Path
      </h3>

      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-4 right-4 h-0.5 bg-gradient-to-r from-green-400 via-blue-400 via-yellow-400 via-purple-400 to-orange-400" />

        {journeySteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br shadow-md",
                step.color
              )}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium mt-2 text-center max-w-[60px]">
                {step.title}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
