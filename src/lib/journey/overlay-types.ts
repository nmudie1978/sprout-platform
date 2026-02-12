/**
 * Overlay Layer Types for Roadmap Zigzag Graph
 *
 * Defines the data model for toggleable visual annotations
 * (Progress, Reflections, Resources, Confidence) that appear
 * as subtle badges on top of existing zigzag roadmap nodes.
 */

// Which layers can be toggled
export type OverlayLayerId = 'progress' | 'reflections' | 'resources' | 'confidence';

// Per-node annotation data
export interface NodeOverlayData {
  progress?: 'not_started' | 'in_progress' | 'done';
  reflection?: string;
  resources?: string[];
  confidence?: 1 | 2 | 3 | 4 | 5;
}

// Full overlay state shape (persisted to localStorage)
export interface OverlayState {
  activeLayers: Record<OverlayLayerId, boolean>;
  nodeAnnotations: Record<string, NodeOverlayData>;
}

export const DEFAULT_OVERLAY_STATE: OverlayState = {
  activeLayers: { progress: false, reflections: false, resources: false, confidence: false },
  nodeAnnotations: {},
};

export interface OverlayLayerConfig {
  id: OverlayLayerId;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const OVERLAY_LAYERS: OverlayLayerConfig[] = [
  { id: 'progress', label: 'Progress', description: 'Track completion status', icon: 'CheckCircle2', color: '#22c55e' },
  { id: 'reflections', label: 'Reflections', description: 'Personal notes on each step', icon: 'MessageSquare', color: '#8b5cf6' },
  { id: 'resources', label: 'Resources', description: 'Links and materials', icon: 'Link', color: '#3b82f6' },
  { id: 'confidence', label: 'Confidence', description: 'How confident you feel', icon: 'Gauge', color: '#f59e0b' },
];
