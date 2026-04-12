/**
 * real-world-provider — regression tests for "Where to go next"
 * link routing. These tests pin down which override fires for each
 * step type so we never regress the bugs the user has caught:
 *
 *   - "Apply for culinary school" showing LinkedIn job listings
 *   - "Begin culinary studies" showing Coursera job courses
 *   - "Refine your culinary skills" / "Gain professional experience"
 *     showing study-path links (the current bug)
 *   - "Apply for entry-level roles" NOT showing study-path links
 *
 * The provider runs a chain of overrides in priority order:
 *   1. inRoleDevelopmentOverride  — user already in the job
 *   2. studyPathOnlyOverride      — any educational keyword
 *   3. universityApplicationOverride
 *   4. applyJobOverride
 *   5. stepType-based fallback
 *
 * Each test builds a minimal JourneyItem and asserts on the shape of
 * the returned RealWorldItem array — specifically which `kind`
 * (university / course / certification / job / internship) appears.
 */

import { describe, expect, it } from 'vitest';
import { getRealWorldConnections } from '../real-world-provider';
import type { JourneyItem } from '../career-journey-types';

function makeStep(overrides: Partial<JourneyItem>): JourneyItem {
  return {
    id: 'test-step',
    stage: 'career',
    title: 'Test step',
    startAge: 20,
    isMilestone: false,
    ...overrides,
  };
}

// ── In-role development (Issue from latest screenshot) ──────────────

describe('inRoleDevelopmentOverride — positive', () => {
  it('"Gain professional experience" + career stage → courses + certifications only', () => {
    const step = makeStep({
      stage: 'career',
      title: 'Gain professional experience',
      subtitle: 'Refine your culinary skills',
      description:
        'Continue to grow in your role and take on more responsibilities in the kitchen.',
      isMilestone: true,
      startAge: 27,
      endAge: 27,
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    // Must not contain any university or job links
    const kinds = links.map((l) => l.kind);
    expect(kinds).not.toContain('university');
    expect(kinds).not.toContain('job');
    expect(kinds).not.toContain('internship');
    // Must contain at least one course and one certification
    expect(kinds).toContain('course');
    expect(kinds).toContain('certification');
  });

  it('"Refine your culinary skills" → courses + certifications only', () => {
    const step = makeStep({
      stage: 'career',
      title: 'Refine your culinary skills',
      description: 'Experiment with new recipes.',
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    expect(links.every((l) => l.kind === 'course' || l.kind === 'certification' || l.kind === 'platform')).toBe(true);
  });

  it('"Continue to grow in your role" → no job listings', () => {
    const step = makeStep({
      stage: 'career',
      title: 'Continue to grow in your role',
      description: 'Take on more responsibilities and develop expertise.',
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    const hasJobBoard = links.some((l) => /linkedin|finn|indeed/.test(l.url));
    expect(hasJobBoard).toBe(false);
  });

  it('"Take on more responsibilities" → courses + certifications', () => {
    const step = makeStep({
      stage: 'career',
      title: 'Develop as a senior contributor',
      description: 'Take on more responsibilities over time.',
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    expect(links.every((l) => l.kind !== 'job')).toBe(true);
  });

  it('"Experiment with new recipes" micro-action — matches development signal', () => {
    const step = makeStep({
      stage: 'career',
      title: 'Gain experience',
      description: 'Experiment with new recipes and techniques.',
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    expect(links.every((l) => l.kind !== 'job' && l.kind !== 'university')).toBe(true);
  });
});

// ── In-role development (negative guards) ──────────────────────────

describe('inRoleDevelopmentOverride — negative (must NOT fire)', () => {
  it('"Apply for entry-level roles" still routes to job boards', () => {
    // Despite being in the "experience" stage, applying is NOT
    // in-role development — user is job-hunting. The `isApplying`
    // guard prevents the override firing.
    const step = makeStep({
      stage: 'experience',
      title: 'Apply for entry-level roles',
      description: 'Find your first job as a Chef.',
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    const hasJobBoard = links.some((l) => /linkedin|finn|indeed/.test(l.url));
    expect(hasJobBoard).toBe(true);
  });

  it('"Step up to a senior role" routes via the normal path (promotion = job hunting)', () => {
    const step = makeStep({
      stage: 'career',
      title: 'Step up to a senior role',
      description: 'With 5+ years of experience, apply for senior positions.',
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    // "apply" in the description OR "step up to a senior" both
    // trigger the isApplying guard, so in-role override won't fire.
    // The stepType fallback sends this to milestone → jobsFor+coursesFor.
    const hasJobBoard = links.some((l) => /linkedin|finn|indeed/.test(l.url));
    expect(hasJobBoard).toBe(true);
  });

  it('"Apply for culinary school" does not fire in-role (it fires study-path)', () => {
    const step = makeStep({
      stage: 'education',
      title: 'Apply for culinary school',
      description: 'Start your journey in the kitchen.',
      isMilestone: true,
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    // Should go to study paths, not in-role development
    const hasUniversity = links.some((l) => l.kind === 'university');
    expect(hasUniversity).toBe(true);
    const hasJobBoard = links.some((l) => /linkedin|finn|indeed/.test(l.url));
    expect(hasJobBoard).toBe(false);
  });
});

// ── Study-path override — positive and negative ────────────────────

describe('studyPathOnlyOverride — positive', () => {
  it('"Apply for culinary school" → study-path links only', () => {
    const step = makeStep({
      stage: 'education',
      title: 'Apply for culinary school',
      description: 'Research and apply to culinary programmes that suit your interests.',
      isMilestone: true,
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    const hasJobBoard = links.some((l) => /linkedin|finn|indeed/.test(l.url));
    expect(hasJobBoard).toBe(false);
    // First link should be the in-app Study Paths browser
    expect(links[0].url).toBe('/my-journey#understand');
  });

  it('"Begin culinary studies" → study-path links only', () => {
    const step = makeStep({
      stage: 'education',
      title: 'Begin culinary studies',
      description: 'Immerse yourself in cooking techniques.',
      isMilestone: true,
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    const hasJobBoard = links.some((l) => /linkedin|finn|indeed/.test(l.url));
    expect(hasJobBoard).toBe(false);
  });

  it('"Complete Videregående" → study-path links', () => {
    const step = makeStep({
      stage: 'foundation',
      title: 'Complete Videregående',
      description: 'Complete your upper secondary education.',
      isMilestone: true,
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    expect(links[0].url).toBe('/my-journey#understand');
  });
});

describe('studyPathOnlyOverride — negative (the "culinary" false positive)', () => {
  it('"Refine your culinary skills" does NOT fire study-path (culinary is not an education marker)', () => {
    // The previous regex matched the word "culinary" anywhere in
    // the step text, which mis-routed in-role development steps
    // like "Refine your culinary skills" to study-path links.
    // The fix was to remove "culinary" from the keyword list.
    const step = makeStep({
      stage: 'career',
      title: 'Refine your culinary skills',
      description: 'Experiment with new techniques in the kitchen.',
    });
    const links = getRealWorldConnections({ step, career: 'Chef' });
    // Should NOT contain the in-app study paths link
    const hasStudyPaths = links.some((l) => l.url === '/my-journey#understand');
    expect(hasStudyPaths).toBe(false);
    // Should be routed to in-role development (courses + certs)
    const hasCourseOrCert = links.some(
      (l) => l.kind === 'course' || l.kind === 'certification' || l.kind === 'platform',
    );
    expect(hasCourseOrCert).toBe(true);
  });

  it('"Take on medical cases" does NOT fire study-path (medical is a career word)', () => {
    // Same class of false positive — "medical" is a career word
    // not an education marker. The new regex uses word boundaries
    // and explicit terms so this works.
    const step = makeStep({
      stage: 'career',
      title: 'Take on more complex medical cases',
      description: 'Gain experience with difficult diagnoses.',
    });
    const links = getRealWorldConnections({ step, career: 'Doctor' });
    // "take on more" + "gain experience" triggers inRoleDevelopment
    expect(links.every((l) => l.url !== '/my-journey#understand')).toBe(true);
  });
});
