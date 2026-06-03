import { describe, it, expect } from "vitest";
import {
  userThemeKey,
  readUserTheme,
  writeUserTheme,
  resolveBootTheme,
} from "@/lib/theme/user-theme";

/** Minimal in-memory Storage-like for tests. */
function makeStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    _map: map,
  };
}

describe("user-theme", () => {
  it("keys storage per user", () => {
    expect(userThemeKey("abc")).toBe("endeavrly-theme:abc");
  });

  it("reads null when the user has never chosen", () => {
    expect(readUserTheme("u1", makeStorage())).toBeNull();
  });

  it("reads a saved light/dark choice", () => {
    expect(readUserTheme("u1", makeStorage({ "endeavrly-theme:u1": "light" }))).toBe("light");
    expect(readUserTheme("u1", makeStorage({ "endeavrly-theme:u1": "dark" }))).toBe("dark");
  });

  it("ignores garbage / non-theme values", () => {
    expect(readUserTheme("u1", makeStorage({ "endeavrly-theme:u1": "system" }))).toBeNull();
    expect(readUserTheme("u1", makeStorage({ "endeavrly-theme:u1": "" }))).toBeNull();
  });

  it("does not read another user's choice", () => {
    const s = makeStorage({ "endeavrly-theme:other": "light" });
    expect(readUserTheme("u1", s)).toBeNull();
  });

  it("writes the choice under the per-user key", () => {
    const s = makeStorage();
    writeUserTheme("u1", "light", s);
    expect(s._map.get("endeavrly-theme:u1")).toBe("light");
  });

  it("resolveBootTheme defaults to dark when no choice exists (the core guarantee)", () => {
    expect(resolveBootTheme("newUser", makeStorage())).toBe("dark");
    // Even when ANOTHER user left light on this browser, the new user gets dark.
    expect(resolveBootTheme("newUser", makeStorage({ "endeavrly-theme:prev": "light" }))).toBe("dark");
  });

  it("resolveBootTheme honours the user's own saved light opt-in", () => {
    expect(resolveBootTheme("u1", makeStorage({ "endeavrly-theme:u1": "light" }))).toBe("light");
  });

  it("treats empty userId as no-op", () => {
    expect(readUserTheme("", makeStorage({ "endeavrly-theme:": "light" }))).toBeNull();
    const s = makeStorage();
    writeUserTheme("", "light", s);
    expect(s._map.size).toBe(0);
  });
});
