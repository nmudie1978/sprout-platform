/**
 * Motion Utilities for Sprout
 *
 * Premium, calm, intentional animations following Apple Education aesthetic.
 * No bounce, no confetti, no gamification effects.
 *
 * Motion Design Principles:
 * - Calm, intentional, premium
 * - Consistent easing everywhere
 * - Respect reduced motion preferences
 */

import { Variants, Transition } from 'framer-motion';

// ============================================
// FEATURE FLAG
// ============================================

/**
 * Check if motion trial is enabled via environment variable
 */
export const isMotionTrialEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_MOTION_TRIAL === 'true';
  }
  return process.env.NEXT_PUBLIC_MOTION_TRIAL === 'true';
};

// ============================================
// REDUCED MOTION DETECTION
// ============================================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ============================================
// EASING CURVES
// ============================================

/**
 * Premium easing curve - smooth deceleration
 * Matches Apple's animation style
 */
export const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Subtle easing for micro-interactions
 */
export const SUBTLE_EASE = [0.25, 0.1, 0.25, 1] as const;

// ============================================
// DURATION GUIDELINES
// ============================================

export const DURATION = {
  /** Micro interactions: hover, press, toggle - 0.15-0.25s */
  micro: 0.2,
  /** Standard transitions - 0.35s */
  standard: 0.35,
  /** Section transitions - 0.45s */
  section: 0.45,
  /** Page transitions - 0.6s */
  page: 0.6,
  /** Ambient background loops - 20-40s */
  ambient: 30,
} as const;

// ============================================
// TRANSITION PRESETS
// ============================================

/**
 * Standard premium transition
 */
export const premiumTransition: Transition = {
  duration: DURATION.standard,
  ease: PREMIUM_EASE as unknown as string,
};

/**
 * Micro interaction transition (buttons, toggles)
 */
export const microTransition: Transition = {
  duration: DURATION.micro,
  ease: PREMIUM_EASE as unknown as string,
};

/**
 * Section transition (card reveals, tab changes)
 */
export const sectionTransition: Transition = {
  duration: DURATION.section,
  ease: PREMIUM_EASE as unknown as string,
};

/**
 * Page-level transition
 */
export const pageTransition: Transition = {
  duration: DURATION.page,
  ease: PREMIUM_EASE as unknown as string,
};

// ============================================
// STAGGER CONFIGURATION
// ============================================

export const STAGGER = {
  /** Fast stagger for list items */
  fast: 0.05,
  /** Standard stagger */
  standard: 0.08,
  /** Slow stagger for emphasis */
  slow: 0.12,
} as const;

/**
 * Stagger children transition preset
 */
export const staggerContainer = (
  staggerDelay: number = STAGGER.standard,
  delayChildren: number = 0.06
): Transition => ({
  staggerChildren: staggerDelay,
  delayChildren,
});

// ============================================
// ANIMATION VARIANTS
// ============================================

/**
 * Fade in from below - standard page/section entry
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: premiumTransition,
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: { ...premiumTransition, duration: DURATION.standard * 0.75 },
  },
};

/**
 * Simple fade - for subtle reveals
 */
export const fade: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: premiumTransition,
  },
  exit: {
    opacity: 0,
    transition: { ...premiumTransition, duration: DURATION.standard * 0.75 },
  },
};

/**
 * Stagger container for lists
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: staggerContainer(),
  },
};

/**
 * Child item for stagger container
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: premiumTransition,
  },
};

/**
 * Card expand/collapse animation
 */
export const cardExpand: Variants = {
  collapsed: {
    height: 'auto',
    opacity: 1,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: DURATION.standard, ease: PREMIUM_EASE as unknown as string },
      opacity: { duration: DURATION.micro },
    },
  },
};

/**
 * Subtle breathing animation for active elements
 * Very subtle opacity pulse - not distracting
 */
export const breathe: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: [1, 0.85, 1],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * Slide indicator animation (for tabs, pills)
 */
export const slideIndicator: Variants = {
  initial: { x: 0 },
  animate: (custom: number) => ({
    x: custom,
    transition: {
      type: 'tween',
      duration: DURATION.standard,
      ease: PREMIUM_EASE as unknown as string,
    },
  }),
};

// ============================================
// MICRO INTERACTION VARIANTS
// ============================================

/**
 * Button hover - subtle lift effect
 */
export const buttonHover = {
  rest: {
    y: 0,
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
  hover: {
    y: -1,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    transition: microTransition,
  },
  tap: {
    y: 0,
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    transition: { duration: 0.1 },
  },
};

/**
 * Tab underline animation
 */
export const tabUnderline: Variants = {
  inactive: {
    scaleX: 0,
    opacity: 0,
  },
  active: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: DURATION.standard,
      ease: PREMIUM_EASE as unknown as string,
    },
  },
};

// ============================================
// TOAST ANIMATION
// ============================================

export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: premiumTransition,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { ...premiumTransition, duration: DURATION.standard * 0.75 },
  },
};

// ============================================
// CONDITIONAL MOTION HELPER
// ============================================

/**
 * Returns motion props only if motion trial is enabled and reduced motion is not preferred
 */
export function getMotionProps<T extends object>(
  props: T,
  options?: { respectReducedMotion?: boolean }
): T | Record<string, never> {
  const { respectReducedMotion = true } = options ?? {};

  if (!isMotionTrialEnabled()) {
    return {};
  }

  if (respectReducedMotion && prefersReducedMotion()) {
    return {};
  }

  return props;
}

/**
 * Returns reduced variants if user prefers reduced motion
 */
export function getReducedVariants(
  fullVariants: Variants,
  reducedVariants?: Variants
): Variants {
  if (prefersReducedMotion()) {
    return reducedVariants ?? {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }
  return fullVariants;
}
