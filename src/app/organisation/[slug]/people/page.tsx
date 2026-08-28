import { requirePortalAccess } from "@/lib/organisations/portal-guard";

import { PeopleClient } from "./people-client";

export const dynamic = "force-dynamic";

export default async function PeoplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const context = await requirePortalAccess(slug, "members:list");

  return (
    <PeopleClient
      organisationId={context.organisationId}
      slug={slug}
      role={context.role}
      allowIndividualViews={context.settings.allowIndividualParticipantView}
    />
  );
}
