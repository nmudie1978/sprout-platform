"use client";

/**
 * CreateCohortButton.
 *
 * Opens a tiny modal to capture cohort name + optional career focus,
 * POSTs to /api/cohorts, and on success forwards the teacher to the
 * fresh cohort detail page where the join code is displayed.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";

export function CreateCohortButton({
  variant = "outline",
}: {
  variant?: "primary" | "outline";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [careerFocus, setCareerFocus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Class needs a name.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          careerFocus: careerFocus.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to create class");
        return;
      }
      toast.success(`Class created — code ${data.cohort.code}`);
      setOpen(false);
      setName("");
      setCareerFocus("");
      startTransition(() => router.push(`/teacher/cohorts/${data.cohort.id}`));
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant === "primary" ? "default" : "outline"}
        className={variant === "primary" ? "" : "border-primary/40 text-primary hover:bg-primary/10"}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        New class
      </Button>

      <Dialog open={open} onOpenChange={(v) => !submitting && setOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a class</DialogTitle>
            <DialogDescription>
              You&rsquo;ll get a short code to share with your students.
              They type it in to join.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cohort-name" className="text-xs uppercase tracking-wider text-muted-foreground">
                Class name
              </Label>
              <Input
                id="cohort-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 10A Careers, Psychology studygroup"
                maxLength={120}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cohort-focus" className="text-xs uppercase tracking-wider text-muted-foreground">
                Career focus <span className="text-muted-foreground/40 normal-case tracking-normal">(optional)</span>
              </Label>
              <Input
                id="cohort-focus"
                value={careerFocus}
                onChange={(e) => setCareerFocus(e.target.value)}
                placeholder="e.g. Healthcare, Engineering, Psychology"
                maxLength={80}
              />
              <p className="text-[11px] text-muted-foreground">
                Just a note for you &mdash; students can still explore any career.
              </p>
            </div>

            <DialogFooter className="sm:justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || pending}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Create class
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
