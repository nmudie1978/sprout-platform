import { describe, it, expect } from "vitest";
import {
  VERIFICATION_TOKEN_TTL_MS,
  RESEND_COOLDOWN_MS,
  generateVerificationToken,
  hashVerificationToken,
  verificationTokenExpiry,
  isVerificationTokenUsable,
  canResendVerification,
  resendCooldownRemainingMs,
  normaliseEmail,
  maskEmail,
  parseVerificationOutcome,
} from "@/lib/auth/email-verification";

describe("verification tokens", () => {
  it("generates a high-entropy token", () => {
    const token = generateVerificationToken();
    // 32 random bytes rendered as hex.
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("never generates the same token twice", () => {
    const tokens = new Set(Array.from({ length: 500 }, generateVerificationToken));
    expect(tokens.size).toBe(500);
  });

  it("hashes deterministically, and the hash is not the token", () => {
    const token = generateVerificationToken();
    const hash = hashVerificationToken(token);
    expect(hash).toBe(hashVerificationToken(token));
    expect(hash).not.toBe(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("gives different tokens different hashes", () => {
    expect(hashVerificationToken("a")).not.toBe(hashVerificationToken("b"));
  });

  it("expires 24 hours after issue", () => {
    const now = 1_700_000_000_000;
    expect(verificationTokenExpiry(now).getTime()).toBe(now + VERIFICATION_TOKEN_TTL_MS);
    expect(VERIFICATION_TOKEN_TTL_MS).toBe(24 * 60 * 60 * 1000);
  });
});

describe("isVerificationTokenUsable", () => {
  const now = 1_700_000_000_000;

  it("accepts an unused, unexpired token", () => {
    expect(
      isVerificationTokenUsable({ usedAt: null, expiresAt: new Date(now + 1000) }, now),
    ).toBe(true);
  });

  it("rejects a token that has already been used", () => {
    expect(
      isVerificationTokenUsable(
        { usedAt: new Date(now - 1), expiresAt: new Date(now + 10_000) },
        now,
      ),
    ).toBe(false);
  });

  it("rejects an expired token", () => {
    expect(
      isVerificationTokenUsable({ usedAt: null, expiresAt: new Date(now - 1) }, now),
    ).toBe(false);
  });

  it("rejects a token expiring exactly now (no off-by-one grace)", () => {
    expect(
      isVerificationTokenUsable({ usedAt: null, expiresAt: new Date(now) }, now),
    ).toBe(false);
  });

  it("rejects a missing token", () => {
    expect(isVerificationTokenUsable(null, now)).toBe(false);
    expect(isVerificationTokenUsable(undefined, now)).toBe(false);
  });
});

describe("resend cooldown", () => {
  const now = 1_700_000_000_000;

  it("allows the very first send", () => {
    expect(canResendVerification(null, now)).toBe(true);
    expect(resendCooldownRemainingMs(null, now)).toBe(0);
  });

  it("blocks a second send inside the window", () => {
    const justNow = new Date(now - 1000);
    expect(canResendVerification(justNow, now)).toBe(false);
    expect(resendCooldownRemainingMs(justNow, now)).toBe(RESEND_COOLDOWN_MS - 1000);
  });

  it("allows again exactly at the boundary", () => {
    const then = new Date(now - RESEND_COOLDOWN_MS);
    expect(canResendVerification(then, now)).toBe(true);
    expect(resendCooldownRemainingMs(then, now)).toBe(0);
  });

  it("never reports a negative wait", () => {
    expect(resendCooldownRemainingMs(new Date(now - 999_999), now)).toBe(0);
  });
});

describe("normaliseEmail", () => {
  it("lowercases and trims so case variants are the same account", () => {
    expect(normaliseEmail("  Foo@Bar.COM ")).toBe("foo@bar.com");
    expect(normaliseEmail("foo@bar.com")).toBe(normaliseEmail("FOO@BAR.COM"));
  });

  it("returns an empty string for non-strings rather than throwing", () => {
    expect(normaliseEmail(undefined)).toBe("");
    expect(normaliseEmail(null)).toBe("");
    expect(normaliseEmail(42)).toBe("");
    expect(normaliseEmail({})).toBe("");
  });
});

describe("maskEmail", () => {
  it("keeps the first and last local character", () => {
    expect(maskEmail("alexandra@hotmail.com")).toBe("a•••••••a@hotmail.com");
  });

  it("keeps the domain intact so the user knows which inbox to open", () => {
    expect(maskEmail("someone@school.vgs.no").endsWith("@school.vgs.no")).toBe(true);
  });

  it("handles very short local parts without leaking them whole", () => {
    expect(maskEmail("jo@x.co")).toBe("j•@x.co");
    expect(maskEmail("a@x.co")).toBe("•@x.co");
  });

  it("masks at least one character of any local part", () => {
    for (const address of ["ab@x.co", "abc@x.co", "abcd@x.co"]) {
      const masked = maskEmail(address);
      expect(masked).toContain("•");
      expect(masked).not.toBe(address);
    }
  });

  it("degrades safely on malformed input rather than echoing it", () => {
    expect(maskEmail("not-an-email")).toBe("•••");
    expect(maskEmail("@nolocal.com")).toBe("•••");
    expect(maskEmail("nodomain@")).toBe("•••");
    expect(maskEmail("")).toBe("•••");
  });

  it("splits on the LAST @, so the real domain is the one shown", () => {
    // Local part is "a@b" (3 chars) -> first + one dot + last.
    expect(maskEmail("a@b@real.com")).toBe("a•b@real.com");
    expect(maskEmail("a@b@real.com").endsWith("@real.com")).toBe(true);
  });
});

describe("parseVerificationOutcome", () => {
  it("passes through the four known outcomes", () => {
    for (const status of ["success", "already", "expired", "invalid"]) {
      expect(parseVerificationOutcome(status)).toBe(status);
    }
  });

  it("falls back to the safe 'invalid' state for anything else", () => {
    expect(parseVerificationOutcome("hacked")).toBe("invalid");
    expect(parseVerificationOutcome("")).toBe("invalid");
    expect(parseVerificationOutcome(undefined)).toBe("invalid");
    expect(parseVerificationOutcome(null)).toBe("invalid");
    expect(parseVerificationOutcome({ toString: () => "success" })).toBe("invalid");
  });
});
