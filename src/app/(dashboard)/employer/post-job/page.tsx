"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { JobCategory, PayType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { AgeVerificationModal } from "@/components/age-verification-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ImageIcon,
  CheckCircle2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Sparkles,
  Rocket,
  Zap,
  Star,
} from "lucide-react";
import { JobImageUpload } from "@/components/job-image-upload";

const categoryLabels: Record<JobCategory, string> = {
  BABYSITTING: "Babysitting",
  DOG_WALKING: "Dog Walking",
  SNOW_CLEARING: "Snow Clearing",
  CLEANING: "Cleaning",
  DIY_HELP: "DIY Help",
  TECH_HELP: "Tech Help",
  ERRANDS: "Errands",
  OTHER: "Other",
};

const categoryEmojis: Record<JobCategory, string> = {
  BABYSITTING: "👶",
  DOG_WALKING: "🐕",
  SNOW_CLEARING: "❄️",
  CLEANING: "🧹",
  DIY_HELP: "🔧",
  TECH_HELP: "💻",
  ERRANDS: "🏃",
  OTHER: "✨",
};

const traitOptions = [
  { label: "reliable", emoji: "💪" },
  { label: "friendly", emoji: "😊" },
  { label: "patient", emoji: "🧘" },
  { label: "tech-savvy", emoji: "🤖" },
  { label: "problem solver", emoji: "🧩" },
  { label: "good with kids", emoji: "👶" },
  { label: "loves animals", emoji: "🐾" },
  { label: "physically fit", emoji: "🏃" },
];

// Floating background shapes
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-20 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Small floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

// Progress indicator component
function ProgressIndicator({ progress }: { progress: number }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Form Progress</span>
        <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 mt-2 text-green-600 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Ready to post!
        </motion.div>
      )}
    </div>
  );
}

// Section header component
function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 mb-4 pb-3 border-b border-gradient-to-r from-purple-500/20 to-transparent">
      <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
        <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Helper component for required field label
function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-medium">
      {children}
      <span className="text-pink-500 font-bold">*</span>
    </Label>
  );
}

// Helper component for optional field label
function OptionalLabel({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <Label htmlFor={htmlFor} className={className}>
      {children}
      <span className="text-muted-foreground text-xs font-normal ml-1">(optional)</span>
    </Label>
  );
}

export default function PostJobPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const { data: employerProfile } = useQuery({
    queryKey: ["employer-profile"],
    queryFn: async () => {
      const response = await fetch("/api/employer/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!session?.user?.id && session.user.role === "EMPLOYER",
  });

  const [formData, setFormData] = useState({
    title: "",
    category: "BABYSITTING" as JobCategory,
    description: "",
    payType: "FIXED" as PayType,
    payAmount: "",
    location: "",
    startDate: "",
    endDate: "",
    duration: "",
    applicationDeadline: "",
    requiredTraits: [] as string[],
    images: [] as string[],
  });

  // Validation errors
  const errors = {
    title: formData.title.length > 0 && formData.title.length < 5 ? "Title must be at least 5 characters" : formData.title.length === 0 ? "Title is required" : "",
    description: formData.description.length > 0 && formData.description.length < 20 ? "Description must be at least 20 characters" : formData.description.length === 0 ? "Description is required" : "",
    location: formData.location.length === 0 ? "Location is required" : "",
    payAmount: formData.payAmount === "" ? "Pay amount is required" : "",
    startDate: formData.startDate === "" ? "Start date is required" : "",
    endDate: formData.endDate === "" ? "End date is required" : "",
    applicationDeadline: formData.applicationDeadline === "" ? "Application deadline is required" : "",
  };

  const hasErrors = Object.values(errors).some(error => error !== "");

  // Calculate form progress
  const progress = useMemo(() => {
    const fields = [
      formData.title.length >= 5,
      formData.description.length >= 20,
      formData.location.length > 0,
      formData.payAmount !== "",
      formData.startDate !== "",
      formData.endDate !== "",
      formData.applicationDeadline !== "",
    ];
    return (fields.filter(Boolean).length / fields.length) * 100;
  }, [formData]);

  const postJobMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          payAmount: parseFloat(formData.payAmount),
          duration: formData.duration ? parseInt(formData.duration) : null,
          startDate: formData.startDate,
          endDate: formData.endDate,
          applicationDeadline: formData.applicationDeadline,
          images: formData.images,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to post job");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job posted successfully!",
        description: "Youth can now apply to your job posting.",
      });
      router.push("/employer/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (hasErrors) {
      toast({
        title: "Please fill in all required fields",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    if (!employerProfile?.ageVerified) {
      setShowAgeVerification(true);
      return;
    }

    postJobMutation.mutate();
  };

  const toggleTrait = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredTraits: prev.requiredTraits.includes(trait)
        ? prev.requiredTraits.filter((t) => t !== trait)
        : [...prev.requiredTraits, trait],
    }));
  };

  if (session?.user.role !== "EMPLOYER") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Only employers can post jobs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <FloatingShapes />

      <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10">
        <AgeVerificationModal
          open={showAgeVerification}
          onOpenChange={setShowAgeVerification}
        />

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4">
            <Rocket className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Create Your Opportunity</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
              Post a Micro-Job
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Connect with talented youth ready to help with your short-term tasks
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="p-4 rounded-2xl bg-background/60 backdrop-blur-xl border border-purple-500/20 shadow-lg shadow-purple-500/5">
            <ProgressIndicator progress={progress} />
          </div>
        </motion.div>

        {/* Age Verification Alert */}
        {!employerProfile?.ageVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-600">
                Age verification required before posting jobs.{" "}
                <button
                  type="button"
                  onClick={() => setShowAgeVerification(true)}
                  className="underline font-medium hover:text-yellow-700"
                >
                  Verify now
                </button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Validation Summary Alert */}
        <AnimatePresence>
          {attemptedSubmit && hasErrors && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert className="mb-6 border-red-500/50 bg-red-500/10 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">
                  <span className="font-medium">Please fill in all required fields:</span>
                  <ul className="mt-1 list-disc list-inside text-sm">
                    {errors.title && <li>Job Title - {errors.title}</li>}
                    {errors.description && <li>Description - {errors.description}</li>}
                    {errors.location && <li>Location - {errors.location}</li>}
                    {errors.payAmount && <li>Pay Amount - {errors.payAmount}</li>}
                    {errors.startDate && <li>Start Date - {errors.startDate}</li>}
                    {errors.endDate && <li>End Date - {errors.endDate}</li>}
                    {errors.applicationDeadline && <li>Application Deadline - {errors.applicationDeadline}</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Form Card with Neon Border */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            {/* Neon glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl opacity-30 group-hover:opacity-50 blur-sm transition-opacity duration-500" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl opacity-20 animate-pulse" />

            <Card className="relative rounded-3xl border-0 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Decorative top bar */}
              <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

              <CardContent className="p-6 md:p-8 space-y-8">
                {/* Job Basics Section */}
                <div>
                  <SectionHeader
                    icon={Briefcase}
                    title="Job Basics"
                    description="Tell us about the opportunity"
                  />

                  <div className="space-y-4">
                    <div>
                      <RequiredLabel htmlFor="title">Job Title</RequiredLabel>
                      <Input
                        id="title"
                        placeholder="e.g., Dog Walking - Friendly Golden Retriever 🐕"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`mt-1.5 h-12 rounded-xl border-2 transition-all duration-200 ${
                          attemptedSubmit && errors.title
                            ? "border-red-500 focus-visible:ring-red-500"
                            : formData.title.length >= 5
                            ? "border-green-500/50 focus-visible:ring-green-500"
                            : "border-muted hover:border-purple-500/50 focus-visible:ring-purple-500"
                        }`}
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className={`text-xs ${formData.title.length >= 5 ? "text-green-600" : attemptedSubmit && errors.title ? "text-red-500" : "text-muted-foreground"}`}>
                          {formData.title.length >= 5 ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Looking good!</span>
                          ) : (
                            `${formData.title.length}/5 characters minimum`
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <RequiredLabel htmlFor="category">Category</RequiredLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <motion.button
                            key={value}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, category: value as JobCategory })}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                              formData.category === value
                                ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                                : "border-muted hover:border-purple-500/50"
                            }`}
                          >
                            <span className="text-xl mb-1 block">{categoryEmojis[value as JobCategory]}</span>
                            <span className="text-sm font-medium">{label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <RequiredLabel htmlFor="description">Description</RequiredLabel>
                      <Textarea
                        id="description"
                        placeholder="Describe the job, what's involved, and any special requirements... Be specific to attract the right candidates!"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={5}
                        className={`mt-1.5 rounded-xl border-2 transition-all duration-200 ${
                          attemptedSubmit && errors.description
                            ? "border-red-500 focus-visible:ring-red-500"
                            : formData.description.length >= 20
                            ? "border-green-500/50 focus-visible:ring-green-500"
                            : "border-muted hover:border-purple-500/50 focus-visible:ring-purple-500"
                        }`}
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className={`text-xs ${formData.description.length >= 20 ? "text-green-600" : attemptedSubmit && errors.description ? "text-red-500" : "text-muted-foreground"}`}>
                          {formData.description.length >= 20 ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Great description!</span>
                          ) : (
                            `${formData.description.length}/20 characters minimum`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photos Section */}
                <div>
                  <SectionHeader
                    icon={ImageIcon}
                    title="Photos"
                    description="Show what the job looks like (optional)"
                  />
                  <JobImageUpload
                    images={formData.images}
                    onChange={(images) => setFormData({ ...formData, images })}
                  />
                </div>

                {/* Location Section */}
                <div>
                  <SectionHeader
                    icon={MapPin}
                    title="Location"
                    description="Where will the job take place?"
                  />
                  <div>
                    <RequiredLabel htmlFor="location">Address or Area</RequiredLabel>
                    <Input
                      id="location"
                      placeholder="e.g., Oslo, Majorstuen 📍"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`mt-1.5 h-12 rounded-xl border-2 transition-all duration-200 ${
                        attemptedSubmit && errors.location
                          ? "border-red-500 focus-visible:ring-red-500"
                          : formData.location.length > 0
                          ? "border-green-500/50"
                          : "border-muted hover:border-purple-500/50"
                      }`}
                    />
                  </div>
                </div>

                {/* Payment Section */}
                <div>
                  <SectionHeader
                    icon={DollarSign}
                    title="Payment"
                    description="Set fair compensation for the work"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <RequiredLabel htmlFor="payType">Payment Type</RequiredLabel>
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        {[
                          { value: "FIXED", label: "Fixed Price", icon: "💰" },
                          { value: "HOURLY", label: "Hourly Rate", icon: "⏰" },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, payType: option.value as PayType })}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                              formData.payType === option.value
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-muted hover:border-purple-500/50"
                            }`}
                          >
                            <span className="text-lg">{option.icon}</span>
                            <span className="text-sm font-medium ml-2">{option.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <RequiredLabel htmlFor="payAmount">
                        Amount (NOK) {formData.payType === "HOURLY" && "per hour"}
                      </RequiredLabel>
                      <div className="relative mt-1.5">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">kr</span>
                        <Input
                          id="payAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="150"
                          value={formData.payAmount}
                          onChange={(e) => setFormData({ ...formData, payAmount: e.target.value })}
                          className={`h-12 pl-10 rounded-xl border-2 transition-all duration-200 ${
                            attemptedSubmit && errors.payAmount
                              ? "border-red-500 focus-visible:ring-red-500"
                              : formData.payAmount
                              ? "border-green-500/50"
                              : "border-muted hover:border-purple-500/50"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div>
                  <SectionHeader
                    icon={Calendar}
                    title="Schedule"
                    description="When does the job need to be done?"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <RequiredLabel htmlFor="startDate">Start Date & Time</RequiredLabel>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={`mt-1.5 h-12 rounded-xl border-2 transition-all duration-200 ${
                          attemptedSubmit && errors.startDate
                            ? "border-red-500 focus-visible:ring-red-500"
                            : formData.startDate
                            ? "border-green-500/50"
                            : "border-muted hover:border-purple-500/50"
                        }`}
                      />
                    </div>

                    <div>
                      <RequiredLabel htmlFor="endDate">End Date & Time</RequiredLabel>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={`mt-1.5 h-12 rounded-xl border-2 transition-all duration-200 ${
                          attemptedSubmit && errors.endDate
                            ? "border-red-500 focus-visible:ring-red-500"
                            : formData.endDate
                            ? "border-green-500/50"
                            : "border-muted hover:border-purple-500/50"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div>
                      <OptionalLabel htmlFor="duration" className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Duration (minutes)
                      </OptionalLabel>
                      <Input
                        id="duration"
                        type="number"
                        min="0"
                        placeholder="30"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="mt-1.5 h-12 rounded-xl border-2 border-muted hover:border-purple-500/50 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <RequiredLabel htmlFor="applicationDeadline">Application Deadline</RequiredLabel>
                      <Input
                        id="applicationDeadline"
                        type="datetime-local"
                        value={formData.applicationDeadline}
                        onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                        className={`mt-1.5 h-12 rounded-xl border-2 transition-all duration-200 ${
                          attemptedSubmit && errors.applicationDeadline
                            ? "border-red-500 focus-visible:ring-red-500"
                            : formData.applicationDeadline
                            ? "border-green-500/50"
                            : "border-muted hover:border-purple-500/50"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Traits Section */}
                <div>
                  <SectionHeader
                    icon={Users}
                    title="Desired Traits"
                    description="What qualities are you looking for? (optional)"
                  />
                  <div className="flex flex-wrap gap-2">
                    {traitOptions.map((trait) => (
                      <motion.button
                        key={trait.label}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTrait(trait.label)}
                        className={`px-4 py-2 rounded-full border-2 transition-all duration-200 flex items-center gap-2 ${
                          formData.requiredTraits.includes(trait.label)
                            ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                            : "border-muted hover:border-purple-500/50"
                        }`}
                      >
                        <span>{trait.emoji}</span>
                        <span className="text-sm font-medium">{trait.label}</span>
                        {formData.requiredTraits.includes(trait.label) && (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <Button
              type="submit"
              size="lg"
              disabled={postJobMutation.isPending}
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30"
            >
              {postJobMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  Posting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Post Job
                  <Star className="w-4 h-4" />
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="h-14 px-8 rounded-2xl border-2"
            >
              Cancel
            </Button>
          </motion.div>
        </form>

        {/* Bottom decoration */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          <span className="inline-flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Your job will be visible to youth looking for opportunities
            <Sparkles className="w-4 h-4" />
          </span>
        </motion.p>
      </div>
    </div>
  );
}
