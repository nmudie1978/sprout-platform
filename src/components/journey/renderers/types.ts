import type { Journey, JourneyItem } from '@/lib/journey/career-journey-types';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';

export interface CardDataSummary {
  status: 'not_started' | 'in_progress' | 'done';
  stickyNote?: string;
  hasStickyNote: boolean;
  hasNotes: boolean;
}

export interface RendererProps {
  journey: Journey;
  onItemClick: (item: JourneyItem) => void;
  overlayData?: Record<string, NodeOverlayData>;
  activeLayers?: Record<OverlayLayerId, boolean>;
  /** User's current age — used to show "You Are Here" marker */
  userAge?: number;
  /** Per-node card data summaries for visual indicators */
  cardDataMap?: Record<string, CardDataSummary>;
  /** Callback to cycle a node's progress status */
  onProgressCycle?: (itemId: string) => void;
  /** Career title — used for subject alignment on foundation node */
  careerTitle?: string;
  /**
   * Read-only mode for alternate routes from other users. When true:
   * the foundation card is replaced with a neutral "Reference route"
   * banner, the "You are here" marker is hidden, progress cycling is
   * disabled, and nothing is persisted. Used for Markus/Fatima style
   * comparison routes — they're inspiration, not the user's own path.
   */
  readOnly?: boolean;
  /**
   * Simulation state — when set and `isPlaying` is true, the renderer
   * dims non-active steps and disables click handlers. The current
   * step is highlighted as the simulation progresses.
   */
  simulation?: {
    isPlaying: boolean;
    currentStepIndex: number; // -1 = foundation, 0+ = items index
    progress: number; // 0–1 within current step
  };
  /** Scenario overlay — maps step index → overridden title */
  scenarioOverrides?: Map<number, string>;
}
