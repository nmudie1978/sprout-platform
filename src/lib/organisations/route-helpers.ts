/**
 * Boilerplate every organisation-portal route needs, in one place.
 *
 * The point is that a route handler cannot accidentally skip the tenant
 * check: `withOrgAccess` is the only way to get an `OrgAccessContext`, and
 * without one there is no organisation id to query with.
 */

import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";

import {
  ORG_ACCESS_MESSAGES,
  ORG_ACCESS_STATUS,
  requireOrgAccess,
  type OrgAccessContext,
} from "./access";
import type { OrgPermission } from "./permissions";

/**
 * Authorise, then run the handler. Returns the failure response directly if
 * the caller has no business here.
 */
export async function withOrgAccess(
  organisationId: string,
  permission: OrgPermission | undefined,
  handler: (context: OrgAccessContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const access = await requireOrgAccess(organisationId, permission);
  if (!access.ok) {
    const status = ORG_ACCESS_STATUS[access.failure];
    return NextResponse.json(
      { error: ORG_ACCESS_MESSAGES[access.failure], code: access.failure },
      { status }
    );
  }
  return handler(access.context);
}

/** Parse a JSON body through a zod schema, or return the 400 for the caller. */
export async function parseBody<T>(
  request: Request,
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => unknown } } }
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: apiError("BAD_REQUEST", "Invalid JSON body.") };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: apiError("VALIDATION_FAILED", "Check the details and try again.", {
        details: parsed.error.flatten(),
      }),
    };
  }
  return { ok: true, data: parsed.data };
}
