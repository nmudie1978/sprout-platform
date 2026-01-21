"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Visual variation types
export type JourneyVisualVariation = "earthy" | "optimistic" | "minimal";

// Color palettes for each variation
const COLOR_PALETTES = {
  earthy: {
    sky: ["#E8E4DF", "#D4C9BE"],
    hills: ["#8B9A7D", "#6B7A5D", "#4A5A3D"],
    path: "#C4B5A3",
    pathHighlight: "#A89580",
    markers: "#7A6B5A",
    currentPoint: "#D4956A",
    currentGlow: "#E8B090",
    futurePaths: "#B8A896",
    ground: "#9BA38D",
    accent: "#8B6B4A",
  },
  optimistic: {
    sky: ["#F0F7FF", "#E0F0FF"],
    hills: ["#A8D5BA", "#7EC9A4", "#5BB88A"],
    path: "#F5EDE3",
    pathHighlight: "#E8DDD0",
    markers: "#9BC4B0",
    currentPoint: "#FFD166",
    currentGlow: "#FFEBB0",
    futurePaths: "#D4E8DC",
    ground: "#B8D9C8",
    accent: "#5BB88A",
  },
  minimal: {
    sky: ["#FAFBFC", "#F5F7F9"],
    hills: ["#E2E8F0", "#CBD5E1", "#94A3B8"],
    path: "#F1F5F9",
    pathHighlight: "#E2E8F0",
    markers: "#94A3B8",
    currentPoint: "#A5B4C4",
    currentGlow: "#CBD5E1",
    futurePaths: "#E2E8F0",
    ground: "#E2E8F0",
    accent: "#64748B",
  },
};

// Timeline entry for interactive markers
export interface JourneyMarker {
  id: string;
  position: "past" | "present" | "future";
  label?: string;
  href?: string;
}

interface JourneyVisualAnchorProps {
  variation?: JourneyVisualVariation;
  markers?: JourneyMarker[];
  weeklyFocusLabel?: string;
  onMarkerClick?: (marker: JourneyMarker) => void;
  onCurrentPointClick?: () => void;
  className?: string;
}

export function JourneyVisualAnchor({
  variation = "optimistic",
  markers = [],
  weeklyFocusLabel,
  onMarkerClick,
  onCurrentPointClick,
  className = "",
}: JourneyVisualAnchorProps) {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [showFocusTooltip, setShowFocusTooltip] = useState(false);
  const palette = COLOR_PALETTES[variation];

  // Filter markers by position
  const pastMarkers = markers.filter((m) => m.position === "past");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
    >
      <svg
        viewBox="0 0 800 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="A peaceful landscape with a winding path representing your personal journey"
      >
        <defs>
          {/* Sky gradient */}
          <linearGradient id={`sky-${variation}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.sky[0]} />
            <stop offset="100%" stopColor={palette.sky[1]} />
          </linearGradient>

          {/* Soft glow for current point */}
          <radialGradient id={`currentGlow-${variation}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.currentGlow} stopOpacity="0.8" />
            <stop offset="70%" stopColor={palette.currentGlow} stopOpacity="0.2" />
            <stop offset="100%" stopColor={palette.currentGlow} stopOpacity="0" />
          </radialGradient>

          {/* Path gradient for depth */}
          <linearGradient id={`pathGradient-${variation}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.path} stopOpacity="0.6" />
            <stop offset="40%" stopColor={palette.path} />
            <stop offset="60%" stopColor={palette.pathHighlight} />
            <stop offset="100%" stopColor={palette.futurePaths} stopOpacity="0.4" />
          </linearGradient>

          {/* Subtle hill shadows */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.1" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky background */}
        <rect width="800" height="280" fill={`url(#sky-${variation})`} />

        {/* Distant hills - back layer */}
        <motion.path
          d="M0 180 Q100 140 200 160 Q300 180 400 150 Q500 120 600 145 Q700 170 800 140 L800 280 L0 280 Z"
          fill={palette.hills[0]}
          filter="url(#softShadow)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />

        {/* Middle hills */}
        <motion.path
          d="M0 200 Q80 170 160 185 Q280 200 380 175 Q480 150 560 170 Q680 190 800 165 L800 280 L0 280 Z"
          fill={palette.hills[1]}
          filter="url(#softShadow)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Foreground hills with ground */}
        <motion.path
          d="M0 230 Q100 205 200 220 Q350 240 450 215 Q550 190 650 210 Q750 230 800 215 L800 280 L0 280 Z"
          fill={palette.hills[2]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Ground base */}
        <rect y="245" width="800" height="35" fill={palette.ground} />

        {/* Main journey path - starts wide near viewer, narrows toward horizon */}
        <motion.path
          d="M100 270
             C120 268 140 265 160 260
             Q200 250 240 245
             Q300 238 360 235
             L400 232
             Q440 230 480 228
             Q540 225 600 222
             Q660 220 720 218
             L780 215"
          fill="none"
          stroke={`url(#pathGradient-${variation})`}
          strokeWidth="28"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
        />

        {/* Path edge detail */}
        <motion.path
          d="M100 270
             C120 268 140 265 160 260
             Q200 250 240 245
             Q300 238 360 235
             L400 232
             Q440 230 480 228
             Q540 225 600 222
             Q660 220 720 218
             L780 215"
          fill="none"
          stroke={palette.pathHighlight}
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.5 }}
        />

        {/* Future branching paths - faint, suggesting possibilities */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {/* Upper future path */}
          <path
            d="M580 223 Q620 215 660 205 Q700 195 740 190 L780 185"
            fill="none"
            stroke={palette.futurePaths}
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Lower future path */}
          <path
            d="M580 223 Q620 228 660 235 Q700 242 740 248 L780 252"
            fill="none"
            stroke={palette.futurePaths}
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Middle-upper subtle path */}
          <path
            d="M620 220 Q660 212 700 200 L760 192"
            fill="none"
            stroke={palette.futurePaths}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.25"
          />
        </motion.g>

        {/* Past markers along the path */}
        {pastMarkers.slice(0, 4).map((marker, index) => {
          // Position markers along the path (behind current point)
          const positions = [
            { x: 180, y: 255 },
            { x: 250, y: 248 },
            { x: 320, y: 242 },
            { x: 380, y: 236 },
          ];
          const pos = positions[index];
          const isHovered = hoveredMarker === marker.id;

          return (
            <motion.g
              key={marker.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              onMouseEnter={() => setHoveredMarker(marker.id)}
              onMouseLeave={() => setHoveredMarker(null)}
              onClick={() => onMarkerClick?.(marker)}
              style={{ cursor: onMarkerClick ? "pointer" : "default" }}
            >
              {/* Marker dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 7 : 5}
                fill={palette.markers}
                opacity={isHovered ? 1 : 0.7}
                className="transition-all duration-200"
              />
              {/* Marker ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 11 : 8}
                fill="none"
                stroke={palette.markers}
                strokeWidth="1.5"
                opacity={isHovered ? 0.6 : 0.3}
                className="transition-all duration-200"
              />
              {/* Tooltip on hover */}
              {isHovered && marker.label && (
                <g>
                  <rect
                    x={pos.x - 40}
                    y={pos.y - 28}
                    width="80"
                    height="18"
                    rx="4"
                    fill={palette.accent}
                    opacity="0.9"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 16}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {marker.label.length > 12
                      ? marker.label.slice(0, 12) + "..."
                      : marker.label}
                  </text>
                </g>
              )}
            </motion.g>
          );
        })}

        {/* Current point - the "you are here" moment */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2, type: "spring", stiffness: 200 }}
          onMouseEnter={() => setShowFocusTooltip(true)}
          onMouseLeave={() => setShowFocusTooltip(false)}
          onClick={onCurrentPointClick}
          style={{ cursor: onCurrentPointClick ? "pointer" : "default" }}
        >
          {/* Outer glow */}
          <circle cx="440" cy="230" r="24" fill={`url(#currentGlow-${variation})`} />

          {/* Pulse animation ring */}
          <motion.circle
            cx="440"
            cy="230"
            r="14"
            fill="none"
            stroke={palette.currentPoint}
            strokeWidth="2"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Inner solid point */}
          <circle
            cx="440"
            cy="230"
            r="10"
            fill={palette.currentPoint}
            className="drop-shadow-sm"
          />

          {/* Center highlight */}
          <circle cx="437" cy="227" r="3" fill="white" opacity="0.5" />

          {/* Weekly focus tooltip */}
          {showFocusTooltip && weeklyFocusLabel && (
            <motion.g
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <rect
                x="380"
                y="195"
                width="120"
                height="24"
                rx="6"
                fill={palette.accent}
                opacity="0.95"
              />
              <text
                x="440"
                y="211"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="500"
              >
                {weeklyFocusLabel}
              </text>
            </motion.g>
          )}
        </motion.g>

        {/* Subtle texture overlay for warmth */}
        <rect
          width="800"
          height="280"
          fill="url(#noise)"
          opacity="0.03"
          style={{ mixBlendMode: "multiply" }}
        />
      </svg>

      {/* Subtle gradient fade at bottom to blend with content below */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, hsl(var(--background)))`,
        }}
      />
    </motion.div>
  );
}

// Pre-configured variation components for convenience
export function JourneyVisualEarthy(
  props: Omit<JourneyVisualAnchorProps, "variation">
) {
  return <JourneyVisualAnchor {...props} variation="earthy" />;
}

export function JourneyVisualOptimistic(
  props: Omit<JourneyVisualAnchorProps, "variation">
) {
  return <JourneyVisualAnchor {...props} variation="optimistic" />;
}

export function JourneyVisualMinimal(
  props: Omit<JourneyVisualAnchorProps, "variation">
) {
  return <JourneyVisualAnchor {...props} variation="minimal" />;
}

export default JourneyVisualAnchor;
