"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AgeVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgeVerificationModal({ open, onOpenChange }: AgeVerificationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");

  const verifyAgeMutation = useMutation({
    mutationFn: async (dob: string) => {
      const response = await fetch("/api/employer/verify-age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateOfBirth: dob }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to verify age");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Age verified!",
        description: "You can now post jobs on the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ["employer-profile"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!dateOfBirth) {
      setError("Please enter your date of birth");
      return;
    }

    // Calculate age
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError("You must be at least 18 years old to post jobs on Sprout.");
      return;
    }

    verifyAgeMutation.mutate(dateOfBirth);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle>Age Verification Required</DialogTitle>
            </div>
          </div>
          <DialogDescription>
            To ensure the safety of our youth workers, all job posters must verify they are 18 years or older.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                setError("");
              }}
              max={new Date().toISOString().split('T')[0]}
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your date of birth is kept private and used only for age verification.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={verifyAgeMutation.isPending || !dateOfBirth}
              className="w-full"
            >
              {verifyAgeMutation.isPending ? "Verifying..." : "Verify Age"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
