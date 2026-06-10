/**
 * Canonical legal-document versions.
 *
 * Bump the relevant constant whenever the Terms or Privacy Policy changes
 * materially. The dashboard gate (`src/app/(dashboard)/layout.tsx`) compares
 * a user's stored acceptance against these and routes them to `/legal/accept`
 * on a mismatch — so a policy change actually re-prompts for consent
 * (GDPR Art. 7), instead of an old "v1" acceptance silently covering it.
 *
 * Keep these in step with the version strings rendered on the policy pages.
 */
export const CURRENT_TERMS_VERSION = "v1";
export const CURRENT_PRIVACY_VERSION = "v1";

/** True when the stored acceptance matches the current Terms + Privacy versions. */
export function isAcceptanceCurrent(
  acceptance: { termsVersion?: string | null; privacyVersion?: string | null } | null | undefined,
): boolean {
  return (
    !!acceptance &&
    acceptance.termsVersion === CURRENT_TERMS_VERSION &&
    acceptance.privacyVersion === CURRENT_PRIVACY_VERSION
  );
}

/**
 * Anonymise an IP before it is persisted (audit logs, consent / acceptance
 * records). Privacy policy promises IPs are "truncated or anonymised where
 * possible" — this delivers that: IPv4 keeps the /24 (last octet zeroed),
 * IPv6 keeps the /48. Use ONLY for stored values — rate-limiting still keys
 * on the full address for precision. Accepts an `x-forwarded-for` value
 * (possibly a comma list) and returns the anonymised first hop, or undefined.
 */
export function anonymiseIp(forwardedFor: string | null | undefined): string | undefined {
  if (!forwardedFor) return undefined;
  const ip = forwardedFor.split(",")[0]?.trim();
  if (!ip) return undefined;

  if (ip.includes(".")) {
    const octets = ip.split(".");
    if (octets.length === 4) {
      octets[3] = "0";
      return octets.join(".");
    }
    return undefined;
  }

  if (ip.includes(":")) {
    const groups = ip.split(":");
    // Keep the first 3 hextets (/48), zero the rest.
    return groups.slice(0, 3).join(":") + "::";
  }

  return undefined;
}
