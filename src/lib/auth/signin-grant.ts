/**
 * Post-verification sign-in handoff (pure, server-side).
 *
 * THE PROBLEM. Under the hard gate (see ./verification-gate) signup ends on
 * "Check your email" with no session. The user opens the link — often in
 * another tab, sometimes on their phone — confirms, and the tab they signed up
 * in sits there forever telling them to check their email. They then have to
 * type the password they set sixty seconds ago. That dead end is what this
 * module removes: the waiting tab polls, notices the confirmation, and signs
 * itself in.
 *
 * THE TRUST MODEL. Signing someone in without a password needs the same
 * assurance a password gives. Two independent proofs are required here, and
 * neither alone is enough:
 *
 *   1. THE GRANT — an httpOnly cookie that /api/auth/signup seals onto the
 *      browser that created the account. SEALED, not merely marked: the
 *      plaintext `endeavrly_pending_verification` cookie is not proof of
 *      anything, since any script could set a same-named cookie holding
 *      someone else's address, and an unauthenticated "who am I waiting on"
 *      marker would then be a sign-in-as-anyone button. AES-256-GCM makes the
 *      grant both unforgeable (the tag) and unreadable (the ciphertext), which
 *      matters for the decoys described below.
 *
 *   2. THE CONFIRMATION — the account's `emailVerified` must have been stamped
 *      AFTER the grant was issued. "Is verified now" would be the wrong test:
 *      someone could sign up with a stranger's already-confirmed address and
 *      be handed their account. Requiring the confirmation to post-date the
 *      grant means the person holding this browser also opened that inbox,
 *      within the grant's 30-minute life.
 *
 * DECOYS. /api/auth/signup answers identically whether the address was free or
 * already registered, and `Set-Cookie` is fully visible to whoever made the
 * request — so a grant that appeared only for new accounts would re-open the
 * enumeration hole the whole signup route is built to close. The existing-
 * account path therefore seals a grant for a random id instead of omitting it.
 *
 * That only works because the payload is encrypted AND fixed-width. Signing
 * alone would have leaked it twice over: the payload would be readable, and a
 * 25-character cuid and a random stand-in would produce cookies of different
 * lengths — a perfect "was this address free?" tell in the response headers.
 * So the id field is padded to a constant width before sealing, and every
 * grant this module emits is exactly the same number of bytes.
 *
 * HANDOFF TOKENS. The grant is httpOnly, so the page cannot pass it to
 * NextAuth's `signIn()`. Once /api/auth/verification-status has checked the
 * grant AND the confirmation, it mints a short-lived handoff token in the
 * response body; that is what the client hands to the `verification-handoff`
 * provider. It lives two minutes, carries the grant's issue time so the
 * provider can re-check the confirmation ordering for itself, and carries a
 * nonce the provider burns to make it single-use.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "crypto";

/** httpOnly cookie holding the sealed grant. Set by /api/auth/signup. */
export const SIGNIN_GRANT_COOKIE = "endeavrly_signin_grant";

/**
 * How long the grant stays usable. Matches PENDING_VERIFICATION_MAX_AGE_S —
 * the two cookies describe the same moment ("this browser just signed up") and
 * would only confuse each other if they expired at different times.
 */
export const SIGNIN_GRANT_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** How long a minted handoff token may be exchanged for a session. */
export const HANDOFF_TOKEN_TTL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Slack allowed between the grant's issue time and the `emailVerified` stamp.
 *
 * Both come from server clocks, but not necessarily the same one — Vercel runs
 * many instances, and the row could be written by a different lambda than the
 * one that sealed the grant. A minute absorbs that drift. It does not weaken
 * the ordering check in any way that matters: a confirmation from *before* the
 * signup is minutes or days old, never seconds.
 */
export const VERIFICATION_CLOCK_SKEW_MS = 60 * 1000;

/**
 * Width the user-id field is padded to before sealing.
 *
 * THIS IS THE ENUMERATION GUARD, and it is the reason the field is padded at
 * all. AES-GCM is length-preserving, so a 25-character cuid and a 36-character
 * stand-in would produce cookies of visibly different lengths — which is
 * exactly the "was this address free?" answer /api/auth/signup refuses to give.
 * 36 covers a cuid, a cuid2 and a uuid with room to spare.
 */
const ID_FIELD_WIDTH = 36;

/** What a sealed blob is for. Bound in as AAD, so one can't be opened as the other. */
type GrantPurpose = "grant" | "handoff";

interface GrantPayload {
  /** User id the grant speaks for, padded to ID_FIELD_WIDTH. */
  u: string;
  /** When the GRANT was issued (ms). Carried unchanged onto the handoff token. */
  i: number;
  /** Expiry (ms). */
  x: number;
  /** Nonce — makes every token unique, and gives the handoff a burnable id. */
  n: string;
}

/** The key material. Absent in a misconfigured environment; callers degrade. */
export function grantSecret(): string | null {
  const secret = process.env.NEXTAUTH_SECRET;
  return typeof secret === "string" && secret.length >= 16 ? secret : null;
}

const IV_BYTES = 12;
const TAG_BYTES = 16;

/**
 * A 256-bit key derived from NEXTAUTH_SECRET.
 *
 * Domain-separated by the label, so this key can never coincide with anything
 * else that happens to be derived from the same secret (NextAuth's own JWE key,
 * most obviously).
 */
function sealingKey(secret: string): Buffer {
  return createHash("sha256").update(`endeavrly:signin-grant:v1:${secret}`).digest();
}

/**
 * Encrypt-and-authenticate. GCM's tag is the signature: a tampered byte
 * anywhere — ciphertext, IV or purpose — fails to open, so there is no separate
 * verification step to get wrong.
 */
function seal(payload: GrantPayload, purpose: GrantPurpose, secret: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", sealingKey(secret), iv);
  cipher.setAAD(Buffer.from(purpose, "utf8"));
  const body = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

/**
 * Open a sealed blob. Returns null for anything at all suspect — bad shape,
 * failed tag, wrong purpose, expired — with no distinction between them, since
 * the caller can't act on the difference and an attacker shouldn't learn it.
 */
function unseal(
  value: unknown,
  purpose: GrantPurpose,
  secret: string,
  now: number,
): GrantPayload | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return null;

  let payload: GrantPayload;
  try {
    const raw = Buffer.from(value, "base64url");
    if (raw.length <= IV_BYTES + TAG_BYTES) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      sealingKey(secret),
      raw.subarray(0, IV_BYTES),
    );
    decipher.setAAD(Buffer.from(purpose, "utf8"));
    decipher.setAuthTag(raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));
    const plain = Buffer.concat([
      decipher.update(raw.subarray(IV_BYTES + TAG_BYTES)),
      decipher.final(),
    ]);
    payload = JSON.parse(plain.toString("utf8"));
  } catch {
    // Wrong key, tampered bytes, wrong purpose, or not one of ours at all.
    return null;
  }

  if (!payload || typeof payload !== "object") return null;
  if (typeof payload.u !== "string" || !payload.u.trim()) return null;
  if (typeof payload.i !== "number" || typeof payload.x !== "number") return null;
  if (payload.x <= now) return null;
  return { ...payload, u: payload.u.trim() };
}

/** Issue a grant for a real, freshly created account. */
export function createSigninGrant(
  userId: string,
  { secret, now = Date.now() }: { secret: string; now?: number },
): string {
  return seal(
    {
      u: userId.padEnd(ID_FIELD_WIDTH, " "),
      i: now,
      x: now + SIGNIN_GRANT_TTL_MS,
      n: randomUUID(),
    },
    "grant",
    secret,
  );
}

/**
 * A grant for nobody, for the signup paths that must not hand out a real one
 * yet must not be distinguishable from the path that does. Resolves to no
 * user, so /api/auth/verification-status simply never reports it as verified.
 */
export function createDecoyGrant(
  { secret, now = Date.now() }: { secret: string; now?: number },
): string {
  return createSigninGrant(randomUUID(), { secret, now });
}

/** Read a grant cookie. Null unless it is intact, ours, and unexpired. */
export function readSigninGrant(
  value: unknown,
  { secret, now = Date.now() }: { secret: string; now?: number },
): { userId: string; issuedAt: number } | null {
  const payload = unseal(value, "grant", secret, now);
  return payload ? { userId: payload.u, issuedAt: payload.i } : null;
}

/**
 * Does this account's confirmation satisfy the grant?
 *
 * The ordering requirement — confirmed AFTER the grant was issued — is the
 * half of the trust model that proves inbox access. See the module note.
 */
export function verificationSatisfiesGrant(
  emailVerified: Date | null | undefined,
  grantIssuedAt: number,
): boolean {
  if (!emailVerified) return false;
  return emailVerified.getTime() >= grantIssuedAt - VERIFICATION_CLOCK_SKEW_MS;
}

/** Mint the short-lived token the browser exchanges for a session. */
export function createHandoffToken(
  { userId, grantIssuedAt }: { userId: string; grantIssuedAt: number },
  { secret, now = Date.now() }: { secret: string; now?: number },
): string {
  return seal(
    {
      u: userId.padEnd(ID_FIELD_WIDTH, " "),
      i: grantIssuedAt,
      x: now + HANDOFF_TOKEN_TTL_MS,
      n: randomUUID(),
    },
    "handoff",
    secret,
  );
}

/** Read a handoff token. `nonce` is the id the provider burns for single use. */
export function readHandoffToken(
  value: unknown,
  { secret, now = Date.now() }: { secret: string; now?: number },
): { userId: string; grantIssuedAt: number; nonce: string } | null {
  const payload = unseal(value, "handoff", secret, now);
  if (!payload || typeof payload.n !== "string" || !payload.n) return null;
  return { userId: payload.u, grantIssuedAt: payload.i, nonce: payload.n };
}
