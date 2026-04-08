'use client';

import { useQuery } from '@tanstack/react-query';
import { getCareerPathExamples, type CareerPathExample } from '@/lib/education/career-path-examples';

interface CareerPathExamplesPanelProps {
  careerId: string;
  careerTitle: string;
}

export function CareerPathExamplesPanel({ careerId, careerTitle }: CareerPathExamplesPanelProps) {
  const hardcoded = getCareerPathExamples(careerId, careerTitle);
  const useAI = hardcoded.length === 0;

  const { data: aiPaths, isLoading } = useQuery<CareerPathExample[]>({
    queryKey: ['career-paths', careerTitle.toLowerCase()],
    queryFn: async () => {
      const res = await fetch('/api/journey/generate-career-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career: careerTitle }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.examples ?? [];
    },
    enabled: useAI,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });

  const paths = useAI ? (aiPaths ?? []) : hardcoded;
  const loading = useAI && isLoading;
  const tried = !useAI || !isLoading;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-border/20 bg-background/20 p-3.5 animate-pulse">
            <div className="h-3 w-20 bg-muted-foreground/10 rounded mb-1" />
            <div className="h-2 w-32 bg-muted-foreground/5 rounded mb-4" />
            <div className="space-y-2.5">
              {[0, 1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="h-[11px] w-[11px] rounded-full bg-muted-foreground/10 shrink-0" />
                  <div className="h-2.5 bg-muted-foreground/8 rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tried && paths.length === 0) {
    return <p className="text-xs text-muted-foreground/40">Career path examples coming soon for this role.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {paths.slice(0, 2).map((path, pi) => (
        <div key={pi} className="rounded-lg border border-border/20 bg-background/20 p-3.5">
          <p className="text-xs font-semibold text-foreground/75">{path.name}</p>
          <p className="text-[10px] text-muted-foreground/40 mb-3">{path.title} · Age {path.currentAge}</p>
          <div className="relative">
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/30 via-emerald-500/15 to-transparent" />
            <div className="space-y-1.5">
              {path.steps.map((step, si) => (
                <div key={si} className="flex items-start gap-3 relative">
                  <div className="relative z-10 h-[11px] w-[11px] rounded-full border-2 border-emerald-500/30 bg-background shrink-0 mt-1" />
                  <div className="flex-1"><span className="text-[10px] font-bold text-emerald-400/60 mr-1.5">{step.age}</span><span className="text-[11px] text-foreground/60">{step.label}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
