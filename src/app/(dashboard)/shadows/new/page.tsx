"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft, Lock, Eye } from "lucide-react";
import {
  ShadowRequestBuilder,
  ShadowGuide,
  type ShadowRequestData,
} from "@/components/shadows";

export default function NewShadowPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [showGuide, setShowGuide] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has seen the guide before
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("shadow-guide-seen");
    if (hasSeenGuide) {
      setShowGuide(false);
    }
  }, []);

  const handleDismissGuide = () => {
    localStorage.setItem("shadow-guide-seen", "true");
    setShowGuide(false);
  };

  const handleSubmit = async (data: ShadowRequestData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/shadows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          availabilityStart: data.availabilityStart?.toISOString(),
          availabilityEnd: data.availabilityEnd?.toISOString(),
          isDraft: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit request");
      }

      const shadow = await response.json();
      router.push(`/shadows/${shadow.id}?submitted=true`);
    } catch (error) {
      console.error("Failed to submit shadow request:", error);
      // Show error toast or message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (data: ShadowRequestData) => {
    try {
      const response = await fetch("/api/shadows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          availabilityStart: data.availabilityStart?.toISOString(),
          availabilityEnd: data.availabilityEnd?.toISOString(),
          isDraft: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      const shadow = await response.json();
      router.push(`/shadows?saved=true`);
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Only youth users can request career shadows.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/shadows">Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show guide on first visit
  if (showGuide) {
    return (
      <div className="min-h-full">
        <div className="container mx-auto px-4 py-8 max-w-2xl relative">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/shadows">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shadows
            </Link>
          </Button>

          <ShadowGuide onDismiss={handleDismissGuide} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-2xl relative">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/shadows">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shadows
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <motion.div
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-emerald-500/20 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Eye className="h-6 w-6 text-purple-600" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Request a{" "}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Career Shadow
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Observe a real workplace and see what the job is actually like.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Request Builder */}
        <ShadowRequestBuilder
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
