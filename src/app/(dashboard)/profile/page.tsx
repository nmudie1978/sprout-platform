"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SkillRadar } from "@/components/skill-radar";
import { ReviewsDisplay } from "@/components/reviews-display";
import { Switch } from "@/components/ui/switch";
import { Copy, Eye, EyeOff, Shield, CheckCircle2, Clock, XCircle, Trash2, AlertTriangle, Phone, Target, Compass, Moon, MessageCircleOff, AlertCircle, User, Scale, FileText, ShieldCheck, Users, AlertOctagon, ExternalLink, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AvatarSelectorInline } from "@/components/avatar-selector-inline";
import { BadgesDisplay } from "@/components/badges-display";
import { LifeSkillsSettings } from "@/components/life-skills-settings";
import { SavedLifeSkills } from "@/components/saved-life-skills";
import Link from "next/link";

const INTEREST_OPTIONS = [
  "Technology",
  "Animals",
  "Children",
  "Outdoors",
  "Crafts",
  "Sports",
  "Music",
  "Helping Others",
  "Problem Solving",
  "Learning",
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    availability: "",
    phoneNumber: "",
    city: "",
    interests: [] as string[],
    guardianEmail: "",
    careerAspiration: "",
  });
  const formInitializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: !!session?.user?.id && session?.user?.role === "YOUTH",
    staleTime: 30 * 1000, // Cache for 30 seconds before refetching
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Reset form initialization when user changes (sign out/in)
  useEffect(() => {
    if (session?.user?.id && session.user.id !== lastUserIdRef.current) {
      formInitializedRef.current = false;
      lastUserIdRef.current = session.user.id;
    }
  }, [session?.user?.id]);

  // Only initialize form data once when profile first loads
  useEffect(() => {
    if (profile && !formInitializedRef.current) {
      formInitializedRef.current = true;
      setFormData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        availability: profile.availability || "",
        phoneNumber: profile.phoneNumber || "",
        city: profile.city || "",
        interests: profile.interests || [],
        guardianEmail: profile.guardianEmail || "",
        careerAspiration: profile.careerAspiration || "",
      });
    }
  }, [profile]);

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const method = profile ? "PATCH" : "POST";
      const response = await fetch("/api/profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save profile");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Sync form data with saved values
      setFormData({
        displayName: data.displayName || "",
        bio: data.bio || "",
        availability: data.availability || "",
        phoneNumber: data.phoneNumber || "",
        city: data.city || "",
        interests: data.interests || [],
        guardianEmail: data.guardianEmail || "",
        careerAspiration: data.careerAspiration || "",
      });
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async (visible: boolean) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileVisibility: visible }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.profileVisibility ? "Profile is now public" : "Profile is now private",
        description: data.profileVisibility
          ? "Employers can view your profile link"
          : "Your profile is hidden from employers",
      });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (status: "AVAILABLE" | "BUSY" | "NOT_LOOKING") => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus: status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      return response.json();
    },
    onSuccess: (data) => {
      const statusLabels: Record<string, string> = {
        AVAILABLE: "Available for Work",
        BUSY: "Busy Right Now",
        NOT_LOOKING: "Not Looking",
      };
      toast({
        title: "Status updated!",
        description: `You're now marked as: ${statusLabels[data.availabilityStatus] || data.availabilityStatus}`,
      });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive",
      });
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Avatar updated!",
        description: "Your new avatar is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
    },
  });

  const updateCareerAspirationMutation = useMutation({
    mutationFn: async (careerAspiration: string) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerAspiration }),
      });

      if (!response.ok) {
        throw new Error("Failed to update career aspiration");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Career goal saved!",
        description: "Your career aspiration has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update career aspiration",
        variant: "destructive",
      });
    },
  });

  const toggleDoNotDisturbMutation = useMutation({
    mutationFn: async (doNotDisturb: boolean) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doNotDisturb }),
      });

      if (!response.ok) {
        throw new Error("Failed to update Do Not Disturb");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.doNotDisturb ? "Do Not Disturb enabled" : "Do Not Disturb disabled",
        description: data.doNotDisturb
          ? "Others cannot start new conversations with you"
          : "Others can now message you",
      });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update Do Not Disturb setting",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      // Sign out and redirect to home
      setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const copyProfileLink = () => {
    if (profile?.publicProfileSlug) {
      const url = `${window.location.origin}/p/${profile.publicProfileSlug}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Your profile link has been copied to clipboard.",
      });
    }
  };

  if (session?.user.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Only youth users can access profiles.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Funky Modern Background - Warm muted tones */}
      <div className="fixed inset-0 -z-20">
        {/* Base gradient - warm terracotta to sage */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-amber-50/50 to-emerald-50/60 dark:from-stone-950 dark:via-stone-900 dark:to-emerald-950/30" />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />

        {/* Dot grid pattern - always visible */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #78716c 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Animated Morphing Shapes Layer - hidden on mobile for performance */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none hidden sm:block">
        {/* Large morphing blob - top right */}
        <motion.div
          className="absolute -top-20 -right-20 w-[600px] h-[600px]"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-br from-amber-300/20 via-orange-200/15 to-rose-200/10 dark:from-amber-700/10 dark:via-orange-800/8 dark:to-rose-900/5"
            style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
            animate={{
              borderRadius: [
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "30% 60% 70% 40% / 50% 60% 30% 60%",
                "60% 40% 30% 70% / 60% 30% 70% 40%",
              ],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Medium morphing blob - bottom left */}
        <motion.div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px]"
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-tr from-emerald-300/15 via-teal-200/12 to-cyan-200/8 dark:from-emerald-800/10 dark:via-teal-900/8 dark:to-cyan-950/5"
            style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
            animate={{
              borderRadius: [
                "40% 60% 70% 30% / 40% 50% 60% 50%",
                "70% 30% 50% 50% / 30% 30% 70% 70%",
                "40% 60% 70% 30% / 40% 50% 60% 50%",
              ],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </motion.div>

        {/* Flowing wave lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.04]" preserveAspectRatio="none">
          <motion.path
            d="M0,200 Q200,100 400,200 T800,200 T1200,200 T1600,200"
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
            animate={{
              d: [
                "M0,200 Q200,100 400,200 T800,200 T1200,200 T1600,200",
                "M0,200 Q200,300 400,200 T800,200 T1200,200 T1600,200",
                "M0,200 Q200,100 400,200 T800,200 T1200,200 T1600,200",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,400 Q200,300 400,400 T800,400 T1200,400 T1600,400"
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="1.5"
            animate={{
              d: [
                "M0,400 Q200,300 400,400 T800,400 T1200,400 T1600,400",
                "M0,400 Q200,500 400,400 T800,400 T1200,400 T1600,400",
                "M0,400 Q200,300 400,400 T800,400 T1200,400 T1600,400",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.path
            d="M0,600 Q200,500 400,600 T800,600 T1200,600 T1600,600"
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="1"
            animate={{
              d: [
                "M0,600 Q200,500 400,600 T800,600 T1200,600 T1600,600",
                "M0,600 Q200,700 400,600 T800,600 T1200,600 T1600,600",
                "M0,600 Q200,500 400,600 T800,600 T1200,600 T1600,600",
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Geometric floating shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${15 + ((i * 17) % 60)}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, i % 2 === 0 ? 15 : -15, 0],
              rotate: [0, i % 2 === 0 ? 180 : -180, 0],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          >
            {i % 3 === 0 ? (
              // Hexagon
              <div
                className="w-8 h-8 bg-gradient-to-br from-amber-400/20 to-orange-300/10 dark:from-amber-600/15 dark:to-orange-700/8"
                style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
              />
            ) : i % 3 === 1 ? (
              // Triangle
              <div
                className="w-6 h-6 bg-gradient-to-br from-emerald-400/20 to-teal-300/10 dark:from-emerald-600/15 dark:to-teal-700/8"
                style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
              />
            ) : (
              // Diamond
              <div
                className="w-5 h-5 bg-gradient-to-br from-rose-400/20 to-pink-300/10 dark:from-rose-600/15 dark:to-pink-700/8"
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
              />
            )}
          </motion.div>
        ))}

        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, #78716c 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Accent glow spots - hidden on mobile for performance */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none hidden sm:block">
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-400/10 dark:bg-amber-600/5 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-emerald-400/10 dark:bg-emerald-600/5 blur-3xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-4 sm:py-8 relative z-10 isolate">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                My <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Profile</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base truncate">
                Build your profile to stand out to job posters
              </p>
            </div>
          </div>
        </motion.div>

      {/* Profile Completion Status */}
      {profile && (() => {
        const missingRequired: string[] = [];
        const missingRecommended: string[] = [];

        // Required fields
        if (!profile.avatarId) missingRequired.push("Avatar");
        if (!profile.displayName) missingRequired.push("Display Name");
        if (!profile.phoneNumber) missingRequired.push("Phone Number");
        if (!profile.city) missingRequired.push("City");

        // Recommended fields
        if (!profile.bio) missingRecommended.push("About Me (bio)");
        if (!profile.availability) missingRecommended.push("Availability");
        if (!profile.interests || profile.interests.length === 0) missingRecommended.push("Interests");

        const isComplete = missingRequired.length === 0 && missingRecommended.length === 0;
        const hasRequiredMissing = missingRequired.length > 0;

        return (
          <Card className={`mb-6 border-2 ${hasRequiredMissing ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20' : isComplete ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20'}`}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                {hasRequiredMissing ? (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                ) : isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${hasRequiredMissing ? 'text-red-700 dark:text-red-400' : isComplete ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {hasRequiredMissing ? 'Profile Incomplete - Required Fields Missing' : isComplete ? 'Profile Complete!' : 'Profile Almost Complete'}
                  </h3>

                  {missingRequired.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Required fields missing:</p>
                      <ul className="text-sm text-red-600/80 dark:text-red-400/80 space-y-0.5">
                        {missingRequired.map((field) => (
                          <li key={field} className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {field}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {missingRecommended.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Recommended to complete:</p>
                      <ul className="text-sm text-amber-600/80 dark:text-amber-400/80 space-y-0.5">
                        {missingRecommended.map((field) => (
                          <li key={field} className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {field}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isComplete && (
                    <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                      Great job! Your profile has all the information employers need.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6 relative z-10">
          <Card className="border-2 shadow-lg hover-lift relative z-10">
            <CardHeader>
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription>
                This information will be shown to employers when you share your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {/* Avatar Selector */}
              <div className="pb-4 border-b">
                <Label className="text-center block mb-3 flex items-center justify-center gap-2">
                  Your Avatar
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">Required</Badge>
                </Label>
                <AvatarSelectorInline
                  currentAvatarId={profile?.avatarId}
                  onSelect={(avatarId) => updateAvatarMutation.mutate(avatarId)}
                  disabled={updateAvatarMutation.isPending}
                />
                {!profile?.avatarId && (
                  <p className="mt-2 text-xs text-red-500 text-center flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Required: Choose an avatar to represent you
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="displayName" className="flex items-center gap-2">
                  Display Name
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">Required</Badge>
                </Label>
                <Input
                  id="displayName"
                  placeholder="Your name or nickname"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  className={`h-11 sm:h-10 ${!formData.displayName && profile ? "border-red-300 focus:border-red-500" : ""}`}
                />
                {!formData.displayName && profile ? (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Required: Employers need to know what to call you
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    This is how employers will address you
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bio" className="flex items-center gap-2">
                  About Me
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Recommended</Badge>
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell employers a bit about yourself..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                />
                {!formData.bio ? (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Add a short bio to help employers understand your personality and strengths
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="availability" className="flex items-center gap-2">
                  Availability
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Recommended</Badge>
                </Label>
                <Input
                  id="availability"
                  placeholder="e.g., Weekends, After 4pm on weekdays"
                  value={formData.availability}
                  onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value })
                  }
                  className="h-11 sm:h-10"
                />
                {!formData.availability ? (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Let employers know when you're free to work
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Employers can see when you're available
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">Required</Badge>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+47 123 45 678"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className={`h-11 sm:h-10 ${!formData.phoneNumber && profile ? "border-red-300 focus:border-red-500" : ""}`}
                />
                {!formData.phoneNumber && profile ? (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Required: Employers need a way to contact you about jobs
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Only shown to employers when you're assigned to their job
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">Required</Badge>
                </Label>
                <Input
                  id="city"
                  placeholder="e.g., Oslo, Fjellhamar, Bergen"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className={`h-11 sm:h-10 ${!formData.city && profile ? "border-red-300 focus:border-red-500" : ""}`}
                />
                {!formData.city && profile ? (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Required: We use your city to show you nearby jobs
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Used to show you jobs in your area
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  Interests
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Recommended</Badge>
                </Label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Select topics you're interested in
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={
                        formData.interests.includes(interest)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
                {formData.interests.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    Select at least one interest to help match you with relevant jobs
                  </p>
                )}
              </div>

              {session.user.ageBracket === "SIXTEEN_SEVENTEEN" && (
                <div>
                  <Label htmlFor="guardianEmail">
                    Guardian Email (Optional)
                  </Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="parent@example.com"
                    value={formData.guardianEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, guardianEmail: e.target.value })
                    }
                    className="h-11 sm:h-10"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    We'll keep them informed about your activity
                  </p>
                </div>
              )}

              <Button
                onClick={() => saveProfileMutation.mutate()}
                disabled={
                  !formData.displayName || !formData.city || saveProfileMutation.isPending
                }
                className="w-full h-11 sm:h-10 shadow-lg"
              >
                {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Skills & Stats */}
          {profile && (
            <Card className="border-2 shadow-lg hover-lift overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50 pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="text-xl">Your Skills</CardTitle>
                <CardDescription>
                  Built from your completed jobs
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <SkillRadar userId={session.user.id} />

                <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                    <div className="text-2xl sm:text-3xl font-bold gradient-text">
                      {profile.completedJobsCount || 0}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      Jobs Done
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                    <div className="text-2xl sm:text-3xl font-bold gradient-text">
                      {profile.averageRating
                        ? profile.averageRating.toFixed(1)
                        : "N/A"}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      Rating
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                    <div className="text-2xl sm:text-3xl font-bold gradient-text">
                      {profile.reliabilityScore || 0}%
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      Reliable
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 relative z-10">
          {/* Privacy Controls */}
          {profile && (
            <Card className="border-2 shadow-lg hover-lift relative z-10">
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="visibility" className="cursor-pointer">
                      Profile Visibility
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {profile.profileVisibility
                        ? "Employers can view your profile"
                        : "Your profile is private"}
                    </p>
                  </div>
                  <Switch
                    id="visibility"
                    checked={profile.profileVisibility}
                    onCheckedChange={(checked) =>
                      toggleVisibilityMutation.mutate(checked)
                    }
                  />
                </div>

                {profile.profileVisibility ? (
                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      Profile is Public
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Share this link with employers:
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="flex-1 truncate rounded bg-background px-2 py-1 text-xs">
                        /p/{profile.publicProfileSlug}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyProfileLink}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <EyeOff className="h-4 w-4" />
                      Profile is Private
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Turn on visibility to share your profile with employers
                    </p>
                  </div>
                )}

                {/* Do Not Disturb Toggle */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="doNotDisturb" className="cursor-pointer flex items-center gap-2">
                        <MessageCircleOff className="h-4 w-4 text-muted-foreground" />
                        Do Not Disturb
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {profile.user?.doNotDisturb
                          ? "Others cannot start new conversations"
                          : "Others can message you"}
                      </p>
                    </div>
                    <Switch
                      id="doNotDisturb"
                      checked={profile.user?.doNotDisturb || false}
                      onCheckedChange={(checked) =>
                        toggleDoNotDisturbMutation.mutate(checked)
                      }
                    />
                  </div>

                  {profile.user?.doNotDisturb && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 mt-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                        <Moon className="h-4 w-4" />
                        Do Not Disturb is On
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        You won't appear in user searches and others can't start new conversations with you. Existing conversations will still work.
                      </p>
                    </div>
                  )}
                </div>

                {/* Life Skills Tips Toggle */}
                <div className="border-t pt-4 mt-4">
                  <LifeSkillsSettings />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Life Skills */}
          {profile && <SavedLifeSkills />}

          {/* Career Goal */}
          {profile && (
            <Card className="border-2 shadow-lg hover-lift overflow-hidden relative z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-50 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-orange-500" />
                  Career Goal
                </CardTitle>
                <CardDescription>
                  What do you want to be?
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div>
                  <Input
                    placeholder="e.g., Software Developer, Chef, Entrepreneur"
                    value={formData.careerAspiration}
                    onChange={(e) =>
                      setFormData({ ...formData, careerAspiration: e.target.value })
                    }
                    maxLength={200}
                    className="h-11 sm:h-10"
                  />
                  <p className="mt-1 text-xs text-muted-foreground text-right">
                    {formData.careerAspiration.length}/200 characters
                  </p>
                </div>
                <Button
                  onClick={() => updateCareerAspirationMutation.mutate(formData.careerAspiration)}
                  disabled={updateCareerAspirationMutation.isPending || formData.careerAspiration === (profile.careerAspiration || "")}
                  className="w-full"
                  size="sm"
                >
                  {updateCareerAspirationMutation.isPending ? "Saving..." : "Save Goal"}
                </Button>
                <div className="rounded-lg bg-muted p-3">
                  <Link
                    href="/career-explore"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Compass className="h-4 w-4" />
                    Need inspiration? Explore careers
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Availability Status */}
          {profile && (
            <Card className="border-2 shadow-lg hover-lift relative z-10">
              <CardHeader>
                <CardTitle className="text-xl">Work Availability</CardTitle>
                <CardDescription>
                  Let employers know if you're available for new jobs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  type="button"
                  onClick={() => updateAvailabilityMutation.mutate("AVAILABLE")}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer relative z-10 ${
                    profile.availabilityStatus === "AVAILABLE"
                      ? "border-green-500 bg-green-500/10"
                      : "border-border hover:border-green-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className={`h-5 w-5 ${
                        profile.availabilityStatus === "AVAILABLE"
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-left">
                      <p className="font-medium">Available for Work</p>
                      <p className="text-xs text-muted-foreground">
                        Ready to take on new jobs
                      </p>
                    </div>
                  </div>
                  {profile.availabilityStatus === "AVAILABLE" && (
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => updateAvailabilityMutation.mutate("BUSY")}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer relative z-10 ${
                    profile.availabilityStatus === "BUSY"
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-border hover:border-yellow-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock
                      className={`h-5 w-5 ${
                        profile.availabilityStatus === "BUSY"
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-left">
                      <p className="font-medium">Busy Right Now</p>
                      <p className="text-xs text-muted-foreground">
                        Not available at the moment
                      </p>
                    </div>
                  </div>
                  {profile.availabilityStatus === "BUSY" && (
                    <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => updateAvailabilityMutation.mutate("NOT_LOOKING")}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer relative z-10 ${
                    profile.availabilityStatus === "NOT_LOOKING"
                      ? "border-red-500 bg-red-500/10"
                      : "border-border hover:border-red-500/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <XCircle
                      className={`h-5 w-5 ${
                        profile.availabilityStatus === "NOT_LOOKING"
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-left">
                      <p className="font-medium">Not Looking</p>
                      <p className="text-xs text-muted-foreground">
                        Not interested in new jobs
                      </p>
                    </div>
                  </div>
                  {profile.availabilityStatus === "NOT_LOOKING" && (
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              </CardContent>
            </Card>
          )}

          {/* Badges Section */}
          {profile && (
            <BadgesDisplay showLocked />
          )}

          {/* Reviews Section */}
          {profile && session?.user?.id && (
            <div>
              <h2 className="text-2xl font-bold mb-4">My Reviews</h2>
              <ReviewsDisplay userId={session.user.id} userRole="YOUTH" />
            </div>
          )}

          {/* Profile Tips */}
          <Card className="border-2 shadow-lg hover-lift overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-50 pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="text-xl">Profile Tips</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span className="text-muted-foreground">Use a friendly display name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span className="text-muted-foreground">Highlight your strengths in bio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span className="text-muted-foreground">Keep availability up to date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span className="text-muted-foreground">Complete more jobs to build skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span className="text-muted-foreground">Ask for reviews after jobs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Legal & Safety */}
          <Card className="border-2 shadow-lg hover-lift overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50 pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="text-xl flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-500" />
                Legal & Safety
              </CardTitle>
              <CardDescription>
                Our policies and guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/legal/terms"
                    target="_blank"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="flex-1">Terms of Service</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/privacy"
                    target="_blank"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <Shield className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="flex-1">Privacy Policy</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/safety"
                    target="_blank"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <ShieldCheck className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="flex-1">Safety Guidelines</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/eligibility"
                    target="_blank"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="flex-1">Age & Eligibility</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/disclaimer"
                    target="_blank"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <AlertOctagon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="flex-1">Disclaimer</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Danger Zone - Delete Account */}
          <Card className="border-2 border-red-500/20 shadow-lg hover-lift overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-50 pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="text-xl flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all data
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full h-11 sm:h-10"
                    disabled={deleteAccountMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers, including:
                      <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                        <li>Your profile and personal information</li>
                        <li>All job applications and history</li>
                        <li>Reviews and ratings</li>
                        <li>Saved careers and preferences</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <AlertDialogCancel className="h-11 sm:h-10 w-full sm:w-auto">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAccountMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700 h-11 sm:h-10 w-full sm:w-auto"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
