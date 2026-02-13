"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle, Building2, Mail, Upload, User, Shield, FileText, Phone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "next-auth/react";
import { AgeVerificationModal } from "@/components/age-verification-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useState, useEffect } from "react";

export default function EmployerSettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showAgeVerification, setShowAgeVerification] = useState(false);

  // Two-step account deletion state
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["employer-profile"],
    queryFn: async () => {
      const response = await fetch("/api/employer/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName || "");
      setBio(profile.bio || "");
      setWebsite(profile.website || "");
      setPhoneNumber(profile.phoneNumber || "");
      setProfilePicture(profile.companyLogo || null);
    }
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "File must be an image",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/employer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          bio,
          website,
          phoneNumber,
          companyLogo: profilePicture,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your company information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["employer-profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
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

  if (session?.user.role !== "EMPLOYER") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Access denied. Employers only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <AgeVerificationModal
        open={showAgeVerification}
        onOpenChange={setShowAgeVerification}
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Account <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your employer account and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information - Read-only summary */}
        <Card className="border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-foreground/90">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account Type</span>
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                Job Poster
              </span>
            </div>
            <div className="h-px bg-border/30" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Age and guardian verification does not apply to job posters. You are required to verify you are 18+ before posting jobs.
            </p>
          </CardContent>
        </Card>

        {/* Age Verification Status */}
        {!profile?.ageVerified && (
          <Card className="border-2 border-yellow-500/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Shield className="h-5 w-5" />
                Age Verification Required
              </CardTitle>
              <CardDescription>
                You must verify your age (18+) before posting jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowAgeVerification(true)}
                className="w-full"
              >
                Verify Age Now
              </Button>
            </CardContent>
          </Card>
        )}
        {/* Company Information */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Company Information
            </CardTitle>
            <CardDescription>
              Update your company details visible to job applicants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture Upload */}
            <div>
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4 mt-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profilePicture || undefined} />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="picture">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("picture")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Picture
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="bio">About Your Company</Label>
              <Textarea
                id="bio"
                placeholder="Tell youth workers about your company, what you do, and what kind of jobs you typically offer..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be shown on job listings and your profile
              </p>
            </div>

            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourcompany.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
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
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Youth workers will see this when you assign them a job
              </p>
            </div>

            <Button
              onClick={() => updateProfileMutation.mutate()}
              disabled={!companyName || updateProfileMutation.isPending}
              className="w-full"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={session.user.email || ""} disabled />
              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Delete Account */}
        <Card className="border-2 border-red-500/20 shadow-lg overflow-hidden relative">
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
                  className="w-full"
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
                        employer account and remove all your data from our servers, including:
                        <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                          <li>Your company profile and information</li>
                          <li>All job postings and applications</li>
                          <li>Reviews and ratings</li>
                          <li>Messages</li>
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
  );
}
