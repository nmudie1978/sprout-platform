import { describe, expect, it, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useViewMode } from "../useViewMode";

const ALLOWED = ["list", "small", "large"] as const;
const KEY = "test:view";

function render() {
  return renderHook(() =>
    useViewMode<(typeof ALLOWED)[number]>({
      storageKey: KEY,
      allowed: ALLOWED,
      defaultMode: "list",
    })
  );
}

describe("useViewMode", () => {
  beforeEach(() => localStorage.clear());

  it("starts on the default so server and first client render agree", () => {
    const { result } = render();
    expect(result.current.viewMode).toBe("list");
  });

  it("restores a previously chosen view", () => {
    localStorage.setItem(KEY, "large");
    const { result } = render();
    expect(result.current.viewMode).toBe("large");
  });

  it("ignores a stored value outside the allowed set", () => {
    // A stale key from an older build, or a hand-edited one, must not render
    // a view that no longer exists.
    localStorage.setItem(KEY, "compact");
    const { result } = render();
    expect(result.current.viewMode).toBe("list");
  });

  it("persists a new choice", () => {
    const { result } = render();
    act(() => result.current.setViewMode("small"));
    expect(result.current.viewMode).toBe("small");
    expect(localStorage.getItem(KEY)).toBe("small");
  });

  it("refuses a mode outside the allowed set", () => {
    const { result } = render();
    act(() => result.current.setViewMode("nope" as never));
    expect(result.current.viewMode).toBe("list");
  });

  it("still works when storage throws (private mode)", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const { result } = render();
    act(() => result.current.setViewMode("large"));
    // The choice applies even though it couldn't be remembered.
    expect(result.current.viewMode).toBe("large");
    spy.mockRestore();
  });
});
