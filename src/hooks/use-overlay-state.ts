'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_OVERLAY_STATE,
  type OverlayLayerId,
  type OverlayState,
  type NodeOverlayData,
} from '@/lib/journey/overlay-types';

const STORAGE_KEY = 'sprout-roadmap-overlays';

function loadState(goalId: string): OverlayState {
  if (typeof window === 'undefined') return DEFAULT_OVERLAY_STATE;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${goalId}`);
    if (!raw) return DEFAULT_OVERLAY_STATE;
    const parsed = JSON.parse(raw) as OverlayState;
    // Ensure all layer keys exist (forward-compat)
    return {
      activeLayers: { ...DEFAULT_OVERLAY_STATE.activeLayers, ...parsed.activeLayers },
      nodeAnnotations: parsed.nodeAnnotations ?? {},
    };
  } catch {
    return DEFAULT_OVERLAY_STATE;
  }
}

export function useOverlayState(goalId: string | undefined) {
  const safeId = goalId ?? '';
  const [state, setState] = useState<OverlayState>(() => loadState(safeId));

  // Re-load when goalId changes
  useEffect(() => {
    setState(loadState(safeId));
  }, [safeId]);

  // Persist to localStorage on every change
  useEffect(() => {
    if (typeof window === 'undefined' || !safeId) return;
    localStorage.setItem(`${STORAGE_KEY}-${safeId}`, JSON.stringify(state));
  }, [state, safeId]);

  const toggleLayer = useCallback((layerId: OverlayLayerId) => {
    setState((prev) => ({
      ...prev,
      activeLayers: {
        ...prev.activeLayers,
        [layerId]: !prev.activeLayers[layerId],
      },
    }));
  }, []);

  const updateNodeAnnotation = useCallback(
    (nodeId: string, partial: Partial<NodeOverlayData>) => {
      setState((prev) => ({
        ...prev,
        nodeAnnotations: {
          ...prev.nodeAnnotations,
          [nodeId]: { ...prev.nodeAnnotations[nodeId], ...partial },
        },
      }));
    },
    []
  );

  const getNodeData = useCallback(
    (nodeId: string): NodeOverlayData | undefined => state.nodeAnnotations[nodeId],
    [state.nodeAnnotations]
  );

  const hasAnyActiveLayer = Object.values(state.activeLayers).some(Boolean);

  return {
    activeLayers: state.activeLayers,
    nodeAnnotations: state.nodeAnnotations,
    toggleLayer,
    updateNodeAnnotation,
    getNodeData,
    hasAnyActiveLayer,
  };
}
