import { describe, it, expect } from "vitest";
import {
  SIGNIN_GRANT_TTL_MS,
  HANDOFF_TOKEN_TTL_MS,
  VERIFICATION_CLOCK_SKEW_MS,
  createSigninGrant,
  createDecoyGrant,
  readSigninGrant,
  createHandoffToken,
  readHandoffToken,
  verificationSatisfiesGrant,
} from "@/lib/auth/signin-grant";

const secret = "test-secret-value-at-least-16-chars";
const opts = { secret };
const NOW = 1_700_000_000_000;

describe("sign-in grant", () => {
  it("round-trips the user id and issue time", () => {
    const grant = createSigninGrant("user-1", { secret, now: NOW });
    expect(readSigninGrant(grant, { secret, now: NOW + 1000 })).toEqual({
      userId: "user-1",
      issuedAt: NOW,
    });
  });

  it("expires after the TTL", () => {
    const grant = createSigninGrant("user-1", { secret, now: NOW });
    expect(readSigninGrant(grant, { secret, now: NOW + SIGNIN_GRANT_TTL_MS - 1 })).not.toBeNull();
    expect(readSigninGrant(grant, { secret, now: NOW + SIGNIN_GRANT_TTL_MS })).toBeNull();
  });

  it("rejects a grant sealed with a different secret", () => {
    const grant = createSigninGrant("user-1", { secret: "another-secret-16-chars-long", now: NOW });
    expect(readSigninGrant(grant, { secret, now: NOW })).toBeNull();
  });

  // The whole point of sealing it: an attacker who can set cookies in their own
  // browser must not be able to name someone else's account.
  it("rejects a hand-built grant naming another user", () => {
    const forged = Buffer.concat([
      Buffer.alloc(28), // plausible IV + tag
      Buffer.from(JSON.stringify({ u: "victim", i: NOW, x: NOW + 60_000, n: "x" })),
    ]).toString("base64url");
    expect(readSigninGrant(forged, { secret, now: NOW })).toBeNull();
  });

  it("rejects a grant with any byte tampered with", () => {
    const grant = createSigninGrant("user-1", { secret, now: NOW });
    const raw = Buffer.from(grant, "base64url");
    for (const index of [0, 14, raw.length - 1]) {
      const tampered = Buffer.from(raw);
      tampered[index] ^= 0xff;
      expect(readSigninGrant(tampered.toString("base64url"), { secret, now: NOW })).toBeNull();
    }
  });

  // The cookie is encrypted, not just signed — so a curious user can't read
  // their own account id out of it, and (see the decoy test) an attacker can't
  // tell a real grant from a decoy by decoding one.
  it("does not carry a readable payload", () => {
    const grant = createSigninGrant("user-secret-id", { secret, now: NOW });
    const raw = Buffer.from(grant, "base64url").toString("utf8");
    expect(raw).not.toContain("user-secret-id");
    expect(raw).not.toContain(String(NOW));
  });

  it("rejects junk, empty and absent values", () => {
    for (const value of ["", "nope", "a.b", "!!!!", null, undefined, 42, {}]) {
      expect(readSigninGrant(value, { secret, now: NOW })).toBeNull();
    }
  });

  // ENUMERATION PARITY. Set-Cookie is visible to whoever made the signup
  // request, so a decoy that differed in length by even one byte would answer
  // "was this address free?". A cuid is 25 characters and the decoy id is 36;
  // the padding is what makes them come out identical.
  it("mints decoys byte-for-byte the same length as a real grant", () => {
    const real = createSigninGrant("clh1234567890abcdefghijkl", { secret, now: NOW });
    const decoy = createDecoyGrant({ secret, now: NOW });
    expect(decoy.length).toBe(real.length);
  });

  it("keeps that length regardless of how long the real id is", () => {
    const lengths = new Set(
      ["a", "clh1234567890abcdefghijkl", "0f9c8b7a-1234-4567-89ab-cdef01234567"].map(
        (id) => createSigninGrant(id, { secret, now: NOW }).length,
      ),
    );
    expect(lengths.size).toBe(1);
  });

  it("resolves a decoy to a user id nobody has", () => {
    const parsed = readSigninGrant(createDecoyGrant({ secret, now: NOW }), {
      secret,
      now: NOW,
    });
    expect(parsed?.userId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("strips the padding when reading a real id back", () => {
    const grant = createSigninGrant("clh1234567890abcdefghijkl", { secret, now: NOW });
    expect(readSigninGrant(grant, { secret, now: NOW })?.userId).toBe(
      "clh1234567890abcdefghijkl",
    );
  });

  it("mints a different value every time", () => {
    const values = new Set(
      Array.from({ length: 50 }, () => createSigninGrant("user-1", { secret, now: NOW })),
    );
    expect(values.size).toBe(50);
  });
});

describe("verificationSatisfiesGrant", () => {
  it("is false when the address was never confirmed", () => {
    expect(verificationSatisfiesGrant(null, NOW)).toBe(false);
    expect(verificationSatisfiesGrant(undefined, NOW)).toBe(false);
  });

  it("is true when confirmation came after the grant", () => {
    expect(verificationSatisfiesGrant(new Date(NOW + 5_000), NOW)).toBe(true);
  });

  // The case that stops "sign up with a stranger's confirmed address, get
  // handed their account".
  it("is false when the address was already confirmed before signup", () => {
    expect(verificationSatisfiesGrant(new Date(NOW - 86_400_000), NOW)).toBe(false);
  });

  it("tolerates a minute of clock drift between instances", () => {
    expect(verificationSatisfiesGrant(new Date(NOW - VERIFICATION_CLOCK_SKEW_MS + 1), NOW)).toBe(true);
    expect(verificationSatisfiesGrant(new Date(NOW - VERIFICATION_CLOCK_SKEW_MS - 1), NOW)).toBe(false);
  });
});

describe("handoff token", () => {
  it("carries the user and the grant's issue time", () => {
    const token = createHandoffToken({ userId: "user-1", grantIssuedAt: NOW }, { secret, now: NOW });
    const read = readHandoffToken(token, { secret, now: NOW });
    expect(read?.userId).toBe("user-1");
    expect(read?.grantIssuedAt).toBe(NOW);
    expect(read?.nonce).toBeTruthy();
  });

  it("expires after two minutes", () => {
    const token = createHandoffToken({ userId: "u", grantIssuedAt: NOW }, { secret, now: NOW });
    expect(readHandoffToken(token, { secret, now: NOW + HANDOFF_TOKEN_TTL_MS - 1 })).not.toBeNull();
    expect(readHandoffToken(token, { secret, now: NOW + HANDOFF_TOKEN_TTL_MS })).toBeNull();
  });

  it("gives every token a distinct nonce, so single-use burning works", () => {
    const nonces = new Set(
      Array.from(
        { length: 50 },
        () => readHandoffToken(
          createHandoffToken({ userId: "u", grantIssuedAt: NOW }, { secret, now: NOW }),
          { secret, now: NOW },
        )?.nonce,
      ),
    );
    expect(nonces.size).toBe(50);
  });

  // Purpose separation, enforced by the AAD the blob is sealed with: a
  // 30-minute grant must not be usable as the thing that actually mints a
  // session, and vice versa.
  it("refuses to read a grant as a handoff token", () => {
    const grant = createSigninGrant("user-1", { secret, now: NOW });
    expect(readHandoffToken(grant, { secret, now: NOW })).toBeNull();
  });

  it("refuses to read a handoff token as a grant", () => {
    const token = createHandoffToken({ userId: "u", grantIssuedAt: NOW }, { secret, now: NOW });
    expect(readSigninGrant(token, { secret, now: NOW })).toBeNull();
  });

  it("rejects a token sealed with a different secret", () => {
    const token = createHandoffToken(
      { userId: "u", grantIssuedAt: NOW },
      { secret: "different-secret-16-chars-min", now: NOW },
    );
    expect(readHandoffToken(token, opts)).toBeNull();
  });
});
