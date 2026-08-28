import { describe, it, expect } from "vitest";
import {
  EntitlementModule,
  LicenceStatus,
  OrgMembershipStatus,
  OrganisationStatus,
  OrgRole,
  SubscriptionStatus,
  SubscriptionTier,
} from "@prisma/client";

import {
  ALL_MODULES,
  MODULE_CATALOGUE,
  PLATFORM_BASELINE_MODULES,
  ROLE_PERMITTED_MODULES,
} from "../modules";
import { EntitlementSourceType } from "../types";
import { hasModule, licenceRejection, membershipRejection, resolveEntitlements } from "../resolve";
import type { EntitlementInput, LicenceSnapshot, MembershipSnapshot } from "../types";

const NOW = new Date("2027-03-01T12:00:00.000Z");
const PAST = new Date("2026-01-01T00:00:00.000Z");
const FUTURE = new Date("2028-01-01T00:00:00.000Z");

function licence(overrides: Partial<LicenceSnapshot> = {}): LicenceSnapshot {
  return {
    id: "lic_1",
    status: LicenceStatus.ACTIVE,
    startDate: PAST,
    endDate: FUTURE,
    enabledModules: [EntitlementModule.CORE, EntitlementModule.INSTITUTION_ANALYTICS],
    userLimit: 500,
    activeUserCount: 10,
    planKey: "EDUCATION",
    planName: "Education",
    ...overrides,
  };
}

function membership(overrides: Partial<MembershipSnapshot> = {}): MembershipSnapshot {
  return {
    membershipId: "mem_1",
    organisationId: "org_1",
    organisationName: "Example School",
    organisationSlug: "example-school",
    organisationStatus: OrganisationStatus.ACTIVE,
    role: OrgRole.PARTICIPANT,
    status: OrgMembershipStatus.ACTIVE,
    expiresAt: null,
    licence: licence(),
    accessCodeGrant: null,
    ...overrides,
  };
}

function input(overrides: Partial<EntitlementInput> = {}): EntitlementInput {
  return { userId: "user_1", subscription: null, memberships: [], ...overrides };
}

describe("module catalogue", () => {
  it("covers every module in the enum", () => {
    const catalogued = new Set(MODULE_CATALOGUE.map((d) => d.module));
    for (const entry of Object.values(EntitlementModule)) {
      expect(catalogued.has(entry), `${entry} missing from MODULE_CATALOGUE`).toBe(true);
    }
    expect(ALL_MODULES).toHaveLength(Object.values(EntitlementModule).length);
  });

  it("never lets a participant hold a staff module, whatever a licence says", () => {
    const participantPermitted = new Set(ROLE_PERMITTED_MODULES[OrgRole.PARTICIPANT]);
    for (const def of MODULE_CATALOGUE) {
      if (def.audience === "staff") {
        expect(participantPermitted.has(def.module), `${def.module} leaked to PARTICIPANT`).toBe(
          false
        );
      }
    }
  });

  it("never lets a parent hold a staff module", () => {
    const parentPermitted = new Set(ROLE_PERMITTED_MODULES[OrgRole.PARENT]);
    for (const def of MODULE_CATALOGUE) {
      if (def.audience === "staff") {
        expect(parentPermitted.has(def.module), `${def.module} leaked to PARENT`).toBe(false);
      }
    }
  });
});

describe("the existing consumer experience is never diminished", () => {
  it("gives a user with no organisation and no subscription the full baseline", () => {
    const result = resolveEntitlements(input(), NOW);
    for (const entry of PLATFORM_BASELINE_MODULES) {
      expect(hasModule(result, entry), `baseline lost ${entry}`).toBe(true);
    }
    expect(result.organisations).toEqual([]);
    expect(result.subscriptionTier).toBeNull();
  });

  it("keeps the baseline even when an organisation licence enables far less", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({ licence: licence({ enabledModules: [EntitlementModule.CORE] }) }),
        ],
      }),
      NOW
    );
    // The school bought a minimal licence. The student was already an
    // Endeavrly user; joining must not take Clarity away from them.
    expect(hasModule(result, EntitlementModule.CLARITY)).toBe(true);
    expect(hasModule(result, EntitlementModule.CAREER_TWIN)).toBe(true);
  });

  it("keeps the baseline when every institutional source is dead", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({ status: OrgMembershipStatus.EXPIRED }),
          membership({ membershipId: "mem_2", organisationStatus: OrganisationStatus.SUSPENDED }),
        ],
      }),
      NOW
    );
    expect(result.modules).toEqual([...PLATFORM_BASELINE_MODULES].sort((a, b) =>
      ALL_MODULES.indexOf(a) - ALL_MODULES.indexOf(b)
    ));
  });
});

describe("organisation licences", () => {
  it("grants a licensed staff module to a manager", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            role: OrgRole.MANAGER,
            licence: licence({
              enabledModules: [
                EntitlementModule.INSTITUTION_ANALYTICS,
                EntitlementModule.ADVANCED_ANALYTICS,
              ],
            }),
          }),
        ],
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.INSTITUTION_ANALYTICS)).toBe(true);
    expect(hasModule(result, EntitlementModule.ADVANCED_ANALYTICS)).toBe(true);
  });

  it("withholds the same licensed staff module from a participant", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            role: OrgRole.PARTICIPANT,
            licence: licence({
              enabledModules: [
                EntitlementModule.INSTITUTION_ANALYTICS,
                EntitlementModule.ADVANCED_ANALYTICS,
              ],
            }),
          }),
        ],
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.INSTITUTION_ANALYTICS)).toBe(false);
    expect(hasModule(result, EntitlementModule.ADVANCED_ANALYTICS)).toBe(false);
  });

  it("withholds ADVANCED_ANALYTICS from an advisor even on an enterprise licence", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            role: OrgRole.ADVISOR,
            licence: licence({ enabledModules: ALL_MODULES as EntitlementModule[] }),
          }),
        ],
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.INSTITUTION_ANALYTICS)).toBe(true);
    expect(hasModule(result, EntitlementModule.ADVANCED_ANALYTICS)).toBe(false);
    expect(hasModule(result, EntitlementModule.API_ACCESS)).toBe(false);
  });

  it("treats a TRIAL licence as conferring access", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            role: OrgRole.MANAGER,
            licence: licence({
              status: LicenceStatus.TRIAL,
              enabledModules: [EntitlementModule.INSTITUTION_ANALYTICS],
            }),
          }),
        ],
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.INSTITUTION_ANALYTICS)).toBe(true);
  });

  it("does not grant seats beyond the user limit any special treatment", () => {
    // Being over-subscribed must not strip access from young people already in.
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            role: OrgRole.MANAGER,
            licence: licence({ userLimit: 5, activeUserCount: 5000 }),
          }),
        ],
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.INSTITUTION_ANALYTICS)).toBe(true);
  });
});

describe("expiry and revocation", () => {
  it.each([
    ["a licence that ended", licence({ endDate: PAST }), "LICENCE_EXPIRED"],
    ["a licence not yet started", licence({ startDate: FUTURE }), "LICENCE_NOT_STARTED"],
    ["a cancelled licence", licence({ status: LicenceStatus.CANCELLED }), "LICENCE_NOT_ACTIVE"],
    ["a suspended licence", licence({ status: LicenceStatus.SUSPENDED }), "LICENCE_NOT_ACTIVE"],
  ])("rejects %s", (_label, lic, reason) => {
    expect(licenceRejection(lic, NOW)).toBe(reason);
    const result = resolveEntitlements(
      input({ memberships: [membership({ role: OrgRole.MANAGER, licence: lic })] }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.INSTITUTION_ANALYTICS)).toBe(false);
    expect(result.inactiveOrganisations[0].reason).toBe(reason);
  });

  it("rejects a membership past its own expiry even while the licence runs", () => {
    const m = membership({ role: OrgRole.MANAGER, expiresAt: PAST });
    expect(membershipRejection(m, NOW)).toBe("MEMBERSHIP_EXPIRED");
    const result = resolveEntitlements(input({ memberships: [m] }), NOW);
    expect(hasModule(result, EntitlementModule.INSTITUTION_ANALYTICS)).toBe(false);
  });

  it("rejects a membership whose organisation has been suspended", () => {
    const m = membership({
      role: OrgRole.MANAGER,
      organisationStatus: OrganisationStatus.SUSPENDED,
    });
    expect(membershipRejection(m, NOW)).toBe("ORGANISATION_NOT_ACTIVE");
  });

  it("accepts a membership at an organisation still onboarding", () => {
    const m = membership({
      role: OrgRole.MANAGER,
      organisationStatus: OrganisationStatus.ONBOARDING,
    });
    expect(membershipRejection(m, NOW)).toBeNull();
  });

  it.each([
    OrgMembershipStatus.INVITED,
    OrgMembershipStatus.SUSPENDED,
    OrgMembershipStatus.EXPIRED,
    OrgMembershipStatus.REMOVED,
  ])("grants nothing for a %s membership", (status) => {
    expect(membershipRejection(membership({ status }), NOW)).toBe("MEMBERSHIP_NOT_ACTIVE");
  });

  it("treats a licence ending exactly now as expired", () => {
    expect(licenceRejection(licence({ endDate: NOW }), NOW)).toBe("LICENCE_EXPIRED");
  });
});

describe("multiple organisations", () => {
  it("unions modules across two organisations without either taking anything away", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            membershipId: "m_school",
            organisationId: "org_school",
            organisationName: "Example School",
            role: OrgRole.PARTICIPANT,
            licence: licence({ id: "lic_school", enabledModules: [EntitlementModule.CAREER_DNA] }),
          }),
          membership({
            membershipId: "m_nav",
            organisationId: "org_nav",
            organisationName: "NAV Oslo",
            role: OrgRole.ADVISOR,
            licence: licence({
              id: "lic_nav",
              enabledModules: [EntitlementModule.INSTITUTION_ANALYTICS],
            }),
          }),
        ],
      }),
      NOW
    );

    expect(result.organisations).toHaveLength(2);
    expect(hasModule(result, EntitlementModule.CAREER_DNA)).toBe(true);
    expect(hasModule(result, EntitlementModule.INSTITUTION_ANALYTICS)).toBe(true);
  });

  it("keeps a live organisation's grant when a second membership is dead", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            membershipId: "m_dead",
            organisationId: "org_dead",
            role: OrgRole.MANAGER,
            licence: licence({ id: "lic_dead", endDate: PAST }),
          }),
          membership({
            membershipId: "m_live",
            organisationId: "org_live",
            role: OrgRole.MANAGER,
            licence: licence({
              id: "lic_live",
              enabledModules: [EntitlementModule.INSTITUTION_ANALYTICS],
            }),
          }),
        ],
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.INSTITUTION_ANALYTICS)).toBe(true);
    expect(result.organisations.map((o) => o.membershipId)).toEqual(["m_live"]);
    expect(result.inactiveOrganisations.map((o) => o.membershipId)).toEqual(["m_dead"]);
  });
});

describe("access-code overrides", () => {
  it("adds a module the base licence lacks", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            licence: licence({ enabledModules: [EntitlementModule.CORE] }),
            accessCodeGrant: {
              id: "code_1",
              code: "NAV-YOUTH-2027",
              moduleOverrides: [EntitlementModule.SKILLS_ANALYSIS],
            },
          }),
        ],
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.SKILLS_ANALYSIS)).toBe(true);
    expect(result.sources[EntitlementModule.SKILLS_ANALYSIS]?.some(
      (s) => s.type === EntitlementSourceType.ACCESS_CODE_GRANT
    )).toBe(true);
  });

  it("cannot be used to smuggle a staff module to a participant", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            role: OrgRole.PARTICIPANT,
            accessCodeGrant: {
              id: "code_evil",
              code: "OOPS",
              moduleOverrides: [
                EntitlementModule.ADVANCED_ANALYTICS,
                EntitlementModule.API_ACCESS,
              ],
            },
          }),
        ],
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.ADVANCED_ANALYTICS)).toBe(false);
    expect(hasModule(result, EntitlementModule.API_ACCESS)).toBe(false);
  });

  it("grants nothing when the membership itself is dead", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({
            status: OrgMembershipStatus.SUSPENDED,
            accessCodeGrant: {
              id: "code_1",
              code: "X",
              moduleOverrides: [EntitlementModule.SKILLS_ANALYSIS],
            },
          }),
        ],
      }),
      NOW
    );
    expect(result.sources[EntitlementModule.SKILLS_ANALYSIS]?.every(
      (s) => s.type !== EntitlementSourceType.ACCESS_CODE_GRANT
    )).toBe(true);
  });
});

describe("direct subscriptions and institutional licences coexist", () => {
  it("resolves the exact scenario from section 20 of the spec", () => {
    // Personal subscription grants CAREER_TWIN; org licence grants CAREER_DNA
    // but not ADVANCED_ANALYTICS. Effective: first two yes, third no.
    const result = resolveEntitlements(
      input({
        subscription: {
          tier: SubscriptionTier.PREMIUM,
          status: SubscriptionStatus.ACTIVE,
          expiresAt: FUTURE,
          moduleOverrides: [EntitlementModule.CAREER_TWIN],
        },
        memberships: [
          membership({
            role: OrgRole.MANAGER,
            licence: licence({ enabledModules: [EntitlementModule.CAREER_DNA] }),
          }),
        ],
      }),
      NOW
    );

    expect(hasModule(result, EntitlementModule.CAREER_TWIN)).toBe(true);
    expect(hasModule(result, EntitlementModule.CAREER_DNA)).toBe(true);
    expect(hasModule(result, EntitlementModule.ADVANCED_ANALYTICS)).toBe(false);
  });

  it("ignores an expired subscription but keeps the baseline", () => {
    const result = resolveEntitlements(
      input({
        subscription: {
          tier: SubscriptionTier.FAMILY,
          status: SubscriptionStatus.ACTIVE,
          expiresAt: PAST,
          moduleOverrides: [],
        },
      }),
      NOW
    );
    expect(result.subscriptionTier).toBeNull();
    expect(hasModule(result, EntitlementModule.PARENT_PORTAL)).toBe(false);
    expect(hasModule(result, EntitlementModule.CLARITY)).toBe(true);
  });

  it("ignores a cancelled subscription", () => {
    const result = resolveEntitlements(
      input({
        subscription: {
          tier: SubscriptionTier.FAMILY,
          status: SubscriptionStatus.CANCELLED,
          expiresAt: FUTURE,
          moduleOverrides: [],
        },
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.PARENT_PORTAL)).toBe(false);
  });

  it("grants PARENT_PORTAL on an active FAMILY tier", () => {
    const result = resolveEntitlements(
      input({
        subscription: {
          tier: SubscriptionTier.FAMILY,
          status: SubscriptionStatus.ACTIVE,
          expiresAt: null,
          moduleOverrides: [],
        },
      }),
      NOW
    );
    expect(hasModule(result, EntitlementModule.PARENT_PORTAL)).toBe(true);
    expect(result.subscriptionTier).toBe(SubscriptionTier.FAMILY);
  });
});

describe("provenance", () => {
  it("records every source that granted a module", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({ licence: licence({ enabledModules: [EntitlementModule.CORE] }) }),
        ],
      }),
      NOW
    );
    const coreSources = result.sources[EntitlementModule.CORE] ?? [];
    expect(coreSources.map((s) => s.type)).toEqual([
      EntitlementSourceType.PLATFORM_BASELINE,
      EntitlementSourceType.ORGANISATION_LICENCE,
    ]);
  });

  it("gives every granted module at least one source", () => {
    const result = resolveEntitlements(
      input({
        subscription: {
          tier: SubscriptionTier.FAMILY,
          status: SubscriptionStatus.ACTIVE,
          expiresAt: null,
          moduleOverrides: [],
        },
        memberships: [membership({ role: OrgRole.ORGANISATION_ADMIN })],
      }),
      NOW
    );
    for (const entry of result.modules) {
      expect(result.sources[entry]?.length, `${entry} has no source`).toBeGreaterThan(0);
    }
  });

  it("is deterministic for the same input and instant", () => {
    const i = input({ memberships: [membership()] });
    expect(resolveEntitlements(i, NOW)).toEqual(resolveEntitlements(i, NOW));
  });

  it("never returns duplicate modules", () => {
    const result = resolveEntitlements(
      input({
        memberships: [
          membership({ licence: licence({ enabledModules: [...PLATFORM_BASELINE_MODULES] }) }),
        ],
      }),
      NOW
    );
    expect(new Set(result.modules).size).toBe(result.modules.length);
  });
});
