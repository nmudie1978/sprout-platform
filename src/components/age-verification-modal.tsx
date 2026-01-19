"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { Shield, AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgeVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate arrays for date dropdowns
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i - 18).filter(y => y >= 1920);
const months = [
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

export function AgeVerificationModal({ open, onOpenChange }: AgeVerificationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  // Computed date of birth string
  const dateOfBirth = day && month && year ? `${year}-${month}-${day.padStart(2, '0')}` : "";

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setDay("");
      setMonth("");
      setYear("");
      setError("");
    }
  }, [open]);

  // Get available days based on selected month/year
  const daysInMonth = getDaysInMonth(month, year);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

    if (!day || !month || !year) {
      setError("Please select your complete date of birth");
      return;
    }

    // Validate the date is real (e.g., not Feb 30)
    const selectedDay = parseInt(day);
    if (selectedDay > daysInMonth) {
      setError("Please select a valid day for the selected month");
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
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date of Birth *
            </Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {/* Day */}
              <Select value={day} onValueChange={(value) => { setDay(value); setError(""); }}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {days.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Month */}
              <Select value={month} onValueChange={(value) => { setMonth(value); setError(""); }}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year */}
              <Select value={year} onValueChange={(value) => { setYear(value); setError(""); }}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
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
              disabled={verifyAgeMutation.isPending || !day || !month || !year}
              className="w-full h-11"
            >
              {verifyAgeMutation.isPending ? "Verifying..." : "Verify Age"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
