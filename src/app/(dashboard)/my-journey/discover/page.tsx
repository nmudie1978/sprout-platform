'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscoverFlow } from '@/components/discover/discover-flow';
import { type DiscoverProfile, DEFAULT_DISCOVER_PROFILE } from '@/lib/discover/types';

export default function DiscoverPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<DiscoverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load existing profile
  useEffect(() => {
    fetch('/api/discover/profile')
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.discoverProfile || DEFAULT_DISCOVER_PROFILE);
      })
      .catch(() => {
        setProfile(DEFAULT_DISCOVER_PROFILE);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProgress = async (updated: DiscoverProfile) => {
    await fetch('/api/discover/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discoverProfile: updated }),
    }).catch(() => {});
  };

  const handleComplete = async (completed: DiscoverProfile) => {
    await fetch('/api/discover/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discoverProfile: completed }),
    });
    // Invalidate queries so dashboard/recommendations refresh
    queryClient.invalidateQueries({ queryKey: ['discover-recommendations'] });
    queryClient.invalidateQueries({ queryKey: ['journey-state'] });
    router.push('/my-journey');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 max-w-2xl">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 text-muted-foreground"
        onClick={() => router.push('/my-journey')}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to My Journey
      </Button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="h-6 w-6 text-teal-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Know Yourself</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          This isn't a test — there are no right or wrong answers.
          It's just a starting point to help you notice what fits.
          You can update everything later as you learn more.
        </p>
      </div>

      {/* Flow */}
      {profile && (
        <DiscoverFlow
          initialProfile={profile}
          onComplete={handleComplete}
          onSaveProgress={handleSaveProgress}
          onClose={() => router.push('/my-journey')}
        />
      )}
    </div>
  );
}
