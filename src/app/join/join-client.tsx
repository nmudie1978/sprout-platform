"use client";

/**
 * Joining a programme — code or invitation.
 *
 * The tone here matters more than the mechanics. A young person is about to
 * connect their personal account to an institution, so the screen names the
 * organisation, says plainly what it will and won't see, and only then offers
 * the button. No dark patterns, no pre-ticked boxes.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ORG_ROLE_LABELS } from "@/lib/organisations/permissions";
import type { OrgRole } from "@prisma/client";

interface Preview {
  organisationName: string;
  organisationType: string;
  cohortName: string | null;
  role: string;
  privacyNotice: string | null;
  dataSharingRequested: boolean;
  email?: string;
  message?: string | null;
}

interface Joined {
  organisation: { id: string; name: string; slug: string };
  role: string;
  cohortName: string | null;
}

export function JoinClient({
  initialCode,
  invitationToken,
}: {
  initialCode: string;
  invitationToken: string | null;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState<Joined | null>(null);
  const [shareProgress, setShareProgress] = useState(false);

  const mode = invitationToken ? "invitation" : "code";

  const checkInvitation = useCallback(async () => {
    if (!invitationToken) return;
    setChecking(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/join/invitation?token=${encodeURIComponent(invitationToken)}`
      );
      const data = await response.json();
      if (data.valid) setPreview(data.preview);
      else setError(data.message ?? "That invitation isn't valid.");
    } catch {
      setError("Couldn't check that invitation. Try again.");
    } finally {
      setChecking(false);
    }
  }, [invitationToken]);

  useEffect(() => {
    if (invitationToken) checkInvitation();
  }, [invitationToken, checkInvitation]);

  async function checkCode() {
    if (code.trim().length < 3) return;
    setChecking(true);
    setError(null);
    setPreview(null);
    try {
      const response = await fetch(`/api/join/access-code?code=${encodeURIComponent(code.trim())}`);
      const data = await response.json();
      if (data.valid) setPreview(data.preview);
      else setError(data.message ?? "That code isn't valid.");
    } catch {
      setError("Couldn't check that code. Try again.");
    } finally {
      setChecking(false);
    }
  }

  async function join() {
    setJoining(true);
    setError(null);
    try {
      const response =
        mode === "invitation"
          ? await fetch("/api/join/invitation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: invitationToken }),
            })
          : await fetch("/api/join/access-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: code.trim() }),
            });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Couldn't join. Try again.");
        return;
      }

      // Record the sharing choice only if they actually made one. Declining
      // is a valid, permanent answer — never a nag.
      if (shareProgress) {
        await fetch("/api/me/organisations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organisationId: data.organisation.id, consent: true }),
        }).catch(() => {});
      }

      setJoined(data);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setJoining(false);
    }
  }

  if (joined) {
    return (
      <Shell>
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 grid place-items-center">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">You&apos;re in</h1>
            <p className="text-muted-foreground mt-1">
              You&apos;ve joined {joined.organisation.name}
              {joined.cohortName ? ` · ${joined.cohortName}` : ""}.
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nothing about your Endeavrly account has changed. Your journey, saved careers and
            reflections are still yours, exactly as they were.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Back to My Journey
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">
            {mode === "invitation" ? "You've been invited" : "Join a programme"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "invitation"
              ? "Accepting adds this organisation to your existing Endeavrly account."
              : "Got a code from your school, college or advisor? Enter it here."}
          </p>
        </div>

        {mode === "code" && !preview && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Access code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && checkCode()}
                placeholder="NAV-YOUTH-2027-ABCD"
                className="font-mono"
                autoComplete="off"
              />
            </div>
            <Button
              onClick={checkCode}
              disabled={checking || code.trim().length < 3}
              className="w-full"
            >
              {checking ? "Checking…" : "Continue"}
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2">
              <p className="font-medium">{preview.organisationName}</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll join as{" "}
                {ORG_ROLE_LABELS[preview.role as OrgRole]?.toLowerCase() ?? "a participant"}
                {preview.cohortName ? ` in ${preview.cohortName}` : ""}.
              </p>
              {preview.message && (
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;{preview.message}&rdquo;
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
              <div className="flex gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>
                    Your reflections, notes and anything you write stay private. They are never
                    shared with an organisation.
                  </p>
                  {preview.privacyNotice && (
                    <p className="text-foreground">{preview.privacyNotice}</p>
                  )}
                </div>
              </div>

              {preview.dataSharingRequested && (
                <label className="flex gap-2.5 items-start cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={shareProgress}
                    onChange={(e) => setShareProgress(e.target.checked)}
                    className="mt-0.5 accent-primary"
                  />
                  <span className="text-sm">
                    Share how far I&apos;ve got with {preview.organisationName}
                    <span className="block text-xs text-muted-foreground">
                      Optional. You can change this any time, and joining works either way.
                    </span>
                  </span>
                </label>
              )}
            </div>

            <Button onClick={join} disabled={joining} className="w-full">
              {joining ? "Joining…" : `Join ${preview.organisationName}`}
            </Button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Not now
            </button>
          </div>
        )}

        {!preview && !error && mode === "code" && (
          <p className="text-xs text-muted-foreground text-center">
            Don&apos;t have a code? You don&apos;t need one —{" "}
            <Link href="/dashboard" className="underline">
              carry on with your journey
            </Link>
            .
          </p>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
