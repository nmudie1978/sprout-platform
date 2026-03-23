'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import type { JourneyStepUI, JourneyLens, JourneyStateId } from '@/lib/journey/types';
import { MILESTONES } from '@/lib/my-journey/milestones';
import {
  generateDesktopPath,
  generateMobilePath,
  getNodePosition,
} from '@/lib/roadmap-svg-utils';

// ============================================
// TYPES
// ============================================

export type RoadmapNodeStatus = 'complete' | 'current' | 'locked';

export interface RoadmapNode {
  id: JourneyStateId;
  lens: JourneyLens;
  order: number;
  title: string;
  shortDescription: string;
  whyItMatters: string;
  optional: boolean;
  route: string;
  status: RoadmapNodeStatus;
}

interface JourneyRoadmapProps {
  steps: JourneyStepUI[];
  currentState: JourneyStateId;
  onStepClick?: (stepId: JourneyStateId) => void;
}

// ============================================
// LENS COLORS (Premium, muted palette)
// ============================================

const LENS_COLORS: Record<JourneyLens, {
  primary: string;
  primaryMuted: string;
  glow: string;
  text: string;
  bg: string;
}> = {
  DISCOVER: {
    primary: '#7c3aed',      // Refined violet
    primaryMuted: '#a78bfa',
    glow: 'rgba(124, 58, 237, 0.3)',
    text: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
  },
  UNDERSTAND: {
    primary: '#059669',      // Emerald/teal
    primaryMuted: '#34d399',
    glow: 'rgba(5, 150, 105, 0.3)',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  ACT: {
    primary: '#d97706',      // Warm amber (muted)
    primaryMuted: '#fbbf24',
    glow: 'rgba(217, 119, 6, 0.3)',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
};

// ============================================
// NODE COMPONENT
// ============================================

interface RoadmapNodeComponentProps {
  node: RoadmapNode;
  position: { x: number; y: number };
  isSelected: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  isMobile: boolean;
}

function RoadmapNodeComponent({
  node,
  position,
  isSelected,
  onSelect,
  onNavigate,
  isMobile,
}: RoadmapNodeComponentProps) {
  const colors = LENS_COLORS[node.lens];
  const nodeRadius = isMobile ? 3.5 : 3;

  const getNodeFill = () => {
    switch (node.status) {
      case 'complete':
        return colors.primary;
      case 'current':
        return 'white';
      case 'locked':
        return '#9ca3af'; // Gray
    }
  };

  const getNodeStroke = () => {
    switch (node.status) {
      case 'complete':
        return colors.primary;
      case 'current':
        return colors.primary;
      case 'locked':
        return '#d1d5db';
    }
  };

  return (
    <g
      className="cursor-pointer"
      onClick={onSelect}
      role="button"
      aria-label={`${node.title} - ${node.status}`}
    >
      {/* Glow effect for completed nodes */}
      {node.status === 'complete' && (
        <circle
          cx={position.x}
          cy={position.y}
          r={nodeRadius + 2}
          fill={colors.glow}
          className="animate-pulse"
          style={{ animationDuration: '3s' }}
        />
      )}

      {/* Current node ring */}
      {node.status === 'current' && (
        <circle
          cx={position.x}
          cy={position.y}
          r={nodeRadius + 1.5}
          fill="none"
          stroke={colors.primary}
          strokeWidth="0.5"
          strokeDasharray="2 1"
          className="animate-spin"
          style={{ animationDuration: '8s' }}
        />
      )}

      {/* Main node circle */}
      <circle
        cx={position.x}
        cy={position.y}
        r={nodeRadius}
        fill={getNodeFill()}
        stroke={getNodeStroke()}
        strokeWidth={node.status === 'current' ? 1 : 0.5}
        className="transition-all duration-300"
      />

      {/* Checkmark for completed */}
      {node.status === 'complete' && (
        <path
          d={`M ${position.x - 1.5} ${position.y} L ${position.x - 0.5} ${position.y + 1} L ${position.x + 1.5} ${position.y - 1}`}
          fill="none"
          stroke="white"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Lock icon for locked */}
      {node.status === 'locked' && (
        <g transform={`translate(${position.x - 1}, ${position.y - 1})`}>
          <rect x="0.3" y="0.8" width="1.4" height="1" rx="0.2" fill="#6b7280" />
          <path
            d="M 0.5 0.8 L 0.5 0.4 A 0.5 0.5 0 0 1 1.5 0.4 L 1.5 0.8"
            fill="none"
            stroke="#6b7280"
            strokeWidth="0.3"
          />
        </g>
      )}

      {/* "You are here" indicator for current */}
      {node.status === 'current' && !isMobile && (
        <text
          x={position.x}
          y={position.y - 6}
          textAnchor="middle"
          className="text-[2px] fill-violet-600 dark:fill-violet-400 font-medium"
        >
          You are here
        </text>
      )}

      {/* Optional tag */}
      {node.optional && node.status !== 'complete' && (
        <text
          x={position.x}
          y={position.y + (isMobile ? 6 : 5.5)}
          textAnchor="middle"
          className="text-[1.5px] fill-muted-foreground opacity-70"
        >
          Optional
        </text>
      )}
    </g>
  );
}

// ============================================
// POPOVER COMPONENT
// ============================================

interface NodePopoverProps {
  node: RoadmapNode;
  onClose: () => void;
  onNavigate: () => void;
}

function NodePopover({ node, onClose, onNavigate }: NodePopoverProps) {
  const colors = LENS_COLORS[node.lens];

  const getStatusText = () => {
    switch (node.status) {
      case 'complete':
        return 'Completed';
      case 'current':
        return 'In Progress';
      case 'locked':
        return 'Locked';
    }
  };

  const getStatusColor = () => {
    switch (node.status) {
      case 'complete':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'current':
        return colors.text;
      case 'locked':
        return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'absolute z-50 w-72 p-4 rounded-xl border shadow-lg',
        'bg-card/95 backdrop-blur-sm',
        colors.bg
      )}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn('font-semibold', colors.text)}>
              {node.title}
            </h3>
            {node.optional && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                Optional
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {node.shortDescription}
          </p>
        </div>
        <span className={cn('text-xs font-medium', getStatusColor())}>
          {getStatusText()}
        </span>
      </div>

      {/* Why it matters */}
      <div className="mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          Why it matters
        </p>
        <p className="text-sm text-foreground/90">
          {node.whyItMatters}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {node.status !== 'locked' ? (
          <Link
            href={node.route}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              node.status === 'complete'
                ? 'bg-muted hover:bg-muted/80 text-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={onNavigate}
          >
            {node.status === 'complete' ? 'Review' : 'Go to step'}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground bg-muted/50 cursor-not-allowed">
            <Lock className="h-3.5 w-3.5" />
            Complete previous steps first
          </div>
        )}
        <button
          onClick={onClose}
          className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// LENS LABEL COMPONENT
// ============================================

interface LensLabelProps {
  lens: JourneyLens;
  position: { x: number; y: number };
  isMobile: boolean;
}

function LensLabel({ lens, position, isMobile }: LensLabelProps) {
  const colors = LENS_COLORS[lens];
  const labels: Record<JourneyLens, string> = {
    DISCOVER: 'Discover',
    UNDERSTAND: 'Understand',
    ACT: 'Grow',
  };

  return (
    <text
      x={position.x}
      y={isMobile ? position.y - 3 : position.y + 10}
      textAnchor="middle"
      className={cn('text-[3px] font-semibold uppercase tracking-wider', colors.text)}
      style={{ fill: colors.primary }}
    >
      {labels[lens]}
    </text>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function JourneyRoadmap({ steps, currentState, onStepClick }: JourneyRoadmapProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Convert steps to roadmap nodes
  const nodes: RoadmapNode[] = useMemo(() => {
    return MILESTONES.map((milestone) => {
      const step = steps.find((s) => s.id === milestone.id);

      let status: RoadmapNodeStatus = 'locked';
      if (step) {
        if (step.status === 'completed' || step.status === 'skipped') {
          status = 'complete';
        } else if (step.status === 'next' || step.id === currentState) {
          status = 'current';
        }
      }

      return {
        ...milestone,
        status,
      };
    });
  }, [steps, currentState]);

  // Group nodes by lens for labels
  const lensPositions = useMemo(() => {
    const positions: Record<JourneyLens, { x: number; y: number }> = {
      DISCOVER: { x: 0, y: 0 },
      UNDERSTAND: { x: 0, y: 0 },
      ACT: { x: 0, y: 0 },
    };

    const lenses: JourneyLens[] = ['DISCOVER', 'UNDERSTAND', 'ACT'];
    lenses.forEach((lens) => {
      const lensNodes = nodes.filter((n) => n.lens === lens);
      if (lensNodes.length > 0) {
        const firstIndex = nodes.findIndex((n) => n.id === lensNodes[0].id);
        const lastIndex = nodes.findIndex((n) => n.id === lensNodes[lensNodes.length - 1].id);
        const midIndex = Math.floor((firstIndex + lastIndex) / 2);
        positions[lens] = getNodePosition(midIndex, nodes.length, isMobile);
      }
    });

    return positions;
  }, [nodes, isMobile]);

  const handleNodeSelect = useCallback((node: RoadmapNode) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  }, [selectedNode]);

  const handleNavigate = useCallback(() => {
    setSelectedNode(null);
    if (selectedNode && onStepClick) {
      onStepClick(selectedNode.id);
    }
  }, [selectedNode, onStepClick]);

  // SVG viewBox dimensions
  const viewBox = isMobile ? '0 0 100 120' : '0 0 100 80';
  const svgHeight = isMobile ? 'h-[500px]' : 'h-[300px]';

  return (
    <div className="relative w-full">
      {/* SVG Roadmap */}
      <svg
        viewBox={viewBox}
        className={cn('w-full', svgHeight)}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for the path */}
          <linearGradient id="roadmap-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={LENS_COLORS.DISCOVER.primary} stopOpacity="0.6" />
            <stop offset="50%" stopColor={LENS_COLORS.UNDERSTAND.primary} stopOpacity="0.6" />
            <stop offset="100%" stopColor={LENS_COLORS.ACT.primary} stopOpacity="0.6" />
          </linearGradient>

          {/* Gradient for mobile (vertical) */}
          <linearGradient id="roadmap-gradient-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={LENS_COLORS.DISCOVER.primary} stopOpacity="0.6" />
            <stop offset="50%" stopColor={LENS_COLORS.UNDERSTAND.primary} stopOpacity="0.6" />
            <stop offset="100%" stopColor={LENS_COLORS.ACT.primary} stopOpacity="0.6" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background path (full) */}
        <path
          d={isMobile ? generateMobilePath(nodes.length) : generateDesktopPath(nodes.length)}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          className="text-border opacity-50"
        />

        {/* Progress path (completed portion) */}
        {(() => {
          const completedCount = nodes.filter((n) => n.status === 'complete').length;
          const currentIndex = nodes.findIndex((n) => n.status === 'current');
          const progressIndex = currentIndex >= 0 ? currentIndex : completedCount;

          if (progressIndex > 0) {
            const progressPath = isMobile
              ? generateMobilePath(progressIndex + 1)
              : generateDesktopPath(progressIndex + 1);

            return (
              <path
                d={progressPath}
                fill="none"
                stroke={`url(#${isMobile ? 'roadmap-gradient-vertical' : 'roadmap-gradient'})`}
                strokeWidth="1"
                strokeLinecap="round"
                filter="url(#glow)"
              />
            );
          }
          return null;
        })()}

        {/* Lens labels */}
        {(['DISCOVER', 'UNDERSTAND', 'ACT'] as JourneyLens[]).map((lens) => (
          <LensLabel
            key={lens}
            lens={lens}
            position={lensPositions[lens]}
            isMobile={isMobile}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, index) => {
          const position = getNodePosition(index, nodes.length, isMobile);
          return (
            <RoadmapNodeComponent
              key={node.id}
              node={node}
              position={position}
              isSelected={selectedNode?.id === node.id}
              onSelect={() => handleNodeSelect(node)}
              onNavigate={handleNavigate}
              isMobile={isMobile}
            />
          );
        })}
      </svg>

      {/* Node Labels (outside SVG for better text rendering) */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map((node, index) => {
          const position = getNodePosition(index, nodes.length, isMobile);
          const colors = LENS_COLORS[node.lens];

          // Calculate actual pixel position
          const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
          const containerHeight = isMobile ? 500 : 300;

          const pixelX = (position.x / 100) * containerWidth;
          const pixelY = (position.y / (isMobile ? 120 : 80)) * containerHeight;

          return (
            <div
              key={`label-${node.id}`}
              className={cn(
                'absolute text-[10px] font-medium text-center whitespace-nowrap',
                'transform -translate-x-1/2',
                node.status === 'locked' ? 'text-muted-foreground/60' : colors.text
              )}
              style={{
                left: `${position.x}%`,
                top: isMobile ? `${(position.y / 120) * 100 + 3}%` : `${(position.y / 80) * 100 + 8}%`,
              }}
            >
              {node.title}
            </div>
          );
        })}
      </div>

      {/* Popover */}
      <AnimatePresence>
        {selectedNode && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedNode(null)}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <NodePopover
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="h-2 w-2 text-white" />
          </div>
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-violet-500 bg-white" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span>Locked</span>
        </div>
      </div>
    </div>
  );
}
