import { requirePortalAccess } from "@/lib/organisations/portal-guard";

import { AnalyticsClient } from "./analytics-client";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const context = await requirePortalAccess(slug, "analytics:view_aggregate");

  return <AnalyticsClient organisationId={context.organisationId} />;
}
