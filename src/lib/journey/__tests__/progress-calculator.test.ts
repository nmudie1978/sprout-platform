/**
 * Unit Tests for Journey Progress Calculator
 *
 * Philosophy: DISCOVER · UNDERSTAND · ACT
 *
 * These tests verify:
 * 1. DISCOVER cannot hit 100% without all 3 mandatory steps
 * 2. UNDERSTAND cannot hit 100% without plan created
 * 3. ACT cannot hit 100% without reflection submitted
 * 4. Optional steps do NOT affect 100% eligibility
 * 5. Progress is calculated only from mandatory milestones
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDiscoverProgress,
  calculateUnderstandProgress,
  calculateActProgress,
  calculateAllLensProgress,
  getLensProgressSummary,
} from '../progress-calculator';
import { DEFAULT_JOURNEY_SUMMARY } from '../types';

describe('Journey Progress Calculator', () => {
  // ==========================================
  // DISCOVER LENS TESTS
  // ==========================================

  describe('DISCOVER Lens', () => {
    it('should return 0% when no steps completed', () => {
      const result = calculateDiscoverProgress({
        strengthsConfirmed: false,
        careersExplored: false,
        roleDeepDiveCompleted: false,
      });

      expect(result.progressPercent).toBe(0);
      expect(result.isComplete).toBe(false);
      expect(result.mandatoryCompleted).toBe(0);
      expect(result.mandatoryTotal).toBe(3);
    });

    it('should return 33% when 1 of 3 mandatory steps completed', () => {
      const result = calculateDiscoverProgress({
        strengthsConfirmed: true,
        careersExplored: false,
        roleDeepDiveCompleted: false,
      });

      expect(result.progressPercent).toBe(33);
      expect(result.isComplete).toBe(false);
      expect(result.mandatoryCompleted).toBe(1);
    });

    it('should return 67% when 2 of 3 mandatory steps completed', () => {
      const result = calculateDiscoverProgress({
        strengthsConfirmed: true,
        careersExplored: true,
        roleDeepDiveCompleted: false,
      });

      expect(result.progressPercent).toBe(67);
      expect(result.isComplete).toBe(false);
      expect(result.mandatoryCompleted).toBe(2);
    });

    it('should return 100% when all 3 mandatory steps completed', () => {
      const result = calculateDiscoverProgress({
        strengthsConfirmed: true,
        careersExplored: true,
        roleDeepDiveCompleted: true,
      });

      expect(result.progressPercent).toBe(100);
      expect(result.isComplete).toBe(true);
      expect(result.mandatoryCompleted).toBe(3);
      expect(result.nextMilestone).toBeNull();
    });

    it('should show correct next milestone', () => {
      const result = calculateDiscoverProgress({
        strengthsConfirmed: true,
        careersExplored: false,
        roleDeepDiveCompleted: false,
      });

      expect(result.nextMilestone).toBe('Explore careers');
    });
  });

  // ==========================================
  // UNDERSTAND LENS TESTS
  // ==========================================

  describe('UNDERSTAND Lens', () => {
    it('should return 0% when no mandatory steps completed', () => {
      const result = calculateUnderstandProgress({
        industryOutlookReviewed: false,
        careerShadowCompleted: false,
        planCreated: false,
      });

      expect(result.progressPercent).toBe(0);
      expect(result.isComplete).toBe(false);
      expect(result.mandatoryTotal).toBe(3);
      expect(result.optionalTotal).toBe(0);
    });

    it('should return 33% when 1 of 3 mandatory steps completed', () => {
      const result = calculateUnderstandProgress({
        industryOutlookReviewed: true,
        careerShadowCompleted: false,
        planCreated: false,
      });

      expect(result.progressPercent).toBe(33);
      expect(result.mandatoryCompleted).toBe(1);
    });

    it('should NOT reach 100% without plan created', () => {
      const result = calculateUnderstandProgress({
        industryOutlookReviewed: true,
        careerShadowCompleted: true,
        planCreated: false,
      });

      expect(result.progressPercent).toBe(67);
      expect(result.isComplete).toBe(false);
      expect(result.nextMilestone).toBe('Create action plan');
    });

    it('should reach 100% with all mandatory steps', () => {
      const result = calculateUnderstandProgress({
        industryOutlookReviewed: true,
        careerShadowCompleted: true,
        planCreated: true,
      });

      expect(result.progressPercent).toBe(100);
      expect(result.isComplete).toBe(true);
    });
  });

  // ==========================================
  // ACT LENS TESTS
  // ==========================================

  describe('ACT Lens', () => {
    it('should return 0% when no mandatory steps completed', () => {
      const result = calculateActProgress({
        alignedActionCompleted: false,
        actionReflectionSubmitted: false,
        planUpdated: false,
        externalFeedbackReceived: false,
      });

      expect(result.progressPercent).toBe(0);
      expect(result.isComplete).toBe(false);
      expect(result.mandatoryTotal).toBe(2);
      expect(result.optionalTotal).toBe(2);
    });

    it('should return 50% when aligned action completed but no reflection', () => {
      const result = calculateActProgress({
        alignedActionCompleted: true,
        actionReflectionSubmitted: false,
        planUpdated: false,
        externalFeedbackReceived: false,
      });

      expect(result.progressPercent).toBe(50);
      expect(result.isComplete).toBe(false);
      expect(result.nextMilestone).toBe('Reflect on action');
    });

    it('should NOT reach 100% without reflection submitted', () => {
      const result = calculateActProgress({
        alignedActionCompleted: true,
        actionReflectionSubmitted: false,
        planUpdated: true, // Optional
        externalFeedbackReceived: true, // Optional
      });

      expect(result.progressPercent).toBe(50);
      expect(result.isComplete).toBe(false);
    });

    it('should reach 100% with aligned action + reflection (small jobs NOT required)', () => {
      const result = calculateActProgress({
        alignedActionCompleted: true, // Could be shadow, project, course, etc. - NOT just jobs
        actionReflectionSubmitted: true,
        planUpdated: false,
        externalFeedbackReceived: false,
      });

      expect(result.progressPercent).toBe(100);
      expect(result.isComplete).toBe(true);
    });

    it('should track optional bonus steps correctly', () => {
      const result = calculateActProgress({
        alignedActionCompleted: true,
        actionReflectionSubmitted: true,
        planUpdated: true,
        externalFeedbackReceived: true,
      });

      expect(result.progressPercent).toBe(100);
      expect(result.isComplete).toBe(true);
      expect(result.mandatoryCompleted).toBe(2);
      expect(result.optionalCompleted).toBe(2);
    });
  });

  // ==========================================
  // OVERALL PROGRESS TESTS
  // ==========================================

  describe('Overall Progress', () => {
    it('should calculate overall progress as average of lens percentages', () => {
      const summary = {
        ...DEFAULT_JOURNEY_SUMMARY,
        strengths: ['creative', 'reliable', 'communicator'],
        careerInterests: ['UX Designer'],
        exploredRoles: [{ title: 'UX Designer', exploredAt: '', educationPaths: [], certifications: [], companies: [], humanSkills: [], entryExpectations: '' }],
        // DISCOVER = 100%
        industryInsightsSummary: { trendsReviewed: 0, insightsSaved: 0, lastReviewedAt: null },
        planCreated: false,
        // UNDERSTAND = 0%
        alignedActionsCount: 0,
        alignedActionReflections: [],
        // ACT = 0%
      };

      const result = calculateAllLensProgress(summary);

      expect(result.DISCOVER.progressPercent).toBe(100);
      expect(result.UNDERSTAND.progressPercent).toBe(0);
      expect(result.ACT.progressPercent).toBe(0);
      expect(result.overallProgress).toBe(33); // (100 + 0 + 0) / 3 = 33.3 rounded
    });

    it('should return 100% overall only when all lenses complete', () => {
      const summary = {
        ...DEFAULT_JOURNEY_SUMMARY,
        // DISCOVER complete
        strengths: ['creative', 'reliable', 'communicator'],
        careerInterests: ['UX Designer'],
        exploredRoles: [{ title: 'UX Designer', exploredAt: '', educationPaths: [], certifications: [], companies: [], humanSkills: [], entryExpectations: '' }],
        // UNDERSTAND complete
        industryInsightsSummary: { trendsReviewed: 3, insightsSaved: 0, lastReviewedAt: new Date().toISOString() },
        shadowSummary: { ...DEFAULT_JOURNEY_SUMMARY.shadowSummary, completed: 1 },
        planCreated: true,
        // ACT complete
        alignedActionsCount: 1,
        alignedActionReflections: [{ id: '1', actionId: 'a1', prompt: '', response: 'test', createdAt: '' }],
      };

      const result = calculateAllLensProgress(summary);

      expect(result.DISCOVER.isComplete).toBe(true);
      expect(result.UNDERSTAND.isComplete).toBe(true);
      expect(result.ACT.isComplete).toBe(true);
      expect(result.overallProgress).toBe(100);
    });
  });

  // ==========================================
  // PROGRESS SUMMARY TEXT TESTS
  // ==========================================

  describe('Progress Summary Text', () => {
    it('should show step progress for incomplete lens', () => {
      const result = calculateDiscoverProgress({
        strengthsConfirmed: true,
        careersExplored: true,
        roleDeepDiveCompleted: false,
      });

      const summary = getLensProgressSummary(result);
      expect(summary).toBe('Step 3 of 3: Deep dive into role');
    });

    it('should show "Complete" for finished lens', () => {
      const result = calculateDiscoverProgress({
        strengthsConfirmed: true,
        careersExplored: true,
        roleDeepDiveCompleted: true,
      });

      const summary = getLensProgressSummary(result);
      expect(summary).toBe('Complete');
    });
  });

  // ==========================================
  // SMALL JOBS NOT REQUIRED TESTS
  // ==========================================

  describe('Small Jobs Not Required', () => {
    it('should allow ACT completion without any small jobs', () => {
      // User completed a career shadow as their aligned action (not a small job)
      const result = calculateActProgress({
        alignedActionCompleted: true, // This was a shadow, not a job
        actionReflectionSubmitted: true,
        planUpdated: false,
        externalFeedbackReceived: false,
      });

      expect(result.progressPercent).toBe(100);
      expect(result.isComplete).toBe(true);
    });

    it('should count small jobs as one type of aligned action', () => {
      // User completed a small job as their aligned action
      const result = calculateActProgress({
        alignedActionCompleted: true, // This was a small job
        actionReflectionSubmitted: true,
        planUpdated: false,
        externalFeedbackReceived: false,
      });

      expect(result.progressPercent).toBe(100);
      expect(result.isComplete).toBe(true);
    });
  });
});
