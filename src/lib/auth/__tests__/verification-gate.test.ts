import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isVerificationRequired,
  isVerifiedEnoughToSignIn,
  blocksSession,
  isUnverifiedError,
  unverifiedSignInError,
  UNVERIFIED_ERROR_CODE,
  UNVERIFIED_SIGNIN_MESSAGE,
} from "@/lib/auth/verification-gate";

const env = process.env as Record<string, string | undefined>;

describe("isVerificationRequired", () => {
  let saved: string | undefined;
  beforeEach(() => {
    saved = env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED;
  });
  afterEach(() => {
    if (saved === undefined) delete env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED;
    else env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED = saved;
  });

  it("defaults ON when the variable is unset", () => {
    delete env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED;
    expect(isVerificationRequired()).toBe(true);
  });

  it('is disabled only by the exact string "false"', () => {
    env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED = "false";
    expect(isVerificationRequired()).toBe(false);
  });

  it("stays ON for any other value, including typos and falsy-looking ones", () => {
    // A misconfigured value must fail CLOSED — the gate is a safety control,
    // so "0" or "no" must never silently disable it.
    for (const value of ["true", "0", "no", "off", "", "False", "FALSE"]) {
      env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED = value;
      expect(isVerificationRequired()).toBe(true);
    }
  });

  it("is read fresh each call, not cached at import", () => {
    env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED = "false";
    expect(isVerificationRequired()).toBe(false);
    delete env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED;
    expect(isVerificationRequired()).toBe(true);
  });
});

describe("isVerifiedEnoughToSignIn", () => {
  it("accepts an account with a verification timestamp", () => {
    expect(isVerifiedEnoughToSignIn({ emailVerified: new Date() })).toBe(true);
  });

  it("rejects an account that has never confirmed", () => {
    expect(isVerifiedEnoughToSignIn({ emailVerified: null })).toBe(false);
  });
});

describe("blocksSession", () => {
  let saved: string | undefined;
  beforeEach(() => {
    saved = env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED;
    delete env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED;
  });
  afterEach(() => {
    if (saved === undefined) delete env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED;
    else env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED = saved;
  });

  it("blocks an unverified account while the gate is on", () => {
    expect(blocksSession({ emailVerified: null })).toBe(true);
  });

  it("lets a verified account through", () => {
    expect(blocksSession({ emailVerified: new Date() })).toBe(false);
  });

  it("blocks nobody once the gate is switched off", () => {
    env.NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED = "false";
    expect(blocksSession({ emailVerified: null })).toBe(false);
    expect(blocksSession({ emailVerified: new Date() })).toBe(false);
  });
});

describe("the sign-in error", () => {
  it("carries a stable code the UI can match on", () => {
    const err = unverifiedSignInError();
    expect(err.message).toContain(UNVERIFIED_ERROR_CODE);
    expect(isUnverifiedError(err.message)).toBe(true);
  });

  it("carries a human-readable explanation alongside the code", () => {
    expect(unverifiedSignInError().message).toContain(UNVERIFIED_SIGNIN_MESSAGE);
  });

  it("does not mistake other sign-in failures for the gate", () => {
    expect(isUnverifiedError("Invalid credentials")).toBe(false);
    expect(isUnverifiedError("This account is currently suspended.")).toBe(false);
    expect(isUnverifiedError("Too many sign-in attempts.")).toBe(false);
    expect(isUnverifiedError(null)).toBe(false);
    expect(isUnverifiedError(undefined)).toBe(false);
    expect(isUnverifiedError("")).toBe(false);
  });

  it("never names the address, so the message itself leaks nothing", () => {
    expect(unverifiedSignInError().message).not.toMatch(/@/);
  });
});
