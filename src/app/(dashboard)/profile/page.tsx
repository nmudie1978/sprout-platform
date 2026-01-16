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
import { Copy, Eye, EyeOff, Shield, CheckCircle2, Clock, XCircle, Trash2, AlertTriangle, Phone, Target, Compass } from "lucide-react";
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
import { AvatarSelector } from "@/components/avatar-selector";
import { BadgesDisplay } from "@/components/badges-display";
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
    interests: [] as string[],
    guardianEmail: "",
    careerAspiration: "",
  });
  const formInitializedRef = useRef(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
  });

  // Only initialize form data once when profile first loads
  useEffect(() => {
    if (profile && !formInitializedRef.current) {
      formInitializedRef.current = true;
      setFormData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        availability: profile.availability || "",
        phoneNumber: profile.phoneNumber || "",
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
    <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10 isolate">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          My <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Build your profile to stand out to employers
        </p>
      </div>

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
              <div className="flex flex-col items-center gap-3 pb-4 border-b relative z-10">
                <Label className="text-center">Your Avatar</Label>
                <AvatarSelector
                  currentAvatarId={profile?.avatarId}
                  onSelect={(avatarId) => updateAvatarMutation.mutate(avatarId)}
                  disabled={updateAvatarMutation.isPending}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Click to choose from 30+ fun avatars
                </p>
              </div>

              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  placeholder="Your name or nickname"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="bio">About Me</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell employers a bit about yourself..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Weekends, After 4pm on weekdays"
                  value={formData.availability}
                  onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+47 123 45 678"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Employers will see this when you're assigned to their job
                </p>
              </div>

              <div>
                <Label>Interests</Label>
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
              </div>

              {session.user.ageBracket === "SIXTEEN_SEVENTEEN" && (
                <div>
                  <Label htmlFor="guardianEmail">
                    Guardian Email (Optional)
                  </Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    placeholder="parent@example.com"
                    value={formData.guardianEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, guardianEmail: e.target.value })
                    }
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    We'll keep them informed about your activity
                  </p>
                </div>
              )}

              <Button
                onClick={() => saveProfileMutation.mutate()}
                disabled={
                  !formData.displayName || saveProfileMutation.isPending
                }
                className="w-full shadow-lg"
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

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                    <div className="text-3xl font-bold gradient-text">
                      {profile.completedJobsCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Jobs Completed
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                    <div className="text-3xl font-bold gradient-text">
                      {profile.averageRating
                        ? profile.averageRating.toFixed(1)
                        : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Avg Rating
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                    <div className="text-3xl font-bold gradient-text">
                      {profile.reliabilityScore || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Reliability
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
              </CardContent>
            </Card>
          )}

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
                    className="w-full"
                    disabled={deleteAccountMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
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
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAccountMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
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
  );
}
