/**
 * Visual Stability Regression Tests
 *
 * Validates that journey UI state data is complete and consistent
 * to prevent layout shifts and visual instability.
 */

import { describe, it, expect } from 'vitest';
import { createOrchestrator } from '@/lib/journey/orchestrator';
import { JOURNEY_PRESETS } from '../../my-journey/utils/test-helpers';
import { JOURNEY_STATES, JOURNEY_STATE_CONFIG } from '@/lib/journey/types';

describe('Visual Stability', () => {
  // ============================================
  // COMPLETE UI STATE STRUCTURE
  // ============================================

  it('all journey presets produce complete UI state', () => {
    for (const [name, presetFn] of Object.entries(JOURNEY_PRESETS)) {
      if (name === 'invalidState') continue;

      const preset = presetFn();
      const orch = createOrchestrator(preset.context, preset.dbState);
      const state = orch.getUIState();

      // Steps array must contain all journey states
      const stepIds = state.steps.map((s) => s.id);
      for (const stateId of JOURNEY_STATES) {
        expect(stepIds, `${name}: missing step ${stateId}`).toContain(stateId);
      }
    }
  });

  // ============================================
  // PROGRESS VALUES ARE VALID
  // ============================================

  it('progress values are always 0-100', () => {
    for (const [name, presetFn] of Object.entries(JOURNEY_PRESETS)) {
      if (name === 'invalidState') continue;

      const preset = presetFn();
      const orch = createOrchestrator(preset.context, preset.dbState);
      const state = orch.getUIState();

      const { discover, understand, act } = state.summary.lenses;

      for (const [lens, progress] of [['discover', discover], ['understand', understand], ['act', act]] as const) {
        expect(progress.progress, `${name}/${lens} progress out of range`).toBeGreaterThanOrEqual(0);
        expect(progress.progress, `${name}/${lens} progress out of range`).toBeLessThanOrEqual(100);
        expect(Number.isNaN(progress.progress), `${name}/${lens} progress is NaN`).toBe(false);
      }
    }
  });

  // ============================================
  // STEP STATUS CONSISTENCY
  // ============================================

  it('step statuses are consistent with journey state', () => {
    for (const [name, presetFn] of Object.entries(JOURNEY_PRESETS)) {
      if (name === 'invalidState' || name === 'corrupted') continue;

      const preset = presetFn();
      const orch = createOrchestrator(preset.context, preset.dbState);
      const state = orch.getUIState();

      // Completed steps should have 'completed' status
      for (const stepId of state.completedSteps) {
        const step = state.steps.find((s) => s.id === stepId);
        expect(step?.status, `${name}: completed step ${stepId} has wrong status`).toBe('completed');
      }

      // There should be exactly one 'next' step (or none if journey is complete)
      const nextSteps = state.steps.filter((s) => s.status === 'next');
      expect(nextSteps.length, `${name}: should have 0 or 1 'next' step`).toBeLessThanOrEqual(1);
    }
  });

  // ============================================
  // NO UNDEFINED DISPLAY VALUES
  // ============================================

  it('step titles and descriptions are never empty', () => {
    for (const [name, presetFn] of Object.entries(JOURNEY_PRESETS)) {
      if (name === 'invalidState') continue;

      const preset = presetFn();
      const orch = createOrchestrator(preset.context, preset.dbState);
      const state = orch.getUIState();

      for (const step of state.steps) {
        expect(step.title, `${name}/${step.id}: title is empty`).toBeTruthy();
        expect(step.description, `${name}/${step.id}: description is empty`).toBeTruthy();
      }
    }
  });

  // ============================================
  // LENS COMPLETION CONSISTENCY
  // ============================================

  it('lens isComplete flag matches progress', () => {
    for (const [name, presetFn] of Object.entries(JOURNEY_PRESETS)) {
      if (name === 'invalidState' || name === 'corrupted') continue;

      const preset = presetFn();
      const orch = createOrchestrator(preset.context, preset.dbState);
      const state = orch.getUIState();

      const { discover, understand, act } = state.summary.lenses;

      // If progress is 100, isComplete should be true
      if (discover.progress === 100) {
        expect(discover.isComplete, `${name}: discover 100% but not complete`).toBe(true);
      }
      if (understand.progress === 100) {
        expect(understand.isComplete, `${name}: understand 100% but not complete`).toBe(true);
      }
      if (act.progress === 100) {
        expect(act.isComplete, `${name}: act 100% but not complete`).toBe(true);
      }

      // If isComplete, progress should be 100
      if (discover.isComplete) {
        expect(discover.progress, `${name}: discover complete but not 100%`).toBe(100);
      }
      if (understand.isComplete) {
        expect(understand.progress, `${name}: understand complete but not 100%`).toBe(100);
      }
      if (act.isComplete) {
        expect(act.progress, `${name}: act complete but not 100%`).toBe(100);
      }
    }
  });

  // ============================================
  // LOADING SKELETON DATA
  // ============================================

  it('skeleton structure matches real content structure', () => {
    // Verify that the skeleton loading state (shown before data loads)
    // has the same structural dimensions as the loaded state

    // The page shows: 3 tab cards + content area
    // Skeleton should match this layout
    const preset = JOURNEY_PRESETS.empty();
    const orch = createOrchestrator(preset.context, preset.dbState);
    const state = orch.getUIState();

    // 3 lenses → 3 tab cards in StageTabBar
    expect(Object.keys(state.summary.lenses).length).toBe(3);

    // Steps exist even when empty → no layout shift when data loads
    expect(state.steps.length).toBeGreaterThan(0);
  });
});
