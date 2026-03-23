'use client';

import { useQuery } from '@tanstack/react-query';

interface CareerRecommendation {
  careerId: string;
  title: string;
  emoji: string;
  description: string;
  score: number;
  reasons: string[];
  growthOutlook: string;
  avgSalary: string;
}

interface DiscoverRecommendationsData {
  hasProfile: boolean;
  recommendations: CareerRecommendation[];
  signals: { topTags: string[]; summaryText: string } | null;
  summary: string | null;
}

export function useDiscoverRecommendations(enabled = true) {
  return useQuery<DiscoverRecommendationsData>({
    queryKey: ['discover-recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/discover/recommendations');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
