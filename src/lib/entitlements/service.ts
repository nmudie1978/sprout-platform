/**
 * Entitlements — the database-backed service.
 *
 * This is the ONLY place in the application that loads entitlement inputs.
 * Everything else calls `getUserEntitlements` / `hasEntitlement` and stays
 * ignorant of licences, plans and memberships entirely. That is the whole
 * point of section 22 of the spec: the app asks about a capability, never
 * about a commercial plan.
 *
 * Caching: resolution costs one query with two nested includes. That is
 * cheap, but it would run on every gated request, so results are held in a
 * short in-process cache with the same shape and reasoning as the session
 * field cache in `lib/auth.ts` — bounded, per-instance, deliberately short.
 * A licence change therefore takes effect within ENTITLEMENT_TTL_MS rather
 * than instantly; admin mutations call `invalidateEntitlements` to close
 * that window for the paths that matter.
 */

import { EntitlementModule, LicenceStatus, OrgMembershipStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";

import { resolveEntitlements } from "./resolve";
import type {
  EffectiveEntitlements,
  EntitlementInput,
  LicenceSnapshot,
  MembershipSnapshot,
} from "./types";

const ENTITLEMENT_TTL_MS = 60 * 1000;
const MAX_CACHE_ENTRIES = 10_000;

const cache = new Map<string, { at: number; value: EffectiveEntitlements }>();

/** Drop a user's cached entitlements. Call after any mutation that affects them. */
export function invalidateEntitlements(userId: string): void {
  cache.delete(userId);
}

/**
 * Drop every cached entry. Used after organisation- or licence-level changes,
 * where enumerating the affected users would cost more than the cache saves.
 */
export function invalidateAllEntitlements(): void {
  cache.clear();
}

/**
 * Pick the licence a membership should draw from.
 *
 * An organisation can hold several licences at once — a renewal staged
 * ahead of expiry, a lapsed prior term kept for the record. We take the
 * usable one with the latest start date, so a staged renewal takes over
 * cleanly the moment it starts without a manual switch-over.
 */
function selectLicence(
  licences: {
    id: string;
    status: LicenceStatus;
    startDate: Date;
    endDate: Date | null;
    enabledModules: EntitlementModule[];
    userLimit: number | null;
    activeUserCount: number;
    plan: { key: string; name: string } | null;
  }[],
  now: Date
): LicenceSnapshot | null {
  const usable = licences
    .filter(
      (l) =>
        (l.status === LicenceStatus.TRIAL || l.status === LicenceStatus.ACTIVE) &&
        l.startDate.getTime() <= now.getTime() &&
        (!l.endDate || l.endDate.getTime() > now.getTime())
    )
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  // Fall back to the most recent licence overall so the resolver can report a
  // precise reason (EXPIRED vs NOT_ACTIVE) instead of a blunt NO_USABLE_LICENCE.
  const chosen =
    usable[0] ?? [...licences].sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];
  if (!chosen) return null;

  return {
    id: chosen.id,
    status: chosen.status,
    startDate: chosen.startDate,
    endDate: chosen.endDate,
    enabledModules: chosen.enabledModules,
    userLimit: chosen.userLimit,
    activeUserCount: chosen.activeUserCount,
    planKey: chosen.plan?.key ?? null,
    planName: chosen.plan?.name ?? null,
  };
}

/** Load the raw inputs for one user. Exported for the admin "explain access" view. */
export async function loadEntitlementInput(
  userId: string,
  now: Date = new Date()
): Promise<EntitlementInput> {
  const [subscription, memberships] = await withDbRetry(() =>
    Promise.all([
      prisma.personalSubscription.findUnique({
        where: { userId },
        select: { tier: true, status: true, expiresAt: true, moduleOverrides: true },
      }),
      prisma.organisationMembership.findMany({
        // REMOVED memberships are excluded here; every other status is passed
        // through so the resolver can explain why it granted nothing.
        where: { userId, status: { not: OrgMembershipStatus.REMOVED } },
        select: {
          id: true,
          organisationId: true,
          role: true,
          status: true,
          expiresAt: true,
          accessCode: { select: { id: true, code: true, moduleOverrides: true } },
          organisation: {
            select: {
              name: true,
              slug: true,
              status: true,
              deletedAt: true,
              licences: {
                select: {
                  id: true,
                  status: true,
                  startDate: true,
                  endDate: true,
                  enabledModules: true,
                  userLimit: true,
                  activeUserCount: true,
                  plan: { select: { key: true, name: true } },
                },
              },
            },
          },
        },
      }),
    ])
  );

  const snapshots: MembershipSnapshot[] = memberships
    // A soft-deleted organisation grants nothing, ever.
    .filter((m) => m.organisation.deletedAt === null)
    .map((m) => ({
      membershipId: m.id,
      organisationId: m.organisationId,
      organisationName: m.organisation.name,
      organisationSlug: m.organisation.slug,
      organisationStatus: m.organisation.status,
      role: m.role,
      status: m.status,
      expiresAt: m.expiresAt,
      licence: selectLicence(m.organisation.licences, now),
      accessCodeGrant: m.accessCode
        ? {
            id: m.accessCode.id,
            code: m.accessCode.code,
            moduleOverrides: m.accessCode.moduleOverrides,
          }
        : null,
    }));

  return {
    userId,
    subscription: subscription
      ? {
          tier: subscription.tier,
          status: subscription.status,
          expiresAt: subscription.expiresAt,
          moduleOverrides: subscription.moduleOverrides,
        }
      : null,
    memberships: snapshots,
  };
}

/**
 * The effective entitlements for a user. This is the function the rest of
 * the application should reach for.
 */
export async function getUserEntitlements(
  userId: string,
  options: { fresh?: boolean } = {}
): Promise<EffectiveEntitlements> {
  const now = new Date();

  if (!options.fresh) {
    const cached = cache.get(userId);
    if (cached && now.getTime() - cached.at < ENTITLEMENT_TTL_MS) return cached.value;
  }

  const input = await loadEntitlementInput(userId, now);
  const resolved = resolveEntitlements(input, now);

  if (cache.size > MAX_CACHE_ENTRIES) cache.clear();
  cache.set(userId, { at: now.getTime(), value: resolved });

  return resolved;
}

/** Does this user have this capability? The question the app should be asking. */
export async function hasEntitlement(
  userId: string,
  module: EntitlementModule
): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId);
  return entitlements.modules.includes(module);
}

/** Alias matching the naming in section 22 of the spec. */
export const checkUserAccess = hasEntitlement;

/**
 * What an organisation's current licence makes available, before any
 * per-role filtering. Used by the organisation portal to show staff what
 * their institution has bought.
 */
export async function getOrganisationEntitlements(
  organisationId: string
): Promise<{ modules: EntitlementModule[]; licence: LicenceSnapshot | null }> {
  const now = new Date();
  const organisation = await withDbRetry(() =>
    prisma.organisation.findFirst({
      where: { id: organisationId, deletedAt: null },
      select: {
        licences: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            enabledModules: true,
            userLimit: true,
            activeUserCount: true,
            plan: { select: { key: true, name: true } },
          },
        },
      },
    })
  );

  const licence = organisation ? selectLicence(organisation.licences, now) : null;
  const usable = licence && licence.startDate <= now && (!licence.endDate || licence.endDate > now);

  return {
    modules: usable ? licence.enabledModules : [],
    licence,
  };
}

/** The licence verdict for one organisation, matching the spec's naming. */
export async function getLicenceStatus(organisationId: string): Promise<{
  status: LicenceStatus | null;
  endDate: Date | null;
  daysRemaining: number | null;
  userLimit: number | null;
  activeUserCount: number;
  utilisation: number | null;
}> {
  const { licence } = await getOrganisationEntitlements(organisationId);
  if (!licence) {
    return {
      status: null,
      endDate: null,
      daysRemaining: null,
      userLimit: null,
      activeUserCount: 0,
      utilisation: null,
    };
  }

  const daysRemaining = licence.endDate
    ? Math.ceil((licence.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  return {
    status: licence.status,
    endDate: licence.endDate,
    daysRemaining,
    userLimit: licence.userLimit,
    activeUserCount: licence.activeUserCount,
    utilisation:
      licence.userLimit && licence.userLimit > 0
        ? licence.activeUserCount / licence.userLimit
        : null,
  };
}
