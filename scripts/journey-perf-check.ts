#!/usr/bin/env tsx
/**
 * My Journey Performance Health Check
 *
 * Standalone script that runs key performance measurements
 * and outputs a formatted report. Useful for local dev
 * and CI baseline comparison.
 *
 * Usage: npx tsx scripts/journey-perf-check.ts
 */

import { createOrchestrator } from '../src/lib/journey/orchestrator';
import { calculateLensProgress } from '../src/lib/journey/state-machine';
import { JOURNEY_LENSES, DEFAULT_JOURNEY_SUMMARY } from '../src/lib/journey/types';
import type { JourneyStateContext, SkippedStepsMap, JourneySummary } from '../src/lib/journey/types';

// ============================================
// HELPERS (inlined to avoid test imports)
// ============================================

function makeContext(overrides: Partial<JourneyStateContext> = {}): JourneyStateContext {
  return {
    userId: 'perf-test-user',
    profile: null,
    confirmedStrengths: [],
    savedCareers: [],
    exploredRolesCount: 0,
    primaryGoalSelected: false,
    industryOutlookReviewed: false,
    requirementsReviewed: false,
    planCreated: false,
    shadowsRequested: 0,
    shadowsCompleted: 0,
    shadowsSkipped: false,
    pathDataSaved: false,
    savedItemsCount: 0,
    alignedActionsCompleted: 0,
    actionReflectionsSubmitted: 0,
    externalFeedbackReceived: false,
    planUpdatedAfterAction: false,
    completedJobs: 0,
    reflectionsCount: 0,
    journeySummary: null,
    skippedSteps: {} as SkippedStepsMap,
    ...overrides,
  };
}

function makeSummary(overrides: Partial<JourneySummary> = {}): JourneySummary {
  return { ...DEFAULT_JOURNEY_SUMMARY, ...overrides };
}

function makeExploredRole(title: string) {
  return {
    title,
    exploredAt: new Date().toISOString(),
    educationPaths: ['Degree'],
    certifications: ['Cert'],
    companies: ['Company'],
    humanSkills: ['Communication'],
    entryExpectations: 'Entry level',
  };
}

function benchmark(fn: () => void, iterations: number) {
  // Warmup
  for (let i = 0; i < 10; i++) fn();

  const durations: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    durations.push(performance.now() - start);
  }
  durations.sort((a, b) => a - b);

  return {
    min: r(durations[0]),
    median: r(durations[Math.floor(durations.length / 2)]),
    p95: r(durations[Math.floor(durations.length * 0.95)]),
    p99: r(durations[Math.floor(durations.length * 0.99)]),
    mean: r(durations.reduce((a, b) => a + b, 0) / durations.length),
  };
}

function r(n: number) { return Math.round(n * 1000) / 1000; }

// ============================================
// JOURNEY PRESETS
// ============================================

const PRESETS = {
  empty: {
    context: makeContext(),
    dbState: {
      journeyState: 'REFLECT_ON_STRENGTHS',
      journeyCompletedSteps: [] as string[],
      journeySummary: DEFAULT_JOURNEY_SUMMARY,
    },
  },
  fullyComplete: {
    context: makeContext({
      confirmedStrengths: ['A', 'B', 'C'],
      savedCareers: [{ id: '1', title: 'Doctor', savedAt: '2026-01-01' }],
      exploredRolesCount: 1,
      primaryGoalSelected: true,
      industryOutlookReviewed: true,
      pathDataSaved: true,
      shadowsCompleted: 1,
      planCreated: true,
      alignedActionsCompleted: 1,
      actionReflectionsSubmitted: 1,
      planUpdatedAfterAction: true,
      externalFeedbackReceived: true,
    }),
    dbState: {
      journeyState: 'EXTERNAL_FEEDBACK',
      journeyCompletedSteps: [
        'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
        'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION',
        'UPDATE_PLAN', 'EXTERNAL_FEEDBACK',
      ],
      journeySummary: makeSummary({
        strengths: ['A', 'B', 'C'],
        exploredRoles: [makeExploredRole('Doctor')],
        alignedActionsCount: 1,
        planCreated: true,
      }),
    },
  },
  heavy: {
    context: makeContext({
      confirmedStrengths: Array.from({ length: 20 }, (_, i) => `S${i}`),
      savedCareers: Array.from({ length: 50 }, (_, i) => ({ id: `c-${i}`, title: `C${i}`, savedAt: '2026-01-01' })),
      exploredRolesCount: 50,
      primaryGoalSelected: true,
      alignedActionsCompleted: 30,
      actionReflectionsSubmitted: 25,
    }),
    dbState: {
      journeyState: 'COMPLETE_ALIGNED_ACTION',
      journeyCompletedSteps: [
        'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
        'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      ],
      journeySummary: makeSummary({
        exploredRoles: Array.from({ length: 50 }, (_, i) => makeExploredRole(`R${i}`)),
        alignedActionsCount: 30,
      }),
    },
  },
};

// ============================================
// BUDGETS
// ============================================

const BUDGETS = {
  orchestratorBuild: 10,    // ms
  progressCalc: 3,          // ms
  payloadSize: 50_000,      // bytes
  serializeRoundtrip: 10,   // ms
};

// ============================================
// RUN CHECKS
// ============================================

console.log('');
console.log('========================================');
console.log(' MY JOURNEY — Performance Health Check');
console.log('========================================');
console.log('');

// 1. Orchestrator build speed
console.log('1. ORCHESTRATOR BUILD SPEED');
console.log('   Budget: < ' + BUDGETS.orchestratorBuild + 'ms');
console.log('');

const orcResults: Record<string, ReturnType<typeof benchmark>> = {};
for (const [name, preset] of Object.entries(PRESETS)) {
  orcResults[name] = benchmark(() => {
    const orch = createOrchestrator(preset.context, preset.dbState);
    orch.getUIState();
  }, 200);
}

for (const [name, result] of Object.entries(orcResults)) {
  const status = result.p95 < BUDGETS.orchestratorBuild ? 'PASS' : 'FAIL';
  console.log(`   ${status}  ${name.padEnd(20)} median=${result.median}ms  p95=${result.p95}ms  p99=${result.p99}ms`);
}
console.log('');

// 2. Progress calculation speed
console.log('2. PROGRESS CALCULATION SPEED');
console.log('   Budget: < ' + BUDGETS.progressCalc + 'ms');
console.log('');

for (const [name, preset] of Object.entries(PRESETS)) {
  const result = benchmark(() => {
    for (const lens of JOURNEY_LENSES) {
      calculateLensProgress(lens, preset.context);
    }
  }, 300);

  const status = result.p95 < BUDGETS.progressCalc ? 'PASS' : 'FAIL';
  console.log(`   ${status}  ${name.padEnd(20)} median=${result.median}ms  p95=${result.p95}ms`);
}
console.log('');

// 3. Payload sizes
console.log('3. PAYLOAD SIZES');
console.log('   Budget: < ' + (BUDGETS.payloadSize / 1024).toFixed(0) + 'KB');
console.log('');

for (const [name, preset] of Object.entries(PRESETS)) {
  const orch = createOrchestrator(preset.context, preset.dbState);
  const state = orch.getUIState();
  const payload = JSON.stringify({ success: true, journey: state });
  const size = new Blob([payload]).size;
  const status = size < BUDGETS.payloadSize ? 'PASS' : 'FAIL';
  console.log(`   ${status}  ${name.padEnd(20)} ${(size / 1024).toFixed(1)}KB`);
}
console.log('');

// 4. Serialize/deserialize speed
console.log('4. SERIALIZE/DESERIALIZE ROUND-TRIP');
console.log('   Budget: < ' + BUDGETS.serializeRoundtrip + 'ms');
console.log('');

for (const [name, preset] of Object.entries(PRESETS)) {
  const orch = createOrchestrator(preset.context, preset.dbState);
  const state = orch.getUIState();

  const result = benchmark(() => {
    const s = JSON.stringify(state);
    JSON.parse(s);
  }, 200);

  const status = result.p95 < BUDGETS.serializeRoundtrip ? 'PASS' : 'FAIL';
  console.log(`   ${status}  ${name.padEnd(20)} median=${result.median}ms  p95=${result.p95}ms`);
}
console.log('');

// 5. Scale comparison
console.log('5. SCALE COMPARISON');
console.log('   Checking: heavy/empty build time ratio');
console.log('');

const emptyP95 = orcResults.empty.p95;
const heavyP95 = orcResults.heavy.p95;
const ratio = heavyP95 / Math.max(emptyP95, 0.001);
const scaleStatus = ratio < 5 ? 'PASS' : 'WARN';
console.log(`   ${scaleStatus}  Ratio: ${ratio.toFixed(1)}x (empty=${emptyP95}ms, heavy=${heavyP95}ms)`);
console.log('');

// Summary
console.log('========================================');
console.log(' SUMMARY');
console.log('========================================');
console.log('');

const allChecks = [
  ...Object.values(orcResults).map((r) => r.p95 < BUDGETS.orchestratorBuild),
];
const passed = allChecks.filter(Boolean).length;
const total = allChecks.length;

console.log(`   ${passed}/${total} checks passed`);
console.log('');
console.log(`   Run full test suite: npx vitest run tests/my-journey-performance/`);
console.log(`   Run CI gates only:   npx vitest run tests/my-journey-performance/regression/`);
console.log('');
