/**
 * GET /api/insights/pool
 *
 * Returns a batch of verified content items from the insights pool.
 * Supports anti-repeat via exclude param and type/tag preferences.
 *
 * Query params:
 *   size    — batch size (default 5, max 10)
 *   exclude — comma-separated content IDs to exclude
 *   types   — comma-separated content types to prefer
 *   tags    — comma-separated tags to prefer
 *
 * Cache: Tagged with content-insights-pool for on-demand revalidation.
 * Falls back to last-known-good response via stale-while-revalidate.
 */

import { NextResponse } from "next/server";
import { readPool, getNextBatch } from "@/lib/insights/pool-service";
import type { PoolContentType, PoolBatchRequest } from "@/lib/insights/pool-types";
import { REVALIDATE_INTERVALS } from "@/lib/content-refresh";

const VALID_TYPES = new Set<PoolContentType>(["article", "video", "stat_report", "pdf"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse batch size
  const sizeParam = searchParams.get("size");
  let batchSize = 5;
  if (sizeParam) {
    const parsed = parseInt(sizeParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      batchSize = Math.min(parsed, 10);
    }
  }

  // Parse exclude IDs
  const excludeParam = searchParams.get("exclude");
  const excludeIds = excludeParam
    ? excludeParam.split(",").filter(Boolean)
    : [];

  // Parse preferred types
  const typesParam = searchParams.get("types");
  const preferTypes = typesParam
    ? (typesParam.split(",").filter((t) => VALID_TYPES.has(t as PoolContentType)) as PoolContentType[])
    : undefined;

  // Parse tags
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam
    ? tagsParam.split(",").filter(Boolean)
    : undefined;

  // Build request
  const batchRequest: PoolBatchRequest = {
    batchSize,
    excludeIds: excludeIds.length > 0 ? excludeIds : undefined,
    preferTypes: preferTypes && preferTypes.length > 0 ? preferTypes : undefined,
    tags: tags && tags.length > 0 ? tags : undefined,
  };

  try {
    const pool = await readPool();
    const batch = getNextBatch(pool, batchRequest);

    // Validate: never return empty if pool has items
    if (batch.items.length === 0 && pool.length > 0) {
      console.warn("[Insights Pool] Empty batch from non-empty pool, returning without exclude filter");
      const fallbackBatch = getNextBatch(pool, { batchSize });
      return NextResponse.json(fallbackBatch, {
        headers: {
          "Cache-Control": `s-maxage=${REVALIDATE_INTERVALS.INSIGHTS_POOL}, stale-while-revalidate=3600`,
        },
      });
    }

    return NextResponse.json(batch, {
      headers: {
        "Cache-Control": `s-maxage=${REVALIDATE_INTERVALS.INSIGHTS_POOL}, stale-while-revalidate=3600`,
      },
    });
  } catch (error) {
    console.error("[Insights Pool] Error reading pool:", error);
    // Return empty batch rather than 500 — UI handles empty gracefully
    return NextResponse.json(
      { items: [], total: 0, hasMore: false },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=3600",
        },
      }
    );
  }
}

// ISR revalidation. Next 16 requires segment config exports to be
// statically-analyzable literals — an imported constant fails the
// analyzer. Keep this value in sync with REVALIDATE_INTERVALS.INSIGHTS_POOL
// in src/lib/content-refresh/constants.ts (currently 5 * 60 = 300 seconds).
export const revalidate = 300;
