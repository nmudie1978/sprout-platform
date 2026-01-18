"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LucideIcon, Wallet, Compass, BookOpen, TrendingUp } from "lucide-react";
import { useRef, useState } from "react";

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
    tagline: "Real pay. Real safety. Real experience.",
    description:
      "Find safe, local micro-jobs designed for teens 16-20. Every adult is verified, every interaction is structured, and you get paid for real work that builds your future.",
    icon: Wallet,
    gradient: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    glowColor: "rgba(16, 185, 129, 0.4)",
    accentColor: "#10b981",
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
    glowColor: "rgba(59, 130, 246, 0.4)",
    accentColor: "#3b82f6",
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
    glowColor: "rgba(168, 85, 247, 0.4)",
    accentColor: "#a855f7",
  },
  {
    key: "grow",
    title: "GROW",
    tagline: "Build proof of who you're becoming.",
    description:
      "Every job completed adds to your private skill graph. Build trust signals that compound over time and unlock better opportunities.",
    subtext: "Ask questions about roles, skills, or courses — and get clear, practical answers.",
    icon: TrendingUp,
    gradient: "from-orange-500 to-red-600",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
    glowColor: "rgba(249, 115, 22, 0.4)",
    accentColor: "#f97316",
  },
];

// Floating particles component
function FloatingParticles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: color,
            left: `${15 + (i * 15)}%`,
            top: `${20 + (i * 12) % 60}%`,
          }}
          animate={{
            y: [-10, -30, -10],
            x: [0, (i % 2 === 0 ? 10 : -10), 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Animated icon wrapper
function AnimatedIcon({ Icon, gradient }: { Icon: LucideIcon; gradient: string }) {
  return (
    <motion.div
      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
      transition={{ duration: 0.4 }}
    >
      {/* Glow ring */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} blur-xl opacity-0`}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.3 }}
      />

      {/* Rotating border */}
      <motion.div
        className="absolute inset-[-2px] rounded-2xl"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["200% 0%", "-200% 0%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Icon with pulse */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white relative z-10" />
      </motion.div>
    </motion.div>
  );
}

interface PillarCardProps {
  pillar: Pillar;
  index: number;
}

export function PillarCard({ pillar, index }: PillarCardProps) {
  const Icon = pillar.icon;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Staggered entrance animation
  const containerVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.15,
      },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000"
    >
      <Card
        className="h-full border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden relative group"
        style={{
          boxShadow: isHovered
            ? `0 25px 50px -12px ${pillar.glowColor}, 0 0 40px ${pillar.glowColor}`
            : "0 10px 40px -15px rgba(0,0,0,0.1)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${pillar.accentColor}40, transparent, ${pillar.accentColor}40)`,
            padding: "2px",
          }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background: `linear-gradient(105deg, transparent 40%, ${pillar.accentColor}15 45%, ${pillar.accentColor}25 50%, ${pillar.accentColor}15 55%, transparent 60%)`,
            backgroundSize: "200% 100%",
          }}
          animate={isHovered ? {
            backgroundPosition: ["200% 0%", "-200% 0%"],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Floating particles */}
        {isHovered && <FloatingParticles color={pillar.accentColor} />}

        {/* Corner accent */}
        <motion.div
          className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${pillar.gradient} opacity-20 blur-2xl`}
          animate={isHovered ? { scale: 1.5, opacity: 0.4 } : { scale: 1, opacity: 0.2 }}
          transition={{ duration: 0.5 }}
        />

        <CardContent className="p-6 sm:p-7 relative z-10" style={{ transform: "translateZ(50px)" }}>
          {/* Icon with animations */}
          <div className="mb-5">
            <AnimatedIcon Icon={Icon} gradient={pillar.gradient} />
          </div>

          {/* Title with gradient and glow */}
          <motion.h3
            className={`font-bold text-2xl sm:text-3xl mb-2 bg-gradient-to-r ${pillar.gradient} bg-clip-text text-transparent relative`}
            animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {pillar.title}
            {isHovered && (
              <motion.span
                className="absolute inset-0 blur-lg opacity-50"
                style={{ color: pillar.accentColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              >
                {pillar.title}
              </motion.span>
            )}
          </motion.h3>

          {/* Tagline with typewriter-style underline */}
          <div className="relative mb-4">
            <p className="text-sm sm:text-base font-medium text-foreground/90">
              {pillar.tagline}
            </p>
            <motion.div
              className={`h-0.5 bg-gradient-to-r ${pillar.gradient} mt-2 rounded-full`}
              initial={{ width: 0 }}
              whileInView={{ width: "60%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 + 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Description with fade-in words effect on mobile, normal on desktop */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {pillar.description}
          </p>

          {/* Subtext with icon */}
          {pillar.subtext && (
            <motion.p
              className="text-xs text-muted-foreground/80 mt-4 flex items-start gap-2 italic"
              initial={{ opacity: 0.5 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${pillar.gradient} mt-1.5 flex-shrink-0`} />
              {pillar.subtext}
            </motion.p>
          )}

          {/* Bottom accent line that expands on hover */}
          <motion.div
            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${pillar.gradient} rounded-b-xl`}
            initial={{ width: "0%" }}
            animate={isHovered ? { width: "100%" } : { width: "30%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Section wrapper with animated background
export function PillarsSection() {
  return (
    <section id="pillars" className="py-16 sm:py-20 md:py-28 scroll-mt-20 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="container px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 mb-6"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.span>
            How Sprout Helps You Grow
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            The 4 Pillars of{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Sprout
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to go from first job to first career — safely, practically, and at your own pace.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-7xl mx-auto">
          {PILLARS.map((pillar, index) => (
            <PillarCard key={pillar.key} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
