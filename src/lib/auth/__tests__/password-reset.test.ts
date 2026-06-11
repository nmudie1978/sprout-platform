import { describe, it, expect } from "vitest";
import {
  generateResetToken,
  hashResetToken,
  resetTokenExpiry,
  isResetTokenUsable,
  validateNewPassword,
  RESET_TOKEN_TTL_MS,
} from "../password-reset";

describe("password-reset helpers", () => {
  it("generates distinct, hex, high-entropy tokens", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hashes deterministically and never returns the raw token", () => {
    const raw = generateResetToken();
    expect(hashResetToken(raw)).toBe(hashResetToken(raw));
    expect(hashResetToken(raw)).not.toBe(raw);
    expect(hashResetToken("a")).not.toBe(hashResetToken("b"));
  });

  it("expiry is TTL in the future", () => {
    const now = 1_000_000;
    expect(resetTokenExpiry(now).getTime()).toBe(now + RESET_TOKEN_TTL_MS);
  });

  it("usable only when unused and unexpired", () => {
    const now = 1_000_000;
    expect(isResetTokenUsable({ usedAt: null, expiresAt: new Date(now + 1000) }, now)).toBe(true);
    expect(isResetTokenUsable({ usedAt: new Date(now), expiresAt: new Date(now + 1000) }, now)).toBe(false); // used
    expect(isResetTokenUsable({ usedAt: null, expiresAt: new Date(now - 1) }, now)).toBe(false); // expired
    expect(isResetTokenUsable(null, now)).toBe(false);
  });

  it("validates password length", () => {
    expect(validateNewPassword("short")).toMatch(/at least 8/);
    expect(validateNewPassword(12345678)).toMatch(/at least 8/);
    expect(validateNewPassword("longenough")).toBeNull();
  });
});
