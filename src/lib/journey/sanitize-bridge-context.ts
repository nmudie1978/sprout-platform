/**
 * Pure sanitiser for the four bridge-mindmap inputs stored on EducationContext.
 * Extracted from the route so it can be unit-tested without Prisma/session.
 */

import { BLOCKERS, TRIED_ROUTES } from './bridge-mindmap-types';
import type { Blocker, TriedRoute } from './bridge-mindmap-types';

export interface BridgeContextFields {
  previousOccupation?: string;
  withNav?: boolean;
  triedRoutes?: TriedRoute[];
  blocker?: Blocker;
}

export function sanitizeBridgeContext(body: Record<string, unknown>): BridgeContextFields {
  const out: BridgeContextFields = {};

  if (typeof body.previousOccupation === 'string' && body.previousOccupation.trim()) {
    out.previousOccupation = body.previousOccupation.trim().slice(0, 80);
  }

  if (typeof body.withNav === 'boolean') {
    out.withNav = body.withNav;
  }

  if (Array.isArray(body.triedRoutes)) {
    const valid = body.triedRoutes.filter(
      (r): r is TriedRoute => typeof r === 'string' && (TRIED_ROUTES as string[]).includes(r),
    );
    // de-dupe, preserve catalogue order
    out.triedRoutes = TRIED_ROUTES.filter((r) => valid.includes(r));
  }

  if (typeof body.blocker === 'string' && (BLOCKERS as string[]).includes(body.blocker)) {
    out.blocker = body.blocker as Blocker;
  }

  return out;
}
