'use client';

import { MessageSquare, Link } from 'lucide-react';
import type { NodeOverlayData, OverlayLayerId } from '@/lib/journey/overlay-types';

interface OverlayBadgesProps {
  nodeData: NodeOverlayData | undefined;
  activeLayers: Record<OverlayLayerId, boolean>;
}

const PROGRESS_COLORS: Record<string, string> = {
  done: '#22c55e',
  in_progress: '#f59e0b',
  not_started: '#9ca3af',
};

export function OverlayBadges({ nodeData, activeLayers }: OverlayBadgesProps) {
  if (!nodeData) return null;

  const badges: React.ReactNode[] = [];

  // Progress badge — colored dot
  if (activeLayers.progress && nodeData.progress) {
    badges.push(
      <span
        key="progress"
        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: PROGRESS_COLORS[nodeData.progress] }}
        title={`Progress: ${nodeData.progress.replace('_', ' ')}`}
      />
    );
  }

  // Reflections badge — purple icon
  if (activeLayers.reflections && nodeData.reflection) {
    badges.push(
      <span key="reflections" title="Has reflection">
        <MessageSquare
          className="h-3 w-3 flex-shrink-0"
          style={{ color: '#8b5cf6' }}
        />
      </span>
    );
  }

  // Resources badge — blue icon + count
  if (activeLayers.resources && nodeData.resources && nodeData.resources.length > 0) {
    badges.push(
      <span key="resources" className="inline-flex items-center gap-0.5" title={`${nodeData.resources.length} resource(s)`}>
        <Link className="h-3 w-3 flex-shrink-0" style={{ color: '#3b82f6' }} />
        <span className="text-[9px] font-medium" style={{ color: '#3b82f6' }}>
          {nodeData.resources.length}
        </span>
      </span>
    );
  }

  // Confidence badge — amber dots
  if (activeLayers.confidence && nodeData.confidence) {
    badges.push(
      <span key="confidence" className="inline-flex items-center gap-px" title={`Confidence: ${nodeData.confidence}/5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: i < nodeData.confidence! ? '#f59e0b' : '#e5e7eb',
            }}
          />
        ))}
      </span>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1 px-0.5">
      {badges}
    </div>
  );
}
