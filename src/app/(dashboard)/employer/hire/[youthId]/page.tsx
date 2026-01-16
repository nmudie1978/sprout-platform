"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  Star,
  Briefcase,
  Loader2,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const categoryOptions = [
  { value: "BABYSITTING", label: "Babysitting", emoji: "👶" },
  { value: "DOG_WALKING", label: "Dog Walking", emoji: "🐕" },
  { value: "SNOW_CLEARING", label: "Snow Clearing", emoji: "❄️" },
  { value: "CLEANING", label: "Cleaning", emoji: "🧹" },
  { value: "DIY_HELP", label: "DIY Help", emoji: "🔧" },
  { value: "TECH_HELP", label: "Tech Help", emoji: "💻" },
  { value: "ERRANDS", label: "Errands", emoji: "🏃" },
  { value: "OTHER", label: "Other", emoji: "✨" },
];

const avatarOptions: Record<string, string> = {
  avatar1: "😊",
  avatar2: "😎",
  avatar3: "🤓",
  avatar4: "😄",
  avatar5: "🙂",
  avatar6: "🌟",
  avatar7: "💪",
  avatar8: "🎯",
};

export default function QuickHirePage({
  params,
}: {
  params: Promise<{ youthId: string }>;
}) {
  const { youthId } = use(params);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: "",
    payAmount: "",
    payType: "FIXED",
  });

  // Fetch worker info
  const { data: worker, isLoading: loadingWorker } = useQuery({
    queryKey: ["worker", youthId],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${youthId}`);
      if (!response.ok) throw new Error("Failed to fetch worker");
      return response.json();
    },
  });

  const hireMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/employer/rehire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youthId,
          ...formData,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create job");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Job created and assigned!");
      router.push(`/jobs/${data.jobId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.payAmount) {
      toast.error("Please fill in all required fields");
      return;
    }
    hireMutation.mutate();
  };

  if (loadingWorker) {
    return (
      <div className="container max-w-2xl py-6">
        <Card>
          <CardContent className="py-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = worker?.youthProfile;

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employer/rehire">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Quick Hire</h1>
          <p className="text-muted-foreground">
            Create a job and directly assign it
          </p>
        </div>
      </div>

      {/* Worker Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            {profile?.avatarId ? (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-3xl">
                {avatarOptions[profile.avatarId] || "😊"}
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <User className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {profile?.displayName || "Worker"}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {profile?.averageRating && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    {profile.averageRating.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {profile?.completedJobsCount || 0} jobs
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Dog Walking this Saturday"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the job..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Downtown"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time
                </Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledTime: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 2 hours"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payAmount">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Pay Amount *
                </Label>
                <Input
                  id="payAmount"
                  type="number"
                  step="0.01"
                  value={formData.payAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, payAmount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payType">Pay Type</Label>
                <Select
                  value={formData.payType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, payType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed</SelectItem>
                    <SelectItem value="HOURLY">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={hireMutation.isPending}
            >
              {hireMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create & Assign Job</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
