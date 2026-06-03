/**
 * Unit tests for the server-sync cache helpers added to lens-progress.ts
 * (Phase D — journey lens progress persisted to JourneyGoalData.journeyCompletedSteps).
 *
 *   - cacheServerLensSteps writes the localStorage flags so the synchronous
 *     getters reflect server state (server → cache hydration).
 *   - It is additive/monotonic — it never clears a locally-set flag.
 *   - currentLensSteps reports exactly the steps currently marked done.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cacheServerLensSteps,
  currentLensSteps,
  isDiscoverConfirmed,
  isUnderstandConfirmed,
  isClarityActive,
  setDiscoverConfirmed,
} from "../lens-progress";

function installLocalStorageShim() {
  const store = new Map<string, string>();
  const ls: Storage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
  (globalThis as unknown as { window: typeof globalThis }).window =
    globalThis as unknown as typeof globalThis;
  (globalThis as unknown as { localStorage: Storage }).localStorage = ls;
  (globalThis.window as unknown as { localStorage: Storage }).localStorage = ls;
  return store;
}

let store: Map<string, string>;
beforeEach(() => {
  store = installLocalStorageShim();
});
afterEach(() => store.clear());

describe("lens server cache helpers", () => {
  const CAREER = "Veterinarian";

  it("currentLensSteps is empty for an untouched career", () => {
    expect(currentLensSteps(CAREER)).toEqual([]);
  });

  it("cacheServerLensSteps hydrates the synchronous getters from server steps", () => {
    cacheServerLensSteps(CAREER, ["discover", "understand"]);
    expect(isDiscoverConfirmed(CAREER)).toBe(true);
    expect(isUnderstandConfirmed(CAREER)).toBe(true);
    expect(isClarityActive(CAREER)).toBe(false);
    expect(currentLensSteps(CAREER)).toEqual(["discover", "understand"]);
  });

  it("hydrates clarity (legacy grow-active key) too", () => {
    cacheServerLensSteps(CAREER, ["discover", "understand", "clarity"]);
    expect(isClarityActive(CAREER)).toBe(true);
    expect(currentLensSteps(CAREER)).toEqual(["discover", "understand", "clarity"]);
  });

  it("is additive — never clears a locally-set flag", () => {
    setDiscoverConfirmed(CAREER, true);
    cacheServerLensSteps(CAREER, ["understand"]); // server lacks discover
    expect(isDiscoverConfirmed(CAREER)).toBe(true); // local flag preserved
    expect(isUnderstandConfirmed(CAREER)).toBe(true); // server flag added
  });

  it("ignores unknown step strings", () => {
    cacheServerLensSteps(CAREER, ["bogus", "discover"]);
    expect(currentLensSteps(CAREER)).toEqual(["discover"]);
  });

  it("keys per career — one career's steps don't bleed into another", () => {
    cacheServerLensSteps("Doctor", ["discover", "understand", "clarity"]);
    expect(currentLensSteps("Nurse")).toEqual([]);
  });
});
