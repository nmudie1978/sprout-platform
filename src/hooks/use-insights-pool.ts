'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PoolItem, PoolBatchResponse } from '@/lib/insights/pool-types';
import { useInsightsHistory } from './use-insights-history';

async function fetchBatch(
  excludeIds: string[],
  size: number = 5,
  tags: string[] = [],
): Promise<PoolBatchResponse> {
  const params = new URLSearchParams();
  params.set('size', String(size));
  if (excludeIds.length > 0) {
    params.set('exclude', excludeIds.join(','));
  }
  if (tags.length > 0) {
    params.set('tags', tags.join(','));
  }
  const res = await fetch(`/api/insights/pool?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch insights pool');
  return res.json();
}

/**
 * @param batchSize how many items to fetch per batch
 * @param tags soft-boost tags — items matching these float to the top, but the
 *   batch still fills with fresh/diverse items, so results are never empty.
 */
export function useInsightsPool(batchSize: number = 5, tags: string[] = []) {
  const { recordShown, getExcludeIds } = useInsightsHistory();
  const [allShownIds, setAllShownIds] = useState<string[]>(() => getExcludeIds());

  const tagsKey = tags.join(',');
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<PoolBatchResponse>({
    queryKey: ['insights-pool', allShownIds, tagsKey],
    queryFn: () => fetchBatch(allShownIds, batchSize, tags),
    staleTime: 1000 * 60 * 5,
  });

  const currentBatch: PoolItem[] = data?.items ?? [];
  const hasMore = data?.hasMore ?? false;
  const totalPoolSize = data?.totalPoolSize ?? 0;

  /** Fetch the next batch, excluding everything shown so far */
  const fetchMore = useCallback(() => {
    if (currentBatch.length > 0) {
      const newIds = currentBatch.map((i) => i.id);
      recordShown(newIds);
      setAllShownIds((prev) => [...newIds, ...prev]);
    }
  }, [currentBatch, recordShown]);

  /** Hard refresh — re-fetch from scratch */
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    currentBatch,
    isLoading: isLoading || isFetching,
    hasMore,
    totalPoolSize,
    fetchMore,
    refresh,
  };
}
