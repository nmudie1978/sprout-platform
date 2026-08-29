import { requirePortalAccess } from "@/lib/organisations/portal-guard";
import { roleHasPermission } from "@/lib/organisations/permissions";
import type { OrgRole } from "@prisma/client";

import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const context = await requirePortalAccess(slug, "org:view_settings");

  return (
    <SettingsClient
      organisationId={context.organisationId}
      canEdit={roleHasPermission(context.role as OrgRole, "org:edit_settings")}
    />
  );
}
