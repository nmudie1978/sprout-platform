/**
 * Email-domain matching for organisation discovery at registration.
 *
 * The product rule from section 16 of the spec, restated as code: a matching
 * domain produces an OFFER, not an enrolment. Silently attaching a young
 * person to an institution because of their email address would be exactly
 * the kind of dark pattern this platform exists not to have. AUTO_JOIN is
 * available, but an organisation has to choose it deliberately.
 */

import { DomainEnrolmentPolicy, OrgRole } from "@prisma/client";

import { emailDomain } from "./access-codes";

export interface DomainSnapshot {
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  organisationStatus: string;
  domain: string;
  verified: boolean;
  enrolmentPolicy: DomainEnrolmentPolicy;
  defaultRole: OrgRole;
  defaultCohortId: string | null;
}

export type DomainMatchOutcome =
  | { outcome: "none" }
  | { outcome: "offer"; match: DomainSnapshot }
  | { outcome: "auto_join"; match: DomainSnapshot };

/** Normalise a domain for storage: lowercase, no "@", no leading dot, no path. */
export function normaliseDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^\.+/, "")
    .replace(/\.+$/, "");
}

export function isPlausibleDomain(domain: string): boolean {
  // One dot minimum, no whitespace, no wildcards. Public free-mail domains
  // are rejected by the caller, not here — see FREE_MAIL_DOMAINS.
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
}

/**
 * Domains no organisation may claim. Letting a school register "gmail.com"
 * would hand it an enrolment offer for a large share of the platform.
 */
export const FREE_MAIL_DOMAINS: readonly string[] = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.no",
  "live.com",
  "live.no",
  "yahoo.com",
  "yahoo.co.uk",
  "icloud.com",
  "me.com",
  "protonmail.com",
  "proton.me",
  "aol.com",
  "gmx.com",
  "mail.com",
  "online.no",
  "start.no",
];

export function isClaimableDomain(domain: string): boolean {
  const normalised = normaliseDomain(domain);
  return isPlausibleDomain(normalised) && !FREE_MAIL_DOMAINS.includes(normalised);
}

/**
 * What should happen when someone registers with this email?
 *
 * Only VERIFIED domains at ACTIVE/ONBOARDING organisations count — an
 * unverified domain claim must never influence anyone's account.
 */
export function matchEmailToOrganisation(
  email: string,
  domains: DomainSnapshot[]
): DomainMatchOutcome {
  const domain = emailDomain(email);
  if (!domain) return { outcome: "none" };

  const match = domains.find(
    (d) =>
      d.verified &&
      normaliseDomain(d.domain) === domain &&
      (d.organisationStatus === "ACTIVE" || d.organisationStatus === "ONBOARDING")
  );

  if (!match) return { outcome: "none" };
  if (match.enrolmentPolicy === DomainEnrolmentPolicy.DISABLED) return { outcome: "none" };
  if (match.enrolmentPolicy === DomainEnrolmentPolicy.AUTO_JOIN) {
    return { outcome: "auto_join", match };
  }
  return { outcome: "offer", match };
}

/** Token the organisation publishes as a DNS TXT record to prove ownership. */
export function domainVerificationRecord(token: string): string {
  return `endeavrly-verification=${token}`;
}
