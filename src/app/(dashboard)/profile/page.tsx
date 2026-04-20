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
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Copy, Eye, EyeOff, Shield, CheckCircle2, Clock, XCircle, Trash2, AlertTriangle, Target, Moon, MessageCircleOff, AlertCircle, User, ExternalLink, MessageSquare, Info, Sparkles, Compass, Bot } from "lucide-react";
import { DiscoveryQuizDialog } from "@/components/discovery/discovery-quiz-dialog";
import type { DiscoveryPreferences } from "@/lib/career-pathways";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar } from "@/components/avatar";
import { GoalSelectionSheet } from "@/components/goals/GoalSelectionSheet";
import { useClearGoal } from "@/hooks/use-goals";
import Link from "next/link";
import type { GoalSlot } from "@/lib/goals/types";

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

// Date of birth dropdown helpers
const currentYear = new Date().getFullYear();
// Youth platform: allow ages 13-24
const DOB_YEARS = Array.from({ length: 12 }, (_, i) => currentYear - 13 - i);
const DOB_MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getDaysInMonth(month: string, year: string): number {
  if (!month || !year) return 31;
  return new Date(parseInt(year), parseInt(month), 0).getDate();
}


export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    displayName: "",
    surname: "",
    bio: "",
    availability: "",
    phoneNumber: "",
    city: "",
    interests: [] as string[],
    guardianEmail: "",
  });
  const formInitializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // DOB dropdown state
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  // Guardian email re-send state
  const [resendingGuardianEmail, setResendingGuardianEmail] = useState(false);

  // Goal sheet state
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  const [goalSheetTargetSlot, setGoalSheetTargetSlot] = useState<GoalSlot | null>(null);
  const [showGoalChangeWarning, setShowGoalChangeWarning] = useState(false);
  const clearGoal = useClearGoal();

  // Discovery quiz dialog
  const [showDiscoveryQuiz, setShowDiscoveryQuiz] = useState(false);

  // Two-step account deletion state
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [aiChatHidden, setAiChatHidden] = useState(false);

  useEffect(() => {
    try { setAiChatHidden(localStorage.getItem("ai-chat-hidden") === "1"); } catch { /* ignore */ }
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/profile", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: !!session?.user?.id && session?.user?.role === "YOUTH",
    staleTime: 0, // Always consider stale to ensure avatar updates are visible
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: true, // Refetch when component mounts
  });

  // Reset form initialization when user changes (sign out/in)
  useEffect(() => {
    if (session?.user?.id && session.user.id !== lastUserIdRef.current) {
      formInitializedRef.current = false;
      lastUserIdRef.current = session.user.id;
    }
  }, [session?.user?.id]);

  // Guardian-consent session refresh.
  //
  // When a guardian grants consent via the email link, the youth's
  // DB record updates (guardianConsent=true) but their JWT still
  // says false until the token refreshes. Middleware then blocks
  // them from /dashboard even though consent IS granted. This
  // effect detects the stale-session case (profile says granted,
  // session says pending) and calls NextAuth's `update()` to
  // refresh the JWT — which triggers the jwt() callback with
  // trigger === "update", re-reading guardianConsent from the DB.
  // After refresh the user can freely navigate the gated routes.
  useEffect(() => {
    const sessionConsent = session?.user?.youthProfile?.guardianConsent;
    if (
      session?.user?.role === "YOUTH" &&
      profile?.guardianConsent === true &&
      sessionConsent === false
    ) {
      updateSession();
    }
  }, [profile?.guardianConsent, session?.user?.role, session?.user?.youthProfile?.guardianConsent, updateSession]);

  // Fetch primary goal from goals API
  const { data: goalsData } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.user?.id && session?.user?.role === "YOUTH",
    staleTime: 30 * 1000,
  });

  // Only initialize form data once when profile first loads
  useEffect(() => {
    if (profile && !formInitializedRef.current) {
      formInitializedRef.current = true;
      setFormData({
        displayName: profile.displayName || "",
        surname: profile.surname || "",
        bio: profile.bio || "",
        availability: profile.availability || "",
        phoneNumber: profile.phoneNumber || "",
        city: profile.city || "",
        interests: profile.interests || [],
        guardianEmail: profile.guardianEmail || "",
      });
      // Initialize DOB dropdowns from existing date
      if (profile.user?.dateOfBirth) {
        const dob = new Date(profile.user.dateOfBirth);
        setDobYear(dob.getFullYear().toString());
        setDobMonth((dob.getMonth() + 1).toString().padStart(2, "0"));
        setDobDay(dob.getDate().toString());
      }
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
      setFormData({
        displayName: data.displayName || "",
        surname: data.surname || "",
        bio: data.bio || "",
        availability: data.availability || "",
        phoneNumber: data.phoneNumber || "",
        city: data.city || "",
        interests: data.interests || [],
        guardianEmail: data.guardianEmail || "",
      });
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      // Other surfaces (dashboard greeting, roadmap header) read the
      // display name via these query keys — invalidate them so the
      // new name shows up instantly without a refresh.
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
      queryClient.invalidateQueries({ queryKey: ["profile-dob"] });
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
          ? "Job posters can view your profile link"
          : "Your profile is hidden from job posters",
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

  const updateDateOfBirthMutation = useMutation({
    mutationFn: async (dateOfBirth: string | null) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateOfBirth }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update date of birth");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Date of birth saved!",
        description: "Your date of birth has been updated.",
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
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
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
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Funky Modern Background - Warm muted tones */}
      <div className="fixed inset-0 -z-20">
        {/* Base gradient - warm terracotta to sage */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-amber-50/50 to-emerald-50/60 dark:hidden" />

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
                Set your career direction, showcase your skills, and stand out to job posters
              </p>
            </div>
          </div>
        </motion.div>

      {/* Profile Completion Status */}
      {profile && (() => {
        const missingRequired: string[] = [];
        const missingRecommended: string[] = [];

        // Required fields
        if (!profile.displayName) missingRequired.push("Display Name");
        if (!profile.user?.dateOfBirth) missingRequired.push("Date of Birth");
        if (!profile.phoneNumber) missingRequired.push("Phone Number");
        if (!profile.city) missingRequired.push("City");

        // Recommended fields
        // Note: availability was previously checked here but dropped from
        // the completion checklist — users were seeing "set availability"
        // even when it was already set due to enum vs free-text mismatch,
        // and the field is a nice-to-have rather than a gate.
        if (!profile.bio) missingRecommended.push("About Me (bio)");
        if (!goalsData?.primaryGoal) missingRecommended.push("Career Goal");

        const totalFields = 6; // 4 required + 2 recommended
        const completedFields = totalFields - missingRequired.length - missingRecommended.length;
        const percent = Math.round((completedFields / totalFields) * 100);
        const isComplete = missingRequired.length === 0 && missingRecommended.length === 0;
        const hasRequiredMissing = missingRequired.length > 0;

        const allMissing = [
          ...missingRequired.map((f) => ({ field: f, required: true })),
          ...missingRecommended.map((f) => ({ field: f, required: false })),
        ];

        return (
          <div className="mb-6 rounded-xl border border-border/50 bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                isComplete ? "bg-emerald-500" : hasRequiredMissing ? "bg-amber-500" : "bg-teal-500"
              )} />
              <p className="text-xs font-medium text-foreground/70 flex-1">
                {isComplete ? 'Profile complete' : hasRequiredMissing ? 'A few fields to complete' : 'Almost there'}
              </p>
              <span className={cn(
                "text-[11px] font-semibold tabular-nums",
                isComplete ? "text-emerald-500" : "text-muted-foreground/50"
              )}>
                {percent}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-muted/40 rounded-full overflow-hidden mb-3">
              <div
                className={cn("h-full rounded-full transition-all duration-500", isComplete ? "bg-emerald-500" : "bg-teal-500")}
                style={{ width: `${percent}%` }}
              />
            </div>
            {!isComplete && (
            <div className="flex flex-wrap gap-1.5">
              {allMissing.map(({ field, required }) => (
                <span
                  key={field}
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                    required
                      ? "bg-amber-500/10 text-amber-400/80"
                      : "bg-muted/50 text-muted-foreground/50"
                  )}
                >
                  {field}
                </span>
              ))}
            </div>
            )}
          </div>
        );
      })()}

      {/* Career Direction + Discovery Interests — side by side, top of profile */}
      {profile && (
        <div className="mb-6 relative z-10">
        <Card className="border border-primary/20 overflow-hidden relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-teal-500/5 pointer-events-none" />
          <CardContent className="relative z-10 p-5 sm:p-6">
            {/* Header with tooltip */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Career Direction</h2>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[260px] text-xs p-3">
                      <p className="font-medium mb-1">Why this matters</p>
                      <p className="text-muted-foreground">Your primary goal drives your entire My Journey experience — from research and career roadmap to action planning. You can change it anytime; your progress is saved per goal.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                size="sm"
                variant={goalsData?.primaryGoal ? "ghost" : "default"}
                className={goalsData?.primaryGoal ? "text-xs text-muted-foreground/50 hover:text-muted-foreground" : "text-xs"}
                onClick={() => {
                  if (goalsData?.primaryGoal) {
                    setShowGoalChangeWarning(true);
                  } else {
                    setGoalSheetTargetSlot("primary");
                    setShowGoalSheet(true);
                  }
                }}
              >
                <Target className="h-3.5 w-3.5 mr-1" />
                {goalsData?.primaryGoal ? "Change" : "Set a Goal"}
              </Button>
            </div>

            {/* Goals grid */}
            {goalsData?.primaryGoal ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Primary Goal */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-primary/60">Primary Goal</span>
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-primary/40 hover:text-primary/70 cursor-help transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-snug">
                            <p className="font-semibold mb-1">Your main career focus</p>
                            <p className="text-muted-foreground">
                              The Primary Goal powers everything in My Journey — your roadmap, study paths, suggested actions, voice simulation, and progress. Pick the one you most want to explore in depth.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[9px] h-4 ${
                        goalsData.primaryGoal.status === "committed"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {goalsData.primaryGoal.status === "committed" ? "Committed" : "Exploring"}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold truncate">{goalsData.primaryGoal.title}</p>
                </div>

                {/* Secondary Goal — clickable to set/change */}
                <button
                  type="button"
                  onClick={() => setShowGoalSheet(true)}
                  className={`rounded-lg border p-3 text-left w-full transition-colors hover:bg-muted/30 ${goalsData.secondaryGoal ? 'border-border/50 bg-card/50' : 'border-dashed border-border/30 bg-transparent'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Secondary Goal</span>
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground/40 hover:text-muted-foreground/70 cursor-help transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-snug">
                            <p className="font-semibold mb-1">A backup to keep on your radar</p>
                            <p className="text-muted-foreground">
                              A placeholder for a second career you&#39;re curious about. It doesn&#39;t drive your journey — only your Primary Goal does.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-[10px] text-muted-foreground/40 font-medium">
                      {goalsData.secondaryGoal ? "Change" : "Set"}
                    </span>
                  </div>
                  {goalsData.secondaryGoal ? (
                    <p className="text-sm font-medium truncate text-muted-foreground">{goalsData.secondaryGoal.title}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground/40">No backup goal set</p>
                  )}
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-emerald-500/20 p-6 flex flex-col items-center text-center">
                <Target className="h-8 w-8 text-emerald-500/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No career goal set yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Your goal powers <span className="text-emerald-500/70 font-medium">My Journey</span> — it shapes your research, roadmap, and action plan
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        </div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 relative z-10">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 relative z-10">
          {/* Profile */}
          <Card className="border shadow-sm relative z-10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-1.5">
                Your Profile
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[240px] text-[11px] p-3">
                      Your name, location, and about section help job posters understand who you are. Only what you fill in is visible.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {/* Identity block — avatar + name + prominent age tile */}
              <div className="space-y-3 pb-3 border-b border-border/30">
                {/* Top row: avatar + display name input */}
                <div className="flex items-center gap-4">
                  <Avatar name={formData.displayName || profile?.displayName} size="xl" />
                  <div className="flex-1 min-w-0">
                    {session?.user?.email && (
                      <p
                        className="text-[11px] text-muted-foreground/60 mb-1 truncate"
                        title={session.user.email}
                      >
                        {session.user.email}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          id="displayName"
                          placeholder="First name"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="h-9 text-sm"
                        />
                        <p className="mt-1 text-[10px] text-muted-foreground/40">
                          First name <span className="text-amber-500">*</span>
                        </p>
                      </div>
                      <div>
                        <Input
                          id="surname"
                          placeholder="Surname"
                          value={formData.surname}
                          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                          className="h-9 text-sm"
                        />
                        <p className="mt-1 text-[10px] text-muted-foreground/40">
                          Surname
                        </p>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Prominent Age tile — the user's age is the headline fact
                    here, not a footnote. Large number, DOB underneath. */}
                {profile?.user?.dateOfBirth ? (
                  (() => {
                    const dob = new Date(profile.user.dateOfBirth);
                    const today = new Date();
                    let age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                    const dobStr = dob.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });
                    return (
                      <div className="flex items-stretch gap-3 rounded-xl border border-border bg-muted/20 overflow-hidden">
                        <div className="flex flex-col items-center justify-center px-5 py-3 bg-amber-500/10 border-r border-border min-w-[88px]">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300/80">
                            Age
                          </span>
                          <span className="text-3xl font-bold leading-none text-foreground tabular-nums mt-0.5">
                            {age}
                          </span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">
                            years old
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col justify-center py-3 pr-3">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Born
                          </span>
                          <p className="text-sm font-medium text-foreground mt-0.5">{dobStr}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            Date of birth · set at sign-up
                          </p>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Age
                    </span>
                    <p className="text-sm text-muted-foreground/60 mt-0.5">
                      Date of birth not set
                    </p>
                  </div>
                )}
              </div>

              {/* About Me — compact textarea */}
              <div>
                <Label htmlFor="bio" className="text-xs font-medium text-muted-foreground/70">About Me</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell job posters a bit about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="mt-1 text-sm"
                />
                <p className="mt-0.5 text-[10px] text-muted-foreground/30">{formData.bio.length}/500</p>
              </div>

              {/* Phone + City side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phoneNumber" className="text-xs font-medium text-muted-foreground/70">
                    Phone <span className="text-amber-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+47 123 45 678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="h-8 mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-xs font-medium text-muted-foreground/70">
                    City <span className="text-amber-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g., Oslo"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-8 mt-1 text-sm"
                  />
                </div>
              </div>

              {/* Date of Birth + Age now live in the prominent age tile
                  inside the identity block at the top of this card. */}

              {/* Discovery Interests has moved to the top of the page,
                  next to Career Direction. */}

              {/* Guardian Email — only for 16-17 */}
              {session.user.ageBracket === "SIXTEEN_SEVENTEEN" && (
                <div>
                  <Label htmlFor="guardianEmail" className="text-xs font-medium text-muted-foreground/70">Guardian Email</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="parent@example.com"
                    value={formData.guardianEmail}
                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                    className="h-8 mt-1 text-sm"
                  />
                </div>
              )}

              {/* Guardian pending notice */}
              {session?.user.role === "YOUTH" && session.user.ageBracket === "SIXTEEN_SEVENTEEN" && profile && !profile.guardianConsent && profile.guardianEmail && (
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-500">
                      <Clock className="h-3 w-3" />
                      Guardian pending
                    </span>
                    <button
                      type="button"
                      disabled={resendingGuardianEmail}
                      onClick={async () => {
                        if (!profile.guardianEmail) return;
                        setResendingGuardianEmail(true);
                        try {
                          const res = await fetch("/api/guardian-consent", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ guardianEmail: profile.guardianEmail }),
                          });
                          if (res.ok) {
                            toast({ title: "Email sent", description: `Re-sent to ${profile.guardianEmail}.` });
                          } else if (res.status === 429) {
                            // Daily cap of 3 resends/youth on the server.
                            // Surface this distinctly so the user knows
                            // the failure is a cooldown, not a bug.
                            toast({
                              title: "Already re-sent today",
                              description: "You've re-sent this a few times today. Please wait 24 hours before trying again, or contact support.",
                              variant: "destructive",
                            });
                          } else {
                            toast({ title: "Couldn't send email", description: "Please try again.", variant: "destructive" });
                          }
                        } catch {
                          toast({ title: "Couldn't send email", description: "Please try again.", variant: "destructive" });
                        } finally {
                          setResendingGuardianEmail(false);
                        }
                      }}
                      className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
                    >
                      {resendingGuardianEmail ? "Sending\u2026" : "Resend"}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    Sent to {profile.guardianEmail}
                  </p>
                </div>
              )}

              <Button
                onClick={() => saveProfileMutation.mutate()}
                disabled={!formData.displayName || !formData.city || saveProfileMutation.isPending}
                className="w-full h-9 text-sm mt-1"
              >
                {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-6 relative z-10">
          {/* Work Availability — compact */}
          {profile && (
            <Card className="border shadow-sm relative z-10">
              <CardContent className="p-3 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Job Availability</p>
                {(["AVAILABLE", "BUSY", "NOT_LOOKING"] as const).map((status) => {
                  const isActive = profile.availabilityStatus === status;
                  const config = {
                    AVAILABLE: {
                      icon: CheckCircle2, label: "Available",
                      active: "border-green-500 bg-green-500/10",
                      hover: "border-border hover:border-green-500/50",
                      iconActive: "text-green-500",
                      dot: "bg-green-500",
                    },
                    BUSY: {
                      icon: Clock, label: "Busy",
                      active: "border-yellow-500 bg-yellow-500/10",
                      hover: "border-border hover:border-yellow-500/50",
                      iconActive: "text-yellow-500",
                      dot: "bg-yellow-500",
                    },
                    NOT_LOOKING: {
                      icon: XCircle, label: "Not Looking",
                      active: "border-red-500 bg-red-500/10",
                      hover: "border-border hover:border-red-500/50",
                      iconActive: "text-red-500",
                      dot: "bg-red-500",
                    },
                  }[status];
                  const Icon = config.icon;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateAvailabilityMutation.mutate(status)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all cursor-pointer text-xs ${
                        isActive ? config.active : config.hover
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? config.iconActive : "text-muted-foreground"}`} />
                      <span className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{config.label}</span>
                      {isActive && (
                        <div className={`ml-auto h-2 w-2 rounded-full ${config.dot} animate-pulse`} />
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}

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
                        ? "Job posters can view your profile"
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
                      Share this link with job posters:
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
                      Turn on visibility to share your profile with job posters
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

                {/* AI Assistant Toggle */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="aiAssistant" className="cursor-pointer flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        AI Career Assistant
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Show the AI assistant chat bubble on every page
                      </p>
                    </div>
                    <Switch
                      id="aiAssistant"
                      checked={!aiChatHidden}
                      onCheckedChange={(checked) => {
                        setAiChatHidden(!checked);
                        try {
                          localStorage.setItem("ai-chat-hidden", checked ? "0" : "1");
                          // Broadcast so AiChatWidget (mounted in the
                          // dashboard layout, read localStorage once on
                          // mount) re-reads the value — without this the
                          // widget stays hidden after re-enabling.
                          window.dispatchEvent(
                            new CustomEvent("endeavrly:ai-chat-visibility-changed"),
                          );
                        } catch { /* ignore */ }
                      }}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {/* Career Goal moved to top of page */}

          {/* Goal Change Warning */}
          {showGoalChangeWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowGoalChangeWarning(false)}>
              <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-2">Change your career goal?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>{goalsData?.primaryGoal?.title}</strong> will be replaced as your Primary Goal. Any progress is saved and you can switch back anytime.
                </p>
                <div className="rounded-lg bg-muted/50 border border-border/50 p-3 mb-4 space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground/80">What happens when you switch:</p>
                  <ul className="text-[11px] text-muted-foreground/60 space-y-1 ml-3">
                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">&#10003;</span> Strengths and interests carry over to any goal</li>
                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">&#10003;</span> Research, actions, and roadmap saved per goal</li>
                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">&#10003;</span> Switch back to restore all previous progress</li>
                  </ul>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" size="sm" onClick={() => setShowGoalChangeWarning(false)}>
                    Keep current goal
                  </Button>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => {
                    setShowGoalChangeWarning(false);
                    setGoalSheetTargetSlot("primary");
                    setShowGoalSheet(true);
                  }}>
                    Change goal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Discovery Quiz Dialog */}
          <DiscoveryQuizDialog
            open={showDiscoveryQuiz}
            onClose={() => setShowDiscoveryQuiz(false)}
            initialValue={(profile?.discoveryPreferences as DiscoveryPreferences) || null}
          />

          {/* Goal Selection Sheet (overlay, stays on /profile) */}
          <GoalSelectionSheet
            open={showGoalSheet}
            onClose={() => setShowGoalSheet(false)}
            targetSlot={goalSheetTargetSlot}
            primaryGoal={goalsData?.primaryGoal || null}
            secondaryGoal={goalsData?.secondaryGoal || null}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["goals"] });
              queryClient.invalidateQueries({ queryKey: ["goals"] });
              queryClient.invalidateQueries({ queryKey: ["journey-state"] });
            }}
          />

          {/* Give Feedback (Beta) */}
          <Card className="border-2 border-blue-500/20 shadow-lg hover-lift overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50 pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Help Us Improve
                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  Beta
                </Badge>
              </CardTitle>
              <CardDescription>
                Share your thoughts on how Endeavrly works for you
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Link href="/feedback?source=profile">
                <Button
                  variant="outline"
                  className="w-full h-11 sm:h-10 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Give Feedback (Beta)
                </Button>
              </Link>
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
              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                  setDeleteDialogOpen(open);
                  if (!open) {
                    // Reset state when dialog closes
                    setDeleteStep(1);
                    setDeleteConfirmText("");
                  }
                }}
              >
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
                  {deleteStep === 1 ? (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Are you sure you want to delete your account?
                        </AlertDialogTitle>
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
                        <AlertDialogCancel className="h-11 sm:h-10 w-full sm:w-auto">
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteStep(2)}
                          className="h-11 sm:h-10 w-full sm:w-auto"
                        >
                          Continue with deletion
                        </Button>
                      </AlertDialogFooter>
                    </>
                  ) : (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Final Confirmation Required
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div>
                            <p className="mb-4">
                              This is your last chance to cancel. Once deleted, your account
                              and all associated data will be permanently removed and cannot be recovered.
                            </p>
                            <div className="space-y-2">
                              <Label htmlFor="delete-confirm" className="text-foreground font-medium">
                                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                              </Label>
                              <Input
                                id="delete-confirm"
                                type="text"
                                placeholder="Type DELETE here"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="border-red-200 focus:border-red-500"
                                autoComplete="off"
                              />
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDeleteStep(1);
                            setDeleteConfirmText("");
                          }}
                          className="h-11 sm:h-10 w-full sm:w-auto"
                        >
                          Go Back
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            deleteAccountMutation.mutate();
                            setDeleteDialogOpen(false);
                          }}
                          disabled={deleteConfirmText !== "DELETE" || deleteAccountMutation.isPending}
                          className="h-11 sm:h-10 w-full sm:w-auto"
                        >
                          {deleteAccountMutation.isPending ? "Deleting..." : "Permanently Delete Account"}
                        </Button>
                      </AlertDialogFooter>
                    </>
                  )}
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
