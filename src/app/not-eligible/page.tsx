"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, ArrowLeft, Clock, Heart } from "lucide-react";

/**
 * Not Eligible Page
 *
 * Shown to users who are under 16 years old.
 * This is part of the CORE SAFETY INVARIANT - platform is for ages 16-20.
 */
export default function NotEligiblePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-amber-500/5" />

      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Sprout className="h-10 w-10 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            Thanks for Your Interest!
          </CardTitle>
          <CardDescription className="text-base">
            Sprout is designed for young people aged 16-20
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              We appreciate your interest in Sprout! Our platform is specifically designed
              for young people between 16 and 20 years old to find safe, age-appropriate
              work opportunities.
            </p>

            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <Clock className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Come back when you turn 16!
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-muted/50">
                <Heart className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Why the age limit?</p>
                  <p className="text-xs text-muted-foreground">
                    We work closely with labor regulations to ensure all opportunities
                    on our platform are safe and legal for young workers. The minimum
                    working age for most jobs is 16 in Norway.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:hello@sprout.no" className="text-primary hover:underline">
              hello@sprout.no
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
