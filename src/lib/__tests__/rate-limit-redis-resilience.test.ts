/**
 * Redis resilience for the rate limiter.
 *
 * Regression: a lapsed Redis subscription left REDIS_URL pointing at a dead
 * host. node-redis' reconnect strategy retried forever, so `client.connect()`
 * never settled — and every route that rate-limits (youtube-search on a cache
 * miss, simulation/narrate, journey/generate-timeline) hung until the platform
 * returned a 504. A cache dependency being down must DEGRADE the limiter to
 * in-memory, never hang the request.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

type CreateClientOptions = {
  url?: string;
  socket?: {
    reconnectStrategy?: (retries: number) => number | false | Error;
    connectTimeout?: number;
  };
};

const hoisted = vi.hoisted(() => ({
  // How the fake server behaves: 'hang' = connect() never settles,
  // 'reject' = connect() rejects, 'ok' = connects fine.
  mode: 'hang' as 'hang' | 'reject' | 'ok',
  lastOptions: undefined as CreateClientOptions | undefined,
  destroyed: 0,
  createCalls: 0,
}));

vi.mock('redis', () => ({
  createClient: (options: CreateClientOptions) => {
    hoisted.lastOptions = options;
    hoisted.createCalls += 1;
    return {
      isOpen: hoisted.mode === 'ok',
      on: () => {},
      connect: () =>
        hoisted.mode === 'hang'
          ? new Promise(() => {}) // never settles — the dead-host case
          : hoisted.mode === 'reject'
          ? Promise.reject(new Error('ECONNREFUSED'))
          : Promise.resolve(),
      destroy: () => {
        hoisted.destroyed += 1;
      },
      incr: async () => 1,
      expire: async () => true,
      ttl: async () => 60,
    };
  },
}));

async function loadModule() {
  vi.resetModules();
  return import('../rate-limit');
}

describe('rate limiter with an unreachable Redis', () => {
  beforeEach(() => {
    vi.stubEnv('REDIS_URL', 'redis://dead-host.example:6379');
    hoisted.mode = 'hang';
    hoisted.lastOptions = undefined;
    hoisted.destroyed = 0;
    hoisted.createCalls = 0;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('falls back to in-memory instead of hanging when connect() never settles', async () => {
    const { checkRateLimitAsync } = await loadModule();

    const startedAt = Date.now();
    const result = await checkRateLimitAsync('youtube-search:user-1', {
      interval: 60_000,
      maxRequests: 20,
    });
    const elapsed = Date.now() - startedAt;

    expect(result.success).toBe(true);
    expect(result.limit).toBe(20);
    // The whole point: bounded. Well under any platform gateway timeout.
    expect(elapsed).toBeLessThan(4_000);
  });

  it('does not pay the connect timeout again on the next request (cooldown)', async () => {
    const { checkRateLimitAsync } = await loadModule();
    await checkRateLimitAsync('youtube-search:user-1', { interval: 60_000, maxRequests: 20 });

    const startedAt = Date.now();
    const second = await checkRateLimitAsync('youtube-search:user-1', {
      interval: 60_000,
      maxRequests: 20,
    });
    const elapsed = Date.now() - startedAt;

    expect(second.success).toBe(true);
    expect(elapsed).toBeLessThan(100);
    // Cooldown means we don't build a fresh client per request either.
    expect(hoisted.createCalls).toBe(1);
  });

  it('abandons the hung client so it cannot keep retrying in the background', async () => {
    const { checkRateLimitAsync } = await loadModule();
    await checkRateLimitAsync('youtube-search:user-1', { interval: 60_000, maxRequests: 20 });

    expect(hoisted.destroyed).toBe(1);
  });

  it('gives up reconnecting rather than retrying forever', async () => {
    const { getRedisClient } = await loadModule();
    await getRedisClient();

    const strategy = hoisted.lastOptions?.socket?.reconnectStrategy;
    expect(strategy).toBeTypeOf('function');
    // Early retries back off...
    expect(strategy!(1)).toBeTypeOf('number');
    // ...but a persistently dead host must eventually stop the loop so
    // connect() rejects instead of pending forever.
    expect(strategy!(50)).toBe(false);
  });

  it('still returns in-memory results when connect() rejects outright', async () => {
    hoisted.mode = 'reject';
    const { checkRateLimitAsync } = await loadModule();

    const result = await checkRateLimitAsync('youtube-search:user-2', {
      interval: 60_000,
      maxRequests: 2,
    });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('enforces the limit while degraded (in-memory counting still applies)', async () => {
    const { checkRateLimitAsync } = await loadModule();
    const config = { interval: 60_000, maxRequests: 2 };

    await checkRateLimitAsync('narrate:user-3', config);
    await checkRateLimitAsync('narrate:user-3', config);
    const third = await checkRateLimitAsync('narrate:user-3', config);

    expect(third.success).toBe(false);
  });
});

describe('rate limiter with a healthy Redis', () => {
  beforeEach(() => {
    vi.stubEnv('REDIS_URL', 'redis://live-host.example:6379');
    hoisted.mode = 'ok';
    hoisted.createCalls = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses Redis and reuses the connection', async () => {
    const { checkRateLimitAsync, getRedisClient } = await loadModule();

    const result = await checkRateLimitAsync('youtube-search:user-9', {
      interval: 60_000,
      maxRequests: 20,
    });
    await getRedisClient();

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(19); // INCR → 1
    expect(hoisted.createCalls).toBe(1);
  });
});
