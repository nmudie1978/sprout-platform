"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
import { CheckCircle2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ConfirmPaymentButtonProps {
  jobId: string;
  jobTitle: string;
  amount: number;
  youthName?: string;
}

export function ConfirmPaymentButton({
  jobId,
  jobTitle,
  amount,
  youthName,
}: ConfirmPaymentButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Check current payment status
  const { data: paymentStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["payment-status", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/confirm-payment`);
      if (!response.ok) throw new Error("Failed to check payment status");
      return response.json();
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/confirm-payment`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to confirm payment");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Work Completed",
        description: `You've confirmed work completed for "${jobTitle}". Remember to arrange payment directly with the worker.`,
      });
      queryClient.invalidateQueries({ queryKey: ["payment-status", jobId] });
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // If already confirmed, show confirmed badge
  if (paymentStatus?.earning?.status === "CONFIRMED") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>Work Completed</span>
      </div>
    );
  }

  // If still loading, show loading state
  if (statusLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-green-500/50 text-green-600 hover:bg-green-500/10 hover:text-green-700"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark Complete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Confirm Work Completed
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Please confirm that{" "}
              {youthName ? <strong>{youthName}</strong> : "the youth worker"} has
              completed this job.
            </p>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-sm text-muted-foreground">Job</div>
              <div className="font-medium">{jobTitle}</div>
              <div className="mt-2 text-sm text-muted-foreground">Agreed amount</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(amount)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The worker will be notified that you&apos;ve confirmed the job is complete.
              Remember to arrange payment directly with them.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => confirmPaymentMutation.mutate()}
            disabled={confirmPaymentMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {confirmPaymentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Complete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
