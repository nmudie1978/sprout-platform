'use client';

import { forwardRef, ReactNode, useState } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  fadeInUp,
  staggerItem,
  staggerContainer,
  STAGGER,
  premiumTransition,
  microTransition,
  prefersReducedMotion,
  isMotionTrialEnabled,
  PREMIUM_EASE,
  DURATION,
} from '@/lib/motion';

// ============================================
// MOTION WRAPPER - Conditionally applies motion
// ============================================

interface MotionWrapperProps {
  children: ReactNode;
  enabled?: boolean;
  className?: string;
}

/**
 * Wrapper that conditionally renders motion or static elements
 */
export function MotionWrapper({
  children,
  enabled = true,
  className,
}: MotionWrapperProps) {
  const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER CONTAINER
// ============================================

interface StaggerContainerProps {
  children: ReactNode;
  enabled?: boolean;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  enabled = true,
  className,
  staggerDelay = STAGGER.standard,
}: StaggerContainerProps) {
  const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: staggerContainer(staggerDelay),
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER ITEM
// ============================================

interface StaggerItemProps {
  children: ReactNode;
  enabled?: boolean;
  className?: string;
}

export function StaggerItem({
  children,
  enabled = true,
  className,
}: StaggerItemProps) {
  const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED BUTTON (Micro Interactions)
// ============================================

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  enabled?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, enabled = true, className, ...props }, ref) => {
    const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();

    if (!shouldAnimate) {
      return (
        <button ref={ref} className={className} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
          {children}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={className}
        whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        whileTap={{ y: 0, scale: 0.98 }}
        transition={microTransition}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedButton.displayName = 'AnimatedButton';

// ============================================
// ANIMATED TAB INDICATOR
// ============================================

interface AnimatedTabIndicatorProps {
  layoutId: string;
  className?: string;
  enabled?: boolean;
}

export function AnimatedTabIndicator({
  layoutId,
  className,
  enabled = true,
}: AnimatedTabIndicatorProps) {
  const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={cn('absolute bottom-0 left-0 right-0 h-0.5 bg-primary', className)} />;
  }

  return (
    <motion.div
      layoutId={layoutId}
      className={cn('absolute bottom-0 left-0 right-0 h-0.5 bg-primary', className)}
      transition={{
        type: 'tween',
        duration: DURATION.standard,
        ease: PREMIUM_EASE as unknown as string,
      }}
    />
  );
}

// ============================================
// EXPANDABLE CARD
// ============================================

interface ExpandableCardProps {
  children: ReactNode;
  expanded: boolean;
  onToggle?: () => void;
  header: ReactNode;
  className?: string;
  enabled?: boolean;
}

export function ExpandableCard({
  children,
  expanded,
  onToggle,
  header,
  className,
  enabled = true,
}: ExpandableCardProps) {
  const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div
        className="cursor-pointer"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle?.();
          }
        }}
      >
        {header}
      </div>

      {shouldAnimate ? (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={premiumTransition}
              style={{ overflow: 'hidden' }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        expanded && <div>{children}</div>
      )}
    </div>
  );
}

// ============================================
// CROSSFADE CONTENT
// ============================================

interface CrossfadeContentProps {
  children: ReactNode;
  contentKey: string;
  className?: string;
  enabled?: boolean;
}

export function CrossfadeContent({
  children,
  contentKey,
  className,
  enabled = true,
}: CrossfadeContentProps) {
  const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={contentKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={premiumTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// BREATHING PILL (Active Stage Indicator)
// ============================================

interface BreathingPillProps {
  children: ReactNode;
  active: boolean;
  className?: string;
  enabled?: boolean;
}

export function BreathingPill({
  children,
  active,
  className,
  enabled = true,
}: BreathingPillProps) {
  const shouldAnimate = active && enabled && isMotionTrialEnabled() && !prefersReducedMotion();

  if (!shouldAnimate) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        className
      )}
      animate={{
        opacity: [1, 0.85, 1],
      }}
      transition={{
        duration: 3,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
    >
      {children}
    </motion.span>
  );
}

// ============================================
// ANIMATED UNDERLINE (For Active Tab)
// ============================================

interface AnimatedUnderlineProps {
  active: boolean;
  className?: string;
  enabled?: boolean;
}

export function AnimatedUnderline({
  active,
  className,
  enabled = true,
}: AnimatedUnderlineProps) {
  const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();

  if (!shouldAnimate) {
    return (
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    );
  }

  return (
    <motion.div
      className={cn('absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left', className)}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{
        scaleX: active ? 1 : 0,
        opacity: active ? 1 : 0,
      }}
      transition={{
        duration: DURATION.standard,
        ease: PREMIUM_EASE as unknown as string,
      }}
    />
  );
}

// ============================================
// STAGE INDICATOR WITH SLIDE ANIMATION
// ============================================

interface StageIndicatorProps {
  stages: { id: string; label: string; color: string }[];
  activeStageId: string;
  onStageChange?: (stageId: string) => void;
  className?: string;
  enabled?: boolean;
}

export function StageIndicator({
  stages,
  activeStageId,
  onStageChange,
  className,
  enabled = true,
}: StageIndicatorProps) {
  const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();
  const activeIndex = stages.findIndex((s) => s.id === activeStageId);

  return (
    <div className={cn('relative flex items-center gap-1 p-1 rounded-full bg-muted', className)}>
      {/* Sliding background indicator */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-y-1 rounded-full bg-background shadow-sm"
          style={{ width: `calc(${100 / stages.length}% - 4px)` }}
          animate={{ x: `calc(${activeIndex * 100}% + ${activeIndex * 4}px)` }}
          transition={{
            type: 'tween',
            duration: DURATION.standard,
            ease: PREMIUM_EASE as unknown as string,
          }}
        />
      )}

      {stages.map((stage, index) => (
        <button
          key={stage.id}
          onClick={() => onStageChange?.(stage.id)}
          className={cn(
            'relative z-10 flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            activeStageId === stage.id
              ? stage.color
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {stage.label}
        </button>
      ))}
    </div>
  );
}

// ============================================
// PAGE ENTRY ANIMATION WRAPPER
// ============================================

interface PageEntryProps {
  children: ReactNode;
  className?: string;
  enabled?: boolean;
}

export function PageEntry({ children, className, enabled = true }: PageEntryProps) {
  const shouldAnimate = enabled && isMotionTrialEnabled() && !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: DURATION.section,
        ease: PREMIUM_EASE as unknown as string,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
