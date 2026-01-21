"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  MessageCircle,
  Zap,
  Users,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

// Types
interface StrengthData {
  reliability: number; // 0-100
  communication: number;
  confidence: number;
  teamwork: number;
  initiative: number;
}

interface StrengthConfig {
  key: keyof StrengthData;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

// Strength configuration
const STRENGTHS: StrengthConfig[] = [
  {
    key: "reliability",
    label: "Reliability",
    icon: User,
    color: "from-blue-500 to-cyan-500",
    description: "Shows up, follows through",
  },
  {
    key: "communication",
    label: "Communication",
    icon: MessageCircle,
    color: "from-purple-500 to-pink-500",
    description: "Clear, responsive, professional",
  },
  {
    key: "confidence",
    label: "Confidence",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    description: "Takes on challenges",
  },
  {
    key: "teamwork",
    label: "Teamwork",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    description: "Works well with others",
  },
  {
    key: "initiative",
    label: "Initiative",
    icon: Lightbulb,
    color: "from-rose-500 to-red-500",
    description: "Acts without being asked",
  },
];

// Strength Bar Component
function StrengthBar({
  strength,
  value,
  index,
}: {
  strength: StrengthConfig;
  value: number;
  index: number;
}) {
  const Icon = strength.icon;
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${strength.color} bg-opacity-10`}>
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <span className="text-sm font-medium">{strength.label}</span>
            <p className="text-[10px] text-muted-foreground">{strength.description}</p>
          </div>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${strength.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${normalizedValue}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

// Radar Chart Component (simplified visual)
function StrengthRadar({ data }: { data: StrengthData }) {
  const size = 160;
  const center = size / 2;
  const maxRadius = size / 2 - 20;

  // Calculate points for the radar shape
  const points = STRENGTHS.map((strength, index) => {
    const angle = (index / STRENGTHS.length) * 2 * Math.PI - Math.PI / 2;
    const value = data[strength.key] / 100;
    const x = center + Math.cos(angle) * maxRadius * value;
    const y = center + Math.sin(angle) * maxRadius * value;
    return { x, y, label: strength.label };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Background grid points
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background grid */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={STRENGTHS.map((_, index) => {
              const angle = (index / STRENGTHS.length) * 2 * Math.PI - Math.PI / 2;
              const x = center + Math.cos(angle) * maxRadius * level;
              const y = center + Math.sin(angle) * maxRadius * level;
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted/20"
          />
        ))}

        {/* Axis lines */}
        {STRENGTHS.map((_, index) => {
          const angle = (index / STRENGTHS.length) * 2 * Math.PI - Math.PI / 2;
          const x = center + Math.cos(angle) * maxRadius;
          const y = center + Math.sin(angle) * maxRadius;
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted/20"
            />
          );
        })}

        {/* Data shape */}
        <motion.path
          d={pathData}
          fill="url(#radarGradient)"
          fillOpacity="0.3"
          stroke="url(#radarStroke)"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data points */}
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="white"
            stroke="url(#radarStroke)"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          />
        ))}

        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Labels */}
      {STRENGTHS.map((strength, index) => {
        const angle = (index / STRENGTHS.length) * 2 * Math.PI - Math.PI / 2;
        const labelRadius = maxRadius + 15;
        const x = center + Math.cos(angle) * labelRadius;
        const y = center + Math.sin(angle) * labelRadius;
        return (
          <div
            key={strength.key}
            className="absolute text-[9px] font-medium text-muted-foreground whitespace-nowrap"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {strength.label}
          </div>
        );
      })}
    </div>
  );
}

// Main Strength Snapshot Component
interface StrengthSnapshotProps {
  data?: Partial<StrengthData>;
  showRadar?: boolean;
}

export function StrengthSnapshot({
  data,
  showRadar = true,
}: StrengthSnapshotProps) {
  // Default/initial values (start low, grow over time)
  const defaultData: StrengthData = {
    reliability: 20,
    communication: 15,
    confidence: 10,
    teamwork: 15,
    initiative: 10,
  };

  const strengthData: StrengthData = {
    ...defaultData,
    ...data,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Strength Snapshot
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Who you're becoming — based on your activity and feedback
        </p>
      </CardHeader>
      <CardContent>
        <div className={`${showRadar ? "flex flex-col md:flex-row gap-6 items-center" : ""}`}>
          {/* Radar Chart (optional) */}
          {showRadar && (
            <div className="shrink-0">
              <StrengthRadar data={strengthData} />
            </div>
          )}

          {/* Strength Bars */}
          <div className="flex-1 space-y-4 w-full">
            {STRENGTHS.map((strength, index) => (
              <StrengthBar
                key={strength.key}
                strength={strength}
                value={strengthData[strength.key]}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Note */}
        <p className="text-[10px] text-muted-foreground mt-4 pt-3 border-t">
          Strengths grow gradually through completed jobs, positive feedback, and consistent activity.
          This is not a score — it's a reflection of your journey.
        </p>
      </CardContent>
    </Card>
  );
}

// Export types
export type { StrengthData };
