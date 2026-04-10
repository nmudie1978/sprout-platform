'use client';

/**
 * Study Paths — University & Course Browser
 *
 * Standalone entry point. Driven by the user's active career goal.
 * Also supports ?career= query param for deep-link from the roadmap.
 */

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { GraduationCap } from 'lucide-react';
import { EducationBrowser } from '@/components/education-browser';

function StudyPathsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const careerParam = searchParams.get('career');

  const { data: goalsData } = useQuery<{
    primaryGoal: { title: string } | null;
  }>({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch('/api/goals');
      if (!res.ok) return { primaryGoal: null };
      return res.json();
    },
    enabled: session?.user.role === 'YOUTH',
    staleTime: 5 * 60 * 1000,
  });

  const careerTitle = careerParam || goalsData?.primaryGoal?.title || null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <EducationBrowser careerTitle={careerTitle} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Hero skeleton */}
      <div className="rounded-2xl border border-border/20 bg-card/60 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-muted/20 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 rounded bg-muted/20 animate-pulse" />
            <div className="h-3 w-72 rounded bg-muted/10 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <div className="h-14 flex-1 rounded-xl bg-muted/10 animate-pulse" />
          <div className="h-14 flex-1 rounded-xl bg-muted/10 animate-pulse" />
          <div className="h-14 flex-1 rounded-xl bg-muted/10 animate-pulse" />
        </div>
      </div>
      {/* Card skeletons */}
      <div className="h-10 rounded-xl bg-muted/10 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-muted/10 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function StudyPathsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <StudyPathsContent />
    </Suspense>
  );
}
