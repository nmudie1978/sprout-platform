'use client';

/**
 * Parent/Guardian Companion View — read-only dashboard showing
 * what linked youth are exploring in their career journey.
 *
 * Shows: career goal, education stage, momentum progress.
 * Does NOT show: notes, reflections, chat history, or private data.
 *
 * Only visible to verified guardians with linked youth who have
 * granted consent.
 */

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Target, GraduationCap, Rocket, Shield, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

interface YouthExploration {
  id: string;
  displayName: string;
  avatarId: string | null;
  careerGoal: string | null;
  educationStage: string | null;
  momentumActionsCount: number;
  hasFoundation: boolean;
}

export default function GuardianExplorationPage() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery<{ youths: YouthExploration[] }>({
    queryKey: ['guardian-exploration'],
    queryFn: async () => {
      const res = await fetch('/api/guardian/exploration');
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const youths = data?.youths ?? [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <PageHeader
        title="Your teen's"
        gradientText="exploration"
        description="A read-only view of what your linked youth is exploring — enough to have great conversations, not enough to hover."
        icon={Users}
      />

      <div className="mt-6 space-y-4">
        {isLoading && (
          <div className="rounded-xl border border-border/30 bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground/60 animate-pulse">Loading...</p>
          </div>
        )}

        {!isLoading && youths.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/40 bg-muted/10 p-8 text-center space-y-2">
            <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm font-medium text-foreground/70">No linked youth found</p>
            <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
              Your teen needs to add you as a guardian in their profile settings and grant consent for you to see their exploration progress.
            </p>
          </div>
        )}

        {youths.map((youth) => (
          <div
            key={youth.id}
            className="rounded-xl border border-border/30 bg-card/40 p-5 space-y-4"
          >
            {/* Name + career goal */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {youth.displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/90">
                  {youth.displayName}
                </p>
                {youth.careerGoal ? (
                  <p className="text-xs text-primary/80">
                    Exploring: {youth.careerGoal}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/50">
                    Still browsing — no career goal set yet
                  </p>
                )}
              </div>
            </div>

            {/* Progress indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/20 bg-background/30 px-3 py-2.5 text-center">
                <Target className="h-4 w-4 mx-auto text-muted-foreground/50 mb-1" />
                <p className="text-[10px] text-muted-foreground/60">Career Goal</p>
                <p className="text-xs font-medium text-foreground/80 mt-0.5">
                  {youth.careerGoal ? 'Set' : 'Not yet'}
                </p>
              </div>
              <div className="rounded-lg border border-border/20 bg-background/30 px-3 py-2.5 text-center">
                <GraduationCap className="h-4 w-4 mx-auto text-muted-foreground/50 mb-1" />
                <p className="text-[10px] text-muted-foreground/60">Foundation</p>
                <p className="text-xs font-medium text-foreground/80 mt-0.5">
                  {youth.hasFoundation ? (youth.educationStage ?? 'Set') : 'Not started'}
                </p>
              </div>
              <div className="rounded-lg border border-border/20 bg-background/30 px-3 py-2.5 text-center">
                <Rocket className="h-4 w-4 mx-auto text-muted-foreground/50 mb-1" />
                <p className="text-[10px] text-muted-foreground/60">Next Steps</p>
                <p className="text-xs font-medium text-foreground/80 mt-0.5">
                  {youth.momentumActionsCount > 0
                    ? `${youth.momentumActionsCount} action${youth.momentumActionsCount !== 1 ? 's' : ''}`
                    : 'None yet'}
                </p>
              </div>
            </div>

            {/* Conversation starters */}
            {youth.careerGoal && (
              <div className="rounded-lg bg-primary/[0.04] border border-primary/15 px-3.5 py-3">
                <p className="text-[10px] font-medium text-primary/70 mb-1.5">
                  Conversation starters
                </p>
                <ul className="space-y-1.5 text-[11px] text-foreground/70 leading-relaxed">
                  <li>• &quot;I saw you&apos;re looking at {youth.careerGoal} — what got you interested?&quot;</li>
                  <li>• &quot;What&apos;s the most surprising thing you&apos;ve learned about this career?&quot;</li>
                  <li>• &quot;Is there anything I can help with — like talking to someone in that field?&quot;</li>
                </ul>
              </div>
            )}
          </div>
        ))}

        {/* Privacy note */}
        <p className="text-[9px] text-muted-foreground/40 text-center leading-relaxed max-w-sm mx-auto">
          This view shows only what your teen has chosen to share. Notes, reflections, and chat history are always private. Your teen can revoke access anytime from their profile settings.
        </p>
      </div>
    </div>
  );
}
