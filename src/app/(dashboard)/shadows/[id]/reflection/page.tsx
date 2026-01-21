"use client";

import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Lock, CheckCircle2 } from "lucide-react";
import { ShadowReflection } from "@/components/shadows";

interface ShadowDetail {
  id: string;
  status: string;
  roleTitle: string;
  youthId: string;
  reflection?: {
    id: string;
    whatSurprised?: string;
    whatLiked?: string;
    whatDisliked?: string;
    skillsNoticed: string[];
    wouldExplore?: boolean;
    wouldExploreReason?: string;
    keyTakeaways: string[];
    questionsAsked: string[];
    followUpActions: string[];
    overallExperience?: number;
    hostHelpfulness?: number;
  };
}

export default function ShadowReflectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch shadow details
  const { data: shadow, isLoading } = useQuery<ShadowDetail>({
    queryKey: ["shadow", id],
    queryFn: async () => {
      const response = await fetch(`/api/shadows/${id}`);
      if (!response.ok) throw new Error("Failed to fetch shadow");
      return response.json();
    },
    enabled: !!session,
  });

  // Submit reflection mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/shadows/${id}/reflection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save reflection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shadow", id] });
      queryClient.invalidateQueries({ queryKey: ["shadows"] });
      setSubmitted(true);
    },
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!shadow) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Shadow request not found.</p>
            <Button className="mt-4" asChild>
              <Link href="/shadows">Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is the youth who did the shadow
  if (shadow.youthId !== session?.user?.id) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Only the youth who completed this shadow can add a reflection.
            </p>
            <Button className="mt-4" asChild>
              <Link href={`/shadows/${id}`}>Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if shadow is completed
  if (shadow.status !== "COMPLETED") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              You can only add a reflection after completing the shadow.
            </p>
            <Button className="mt-4" asChild>
              <Link href={`/shadows/${id}`}>Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-emerald-500/50 bg-emerald-500/5">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Reflection Saved!</h2>
              <p className="text-muted-foreground mb-6">
                Your insights have been added to your Journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/my-journey">View My Journey</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/shadows">Back to Shadows</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-xl relative">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href={`/shadows/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shadow
          </Link>
        </Button>

        <ShadowReflection
          roleTitle={shadow.roleTitle}
          initialData={shadow.reflection}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
