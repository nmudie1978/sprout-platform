import type { Journey, JourneyItem } from '@/lib/journey/career-journey-types';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';

export interface RendererProps {
  journey: Journey;
  onItemClick: (item: JourneyItem) => void;
  overlayData?: Record<string, NodeOverlayData>;
  activeLayers?: Record<OverlayLayerId, boolean>;
}
