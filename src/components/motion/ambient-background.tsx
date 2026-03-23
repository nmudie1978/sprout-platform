'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion, DURATION } from '@/lib/motion';

/**
 * Ambient Background Component
 *
 * Subtle, non-distracting animated gradient orbs that create
 * a calm, premium atmosphere in the My Journey header area.
 *
 * Features:
 * - Very low-contrast floating gradients
 * - Respects prefers-reduced-motion
 * - Does not reduce readability
 * - Calm 20-40s animation loops
 */

interface AmbientBackgroundProps {
  enabled?: boolean;
  className?: string;
}

export function AmbientBackground({
  enabled = true,
  className = '',
}: AmbientBackgroundProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Only animate if enabled and user doesn't prefer reduced motion
    setShouldAnimate(enabled && !prefersReducedMotion());
  }, [enabled]);

  if (!enabled) return null;

  // Static version for reduced motion or SSR
  if (!shouldAnimate) {
    return (
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-100/30 to-teal-100/20 blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-gradient-to-br from-teal-100/25 to-emerald-100/15 blur-[80px]" />
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Primary orb - blue/teal blend (Discover + Understand) */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-100/30 to-teal-100/20 blur-[80px]"
        initial={{ x: '25%', y: '-10%' }}
        animate={{
          x: ['25%', '30%', '20%', '25%'],
          y: ['-10%', '5%', '-5%', '-10%'],
        }}
        transition={{
          duration: DURATION.ambient,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Secondary orb - teal/emerald blend (Understand + Act) */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-br from-teal-100/25 to-emerald-100/15 blur-[80px]"
        initial={{ x: '60%', y: '60%' }}
        animate={{
          x: ['60%', '55%', '65%', '60%'],
          y: ['60%', '70%', '55%', '60%'],
        }}
        transition={{
          duration: DURATION.ambient * 1.2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Tertiary orb - subtle accent */}
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full bg-gradient-to-br from-emerald-100/15 to-blue-100/10 blur-[60px]"
        initial={{ x: '80%', y: '20%' }}
        animate={{
          x: ['80%', '75%', '85%', '80%'],
          y: ['20%', '30%', '15%', '20%'],
        }}
        transition={{
          duration: DURATION.ambient * 0.9,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />
    </div>
  );
}

/**
 * Floating Nodes Background
 *
 * Alternative ambient background with subtle floating SVG nodes
 * connected by faint lines - representing the journey path.
 */

interface FloatingNodesProps {
  enabled?: boolean;
  className?: string;
}

export function FloatingNodes({
  enabled = true,
  className = '',
}: FloatingNodesProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    setShouldAnimate(enabled && !prefersReducedMotion());
  }, [enabled]);

  if (!enabled) return null;

  const nodes = [
    { x: 15, y: 30, color: 'text-blue-300/40', delay: 0 },
    { x: 35, y: 15, color: 'text-teal-300/40', delay: 0.5 },
    { x: 55, y: 45, color: 'text-emerald-300/40', delay: 1 },
    { x: 75, y: 25, color: 'text-blue-300/30', delay: 1.5 },
    { x: 85, y: 60, color: 'text-teal-300/30', delay: 2 },
  ];

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection lines */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(147 197 253 / 0.15)" />
            <stop offset="50%" stopColor="rgb(196 181 253 / 0.15)" />
            <stop offset="100%" stopColor="rgb(167 243 208 / 0.15)" />
          </linearGradient>
        </defs>

        {/* Subtle connecting path */}
        <motion.path
          d="M 15% 30% Q 25% 10% 35% 15% T 55% 45% T 75% 25% T 85% 60%"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={shouldAnimate ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 3, ease: 'easeOut' }}
        />
      </svg>

      {/* Floating nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          className={`absolute w-3 h-3 rounded-full ${node.color} bg-current`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={
            shouldAnimate
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.6, 0.4],
                  y: [0, -5, 0],
                }
              : { scale: 1, opacity: 0.4 }
          }
          transition={
            shouldAnimate
              ? {
                  scale: { duration: 4, repeat: Infinity, delay: node.delay },
                  opacity: { duration: 4, repeat: Infinity, delay: node.delay },
                  y: { duration: 4, repeat: Infinity, delay: node.delay },
                }
              : { duration: 0.5, delay: node.delay }
          }
        />
      ))}
    </div>
  );
}
