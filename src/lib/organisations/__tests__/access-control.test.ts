import { describe, it, expect } from "vitest";
import {
  AccessCodeStatus,
  DomainEnrolmentPolicy,
  EntitlementModule,
  InvitationStatus,
  LicenceStatus,
  OrgRole,
} from "@prisma/client";

import {
  ACCESS_CODE_MESSAGES,
  derivedCodeStatus,
  emailDomain,
  generateAccessCode,
  membershipExpiryFor,
  normaliseAccessCode,
  validateAccessCode,
  type AccessCodeSnapshot,
} from "../access-codes";
import {
  FREE_MAIL_DOMAINS,
  isClaimableDomain,
  matchEmailToOrganisation,
  normaliseDomain,
  type DomainSnapshot,
} from "../domains";
import {
  DEFAULT_INVITATION_TTL_DAYS,
  generateInvitationToken,
  hashInvitationToken,
  invitationExpiry,
  invitationTokenMatches,
  parseBulkEmails,
  validateInvitation,
  type InvitationSnapshot,
} from "../invitations";
import {
  buildCommercialAlerts,
  checkSeatAvailable,
  derivedLicenceStatus,
  isApproachingSeatLimit,
  seatUtilisation,
  summariseRevenue,
} from "../licences";
import { ROLE_PERMISSIONS, isStaffRole, roleHasPermission } from "../permissions";
import {
  DEFAULT_PRIVACY_SETTINGS,
  canShowAggregate,
  canViewIndividualParticipant,
  redactAggregate,
  type OrganisationPrivacySettings,
} from "../visibility";

const NOW = new Date("2027-03-01T12:00:00.000Z");
const PAST = new Date("2026-01-01T00:00:00.000Z");
const FUTURE = new Date("2028-01-01T00:00:00.000Z");

// ── permissions ────────────────────────────────────────────────────────────

describe("role permissions", () => {
  it("gives participants and parents no organisational permissions at all", () => {
    expect(ROLE_PERMISSIONS[OrgRole.PARTICIPANT]).toHaveLength(0);
    expect(ROLE_PERMISSIONS[OrgRole.PARENT]).toHaveLength(0);
    expect(isStaffRole(OrgRole.PARTICIPANT)).toBe(false);
    expect(isStaffRole(OrgRole.PARENT)).toBe(false);
  });

  it("keeps member management away from advisors and educators", () => {
    for (const role of [OrgRole.ADVISOR, OrgRole.EDUCATOR]) {
      expect(roleHasPermission(role, "members:invite")).toBe(false);
      expect(roleHasPermission(role, "members:remove")).toBe(false);
      expect(roleHasPermission(role, "codes:create")).toBe(false);
      expect(roleHasPermission(role, "org:edit_settings")).toBe(false);
    }
  });

  it("does not let a manager edit settings or mint access codes", () => {
    expect(roleHasPermission(OrgRole.MANAGER, "org:edit_settings")).toBe(false);
    expect(roleHasPermission(OrgRole.MANAGER, "codes:create")).toBe(false);
    expect(roleHasPermission(OrgRole.MANAGER, "members:remove")).toBe(false);
  });

  it("gives only the organisation admin the full administrative set", () => {
    expect(roleHasPermission(OrgRole.ORGANISATION_ADMIN, "members:invite")).toBe(true);
    expect(roleHasPermission(OrgRole.ORGANISATION_ADMIN, "codes:create")).toBe(true);
    expect(roleHasPermission(OrgRole.ORGANISATION_ADMIN, "org:edit_settings")).toBe(true);
  });

  it("never grants an admin individual-level participant visibility", () => {
    // Administering an organisation is not a reason to read a young person's
    // journey. That is a separate, consent-gated decision.
    expect(
      roleHasPermission(OrgRole.ORGANISATION_ADMIN, "analytics:view_assigned_individuals")
    ).toBe(false);
    expect(
      roleHasPermission(OrgRole.ORGANISATION_ADMIN, "analytics:view_cohort_individuals")
    ).toBe(false);
  });
});

// ── visibility ─────────────────────────────────────────────────────────────

function settings(
  overrides: Partial<OrganisationPrivacySettings> = {}
): OrganisationPrivacySettings {
  return { ...DEFAULT_PRIVACY_SETTINGS, ...overrides };
}

describe("individual participant visibility", () => {
  const assignedAdvisor = {
    viewerRole: OrgRole.ADVISOR,
    isAssignedAdvisor: true,
    sharesCohortAsEducator: false,
    participantHasConsented: true,
  };

  it("denies everyone by default", () => {
    const decision = canViewIndividualParticipant({ ...assignedAdvisor, settings: settings() });
    expect(decision).toEqual({
      allowed: false,
      reason: "ORGANISATION_DISALLOWS_INDIVIDUAL_VIEW",
    });
  });

  it("allows an assigned advisor once the organisation opts in and the young person consents", () => {
    const decision = canViewIndividualParticipant({
      ...assignedAdvisor,
      settings: settings({ allowIndividualParticipantView: true }),
    });
    expect(decision.allowed).toBe(true);
  });

  it("denies an advisor who is not assigned to that participant", () => {
    const decision = canViewIndividualParticipant({
      ...assignedAdvisor,
      isAssignedAdvisor: false,
      settings: settings({ allowIndividualParticipantView: true }),
    });
    expect(decision).toEqual({ allowed: false, reason: "NO_RELATIONSHIP_TO_PARTICIPANT" });
  });

  it("denies an assigned advisor when the young person has not consented", () => {
    const decision = canViewIndividualParticipant({
      ...assignedAdvisor,
      participantHasConsented: false,
      settings: settings({ allowIndividualParticipantView: true }),
    });
    expect(decision).toEqual({ allowed: false, reason: "PARTICIPANT_HAS_NOT_CONSENTED" });
  });

  it("skips the consent gate when the organisation's policy does not require it", () => {
    const decision = canViewIndividualParticipant({
      ...assignedAdvisor,
      participantHasConsented: false,
      settings: settings({
        allowIndividualParticipantView: true,
        requireParticipantDataSharingConsent: false,
      }),
    });
    expect(decision.allowed).toBe(true);
  });

  it("denies a manager by default even with the org switch on", () => {
    const decision = canViewIndividualParticipant({
      viewerRole: OrgRole.MANAGER,
      isAssignedAdvisor: false,
      sharesCohortAsEducator: false,
      participantHasConsented: true,
      settings: settings({ allowIndividualParticipantView: true }),
    });
    expect(decision).toEqual({ allowed: false, reason: "ROLE_DISALLOWS_INDIVIDUAL_VIEW" });
  });

  it("denies an educator until the org enables cohort detail", () => {
    const base = {
      viewerRole: OrgRole.EDUCATOR,
      isAssignedAdvisor: false,
      sharesCohortAsEducator: true,
      participantHasConsented: true,
    };
    expect(
      canViewIndividualParticipant({
        ...base,
        settings: settings({ allowIndividualParticipantView: true }),
      })
    ).toEqual({ allowed: false, reason: "ROLE_DISALLOWS_INDIVIDUAL_VIEW" });

    expect(
      canViewIndividualParticipant({
        ...base,
        settings: settings({
          allowIndividualParticipantView: true,
          educatorCanViewCohortDetail: true,
        }),
      }).allowed
    ).toBe(true);
  });

  it.each([OrgRole.PARTICIPANT, OrgRole.PARENT, OrgRole.ORGANISATION_ADMIN])(
    "never allows %s an individual view",
    (role) => {
      const decision = canViewIndividualParticipant({
        viewerRole: role,
        isAssignedAdvisor: true,
        sharesCohortAsEducator: true,
        participantHasConsented: true,
        settings: settings({
          allowIndividualParticipantView: true,
          advisorCanViewAssignedDetail: true,
          educatorCanViewCohortDetail: true,
          managerCanViewIndividualDetail: true,
        }),
      });
      expect(decision.allowed).toBe(false);
    }
  );
});

describe("aggregate redaction", () => {
  it("hides aggregates for groups below the k-anonymity floor", () => {
    expect(canShowAggregate(4, settings())).toBe(false);
    expect(canShowAggregate(5, settings())).toBe(true);
  });

  it("returns null rather than a small-group breakdown", () => {
    const rows = [{ count: 3 }, { count: 1 }];
    expect(redactAggregate(rows, 4, settings())).toBeNull();
  });

  it("drops long-tail buckets that would identify individuals", () => {
    const rows = [{ count: 12 }, { count: 6 }, { count: 1 }, { count: 2 }];
    expect(redactAggregate(rows, 21, settings())).toEqual([{ count: 12 }, { count: 6 }]);
  });
});

// ── access codes ───────────────────────────────────────────────────────────

function code(overrides: Partial<AccessCodeSnapshot> = {}): AccessCodeSnapshot {
  return {
    id: "code_1",
    code: "NAV-YOUTH-2027",
    status: AccessCodeStatus.ACTIVE,
    organisationId: "org_1",
    organisationStatus: "ACTIVE",
    cohortId: "cohort_1",
    assignedRole: OrgRole.PARTICIPANT,
    maxUses: 500,
    currentUses: 237,
    singleUse: false,
    expiresAt: FUTURE,
    allowedEmailDomains: [],
    moduleOverrides: [EntitlementModule.CAREER_DNA],
    membershipDurationDays: null,
    ...overrides,
  };
}

describe("access code validation", () => {
  const ctx = { email: "ung@example.no", alreadyRedeemed: false };

  it("accepts a healthy code", () => {
    const result = validateAccessCode(code(), ctx, NOW);
    expect(result.valid).toBe(true);
  });

  it.each([
    ["missing", null, "CODE_NOT_FOUND"],
    ["inactive", code({ status: AccessCodeStatus.INACTIVE }), "CODE_INACTIVE"],
    ["expired by status", code({ status: AccessCodeStatus.EXPIRED }), "CODE_EXPIRED"],
    ["expired by date", code({ expiresAt: PAST }), "CODE_EXPIRED"],
    ["exhausted", code({ maxUses: 500, currentUses: 500 }), "CODE_EXHAUSTED"],
    ["single-use already used", code({ singleUse: true, currentUses: 1 }), "CODE_EXHAUSTED"],
    [
      "for a churned organisation",
      code({ organisationStatus: "CHURNED" }),
      "ORGANISATION_NOT_ACTIVE",
    ],
  ])("rejects a %s code", (_label, snapshot, reason) => {
    const result = validateAccessCode(snapshot, ctx, NOW);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe(reason);
      expect(ACCESS_CODE_MESSAGES[result.reason]).toBeTruthy();
    }
  });

  it("rejects a second redemption by the same account", () => {
    const result = validateAccessCode(code(), { ...ctx, alreadyRedeemed: true }, NOW);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toBe("CODE_ALREADY_REDEEMED");
  });

  it("enforces email-domain restrictions", () => {
    const restricted = code({ allowedEmailDomains: ["oslo.kommune.no"] });
    expect(validateAccessCode(restricted, ctx, NOW).valid).toBe(false);
    expect(
      validateAccessCode(restricted, { email: "a@OSLO.KOMMUNE.NO", alreadyRedeemed: false }, NOW)
        .valid
    ).toBe(true);
  });

  it("treats an unlimited code as never exhausted", () => {
    const unlimited = code({ maxUses: null, currentUses: 99999 });
    expect(validateAccessCode(unlimited, ctx, NOW).valid).toBe(true);
  });

  it("normalises user input", () => {
    expect(normaliseAccessCode("  nav-youth-2027 ")).toBe("NAV-YOUTH-2027");
    expect(normaliseAccessCode("nav youth 2027")).toBe("NAVYOUTH2027");
  });

  it("extracts email domains case-insensitively", () => {
    expect(emailDomain("Person@Example.NO")).toBe("example.no");
    expect(emailDomain("not-an-email")).toBe("");
  });
});

describe("access code generation", () => {
  it("produces a prefixed, readable code", () => {
    const generated = generateAccessCode("nav-youth-2027", 4, () => 0);
    expect(generated).toBe("NAV-YOUTH-2027-AAAA");
  });

  it("produces a bare code when no prefix is given", () => {
    expect(generateAccessCode(null, 6, () => 1)).toBe("BBBBBB");
  });

  it("excludes confusable characters", () => {
    const generated = generateAccessCode(null, 200);
    expect(generated).not.toMatch(/[01OIL]/);
  });
});

describe("derived code status", () => {
  it("marks an exhausted code exhausted", () => {
    expect(derivedCodeStatus({ ...code({ currentUses: 500 }) }, NOW)).toBe(
      AccessCodeStatus.EXHAUSTED
    );
  });

  it("marks a lapsed code expired", () => {
    expect(derivedCodeStatus({ ...code({ expiresAt: PAST }) }, NOW)).toBe(AccessCodeStatus.EXPIRED);
  });

  it("leaves a deliberately deactivated code alone", () => {
    expect(
      derivedCodeStatus({ ...code({ status: AccessCodeStatus.INACTIVE, expiresAt: PAST }) }, NOW)
    ).toBe(AccessCodeStatus.INACTIVE);
  });
});

describe("membership expiry from a code", () => {
  it("prefers the code's own duration", () => {
    const expiry = membershipExpiryFor({ membershipDurationDays: 30 }, 365, NOW);
    expect(expiry?.toISOString()).toBe("2027-03-31T12:00:00.000Z");
  });

  it("falls back to the organisation default", () => {
    const expiry = membershipExpiryFor({ membershipDurationDays: null }, 10, NOW);
    expect(expiry?.toISOString()).toBe("2027-03-11T12:00:00.000Z");
  });

  it("returns null when neither is set", () => {
    expect(membershipExpiryFor({ membershipDurationDays: null }, null, NOW)).toBeNull();
  });
});

// ── invitations ────────────────────────────────────────────────────────────

function invitation(overrides: Partial<InvitationSnapshot> = {}): InvitationSnapshot {
  return {
    id: "inv_1",
    organisationId: "org_1",
    organisationName: "Example University",
    organisationStatus: "ACTIVE",
    email: "student@exampleuniversity.edu",
    role: OrgRole.PARTICIPANT,
    cohortId: null,
    status: InvitationStatus.PENDING,
    expiresAt: FUTURE,
    ...overrides,
  };
}

describe("invitation tokens", () => {
  it("never stores the raw token", () => {
    const token = generateInvitationToken();
    const hash = hashInvitationToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(token);
  });

  it("matches only the correct token", () => {
    const token = generateInvitationToken();
    const hash = hashInvitationToken(token);
    expect(invitationTokenMatches(token, hash)).toBe(true);
    expect(invitationTokenMatches(generateInvitationToken(), hash)).toBe(false);
  });

  it("handles a malformed stored hash without throwing", () => {
    expect(invitationTokenMatches("anything", "short")).toBe(false);
  });

  it("produces distinct tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateInvitationToken()));
    expect(tokens.size).toBe(100);
  });

  it("defaults to a 30-day expiry", () => {
    const expiry = invitationExpiry(DEFAULT_INVITATION_TTL_DAYS, NOW);
    expect(expiry.toISOString()).toBe("2027-03-31T12:00:00.000Z");
  });
});

describe("invitation validation", () => {
  it("accepts a pending invitation for the matching account", () => {
    const result = validateInvitation(invitation(), "student@exampleuniversity.edu", NOW);
    expect(result.valid).toBe(true);
  });

  it("is case-insensitive about the email", () => {
    const result = validateInvitation(invitation(), "STUDENT@ExampleUniversity.edu", NOW);
    expect(result.valid).toBe(true);
  });

  it("rejects a forwarded invitation opened by someone else", () => {
    const result = validateInvitation(invitation(), "someone.else@gmail.com", NOW);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toBe("EMAIL_MISMATCH");
  });

  it("allows an anonymous preview without the email check", () => {
    expect(validateInvitation(invitation(), null, NOW).valid).toBe(true);
  });

  it.each([
    ["accepted", invitation({ status: InvitationStatus.ACCEPTED }), "INVITATION_ALREADY_ACCEPTED"],
    ["revoked", invitation({ status: InvitationStatus.REVOKED }), "INVITATION_REVOKED"],
    ["lapsed", invitation({ expiresAt: PAST }), "INVITATION_EXPIRED"],
    [
      "for a churned organisation",
      invitation({ organisationStatus: "ARCHIVED" }),
      "ORGANISATION_NOT_ACTIVE",
    ],
  ])("rejects an %s invitation", (_label, snapshot, reason) => {
    const result = validateInvitation(snapshot, "student@exampleuniversity.edu", NOW);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toBe(reason);
  });
});

describe("bulk invite parsing", () => {
  it("splits, normalises and de-duplicates", () => {
    const { emails, invalid } = parseBulkEmails(
      "A@school.no, b@school.no\nA@SCHOOL.NO; c@school.no  nonsense"
    );
    expect(emails).toEqual(["a@school.no", "b@school.no", "c@school.no"]);
    expect(invalid).toEqual(["nonsense"]);
  });

  it("handles empty input", () => {
    expect(parseBulkEmails("   ")).toEqual({ emails: [], invalid: [] });
  });
});

// ── domains ────────────────────────────────────────────────────────────────

function domain(overrides: Partial<DomainSnapshot> = {}): DomainSnapshot {
  return {
    organisationId: "org_1",
    organisationName: "Example University",
    organisationSlug: "example-university",
    organisationStatus: "ACTIVE",
    domain: "exampleuniversity.edu",
    verified: true,
    enrolmentPolicy: DomainEnrolmentPolicy.OFFER,
    defaultRole: OrgRole.PARTICIPANT,
    defaultCohortId: null,
    ...overrides,
  };
}

describe("email domain matching", () => {
  it("offers, rather than enrols, on a match", () => {
    const result = matchEmailToOrganisation("me@exampleuniversity.edu", [domain()]);
    expect(result.outcome).toBe("offer");
  });

  it("auto-joins only when the organisation explicitly chose that", () => {
    const result = matchEmailToOrganisation("me@exampleuniversity.edu", [
      domain({ enrolmentPolicy: DomainEnrolmentPolicy.AUTO_JOIN }),
    ]);
    expect(result.outcome).toBe("auto_join");
  });

  it("ignores an unverified domain claim", () => {
    const result = matchEmailToOrganisation("me@exampleuniversity.edu", [
      domain({ verified: false }),
    ]);
    expect(result.outcome).toBe("none");
  });

  it("ignores a domain at a suspended organisation", () => {
    const result = matchEmailToOrganisation("me@exampleuniversity.edu", [
      domain({ organisationStatus: "SUSPENDED" }),
    ]);
    expect(result.outcome).toBe("none");
  });

  it("respects a DISABLED policy", () => {
    const result = matchEmailToOrganisation("me@exampleuniversity.edu", [
      domain({ enrolmentPolicy: DomainEnrolmentPolicy.DISABLED }),
    ]);
    expect(result.outcome).toBe("none");
  });

  it("returns none for an unrelated address", () => {
    expect(matchEmailToOrganisation("me@gmail.com", [domain()]).outcome).toBe("none");
  });
});

describe("domain claims", () => {
  it("normalises pasted input", () => {
    expect(normaliseDomain("  @Example.EDU/ ")).toBe("example.edu");
    expect(normaliseDomain("https://school.no")).toBe("school.no");
  });

  it("refuses free-mail domains so no organisation can claim the public", () => {
    for (const free of FREE_MAIL_DOMAINS) {
      expect(isClaimableDomain(free), `${free} should not be claimable`).toBe(false);
    }
  });

  it("accepts a genuine institutional domain", () => {
    expect(isClaimableDomain("oslomet.no")).toBe(true);
    expect(isClaimableDomain("nav.no")).toBe(true);
  });

  it("rejects malformed domains", () => {
    expect(isClaimableDomain("no-dot")).toBe(false);
    expect(isClaimableDomain("has space.no")).toBe(false);
    expect(isClaimableDomain("*.wildcard.no")).toBe(false);
  });
});

// ── licences and seats ─────────────────────────────────────────────────────

describe("seat limits", () => {
  it("allows a join with room to spare", () => {
    expect(checkSeatAvailable({ userLimit: 500, activeUserCount: 320 })).toEqual({
      allowed: true,
      remaining: 180,
    });
  });

  it("blocks a join at the limit", () => {
    expect(checkSeatAvailable({ userLimit: 500, activeUserCount: 500 })).toEqual({
      allowed: false,
      remaining: 0,
    });
  });

  it("blocks a join when already over the limit", () => {
    expect(checkSeatAvailable({ userLimit: 500, activeUserCount: 501 }).allowed).toBe(false);
  });

  it("always allows a join on an unlimited licence", () => {
    expect(checkSeatAvailable({ userLimit: null, activeUserCount: 99999 })).toEqual({
      allowed: true,
      remaining: null,
    });
  });

  it("reports utilisation and the 90% warning", () => {
    expect(seatUtilisation({ userLimit: 5000, activeUserCount: 4200 })).toBeCloseTo(0.84);
    expect(isApproachingSeatLimit({ userLimit: 5000, activeUserCount: 4200 })).toBe(false);
    expect(isApproachingSeatLimit({ userLimit: 5000, activeUserCount: 4600 })).toBe(true);
    expect(seatUtilisation({ userLimit: null, activeUserCount: 10 })).toBeNull();
  });
});

describe("licence lifecycle", () => {
  const base = { status: LicenceStatus.ACTIVE, startDate: PAST, endDate: FUTURE, trialEndsAt: null };

  it("leaves a healthy licence alone", () => {
    expect(derivedLicenceStatus(base, NOW)).toBe(LicenceStatus.ACTIVE);
  });

  it("expires a licence past its end date", () => {
    expect(derivedLicenceStatus({ ...base, endDate: PAST }, NOW)).toBe(LicenceStatus.EXPIRED);
  });

  it("promotes a converted trial rather than expiring it", () => {
    const converted = {
      ...base,
      status: LicenceStatus.TRIAL,
      trialEndsAt: PAST,
      endDate: FUTURE,
    };
    expect(derivedLicenceStatus(converted, NOW)).toBe(LicenceStatus.ACTIVE);
  });

  it("expires an unconverted trial", () => {
    const lapsed = { ...base, status: LicenceStatus.TRIAL, trialEndsAt: PAST, endDate: PAST };
    expect(derivedLicenceStatus(lapsed, NOW)).toBe(LicenceStatus.EXPIRED);
  });

  it("never resurrects a licence a human cancelled or suspended", () => {
    expect(derivedLicenceStatus({ ...base, status: LicenceStatus.CANCELLED }, NOW)).toBe(
      LicenceStatus.CANCELLED
    );
    expect(derivedLicenceStatus({ ...base, status: LicenceStatus.SUSPENDED }, NOW)).toBe(
      LicenceStatus.SUSPENDED
    );
  });
});

describe("commercial alerts", () => {
  const org = (over: Record<string, unknown> = {}) => ({
    organisationId: "org_1",
    organisationName: "NAV Oslo",
    licence: {
      status: LicenceStatus.ACTIVE,
      startDate: PAST,
      endDate: FUTURE,
      trialEndsAt: null,
      userLimit: 5000,
      activeUserCount: 4200,
      ...over,
    },
  });

  it("flags an organisation with no licence", () => {
    const alerts = buildCommercialAlerts(
      [{ organisationId: "o", organisationName: "Nowhere", licence: null }],
      NOW
    );
    expect(alerts[0].kind).toBe("NO_LICENCE");
  });

  it("flags a licence expiring inside the 30-day window", () => {
    const soon = new Date(NOW.getTime() + 10 * 24 * 60 * 60 * 1000);
    const alerts = buildCommercialAlerts([org({ endDate: soon })], NOW);
    expect(alerts.map((a) => a.kind)).toContain("LICENCE_EXPIRING");
    expect(alerts.find((a) => a.kind === "LICENCE_EXPIRING")?.message).toContain("10 days");
  });

  it("does not flag a licence expiring well beyond the window", () => {
    const alerts = buildCommercialAlerts([org()], NOW);
    expect(alerts.map((a) => a.kind)).not.toContain("LICENCE_EXPIRING");
  });

  it("flags seat exhaustion above the warning threshold", () => {
    const alerts = buildCommercialAlerts([org({ activeUserCount: 4900 })], NOW);
    expect(alerts.map((a) => a.kind)).toContain("SEAT_LIMIT_APPROACHING");
  });

  it("flags a full licence as reached, not merely approaching", () => {
    const alerts = buildCommercialAlerts([org({ activeUserCount: 5000 })], NOW);
    expect(alerts.map((a) => a.kind)).toContain("SEAT_LIMIT_REACHED");
    expect(alerts.map((a) => a.kind)).not.toContain("SEAT_LIMIT_APPROACHING");
  });

  it("sorts the most urgent alert first", () => {
    const soon = new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000);
    const alerts = buildCommercialAlerts(
      [org({ activeUserCount: 4600 }), org({ endDate: soon, activeUserCount: 10 })],
      NOW
    );
    expect(alerts[0].severity).toBe(1);
  });
});

describe("revenue roll-up", () => {
  it("separates committed ARR from unconverted trial pipeline", () => {
    const summary = summariseRevenue([
      { status: LicenceStatus.ACTIVE, annualValueMinor: 120_000_00 },
      { status: LicenceStatus.ACTIVE, annualValueMinor: 60_000_00 },
      { status: LicenceStatus.TRIAL, annualValueMinor: 40_000_00 },
      { status: LicenceStatus.EXPIRED, annualValueMinor: 999_999_00 },
      { status: LicenceStatus.ACTIVE, annualValueMinor: null },
    ]);
    expect(summary.arrMinor).toBe(180_000_00);
    expect(summary.trialPipelineMinor).toBe(40_000_00);
    expect(summary.mrrMinor).toBe(Math.round(180_000_00 / 12));
  });

  it("returns zeroes for an empty estate", () => {
    expect(summariseRevenue([])).toEqual({ arrMinor: 0, trialPipelineMinor: 0, mrrMinor: 0 });
  });
});
