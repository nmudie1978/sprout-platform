/**
 * Performance Testing Utilities
 *
 * Core helpers for measuring, recording, and asserting performance
 * metrics across the My Journey feature.
 */

// ============================================
// PERFORMANCE THRESHOLDS (budgets)
// ============================================

export const PERF_BUDGETS = {
  /** Max time for journey API response (ms) */
  API_RESPONSE: 200,

  /** Max time for orchestrator to build UI state (ms) */
  ORCHESTRATOR_BUILD: 10,

  /** Max time for full journey page render cycle (ms) — simulated */
  PAGE_RENDER: 100,

  /** Max time for goal switch + data reload (ms) */
  GOAL_SWITCH: 300,

  /** Max time for step completion mutation round-trip (ms) */
  STEP_COMPLETE: 250,

  /** Max API calls on initial journey page load */
  INITIAL_API_CALLS: 5,

  /** Max render count for stable components after initial mount */
  STABLE_RENDER_COUNT: 2,

  /** Max acceptable payload size for journey API response (bytes) */
  JOURNEY_PAYLOAD_SIZE: 50_000,

  /** Max time for state machine calculations (ms) */
  STATE_MACHINE_CALC: 5,

  /** Max time for progress calculation across all lenses (ms) */
  PROGRESS_CALC: 3,

  /** Max acceptable re-renders on tab switch */
  TAB_SWITCH_RENDERS: 3,

  /** Max time for save operation to complete (ms) */
  SAVE_LATENCY: 200,
} as const;

// ============================================
// TIMING UTILITIES
// ============================================

export interface TimingResult {
  name: string;
  duration: number;
  timestamp: number;
  passed: boolean;
  budget?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Measure execution time of a synchronous or async function.
 */
export async function measureTime<T>(
  name: string,
  fn: () => T | Promise<T>,
  budget?: number
): Promise<{ result: T; timing: TimingResult }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  return {
    result,
    timing: {
      name,
      duration: Math.round(duration * 100) / 100,
      timestamp: Date.now(),
      passed: budget ? duration <= budget : true,
      budget,
    },
  };
}

/**
 * Measure execution time of a synchronous function (no await overhead).
 */
export function measureTimeSync<T>(
  name: string,
  fn: () => T,
  budget?: number
): { result: T; timing: TimingResult } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  return {
    result,
    timing: {
      name,
      duration: Math.round(duration * 100) / 100,
      timestamp: Date.now(),
      passed: budget ? duration <= budget : true,
      budget,
    },
  };
}

/**
 * Run a function N times and return timing statistics.
 */
export function benchmark(
  name: string,
  fn: () => void,
  iterations = 100
): BenchmarkResult {
  // Warmup
  for (let i = 0; i < Math.min(10, iterations); i++) fn();

  const durations: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    durations.push(performance.now() - start);
  }

  durations.sort((a, b) => a - b);

  return {
    name,
    iterations,
    min: round(durations[0]),
    max: round(durations[durations.length - 1]),
    mean: round(durations.reduce((a, b) => a + b, 0) / durations.length),
    median: round(durations[Math.floor(durations.length / 2)]),
    p95: round(durations[Math.floor(durations.length * 0.95)]),
    p99: round(durations[Math.floor(durations.length * 0.99)]),
    stddev: round(standardDeviation(durations)),
  };
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
  stddev: number;
}

function standardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// ============================================
// RENDER TRACKING
// ============================================

export interface RenderTracker {
  counts: Map<string, number>;
  durations: Map<string, number[]>;
  track: (componentName: string) => void;
  trackWithDuration: (componentName: string, durationMs: number) => void;
  getRenderCount: (componentName: string) => number;
  getAverageDuration: (componentName: string) => number;
  reset: () => void;
  report: () => RenderReport;
}

export interface RenderReport {
  components: Array<{
    name: string;
    renderCount: number;
    avgDuration: number;
    totalDuration: number;
    excessive: boolean;
  }>;
  totalRenders: number;
  hotspots: string[];
}

export function createRenderTracker(renderBudget = PERF_BUDGETS.STABLE_RENDER_COUNT): RenderTracker {
  const counts = new Map<string, number>();
  const durations = new Map<string, number[]>();

  return {
    counts,
    durations,
    track(componentName: string) {
      counts.set(componentName, (counts.get(componentName) || 0) + 1);
    },
    trackWithDuration(componentName: string, durationMs: number) {
      counts.set(componentName, (counts.get(componentName) || 0) + 1);
      const existing = durations.get(componentName) || [];
      existing.push(durationMs);
      durations.set(componentName, existing);
    },
    getRenderCount(componentName: string) {
      return counts.get(componentName) || 0;
    },
    getAverageDuration(componentName: string) {
      const d = durations.get(componentName);
      if (!d || d.length === 0) return 0;
      return d.reduce((a, b) => a + b, 0) / d.length;
    },
    reset() {
      counts.clear();
      durations.clear();
    },
    report(): RenderReport {
      const components: RenderReport['components'] = [];
      for (const [name, count] of counts) {
        const d = durations.get(name) || [];
        const totalDuration = d.reduce((a, b) => a + b, 0);
        components.push({
          name,
          renderCount: count,
          avgDuration: d.length > 0 ? round(totalDuration / d.length) : 0,
          totalDuration: round(totalDuration),
          excessive: count > renderBudget,
        });
      }
      components.sort((a, b) => b.renderCount - a.renderCount);

      return {
        components,
        totalRenders: components.reduce((sum, c) => sum + c.renderCount, 0),
        hotspots: components.filter((c) => c.excessive).map((c) => c.name),
      };
    },
  };
}

// ============================================
// NETWORK TRACKING
// ============================================

export interface NetworkCall {
  url: string;
  method: string;
  timestamp: number;
  duration?: number;
  payloadSize?: number;
  status?: number;
}

export interface NetworkTracker {
  calls: NetworkCall[];
  record: (call: NetworkCall) => void;
  getCallCount: () => number;
  getDuplicates: () => Map<string, number>;
  getByPattern: (pattern: string | RegExp) => NetworkCall[];
  getTotalPayloadSize: () => number;
  getWaterfall: () => NetworkCall[];
  reset: () => void;
  report: () => NetworkReport;
}

export interface NetworkReport {
  totalCalls: number;
  uniqueEndpoints: number;
  duplicates: Array<{ endpoint: string; count: number }>;
  totalPayloadSize: number;
  avgResponseTime: number;
  slowestCall: NetworkCall | null;
  journeyApiCalls: number;
  goalApiCalls: number;
  issues: string[];
}

export function createNetworkTracker(): NetworkTracker {
  const calls: NetworkCall[] = [];

  return {
    calls,
    record(call: NetworkCall) {
      calls.push(call);
    },
    getCallCount() {
      return calls.length;
    },
    getDuplicates() {
      const counts = new Map<string, number>();
      for (const call of calls) {
        const key = `${call.method} ${call.url}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      // Only return actual duplicates
      const dupes = new Map<string, number>();
      for (const [key, count] of counts) {
        if (count > 1) dupes.set(key, count);
      }
      return dupes;
    },
    getByPattern(pattern: string | RegExp) {
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      return calls.filter((c) => regex.test(c.url));
    },
    getTotalPayloadSize() {
      return calls.reduce((sum, c) => sum + (c.payloadSize || 0), 0);
    },
    getWaterfall() {
      return [...calls].sort((a, b) => a.timestamp - b.timestamp);
    },
    reset() {
      calls.length = 0;
    },
    report(): NetworkReport {
      const duplicates = this.getDuplicates();
      const withDuration = calls.filter((c) => c.duration !== undefined);
      const avgResponseTime = withDuration.length > 0
        ? round(withDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / withDuration.length)
        : 0;
      const slowest = withDuration.length > 0
        ? withDuration.reduce((a, b) => ((a.duration || 0) > (b.duration || 0) ? a : b))
        : null;

      const issues: string[] = [];
      if (calls.length > PERF_BUDGETS.INITIAL_API_CALLS) {
        issues.push(`Too many API calls: ${calls.length} (budget: ${PERF_BUDGETS.INITIAL_API_CALLS})`);
      }
      if (duplicates.size > 0) {
        issues.push(`Duplicate requests detected: ${[...duplicates.entries()].map(([k, v]) => `${k} (${v}x)`).join(', ')}`);
      }

      return {
        totalCalls: calls.length,
        uniqueEndpoints: new Set(calls.map((c) => c.url)).size,
        duplicates: [...duplicates.entries()].map(([endpoint, count]) => ({ endpoint, count })),
        totalPayloadSize: this.getTotalPayloadSize(),
        avgResponseTime,
        slowestCall: slowest,
        journeyApiCalls: this.getByPattern(/\/api\/journey/).length,
        goalApiCalls: this.getByPattern(/\/api\/goals/).length,
        issues,
      };
    },
  };
}

// ============================================
// PAYLOAD SIZE UTILITIES
// ============================================

export function measurePayloadSize(data: unknown): number {
  return new Blob([JSON.stringify(data)]).size;
}

export function assertPayloadWithinBudget(data: unknown, budget = PERF_BUDGETS.JOURNEY_PAYLOAD_SIZE): {
  size: number;
  passed: boolean;
  budget: number;
} {
  const size = measurePayloadSize(data);
  return { size, passed: size <= budget, budget };
}

// ============================================
// REPORT FORMATTING
// ============================================

export function formatTimingReport(timings: TimingResult[]): string {
  const lines = [
    '=== Performance Timing Report ===',
    '',
    'Metric'.padEnd(40) + 'Duration'.padEnd(12) + 'Budget'.padEnd(12) + 'Status',
    '-'.repeat(76),
  ];

  for (const t of timings) {
    const status = t.passed ? 'PASS' : 'FAIL';
    const budgetStr = t.budget ? `${t.budget}ms` : '-';
    lines.push(
      t.name.padEnd(40) +
      `${t.duration}ms`.padEnd(12) +
      budgetStr.padEnd(12) +
      status
    );
  }

  const passed = timings.filter((t) => t.passed).length;
  lines.push('');
  lines.push(`Results: ${passed}/${timings.length} passed`);

  return lines.join('\n');
}

export function formatBenchmarkReport(results: BenchmarkResult[]): string {
  const lines = [
    '=== Performance Benchmark Report ===',
    '',
    'Benchmark'.padEnd(40) + 'Median'.padEnd(10) + 'P95'.padEnd(10) + 'P99'.padEnd(10) + 'StdDev',
    '-'.repeat(80),
  ];

  for (const r of results) {
    lines.push(
      r.name.padEnd(40) +
      `${r.median}ms`.padEnd(10) +
      `${r.p95}ms`.padEnd(10) +
      `${r.p99}ms`.padEnd(10) +
      `${r.stddev}ms`
    );
  }

  return lines.join('\n');
}
