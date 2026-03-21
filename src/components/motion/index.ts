/**
 * Motion Components for Endeavrly Motion Trial
 *
 * Premium, calm animations following Apple Education aesthetic.
 * All components respect prefers-reduced-motion and the feature flag.
 */

// Core utilities
export * from '@/lib/motion';

// Background components
export { AmbientBackground, FloatingNodes } from './ambient-background';

// Motion playground (settings panel)
export {
  MotionPlayground,
  useMotionSettings,
  DEFAULT_SETTINGS,
  DEMO_JOURNEY_EVENTS,
  type MotionSettings,
  type DemoJourneyEvent,
} from './motion-playground';

// Reusable motion components
export {
  MotionWrapper,
  StaggerContainer,
  StaggerItem,
  AnimatedButton,
  AnimatedTabIndicator,
  ExpandableCard,
  CrossfadeContent,
  BreathingPill,
  AnimatedUnderline,
  StageIndicator,
  PageEntry,
} from './motion-components';
