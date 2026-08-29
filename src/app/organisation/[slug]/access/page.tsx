import { requirePortalAccess } from "@/lib/organisations/portal-guard";

import { AccessCodesClient } from "./access-client";

export const dynamic = "force-dynamic";

export default async function AccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const context = await requirePortalAccess(slug, "codes:list");

  return <AccessCodesClient organisationId={context.organisationId} role={context.role} />;
}
