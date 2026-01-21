"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Eye,
  Plus,
  ArrowRight,
  Lock,
} from "lucide-react";
import { ShadowCard, EmptyShadowState, ShadowGuide } from "@/components/shadows";

type ShadowStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

interface ShadowRequest {
  id: string;
  roleTitle: string;
  status: ShadowStatus;
  format: "WALKTHROUGH" | "HALF_DAY" | "FULL_DAY";
  createdAt: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  locationName?: string;
  host?: {
    id: string;
    fullName?: string;
    isVerifiedAdult?: boolean;
    employerProfile?: {
      companyName?: string;
    };
  };
  youth?: {
    id: string;
    youthProfile?: {
      displayName?: string;
    };
  };
  reflection?: {
    id: string;
  };
}

export default function ShadowsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [showGuide, setShowGuide] = useState(true);

  const isYouth = session?.user?.role === "YOUTH";
  const isEmployer = session?.user?.role === "EMPLOYER";

  // Fetch shadow requests
  const { data: shadows, isLoading } = useQuery<ShadowRequest[]>({
    queryKey: ["shadows"],
    queryFn: async () => {
      const response = await fetch("/api/shadows");
      if (!response.ok) throw new Error("Failed to fetch shadows");
      return response.json();
    },
    enabled: !!session && (isYouth || isEmployer),
  });

  // Filter shadows by status
  const activeShadows = shadows?.filter(s =>
    ["PENDING", "APPROVED"].includes(s.status)
  ) || [];
  const completedShadows = shadows?.filter(s =>
    ["COMPLETED"].includes(s.status)
  ) || [];
  const otherShadows = shadows?.filter(s =>
    ["DRAFT", "DECLINED", "CANCELLED", "NO_SHOW"].includes(s.status)
  ) || [];

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-8 w-96" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || (!isYouth && !isEmployer)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please sign in to view career shadows.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-emerald-500/20 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Eye className="h-6 w-6 text-purple-600" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Career{" "}
                  <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
                    Shadows
                  </span>
                </h1>
              </div>
            </div>

            {isYouth && (
              <Button asChild>
                <Link href="/shadows/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Link>
              </Button>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {isYouth
              ? "Observe real workplaces and discover what jobs are actually like."
              : "Review shadow requests from young people interested in your work."}
          </p>
        </motion.div>

        {/* Guide (first visit) */}
        {isYouth && showGuide && shadows?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <ShadowGuide onDismiss={() => setShowGuide(false)} />
          </motion.div>
        )}

        {/* Compact Guide (returning users) */}
        {isYouth && (!shadows || shadows.length === 0) && !showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <ShadowGuide compact />
          </motion.div>
        )}

        {/* Main Content */}
        {shadows && shadows.length > 0 ? (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">
                Active ({activeShadows.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedShadows.length})
              </TabsTrigger>
              {otherShadows.length > 0 && (
                <TabsTrigger value="other">
                  Other ({otherShadows.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeShadows.length > 0 ? (
                activeShadows.map((shadow, index) => (
                  <motion.div
                    key={shadow.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ShadowCard
                      id={shadow.id}
                      roleTitle={shadow.roleTitle}
                      status={shadow.status}
                      format={shadow.format}
                      createdAt={new Date(shadow.createdAt)}
                      scheduledDate={shadow.scheduledDate ? new Date(shadow.scheduledDate) : undefined}
                      scheduledStartTime={shadow.scheduledStartTime}
                      scheduledEndTime={shadow.scheduledEndTime}
                      locationName={shadow.locationName}
                      hostName={shadow.host?.fullName}
                      hostCompany={shadow.host?.employerProfile?.companyName}
                      hostVerified={shadow.host?.isVerifiedAdult}
                      hasReflection={!!shadow.reflection}
                      viewType={isYouth ? "youth" : "host"}
                      youthName={shadow.youth?.youthProfile?.displayName}
                    />
                  </motion.div>
                ))
              ) : (
                <EmptyShadowState viewType={isYouth ? "youth" : "host"} />
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedShadows.length > 0 ? (
                completedShadows.map((shadow, index) => (
                  <motion.div
                    key={shadow.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ShadowCard
                      id={shadow.id}
                      roleTitle={shadow.roleTitle}
                      status={shadow.status}
                      format={shadow.format}
                      createdAt={new Date(shadow.createdAt)}
                      scheduledDate={shadow.scheduledDate ? new Date(shadow.scheduledDate) : undefined}
                      scheduledStartTime={shadow.scheduledStartTime}
                      scheduledEndTime={shadow.scheduledEndTime}
                      locationName={shadow.locationName}
                      hostName={shadow.host?.fullName}
                      hostCompany={shadow.host?.employerProfile?.companyName}
                      hostVerified={shadow.host?.isVerifiedAdult}
                      hasReflection={!!shadow.reflection}
                      viewType={isYouth ? "youth" : "host"}
                      youthName={shadow.youth?.youthProfile?.displayName}
                    />
                  </motion.div>
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No completed shadows yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {otherShadows.length > 0 && (
              <TabsContent value="other" className="space-y-4">
                {otherShadows.map((shadow, index) => (
                  <motion.div
                    key={shadow.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ShadowCard
                      id={shadow.id}
                      roleTitle={shadow.roleTitle}
                      status={shadow.status}
                      format={shadow.format}
                      createdAt={new Date(shadow.createdAt)}
                      scheduledDate={shadow.scheduledDate ? new Date(shadow.scheduledDate) : undefined}
                      scheduledStartTime={shadow.scheduledStartTime}
                      scheduledEndTime={shadow.scheduledEndTime}
                      locationName={shadow.locationName}
                      hostName={shadow.host?.fullName}
                      hostCompany={shadow.host?.employerProfile?.companyName}
                      hostVerified={shadow.host?.isVerifiedAdult}
                      hasReflection={!!shadow.reflection}
                      viewType={isYouth ? "youth" : "host"}
                      youthName={shadow.youth?.youthProfile?.displayName}
                    />
                  </motion.div>
                ))}
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <EmptyShadowState viewType={isYouth ? "youth" : "host"} />
        )}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Career shadowing is observation only — a chance to see real work, not perform it.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
