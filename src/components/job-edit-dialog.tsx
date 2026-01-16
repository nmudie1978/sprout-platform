"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, CalendarDays, MapPin, Banknote, ImageIcon, Lock, AlertCircle } from "lucide-react";
import { JobImageUpload } from "@/components/job-image-upload";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  payAmount: number;
  payType: string;
  startDate: string | null;
  endDate: string | null;
  duration: number | null;
  applicationDeadline: string | null;
  images?: string[];
  applications?: { status: string }[];
}

interface JobEditDialogProps {
  job: Job;
  trigger?: React.ReactNode;
}

// Helper to convert ISO date to datetime-local format
const toDatetimeLocal = (isoDate: string | null): string => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  // Format: YYYY-MM-DDTHH:mm
  return date.toISOString().slice(0, 16);
};

export function JobEditDialog({ job, trigger }: JobEditDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    location: job.location,
    payAmount: job.payAmount.toString(),
    startDate: toDatetimeLocal(job.startDate),
    endDate: toDatetimeLocal(job.endDate),
    duration: job.duration?.toString() || "",
    applicationDeadline: toDatetimeLocal(job.applicationDeadline),
    images: job.images || [],
  });

  // Reset form when job changes
  useEffect(() => {
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      payAmount: job.payAmount.toString(),
      startDate: toDatetimeLocal(job.startDate),
      endDate: toDatetimeLocal(job.endDate),
      duration: job.duration?.toString() || "",
      applicationDeadline: toDatetimeLocal(job.applicationDeadline),
      images: job.images || [],
    });
  }, [job]);

  const hasAcceptedApplications = job.applications?.some(
    (app) => app.status === "ACCEPTED"
  );

  const updateMutation = useMutation({
    mutationFn: async () => {
      // When job is assigned, only send description, location, and images
      // Other fields are locked
      const updatePayload = hasAcceptedApplications
        ? {
            description: formData.description,
            location: formData.location,
            images: formData.images,
          }
        : {
            title: formData.title,
            description: formData.description,
            location: formData.location,
            payAmount: parseFloat(formData.payAmount),
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            duration: formData.duration ? parseInt(formData.duration) : null,
            applicationDeadline: formData.applicationDeadline || null,
            images: formData.images,
          };

      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update job");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job updated",
        description: "Your job details have been saved.",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", job.id] });
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
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>
            {hasAcceptedApplications
              ? "A youth worker has been assigned. You can only update the description and address."
              : "Update your job details. Changes will be visible immediately."}
          </DialogDescription>
        </DialogHeader>

        {hasAcceptedApplications && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Title, dates, and payment are locked because this job has been assigned to a youth worker.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title - Locked when assigned */}
          <div>
            <Label htmlFor="title" className="flex items-center gap-1">
              Job Title
              {hasAcceptedApplications && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={hasAcceptedApplications}
              className={`mt-1 ${hasAcceptedApplications ? "opacity-60 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Description - Always editable */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Photos - Always editable */}
          <div>
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Job Photos
            </Label>
            <p className="mb-2 text-xs text-muted-foreground">
              Add up to 5 photos to help youth understand the job
            </p>
            <JobImageUpload
              jobId={job.id}
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
            />
          </div>

          {/* Dates - Locked when assigned */}
          <div className={`p-4 rounded-lg space-y-4 ${hasAcceptedApplications ? "bg-muted/50 border border-muted" : "bg-primary/5 border border-primary/20"}`}>
            <div className={`flex items-center gap-2 text-sm font-medium ${hasAcceptedApplications ? "text-muted-foreground" : "text-primary"}`}>
              <CalendarDays className="h-4 w-4" />
              Job Dates
              {hasAcceptedApplications && <Lock className="h-3 w-3" />}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start Date & Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={hasAcceptedApplications}
                  className={`mt-1 ${hasAcceptedApplications ? "opacity-60 cursor-not-allowed" : ""}`}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={hasAcceptedApplications}
                  className={`mt-1 ${hasAcceptedApplications ? "opacity-60 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="datetime-local"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                disabled={hasAcceptedApplications}
                className={`mt-1 ${hasAcceptedApplications ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          {/* Location - Always editable */}
          <div>
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Address / Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Pay & Duration - Locked when assigned */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="payAmount" className="flex items-center gap-1">
                <Banknote className="h-3 w-3" />
                Pay Amount (NOK)
                {hasAcceptedApplications && <Lock className="h-3 w-3 text-muted-foreground" />}
              </Label>
              <Input
                id="payAmount"
                type="number"
                value={formData.payAmount}
                onChange={(e) => setFormData({ ...formData, payAmount: e.target.value })}
                disabled={hasAcceptedApplications}
                className={`mt-1 ${hasAcceptedApplications ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <Label htmlFor="duration" className="flex items-center gap-1">
                Duration (minutes)
                {hasAcceptedApplications && <Lock className="h-3 w-3 text-muted-foreground" />}
              </Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                disabled={hasAcceptedApplications}
                className={`mt-1 ${hasAcceptedApplications ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
