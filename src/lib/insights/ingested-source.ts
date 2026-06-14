/**
 * Reads weekly RSS-ingested insights from the DB and shapes them as PoolItems
 * so the serving APIs can merge them with the static seed pool. Returns an
 * empty list on any error (e.g. table missing in a dev DB) so the page never
 * breaks — the static seed is always the floor.
 */

import { prisma } from "@/lib/prisma";
import type { PoolItem, PoolContentType } from "./pool-types";

export async function readIngestedPool(): Promise<PoolItem[]> {
  try {
    const rows = await prisma.ingestedInsight.findMany({
      orderBy: { verifiedAt: "desc" },
      take: 200,
    });
    return rows.map((r) => {
      let domain = r.sourceName;
      try {
        domain = new URL(r.url).hostname.replace(/^www\./, "");
      } catch {
        /* keep source as fallback */
      }
      return {
        id: `ingest-${r.urlHash.slice(0, 16)}`,
        title: r.title,
        summary: r.summary ?? "",
        sourceName: r.sourceName,
        sourceUrl: r.url,
        contentType: r.contentType as PoolContentType,
        tags: r.tags,
        domain,
        publishDate: r.publishDate?.toISOString(),
        addedAt: r.createdAt.toISOString(),
        lastVerifiedAt: r.verifiedAt.toISOString(),
        verificationStatus: "verified" as const,
        canonicalUrlHash: r.urlHash,
      } satisfies PoolItem;
    });
  } catch {
    return [];
  }
}
