"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RefreshCcw, Loader2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface RepostJobButtonProps {
  jobId: string;
  jobTitle: string;
}

export function RepostJobButton({ jobId, jobTitle }: RepostJobButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const router = useRouter();

  const repostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: scheduledDate || null,
          scheduledTime: scheduledTime || null,
          modifyTitle: false,
        }),
      });
      if (!response.ok) throw new Error("Failed to repost job");
      return response.json();
    },
    onSuccess: (data) => {
      setIsOpen(false);
      toast.success("Job reposted successfully!");
      router.push(`/jobs/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to repost job");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Repost
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Repost Job</DialogTitle>
          <DialogDescription>
            Create a new job posting based on &quot;{jobTitle}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            This will create a new job with the same details. You can optionally
            set a new scheduled date and time.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repost-date">
                <Calendar className="h-4 w-4 inline mr-1" />
                New Date (optional)
              </Label>
              <Input
                id="repost-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repost-time">
                <Clock className="h-4 w-4 inline mr-1" />
                New Time (optional)
              </Label>
              <Input
                id="repost-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => repostMutation.mutate()}
              disabled={repostMutation.isPending}
              className="flex-1"
            >
              {repostMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Repost Job
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={repostMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
