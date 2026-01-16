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
                    employer account and remove all your data from our servers, including:
                    <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                      <li>Your company profile and information</li>
                      <li>All job postings and applications</li>
                      <li>Reviews and ratings</li>
                      <li>Pokes and messages</li>
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
  );
}
