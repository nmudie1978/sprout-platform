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
 */

import { NextResponse } from "next/server";
import { readPool, getNextBatch } from "@/lib/insights/pool-service";
import type { PoolContentType, PoolBatchRequest } from "@/lib/insights/pool-types";

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

  // Read pool and serve batch
  const pool = await readPool();
  const batch = getNextBatch(pool, batchRequest);

  return NextResponse.json(batch, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
}
