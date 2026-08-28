import { requirePortalAccess } from "@/lib/organisations/portal-guard";

import { CohortsClient } from "./cohorts-client";

export const dynamic = "force-dynamic";

export default async function CohortsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const context = await requirePortalAccess(slug, "cohorts:list");

  return <CohortsClient organisationId={context.organisationId} role={context.role} />;
}
